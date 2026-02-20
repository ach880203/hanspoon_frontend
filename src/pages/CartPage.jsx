// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCart, addMyCartItem, deleteMyCartItem, updateMyCartItem } from "../api/carts";
import { createOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";

export default function CartPage() {
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [checkout, setCheckout] = useState({
    receiverName: "",
    receiverPhone: "",
    address1: "",
    address2: "",
  });

  const load = async () => {
    setErr("");
    try {
      const c = await fetchMyCart();
      setCart(c);
    } catch (e) {
      setErr(toErrorMessage(e));
      setCart(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeQty = async (itemId, nextQty) => {
    setBusy(true);
    setErr("");
    try {
      const updated = await updateMyCartItem(itemId, nextQty);
      setCart(updated);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (itemId) => {
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

  // ✅ 카트 초기화(내 장바구니 비우기)
  const clearAll = async () => {
    if (!cart || cart.items.length === 0) return;
    setBusy(true);
    setErr("");
    try {
      for (const it of cart.items) {
        await deleteMyCartItem(it.itemId);
      }
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const makeOrder = async () => {
    setBusy(true);
    setErr("");
    try {
      // ✅ 지금 백엔드 OrderCreateRequestDto가 cartId를 받는 구조면 cartId 포함해서 보내야 함
      // (다음 단계에서 order를 "유저 기반"으로 바꾸면 cartId 제거할 거야)
      const cartId = cart?.cartId;
      if (!cartId) throw new Error("장바구니 정보를 불러오지 못했습니다. 다시 시도해주세요.");

      const payload = { cartId, ...checkout };
      const created = await createOrder(payload);

      // 주문 성공 시 장바구니 비워지니까 다시 로드
      await load();
      nav(`/orders/${created.orderId}`);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Cart</h1>

      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <div className="muted">cartId: {cart?.cartId ?? "(loading)"}</div>
        <button className="ghost" disabled={busy} onClick={clearAll}>
          카트 초기화
        </button>
      </div>

      {err && <div className="error">{err}</div>}

      {!cart ? (
        <div className="panel">
          <div className="muted">장바구니를 불러오는 중이거나, 아직 장바구니가 없습니다.</div>
          <button disabled={busy} onClick={load}>
            다시 불러오기
          </button>
        </div>
      ) : (
        <>
          <div className="panel">
            <h3>Items</h3>

            {cart.items.length === 0 ? (
              <div className="muted">장바구니가 비었습니다.</div>
            ) : (
              <div className="cartList">
                {cart.items.map((it) => (
                  <div key={it.itemId} className="cartItem">
                    <div className="cartThumb">
                      {it.thumbnailUrl ? (
                        <img src={it.thumbnailUrl} alt={it.name} />
                      ) : (
                        <div className="thumbPlaceholder">No</div>
                      )}
                    </div>

                    <div className="cartInfo">
                      <div className="title">{it.name}</div>
                      <div className="muted">
                        {it.price.toLocaleString()}원 × {it.quantity} ={" "}
                        <b>{it.lineTotal.toLocaleString()}원</b>
                      </div>

                      <div className="row" style={{ gap: 8, marginTop: 8 }}>
                        <button
                          disabled={busy || it.quantity <= 1}
                          onClick={() => changeQty(it.itemId, it.quantity - 1)}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            changeQty(it.itemId, Math.max(1, Number(e.target.value)))
                          }
                          style={{ width: 90 }}
                        />

                        <button disabled={busy} onClick={() => changeQty(it.itemId, it.quantity + 1)}>
                          +
                        </button>

                        <button className="danger" disabled={busy} onClick={() => remove(it.itemId)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="totals">
              <div>
                총 수량: <b>{cart.totalQuantity}</b>
              </div>
              <div>
                총 금액: <b>{cart.totalPrice.toLocaleString()}원</b>
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Checkout</h3>

            <div className="grid2">
              <input
                placeholder="받는사람"
                value={checkout.receiverName}
                onChange={(e) => setCheckout({ ...checkout, receiverName: e.target.value })}
              />
              <input
                placeholder="연락처"
                value={checkout.receiverPhone}
                onChange={(e) => setCheckout({ ...checkout, receiverPhone: e.target.value })}
              />
            </div>

            <input
              style={{ marginTop: 8 }}
              placeholder="주소1"
              value={checkout.address1}
              onChange={(e) => setCheckout({ ...checkout, address1: e.target.value })}
            />
            <input
              style={{ marginTop: 8 }}
              placeholder="주소2"
              value={checkout.address2}
              onChange={(e) => setCheckout({ ...checkout, address2: e.target.value })}
            />

            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <button disabled={busy || cart.items.length === 0} onClick={makeOrder}>
                {busy ? "처리중..." : "주문 생성"}
              </button>
              <button className="ghost" onClick={() => nav("/products")}>
                상품 더 보기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
