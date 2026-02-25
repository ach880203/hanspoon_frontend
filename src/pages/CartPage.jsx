// src/pages/CartPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCart, deleteMyCartItem, updateMyCartItem } from "../api/carts";
import { createOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";
import AddressSearch from "../components/AddressSearch";
import "./CartPage.css";

const fmt = (n) => (n ?? 0).toLocaleString();

export default function CartPage() {
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // 선택 상품
  const [selected, setSelected] = useState(() => new Set());

  const [checkout, setCheckout] = useState({
    receiverName: "",
    receiverPhone: "",
    zipCode: "",
    address1: "",
    address2: "",
  });

  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selected.size === items.length;

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const c = await fetchMyCart();
      setCart(c);

      // 기본: 전부 선택
      const next = new Set((c?.items ?? []).map((it) => it.itemId));
      setSelected(next);
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

  const toggleAll = () => {
    if (!items.length) return;
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((it) => it.itemId)));
  };

  const toggleOne = (itemId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
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

      // 업데이트 후 선택 상태 유지(존재하는 것만)
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
      for (const id of selected) {
        await deleteMyCartItem(id);
      }
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
      for (const it of items) {
        await deleteMyCartItem(it.itemId);
      }
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // 결제 계산(선택된 상품만)
  const calc = useMemo(() => {
    const selectedItems = items.filter((it) => selected.has(it.itemId));
    const productAmount = selectedItems.reduce((sum, it) => {
      const line = it.lineTotal ?? it.price * it.quantity;
      return sum + (line ?? 0);
    }, 0);

    // 할인/쿠폰은 현재 데이터가 없어서 0 (추후 연결 가능)
    const itemDiscount = 0;
    const couponDiscount = 0;

    // 배송비 예시: 2만원 이상 무료, 아니면 3천원
    const shippingFee = productAmount >= 20000 || productAmount === 0 ? 0 : 3000;

    const payable = productAmount - itemDiscount - couponDiscount + shippingFee;

    return { productAmount, itemDiscount, couponDiscount, shippingFee, payable };
  }, [items, selected]);

  const canOrder =
    selected.size > 0 &&
    checkout.receiverName.trim() &&
    checkout.receiverPhone.trim() &&
    checkout.address1.trim();

  const makeOrder = async () => {
    setBusy(true);
    setErr("");
    try {
      const cartId = cart?.cartId;
      if (!cartId) {
        setErr("장바구니 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }

      // 현재 백엔드가 cartId 기반 생성이라 그대로 보냄
      const payload = { cartId, ...checkout };
      const created = await createOrder(payload);

      await load();
      nav(`/orders/${created.orderId}`);
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
        {/* LEFT: items */}
        <section className="card">
          <div className="selectBar">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={busy || !items.length}
              />
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
          ) : !cart || items.length === 0 ? (
            <div className="empty">
              <div className="muted">장바구니가 비어 있습니다.</div>
              <div className="row" style={{ marginTop: 10, gap: 8 }}>
                <button className="btn" onClick={() => nav("/products")}>
                  상품 보러가기
                </button>
                <button className="btnGhost" onClick={load}>
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

                  return (
                    <div key={it.itemId} className="item">
                      <div className="itemTop">
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(it.itemId)}
                            disabled={busy}
                          />
                        </label>

                        <div className="itemName">{it.name}</div>

                        <button
                          className="xBtn"
                          onClick={() => removeOne(it.itemId)}
                          disabled={busy}
                          aria-label="삭제"
                          title="삭제"
                        >
                          ×
                        </button>
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
                              disabled={busy}
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

        {/* RIGHT: summary + checkout info */}
        <aside className="rightCol">
          <div className="card sticky">
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

            <div className="hint">
              선택 상품 기준으로 결제금액이 계산됩니다.
            </div>

            <div className="freeShip">
              {calc.productAmount >= 20000 ? (
                <>무료배송 적용 중</>
              ) : (
                <>
                  2만원 이상 무료배송까지 <b>{fmt(20000 - calc.productAmount)}</b>원 남았어요
                </>
              )}
            </div>

            <button className="btnPrimary" disabled={busy || !canOrder} onClick={makeOrder}>
              {busy ? "처리중..." : "주문하기"}
            </button>

            <button className="btnGhostFull" onClick={() => nav("/products")} disabled={busy}>
              상품 더 보기
            </button>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="payTitle">배송 정보</div>

            <div className="formGrid2">
              <input
                className="input"
                placeholder="받는 사람"
                value={checkout.receiverName}
                onChange={(e) => setCheckout({ ...checkout, receiverName: e.target.value })}
              />
              <input
                className="input"
                placeholder="연락처"
                value={checkout.receiverPhone}
                onChange={(e) => setCheckout({ ...checkout, receiverPhone: e.target.value })}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <AddressSearch
                onSelect={({ zipCode, address1 }) =>
                  setCheckout((prev) => ({ ...prev, zipCode, address1, address2: "" }))
                }
              />
            </div>

            {checkout.zipCode && <input className="input" style={{ marginTop: 10 }} value={checkout.zipCode} readOnly />}

            <input
              className="input"
              style={{ marginTop: 10 }}
              placeholder="기본 주소 (검색 시 자동 입력)"
              value={checkout.address1}
              readOnly
            />

            <input
              className="input"
              style={{ marginTop: 10 }}
              placeholder="상세 주소 (선택 입력)"
              value={checkout.address2}
              onChange={(e) => setCheckout({ ...checkout, address2: e.target.value })}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}