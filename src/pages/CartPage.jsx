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

const fmt = (n) => (n ?? 0).toLocaleString();

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

  // cart
  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  // ui
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // shipping
  const [addresses, setAddresses] = useState([]);
  const [currentAddrId, setCurrentAddrId] = useState(null);
  const [addrLoading, setAddrLoading] = useState(true);

  // modals
  const [addrManageOpen, setAddrManageOpen] = useState(false);
  const [addrEditOpen, setAddrEditOpen] = useState(false);

  // delete confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // address object

  // ship card pulse
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

  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selected.size === items.length;
  const canOrder = selected.size > 0 && !busy;

  const currentAddress = useMemo(() => {
    if (!addresses.length) return null;
    const found = addresses.find((a) => a.shippingAddressId === currentAddrId);
    return found || addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses, currentAddrId]);

  const pulseShippingCard = () => {
    // toggle 방식으로 애니메이션 재트리거
    if (shipFlashTimer.current) clearTimeout(shipFlashTimer.current);
    setShipFlash(false);
    requestAnimationFrame(() => {
      setShipFlash(true);
      shipFlashTimer.current = setTimeout(() => setShipFlash(false), 650);
    });
  };

  // ----- cart -----
  const loadCart = async () => {
    setErr("");
    setLoading(true);
    try {
      const c = await fetchMyCart();
      setCart(c);
      setSelected(new Set((c?.items ?? []).map((it) => it.itemId)));
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

  // ----- shipping -----
  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);

      const def = await fetchMyDefaultShippingAddress().catch(() => null);
      if (def?.shippingAddressId) setCurrentAddrId(def.shippingAddressId);
      else if (list?.[0]?.shippingAddressId) setCurrentAddrId(list[0].shippingAddressId);
      else setCurrentAddrId(null);
    } catch (e) {
      setAddresses([]);
      setCurrentAddrId(null);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    return () => {
      if (shipFlashTimer.current) clearTimeout(shipFlashTimer.current);
    };
  }, []);

  // selection
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

  // cart actions
  const changeQty = async (itemId, nextQty) => {
    if (nextQty < 1) return;
    setBusy(true);
    setErr("");
    try {
      const updated = await updateMyCartItem(itemId, nextQty);
      setCart(updated);

      const updatedIds = new Set((updated?.items ?? []).map((it) => it.itemId));
      setSelected((prev) => new Set([...prev].filter((id) => updatedIds.has(id))));
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

  // calc
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

  // ----- shipping handlers -----
  const openManageAddress = async () => {
    setAddrManageOpen(true);
    try {
      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);
    } catch (_) {}
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
      isDefault: !!addr.isDefault,
    });
    setAddrEditOpen(true);
  };

  const applySelectedAddress = (shippingAddressId) => {
    setCurrentAddrId(shippingAddressId);
    setAddrManageOpen(false);
    pulseShippingCard(); // ✅ 선택 시 우측 카드 강조
  };

  const makeDefault = async (addr) => {
    if (addr.isDefault) return; // 이미 기본이면 아무것도 안 함
    setErr("");
    try {
      await setDefaultMyShippingAddress(addr.shippingAddressId);
      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);
      setCurrentAddrId(addr.shippingAddressId);
      pulseShippingCard(); // (선택 사항) 기본 지정 후에도 강조
    } catch (e) {
      setErr(toErrorMessage(e));
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

      const def = (list ?? []).find((a) => a.isDefault) || (list ?? [])[0];
      setCurrentAddrId(def?.shippingAddressId ?? null);

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);

      // 삭제 후에도 우측 카드 업데이트 티나게(선택 사항)
      pulseShippingCard();
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
      let saved;
      if (editTargetId) {
        saved = await updateMyShippingAddress(editTargetId, {
          label: addrDraft.label,
          receiverName: addrDraft.receiverName,
          receiverPhone: addrDraft.receiverPhone,
          zipCode: addrDraft.zipCode,
          address1: addrDraft.address1,
          address2: addrDraft.address2,
          isDefault: addrDraft.isDefault,
        });
      } else {
        saved = await createMyShippingAddress({
          label: addrDraft.label,
          receiverName: addrDraft.receiverName,
          receiverPhone: addrDraft.receiverPhone,
          zipCode: addrDraft.zipCode,
          address1: addrDraft.address1,
          address2: addrDraft.address2,
          isDefault: addrDraft.isDefault,
        });
      }

      const list = await fetchMyShippingAddresses();
      setAddresses(list ?? []);
      setCurrentAddrId(saved?.shippingAddressId ?? null);

      setAddrEditOpen(false);
      setAddrManageOpen(false);

      pulseShippingCard();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // ----- order -----
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

      const firstName = created?.items?.[0]?.productName ?? "주문 상품";
      const itemCount = created?.items?.length ?? 1;

      nav("/payment", {
        state: {
          orderId: created.orderId,
          itemName: itemCount > 1 ? `${firstName} 외 ${itemCount - 1}건` : firstName,
          amount: created.totalPrice,
          shippingAddress: currentAddress,
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
                <button className="btn" onClick={() => nav("/products")}>상품 보러가기</button>
                <button className="btnGhost" onClick={loadCart}>다시 불러오기</button>
              </div>
            </div>
          ) : (
            <>
              <div className="items">
                {items.map((it) => {
                  const line = it.lineTotal ?? it.price * it.quantity;
                  const checked = selected.has(it.itemId);

                  return (
                    <div key={it.itemId} className="item">
                      <button className="xBtn" onClick={() => removeOne(it.itemId)} disabled={busy} aria-label="삭제" title="삭제">
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
                          {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.name} /> : <div className="thumbPlaceholder">이미지 없음</div>}
                        </div>

                        <div className="priceBox">
                          <div className="priceMain">{fmt(it.price)}원</div>

                          <div className="priceSub">
                            <span className="muted">{fmt(it.price)}원 × {it.quantity}</span>
                            <span className="lineTotal">{fmt(line)}원</span>
                          </div>

                          <div className="qty">
                            <button className="qtyBtn" disabled={busy || it.quantity <= 1} onClick={() => changeQty(it.itemId, it.quantity - 1)}>−</button>
                            <div className="qtyNum">{it.quantity}</div>
                            <button className="qtyBtn" disabled={busy} onClick={() => changeQty(it.itemId, it.quantity + 1)}>+</button>
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
                <button className="shipChangeBtn" onClick={openManageAddress}>변경</button>
              </div>

              {addrLoading ? (
                <div className="shipAddr">
                  <div className="muted">배송지 불러오는 중...</div>
                </div>
              ) : !currentAddress ? (
                <div className="shipAddr">
                  <div className="shipAddrLine">배송지를 설정해 주세요</div>
                  <div className="shipAddrSub">변경 버튼을 눌러 배송지를 추가할 수 있어요.</div>
                </div>
              ) : (
                <div className="shipAddr">
                  <div className="shipAddrLine">{currentAddress.address1}</div>
                  <div className="shipAddrSub">
                    {currentAddress.receiverName} · {currentAddress.receiverPhone}
                    {(currentAddress.zipCode || currentAddress.address2) && (
                      <>
                        {" "}
                        / {currentAddress.zipCode ? `${currentAddress.zipCode}` : ""}
                        {currentAddress.address2 ? ` ${currentAddress.address2}` : ""}
                      </>
                    )}
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
                  <>2만원 이상 무료배송까지 <b>{fmt(20000 - calc.productAmount)}</b>원 남았어요</>
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
            <button className="btnGhost" onClick={() => setAddrManageOpen(false)}>닫기</button>
            <button className="btnPrimary" onClick={openAddAddress}>새 배송지 추가</button>
          </>
        }
      >
        <div className="addressList">
          {addresses.length === 0 ? (
            <div className="muted">등록된 배송지가 없습니다. 새 배송지를 추가해 주세요.</div>
          ) : (
            addresses.map((a) => (
              <div key={a.shippingAddressId} className="addressItem">
                <label className="addressRadio">
                  <input
                    type="radio"
                    name="addr"
                    checked={a.shippingAddressId === currentAddrId}
                    onChange={() => setCurrentAddrId(a.shippingAddressId)}
                  />
                  <span className="addressText">
                    <div className="addressTopRow">
                      <span className="addressLabel">{a.label}</span>
                      {a.isDefault && <span className="addressDefault">기본배송지</span>}
                    </div>

                    <div className="addressLine">{a.address1}</div>

                    <div className="addressSub">
                      {a.receiverName} · {a.receiverPhone}
                      {(a.zipCode || a.address2) && (
                        <>
                          {" "}
                          / {a.zipCode ? `${a.zipCode}` : ""}
                          {a.address2 ? ` ${a.address2}` : ""}
                        </>
                      )}
                    </div>
                  </span>
                </label>

                <div className="addressActions">
                  <button
                    className="miniBtn"
                    disabled={a.isDefault}
                    onClick={() => makeDefault(a)}
                    title={a.isDefault ? "이미 기본 배송지입니다." : "기본 배송지로 설정"}
                  >
                    기본
                  </button>
                  <button className="miniBtn" onClick={() => openEditAddress(a)}>수정</button>
                  <button className="miniBtn" onClick={() => openDeleteConfirm(a)}>삭제</button>
                  <button className="miniBtn primary" onClick={() => applySelectedAddress(a.shippingAddressId)}>선택</button>
                </div>
              </div>
            ))
          )}
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
            <button
              className="btnGhost"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
              disabled={busy}
            >
              취소
            </button>
            <button className="btnDanger" onClick={confirmDelete} disabled={busy}>
              {busy ? "삭제중..." : "삭제"}
            </button>
          </>
        }
      >
        <div className="confirmText">
          <div className="confirmTitle">
            정말 삭제할까요?
          </div>
          <div className="confirmDesc">
            <b>{deleteTarget?.label ?? "선택한 배송지"}</b> 배송지가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </div>
        </div>
      </Modal>

      {/* 새 배송지 추가/수정 모달 */}
      {/* AddressSearch dropdown이 잘리지 않도록 bodyScroll=false */}
      <Modal
        open={addrEditOpen}
        title={editTargetId ? "배송지 수정" : "새 배송지 추가"}
        onClose={() => setAddrEditOpen(false)}
        bodyScroll={false}
        footer={
          <>
            <button className="btnGhost" onClick={() => setAddrEditOpen(false)} disabled={busy}>취소</button>
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
          <input
            className="input"
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

          <div style={{ marginTop: 10 }}>
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

          {addrDraft.zipCode && (
            <input className="input" style={{ marginTop: 10 }} value={addrDraft.zipCode} readOnly />
          )}

          <input
            className="input"
            style={{ marginTop: 10 }}
            placeholder="기본 주소 (검색 시 자동 입력)"
            value={addrDraft.address1}
            readOnly
          />

          <input
            className="input"
            style={{ marginTop: 10 }}
            placeholder="상세 주소 (선택 입력)"
            value={addrDraft.address2}
            onChange={(e) => setAddrDraft((p) => ({ ...p, address2: e.target.value }))}
          />

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