import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminProduct,
  deleteProductImage,
  fetchAdminProductDetail,
  fetchAdminProducts,
  fetchProductImages,
  updateAdminProduct,
  uploadProductImages,
} from "../../api/adminProductApi";
import "./AdminProductManager.css";

const PAGE_SIZE = 20;
const BULK_FETCH_SIZE = 200;

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "전체 카테고리" },
  { value: "INGREDIENT", label: "식재료" },
  { value: "MEAL_KIT", label: "밀키트" },
  { value: "KITCHEN_SUPPLY", label: "주방용품" },
];

const SORT_OPTIONS = [
  { value: "LATEST", label: "최신순" },
  { value: "PRICE_ASC", label: "낮은가격순" },
  { value: "PRICE_DESC", label: "높은가격순" },
  { value: "STOCK_ASC", label: "재고적은순" },
  { value: "STOCK_DESC", label: "재고많은순" },
];

const EMPTY_FORM = {
  id: null,
  category: "INGREDIENT",
  name: "",
  price: "0",
  stock: "0",
};

function toPriceText(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function mapProductToForm(detail) {
  return {
    id: Number(detail?.id || 0) || null,
    category: detail?.category || "INGREDIENT",
    name: String(detail?.name || ""),
    price: String(detail?.price ?? 0),
    stock: String(detail?.stock ?? 0),
  };
}

function sortByStock(list, sort) {
  const copied = [...list];
  copied.sort((a, b) => {
    const diff = Number(a?.stock || 0) - Number(b?.stock || 0);
    if (diff !== 0) return sort === "STOCK_ASC" ? diff : -diff;
    return Number(b?.id || 0) - Number(a?.id || 0);
  });
  return copied;
}

function revokePreviewUrls(images) {
  (images || []).forEach((item) => {
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
}

export default function AdminProductManager() {
  const [mode, setMode] = useState("list");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortFilter, setSortFilter] = useState("LATEST");
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(new Set());
  const [repImageKey, setRepImageKey] = useState("");

  const loadProducts = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const category = categoryFilter === "ALL" ? undefined : categoryFilter;
      const baseParams = {
        category,
        keyword: keyword || undefined,
      };

      if (sortFilter === "STOCK_ASC" || sortFilter === "STOCK_DESC") {
        const first = await fetchAdminProducts({ ...baseParams, page: 0, size: BULK_FETCH_SIZE, sort: "LATEST" });
        const firstList = Array.isArray(first?.content) ? first.content : [];
        const pages = Number(first?.totalPages || 1);
        if (pages <= 1) {
          const sorted = sortByStock(firstList, sortFilter);
          const listTotalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
          const safePage = Math.min(page, listTotalPages - 1);
          setProducts(sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE));
          setTotalPages(listTotalPages);
          setTotalCount(sorted.length);
          if (safePage !== page) setPage(safePage);
          return;
        }

        const pageIndexes = Array.from({ length: pages - 1 }, (_, idx) => idx + 1);
        const remains = await Promise.all(
          pageIndexes.map((idx) =>
            fetchAdminProducts({ ...baseParams, page: idx, size: BULK_FETCH_SIZE, sort: "LATEST" })
          )
        );
        const merged = [...firstList];
        remains.forEach((chunk) => {
          const content = Array.isArray(chunk?.content) ? chunk.content : [];
          merged.push(...content);
        });

        const sorted = sortByStock(merged, sortFilter);
        const listTotalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
        const safePage = Math.min(page, listTotalPages - 1);
        setProducts(sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE));
        setTotalPages(listTotalPages);
        setTotalCount(sorted.length);
        if (safePage !== page) setPage(safePage);
        return;
      }

      const res = await fetchAdminProducts({
        ...baseParams,
        page,
        size: PAGE_SIZE,
        sort: sortFilter,
      });
      const content = Array.isArray(res?.content) ? res.content : [];
      setProducts(content);
      setTotalPages(Math.max(1, Number(res?.totalPages || 1)));
      setTotalCount(Number(res?.totalElements ?? content.length ?? 0));
    } catch (e) {
      setError(e?.message || "상품 목록을 불러오지 못했습니다.");
      setProducts([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoadingList(false);
    }
  }, [categoryFilter, keyword, page, sortFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetForm = useCallback(() => {
    setNewImages((prev) => {
      revokePreviewUrls(prev);
      return [];
    });
    setForm(EMPTY_FORM);
    setSelectedProductId(null);
    setExistingImages([]);
    setRemovedImageIds(new Set());
    setRepImageKey("");
  }, []);

  const openCreate = () => {
    setMode("create");
    setError("");
    setMessage("");
    resetForm();
  };

  const openEdit = useCallback(async (productId) => {
    setMode("edit");
    setLoadingDetail(true);
    setError("");
    setMessage("");
    try {
      const [detail, images] = await Promise.all([
        fetchAdminProductDetail(productId),
        fetchProductImages(productId),
      ]);
      setForm(mapProductToForm(detail));
      setSelectedProductId(Number(productId));
      setExistingImages(images);
      setNewImages((prev) => {
        revokePreviewUrls(prev);
        return [];
      });
      setRemovedImageIds(new Set());
      const rep = images.find((item) => item?.repYn);
      setRepImageKey(rep ? `existing-${rep.id}` : images.length > 0 ? `existing-${images[0].id}` : "");
    } catch (e) {
      setError(e?.message || "상품 상세 정보를 불러오지 못했습니다.");
      resetForm();
      setMode("list");
    } finally {
      setLoadingDetail(false);
    }
  }, [resetForm]);

  const visibleImageItems = useMemo(() => {
    const existing = existingImages
      .filter((item) => !removedImageIds.has(item.id))
      .map((item) => ({
        key: `existing-${item.id}`,
        type: "existing",
        id: item.id,
        src: item.imgUrl,
        name: item.originalName || `기존 이미지 #${item.id}`,
      }));
    const newly = newImages.map((item, index) => ({
      key: `new-${index}`,
      type: "new",
      index,
      src: item.previewUrl,
      name: item.file.name || `새 이미지 ${index + 1}`,
    }));
    return [...existing, ...newly];
  }, [existingImages, newImages, removedImageIds]);

  useEffect(() => {
    if (visibleImageItems.length === 0) {
      setRepImageKey("");
      return;
    }
    if (visibleImageItems.some((item) => item.key === repImageKey)) return;
    setRepImageKey(visibleImageItems[0].key);
  }, [repImageKey, visibleImageItems]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const next = files
      .filter((file) => String(file.type || "").startsWith("image/"))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setNewImages((prev) => [...prev, ...next]);
    event.target.value = "";
  };

  const removeImage = (item) => {
    if (item.type === "existing") {
      setRemovedImageIds((prev) => {
        const copied = new Set(prev);
        copied.add(item.id);
        return copied;
      });
      return;
    }
    setNewImages((prev) => {
      const target = prev[item.index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== item.index);
    });
  };

  const validate = () => {
    const trimmedName = String(form.name || "").trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!trimmedName) return "상품명을 입력해 주세요.";
    if (!Number.isFinite(price) || price < 0) return "가격은 0 이상으로 입력해 주세요.";
    if (!Number.isFinite(stock) || stock < 0) return "재고는 0 이상으로 입력해 주세요.";
    if (mode === "create" && visibleImageItems.length === 0) return "상품 이미지를 최소 1개 등록해 주세요.";
    return "";
  };

  const syncImageChanges = async (productId) => {
    const idsToDelete = Array.from(removedImageIds);
    for (const imageId of idsToDelete) {
      await deleteProductImage(productId, imageId);
    }

    if (newImages.length === 0) return;

    let repIndex = 0;
    if (repImageKey.startsWith("new-")) {
      repIndex = Number(repImageKey.replace("new-", "")) || 0;
    }
    await uploadProductImages(
      productId,
      newImages.map((item) => item.file),
      repIndex
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      category: form.category,
      name: String(form.name).trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createAdminProduct(payload);
        const createdId = Number(created?.id || 0);
        if (!createdId) {
          throw new Error("상품 생성 후 ID를 확인하지 못했습니다.");
        }
        await uploadProductImages(
          createdId,
          newImages.map((item) => item.file),
          repImageKey.startsWith("new-") ? Number(repImageKey.replace("new-", "")) || 0 : 0
        );
        setMessage("상품이 등록되었습니다.");
        setMode("edit");
        await openEdit(createdId);
      } else {
        const targetId = Number(form.id || selectedProductId || 0);
        if (!targetId) throw new Error("수정할 상품 ID가 없습니다.");
        await updateAdminProduct(targetId, payload);
        await syncImageChanges(targetId);
        setMessage("상품이 수정되었습니다.");
        await openEdit(targetId);
      }
      await loadProducts();
    } catch (e) {
      setError(e?.message || "상품 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const listTitle = useMemo(() => {
    const categoryLabel = CATEGORY_OPTIONS.find((item) => item.value === categoryFilter)?.label || "전체 카테고리";
    return `${categoryLabel} · ${totalCount}건`;
  }, [categoryFilter, totalCount]);

  return (
    <div className="admin-product-manager">
      <div className="admin-oneday-head">
        <div>
          <h2>상품 관리</h2>
          <p>좌측 목록에서 상품을 선택해 우측에서 전체 항목을 수정할 수 있습니다.</p>
        </div>
        <div className="admin-oneday-head-actions">
          <button type="button" className="btn-primary" onClick={openCreate}>
            상품 등록
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMode("list");
              resetForm();
              setError("");
              setMessage("");
            }}
          >
            선택 해제
          </button>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-oneday-grid">
        <section className="admin-oneday-panel">
          <h3>상품 목록</h3>
          <div className="admin-product-filter-row">
            <select
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => {
                setPage(0);
                setCategoryFilter(e.target.value);
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="admin-select"
              value={sortFilter}
              onChange={(e) => {
                setPage(0);
                setSortFilter(e.target.value);
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="admin-input"
              placeholder="상품명 검색"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(0);
                  setKeyword(keywordInput.trim());
                }
              }}
            />
            <button
              type="button"
              className="admin-btn-search"
              onClick={() => {
                setPage(0);
                setKeyword(keywordInput.trim());
              }}
              disabled={loadingList}
            >
              {loadingList ? "조회 중..." : "검색"}
            </button>
          </div>

          <div className="muted">{listTitle}</div>

          <div className="class-list">
            {products.length === 0 ? (
              <div className="admin-product-empty">표시할 상품이 없습니다.</div>
            ) : (
              products.map((item) => {
                const id = Number(item?.id || 0);
                const isActive = Number(form?.id || selectedProductId || 0) === id;
                return (
                  <article
                    key={`product-${id}`}
                    className={`class-row ${isActive ? "is-active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEdit(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openEdit(id);
                      }
                    }}
                  >
                    <div className="class-row-main">
                      <strong>{item?.name || `상품 #${id}`}</strong>
                      <div className="class-row-meta">
                        <span>{toPriceText(item?.price)}</span>
                        <span>재고 {Number(item?.stock || 0)}개</span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="class-list-pagination">
            <button
              type="button"
              className="btn-ghost"
              disabled={page <= 0 || loadingList}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              이전
            </button>
            <span>
              {page + 1} / {Math.max(1, totalPages)} 페이지
            </span>
            <button
              type="button"
              className="btn-ghost"
              disabled={page >= totalPages - 1 || loadingList}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            >
              다음
            </button>
          </div>
        </section>

        <section className="admin-oneday-panel">
          <h3>{mode === "create" ? "상품 등록" : mode === "edit" ? `상품 수정 #${form.id}` : "입력 대기"}</h3>
          {mode === "list" ? (
            <div className="muted">좌측 목록에서 상품을 선택하거나 "상품 등록" 버튼을 눌러주세요.</div>
          ) : loadingDetail ? (
            <div className="muted">상품 상세 정보를 불러오는 중입니다...</div>
          ) : (
            <form className="class-form" onSubmit={submit}>
              <div className="class-form-grid">
                <label>
                  <span>카테고리</span>
                  <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
                    {CATEGORY_OPTIONS.filter((item) => item.value !== "ALL").map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>상품명</span>
                  <input maxLength={100} value={form.name} onChange={(e) => setField("name", e.target.value)} />
                </label>
              </div>
              <div className="class-form-grid">
                <label>
                  <span>가격</span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                  />
                </label>
                <label>
                  <span>재고</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>상품 이미지</span>
                <input type="file" accept="image/*" multiple onChange={onChangeImageFiles} />
              </label>
              <div className="muted">이미지를 클릭해 대표 이미지를 지정할 수 있습니다.</div>

              {visibleImageItems.length === 0 ? (
                <div className="admin-product-empty">등록된 이미지가 없습니다.</div>
              ) : (
                <div className="preview-grid">
                  {visibleImageItems.map((item) => (
                    <div
                      key={item.key}
                      className={`preview-item admin-product-image-item ${
                        repImageKey === item.key ? "is-rep" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="admin-product-image-pick"
                        onClick={() => setRepImageKey(item.key)}
                        title="대표 이미지로 지정"
                      >
                        <img src={item.src} alt={item.name} />
                      </button>
                      <div className="admin-product-image-meta">
                        <span className="admin-product-image-name">{item.name}</span>
                        <button type="button" className="btn-danger" onClick={() => removeImage(item)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "처리 중..." : mode === "create" ? "등록하기" : "수정 저장"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setMode("list");
                    resetForm();
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
