/**
 * 원데이 클래스/세션 화면에서 공통으로 쓰는 계산 유틸 모음입니다.
 * - 같은 로직이 여러 파일에 복붙되면, 수정 시 누락/불일치가 생기기 쉬워서 한곳으로 모았습니다.
 */

export function toClassId(item) {
  return Number(item?.id ?? item?.classId ?? 0);
}

export function toSessionId(session) {
  return Number(session?.sessionId ?? session?.id ?? 0);
}

/**
 * 세션 시작 시간이 현재보다 과거/현재이면 "종료"로 판단합니다.
 * - 서버 completed 플래그가 늦게 반영되는 순간에도 화면 상태를 안정적으로 보여주기 위한 보완 로직입니다.
 */
export function isSessionCompletedByTime(startAt) {
  if (!startAt) return false;
  const time = new Date(startAt).getTime();
  if (Number.isNaN(time)) return false;
  return time <= Date.now();
}

export function toSessionStatus(session) {
  const capacity = Number(session?.capacity ?? 0);
  const reserved = Number(session?.reservedCount ?? 0);
  const full = Boolean(session?.full) || capacity <= reserved;
  const completed = Boolean(session?.completed) || isSessionCompletedByTime(session?.startAt);
  return { full, completed };
}

/**
 * 클래스 단위 상태 계산:
 * - 오전/오후별 종료 여부
 * - 오전/오후별 마감 여부
 * - 클래스 전체 종료 여부
 * - 예약 가능한 세션 존재 여부
 */
export function toClassSlotStatus(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const hasSessions = list.length > 0;

  const amSessions = list.filter((session) => session?.slot === "AM");
  const pmSessions = list.filter((session) => session?.slot === "PM");

  const calcSlot = (targetSessions) => {
    if (targetSessions.length === 0) return { completed: false, full: false };

    const completed = targetSessions.every((session) => toSessionStatus(session).completed);
    if (completed) return { completed: true, full: false };

    const upcoming = targetSessions.filter((session) => !toSessionStatus(session).completed);
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

export function toDateMillis(value) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function toIsoDateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
