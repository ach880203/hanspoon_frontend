import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../api/orders";
import { toErrorMessage } from "../api/http";
import "./MyOrdersPage.css";

export default function MyOrdersPage() {
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Filters
  const [period, setPeriod] = useState("ALL"); // ALL, 1M, 3M, 6M
  const [status, setStatus] = useState(""); // ""(ALL), PAID, SHIPPING, DELIVERED, CANCELED

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setPage(0); // Reset page on filter change
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(0);
  };

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

  const load = async (p) => {
    setBusy(true);
    setErr("");
    try {
      const { startDate, endDate } = calculateDateRange(period);
      const res = await fetchMyOrders({ page: p, size: 10, startDate, endDate, status: status || null });
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

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label>조회 기간</label>
          <div className="btn-group">
            {["ALL", "1M", "3M", "6M"].map((p) => (
              <button
                key={p}
                className={`filter-btn ${period === p ? "active" : ""}`}
                onClick={() => handlePeriodChange(p)}
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
            onChange={(e) => handleStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="">전체 상태</option>
            <option value="PAYMENT_COMPLETED">결제완료</option>
            <option value="PREPARING">상품준비중</option>
            <option value="SHIPPING">배송중</option>
            <option value="DELIVERED">배송완료</option>
            <option value="CANCELED">취소</option>
            <option value="REFUNDED">환불</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {err && <div className="error-msg">{err}</div>}
      {busy && !data && <div className="loading-msg">로딩 중...</div>}

      {!data && !busy && !err && <div className="empty-msg">주문 내역이 없습니다.</div>}

      {data && (
        <>
          {data.content.length === 0 ? (
            <div className="empty-msg">조건에 맞는 주문 내역이 없습니다.</div>
          ) : (
            <div className="order-list">
              {data.content.map((o) => (
                <div key={o.orderId} className="order-item">
                  <div className="order-header">
                    <span className="order-date">{new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="order-id">주문번호 {o.orderId}</span>
                    <button className="btn-detail" onClick={() => nav(`/orders/${o.orderId}`)}>상세보기 &gt;</button>
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
                      <div className={`order-status status-${o.status}`}>
                        {getStatusLabel(o.status)}
                      </div>
                      <div className="order-title">
                        {o.firstItemName} {o.itemCount > 1 && `외 ${o.itemCount - 1}건`}
                      </div>
                      <div className="order-price">
                        {o.totalPrice.toLocaleString()}원
                      </div>
                    </div>
                    <div className="order-actions">
                      {/* 상태별 액션 버튼 */}
                      <button className="btn-action primary" onClick={() => nav(`/orders/${o.orderId}`)}>
                        주문상세
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>이전</button>
              <span className="page-info">
                {data.number + 1} / {data.totalPages}
              </span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getStatusLabel(status) {
  const map = {
    CREATED: "주문 접수",
    PAYMENT_PENDING: "입금 대기",
    PAYMENT_COMPLETED: "결제 완료",
    PAID: "결제 완료",
    PREPARING: "상품 준비중",
    SHIPPING: "배송중",
    DELIVERED: "배송 완료",
    CANCELED: "취소 완료",
    REFUNDED: "환불 완료",
    CONFIRMED: "구매 확정"
  };
  return map[status] || status;
}

