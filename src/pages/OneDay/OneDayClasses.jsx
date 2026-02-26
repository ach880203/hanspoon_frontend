import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getMyOneDayReservations,
  getOneDayClasses,
  getOneDayClassSessions,
  isSessionCompleted,
  resolveOneDayUserId,
} from "../../api/onedayApi";
import { toCategoryLabel, toLevelLabel } from "./onedayLabels";
import { OneDayTopTabs } from "./OneDayTopTabs";

const PAGE_SIZE = 12;

function parsePositiveInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export const OneDayClasses = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리를 화면 상태의 단일 기준(source of truth)으로 사용합니다.
  // 이유: 상세 페이지에서 뒤로 왔을 때도 같은 URL이면 같은 상태를 복원할 수 있습니다.
  const queryState = useMemo(() => {
    const runTypeRaw = (searchParams.get("runType") || "").toUpperCase();
    return {
      page: parsePositiveInt(searchParams.get("page"), 0),
      level: searchParams.get("level") || "",
      runType: runTypeRaw === "EVENT" || runTypeRaw === "ALWAYS" ? runTypeRaw : "",
      category: searchParams.get("category") || "",
      instructorId: searchParams.get("instructorId") || "",
      sort: searchParams.get("sort") || "createdAt,desc",
      keyword: searchParams.get("keyword") || "",
      completedOnly: searchParams.get("completedOnly") === "true",
    };
  }, [searchParams]);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [completedClassIds, setCompletedClassIds] = useState(new Set());
  const [slotStatusByClassId, setSlotStatusByClassId] = useState({});
  const [pageInfo, setPageInfo] = useState({
    totalPages: 0,
    totalElements: 0,
    size: PAGE_SIZE,
    number: 0,
  });

  const updateQuery = useCallback(
    (updates, options = { replace: true }) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      setSearchParams(next, options);
    },
    [searchParams, setSearchParams]
  );

  const loadCompletedClasses = useCallback(async () => {
    const userId = resolveOneDayUserId();
    if (!userId) {
      setCompletedClassIds(new Set());
      return;
    }

    const completed = await getMyOneDayReservations({ status: "COMPLETED", page: 0, size: 200 });
    const list = Array.isArray(completed?.content) ? completed.content : [];
    setCompletedClassIds(new Set(list.map((x) => x.classId).filter(Boolean)));
  }, []);

  const fetchList = useCallback(
    async (signal) => {
      setError("");
      setLoading(true);

      try {
        const params = { page: queryState.page, size: PAGE_SIZE };
        if (queryState.level) params.level = queryState.level;
        if (queryState.runType) params.runType = queryState.runType;
        if (queryState.category) params.category = queryState.category;
        if (queryState.instructorId) params.instructorId = Number(queryState.instructorId);
        if (queryState.sort) params.sort = queryState.sort;
        if (queryState.keyword) params.keyword = queryState.keyword;

        const data = await getOneDayClasses(params, { signal });
        const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];

        setItems(list);
        setPageInfo({
          totalPages: Number(data?.totalPages ?? 0),
          totalElements: Number(data?.totalElements ?? list.length),
          size: Number(data?.size ?? PAGE_SIZE),
          number: Number(data?.number ?? queryState.page),
        });

        // 서버가 교정한 페이지 번호가 있으면 URL도 맞춰 줍니다.
        // 예: 마지막 페이지보다 큰 번호를 넣고 들어온 경우
        const normalizedPage = Number(data?.number ?? queryState.page);
        if (normalizedPage !== queryState.page) {
          updateQuery({ page: normalizedPage }, { replace: true });
        }
      } catch (e) {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        setError(e?.message || "클래스 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [queryState, updateQuery]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
  }, [fetchList]);

  useEffect(() => {
    loadCompletedClasses().catch(() => setCompletedClassIds(new Set()));
  }, [loadCompletedClasses]);

  useEffect(() => {
    let cancelled = false;

    const resolveSlotStatuses = async () => {
      const uniqueClassIds = [...new Set(items.map((x) => Number(x?.id ?? x?.classId ?? 0)).filter((x) => x > 0))];
      if (uniqueClassIds.length === 0) {
        setSlotStatusByClassId({});
        return;
      }

      const checks = await Promise.all(
        uniqueClassIds.map(async (classId) => {
          try {
            const sessions = await getOneDayClassSessions(classId);
            const list = Array.isArray(sessions) ? sessions : [];
            const timeList = list
              .map((s) => Date.parse(s?.startAt ?? ""))
              .filter((t) => !Number.isNaN(t));

            if (timeList.length === 0) {
              return { classId, amCompleted: false, pmCompleted: false, amFull: false, pmFull: false };
            }

            // 초보자 참고:
            // 클래스 한 개 안에 오전/오후 세션이 여러 개 있을 수 있습니다.
            // "오전완료"는 오전 세션 전체의 시작 시간이 지난 경우로 계산합니다.
            // "오전마감"은 아직 완료되지 않은 오전 세션들 중에서 예약 가능한 좌석이 하나도 없을 때 표시합니다.
            const amSessions = list.filter((s) => s?.slot === "AM");
            const pmSessions = list.filter((s) => s?.slot === "PM");

            const calc = (sessions) => {
              if (sessions.length === 0) return { completed: false, full: false };
              const completed = sessions.every((s) => isSessionCompleted(s?.startAt));
              if (completed) return { completed: true, full: false };

              const futureSessions = sessions.filter((s) => !isSessionCompleted(s?.startAt));
              if (futureSessions.length === 0) return { completed: true, full: false };

              const full = futureSessions.every((s) => {
                const capacity = Number(s?.capacity ?? 0);
                const reserved = Number(s?.reservedCount ?? 0);
                return Boolean(s?.full) || capacity <= reserved;
              });

              return { completed: false, full };
            };

            const am = calc(amSessions);
            const pm = calc(pmSessions);

            return {
              classId,
              amCompleted: am.completed,
              pmCompleted: pm.completed,
              amFull: am.full,
              pmFull: pm.full,
            };
          } catch {
            return { classId, amCompleted: false, pmCompleted: false, amFull: false, pmFull: false };
          }
        })
      );

      if (cancelled) return;
      const map = {};
      checks.forEach((x) => {
        map[x.classId] = {
          amCompleted: x.amCompleted,
          pmCompleted: x.pmCompleted,
          amFull: x.amFull,
          pmFull: x.pmFull,
        };
      });
      setSlotStatusByClassId(map);
    };

    resolveSlotStatuses();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const viewItems = useMemo(() => {
    const normalized = items.map((c, idx) => ({
      raw: c,
      id: c?.id ?? c?.classId ?? `row-${idx}`,
      title: c?.title ?? c?.classTitle ?? `클래스 #${idx + 1}`,
      category: c?.categoryLabel ?? toCategoryLabel(c?.category ?? c?.recipeCategory),
      level: c?.levelLabel ?? toLevelLabel(c?.level ?? c?.difficulty),
      instructor: c?.instructorName ?? (c?.instructorId ? `강사 #${c.instructorId}` : ""),
    }));

    const filtered = normalized; // 서버 사이드 검색으로 전환되었으므로 키워드 필터 제거

    if (!queryState.completedOnly) return filtered;
    return filtered.filter((x) => completedClassIds.has(x.id));
  }, [items, queryState.completedOnly, completedClassIds]);

  const onFilterChange = (key, value) => {
    // 필터가 바뀌면 첫 페이지부터 다시 조회해야 UX가 자연스럽습니다.
    updateQuery({ [key]: value, page: 0 }, { replace: true });
  };

  const totalPages = Math.max(pageInfo.totalPages, 1);
  const canPrev = queryState.page > 0;
  const canNext = queryState.page + 1 < totalPages;

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>원데이 클래스 목록</h1>
            <p style={styles.subtitle}>필터와 검색으로 원하는 클래스를 빠르게 찾으세요.</p>
          </div>
          <button type="button" style={styles.btn} onClick={() => updateQuery({}, { replace: true })}>
            새로고침
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filterGrid}>
            <select style={styles.input} value={queryState.level} onChange={(e) => onFilterChange("level", e.target.value)}>
              <option value="">난이도 전체</option>
              <option value="BEGINNER">입문</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
            </select>

            <select style={styles.input} value={queryState.runType} onChange={(e) => onFilterChange("runType", e.target.value)}>
              <option value="">운영 전체</option>
              <option value="ALWAYS">상시</option>
              <option value="EVENT">이벤트</option>
            </select>

            <select style={styles.input} value={queryState.category} onChange={(e) => onFilterChange("category", e.target.value)}>
              <option value="">카테고리 전체</option>
              <option value="KOREAN">한식</option>
              <option value="BAKERY">베이커리</option>
            </select>

            <input
              style={styles.input}
              value={queryState.instructorId}
              onChange={(e) => onFilterChange("instructorId", e.target.value)}
              placeholder="강사 아이디"
            />

            <select style={styles.input} value={queryState.sort} onChange={(e) => onFilterChange("sort", e.target.value)}>
              <option value="createdAt,desc">최신순</option>
              <option value="createdAt,asc">오래된순</option>
              <option value="id,desc">번호 내림차순</option>
              <option value="id,asc">번호 오름차순</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              style={styles.searchInput}
              value={queryState.keyword}
              onChange={(e) => onFilterChange("keyword", e.target.value)}
              placeholder="제목/카테고리/난이도/강사/번호 검색"
            />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={queryState.completedOnly}
                onChange={(e) => onFilterChange("completedOnly", e.target.checked)}
              />
              내가 완료한 클래스만 보기
            </label>
          </div>
        </div>

        {error && <div style={styles.error}>에러: {error}</div>}

        {loading ? (
          <div style={styles.grid}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : viewItems.length === 0 ? (
          <p style={styles.subtle}>조회 결과가 없습니다.</p>
        ) : (
          <div style={styles.grid}>
            {viewItems.map((c) => (
              <div key={c.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{c.title}</h3>

                <div style={styles.metaRow}>
                  {slotStatusByClassId?.[Number(c.id)]?.amCompleted && <span style={styles.closedBadge}>오전완료</span>}
                  {slotStatusByClassId?.[Number(c.id)]?.pmCompleted && <span style={styles.closedBadge}>오후완료</span>}
                  {slotStatusByClassId?.[Number(c.id)]?.amFull && <span style={styles.closedBadge}>오전마감</span>}
                  {slotStatusByClassId?.[Number(c.id)]?.pmFull && <span style={styles.closedBadge}>오후마감</span>}
                  {c.category && <span style={styles.badge}>{c.category}</span>}
                  {c.level && <span style={styles.badge}>{c.level}</span>}
                  {c.instructor && <span style={styles.badge}>{c.instructor}</span>}

                  {completedClassIds.has(c.id) && <span style={styles.doneBadge}>완료</span>}
                </div>

                <div style={styles.footerRow}>
                  <p style={styles.subtle}>클래스 번호: {String(c.id)}</p>
                  <Link to={`/classes/oneday/classes/${c.id}`} style={styles.linkBtn}>
                    상세 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.pager}>
          <p style={styles.subtle}>
            총 {pageInfo.totalElements.toLocaleString("ko-KR")}건 · {queryState.page + 1}/{totalPages} 페이지
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={styles.btn}
              disabled={!canPrev || loading}
              onClick={() => updateQuery({ page: Math.max(queryState.page - 1, 0) }, { replace: false })}
            >
              이전
            </button>
            <button
              style={styles.btn}
              disabled={!canNext || loading}
              onClick={() => updateQuery({ page: queryState.page + 1 }, { replace: false })}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 900, margin: 0 },
  subtitle: { margin: "6px 0 0", color: "#6b7280", fontSize: 14 },
  toolbar: { display: "grid", gap: 10, marginBottom: 16 },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 8,
  },
  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    minWidth: 140,
  },
  searchInput: {
    width: "100%",
    maxWidth: 380,
    height: 40,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 120,
  },
  cardTitle: { fontSize: 16, fontWeight: 900, margin: 0, lineHeight: 1.35 },
  metaRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  badge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontWeight: 800,
  },
  doneBadge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #86efac",
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: 800,
  },
  closedBadge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #fca5a5",
    background: "#fff1f2",
    color: "#991b1b",
    fontWeight: 800,
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    gap: 10,
  },
  subtle: { color: "#6b7280", fontSize: 13, margin: 0 },
  linkBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    background: "#111827",
    border: "1px solid #111827",
    color: "white",
    textDecoration: "none",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
    color: "#111827",
    whiteSpace: "nowrap",
  },
  error: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    fontWeight: 900,
  },
  skeleton: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    height: 120,
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
};
