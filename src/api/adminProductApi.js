import { http } from "./http";

export async function fetchAdminProducts(params) {
  const res = await http.get("/api/products", { params });
  return res.data;
}

export async function fetchAdminProductDetail(productId) {
  const res = await http.get(`/api/products/${Number(productId)}`);
  return res.data;
}

export async function createAdminProduct(payload) {
  const res = await http.post("/api/products", payload);
  return res.data;
}

export async function updateAdminProduct(productId, payload) {
  const res = await http.put(`/api/products/${Number(productId)}`, payload);
  return res.data;
}

export async function fetchProductImages(productId) {
  const res = await http.get(`/api/products/${Number(productId)}/images`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function uploadProductImages(productId, files, repIndex) {
  const fd = new FormData();
  (files || []).forEach((file) => fd.append("files", file));
  if (repIndex !== undefined && repIndex !== null) {
    fd.append("repIndex", String(repIndex));
  }
  const res = await http.post(`/api/products/${Number(productId)}/images`, fd);
  return Array.isArray(res.data) ? res.data : [];
}

export async function deleteProductImage(productId, imageId) {
  await http.del(`/api/products/${Number(productId)}/images/${Number(imageId)}`);
}

export async function fetchAdminProductInquiries(page = 0, size = 20) {
  const res = await http.get("/api/admin/inquiries", { params: { page, size } });
  return res.data;
}

export async function answerAdminProductInquiry(inqId, answer) {
  const res = await http.post(`/api/inquiries/${Number(inqId)}/answer`, { answer });
  return res.data;
}

export async function fetchProductReviewsByProduct(productId, page = 0, size = 20, opt = {}) {
  const params = {
    page,
    size,
    sort: opt.sort || "LATEST",
    rating: opt.rating,
    keyword: opt.keyword,
  };
  const res = await http.get(`/api/products/${Number(productId)}/reviews`, { params });
  return res.data;
}
