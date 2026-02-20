import { http } from "./http";

export async function fetchProducts(params) {
  const res = await http.get("/api/products", { params });
  return res.data; // Page 형태: {content, totalPages, number, ...}
}

export async function fetchProductDetail(id) {
  const res = await http.get(`/api/products/${id}`);
  return res.data; // ProductDetailResponseDto
}

// 상품 등록 + 이미지(최소 1장 필수) : multipart
export async function createProductWithImages({ product, files, repIndex }) {
  const fd = new FormData();

  fd.append(
    "product",
    new Blob([JSON.stringify(product)], { type: "application/json" })
  );

  files.forEach((f) => fd.append("files", f));
  fd.append("repIndex", String(repIndex ?? 0));

  // ✅ headers 절대 지정하지 말 것!
  const res = await http.post("/api/products", fd);

  // ApiResponse 래핑/비래핑 둘 다 대응
  return res.data?.data ?? res.data;
}
