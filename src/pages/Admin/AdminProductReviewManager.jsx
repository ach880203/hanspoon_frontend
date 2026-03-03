import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminProductReview,
  fetchAdminProducts,
  fetchProductReviewsByProduct,
} from "../../api/adminProductApi";

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "전체 카테고리" },
  { value: "INGREDIENT", label: "식재료" },
  { value: "MEAL_KIT", label: "밀키트" },
  { value: "KITCHEN_SUPPLY", label: "주방용품" },
];

const PRODUCT_SORT_OPTIONS = [
  { value: "LATEST", label: "최신순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
];

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

function sortProducts(list, sort) {
  const copied = [...list];
  copied.sort((a, b) => {
    if (sort === "PRICE_ASC") {
      const diff = Number(a?.price || 0) - Number(b?.price || 0);
      if (diff !== 0) return diff;
    } else if (sort === "PRICE_DESC") {
      const diff = Number(b?.price || 0) - Number(a?.price || 0);
      if (diff !== 0) return diff;
    }
    return Number(b?.id || 0) - Number(a?.id || 0);
  });
  return copied;
}

export default function AdminProductReviewManager() {
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reviews, setReviews] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [productSortFilter, setProductSortFilter] = useState("LATEST");
  const [productKeywordInput, setProductKeywordInput] = useState("");
  const [productKeyword, setProductKeyword] = useState("");

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [searchNonce, setSearchNonce] = useState(0);

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
      const remains = await Promise.all(
        remainIdx.map((idx) => fetchAdminProducts({ page: idx, size: 200, sort: "LATEST" }))
      );
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
      const page = await fetchProductReviewsByProduct(idNum, 0, 100, { sort: "LATEST" });
      const list = Array.isArray(page?.content) ? page.content : [];
      const productInfo = products.find((item) => Number(item?.id) === idNum);
      const productName = productInfo?.name || `상품 #${idNum}`;
      setReviews(
        list.map((item) => ({
          ...item,
          productName,
        }))
      );
    } catch (e) {
      setError(e?.message || "상품 리뷰를 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [products]);

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

  const removeReview = useCallback(async (revId) => {
    const idNum = Number(revId || 0);
    if (!idNum) return;
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;

    setDeletingId(idNum);
    setError("");
    try {
      await deleteAdminProductReview(idNum);
      if (viewMode === "all") {
        await loadAll();
      } else {
        await loadByProduct(selectedProductId);
      }
    } catch (e) {
      setError(e?.message || "리뷰 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }, [loadAll, loadByProduct, selectedProductId, viewMode]);

  const handleSearch = useCallback(() => {
    if (viewMode === "byProduct") {
      setProductKeyword((productKeywordInput || "").trim());
    } else {
      setKeyword((keywordInput || "").trim());
    }
    setSearchNonce((prev) => prev + 1);
  }, [keywordInput, productKeywordInput, viewMode]);

  useEffect(() => {
    loadProductOptions();
  }, [loadProductOptions]);

  useEffect(() => {
    if (viewMode !== "byProduct") return;
    if (!selectedProductId) return;
    loadByProduct(selectedProductId);
  }, [loadByProduct, searchNonce, selectedProductId, viewMode]);

  useEffect(() => {
    if (viewMode !== "all") return;
    loadAll();
  }, [loadAll, searchNonce, viewMode]);

  const filteredProducts = useMemo(() => {
    const kw = (productKeyword || "").toLowerCase();
    const list = products.filter((item) => {
      if (categoryFilter !== "ALL" && String(item?.category || "") !== categoryFilter) {
        return false;
      }
      if (!kw) return true;
      return String(item?.name || "").toLowerCase().includes(kw);
    });
    return sortProducts(list, productSortFilter);
  }, [categoryFilter, productKeyword, productSortFilter, products]);

  useEffect(() => {
    if (viewMode !== "byProduct") return;
    if (filteredProducts.length === 0) {
      setSelectedProductId("");
      setReviews([]);
      return;
    }
    const exists = filteredProducts.some((item) => String(item?.id) === String(selectedProductId));
    if (!exists) {
      setSelectedProductId(String(filteredProducts[0].id));
    }
  }, [filteredProducts, selectedProductId, viewMode]);

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
            className={`admin-class-view-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            전체 보기
          </button>
          <button
            type="button"
            className={`admin-class-view-btn ${viewMode === "byProduct" ? "active" : ""}`}
            onClick={() => setViewMode("byProduct")}
          >
            상품별 보기
          </button>
        </div>

        <div className="admin-class-panel-actions admin-review-actions">
          {viewMode === "byProduct" ? (
            <select
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <select className="admin-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="">전체 평점</option>
              <option value="5">5점</option>
              <option value="4">4점</option>
              <option value="3">3점</option>
              <option value="2">2점</option>
              <option value="1">1점</option>
            </select>
          )}

          {viewMode === "byProduct" ? (
            <select
              className="admin-select"
              value={productSortFilter}
              onChange={(e) => setProductSortFilter(e.target.value)}
            >
              {PRODUCT_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}

          {viewMode === "byProduct" ? (
            <input
              className="admin-input"
              value={productKeywordInput}
              onChange={(e) => setProductKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="상품명 검색"
            />
          ) : (
            <input
              className="admin-input"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="리뷰 키워드 검색"
            />
          )}

          <button
            type="button"
            className="admin-btn-search"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "조회 중..." : "검색"}
          </button>
        </div>
      </div>

      {viewMode === "byProduct" ? (
        <div className="admin-class-selected-info admin-review-product-picker">
          <span>조회 상품</span>
          <select
            className="admin-select admin-review-product-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            disabled={loadingProducts || filteredProducts.length === 0}
          >
            {filteredProducts.length === 0 ? <option value="">상품 없음</option> : null}
            {filteredProducts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || `상품 #${item.id}`}
              </option>
            ))}
          </select>
          {selectedProduct ? `선택 상품: ${selectedProduct.name || "-"} (ID: ${selectedProduct.id})` : "선택 상품 없음"}
        </div>
      ) : null}

      {viewMode === "all" ? (
        <div className="admin-class-selected-info">전체 상품 리뷰를 최신순으로 보여줍니다.</div>
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
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-class-empty-row">
                  리뷰 내역이 없습니다.
                </td>
              </tr>
            ) : (
              reviews.map((item) => {
                const revId = Number(item?.revId || 0);
                return (
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
                    <td>
                      <button
                        type="button"
                        className="admin-btn-sm admin-btn-sm-danger"
                        onClick={() => removeReview(revId)}
                        disabled={deletingId === revId}
                      >
                        {deletingId === revId ? "삭제 중..." : "삭제"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
