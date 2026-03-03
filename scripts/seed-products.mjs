import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const BASE_URL = (process.env.SEED_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const DATA_FILE = process.env.SEED_FILE || path.join(projectRoot, "seed", "products.sample.json");
const ADMIN_TOKEN = process.env.SEED_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "";
const ADMIN_COOKIE = process.env.SEED_COOKIE || "";
const DRY_RUN = String(process.env.SEED_DRY_RUN || "false").toLowerCase() === "true";

const HEADERS = {
  ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
  ...(ADMIN_COOKIE ? { Cookie: ADMIN_COOKIE } : {}),
};

function slugify(value) {
  return String(value || "product")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "product";
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function categoryTheme(category) {
  if (category === "INGREDIENT") return { a: "#DFF7E2", b: "#9AD0A5", c: "#2F6A3A" };
  if (category === "MEAL_KIT") return { a: "#FFEBD9", b: "#F4B788", c: "#7A3A10" };
  return { a: "#E7EEFF", b: "#B5C7F5", c: "#243B73" };
}

function buildSvg({ title, subtitle, category, width, height }) {
  const t = categoryTheme(category);
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle || "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.a}"/>
      <stop offset="100%" stop-color="${t.b}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="28"/>
  <circle cx="${Math.round(width * 0.15)}" cy="${Math.round(height * 0.2)}" r="${Math.round(Math.min(width, height) * 0.11)}" fill="#ffffff55"/>
  <circle cx="${Math.round(width * 0.85)}" cy="${Math.round(height * 0.78)}" r="${Math.round(Math.min(width, height) * 0.09)}" fill="#ffffff66"/>
  <rect x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.62)}" width="${Math.round(width * 0.84)}" height="${Math.round(height * 0.24)}" fill="#ffffffb8" rx="18"/>
  <text x="${Math.round(width * 0.11)}" y="${Math.round(height * 0.72)}" font-size="${Math.round(width * 0.055)}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" font-weight="700" fill="${t.c}">${safeTitle}</text>
  <text x="${Math.round(width * 0.11)}" y="${Math.round(height * 0.8)}" font-size="${Math.round(width * 0.03)}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" fill="#334155">${safeSubtitle}</text>
</svg>`;
}

async function httpJson(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...HEADERS,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${method} ${url} failed: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function httpMultipart(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...HEADERS,
    },
    body: formData,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] POST ${url} failed: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}

function resolveCreatedProductId(payload) {
  if (!payload) return null;
  if (typeof payload === "object" && payload.id) return Number(payload.id);
  if (typeof payload === "object" && payload.data?.id) return Number(payload.data.id);
  return null;
}

async function uploadImages(productId, category, images, type, repIndex = 0) {
  if (!Array.isArray(images) || images.length === 0) return;

  const form = new FormData();
  const isMain = type === "MAIN";

  images.forEach((img, idx) => {
    const label = img?.label || `${isMain ? "메인" : "상세"} 이미지 ${idx + 1}`;
    const subtitle = img?.subtitle || "Hanspoon Sample";
    const width = isMain ? 1200 : 1200;
    const height = isMain ? 1200 : 1600;
    const svg = buildSvg({ title: label, subtitle, category, width, height });
    const filename = `${type.toLowerCase()}-${idx + 1}.svg`;
    form.append("files", new Blob([svg], { type: "image/svg+xml" }), filename);
  });

  const uploadUrl = `${BASE_URL}/api/products/${productId}/images?type=${encodeURIComponent(type)}&repIndex=${encodeURIComponent(repIndex)}`;
  await httpMultipart(uploadUrl, form);
}

async function main() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const items = JSON.parse(raw);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`상품 데이터가 비어 있습니다: ${DATA_FILE}`);
  }

  console.log(`[seed] base url: ${BASE_URL}`);
  console.log(`[seed] data file: ${DATA_FILE}`);
  console.log(`[seed] items: ${items.length}`);
  if (!ADMIN_TOKEN && !ADMIN_COOKIE) {
    console.log("[seed] warning: 인증 헤더가 없습니다. 서버 정책에 따라 401이 발생할 수 있습니다.");
  }
  if (DRY_RUN) {
    console.log("[seed] dry run mode - 서버 요청 없이 데이터만 검증합니다.");
  }

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const name = item?.name || `샘플상품-${i + 1}`;
    const slug = slugify(name);
    const payload = {
      category: item?.category || "INGREDIENT",
      name,
      price: Number(item?.price || 0),
      stock: Number(item?.stock || 0),
      detailContent: String(item?.detailContent || ""),
    };

    console.log(`\n[${i + 1}/${items.length}] ${payload.name}`);

    if (DRY_RUN) {
      console.log("  - payload", payload);
      continue;
    }

    const created = await httpJson(`${BASE_URL}/api/products`, "POST", payload);
    const productId = resolveCreatedProductId(created);
    if (!productId) {
      throw new Error(`생성 응답에서 product id를 찾지 못했습니다: ${JSON.stringify(created)}`);
    }

    const mainImages = Array.isArray(item?.mainImages) && item.mainImages.length > 0
      ? item.mainImages
      : [{ label: `${name} 메인`, subtitle: "Hanspoon Sample" }];

    const detailImages = Array.isArray(item?.detailImages)
      ? item.detailImages
      : [];

    await uploadImages(productId, payload.category, mainImages, "MAIN", Number(item?.repIndex || 0));
    await uploadImages(productId, payload.category, detailImages, "DETAIL", 0);

    console.log(`  - created id=${productId} / main=${mainImages.length} / detail=${detailImages.length} / slug=${slug}`);
  }

  console.log("\n[seed] 완료");
}

main().catch((err) => {
  console.error("[seed] 실패", err?.message || err);
  process.exit(1);
});