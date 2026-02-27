import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminProducts,
  fetchProductReviewsByProduct,
} from "../../api/adminProductApi";

function toDateText(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR");
}

function renderStars(value) {
  const score = Math.max(1, Math.min(5, Number(value || 0)));
  return "★".repeat(score) + "☆".repeat(5 - score);
}

export default function AdminProductReviewManager() {
  const [viewMode, setViewMode] = useState("byProduct");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const loadProductOptions = useCallback(async () => {
    setLoadingProducts(true);
    setError("");
    try {
      const first = await fetchAdminProducts({ page: 0, size: 200, sort: "LATEST" });
      const firstList = Array.isArray(first?.content) ? first.content : [];
      const pages = Number(first?.totalPages || 1);
      if (pages <= 1) {
        setProducts(firstList);
        setSelectedProductId((prev) => (prev ? prev : String(firstList?.[0]?.id || "")));
        return;
      }
      const remainIdx = Array.from({ length: pages - 1 }, (_, idx) => idx + 1);
      const remains = await Promise.all(remainIdx.map((idx) => fetchAdminProducts({ page: idx, size: 200, sort: "LATEST" })));
      const merged = [...firstList];
      remains.forEach((pageRes) => {
        const content = Array.isArray(pageRes?.content) ? pageRes.content : [];
        merged.push(...content);
      });
      setProducts(merged);
      setSelectedProductId((prev) => (prev ? prev : String(merged?.[0]?.id || "")));
    } catch (e) {
      setError(e?.message || "상품 목록을 불러오지 못했습니다.");
      setProducts([]);
      setSelectedProductId("");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadByProduct = useCallback(async (productId) => {
    const idNum = Number(productId || 0);
    if (!idNum) {
      setReviews([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const page = await fetchProductReviewsByProduct(idNum, 0, 100, {
        sort: "LATEST",
        keyword: keyword || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
      });
      const list = Array.isArray(page?.content) ? page.content : [];
      const productInfo = products.find((item) => Number(item?.id) === idNum);
      const productName = productInfo?.name || `상품 #${idNum}`;
      const normalized = list.map((item) => ({
        ...item,
        productName,
      }));
      setReviews(normalized);
    } catch (e) {
      setError(e?.message || "상품 리뷰를 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, products, ratingFilter]);

  const loadAll = useCallback(async () => {
    if (products.length === 0) {
      setReviews([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await Promise.allSettled(
        products.map(async (product) => {
          const id = Number(product?.id || 0);
          if (!id) return [];
          const page = await fetchProductReviewsByProduct(id, 0, 100, {
            sort: "LATEST",
            keyword: keyword || undefined,
            rating: ratingFilter ? Number(ratingFilter) : undefined,
          });
          const list = Array.isArray(page?.content) ? page.content : [];
          return list.map((item) => ({
            ...item,
            productName: product?.name || `상품 #${id}`,
          }));
        })
      );
      const merged = result
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value);
      merged.sort((a, b) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setReviews(merged);
    } catch (e) {
      setError(e?.message || "전체 리뷰를 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, products, ratingFilter]);

  useEffect(() => {
    loadProductOptions();
  }, [loadProductOptions]);

  useEffect(() => {
    if (viewMode !== "byProduct") return;
    if (!selectedProductId) return;
    loadByProduct(selectedProductId);
  }, [loadByProduct, selectedProductId, viewMode]);

  useEffect(() => {
    if (viewMode !== "all") return;
    loadAll();
  }, [loadAll, viewMode]);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item?.id) === String(selectedProductId)),
    [products, selectedProductId]
  );

  return (
    <section className="admin-class-panel">
      <div className="admin-class-panel-head">
        <h3>상품 리뷰 관리</h3>
        <div className="admin-class-view-toggle">
          <button
            type="button"
            className={`admin-class-view-btn ${viewMode === "byProduct" ? "active" : ""}`}
            onClick={() => setViewMode("byProduct")}
          >
            상품별 보기
          </button>
          <button
            type="button"
            className={`admin-class-view-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            전체 보기
          </button>
        </div>
        <div className="admin-class-panel-actions">
          {viewMode === "byProduct" ? (
            <select
              className="admin-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loadingProducts || products.length === 0}
            >
              {products.length === 0 ? <option value="">상품 없음</option> : null}
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || `상품 #${item.id}`}
                </option>
              ))}
            </select>
          ) : null}
          <select className="admin-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="">전체 평점</option>
            <option value="5">5점</option>
            <option value="4">4점</option>
            <option value="3">3점</option>
            <option value="2">2점</option>
            <option value="1">1점</option>
          </select>
          <input
            className="admin-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="리뷰 키워드 검색"
          />
          <button
            type="button"
            className="admin-btn-search"
            onClick={() => (viewMode === "all" ? loadAll() : loadByProduct(selectedProductId))}
            disabled={loading}
          >
            {loading ? "조회 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {selectedProduct && viewMode === "byProduct" ? (
        <div className="admin-class-selected-info">
          선택 상품: {selectedProduct.name || "-"} (ID: {selectedProduct.id})
        </div>
      ) : null}
      {viewMode === "all" ? (
        <div className="admin-class-selected-info">
          전체 상품 리뷰를 최신순으로 모아서 보여줍니다.
        </div>
      ) : null}
      {error ? <div className="admin-class-msg admin-class-msg-error">{error}</div> : null}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상품</th>
              <th>리뷰 ID</th>
              <th>작성자</th>
              <th>평점</th>
              <th>내용</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-class-empty-row">
                  리뷰 내역이 없습니다.
                </td>
              </tr>
            ) : (
              reviews.map((item) => (
                <tr key={`product-review-${item?.revId}-${item?.productId}`}>
                  <td>
                    {item?.productName || `상품 #${item?.productId ?? "-"}`} (ID: {item?.productId ?? "-"})
                  </td>
                  <td>{item?.revId ?? "-"}</td>
                  <td>{item?.userId ?? "-"}</td>
                  <td>
                    {renderStars(item?.rating)} ({item?.rating ?? 0}점)
                  </td>
                  <td className="admin-class-ellipsis" title={item?.content || ""}>
                    {item?.content || "-"}
                  </td>
                  <td>{toDateText(item?.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="muted">
        현재 백엔드에는 상품 리뷰 관리자 답변/삭제 전용 API가 없어 조회 중심으로 구성되어 있습니다.
      </div>
    </section>
  );
}
