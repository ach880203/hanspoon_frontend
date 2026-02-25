// src/pages/CartPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCart, deleteMyCartItem, updateMyCartItem } from "../api/carts";
import { createOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";
import AddressSearch from "../components/AddressSearch";
import "./CartPage.css";

const fmt = (n) => (n ?? 0).toLocaleString();

const LS_ADDR_KEY = "hs_shipping_addresses_v1";

/** @typedef {{id:string,label:string,zipCode:string,address1:string,address2:string,isDefault:boolean}} ShippingAddress */

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadAddressesFallback() {
  try {
    const raw = localStorage.getItem(LS_ADDR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) {}

  // ✅ 최초 셋팅(회원정보 주소가 있다면 여기에 연결)
  // TODO(백엔드): /me 또는 /members/me 같은 API로 기본 주소 받아서 여기 default로 넣기
  const initial = [
    {
      id: uid(),
      label: "기본배송지",
      zipCode: "",
      address1: "회원정보 기본 배송지(임시)",
      address2: "",
      isDefault: true,
    },
  ];
  try {
    localStorage.setItem(LS_ADDR_KEY, JSON.stringify(initial));
  } catch (_) {}
  return initial;
}

function saveAddresses(list) {
  try {
    localStorage.setItem(LS_ADDR_KEY, JSON.stringify(list));
  } catch (_) {}
}

function Modal({ open, title, onClose, children, footer }) {
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
        <div className="modalBody">{children}</div>
        {footer && <div className="modalFooter">{footer}</div>}
      </div>
    </div>
  );
}

export default function CartPage() {
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState(() => new Set());

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===== 배송지 상태 (localStorage 기반) =====
  const [addresses, setAddresses] = useState(() => loadAddressesFallback());
  const [currentAddrId, setCurrentAddrId] = useState(() => {
    const list = loadAddressesFallback();
    const def = list.find((a) => a.isDefault) ?? list[0];
    return def?.id ?? "";
  });

  const currentAddress = useMemo(() => {
    return addresses.find((a) => a.id === currentAddrId) || addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses, currentAddrId]);

  // 배송지 관리 모달
  const [addrManageOpen, setAddrManageOpen] = useState(false);

  // 새 배송지(추가/수정) 모달
  const [addrEditOpen, setAddrEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null); // null이면 추가, 값이면 수정
  const [addrDraft, setAddrDraft] = useState({
    label: "새 배송지",
    zipCode: "",
    address1: "",
    address2: "",
  });

  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selected.size === items.length;
  const canOrder = selected.size > 0 && !busy;

  const load = async () => {
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
    load();
  }, []);

  // 주소 목록 변경 시 localStorage 저장 + 기본 주소 보정
  useEffect(() => {
    if (!addresses.length) return;
    saveAddresses(addresses);

    // current가 삭제되었으면 default/첫 번째로 보정
    if (!addresses.find((a) => a.id === currentAddrId)) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setCurrentAddrId(def.id);
    }
  }, [addresses, currentAddrId]);

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
      await load();
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
      await load();
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
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

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

  // ===== 배송지 관련 핸들러 =====
  const openManageAddress = () => setAddrManageOpen(true);

  const openAddAddress = () => {
    setEditTargetId(null);
    setAddrDraft({ label: "새 배송지", zipCode: "", address1: "", address2: "" });
    setAddrEditOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditTargetId(addr.id);
    setAddrDraft({
      label: addr.label ?? "배송지",
      zipCode: addr.zipCode ?? "",
      address1: addr.address1 ?? "",
      address2: addr.address2 ?? "",
    });
    setAddrEditOpen(true);
  };

  const applySelectedAddress = (addrId) => {
    setCurrentAddrId(addrId);
    setAddrManageOpen(false);
  };

  const saveAddressDraft = () => {
    if (!addrDraft.address1.trim()) return;

    setAddresses((prev) => {
      const list = [...prev];

      if (editTargetId) {
        const idx = list.findIndex((a) => a.id === editTargetId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...addrDraft };
          return list;
        }
      }

      const newAddr = {
        id: uid(),
        label: addrDraft.label.trim() || "배송지",
        zipCode: addrDraft.zipCode ?? "",
        address1: addrDraft.address1 ?? "",
        address2: addrDraft.address2 ?? "",
        isDefault: prev.length === 0, // 최초 1개면 default
      };
      const next = [newAddr, ...list];

      // 새로 추가한 주소를 즉시 선택
      setCurrentAddrId(newAddr.id);
      return next;
    });

    setAddrEditOpen(false);
    setAddrManageOpen(false);
  };

  const makeDefault = (addrId) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addrId }))
    );
  };

  const makeOrder = async () => {
    setBusy(true);
    setErr("");
    try {
      const cartId = cart?.cartId;
      if (!cartId) {
        setErr("장바구니 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }

      // TODO(백엔드 연동): 배송지 ID/주소를 주문에 포함시키고 싶으면 payload에 추가
      // ex) createOrder({ cartId, shippingAddressId: currentAddress?.id })
      const created = await createOrder({ cartId });

      const firstName = created?.items?.[0]?.productName ?? "주문 상품";
      const itemCount = created?.items?.length ?? 1;

      nav("/payment", {
        state: {
          orderId: created.orderId,
          itemName: itemCount > 1 ? `${firstName} 외 ${itemCount - 1}건` : firstName,
          amount: created.totalPrice,
          shippingAddress: currentAddress, // 결제 페이지에서 필요하면 사용
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
                <button className="btnGhost" onClick={load}>다시 불러오기</button>
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
          {/* sticky wrapper: 배송지 + 결제금액 같이 따라오게 */}
          <div className="sticky">
            {/* 배송지 카드 */}
            <div className="card shipCard">
              <div className="shipHeader">
                <div className="shipTitleRow">
                  <div className="shipTitle">배송지</div>
                  <span className="shipBadge">샛별배송</span>
                </div>
                <button className="shipChangeBtn" onClick={openManageAddress}>변경</button>
              </div>

              <div className="shipAddr">
                <div className="shipAddrLine">{currentAddress?.address1 || "배송지를 설정해 주세요"}</div>
                {(currentAddress?.zipCode || currentAddress?.address2) && (
                  <div className="shipAddrSub">
                    {currentAddress?.zipCode ? `${currentAddress.zipCode}` : ""}
                    {currentAddress?.address2 ? ` ${currentAddress.address2}` : ""}
                  </div>
                )}
              </div>
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

              <button className="btnPrimary" disabled={!canOrder} onClick={makeOrder}>
                {busy ? "처리중..." : "주문하기"}
              </button>

              <button className="btnGhostFull" onClick={() => nav("/products")} disabled={busy}>
                상품 더 보기
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 배송지 관리 모달 (2번째 이미지 흐름) */}
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
          {addresses.map((a) => (
            <div key={a.id} className="addressItem">
              <label className="addressRadio">
                <input
                  type="radio"
                  name="addr"
                  checked={a.id === currentAddrId}
                  onChange={() => setCurrentAddrId(a.id)}
                />
                <span className="addressText">
                  <div className="addressTopRow">
                    <span className="addressLabel">{a.label}</span>
                    {a.isDefault && <span className="addressDefault">기본배송지</span>}
                  </div>
                  <div className="addressLine">{a.address1}</div>
                  {(a.zipCode || a.address2) && (
                    <div className="addressSub">{a.zipCode ? `${a.zipCode}` : ""}{a.address2 ? ` ${a.address2}` : ""}</div>
                  )}
                </span>
              </label>

              <div className="addressActions">
                <button className="miniBtn" onClick={() => makeDefault(a.id)}>기본</button>
                <button className="miniBtn" onClick={() => openEditAddress(a)}>수정</button>
                <button className="miniBtn primary" onClick={() => applySelectedAddress(a.id)}>선택</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 새 배송지 추가/수정 모달 (3번째 이미지 흐름: 주소 검색) */}
      <Modal
        open={addrEditOpen}
        title={editTargetId ? "배송지 수정" : "새 배송지 추가"}
        onClose={() => setAddrEditOpen(false)}
        footer={
          <>
            <button className="btnGhost" onClick={() => setAddrEditOpen(false)}>취소</button>
            <button className="btnPrimary" onClick={saveAddressDraft} disabled={!addrDraft.address1.trim()}>
              저장
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

          <div style={{ marginTop: 10 }}>
            <AddressSearch
              onSelect={({ zipCode, address1 }) =>
                setAddrDraft((p) => ({ ...p, zipCode: zipCode ?? "", address1: address1 ?? "", address2: "" }))
              }
            />
          </div>

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
        </div>
      </Modal>
    </div>
  );
}