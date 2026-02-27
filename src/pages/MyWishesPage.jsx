import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyWishes as fetchProductWishes, toggleWish as toggleProductWish } from "../api/productWishes";
import { fetchMyWishes as fetchRecipeWishes, toggleWish as toggleRecipeWish } from "../api/recipeApi";
import { getMyOneDayWishes, toggleOneDayWish } from "../api/onedayApi";
import { toErrorMessage } from "../api/http";
import { toBackendUrl } from "../utils/backendUrl";
import "./MyWishesPage.css";

const WISH_SOURCE = {
  ALL: "ALL",
  RECIPE: "RECIPE",
  PRODUCT: "PRODUCT",
  CLASS: "CLASS",
};

async function fetchAllProductWishes(pageSize = 50) {
  const first = await fetchProductWishes(0, pageSize);
  const totalPages = Number(first?.totalPages ?? 1);
  const merged = [...(first?.content ?? [])];

  for (let page = 1; page < totalPages; page += 1) {
    const next = await fetchProductWishes(page, pageSize);
    merged.push(...(next?.content ?? []));
  }

  return merged;
}

function toRecipePage(response) {
  if (!response) return { content: [], totalPages: 1 };
  if (Array.isArray(response?.content)) return response;
  if (response?.success && response?.data) return response.data;
  if (response?.data && Array.isArray(response.data?.content)) return response.data;
  return { content: [], totalPages: 1 };
}

async function fetchAllRecipeWishes(pageSize = 50) {
  const firstResponse = await fetchRecipeWishes(0, pageSize);
  const first = toRecipePage(firstResponse);
  const totalPages = Number(first?.totalPages ?? 1);
  const merged = [...(first?.content ?? [])];

  for (let page = 1; page < totalPages; page += 1) {
    const nextResponse = await fetchRecipeWishes(page, pageSize);
    const next = toRecipePage(nextResponse);
    merged.push(...(next?.content ?? []));
  }

  return merged;
}

function toMillis(value) {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function formatDate(value) {
  if (!value) return "일시 정보 없음";
  const ms = toMillis(value);
  if (!ms) return String(value);
  return new Date(ms).toLocaleString("ko-KR");
}

function sourceLabel(source) {
  if (source === WISH_SOURCE.RECIPE) return "레시피";
  if (source === WISH_SOURCE.PRODUCT) return "상품";
  if (source === WISH_SOURCE.CLASS) return "클래스";
  return "전체";
}

function normalizeRecipeWishes(list) {
  return (list ?? []).map((item) => ({
    id: `RECIPE-${item.wishId ?? item.id}`,
    source: WISH_SOURCE.RECIPE,
    wishId: item.wishId,
    targetId: item.id,
    title: item.title || `레시피 #${item.id}`,
    subtitle: "레시피 찜",
    imageUrl: item.mainImage ? toBackendUrl(`/images/recipe/${item.mainImage}`) : "",
    wishedAt: null,
  }));
}

function normalizeProductWishes(list) {
  return (list ?? []).map((item) => ({
    id: `PRODUCT-${item.wishId}`,
    source: WISH_SOURCE.PRODUCT,
    wishId: item.wishId,
    targetId: item.productId,
    title: item.name || `상품 #${item.productId}`,
    subtitle: `${Number(item.price ?? 0).toLocaleString("ko-KR")}원`,
    imageUrl: item.thumbnailUrl || "",
    wishedAt: item.createdAt || null,
  }));
}


function normalizeClassWishes(list) {
  return (list ?? []).map((item) => ({
    id: `CLASS-${item.wishId}`,
    source: WISH_SOURCE.CLASS,
    wishId: item.wishId,
    targetId: item.classProductId,
    title: item.classTitle || `클래스 #${item.classProductId}`,
    subtitle: "원데이 클래스 찜",
    imageUrl: "",
    wishedAt: item.wishedAt || null,
  }));
}

export default function MyWishesPage() {
  const nav = useNavigate();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sourceFilter, setSourceFilter] = useState(WISH_SOURCE.ALL);

  const [productWishes, setProductWishes] = useState([]);
  const [recipeWishes, setRecipeWishes] = useState([]);
  const [classWishes, setClassWishes] = useState([]);

  const load = async () => {
    setBusy(true);
    setErr("");

    const [productRes, recipeRes, classRes] = await Promise.allSettled([
      fetchAllProductWishes(),
      fetchAllRecipeWishes(),
      getMyOneDayWishes(),
    ]);

    const messages = [];

    if (productRes.status === "fulfilled") {
      setProductWishes(normalizeProductWishes(productRes.value));
    } else {
      setProductWishes([]);
      messages.push(`상품 찜 조회 실패: ${toErrorMessage(productRes.reason)}`);
    }

    if (recipeRes.status === "fulfilled") {
      setRecipeWishes(normalizeRecipeWishes(recipeRes.value));
    } else {
      setRecipeWishes([]);
      messages.push(`레시피 찜 조회 실패: ${toErrorMessage(recipeRes.reason)}`);
    }

    if (classRes.status === "fulfilled") {
      setClassWishes(normalizeClassWishes(classRes.value));
    } else {
      setClassWishes([]);
      messages.push(`클래스 찜 조회 실패: ${toErrorMessage(classRes.reason)}`);
    }

    setErr(messages.join("\n"));
    setBusy(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sourceStats = useMemo(() => {
    return {
      ALL: productWishes.length + recipeWishes.length + classWishes.length,
      PRODUCT: productWishes.length,
      RECIPE: recipeWishes.length,
      CLASS: classWishes.length,
    };
  }, [productWishes, recipeWishes, classWishes]);

  const mergedWishes = useMemo(() => {
    const all = [...productWishes, ...recipeWishes, ...classWishes];
    all.sort((a, b) => toMillis(b.wishedAt) - toMillis(a.wishedAt));

    if (sourceFilter === WISH_SOURCE.ALL) return all;
    return all.filter((item) => item.source === sourceFilter);
  }, [productWishes, recipeWishes, classWishes, sourceFilter]);

  const removeWish = async (item) => {
    if (!window.confirm(`${sourceLabel(item.source)} 찜을 해제할까요?`)) return;

    setBusy(true);
    setErr("");
    try {
      if (item.source === WISH_SOURCE.PRODUCT) {
        await toggleProductWish(item.targetId);
      } else if (item.source === WISH_SOURCE.RECIPE) {
        await toggleRecipeWish(item.targetId);
      } else if (item.source === WISH_SOURCE.CLASS) {
        await toggleOneDayWish(item.targetId);
      }
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const moveToTarget = (item) => {
    if (item.source === WISH_SOURCE.PRODUCT) {
      nav(`/products/${item.targetId}`);
      return;
    }
    if (item.source === WISH_SOURCE.RECIPE) {
      nav(`/recipes/${item.targetId}`);
      return;
    }
    if (item.source === WISH_SOURCE.CLASS) {
      nav(`/classes/oneday/classes/${item.targetId}`);
    }
  };

  return (
    <div className="my-wish-page">
      <header className="my-wish-hero">
        <h1>찜 목록</h1>
        <p>상품, 레시피, 클래스를 한 곳에서 관리하세요.</p>
      </header>

      {err ? (
        <div className="my-wish-alert" style={{ whiteSpace: "pre-line" }}>
          {err}
        </div>
      ) : null}

      <section className="my-wish-toolbar">
        <div className="my-wish-filter">
          {[
            { value: WISH_SOURCE.ALL, label: "전체" },
            { value: WISH_SOURCE.RECIPE, label: "레시피" },
            { value: WISH_SOURCE.PRODUCT, label: "마켓" },
            { value: WISH_SOURCE.CLASS, label: "클래스" },
          ].map((tab) => (
            <button
              key={`wish-filter-${tab.value}`}
              type="button"
              className={sourceFilter === tab.value ? "wish-filter-btn is-active" : "wish-filter-btn"}
              onClick={() => setSourceFilter(tab.value)}
            >
              {tab.label} ({sourceStats[tab.value]})
            </button>
          ))}
        </div>
        <button type="button" className="wish-refresh-btn" disabled={busy} onClick={load}>
          {busy ? "불러오는 중..." : "새로고침"}
        </button>
      </section>

      {mergedWishes.length === 0 ? (
        <section className="my-wish-empty">
          <strong>찜한 항목이 없습니다.</strong>
          <p>마음에 드는 상품/레시피/클래스를 찜해두면 여기에서 확인할 수 있습니다.</p>
        </section>
      ) : (
        <section className="my-wish-list">
          {mergedWishes.map((item) => (
            <article key={item.id} className="my-wish-card">
              <div className="wish-card-left">
                <div className="wish-thumb-wrap">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="wish-thumb" />
                  ) : (
                    <div className="wish-thumb-placeholder">{sourceLabel(item.source)}</div>
                  )}
                </div>
                <div className="wish-info">
                  <div className="wish-source-badge">{sourceLabel(item.source)}</div>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                  <span>찜한 시각: {formatDate(item.wishedAt)}</span>
                </div>
              </div>

              <div className="wish-card-actions">
                <button type="button" className="wish-ghost-btn" onClick={() => moveToTarget(item)}>
                  상세 보기
                </button>
                <button type="button" className="wish-danger-btn" disabled={busy} onClick={() => removeWish(item)}>
                  찜 해제
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
