// src/pages/CartPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCart, deleteMyCartItem, updateMyCartItem } from "../api/carts";
import { createOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";
import AddressSearch from "../components/AddressSearch";
import {
  fetchMyShippingAddresses,
  fetchMyDefaultShippingAddress,
  createMyShippingAddress,
  updateMyShippingAddress,
  deleteMyShippingAddress,
  setDefaultMyShippingAddress,
} from "../api/shippingAddresses";
import "./CartPage.css";
import { loadAuth } from "../utils/authStorage";
import { useCart } from "../contexts/CartContext";

const fmt = (n) => (n ?? 0).toLocaleString();

// ✅ 백엔드 JSON이 isDefault 또는 default로 내려오는 경우 모두 대응
const isDefaultAddr = (a) => Boolean(a?.isDefault ?? a?.default);

function Modal({ open, title, onClose, children, footer, bodyScroll = true }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="modalClose" onClick={onClose} aria-label="닫기" title="닫기">
            ×
          </button>
        </div>

        <div className={`modalBody ${bodyScroll ? "modalBodyScroll" : "modalBodyNoScroll"}`}>
          {children}
        </div>

        {footer && <div className="modalFooter">{footer}</div>}
      </div>
    </div>
  );
}

export default function CartPage() {
  const nav = useNavigate();
  const { refreshCount } = useCart();

  // =========================
  // Cart
  // =========================
  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  // =========================
  // UI common
  // =========================
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // =========================
  // Shipping addresses
  // =========================
  const [addresses, setAddresses] = useState([]);
  const [currentAddrId, setCurrentAddrId] = useState(null); // ✅ 우측 카드에 반영되는 “확정 선택”
  const [pickedAddrId, setPickedAddrId] = useState(null); // ✅ 모달에서 라디오로 고르는 “임시 선택”
  const [addrLoading, setAddrLoading] = useState(true);

  // modals
  const [addrManageOpen, setAddrManageOpen] = useState(false);
  const [addrEditOpen, setAddrEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // delete target
  const [deleteTarget, setDeleteTarget] = useState(null);

  // right ship card pulse
  const [shipFlash, setShipFlash] = useState(false);
  const shipFlashTimer = useRef(null);

  // edit draft
  const [editTargetId, setEditTargetId] = useState(null); // null = add
  const [addrDraft, setAddrDraft] = useState({
    label: "새 배송지",
    receiverName: "",
    receiverPhone: "",
    zipCode: "",
    address1: "",
    address2: "",
    isDefault: true,
  });

  const buildBuyerState = () => {
      const auth = loadAuth() || {};
      return {
        buyerName: String(auth.userName || ""),
        buyerEmail: String(auth.email || ""),
        buyerTel: String(auth.phone || auth.userPhone || auth.tel || ""),
      };
    };

  // computed
  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selected.size === items.length;
  const canOrder = selected.size > 0 && !busy;

  const currentAddress = useMemo(() => {
    if (!addresses.length) return null;
    const found = addresses.find((a) => a.shippingAddressId === currentAddrId);
    return found || addresses.find((a) => isDefaultAddr(a)) || addresses[0];
  }, [addresses, currentAddrId]);

  const pulseShippingCard = () => {
    if (shipFlashTimer.current) clearTimeout(shipFlashTimer.current);
    setShipFlash(false);
    requestAnimationFrame(() => {
      setShipFlash(true);
      shipFlashTimer.current = setTimeout(() => setShipFlash(false), 650);
    });
  };

  // =========================
  // Load cart
  // =========================
  const loadCart = async () => {
    setErr("");
    setLoading(true);
    try {
      const c = await fetchMyCart();
      setCart(c);
      setSelected(new Set((c?.items ?? []).map((it) => it.itemId)));
      await refreshCount();
    } catch (e) {
      setErr(toErrorMessage(e));
      setCart(null);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // =========================
  // Load addresses
  // =========================
  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);

      const def = await fetchMyDefaultShippingAddress().catch(() => null);
      const nextId = def?.shippingAddressId ?? list?.[0]?.shippingAddressId ?? null;
      setCurrentAddrId(nextId);
    } catch {
      setAddresses([]);
      setCurrentAddrId(null);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    return () => shipFlashTimer.current && clearTimeout(shipFlashTimer.current);
  }, []);

  // =========================
  // Cart selection
  // =========================
  const toggleAll = () => {
    if (!items.length) return;
    setSelected(allSelected ? new Set() : new Set(items.map((it) => it.itemId)));
  };

  const toggleOne = (itemId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  // =========================
  // Cart actions
  // =========================
  const changeQty = async (itemId, nextQty) => {
    if (nextQty < 1) return;
    setBusy(true);
    setErr("");
    try {
      const updated = await updateMyCartItem(itemId, nextQty);
      setCart(updated);

      // 업데이트 후 선택 유지(존재하는 것만)
      const updatedIds = new Set((updated?.items ?? []).map((it) => it.itemId));
      setSelected((prev) => new Set([...prev].filter((id) => updatedIds.has(id))));
      await refreshCount();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const removeOne = async (itemId) => {
    setBusy(true);
    setErr("");
    try {
      await deleteMyCartItem(itemId);
      await loadCart();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const removeSelected = async () => {
    if (!items.length || selected.size === 0) return;
    setBusy(true);
    setErr("");
    try {
      for (const id of selected) await deleteMyCartItem(id);
      await loadCart();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    if (!items.length) return;
    setBusy(true);
    setErr("");
    try {
      for (const it of items) await deleteMyCartItem(it.itemId);
      await loadCart();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // =========================
  // Calc (selected items only)
  // =========================
  const calc = useMemo(() => {
    const selectedItems = items.filter((it) => selected.has(it.itemId));
    const productAmount = selectedItems.reduce((sum, it) => {
      const line = it.lineTotal ?? it.price * it.quantity;
      return sum + (line ?? 0);
    }, 0);

    const itemDiscount = 0;
    const shippingFee = productAmount >= 20000 || productAmount === 0 ? 0 : 3000;
    const payable = productAmount - itemDiscount + shippingFee;

    return { productAmount, itemDiscount, shippingFee, payable };
  }, [items, selected]);

  // =========================
  // Address handlers
  // =========================
  const openManageAddress = async () => {
    setAddrManageOpen(true);

    try {
      const list = await fetchMyShippingAddresses();
      const sorted = [...(list ?? [])].sort(
        (a, b) => (isDefaultAddr(b) - isDefaultAddr(a)) || (b.shippingAddressId - a.shippingAddressId)
      );
      setAddresses(sorted);

      // ✅ 모달 임시 선택은 “현재 확정 배송지”로 시작
      setPickedAddrId(currentAddrId ?? sorted?.[0]?.shippingAddressId ?? null);
    } catch {
      setPickedAddrId(currentAddrId);
    }
  };

  const applySelectedAddress = () => {
    if (!pickedAddrId) return;
    setCurrentAddrId(pickedAddrId);
    setAddrManageOpen(false);
    pulseShippingCard();
  };

  const openAddAddress = () => {
    setEditTargetId(null);
    setAddrDraft({
      label: "새 배송지",
      receiverName: currentAddress?.receiverName ?? "",
      receiverPhone: currentAddress?.receiverPhone ?? "",
      zipCode: "",
      address1: "",
      address2: "",
      isDefault: true,
    });
    setAddrEditOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditTargetId(addr.shippingAddressId);
    setAddrDraft({
      label: addr.label ?? "배송지",
      receiverName: addr.receiverName ?? "",
      receiverPhone: addr.receiverPhone ?? "",
      zipCode: addr.zipCode ?? "",
      address1: addr.address1 ?? "",
      address2: addr.address2 ?? "",
      isDefault: isDefaultAddr(addr),
    });
    setAddrEditOpen(true);
  };

  const makeDefault = async (addr) => {
    if (isDefaultAddr(addr)) return;
    setErr("");
    setBusy(true);
    try {
      await setDefaultMyShippingAddress(addr.shippingAddressId);
      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openDeleteConfirm = (addr) => {
    setDeleteTarget(addr);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.shippingAddressId) return;
    setErr("");
    setBusy(true);
    try {
      await deleteMyShippingAddress(deleteTarget.shippingAddressId);

      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);

      // 확정 배송지가 삭제되면 보정
      if (deleteTarget.shippingAddressId === currentAddrId) {
        const def = (list ?? []).find((a) => isDefaultAddr(a)) || (list ?? [])[0];
        setCurrentAddrId(def?.shippingAddressId ?? null);
        pulseShippingCard();
      }

      // 임시 선택도 보정
      if (deleteTarget.shippingAddressId === pickedAddrId) {
        const def = (list ?? []).find((a) => isDefaultAddr(a)) || (list ?? [])[0];
        setPickedAddrId(def?.shippingAddressId ?? null);
      }

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const saveAddressDraft = async () => {
    if (!addrDraft.label.trim()) return;
    if (!addrDraft.receiverName.trim()) return;
    if (!addrDraft.receiverPhone.trim()) return;
    if (!addrDraft.address1.trim()) return;

    setErr("");
    setBusy(true);
    try {
      if (editTargetId) {
        await updateMyShippingAddress(editTargetId, { ...addrDraft });
      } else {
        await createMyShippingAddress({ ...addrDraft });
      }

      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);

      setAddrEditOpen(false);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // =========================
  // Order (uses confirmed currentAddress)
  // =========================
  const makeOrder = async () => {
    setBusy(true);
    setErr("");
    try {
      if (!currentAddress) {
        setErr("배송지를 선택해 주세요.");
        return;
      }

      const created = await createOrder({
        receiverName: currentAddress.receiverName,
        receiverPhone: currentAddress.receiverPhone,
        address1: currentAddress.address1,
        address2: currentAddress.address2 ?? "",
      });
      await refreshCount();

      const firstName = created?.items?.[0]?.productName ?? "주문 상품";
      const itemCount = created?.items?.length ?? 1;

      nav("/payment", {
        state: {
          orderId: created.orderId,
          itemName: itemCount > 1 ? `${firstName} 외 ${itemCount - 1}건` : firstName,
          amount: created.totalPrice,
          shippingAddress: currentAddress,
          ...buildBuyerState(),
        },
      });
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cartPage">
      <div className="cartTitle">장바구니</div>

      <div className="cartLayout">
        {/* LEFT */}
        <section className="card">
          <div className="selectBar">
            <label className="checkbox">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={busy || !items.length} />
              <span className="checkboxText">
                전체선택 <b>{selected.size}</b>/<b>{items.length}</b>
              </span>
            </label>

            <div className="selectActions">
              <button className="btnGhost" onClick={removeSelected} disabled={busy || selected.size === 0}>
                선택삭제
              </button>
              <button className="btnGhost" onClick={clearAll} disabled={busy || items.length === 0}>
                전체비우기
              </button>
            </div>
          </div>

          {err && <div className="errorBox">{err}</div>}

          {loading ? (
            <div className="empty">
              <div className="muted">불러오는 중...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="muted">장바구니가 비어 있습니다.</div>
              <div className="row" style={{ marginTop: 10, gap: 8 }}>
                <button className="btn" onClick={() => nav("/products")}>
                  상품 보러가기
                </button>
                <button className="btnGhost" onClick={loadCart}>
                  다시 불러오기
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="items">
                {items.map((it) => {
                  const line = it.lineTotal ?? it.price * it.quantity;
                  const checked = selected.has(it.itemId);
                  const itemStock = Math.max(0, Number(it.stock ?? 0));
                  const disableIncrease = busy || itemStock <= 0 || it.quantity >= itemStock;

                  return (
                    <div key={it.itemId} className="item">
                      <button
                        className="xBtn"
                        onClick={() => removeOne(it.itemId)}
                        disabled={busy}
                        aria-label="삭제"
                        title="삭제"
                      >
                        ×
                      </button>

                      <div className="itemTop">
                        <label className="checkbox">
                          <input type="checkbox" checked={checked} onChange={() => toggleOne(it.itemId)} disabled={busy} />
                        </label>
                        <div className="itemName">{it.name}</div>
                      </div>

                      <div className="itemBody">
                        <div className="thumb">
                          {it.thumbnailUrl ? (
                            <img src={it.thumbnailUrl} alt={it.name} />
                          ) : (
                            <div className="thumbPlaceholder">이미지 없음</div>
                          )}
                        </div>

                        <div className="priceBox">
                          <div className="priceMain">{fmt(it.price)}원</div>

                          <div className="priceSub">
                            <span className="muted">
                              {fmt(it.price)}원 × {it.quantity}
                            </span>
                            <span className="lineTotal">{fmt(line)}원</span>
                          </div>

                          <div className="qty">
                            <button
                              className="qtyBtn"
                              disabled={busy || it.quantity <= 1}
                              onClick={() => changeQty(it.itemId, it.quantity - 1)}
                            >
                              −
                            </button>
                            <div className="qtyNum">{it.quantity}</div>
                            <button
                              className="qtyBtn"
                              disabled={disableIncrease}
                              onClick={() => changeQty(it.itemId, it.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bottomTotal">
                <div className="muted">
                  상품 <b>{fmt(calc.productAmount)}</b>원 + 배송비 <b>{fmt(calc.shippingFee)}</b>원
                </div>
                <div className="bottomPay">{fmt(calc.payable)}원</div>
              </div>

              <div className="smallMeta">
                <span className="muted">장바구니 ID: {cart?.cartId}</span>
              </div>
            </>
          )}
        </section>

        {/* RIGHT */}
        <aside className="rightCol">
          <div className="sticky">
            {/* 배송지 카드 */}
            <div className={`card shipCard ${shipFlash ? "shipFlash" : ""}`}>
              <div className="shipHeader">
                <div className="shipTitleRow">
                  <div className="shipTitle">배송지</div>
                  <span className="shipBadge">샛별배송</span>
                </div>
                <button className="shipChangeBtn" onClick={openManageAddress}>
                  변경
                </button>
              </div>

              {addrLoading ? (
                <div className="shipAddr">
                  <div className="muted">배송지 불러오는 중...</div>
                </div>
              ) : !currentAddress ? (
                <div className="shipAddr">
                  <div className="shipAddrLine">배송지를 설정해 주세요</div>
                </div>
              ) : (
                <div className="shipAddr">
                  <div className="shipAddrLine">{currentAddress.address1}</div>

                  <div className="shipInfoList">
                    <div className="shipInfoRow">
                      <span className="shipInfoKey">상세주소</span>
                      <span className="shipInfoVal">{currentAddress.address2 || "-"}</span>
                    </div>
                    <div className="shipInfoRow">
                      <span className="shipInfoKey">우편번호</span>
                      <span className="shipInfoVal">{currentAddress.zipCode || "-"}</span>
                    </div>
                    <div className="shipInfoRow">
                      <span className="shipInfoKey">받는분</span>
                      <span className="shipInfoVal">
                        {currentAddress.receiverName} ({currentAddress.receiverPhone})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 결제금액 카드 */}
            <div className="card">
              <div className="payTitle">결제금액</div>

              <div className="payRow">
                <span className="muted">상품 금액</span>
                <b>{fmt(calc.productAmount)}원</b>
              </div>

              <div className="payRow">
                <span className="muted">상품 할인 금액</span>
                <b className="minus">-{fmt(calc.itemDiscount)}원</b>
              </div>

              <div className="payRow">
                <span className="muted">쿠폰 할인 금액</span>
                <span className="muted">로그인 후 확인</span>
              </div>

              <div className="payRow">
                <span className="muted">배송비</span>
                <b>{fmt(calc.shippingFee)}원</b>
              </div>

              <div className="divider" />

              <div className="payRow payBig">
                <span>결제예정금액</span>
                <b>{fmt(calc.payable)}원</b>
              </div>

              <div className="hint">선택 상품 기준으로 결제금액이 계산됩니다.</div>

              <div className="freeShip">
                {calc.productAmount >= 20000 ? (
                  <>무료배송 적용 중</>
                ) : (
                  <>
                    2만원 이상 무료배송까지 <b>{fmt(20000 - calc.productAmount)}</b>원 남았어요
                  </>
                )}
              </div>

              <button className="btnPrimary" disabled={!canOrder || !currentAddress} onClick={makeOrder}>
                {busy ? "처리중..." : "주문하기"}
              </button>

              <button className="btnGhostFull" onClick={() => nav("/products")} disabled={busy}>
                상품 더 보기
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 배송지 관리 모달 */}
      <Modal
        open={addrManageOpen}
        title="배송지 관리"
        onClose={() => setAddrManageOpen(false)}
        footer={
          <>
            <button
              className="btnFooterHalf btnFooterPrimary"
              onClick={openAddAddress}
              disabled={busy}
            >
              새 배송지 추가
            </button>

            <button
              className="btnFooterHalf btnFooterOutline"
              onClick={applySelectedAddress}
              disabled={!pickedAddrId || busy}
            >
              선택
            </button>
          </>
        }
      >
        <div className="addressList">
          {[...addresses]
            .sort((a, b) => (isDefaultAddr(b) - isDefaultAddr(a)) || (b.shippingAddressId - a.shippingAddressId))
            .map((a) => {
              const def = isDefaultAddr(a);
              return (
                <div key={a.shippingAddressId} className="addressItem">
                  <label className="addressRadio">
                    <input
                      type="radio"
                      name="addr"
                      checked={a.shippingAddressId === pickedAddrId}
                      onChange={() => setPickedAddrId(a.shippingAddressId)}
                    />

                    <span className="addressText">
                      <div className="addressTopRow">
                        <span className="addressLabel">{a.label}</span>
                        {def && <span className="addressDefault strong">기본배송지</span>}
                      </div>

                      <div className="addressLine">{a.address1}</div>

                      {/* ✅ 모달에서도 배송지 카드와 동일하게 표시 */}
                      <div className="shipInfoList">
                        <div className="shipInfoRow">
                          <span className="shipInfoKey">상세주소</span>
                          <span className="shipInfoVal">{a.address2 || "-"}</span>
                        </div>
                        <div className="shipInfoRow">
                          <span className="shipInfoKey">우편번호</span>
                          <span className="shipInfoVal">{a.zipCode || "-"}</span>
                        </div>
                        <div className="shipInfoRow">
                          <span className="shipInfoKey">받는분</span>
                          <span className="shipInfoVal">
                            {a.receiverName} ({a.receiverPhone})
                          </span>
                        </div>
                      </div>
                    </span>
                  </label>

                  <div className="addressActions">
                    {/* ✅ 기본 배송지에는 기본/삭제 버튼 숨김 */}
                    {!def && (
                      <button className="miniBtn" onClick={() => makeDefault(a)} disabled={busy}>
                        기본
                      </button>
                    )}
                    <button className="miniBtn" onClick={() => openEditAddress(a)} disabled={busy}>
                      수정
                    </button>
                    {!def && (
                      <button className="miniBtn" onClick={() => openDeleteConfirm(a)} disabled={busy}>
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        
      </Modal>

      {/* 삭제 confirm 모달 */}
      <Modal
        open={deleteConfirmOpen}
        title="배송지 삭제"
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        footer={
          <>
            <button className="btnGhost" onClick={() => setDeleteConfirmOpen(false)} disabled={busy}>
              취소
            </button>
            <button className="btnDanger" onClick={confirmDelete} disabled={busy}>
              {busy ? "삭제중..." : "삭제"}
            </button>
          </>
        }
      >
        <div className="confirmText">
          <div className="confirmTitle">정말 삭제할까요?</div>
          <div className="confirmDesc">
            <b>{deleteTarget?.label ?? "선택한 배송지"}</b> 배송지가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </div>
        </div>
      </Modal>

      {/* 새 배송지 추가/수정 모달 */}
      <Modal
        open={addrEditOpen}
        title={editTargetId ? "배송지 수정" : "새 배송지 추가"}
        onClose={() => setAddrEditOpen(false)}
        bodyScroll={false}
        footer={
          <>
            <button className="btnGhost" onClick={() => setAddrEditOpen(false)} disabled={busy}>
              취소
            </button>
            <button
              className="btnPrimary"
              onClick={saveAddressDraft}
              disabled={
                busy ||
                !addrDraft.label.trim() ||
                !addrDraft.receiverName.trim() ||
                !addrDraft.receiverPhone.trim() ||
                !addrDraft.address1.trim()
              }
            >
              {busy ? "저장중..." : "저장"}
            </button>
          </>
        }
      >
        <div className="addrForm">

          <label className="checkbox" style={{ marginBottom: 10 }}>
            <span className="checkboxText">주 소</span>
          </label>

          <div>
            <AddressSearch
              onSelect={({ zipCode, address1, address2 }) =>
                setAddrDraft((p) => ({
                  ...p,
                  zipCode: zipCode ?? "",
                  address1: address1 ?? "",
                  address2: address2 ?? "",
                }))
              }
            />
          </div>

          <input className="input" placeholder="우편 번호 (자동 입력)" value={addrDraft.zipCode} readOnly />

          <input className="input" placeholder="주소 (자동 입력)" value={addrDraft.address1} readOnly />

          <input
            className="input"
            
            placeholder="상세 주소 (선택 입력)"
            value={addrDraft.address2}
            onChange={(e) => setAddrDraft((p) => ({ ...p, address2: e.target.value }))}
          />

          <label className="checkbox" style={{ marginTop: 10 }}>
            <span className="checkboxText">받 는 분</span>
          </label>

          <input
            className="input"
            style={{ marginTop: 10 }}
            placeholder="배송지 이름 (예: 우리집, 회사)"
            value={addrDraft.label}
            onChange={(e) => setAddrDraft((p) => ({ ...p, label: e.target.value }))}
          />

          <div className="formGrid2" style={{ marginTop: 10 }}>
            <input
              className="input"
              placeholder="받는 사람"
              value={addrDraft.receiverName}
              onChange={(e) => setAddrDraft((p) => ({ ...p, receiverName: e.target.value }))}
            />
            <input
              className="input"
              placeholder="연락처"
              value={addrDraft.receiverPhone}
              onChange={(e) => setAddrDraft((p) => ({ ...p, receiverPhone: e.target.value }))}
            />
          </div>

          

          <label className="checkbox" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={!!addrDraft.isDefault}
              onChange={(e) => setAddrDraft((p) => ({ ...p, isDefault: e.target.checked }))}
            />
            <span className="checkboxText">기본 배송지로 설정</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
