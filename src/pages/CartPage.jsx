// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyCart, deleteMyCartItem, updateMyCartItem } from "../api/carts";
import { createOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";
import AddressSearch from "../components/AddressSearch";

export default function CartPage() {
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [checkout, setCheckout] = useState({
    receiverName: "",
    receiverPhone: "",
    zipCode: "",
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

  // 카트 초기화: 현재 장바구니 비우기
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
      // 지금은 백엔드 OrderCreateRequestDto가 cartId를 받는 구조면 cartId 포함해서 보낸다.
      // (다음 단계에서 order를 "유저 기반"으로 바꾸면 cartId 제거가 필요함)
      const cartId = cart?.cartId;
      if (!cartId) {
        setErr("장바구니 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }

      const payload = { cartId, ...checkout };
      const created = await createOrder(payload);

      // ✅ 주문 생성 성공 후 결제 페이지로 이동
      // created 객체에 orderId와 totalPrice가 포함되어 있다고 가정
      nav("/payment", {
        state: {
          orderId: created.orderId,
          itemName: created.items.length > 1
            ? `${created.items[0].productName} 외 ${created.items.length - 1}건`
            : created.items[0].productName,
          amount: created.totalPrice,
          buyerName: checkout.receiverName,
          buyerTel: checkout.receiverPhone,
          // 주소 정보 등은 이미 checkout에 있으므로 필요 시 추가 전달 가능
        }
      });
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>장바구니</h1>

      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <div className="muted">장바구니 ID: {cart?.cartId ?? "(불러오는 중)"}</div>
        <button className="ghost" disabled={busy} onClick={clearAll}>
          장바구니 비우기
        </button>
      </div>

      {err && <div className="error">{err}</div>}

      {!cart ? (
        <div className="panel">
          <div className="muted">장바구니를 불러오는 중이거나 아직 장바구니가 비어 있습니다.</div>
          <button disabled={busy} onClick={load}>
            다시 불러오기
          </button>
        </div>
      ) : (
        <>
          <div className="panel">
            <h3>상품 목록</h3>

            {cart.items.length === 0 ? (
              <div className="muted">장바구니가 비어 있습니다.</div>
            ) : (
              <div className="cartList">
                {cart.items.map((it) => (
                  <div key={it.itemId} className="cartItem">
                    <div className="cartThumb">
                      {it.thumbnailUrl ? (
                        <img src={it.thumbnailUrl} alt={it.name} />
                      ) : (
                        <div className="thumbPlaceholder">이미지 없음</div>
                      )}
                    </div>

                    <div className="cartInfo">
                      <div className="title">{it.name}</div>
                      <div className="muted">
                        {it.price.toLocaleString()}원 x {it.quantity} ={" "}
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
            <h3>주문 정보</h3>

            <div className="grid2">
              <input
                placeholder="받는 사람"
                value={checkout.receiverName}
                onChange={(e) => setCheckout({ ...checkout, receiverName: e.target.value })}
              />
              <input
                placeholder="연락처"
                value={checkout.receiverPhone}
                onChange={(e) => setCheckout({ ...checkout, receiverPhone: e.target.value })}
              />
            </div>

            {/* 주소 검색 */}
            <div style={{ marginTop: 8 }}>
              <AddressSearch
                onSelect={({ zipCode, address1 }) =>
                  setCheckout((prev) => ({ ...prev, zipCode, address1, address2: "" }))
                }
              />
            </div>

            {/* 우편번호 (자동 입력) */}
            {checkout.zipCode && (
              <input
                style={{ marginTop: 8 }}
                placeholder="우편번호"
                value={checkout.zipCode}
                readOnly
              />
            )}

            {/* 기본주소 (자동 입력) */}
            <input
              style={{ marginTop: 8 }}
              placeholder="기본 주소 (검색 시 자동 입력)"
              value={checkout.address1}
              readOnly
            />

            {/* 상세주소 (직접 입력) */}
            <input
              style={{ marginTop: 8 }}
              placeholder="상세 주소 (선택 입력)"
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
