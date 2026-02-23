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

  if (!order) return <div>Loading...</div>;

  const canRefundReason = order.status === "PAID";

  return (
    <div>
      <h1>Order #{order.orderId}</h1>
      {err && <div className="error">{err}</div>}

      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="badge">{order.status}</div>
            <div className="muted">total: {order.totalPrice.toLocaleString()}원</div>
          </div>
          <div className="muted">
            created: {String(order.createdAt || "")}
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="panelMini">
            <div><b>Receiver</b></div>
            <div>{order.receiverName} / {order.receiverPhone}</div>
            <div className="muted">{order.address1} {order.address2}</div>
          </div>
          <div className="panelMini">
            <div><b>Timestamps</b></div>
            <div className="muted">paidAt: {String(order.paidAt || "")}</div>
            <div className="muted">shippedAt: {String(order.shippedAt || "")}</div>
            <div className="muted">deliveredAt: {String(order.deliveredAt || "")}</div>
            <div className="muted">refundedAt: {String(order.refundedAt || "")}</div>
            {order.refundReason && <div className="muted">reason: {order.refundReason}</div>}
          </div>
        </div>

        <h3 style={{ marginTop: 16 }}>Items</h3>
        <div className="cartList">
          {order.items.map((it) => (
            <div key={it.orderItemId} className="cartItem">
              <div className="cartThumb">
                {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.productName} /> : <div className="thumbPlaceholder">No</div>}
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
          <h3>Actions</h3>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button disabled={busy} onClick={() => nav("/payment", {
              state: {
                orderId: order.orderId,
                itemName: order.items[0]?.productName + (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""),
                amount: order.totalPrice
              }
            })}>PAY</button>
            <button disabled={busy} onClick={() => action(() => shipOrder(order.orderId))}>SHIP</button>
            <button disabled={busy} onClick={() => action(() => deliverOrder(order.orderId))}>DELIVER</button>

            {canRefundReason && (
              <>
                <input
                  placeholder="환불 사유 (PAID에서 필수)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ minWidth: 240 }}
                />
                <button className="danger" disabled={busy} onClick={() => action(() => cancelOrder(order.orderId, reason))}>
                  CANCEL(REFUND)
                </button>
              </>
            )}

            {!canRefundReason && (
              <button className="danger" disabled={busy} onClick={() => action(() => cancelOrder(order.orderId, null))}>
                CANCEL
              </button>
            )}
          </div>

          <div className="muted" style={{ marginTop: 8 }}>
            정책: SHIPPED/DELIVERED 이후에는 cancel 불가(반품은 다음 단계)
          </div>
        </div>
      </div>
    </div>
  );
}

