import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { fetchProducts } from "../api/products";
import { toErrorMessage } from "../api/http";
import BannerSection, { marketBannerSlides } from "../components/BannerSection";


const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "INGREDIENT", label: "재료" },
  { value: "MEAL_KIT", label: "밀키트" },
  { value: "KITCHEN_SUPPLY", label: "주방용품" },
];

const SORTS = [
  { value: "LATEST", label: "추천순" },
  { value: "PRICE_ASC", label: "낮은 가격순" },
  { value: "PRICE_DESC", label: "높은 가격순" },
];

export default function ProductsPage() {


  const [category, setCategory] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("LATEST");
  const [page, setPage] = useState(0);
  const [size] = useState(12);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const params = useMemo(() => {
    const p = { page, size, sort };
    if (category !== "ALL") p.category = category;
    if (keyword.trim()) p.keyword = keyword.trim();
    return p;
  }, [category, keyword, page, size, sort]);

  useEffect(() => {
    let ignore = false;
    fetchProducts(params)
      .then((d) => {
        if (!ignore) {
          setData(d);
          setErr("");
        }
      })
      .catch((e) => { if (!ignore) setErr(toErrorMessage(e)); });
    return () => { ignore = true; };
  }, [params]);

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div>
      <BannerSection slides={marketBannerSlides} interval={4500} />



      <h1>상품</h1>

      <div className="toolbar">
        <div className="tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={c.value === category ? "tab active" : "tab"}
              onClick={() => { setCategory(c.value); setPage(0); }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="filters">
          <input
            value={keyword}
            placeholder="검색(상품명)"
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setPage(0); }}
          />
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="grid">
        {content.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
