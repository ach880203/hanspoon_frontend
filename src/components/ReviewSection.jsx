import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createProductReview,
  fetchProductReviews,
  fetchProductReviewSummary,
} from "../api/productReviews";
import { toErrorMessage } from "../api/http";
import "./ReviewSection.css";

function formatDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString();
  } catch {
    return String(v);
  }
}

function StarsDisplay({ value = 0, size = 18 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="rvStarsDisp" aria-label={`별점 ${v}점`} style={{ fontSize: size }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < v ? "rvStar on" : "rvStar"}>★</span>
      ))}
    </div>
  );
}

function StarsPicker({ value = 5, onChange, disabled = false }) {
  const v = Math.max(1, Math.min(5, Number(value) || 5));
  return (
    <div className="rvStarsPick" aria-label={`별점 ${v}점`}>
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        const active = n <= v;
        return (
          <button
            key={n}
            type="button"
            className={active ? "rvStarBtn on" : "rvStarBtn"}
            onClick={() => onChange(n)}
            disabled={disabled}
            aria-label={`${n}점 선택`}
          >
            ★
          </button>
        );
      })}
      <span className="rvStarValue">{v}.0</span>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "BEST", label: "베스트순" },
  { value: "LATEST", label: "최신순" },
];

const RATING_FILTERS = [
  { value: "ALL", label: "모든 별점" },
  { value: "5", label: "5점" },
  { value: "4", label: "4점" },
  { value: "3", label: "3점" },
  { value: "2", label: "2점" },
  { value: "1", label: "1점" },
];

export default function ReviewSection({ productId }) {
  const nav = useNavigate();
  const loc = useLocation();

  const [data, setData] = useState(null); // Page<ReviewResponseDto>
  const [summary, setSummary] = useState(null); // {avgRating,totalCount,countsByRating}

  const [sort, setSort] = useState("BEST");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ rating: 5, content: "" });

  const page = data?.number ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const list = data?.content || [];

  const goLogin = () => {
    const returnUrl = encodeURIComponent(loc.pathname + loc.search);
    nav(`/login?returnUrl=${returnUrl}`);
  };

  const pageCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach((r) => {
      const v = Math.max(1, Math.min(5, Number(r.rating) || 0));
      if (v) counts[v] += 1;
    });
    return counts;
  }, [list]);

  const pageAvg = useMemo(() => {
    if (!list.length) return 0;
    const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / list.length) * 10) / 10;
  }, [list]);

  const totalCount = summary?.totalCount ?? data?.totalElements ?? list.length ?? 0;
  const avgRating = summary?.avgRating ?? pageAvg;
  const counts = summary?.countsByRating ?? pageCounts;

  const summaryNote =
    summary?.countsByRating ? "" : "※ 분포는 현재 페이지 기준(요약 API 추가 시 전체 기준으로 정확해져요)";

  const loadSummary = async () => {
    try {
      const s = await fetchProductReviewSummary(productId);
      setSummary(s);
    } catch {
      setSummary(null);
    }
  };

  const load = async (p = 0) => {
    setErr("");
    setLoading(true);
    try {
      const d = await fetchProductReviews(productId, p, 10, {
        sort,
        rating: ratingFilter === "ALL" ? undefined : Number(ratingFilter),
        keyword: keyword.trim() ? keyword.trim() : undefined,
      });
      setData(d);
    } catch (e) {
      if (e?.status === 401) return goLogin();
      setErr(toErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // productId 바뀌면 초기화
  useEffect(() => {
    setSort("BEST");
    setRatingFilter("ALL");
    setKeywordInput("");
    setKeyword("");
    setForm({ rating: 5, content: "" });
    load(0);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // 정렬/필터/검색 적용 시 0페이지부터 다시
  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, ratingFilter, keyword]);

  const applySearch = () => setKeyword(keywordInput.trim());

  const submit = async () => {
    const content = form.content.trim();
    if (!content) return setErr("리뷰 내용을 입력해 주세요.");

    setBusy(true);
    setErr("");
    try {
      await createProductReview(productId, { ...form, content });
      setForm({ rating: 5, content: "" });
      await load(0);
      await loadSummary();
    } catch (e) {
      if (e?.status === 401) return goLogin(); // ✅ 로그인 필요
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // 그래프용(쿠팡 스타일: 5->1)
  const rows = [
    { key: 5, label: "최고" },
    { key: 4, label: "좋음" },
    { key: 3, label: "보통" },
    { key: 2, label: "별로" },
    { key: 1, label: "나쁨" },
  ];

  return (
    <div className="rvWrap2">
      {/* 좌: 요약 */}
      <aside className="rvLeft">
        <div className="rvLeftTitle">상품 리뷰</div>

        <div className="rvScoreBox">
          <StarsDisplay value={Math.round(avgRating)} size={20} />
          <div className="rvScoreNum">{(Number(avgRating) || 0).toFixed(1)}</div>
        </div>

        <div className="rvCountLine">
          총 <b>{Number(totalCount).toLocaleString()}</b>개
        </div>

        <div className="rvGraph">
          {summaryNote && <div className="rvNote">{summaryNote}</div>}

          {rows.map((r) => {
            const c = Number(counts?.[r.key] ?? 0);
            const pct = totalCount > 0 ? Math.round((c / totalCount) * 100) : 0;
            return (
              <div className="rvGraphRow" key={r.key}>
                <div className="rvGraphLabel">{r.label}</div>
                <div className="rvBarTrack" aria-label={`${r.label} ${pct}%`}>
                  <div className="rvBarFill" style={{ width: `${pct}%` }} />
                </div>
                <div className="rvGraphPct">{pct}%</div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 우: 리스트/컨트롤/작성 */}
      <section className="rvRight">
        <div className="rvControls">
          <div className="rvSort">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={sort === s.value ? "rvLink active" : "rvLink"}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="rvFilters">
            <div className="rvSearch">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="검색어를 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch();
                }}
              />
              <button type="button" className="rvSearchBtn" onClick={applySearch}>
                검색
              </button>
            </div>

            <select
              className="rvSelect"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              {RATING_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err && <div className="rvError2">{err}</div>}

        {/* 리뷰 작성 */}
        <div className="rvWrite">
          <div className="rvWriteTop">
            <div className="rvWriteLabel">리뷰 작성</div>
            <StarsPicker
              value={form.rating}
              onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
              disabled={busy}
            />
          </div>

          <textarea
            className="rvTextarea2"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="리뷰 내용을 입력해 주세요."
            maxLength={500}
            disabled={busy}
          />

          <div className="rvWriteBottom">
            <div className="rvHint2">{form.content.length}/500</div>
            <button type="button" className="rvSubmit2" onClick={submit} disabled={busy}>
              {busy ? "등록 중..." : "리뷰 등록"}
            </button>
          </div>
        </div>

        {/* 리스트 */}
        <div className="rvList2">
          {loading ? (
            <div className="rvEmpty2">불러오는 중…</div>
          ) : list.length === 0 ? (
            <div className="rvEmpty2">아직 리뷰가 없어요.</div>
          ) : (
            list.map((r) => (
              <div key={r.revId} className="rvItem2">
                <div className="rvItemTop2">
                  <StarsDisplay value={r.rating} size={16} />
                  <div className="rvMeta2">
                    <span>{formatDate(r.createdAt)}</span>
                    {r.updatedAt ? <span className="rvDot2">·</span> : null}
                    {r.updatedAt ? <span className="rvEdit2">수정 {formatDate(r.updatedAt)}</span> : null}
                  </div>
                </div>
                <div className="rvContent2">{r.content}</div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {data && totalPages > 1 && (
          <div className="rvPager2">
            <button
              className="rvGhost2"
              disabled={busy || page <= 0}
              onClick={() => load(page - 1)}
              type="button"
            >
              이전
            </button>
            <div className="rvPageText2">
              {page + 1} / {totalPages}
            </div>
            <button
              className="rvGhost2"
              disabled={busy || page + 1 >= totalPages}
              onClick={() => load(page + 1)}
              type="button"
            >
              다음
            </button>
          </div>
        )}
      </section>
    </div>
  );
}