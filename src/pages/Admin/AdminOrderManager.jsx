import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { translateOrderStatus } from "../../utils/statusConverter";
import "./AdminOrderManager.css";

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  { value: "PAID", label: "결제완료" },
  { value: "SHIPPED", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CONFIRMED", label: "구매확정" },
  { value: "REFUNDED", label: "환불완료" },
  { value: "CANCELED", label: "주문취소" },
];

function toDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ko-KR");
}

export default function AdminOrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const loadOrders = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getOrders({
        page: targetPage,
        size: 20,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
      });
      const content = Array.isArray(res?.content) ? res.content : [];
      setOrders(content);
      setPage(Number(res?.number || 0));
      setTotalPages(Math.max(1, Number(res?.totalPages || 1)));
    } catch (e) {
      setOrders([]);
      setTotalPages(1);
      setError(e?.message || "주문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [keyword, page, statusFilter]);

  useEffect(() => {
    loadOrders(0);
  }, [loadOrders]);

  const openDetail = async (orderId) => {
    setError("");
    setMessage("");
    try {
      const detail = await adminApi.getOrder(orderId);
      setSelectedOrder(detail);
      setTrackingNumber(detail?.trackingNumber || "");
    } catch (e) {
      setError(e?.message || "주문 상세를 불러오지 못했습니다.");
    }
  };

  const refreshDetail = async (orderId) => {
    const detail = await adminApi.getOrder(orderId);
    setSelectedOrder(detail);
    setTrackingNumber(detail?.trackingNumber || "");
  };

  const runAction = async (fn) => {
    if (!selectedOrder?.orderId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      await refreshDetail(selectedOrder.orderId);
      await loadOrders(page);
      setMessage("주문 상태가 변경되었습니다.");
    } catch (e) {
      setError(e?.message || "주문 상태 변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const canShip = selectedOrder?.status === "PAID";
  const canDeliver = selectedOrder?.status === "SHIPPED";
  const canConfirm = selectedOrder?.status === "DELIVERED";

  const selectedTitle = useMemo(
    () => (selectedOrder ? `주문 #${selectedOrder.orderId}` : "입력 대기"),
    [selectedOrder]
  );

  return (
    <div className="admin-order-wrap">
      <div className="admin-oneday-head">
        <div>
          <h2>주문 관리</h2>
          <p>결제완료 → 배송중 → 배송완료 → 구매확정 단계로 주문 상태를 관리합니다.</p>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-oneday-grid">
        <section className="admin-oneday-panel">
          <h3>주문 목록</h3>
          <div className="admin-class-panel-actions">
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              className="admin-input"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="주문번호/수령인/송장 검색"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setKeyword(keywordInput.trim());
                  setPage(0);
                }
              }}
            />
            <button
              type="button"
              className="admin-btn-search"
              onClick={() => {
                setKeyword(keywordInput.trim());
                setPage(0);
              }}
              disabled={loading}
            >
              검색
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>상태</th>
                  <th>수령인</th>
                  <th>송장번호</th>
                  <th>결제금액</th>
                  <th>주문일시</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-class-empty-row">
                      주문 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((item) => (
                    <tr
                      key={item.orderId}
                      className={selectedOrder?.orderId === item.orderId ? "admin-order-row-active" : ""}
                      onClick={() => openDetail(item.orderId)}
                    >
                      <td>{item.orderId}</td>
                      <td>{translateOrderStatus(item.status)}</td>
                      <td>{item.receiverName || "-"}</td>
                      <td>{item.trackingNumber || "-"}</td>
                      <td>{Number(item.totalPrice || 0).toLocaleString("ko-KR")}원</td>
                      <td>{toDate(item.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="class-list-pagination">
            <button
              type="button"
              className="btn-ghost"
              disabled={page <= 0 || loading}
              onClick={() => loadOrders(Math.max(page - 1, 0))}
            >
              이전
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-ghost"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => loadOrders(Math.min(page + 1, totalPages - 1))}
            >
              다음
            </button>
          </div>
        </section>

        <section className="admin-oneday-panel">
          <h3>{selectedTitle}</h3>
          {!selectedOrder ? (
            <div className="muted">좌측 주문을 선택해 상태를 변경하세요.</div>
          ) : (
            <div className="admin-order-detail">
              <div>상태: <b>{translateOrderStatus(selectedOrder.status)}</b></div>
              <div>수령인: {selectedOrder.receiverName} / {selectedOrder.receiverPhone}</div>
              <div>주소: {selectedOrder.address1} {selectedOrder.address2 || ""}</div>
              <div>결제완료: {toDate(selectedOrder.paidAt)}</div>
              <div>배송중 처리: {toDate(selectedOrder.shippedAt)}</div>
              <div>배송완료 처리: {toDate(selectedOrder.deliveredAt)}</div>
              <div>구매확정 처리: {toDate(selectedOrder.confirmedAt)}</div>
              <div>현재 송장번호: {selectedOrder.trackingNumber || "-"}</div>

              <div className="admin-order-actions">
                <input
                  className="admin-input"
                  placeholder="송장번호 입력"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={!canShip || busy}
                />
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!canShip || busy}
                  onClick={() =>
                    runAction(() => adminApi.shipOrder(selectedOrder.orderId, trackingNumber.trim()))
                  }
                >
                  출고처리
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={!canDeliver || busy}
                  onClick={() => runAction(() => adminApi.deliverOrder(selectedOrder.orderId))}
                >
                  배송완료
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={!canConfirm || busy}
                  onClick={() => runAction(() => adminApi.confirmOrder(selectedOrder.orderId))}
                >
                  구매확정
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
