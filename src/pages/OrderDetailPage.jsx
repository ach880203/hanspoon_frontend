import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, fetchOrder } from "../api/orders";
import { createProductInquiry } from "../api/productInquiries";
import { toErrorMessage } from "../api/http";
import { translateOrderStatus } from "../utils/statusConverter";

function toDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ko-KR");
}

export default function OrderPage() {
  const nav = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setErr("");
    try {
      const o = await fetchOrder(orderId);
      setOrder(o);
    } catch (e) {
      setErr(toErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const runAction = async (fn) => {
    setBusy(true);
    setErr("");
    setMessage("");
    try {
      const updated = await fn();
      if (updated) {
        setOrder(updated);
      } else {
        await load();
      }
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitOrderInquiry = async (typeLabel) => {
    if (!order?.items?.length) {
      setErr("문의 가능한 주문 상품이 없습니다.");
      return;
    }
    const productId = order.items[0]?.productId;
    if (!productId) {
      setErr("문의 가능한 상품 ID를 찾지 못했습니다.");
      return;
    }

    const input = window.prompt(`${typeLabel} 내용을 입력해 주세요.`, "");
    if (!input || !input.trim()) return;

    await runAction(async () => {
      const content = `[${typeLabel}] 주문 #${order.orderId}\n${input.trim()}`;
      await createProductInquiry(productId, { content, secret: true });
      setMessage(`${typeLabel}이(가) 접수되었습니다.`);
      return null;
    });
  };

  if (!order) return <div>불러오는 중...</div>;

  const canCancel = order.status === "PAID";
  const isShipped = order.status === "SHIPPED";
  const isDelivered = order.status === "DELIVERED";
  const isConfirmed = order.status === "CONFIRMED";

  return (
    <div>
      <h1>주문 #{order.orderId}</h1>
      {err && <div className="error">{err}</div>}
      {message && <div style={{ color: "#166534", marginBottom: 12 }}>{message}</div>}

      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="badge">{translateOrderStatus(order.status)}</div>
            <div className="muted">총 결제금액: {order.totalPrice.toLocaleString()}원</div>
          </div>
          <div className="muted">생성일시: {toDate(order.createdAt)}</div>
        </div>

        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="panelMini">
            <div><b>수령지 정보</b></div>
            <div>{order.receiverName} / {order.receiverPhone}</div>
            <div className="muted">{order.address1} {order.address2 || ""}</div>
            <div className="muted">송장번호: {order.trackingNumber || "-"}</div>
          </div>
          <div className="panelMini">
            <div><b>처리 시각</b></div>
            <div className="muted">결제 시각: {toDate(order.paidAt)}</div>
            <div className="muted">배송중 처리: {toDate(order.shippedAt)}</div>
            <div className="muted">배송완료 처리: {toDate(order.deliveredAt)}</div>
            <div className="muted">구매확정 처리: {toDate(order.confirmedAt)}</div>
            <div className="muted">환불 시각: {toDate(order.refundedAt)}</div>
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
                  {it.orderPrice.toLocaleString()}원 x {it.quantity} = <b>{it.lineTotal.toLocaleString()}원</b>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3>주문 처리</h3>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {canCancel ? (
              <>
                <input
                  placeholder="결제취소 사유"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ minWidth: 240 }}
                />
                <button
                  className="danger"
                  disabled={busy || !reason.trim()}
                  onClick={() => runAction(() => cancelOrder(order.orderId, reason.trim()))}
                >
                  결제취소
                </button>
              </>
            ) : null}

            {isShipped ? (
              <button disabled={busy} onClick={() => submitOrderInquiry("배송 문의")}>문의하기</button>
            ) : null}

            {isDelivered ? (
              <>
                <button disabled={busy} onClick={() => submitOrderInquiry("교환 요청")}>교환 요청</button>
                <button disabled={busy} onClick={() => submitOrderInquiry("환불 요청")}>환불 요청</button>
                <button disabled={busy} onClick={() => submitOrderInquiry("주문 문의")}>문의하기</button>
              </>
            ) : null}

            {isConfirmed ? (
              <button disabled={busy} onClick={() => submitOrderInquiry("주문 문의")}>문의하기</button>
            ) : null}

            <button className="ghost" disabled={busy} onClick={() => nav("/mypage/orders")}>목록으로</button>
          </div>
        </div>
      </div>
    </div>
  );
}
