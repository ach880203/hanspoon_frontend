import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { fetchProducts } from "../../api/products";
import { toErrorMessage } from "../../api/http";
import "./ProductsPage.css";

const CATEGORIES = [
  { value: "ALL", label: "전체보기" },
  { value: "INGREDIENT", label: "식재료" },
  { value: "MEAL_KIT", label: "밀키트" },
  { value: "KITCHEN_SUPPLY", label: "주방용품" },
];

const SORTS = [
  { value: "LATEST", label: "최신순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
];

const PAGE_SIZE = 40;

export default function ProductsPage() {
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("LATEST");

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 0, last: false });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const sentinelRef = useRef(null);
  const requestSeqRef = useRef(0);

  const queryKey = useMemo(() => {
    return JSON.stringify({
      category,
      sort,
      keyword: keyword.trim(),
    });
  }, [category, sort, keyword]);

  const params = useMemo(() => {
    const p = { page, size: PAGE_SIZE, sort };
    if (category !== "ALL") p.category = category;
    if (keyword.trim()) p.keyword = keyword.trim();
    return p;
  }, [category, sort, keyword, page]);

  const hasMore = !meta.last;

  useEffect(() => {
    let alive = true;
    const mySeq = ++requestSeqRef.current;

    async function load() {
      setLoading(true);
      try {
        const d = await fetchProducts(params);

        if (!alive || mySeq !== requestSeqRef.current) return;

        const content = d?.content ?? [];
        const totalPages = d?.totalPages ?? 0;

        const last =
          typeof d?.last === "boolean"
            ? d.last
            : totalPages > 0
              ? page >= totalPages - 1
              : content.length < PAGE_SIZE;

        setMeta({ totalPages, last });
        setItems((prev) => (page === 0 ? content : [...prev, ...content]));
        setErr("");
      } catch (e) {
        if (alive && mySeq === requestSeqRef.current) setErr(toErrorMessage(e));
      } finally {
        if (alive && mySeq === requestSeqRef.current) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [queryKey, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        if (loading) return;
        if (!hasMore) return;
        if (items.length === 0) return;

        setPage((p) => p + 1);
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, hasMore, items.length, queryKey]);

  const resetAnd = (fn) => {
    fn();
    setPage(0);
    setItems([]);
    setMeta({ totalPages: 0, last: false });
    setErr("");
    requestSeqRef.current++;
  };

  const applySearch = () => {
    resetAnd(() => setKeyword(keywordInput.trim()));
  };

  return (
    <div className="productsPage">
      <div className="productsContainer">
        <div className="productsHero">
          <div>
            <div className="productsEyebrow">카테고리</div>
            <h1 className="productsTitle">상품</h1>
            <p className="productsSub">원하는 상품을 골라보세요</p>
          </div>

          <div className="productsHeroRight">
            <select
              className="productsSort"
              value={sort}
              onChange={(e) => resetAnd(() => setSort(e.target.value))}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="productsToolbar">
          <div className="productsTabs">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={c.value === category ? "tab active" : "tab"}
                onClick={() => resetAnd(() => setCategory(c.value))}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="productsSearch">
            <input
              value={keywordInput}
              placeholder="검색할 상품명"
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
            />
            <button type="button" className="searchBtn" onClick={applySearch}>
              검색
            </button>
          </div>
        </div>

        {err && <div className="productsError">{err}</div>}

        <div className="productsGrid">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        <div className="productsFooter">
          {loading && <div className="productsLoading">불러오는 중...</div>}
          {!loading && !hasMore && items.length > 0 && (
            <div className="productsEnd">마지막 상품입니다.</div>
          )}
          <div ref={sentinelRef} className="productsSentinel" />
        </div>
      </div>
    </div>
  );
}
