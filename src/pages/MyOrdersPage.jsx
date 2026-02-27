import { useEffect, useState } from "react";
import { cancelOrder, deliverMyOrder, fetchMyOrders, fetchOrder } from "../api/orders";
import { createProductInquiry } from "../api/productInquiries";
import { toErrorMessage } from "../api/http";
import { translateOrderStatus } from "../utils/statusConverter";
import "./MyOrdersPage.css";

function toDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ko-KR");
}

function toDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("ko-KR");
}

export default function MyOrdersPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [period, setPeriod] = useState("ALL");
  const [status, setStatus] = useState("");

  const calculateDateRange = (p) => {
    if (p === "ALL") return { startDate: null, endDate: null };
    const end = new Date();
    const start = new Date();
    if (p === "1M") start.setMonth(end.getMonth() - 1);
    if (p === "3M") start.setMonth(end.getMonth() - 3);
    if (p === "6M") start.setMonth(end.getMonth() - 6);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const load = async (targetPage) => {
    setBusy(true);
    setErr("");
    try {
      const { startDate, endDate } = calculateDateRange(period);
      const res = await fetchMyOrders({
        page: targetPage,
        size: 10,
        startDate,
        endDate,
        status: status || null,
      });
      setData(res);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page, period, status]);

  return (
    <div className="my-orders-page">
      <h2 className="page-title">주문/배송 조회</h2>

      <div className="filter-section">
        <div className="filter-group">
          <label>조회 기간</label>
          <div className="btn-group">
            {["ALL", "1M", "3M", "6M"].map((p) => (
              <button
                key={p}
                className={`filter-btn ${period === p ? "active" : ""}`}
                onClick={() => {
                  setPeriod(p);
                  setPage(0);
                }}
              >
                {p === "ALL" ? "전체" : p === "1M" ? "1개월" : p === "3M" ? "3개월" : "6개월"}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>주문 상태</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">전체 상태</option>
            <option value="PAID">결제완료</option>
            <option value="SHIPPED">배송중</option>
            <option value="DELIVERED">배송완료</option>
            <option value="CONFIRMED">구매확정</option>
            <option value="CANCELED">취소</option>
            <option value="REFUNDED">환불</option>
          </select>
        </div>
      </div>

      {err && <div className="error-msg">{err}</div>}
      {busy && !data && <div className="loading-msg">불러오는 중...</div>}
      {!data && !busy && !err && <div className="empty-msg">주문 내역이 없습니다.</div>}

      {data ? (
        <>
          {data.content.length === 0 ? (
            <div className="empty-msg">조건에 맞는 주문이 없습니다.</div>
          ) : (
            <div className="order-list">
              {data.content.map((o) => (
                <div key={o.orderId} className="order-item">
                  <div className="order-header">
                    <span className="order-date">{toDateOnly(o.createdAt)}</span>
                    <span className="order-id">주문번호 {o.orderId}</span>
                    <button className="btn-detail" onClick={() => setSelectedOrderId(o.orderId)}>
                      상세보기 &gt;
                    </button>
                  </div>
                  <div className="order-body">
                    <div className="order-thumb">
                      {o.firstItemThumbnailUrl ? (
                        <img src={o.firstItemThumbnailUrl} alt={o.firstItemName} />
                      ) : (
                        <div className="no-img">이미지 없음</div>
                      )}
                    </div>
                    <div className="order-info">
                      <div className={`order-status status-${o.status}`}>{translateOrderStatus(o.status)}</div>
                      <div className="order-title">
                        {o.firstItemName} {o.itemCount > 1 ? `외 ${o.itemCount - 1}건` : ""}
                      </div>
                      <div className="order-price">{Number(o.totalPrice || 0).toLocaleString("ko-KR")}원</div>
                    </div>
                    <div className="order-actions">
                      <button className="btn-action primary" onClick={() => setSelectedOrderId(o.orderId)}>
                        주문상세
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.totalPages > 1 ? (
            <div className="pagination">
              <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                이전
              </button>
              <span className="page-info">
                {data.number + 1} / {data.totalPages}
              </span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                다음
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {selectedOrderId ? (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onUpdated={() => load(page)}
        />
      ) : null}
    </div>
  );
}

function OrderDetailModal({ orderId, onClose, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setError("");
      try {
        const data = await fetchOrder(orderId);
        if (!ignore) setOrder(data);
      } catch (e) {
        if (!ignore) setError(toErrorMessage(e));
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [orderId]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const runAction = async (fn) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await fn();
      if (updated) setOrder(updated);
      if (onUpdated) onUpdated();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitOrderInquiry = async (typeLabel) => {
    if (!order?.items?.length) {
      setError("문의 가능한 주문 상품이 없습니다.");
      return;
    }
    const productId = order.items[0]?.productId;
    if (!productId) {
      setError("문의 가능한 상품 ID를 찾지 못했습니다.");
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

  if (!order) {
    return (
      <div className="order-modal-backdrop" onClick={onClose}>
        <div className="order-modal" onClick={(e) => e.stopPropagation()}>
          <div className="order-modal-loading">주문 상세를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const canCancel = order.status === "PAID";
  const isShipped = order.status === "SHIPPED";
  const isDelivered = order.status === "DELIVERED";
  const isConfirmed = order.status === "CONFIRMED";

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <section className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-head">
          <div>
            <h3>주문 상세 #{order.orderId}</h3>
            <p>{translateOrderStatus(order.status)} 상태</p>
          </div>
          <button type="button" className="order-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>

        {error ? <div className="order-modal-alert error">{error}</div> : null}
        {message ? <div className="order-modal-alert ok">{message}</div> : null}

        <div className="order-modal-grid">
          <article className="order-modal-card">
            <h4>배송 정보</h4>
            <div className="row"><span>수령인</span><b>{order.receiverName}</b></div>
            <div className="row"><span>연락처</span><b>{order.receiverPhone}</b></div>
            <div className="row"><span>주소</span><b>{order.address1} {order.address2 || ""}</b></div>
            <div className="row"><span>송장번호</span><b>{order.trackingNumber || "-"}</b></div>
          </article>
          <article className="order-modal-card">
            <h4>처리 이력</h4>
            <div className="row"><span>결제완료</span><b>{toDate(order.paidAt)}</b></div>
            <div className="row"><span>배송중</span><b>{toDate(order.shippedAt)}</b></div>
            <div className="row"><span>배송완료</span><b>{toDate(order.deliveredAt)}</b></div>
            <div className="row"><span>구매확정</span><b>{toDate(order.confirmedAt)}</b></div>
          </article>
        </div>

        <article className="order-modal-card">
          <h4>주문 상품</h4>
          <div className="order-modal-items">
            {order.items.map((it) => (
              <div key={it.orderItemId} className="order-modal-item">
                {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.productName} /> : <div className="thumb-placeholder">이미지 없음</div>}
                <div className="meta">
                  <strong>{it.productName}</strong>
                  <p>{Number(it.orderPrice || 0).toLocaleString("ko-KR")}원 x {it.quantity}</p>
                  <b>{Number(it.lineTotal || 0).toLocaleString("ko-KR")}원</b>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="order-modal-card">
          <h4>가능한 작업</h4>
          <div className="order-modal-actions">
            {canCancel ? (
              <>
                <input
                  className="order-modal-input"
                  placeholder="결제취소 사유를 입력해 주세요."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="action danger"
                  disabled={busy || !cancelReason.trim()}
                  onClick={() => runAction(() => cancelOrder(order.orderId, cancelReason.trim()))}
                >
                  결제취소
                </button>
              </>
            ) : null}

            {isShipped ? (
              <>
                <button
                  type="button"
                  className="action"
                  disabled={busy}
                  onClick={() => runAction(() => deliverMyOrder(order.orderId))}
                >
                  배송완료 처리
                </button>
                <button type="button" className="action" disabled={busy} onClick={() => submitOrderInquiry("배송 문의")}>
                  문의하기
                </button>
              </>
            ) : null}

            {isDelivered ? (
              <>
                <button type="button" className="action" disabled={busy} onClick={() => submitOrderInquiry("교환 요청")}>
                  교환 요청
                </button>
                <button type="button" className="action" disabled={busy} onClick={() => submitOrderInquiry("환불 요청")}>
                  환불 요청
                </button>
                <button type="button" className="action" disabled={busy} onClick={() => submitOrderInquiry("주문 문의")}>
                  문의하기
                </button>
              </>
            ) : null}

            {isConfirmed ? (
              <button type="button" className="action" disabled={busy} onClick={() => submitOrderInquiry("주문 문의")}>
                문의하기
              </button>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
