const LEVEL_LABELS = {
  BEGINNER: "입문",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

const RUN_TYPE_LABELS = {
  ALWAYS: "상시",
  EVENT: "이벤트",
};

const CATEGORY_LABELS = {
  KOREAN: "한식",
  BAKERY: "베이커리",
};

const SLOT_LABELS = {
  AM: "오전",
  PM: "오후",
};

const RESERVATION_STATUS_LABELS = {
  HOLD: "예약 대기",
  PAID: "예약 확정",
  CANCELED: "예약 취소",
  EXPIRED: "기간 만료",
  COMPLETED: "수강 완료",
};

const SESSION_SORT_LABELS = {
  startAtAsc: "시작시간 빠른순",
  priceAsc: "가격 낮은순",
  priceDesc: "가격 높은순",
};

const DISCOUNT_TYPE_LABELS = {
  RATE: "정률 할인",
  PERCENT: "정률 할인",
  FIXED: "정액 할인",
  AMOUNT: "정액 할인",
};

function toLabel(map, value, fallback = "-") {
  if (!value) return fallback;
  return map[value] ?? value;
}

export const toLevelLabel = (value) => toLabel(LEVEL_LABELS, value);
export const toRunTypeLabel = (value) => toLabel(RUN_TYPE_LABELS, value);
export const toCategoryLabel = (value) => toLabel(CATEGORY_LABELS, value);
export const toSlotLabel = (value) => toLabel(SLOT_LABELS, value);
export const toReservationStatusLabel = (value) => toLabel(RESERVATION_STATUS_LABELS, value);
export const toSessionSortLabel = (value) => toLabel(SESSION_SORT_LABELS, value);
export const toDiscountTypeLabel = (value) => toLabel(DISCOUNT_TYPE_LABELS, value);

