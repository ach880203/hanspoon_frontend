import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import "./AdminBannerManager.css";

const EMPTY_FORM = {
  bannerId: null,
  eyebrow: "",
  title: "",
  period: "",
  imageSrc: "",
  imageAlt: "",
  bg: "#efe7da",
  toPath: "/products",
  href: "",
  sortOrder: 0,
  isActive: true,
  badges: [],
};

function normalizeBadges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && item.label)
    .map((item) => ({
      label: String(item.label || ""),
      tone: item.tone === "dark" ? "dark" : "light",
    }));
}

function toForm(item) {
  return {
    bannerId: item?.bannerId ?? null,
    eyebrow: item?.eyebrow ?? "",
    title: item?.title ?? "",
    period: item?.period ?? "",
    imageSrc: item?.imageSrc ?? "",
    imageAlt: item?.imageAlt ?? "",
    bg: item?.bg ?? "#efe7da",
    toPath: item?.toPath ?? "/products",
    href: item?.href ?? "",
    sortOrder: Number(item?.sortOrder ?? 0),
    isActive: Boolean(item?.isActive ?? true),
    badges: normalizeBadges(item?.badges),
  };
}

export default function AdminBannerManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [keyword, setKeyword] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getBanners();
      const list = Array.isArray(response?.data) ? response.data : [];
      setItems(list);
    } catch (e) {
      setItems([]);
      setError(e?.message || "배너 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const filteredItems = useMemo(() => {
    const term = String(keyword || "").trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const text = [
        item?.bannerId,
        item?.title,
        item?.eyebrow,
        item?.period,
        item?.toPath,
        item?.href,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return text.includes(term);
    });
  }, [items, keyword]);

  const openCreate = () => {
    setMode("create");
    setForm(EMPTY_FORM);
    setError("");
    setMessage("");
  };

  const openEdit = async (id) => {
    setMode("edit");
    setError("");
    setMessage("");
    try {
      const response = await adminApi.getBanner(id);
      setForm(toForm(response?.data || {}));
    } catch (e) {
      setError(e?.message || "배너 정보를 불러오지 못했습니다.");
      setMode("list");
      setForm(EMPTY_FORM);
    }
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setBadgeField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.map((badge, idx) => (idx === index ? { ...badge, [key]: value } : badge)),
    }));
  };

  const addBadge = () => {
    setForm((prev) => ({
      ...prev,
      badges: [...prev.badges, { label: "", tone: "light" }],
    }));
  };

  const removeBadge = (index) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.filter((_, idx) => idx !== index),
    }));
  };

  const validate = () => {
    if (!String(form.title || "").trim()) return "배너 제목은 필수입니다.";
    if (!String(form.imageSrc || "").trim()) return "이미지 URL은 필수입니다.";
    if (Number(form.sortOrder) < 0) return "정렬 순서는 0 이상이어야 합니다.";
    return "";
  };

  const toPayload = () => ({
    eyebrow: String(form.eyebrow || "").trim(),
    title: String(form.title || "").trim(),
    period: String(form.period || "").trim(),
    imageSrc: String(form.imageSrc || "").trim(),
    imageAlt: String(form.imageAlt || "").trim(),
    bg: String(form.bg || "").trim(),
    toPath: String(form.toPath || "").trim(),
    href: String(form.href || "").trim(),
    sortOrder: Number(form.sortOrder || 0),
    isActive: Boolean(form.isActive),
    badges: normalizeBadges(form.badges),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = toPayload();
      if (mode === "create") {
        await adminApi.createBanner(payload);
        setMessage("배너가 등록되었습니다.");
      } else {
        await adminApi.updateBanner(form.bannerId, payload);
        setMessage("배너가 수정되었습니다.");
      }
      await loadBanners();
      setMode("list");
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message || "배너 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const onUploadImageFile = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const file = files[0];
    if (!String(file.type || "").startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.uploadBannerImage(file);
      const uploadedUrl = response?.data || "";
      if (!uploadedUrl) {
        throw new Error("업로드된 이미지 URL을 받지 못했습니다.");
      }
      setField("imageSrc", uploadedUrl);
      setMessage("이미지 업로드가 완료되었습니다.");
    } catch (e) {
      setError(e?.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeBanner = async (id) => {
    if (!window.confirm("배너를 삭제하시겠습니까?")) return;
    setError("");
    setMessage("");
    try {
      await adminApi.deleteBanner(id);
      setMessage("배너가 삭제되었습니다.");
      await loadBanners();
      if (Number(form.bannerId) === Number(id)) {
        setForm(EMPTY_FORM);
        setMode("list");
      }
    } catch (e) {
      setError(e?.message || "배너 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="admin-banner-wrap">
      <div className="admin-oneday-head">
        <div>
          <h2>배너 관리</h2>
          <p>메인 BannerSection에 노출될 배너를 등록/수정하고 노출 순서를 관리합니다.</p>
        </div>
        <div className="admin-oneday-head-actions">
          <button type="button" className="btn-primary" onClick={openCreate}>
            배너 등록
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMode("list");
              setForm(EMPTY_FORM);
            }}
          >
            취소
          </button>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-oneday-grid">
        <section className="admin-oneday-panel">
          <h3>배너 목록</h3>
          <div className="admin-class-panel-actions">
            <input
              className="admin-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목/문구 검색"
            />
            <button type="button" className="admin-btn-search" onClick={loadBanners} disabled={loading}>
              {loading ? "조회 중..." : "새로고침"}
            </button>
          </div>

          <div className="class-list">
            {filteredItems.length === 0 ? (
              <div className="admin-banner-empty">등록된 배너가 없습니다.</div>
            ) : (
              filteredItems.map((item) => (
                <article
                  key={item.bannerId}
                  className={`class-row ${Number(form.bannerId) === Number(item.bannerId) ? "is-active" : ""}`}
                  onClick={() => openEdit(item.bannerId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEdit(item.bannerId);
                    }
                  }}
                >
                  <div className="class-row-main">
                    <strong>{item.title || `배너 #${item.bannerId}`}</strong>
                    <div className="class-row-meta">
                      <span>정렬 {item.sortOrder ?? 0}</span>
                      <span>{item.isActive ? "노출" : "비노출"}</span>
                    </div>
                  </div>
                  <div className="class-row-actions">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBanner(item.bannerId);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="admin-oneday-panel">
          <h3>{mode === "create" ? "배너 등록" : mode === "edit" ? `배너 수정 #${form.bannerId}` : "입력 대기"}</h3>
          {mode === "list" ? (
            <div className="muted">좌측 목록에서 배너를 선택하거나 "배너 등록" 버튼을 눌러주세요.</div>
          ) : (
            <form className="class-form" onSubmit={onSubmit}>
              <div className="class-form-grid">
                <label>
                  <span>상단 문구</span>
                  <input value={form.eyebrow} onChange={(e) => setField("eyebrow", e.target.value)} />
                </label>
                <label>
                  <span>배너 제목</span>
                  <input value={form.title} onChange={(e) => setField("title", e.target.value)} required />
                </label>
              </div>

              <div className="class-form-grid">
                <label>
                  <span>기간 문구</span>
                  <input value={form.period} onChange={(e) => setField("period", e.target.value)} />
                </label>
                <label>
                  <span>배경색</span>
                  <input value={form.bg} onChange={(e) => setField("bg", e.target.value)} placeholder="#efe7da" />
                </label>
              </div>

              <label>
                <span>이미지 URL</span>
                <input value={form.imageSrc} onChange={(e) => setField("imageSrc", e.target.value)} required />
              </label>
              <label>
                <span>이미지 파일 업로드</span>
                <input type="file" accept="image/*" onChange={onUploadImageFile} disabled={uploadingImage} />
              </label>
              <div className="muted">{uploadingImage ? "이미지 업로드 중..." : "파일 선택 시 자동 업로드됩니다."}</div>
              <label>
                <span>이미지 대체 텍스트</span>
                <input value={form.imageAlt} onChange={(e) => setField("imageAlt", e.target.value)} />
              </label>

              {form.imageSrc ? (
                <div className="admin-banner-preview">
                  <img src={form.imageSrc} alt={form.imageAlt || "배너 미리보기"} />
                </div>
              ) : null}

              <div className="class-form-grid">
                <label>
                  <span>내부 링크(to)</span>
                  <input value={form.toPath} onChange={(e) => setField("toPath", e.target.value)} placeholder="/products" />
                </label>
                <label>
                  <span>외부 링크(href)</span>
                  <input value={form.href} onChange={(e) => setField("href", e.target.value)} placeholder="https://..." />
                </label>
              </div>

              <div className="class-form-grid">
                <label>
                  <span>정렬 순서</span>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(e) => setField("sortOrder", e.target.value)}
                  />
                </label>
                <label>
                  <span>노출 여부</span>
                  <select
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => setField("isActive", e.target.value === "true")}
                  >
                    <option value="true">노출</option>
                    <option value="false">비노출</option>
                  </select>
                </label>
              </div>

              <div className="admin-banner-badges">
                <div className="session-head">
                  <strong>배지</strong>
                  <button type="button" className="btn-ghost" onClick={addBadge}>
                    배지 추가
                  </button>
                </div>
                <div className="session-list">
                  {form.badges.length === 0 ? (
                    <div className="muted">배지를 추가하면 배너 상단에 표시됩니다.</div>
                  ) : (
                    form.badges.map((badge, index) => (
                      <article key={`badge-${index}`} className="session-row">
                        <div className="session-grid">
                          <label>
                            <span>라벨</span>
                            <input
                              value={badge.label}
                              onChange={(e) => setBadgeField(index, "label", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>톤</span>
                            <select
                              value={badge.tone}
                              onChange={(e) => setBadgeField(index, "tone", e.target.value)}
                            >
                              <option value="light">light</option>
                              <option value="dark">dark</option>
                            </select>
                          </label>
                          <div className="admin-banner-badge-delete">
                            <button type="button" className="btn-danger" onClick={() => removeBadge(index)}>
                              삭제
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "처리 중..." : mode === "create" ? "등록하기" : "수정 저장"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
