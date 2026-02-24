import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { fetchProducts } from "../../api/products";
import { toErrorMessage } from "../../api/http";
import "./ProductsPage.css";

const CATEGORIES = [
  { value: "ALL", label: "전체보기" },
  { value: "INGREDIENT", label: "재료" },
  { value: "MEAL_KIT", label: "밀키트" },
  { value: "KITCHEN_SUPPLY", label: "주방용품" },
];

const SORTS = [
  { value: "LATEST", label: "추천순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
];

const PAGE_SIZE = 40; // 4열 * 10줄

export default function ProductsPage() {
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("LATEST");

  // ✅ 입력값 / 적용값 분리 (Enter 누르거나 버튼으로 적용)
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 0, last: false });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const sentinelRef = useRef(null);

  // ✅ 요청 레이스 방지(이전 응답 무시)
  const requestSeqRef = useRef(0);

  const queryKey = useMemo(() => {
    // 필터 조건의 “키” (바뀌면 완전히 새 목록)
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

  // ✅ 데이터 로딩
  useEffect(() => {
    let alive = true;
    const mySeq = ++requestSeqRef.current;

    async function load() {
      setLoading(true);
      try {
        const d = await fetchProducts(params);

        // ✅ 최신 요청이 아니면 무시
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
    // ✅ queryKey 포함: 필터 바뀌면 같은 page라도 새로 로딩
  }, [queryKey, page]);

  // ✅ 무한 스크롤 (초기 로딩 끝난 뒤에만 page 증가)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        // ✅ 핵심 가드
        if (loading) return;
        if (!hasMore) return;
        if (items.length === 0) return; // 초기 page=0 결과가 있어야 다음 페이지 로딩

        setPage((p) => p + 1);
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, hasMore, items.length, queryKey]);

  // ✅ 필터 변경 공통 처리: page=0 / items 초기화 / meta reset / 에러 제거
  const resetAnd = (fn) => {
    fn();
    setPage(0);
    setItems([]);
    setMeta({ totalPages: 0, last: false });
    setErr("");
    // ✅ 이전 요청 무효화 (즉시)
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
            <div className="productsEyebrow">CATEGORY</div>
            <h1 className="productsTitle">상품</h1>
            <p className="productsSub">원하는 상품을 골라보세요.</p>
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
              placeholder="검색(상품명)"
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
          {loading && <div className="productsLoading">불러오는 중…</div>}
          {!loading && !hasMore && items.length > 0 && (
            <div className="productsEnd">마지막 상품입니다.</div>
          )}
          <div ref={sentinelRef} className="productsSentinel" />
        </div>
      </div>
    </div>
  );
}
