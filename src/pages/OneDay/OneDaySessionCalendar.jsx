import { useEffect, useMemo, useState } from "react";
import "./OneDaySessionCalendar.css";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return null;

  const [year, month, day] = String(dateKey).split("-").map((value) => Number(value));
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  if (toDateKey(parsed) !== dateKey) return null;
  return parsed;
}

function parseMonthKey(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(String(monthKey || ""))) return null;
  const [year, month] = String(monthKey).split("-").map((value) => Number(value));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function toMonthKey(dateKey) {
  return String(dateKey || "").slice(0, 7);
}

function toMonthLabel(monthKey) {
  const parts = parseMonthKey(monthKey);
  if (!parts) return "-";
  const date = new Date(parts.year, parts.month - 1, 1);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function toDateLabel(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function buildMonthKeyRange(firstDateKey, lastDateKey) {
  const firstMonth = parseMonthKey(toMonthKey(firstDateKey));
  const lastMonth = parseMonthKey(toMonthKey(lastDateKey));
  if (!firstMonth || !lastMonth) return [];

  const monthKeys = [];
  let year = firstMonth.year;
  let month = firstMonth.month;
  const endKey = `${lastMonth.year}-${String(lastMonth.month).padStart(2, "0")}`;

  while (true) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    monthKeys.push(key);
    if (key === endKey) break;

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return monthKeys;
}

function buildMonthCells(monthKey) {
  const parts = parseMonthKey(monthKey);
  if (!parts) return [];

  const firstDate = new Date(parts.year, parts.month - 1, 1);
  const startOffset = firstDate.getDay();
  const gridStartDate = new Date(parts.year, parts.month - 1, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(
      gridStartDate.getFullYear(),
      gridStartDate.getMonth(),
      gridStartDate.getDate() + index
    );
    return {
      dateKey: toDateKey(cellDate),
      dayOfMonth: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === firstDate.getMonth(),
    };
  });
}

function normalizeDateOptions(dateOptions) {
  const safeList = Array.isArray(dateOptions) ? dateOptions : [];
  return [...new Set(safeList.filter((value) => parseDateKey(value) !== null))].sort((left, right) =>
    left.localeCompare(right)
  );
}

export default function OneDaySessionCalendar({
  dateOptions = [],
  selectedDate = "",
  onSelectDate,
  sessionCountByDate = {},
  className = "",
  label = "날짜 선택",
  emptyText = "선택 가능한 날짜가 없습니다.",
  compact = false,
}) {
  const sortedDateOptions = useMemo(() => normalizeDateOptions(dateOptions), [dateOptions]);
  const availableDateSet = useMemo(() => new Set(sortedDateOptions), [sortedDateOptions]);

  const monthKeys = useMemo(() => {
    if (sortedDateOptions.length === 0) return [];
    return buildMonthKeyRange(
      sortedDateOptions[0],
      sortedDateOptions[sortedDateOptions.length - 1]
    );
  }, [sortedDateOptions]);

  const [visibleMonthIndex, setVisibleMonthIndex] = useState(0);

  useEffect(() => {
    if (monthKeys.length === 0) {
      setVisibleMonthIndex(0);
      return;
    }

    const selectedMonthIndex = monthKeys.findIndex((monthKey) => monthKey === toMonthKey(selectedDate));
    if (selectedMonthIndex < 0) {
      setVisibleMonthIndex((previous) => Math.min(previous, Math.max(monthKeys.length - 1, 0)));
      return;
    }

    setVisibleMonthIndex((previous) => {
      if (compact) return selectedMonthIndex;
      if (selectedMonthIndex < previous) return selectedMonthIndex;
      if (selectedMonthIndex > previous + 1) return selectedMonthIndex;
      return previous;
    });
  }, [compact, monthKeys, selectedDate]);

  const maxStartIndex = Math.max(monthKeys.length - (compact ? 1 : 2), 0);
  const normalizedMonthIndex = Math.min(Math.max(visibleMonthIndex, 0), maxStartIndex);
  const displayedMonthKeys = compact
    ? monthKeys.slice(normalizedMonthIndex, normalizedMonthIndex + 1)
    : monthKeys.slice(normalizedMonthIndex, normalizedMonthIndex + 2);

  const canMovePrevious = normalizedMonthIndex > 0;
  const canMoveNext = normalizedMonthIndex < maxStartIndex;

  const calendarClassName = `odsc-root ${compact ? "is-compact" : ""} ${className}`.trim();

  if (sortedDateOptions.length === 0) {
    return (
      <div className={calendarClassName}>
        <p className="odsc-empty">{emptyText}</p>
      </div>
    );
  }

  const selectedDateText = selectedDate ? toDateLabel(selectedDate) : "날짜를 선택해 주세요";
  const monthTitle = displayedMonthKeys.length > 1
    ? `${toMonthLabel(displayedMonthKeys[0])} - ${toMonthLabel(displayedMonthKeys[displayedMonthKeys.length - 1])}`
    : toMonthLabel(displayedMonthKeys[0]);

  return (
    <div className={calendarClassName}>
      <div className="odsc-head">
        <div>
          <p className="odsc-label">{label}</p>
          <strong className="odsc-selected">{selectedDateText}</strong>
        </div>
        <div className="odsc-nav">
          <button
            type="button"
            className="odsc-nav-btn"
            onClick={() => setVisibleMonthIndex((previous) => Math.max(previous - 1, 0))}
            disabled={!canMovePrevious}
            aria-label="이전 달 보기"
          >
            이전
          </button>
          <strong className="odsc-nav-title">{monthTitle}</strong>
          <button
            type="button"
            className="odsc-nav-btn"
            onClick={() => setVisibleMonthIndex((previous) => Math.min(previous + 1, maxStartIndex))}
            disabled={!canMoveNext}
            aria-label="다음 달 보기"
          >
            다음
          </button>
        </div>
      </div>

      <div className="odsc-month-panels">
        {displayedMonthKeys.map((monthKey) => {
          const monthCells = buildMonthCells(monthKey);

          return (
            <section key={monthKey} className="odsc-month">
              <header className="odsc-month-title">{toMonthLabel(monthKey)}</header>
              <div className="odsc-week-row">
                {WEEKDAY_LABELS.map((weekday) => (
                  <span key={`${monthKey}-${weekday}`} className="odsc-weekday">
                    {weekday}
                  </span>
                ))}
              </div>
              <div className="odsc-day-grid">
                {monthCells.map((cell) => {
                  const isAvailable = cell.inCurrentMonth && availableDateSet.has(cell.dateKey);
                  const isSelected = selectedDate === cell.dateKey;
                  const sessionCount = Number(sessionCountByDate?.[cell.dateKey] ?? 0);

                  if (!cell.inCurrentMonth) {
                    return <span key={`${monthKey}-${cell.dateKey}`} className="odsc-day-spacer" />;
                  }

                  return (
                    <button
                      key={`${monthKey}-${cell.dateKey}`}
                      type="button"
                      className={`odsc-day-btn ${isAvailable ? "is-available" : "is-disabled"} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => onSelectDate?.(cell.dateKey)}
                      disabled={!isAvailable}
                      aria-pressed={isSelected}
                      aria-label={`${toDateLabel(cell.dateKey)} ${isAvailable ? "선택 가능" : "선택 불가"}`}
                    >
                      <span className="odsc-day-number">{cell.dayOfMonth}</span>
                      {isAvailable && sessionCount > 0 ? (
                        <span className="odsc-day-count">{sessionCount}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="odsc-legend">
        <span className="odsc-legend-item">
          <i className="odsc-legend-dot odsc-legend-dot-available" />
          예약 가능
        </span>
        <span className="odsc-legend-item">
          <i className="odsc-legend-dot odsc-legend-dot-selected" />
          선택 날짜
        </span>
      </div>
    </div>
  );
}
