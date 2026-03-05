function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizePagePayload(payload) {
  const src = payload && typeof payload === "object" ? payload : {};
  const nestedPage = src.page && typeof src.page === "object" ? src.page : null;

  const content = Array.isArray(src.content)
    ? src.content
    : Array.isArray(src?.data?.content)
      ? src.data.content
      : [];

  const number =
    toNumber(src.number) ??
    (nestedPage ? toNumber(nestedPage.number) : null) ??
    (!nestedPage ? toNumber(src.page) : null) ??
    0;

  const totalPagesRaw =
    toNumber(src.totalPages) ??
    (nestedPage ? toNumber(nestedPage.totalPages) : null) ??
    1;
  const totalPages = Math.max(1, totalPagesRaw);

  const totalElements =
    toNumber(src.totalElements) ??
    (nestedPage ? toNumber(nestedPage.totalElements) : null) ??
    content.length;

  const hasPrevious = Boolean(
    src.hasPrevious ?? (nestedPage ? nestedPage.hasPrevious : undefined) ?? (number > 0)
  );

  const hasNext = Boolean(
    src.hasNext ??
      (nestedPage ? nestedPage.hasNext : undefined) ??
      (number + 1 < totalPages)
  );

  return {
    ...src,
    content,
    number,
    totalPages,
    totalElements,
    hasPrevious,
    hasNext,
  };
}
