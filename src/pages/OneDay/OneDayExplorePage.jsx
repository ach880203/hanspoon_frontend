import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createOneDayHold,
  getOneDayClassDetail,
  getOneDayClassSessions,
  getOneDayClasses,
  isSessionCompleted,
} from "../../api/onedayApi";
import {
  toCategoryLabel,
  toLevelLabel,
  toRunTypeLabel,
  toSlotLabel,
} from "./onedayLabels";
import "./OneDayExplorePage.css";

const CLASS_PAGE_SIZE = 6;
const SESSION_VISIBLE_SIZE = 8;
const SESSION_DATE_OPTION_MAX = 10;
const LATEST_BANNER_SIZE = 8;
const LATEST_BANNER_ROTATE_MS = 3500;
const LIST_RUN_TYPE_TABS = [
  { value: "ALL", label: "전체" },
  { value: "ALWAYS", label: "상시 운영" },
  { value: "EVENT", label: "이벤트" },
  { value: "ENDED", label: "종료 클래스" },
];

function toTodayDateText() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseNonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function toClassId(item) {
  return Number(item?.id ?? item?.classId ?? 0);
}

function toSessionId(session) {
  return Number(session?.sessionId ?? session?.id ?? 0);
}

function toIsoDateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseQuery(params) {
  return {
    keyword: params.get("keyword") || "",
    category: params.get("category") || "",
    level: params.get("level") || "",
    runType: params.get("runType") || "",
    slot: params.get("slot") || "",
    instructorName: params.get("instructorName") || "",
    date: params.get("date") || toTodayDateText(),
    onlyAvailable: params.get("onlyAvailable") === "true",
    classPage: parseNonNegativeInteger(params.get("classPage"), 0),
    selectedClassId: parseNonNegativeInteger(params.get("selectedClassId"), 0),
  };
}

function toSessionStatus(session) {
  const capacity = Number(session?.capacity ?? 0);
  const reserved = Number(session?.reservedCount ?? 0);
  const full = Boolean(session?.full) || capacity <= reserved;
  const completed = Boolean(session?.completed) || isSessionCompleted(session?.startAt);
  return { full, completed };
}

function toClassSlotStatus(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const hasSessions = list.length > 0;

  const amSessions = list.filter((session) => session?.slot === "AM");
  const pmSessions = list.filter((session) => session?.slot === "PM");

  const calcSlot = (target) => {
    if (target.length === 0) return { completed: false, full: false };

    const completed = target.every((session) => toSessionStatus(session).completed);
    if (completed) return { completed: true, full: false };

    const upcoming = target.filter((session) => !toSessionStatus(session).completed);
    if (upcoming.length === 0) return { completed: true, full: false };

    const full = upcoming.every((session) => toSessionStatus(session).full);
    return { completed: false, full };
  };

  const am = calcSlot(amSessions);
  const pm = calcSlot(pmSessions);
  const classEnded = hasSessions ? list.every((session) => toSessionStatus(session).completed) : false;
  const hasReservableSession = hasSessions
    ? list.some((session) => {
        const status = toSessionStatus(session);
        return !status.completed && !status.full;
      })
    : false;

  return {
    hasSessions,
    classEnded,
    hasReservableSession,
    amCompleted: am.completed,
    pmCompleted: pm.completed,
    amFull: am.full,
    pmFull: pm.full,
  };
}

function toDateMillis(value) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toClassSortPriority(item, status) {
  const runType = String(item?.runType || "").toUpperCase();
  const ended = Boolean(status?.classEnded);

  // 운영 중 클래스를 항상 위로 배치하고, 운영 중에서는 EVENT를 ALWAYS보다 우선합니다.
  if (!ended && runType === "EVENT") return 0;
  if (!ended) return 1;
  if (ended && runType === "EVENT") return 2;
  return 3;
}

function compareClassItem(left, right, statusByClassId) {
  const leftId = toClassId(left);
  const rightId = toClassId(right);
  const leftStatus = statusByClassId[leftId];
  const rightStatus = statusByClassId[rightId];

  const leftPriority = toClassSortPriority(left, leftStatus);
  const rightPriority = toClassSortPriority(right, rightStatus);
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;

  const leftCreatedAt = toDateMillis(left?.createdAt);
  const rightCreatedAt = toDateMillis(right?.createdAt);
  if (leftCreatedAt !== rightCreatedAt) return rightCreatedAt - leftCreatedAt;

  return rightId - leftId;
}

export function OneDayExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const committed = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [filters, setFilters] = useState(committed);

  const [classItems, setClassItems] = useState([]);
  const [classPageInfo, setClassPageInfo] = useState({
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: CLASS_PAGE_SIZE,
  });

  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [selectedClassSessions, setSelectedClassSessions] = useState([]);
  const [visibleSessionCount, setVisibleSessionCount] = useState(SESSION_VISIBLE_SIZE);

  const [latestClassItems, setLatestClassItems] = useState([]);
  const [latestBannerIndex, setLatestBannerIndex] = useState(0);
  const [listRunTypeTab, setListRunTypeTab] = useState("ALL");
  const [classStatusByClassId, setClassStatusByClassId] = useState({});

  const [classesLoading, setClassesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reservingSessionId, setReservingSessionId] = useState(null);

  useEffect(() => {
    setFilters(committed);
  }, [committed]);

  useEffect(() => {
    if (committed.runType === "ALWAYS" || committed.runType === "EVENT") {
      setListRunTypeTab(committed.runType);
    } else {
      setListRunTypeTab("ALL");
    }
  }, [committed.runType]);

  const syncQuery = useCallback(
    (nextQuery, options = { replace: false }) => {
      const next = new URLSearchParams();

      if (nextQuery.keyword) next.set("keyword", String(nextQuery.keyword).trim());
      if (nextQuery.category) next.set("category", nextQuery.category);
      if (nextQuery.level) next.set("level", nextQuery.level);
      if (nextQuery.runType) next.set("runType", nextQuery.runType);
      if (nextQuery.slot) next.set("slot", nextQuery.slot);
      if (nextQuery.instructorName) {
        next.set("instructorName", String(nextQuery.instructorName).trim());
      }
      if (nextQuery.date) next.set("date", nextQuery.date);
      if (nextQuery.onlyAvailable) next.set("onlyAvailable", "true");
      if ((nextQuery.classPage ?? 0) > 0) next.set("classPage", String(nextQuery.classPage));
      if ((nextQuery.selectedClassId ?? 0) > 0) {
        next.set("selectedClassId", String(nextQuery.selectedClassId));
      }

      setSearchParams(next, options);
    },
    [setSearchParams]
  );

  const fetchLatestClasses = useCallback(async () => {
    try {
      const latestResponse = await getOneDayClasses({
        page: 0,
        size: LATEST_BANNER_SIZE,
        sort: "createdAt,desc",
      });
      const normalizedLatestItems = Array.isArray(latestResponse?.content)
        ? latestResponse.content
        : Array.isArray(latestResponse)
        ? latestResponse
        : [];
      setLatestClassItems(normalizedLatestItems);
      setLatestBannerIndex(0);
    } catch {
      setLatestClassItems([]);
    }
  }, []);

  useEffect(() => {
    fetchLatestClasses();
  }, [fetchLatestClasses]);

  useEffect(() => {
    if (latestClassItems.length <= 1) return undefined;

    const timerId = setInterval(() => {
      setLatestBannerIndex((previous) => (previous + 1) % latestClassItems.length);
    }, LATEST_BANNER_ROTATE_MS);

    return () => clearInterval(timerId);
  }, [latestClassItems.length]);

  const fetchClassList = useCallback(
    async (source) => {
      setClassesLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const classParams = {
          page: source.classPage,
          size: CLASS_PAGE_SIZE,
          sort: "createdAt,desc",
        };

        if (source.keyword) classParams.keyword = source.keyword;
        if (source.category) classParams.category = source.category;
        if (source.level) classParams.level = source.level;
        if (source.runType) classParams.runType = source.runType;
        if (source.instructorName) classParams.instructorName = source.instructorName;

        const classResponse = await getOneDayClasses(classParams);
        const normalizedClassItems = Array.isArray(classResponse?.content)
          ? classResponse.content
          : Array.isArray(classResponse)
          ? classResponse
          : [];

        const normalizedServerPage = Number(classResponse?.number ?? source.classPage);
        if (normalizedServerPage !== source.classPage) {
          syncQuery({ ...source, classPage: normalizedServerPage }, { replace: true });
        }

        setClassItems(normalizedClassItems);
        setClassPageInfo({
          totalPages: Number(classResponse?.totalPages ?? 0),
          totalElements: Number(classResponse?.totalElements ?? normalizedClassItems.length),
          number: normalizedServerPage,
          size: Number(classResponse?.size ?? CLASS_PAGE_SIZE),
        });
      } catch (error) {
        setErrorMessage(error?.message ?? "클래스 목록을 불러오는 중 오류가 발생했습니다.");
        setClassItems([]);
        setClassPageInfo({
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: CLASS_PAGE_SIZE,
        });
      } finally {
        setClassesLoading(false);
      }
    },
    [syncQuery]
  );

  useEffect(() => {
    fetchClassList(committed);
  }, [committed, fetchClassList]);

  useEffect(() => {
    let cancelled = false;

    const resolveClassSlotStatus = async () => {
      const classIds = [...new Set(classItems.map((item) => toClassId(item)).filter((id) => id > 0))];
      if (classIds.length === 0) {
        setClassStatusByClassId({});
        return;
      }

      const results = await Promise.all(
        classIds.map(async (classId) => {
          try {
            const sessionsResponse = await getOneDayClassSessions(classId);
            const status = toClassSlotStatus(sessionsResponse);
            return { classId, ...status };
          } catch {
            return {
              classId,
              hasSessions: false,
              classEnded: false,
              hasReservableSession: false,
              amCompleted: false,
              pmCompleted: false,
              amFull: false,
              pmFull: false,
            };
          }
        })
      );

      if (cancelled) return;
      const nextMap = {};
      results.forEach((item) => {
        nextMap[item.classId] = item;
      });
      setClassStatusByClassId(nextMap);
    };

    resolveClassSlotStatus();
    return () => {
      cancelled = true;
    };
  }, [classItems]);

  const fetchSelectedClassData = useCallback(async (selectedClassId) => {
    if (!selectedClassId) {
      setSelectedClassDetail(null);
      setSelectedClassSessions([]);
      setVisibleSessionCount(SESSION_VISIBLE_SIZE);
      return;
    }

    setDetailLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const [detailResponse, sessionsResponse] = await Promise.all([
        getOneDayClassDetail(selectedClassId),
        getOneDayClassSessions(selectedClassId),
      ]);

      const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];
      const sortedSessions = [...sessions].sort((left, right) => {
        const leftTime = Date.parse(left?.startAt ?? "");
        const rightTime = Date.parse(right?.startAt ?? "");
        if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
        return leftTime - rightTime;
      });

      setSelectedClassDetail(detailResponse ?? null);
      setSelectedClassSessions(sortedSessions);
      setVisibleSessionCount(SESSION_VISIBLE_SIZE);
    } catch (error) {
      setErrorMessage(error?.message ?? "선택한 클래스 상세 정보를 불러오지 못했습니다.");
      setSelectedClassDetail(null);
      setSelectedClassSessions([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSelectedClassData(committed.selectedClassId);
  }, [committed.selectedClassId, fetchSelectedClassData]);

  const filteredSelectedSessions = useMemo(() => {
    const date = committed.date;
    const slot = committed.slot;
    const onlyAvailable = committed.onlyAvailable;

    return selectedClassSessions.filter((session) => {
      const status = toSessionStatus(session);
      const sameDate = date ? toIsoDateKey(session?.startAt) === date : true;
      const sameSlot = slot ? session?.slot === slot : true;
      const availableCheck = onlyAvailable ? !status.full && !status.completed : true;
      return sameDate && sameSlot && availableCheck;
    });
  }, [committed.date, committed.onlyAvailable, committed.slot, selectedClassSessions]);

  const selectedClassDateOptions = useMemo(() => {
    const dateSet = new Set(
      selectedClassSessions
        .map((session) => toIsoDateKey(session?.startAt))
        .filter(Boolean)
    );
    return Array.from(dateSet)
      .sort((left, right) => left.localeCompare(right))
      .slice(0, SESSION_DATE_OPTION_MAX);
  }, [selectedClassSessions]);

  const classRunTypeCounts = useMemo(
    () => ({
      ALWAYS: classItems.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "ALWAYS" && !status?.classEnded;
      }).length,
      EVENT: classItems.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "EVENT" && !status?.classEnded;
      }).length,
      ENDED: classItems.filter((item) => classStatusByClassId[toClassId(item)]?.classEnded).length,
    }),
    [classItems, classStatusByClassId]
  );

  const visibleClassItems = useMemo(() => {
    let filtered = classItems;

    // "예약 가능한 세션만 보기"를 체크하면
    // 클래스 리스트에서도 실제로 예약 가능한 세션이 1개 이상 있는 클래스만 노출합니다.
    if (committed.onlyAvailable) {
      filtered = filtered.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return Boolean(status?.hasReservableSession);
      });
    }

    if (listRunTypeTab === "ENDED") {
      filtered = filtered.filter((item) => classStatusByClassId[toClassId(item)]?.classEnded);
    } else if (listRunTypeTab !== "ALL") {
      filtered = filtered.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === listRunTypeTab && !status?.classEnded;
      });
    }

    return [...filtered].sort((left, right) =>
      compareClassItem(left, right, classStatusByClassId)
    );
  }, [classItems, classStatusByClassId, listRunTypeTab, committed.onlyAvailable]);

  const visibleSessions = filteredSelectedSessions.slice(0, visibleSessionCount);
  const canShowMoreSessions = visibleSessionCount < filteredSelectedSessions.length;
  const classTotalPages = Math.max(classPageInfo.totalPages, 1);
  const canGoPreviousPage = committed.classPage > 0;
  const canGoNextPage = committed.classPage + 1 < classTotalPages;

  const onFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const applyFilters = () => {
    // 필터를 다시 적용할 때 선택 클래스는 해제해서 "리스트 우선 탐색" 흐름으로 맞춥니다.
    syncQuery({ ...filters, classPage: 0, selectedClassId: 0 }, { replace: false });
  };

  const resetFilters = () => {
    const initial = {
      keyword: "",
      category: "",
      level: "",
      runType: "",
      slot: "",
      instructorName: "",
      date: toTodayDateText(),
      onlyAvailable: false,
      classPage: 0,
      selectedClassId: 0,
    };
    setFilters(initial);
    syncQuery(initial, { replace: false });
  };

  const openClassDetailPanel = (classId) => {
    if (!classId) return;
    syncQuery({ ...committed, selectedClassId: classId }, { replace: false });
  };

  const closeClassDetailPanel = () => {
    syncQuery({ ...committed, selectedClassId: 0 }, { replace: false });
  };

  const handleReserve = async (sessionId) => {
    if (!sessionId) return;

    setErrorMessage("");
    setSuccessMessage("");
    setReservingSessionId(sessionId);

    try {
      const holdResult = await createOneDayHold(sessionId);
      const reservationId = Number(holdResult?.id ?? holdResult?.reservationId ?? 0);
      if (reservationId > 0) {
        navigate(`/classes/oneday/reservations?selectedId=${reservationId}`);
      } else {
        setSuccessMessage(`세션 #${sessionId} 예약이 생성되었습니다.`);
      }
    } catch (error) {
      setErrorMessage(error?.message ?? "세션 예약 생성에 실패했습니다.");
    } finally {
      setReservingSessionId(null);
    }
  };

  const hasSelection = committed.selectedClassId > 0;
  const selectedClassId = committed.selectedClassId;

  useEffect(() => {
    if (!hasSelection) return;
    if (selectedClassDateOptions.length === 0) return;
    if (selectedClassDateOptions.includes(committed.date)) return;

    // 선택한 클래스에 실제로 존재하는 날짜를 기본으로 맞춰야 우측 패널에서
    // 세션이 비어 보이지 않고 바로 예약 가능한 시간대를 확인할 수 있습니다.
    syncQuery(
      { ...committed, date: selectedClassDateOptions[0], selectedClassId },
      { replace: true }
    );
  }, [hasSelection, selectedClassDateOptions, committed, selectedClassId, syncQuery]);

  const onDetailDateChange = (nextDate) => {
    if (!nextDate) return;
    setVisibleSessionCount(SESSION_VISIBLE_SIZE);
    syncQuery({ ...committed, date: nextDate, selectedClassId }, { replace: false });
  };

  return (
    <div className="odxv-root">
      <section className="odxv-hero">
        <span className="odxv-hero-badge">HAN SPOON ONE DAY</span>
        <h1>클래스를 클릭하면 오른쪽에 세션 상세가 바로 열립니다</h1>
        <p>
          리스트를 먼저 빠르게 보고, 마음에 드는 클래스를 선택하면 상세/예약을 한 화면에서
          이어서 처리할 수 있습니다.
        </p>

        {latestClassItems.length > 0 ? (
          <div className="odxv-latest">
            <div
              className="odxv-latest-track"
              style={{ transform: `translateX(-${latestBannerIndex * 100}%)` }}
            >
              {latestClassItems.map((item, index) => {
                const classId = toClassId(item);
                return (
                  <button
                    key={`latest-${classId || index}`}
                    type="button"
                    className="odxv-latest-card"
                    onClick={() => openClassDetailPanel(classId)}
                  >
                    <span className="odxv-latest-tag">최신 등록</span>
                    <strong>{item?.title || `클래스 #${classId || "-"}`}</strong>
                    <span>
                      {toRunTypeLabel(item?.runType)} · {toCategoryLabel(item?.category)} ·{" "}
                      {toLevelLabel(item?.level)}
                    </span>
                  </button>
                );
              })}
            </div>

            {latestClassItems.length > 1 ? (
              <div className="odxv-latest-dots">
                {latestClassItems.map((item, index) => {
                  const classId = toClassId(item);
                  return (
                    <button
                      key={`latest-dot-${classId || index}`}
                      type="button"
                      className={latestBannerIndex === index ? "is-active" : ""}
                      onClick={() => setLatestBannerIndex(index)}
                      aria-label={`${index + 1}번째 최신 클래스 보기`}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="odxv-filter-panel">
        <div className="odxv-filter-grid">
          <label className="odxv-field">
            <span>검색어</span>
            <input
              value={filters.keyword}
              onChange={(event) => onFilterChange("keyword", event.target.value)}
              placeholder="클래스명, 카테고리"
            />
          </label>
          <label className="odxv-field">
            <span>카테고리</span>
            <select
              value={filters.category}
              onChange={(event) => onFilterChange("category", event.target.value)}
            >
              <option value="">전체</option>
              <option value="KOREAN">한식</option>
              <option value="BAKERY">베이커리</option>
            </select>
          </label>
          <label className="odxv-field">
            <span>레벨</span>
            <select
              value={filters.level}
              onChange={(event) => onFilterChange("level", event.target.value)}
            >
              <option value="">전체</option>
              <option value="BEGINNER">입문</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
            </select>
          </label>
          <label className="odxv-field">
            <span>운영 유형</span>
            <select
              value={filters.runType}
              onChange={(event) => onFilterChange("runType", event.target.value)}
            >
              <option value="">전체</option>
              <option value="ALWAYS">상시</option>
              <option value="EVENT">이벤트</option>
            </select>
          </label>
          <label className="odxv-field">
            <span>세션 날짜</span>
            <input
              type="date"
              value={filters.date}
              onChange={(event) => onFilterChange("date", event.target.value)}
            />
          </label>
          <label className="odxv-field">
            <span>시간대</span>
            <select
              value={filters.slot}
              onChange={(event) => onFilterChange("slot", event.target.value)}
            >
              <option value="">전체</option>
              <option value="AM">오전</option>
              <option value="PM">오후</option>
            </select>
          </label>
          <label className="odxv-field">
            <span>강사명</span>
            <input
              value={filters.instructorName}
              onChange={(event) => onFilterChange("instructorName", event.target.value)}
              placeholder="예: 김한스푼"
            />
          </label>
        </div>

        <div className="odxv-filter-actions">
          <label className="odxv-checkbox">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(event) => onFilterChange("onlyAvailable", event.target.checked)}
            />
            <span>예약 가능한 세션만 보기</span>
          </label>
          <div className="odxv-action-buttons">
            <button
              type="button"
              className="odxv-btn odxv-btn-ghost"
              onClick={resetFilters}
              disabled={classesLoading || detailLoading}
            >
              초기화
            </button>
            <button
              type="button"
              className="odxv-btn odxv-btn-primary"
              onClick={applyFilters}
              disabled={classesLoading || detailLoading}
            >
              {classesLoading ? "조회 중..." : "조회 적용"}
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="odxv-alert odxv-alert-error">{errorMessage}</div> : null}
      {successMessage ? <div className="odxv-alert odxv-alert-success">{successMessage}</div> : null}

      <section className={hasSelection ? "odxv-layout is-selected" : "odxv-layout"}>
        <article className="odxv-list-panel">
          <div className="odxv-panel-head">
            <h2>클래스 리스트</h2>
            <p>
              총 {classPageInfo.totalElements.toLocaleString("ko-KR")}개 ·{" "}
              {committed.classPage + 1}/{classTotalPages}페이지
            </p>
          </div>

          <div className="odxv-list-toolbar">
            {LIST_RUN_TYPE_TABS.map((tab) => {
              const active = listRunTypeTab === tab.value;
              const countText =
                tab.value === "ALWAYS"
                  ? classRunTypeCounts.ALWAYS
                  : tab.value === "EVENT"
                  ? classRunTypeCounts.EVENT
                  : tab.value === "ENDED"
                  ? classRunTypeCounts.ENDED
                  : classItems.length;

              return (
                <button
                  key={`run-tab-${tab.value}`}
                  type="button"
                  className={active ? "odxv-run-tab is-active" : "odxv-run-tab"}
                  onClick={() => setListRunTypeTab(tab.value)}
                >
                  {tab.label} ({countText})
                </button>
              );
            })}
          </div>

          <div className="odxv-list-scroll">
            {classesLoading ? (
              <p className="odxv-empty">클래스 목록을 불러오는 중입니다...</p>
            ) : visibleClassItems.length === 0 ? (
              <p className="odxv-empty">조건에 맞는 클래스가 없습니다.</p>
            ) : (
              <div className="odxv-class-line-list">
                {visibleClassItems.map((item, index) => {
                  const classId = toClassId(item);
                  const active = classId === selectedClassId;
                  const classStatus = classStatusByClassId[classId];
                  return (
                    <button
                      key={`class-line-${classId || index}`}
                      type="button"
                      className={active ? "odxv-class-line is-active" : "odxv-class-line"}
                      onClick={() => openClassDetailPanel(classId)}
                    >
                      <div className="odxv-class-thumb">
                        {item?.mainImageData ? (
                          <img
                            src={item.mainImageData}
                            alt={`${item?.title || "클래스"} 메인 이미지`}
                            className="odxv-class-thumb-image"
                          />
                        ) : (
                          <div className="odxv-class-thumb-fallback">클래스</div>
                        )}
                        <span className="odxv-class-thumb-tag">{toCategoryLabel(item?.category)}</span>
                      </div>
                      <div className="odxv-class-line-body">
                        <strong>{item?.title || `클래스 #${classId || "-"}`}</strong>
                        <div className="odxv-chip-row">
                          <span className="odxv-chip">{toRunTypeLabel(item?.runType)}</span>
                          <span className="odxv-chip">{toLevelLabel(item?.level)}</span>
                        </div>
                        <div className="odxv-status-row">
                          {classStatus?.amCompleted ? (
                            <span className="odxv-chip odxv-chip-status">오전 완료</span>
                          ) : null}
                          {classStatus?.pmCompleted ? (
                            <span className="odxv-chip odxv-chip-status">오후 완료</span>
                          ) : null}
                          {classStatus?.amFull ? (
                            <span className="odxv-chip odxv-chip-status">오전 마감</span>
                          ) : null}
                          {classStatus?.pmFull ? (
                            <span className="odxv-chip odxv-chip-status">오후 마감</span>
                          ) : null}
                          {classStatus?.classEnded ? (
                            <span className="odxv-chip odxv-chip-ended">종료 클래스</span>
                          ) : classStatus?.hasSessions ? (
                            <span className="odxv-chip odxv-chip-open">운영 중</span>
                          ) : (
                            <span className="odxv-chip">상태 확인중</span>
                          )}
                        </div>
                        <span className="odxv-meta">강사: {item?.instructorName || "미지정"}</span>
                      </div>
                      <span className="odxv-line-arrow">자세히</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="odxv-pagination">
            <button
              type="button"
              className="odxv-btn odxv-btn-ghost"
              disabled={!canGoPreviousPage || classesLoading}
              onClick={() =>
                syncQuery({ ...committed, classPage: Math.max(committed.classPage - 1, 0) })
              }
            >
              이전
            </button>
            <button
              type="button"
              className="odxv-btn odxv-btn-ghost"
              disabled={!canGoNextPage || classesLoading}
              onClick={() => syncQuery({ ...committed, classPage: committed.classPage + 1 })}
            >
              다음
            </button>
          </div>
        </article>

        {hasSelection ? (
          <aside className="odxv-detail-panel">
            {detailLoading ? (
              <p className="odxv-empty">클래스 상세를 불러오는 중입니다...</p>
            ) : selectedClassDetail ? (
              <>
                <div className="odxv-detail-head">
                  <div>
                    <h3>{selectedClassDetail?.title}</h3>
                    <p>{selectedClassDetail?.description || "클래스 소개가 등록되지 않았습니다."}</p>
                  </div>
                  <button
                    type="button"
                    className="odxv-btn odxv-btn-ghost"
                    onClick={closeClassDetailPanel}
                  >
                    닫기
                  </button>
                </div>

                <div className="odxv-chip-row">
                  <span className="odxv-chip">{toCategoryLabel(selectedClassDetail?.category)}</span>
                  <span className="odxv-chip">{toLevelLabel(selectedClassDetail?.level)}</span>
                  <span className="odxv-chip">{toRunTypeLabel(selectedClassDetail?.runType)}</span>
                  <span className="odxv-chip">
                    강사: {selectedClassDetail?.instructorName || "미지정"}
                  </span>
                </div>

                <div className="odxv-detail-actions">
                  <button
                    type="button"
                    className="odxv-btn odxv-btn-primary"
                    onClick={() =>
                      navigate(`/classes/oneday/classes/${selectedClassDetail?.id ?? selectedClassId}`)
                    }
                  >
                    상세 페이지 이동
                  </button>
                </div>

                <div className="odxv-panel-head odxv-session-head">
                  <h4>{committed.date} 세션</h4>
                  <p>{filteredSelectedSessions.length.toLocaleString("ko-KR")}개</p>
                </div>

                <div className="odxv-detail-date-picker">
                  <label htmlFor="odxv-detail-date">날짜 선택</label>
                  {selectedClassDateOptions.length > 0 ? (
                    <select
                      id="odxv-detail-date"
                      value={
                        selectedClassDateOptions.includes(committed.date)
                          ? committed.date
                          : selectedClassDateOptions[0]
                      }
                      onChange={(event) => onDetailDateChange(event.target.value)}
                    >
                      {selectedClassDateOptions.map((dateText) => (
                        <option key={dateText} value={dateText}>
                          {dateText}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input id="odxv-detail-date" type="text" value="선택 가능한 날짜 없음" disabled />
                  )}
                </div>

                {filteredSelectedSessions.length === 0 ? (
                  <p className="odxv-empty">선택한 날짜/조건에 맞는 세션이 없습니다.</p>
                ) : (
                  <>
                    <div className="odxv-session-list">
                      {visibleSessions.map((session, index) => {
                        const sessionId = toSessionId(session);
                        const status = toSessionStatus(session);
                        const slotText = toSlotLabel(session?.slot);
                        const statusLabel = status.completed
                          ? `${slotText} 종료`
                          : status.full
                          ? `${slotText} 마감`
                          : "";

                        return (
                          <article key={`session-${sessionId || index}`} className="odxv-session-item">
                            <div className="odxv-session-main">
                              <strong>
                                {session?.startAt
                                  ? new Date(session.startAt).toLocaleString("ko-KR")
                                  : "시간 미정"}{" "}
                                ({slotText})
                              </strong>
                              <div className="odxv-chip-row">
                                <span className="odxv-chip">
                                  잔여{" "}
                                  {Math.max(
                                    Number(session?.capacity ?? 0) -
                                      Number(session?.reservedCount ?? 0),
                                    0
                                  )}석
                                </span>
                                {statusLabel ? (
                                  <span className="odxv-chip odxv-chip-danger">{statusLabel}</span>
                                ) : null}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="odxv-btn odxv-btn-primary"
                              disabled={
                                !sessionId ||
                                status.completed ||
                                status.full ||
                                reservingSessionId === sessionId
                              }
                              onClick={() => handleReserve(sessionId)}
                            >
                              {reservingSessionId === sessionId
                                ? "처리 중..."
                                : status.completed || status.full
                                ? statusLabel || "예약 불가"
                                : "예약하기"}
                            </button>
                          </article>
                        );
                      })}
                    </div>

                    {canShowMoreSessions ? (
                      <div className="odxv-more-wrap">
                        <button
                          type="button"
                          className="odxv-btn odxv-btn-ghost"
                          onClick={() =>
                            setVisibleSessionCount((previous) => previous + SESSION_VISIBLE_SIZE)
                          }
                        >
                          세션 더 보기
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <p className="odxv-empty">클래스 상세 정보를 찾을 수 없습니다.</p>
            )}
          </aside>
        ) : null}
      </section>
    </div>
  );
}
