import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, deliverOrder, fetchOrder, shipOrder } from "../api/orders";
import { toErrorMessage } from "../api/http";

export default function OrderPage() {
  const nav = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = async () => {
    setErr("");
    try {
      const o = await fetchOrder(orderId);
      setOrder(o);
    } catch (e) {
      setErr(toErrorMessage(e));
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const action = async (fn) => {
    setBusy(true);
    setErr("");
    try {
      const updated = await fn();
      setOrder(updated);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!order) return <div>불러오는 중...</div>;

  const canRefundReason = order.status === "PAID";

  return (
    <div>
      <h1>주문 #{order.orderId}</h1>
      {err && <div className="error">{err}</div>}

      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="badge">{order.status}</div>
            <div className="muted">총 결제금액: {order.totalPrice.toLocaleString()}원</div>
          </div>
          <div className="muted">
            생성일시: {String(order.createdAt || "")}
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="panelMini">
            <div><b>수령인 정보</b></div>
            <div>{order.receiverName} / {order.receiverPhone}</div>
            <div className="muted">{order.address1} {order.address2}</div>
          </div>
          <div className="panelMini">
            <div><b>처리 시각</b></div>
            <div className="muted">결제 시각: {String(order.paidAt || "")}</div>
            <div className="muted">출고 시각: {String(order.shippedAt || "")}</div>
            <div className="muted">배송완료 시각: {String(order.deliveredAt || "")}</div>
            <div className="muted">환불 시각: {String(order.refundedAt || "")}</div>
            {order.refundReason && <div className="muted">환불 사유: {order.refundReason}</div>}
          </div>
        </div>

        <h3 style={{ marginTop: 16 }}>주문 상품</h3>
        <div className="cartList">
          {order.items.map((it) => (
            <div key={it.orderItemId} className="cartItem">
              <div className="cartThumb">
                {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.productName} /> : <div className="thumbPlaceholder">이미지 없음</div>}
              </div>
              <div className="cartInfo">
                <div className="title">{it.productName}</div>
                <div className="muted">
                  {it.orderPrice.toLocaleString()}원 x {it.quantity} ={" "}
                  <b>{it.lineTotal.toLocaleString()}원</b>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3>주문 처리</h3>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button disabled={busy} onClick={() => nav("/payment", {
              state: {
                orderId: order.orderId,
                itemName: order.items[0]?.productName + (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""),
                amount: order.totalPrice
              }
            })}>결제하기</button>
            <button disabled={busy} onClick={() => action(() => shipOrder(order.orderId))}>출고 처리</button>
            <button disabled={busy} onClick={() => action(() => deliverOrder(order.orderId))}>배송 완료</button>

            {canRefundReason && (
              <>
                <input
                  placeholder="환불 사유 (결제완료 상태에서 필수)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ minWidth: 240 }}
                />
                <button className="danger" disabled={busy} onClick={() => action(() => cancelOrder(order.orderId, reason))}>
                  취소(환불)
                </button>
              </>
            )}

            {!canRefundReason && (
              <button className="danger" disabled={busy} onClick={() => action(() => cancelOrder(order.orderId, null))}>
                주문 취소
              </button>
            )}
          </div>

          <div className="muted" style={{ marginTop: 8 }}>
            정책: 출고/배송완료 이후에는 취소가 불가합니다. (반품은 다음 단계에서 처리)
          </div>
        </div>
      </div>
    </div>
  );
}

