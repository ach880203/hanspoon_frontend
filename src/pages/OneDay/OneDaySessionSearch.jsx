﻿import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createOneDayHold, isSessionCompleted, searchOneDaySessions } from "../../api/onedayApi";
import { toCategoryLabel, toLevelLabel, toRunTypeLabel, toSlotLabel } from "./onedayLabels";
import { OneDayTopTabs } from "./OneDayTopTabs";

function toSlotStatusText(slot, completed, full) {
  const slotLabel = slot === "PM" ? "오후" : "오전";
  if (completed) return `${slotLabel}완료`;
  if (full) return `${slotLabel}마감`;
  return "";
}

function parseSearchFilters(params) {
  return {
    level: params.get("level") || "",
    category: params.get("category") || "",
    runType: params.get("runType") || "",
    slot: params.get("slot") || "",
    instructorId: params.get("instructorId") || "",
    onlyAvailable: params.get("onlyAvailable") === "true",
    sort: params.get("sort") || "startAtAsc",
    dateFrom: params.get("dateFrom") || "",
    dateTo: params.get("dateTo") || "",
    keyword: params.get("keyword") || "",
    searched: params.get("searched") === "1",
  };
}

export const OneDaySessionSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const committed = useMemo(() => parseSearchFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState(committed);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reservingSessionId, setReservingSessionId] = useState(null);

  useEffect(() => {
    setFilters(committed);
  }, [committed]);

  const runSearch = useCallback(async (source) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const params = {};
      if (source.level) params.level = source.level;
      if (source.category) params.category = source.category;
      if (source.runType) params.runType = source.runType;
      if (source.slot) params.slot = source.slot;
      if (source.instructorId) params.instructorId = Number(source.instructorId);
      if (source.sort) params.sort = source.sort;
      if (source.onlyAvailable) params.onlyAvailable = true;
      if (source.keyword) params.keyword = source.keyword;
      if (source.dateFrom) params.dateFrom = `${source.dateFrom}T00:00:00`;
      if (source.dateTo) params.dateTo = `${source.dateTo}T23:59:59`;

      const data = await searchOneDaySessions(params);
      const list = Array.isArray(data) ? data : [];
      setResults(list);
      setMessage(`검색 결과 ${list.length}건`);
    } catch (e) {
      setError(e?.message ?? "세션 검색 중 오류가 발생했습니다.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!committed.searched) {
      setResults([]);
      setMessage("");
      setError("");
      return;
    }

    runSearch(committed);
  }, [committed, runSearch]);

  const setField = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    const next = new URLSearchParams();

    next.set("searched", "1");
    if (filters.level) next.set("level", filters.level);
    if (filters.category) next.set("category", filters.category);
    if (filters.runType) next.set("runType", filters.runType);
    if (filters.slot) next.set("slot", filters.slot);
    if (filters.instructorId) next.set("instructorId", filters.instructorId);
    if (filters.onlyAvailable) next.set("onlyAvailable", "true");
    if (filters.sort) next.set("sort", filters.sort);
    if (filters.dateFrom) next.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) next.set("dateTo", filters.dateTo);
    if (filters.keyword) next.set("keyword", filters.keyword);

    setSearchParams(next, { replace: false });
  };

  const handleReset = () => {
    // 초보자 참고:
    // 필터 상태와 URL 쿼리를 동시에 초기화해야 화면과 주소가 같은 상태를 유지합니다.
    setFilters(parseSearchFilters(new URLSearchParams()));
    setSearchParams(new URLSearchParams(), { replace: false });
    setResults([]);
    setMessage("");
    setError("");
  };

  const handleReserve = async (sessionId) => {
    setError("");
    setMessage("");
    setReservingSessionId(sessionId);
    try {
      await createOneDayHold(sessionId);
      setMessage(`세션 #${sessionId} 홀드 생성 완료`);
    } catch (e) {
      setError(e?.message ?? "홀드 생성 실패");
    } finally {
      setReservingSessionId(null);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>세션 검색</h1>

        <div style={panel}>
          <div style={grid4}>
            <Select
              label="난이도"
              value={filters.level}
              onChange={(v) => setField("level", v)}
              options={[
                { value: "", label: "전체" },
                { value: "BEGINNER", label: "입문" },
                { value: "INTERMEDIATE", label: "중급" },
                { value: "ADVANCED", label: "고급" },
              ]}
            />
            <Select
              label="카테고리"
              value={filters.category}
              onChange={(v) => setField("category", v)}
              options={[
                { value: "", label: "전체" },
                { value: "KOREAN", label: "한식" },
                { value: "BAKERY", label: "베이커리" },
              ]}
            />
            <Select
              label="운영"
              value={filters.runType}
              onChange={(v) => setField("runType", v)}
              options={[
                { value: "", label: "전체" },
                { value: "ALWAYS", label: "상시" },
                { value: "EVENT", label: "이벤트" },
              ]}
            />
            <Select
              label="시간대"
              value={filters.slot}
              onChange={(v) => setField("slot", v)}
              options={[
                { value: "", label: "전체" },
                { value: "AM", label: "오전" },
                { value: "PM", label: "오후" },
              ]}
            />
            <Input label="제목 검색" value={filters.keyword} onChange={(v) => setField("keyword", v)} placeholder="예: 클래스" />
          </div>

          <div style={grid4}>
            <Input label="강사 아이디" value={filters.instructorId} onChange={(v) => setField("instructorId", v)} placeholder="예: 1" />
            <Select
              label="정렬"
              value={filters.sort}
              onChange={(v) => setField("sort", v)}
              options={[
                { value: "startAtAsc", label: "시작시간 빠른순" },
                { value: "priceAsc", label: "가격 낮은순" },
                { value: "priceDesc", label: "가격 높은순" },
              ]}
            />
            <Input label="시작일" type="date" value={filters.dateFrom} onChange={(v) => setField("dateFrom", v)} />
            <Input label="종료일" type="date" value={filters.dateTo} onChange={(v) => setField("dateTo", v)} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={filters.onlyAvailable}
                onChange={(e) => setField("onlyAvailable", e.target.checked)}
              />
              예약 가능한 세션만
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSearch} style={btnPrimary} disabled={loading}>
                {loading ? "검색중..." : "검색"}
              </button>
              <button onClick={handleReset} style={btnGhostButton} type="button" disabled={loading}>
                초기화
              </button>
            </div>
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}

        <div style={{ ...panel, display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>검색 결과</h2>
          {results.length === 0 ? (
            <div style={{ color: "#6b7280" }}>검색 결과가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {results.map((item) => {
                const slotText = item.slotLabel ?? toSlotLabel(item.slot);
                const runType = item.runTypeLabel ?? toRunTypeLabel(item.runType);
                const level = item.levelLabel ?? toLevelLabel(item.level);
                const category = item.categoryLabel ?? toCategoryLabel(item.category);
                const startAt = item.startAt ? new Date(item.startAt).toLocaleString("ko-KR") : "-";
                const full = Boolean(item.full) || (item.capacity ?? 0) <= (item.reservedCount ?? 0);
                const completed = Boolean(item.completed) || isSessionCompleted(item.startAt);
                const slotStatusText = toSlotStatusText(item.slot, completed, full);

                return (
                  <article
                    key={item.sessionId}
                    style={card}
                    onClick={() => navigate(`/classes/oneday/classes/${item.classId}`)}
                  >
                    <div style={{ display: "grid", gap: 4 }}>
                      <strong>{item.classTitle}</strong>
                      <span style={{ color: "#4b5563", fontSize: 14 }}>
                        {startAt} ({slotText})
                      </span>
                      <span style={{ color: "#4b5563", fontSize: 13 }}>
                        {level} / {category} / {runType}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={chip}>{Number(item.price ?? 0).toLocaleString("ko-KR")}원</span>
                      <span style={chip}>잔여 {Math.max((item.capacity ?? 0) - (item.reservedCount ?? 0), 0)}석</span>
                      {slotStatusText ? <span style={closedBadge}>{slotStatusText}</span> : null}
                      <button
                        style={btnPrimary}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserve(item.sessionId);
                        }}
                        disabled={completed || full || reservingSessionId === item.sessionId}
                      >
                        {reservingSessionId === item.sessionId ? "처리중..." : completed || full ? slotStatusText : "홀드"}
                      </button>
                      <button
                        style={btnGhostButton}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/classes/oneday/classes/${item.classId}`);
                        }}
                      >
                        상세 보기
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Input({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={input} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={input}>
        {options.map((opt) => (
          <option key={opt.value || "_empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 10,
  marginBottom: 10,
};

const input = {
  height: 38,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "0 10px",
  minWidth: 180,
};

const labelStyle = { fontSize: 12, color: "#6b7280", fontWeight: 700 };

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  cursor: "pointer",
};

const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const closedBadge = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 700,
};

const btnPrimary = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhostButton = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
};

const okBox = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 10,
  padding: 10,
};
