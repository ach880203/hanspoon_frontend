import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOneDayClass,
  deleteOneDayClass,
  getOneDayClassDetail,
  getOneDayClasses,
  getOneDayClassSessions,
  updateOneDayClass,
} from "../../api/onedayApi";
import "./AdminOneDayClassManager.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_COUNT = 10;

const EMPTY_FORM = {
  id: null,
  title: "",
  description: "",
  detailDescription: "",
  detailImageDataList: [],
  level: "BEGINNER",
  runType: "ALWAYS",
  category: "KOREAN",
  instructorId: "",
  sessions: [{ startAt: "", slot: "AM", capacity: "10", price: "50000" }],
};

export default function AdminOneDayClassManager() {
  const [mode, setMode] = useState("list"); // list | create | edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const payload = useMemo(() => {
    const instructorId = Number(form.instructorId);
    const detailImageDataList = Array.isArray(form.detailImageDataList) ? form.detailImageDataList : [];

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      detailDescription: form.detailDescription.trim(),
      // 백엔드 하위 호환용 단일 필드 + 신규 다중 필드를 함께 전달합니다.
      detailImageData: detailImageDataList[0] || "",
      detailImageDataList,
      level: form.level,
      runType: form.runType,
      category: form.category,
      instructorId: Number.isInteger(instructorId) && instructorId > 0 ? instructorId : null,
      sessions: form.sessions.map((row) => ({
        startAt: toIsoWithSeconds(row.startAt),
        slot: row.slot,
        capacity: Number(row.capacity),
        price: Number(row.price),
      })),
    };
  }, [form]);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOneDayClasses({ page: 0, size: 200, sort: "createdAt,desc" });
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setClasses(list);
    } catch (e) {
      setError(e?.message ?? "클래스 목록을 불러오지 못했습니다.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const openCreate = () => {
    setMode("create");
    setForm(EMPTY_FORM);
    setError("");
    setMessage("");
  };

  const openEdit = async (classId) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [detail, sessions] = await Promise.all([
        getOneDayClassDetail(classId),
        getOneDayClassSessions(classId),
      ]);

      const normalizedSessions = (Array.isArray(sessions) ? sessions : []).map((session) => ({
        startAt: toDatetimeLocal(session.startAt),
        slot: session.slot || "AM",
        capacity: String(session.capacity ?? 10),
        price: String(session.price ?? 0),
      }));

      const detailImages = Array.isArray(detail?.detailImageDataList)
        ? detail.detailImageDataList.filter((x) => typeof x === "string" && x.length > 0)
        : detail?.detailImageData
        ? [detail.detailImageData]
        : [];

      setForm({
        id: detail?.id ?? classId,
        title: detail?.title ?? "",
        description: detail?.description ?? "",
        detailDescription: detail?.detailDescription ?? "",
        detailImageDataList: detailImages,
        level: detail?.level ?? "BEGINNER",
        runType: detail?.runType ?? "ALWAYS",
        category: detail?.category ?? "KOREAN",
        instructorId: String(detail?.instructorId ?? ""),
        sessions: normalizedSessions.length > 0 ? normalizedSessions : EMPTY_FORM.sessions,
      });
      setMode("edit");
    } catch (e) {
      setError(e?.message ?? "클래스 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!payload.title) return "클래스 제목을 입력해 주세요.";
    if (!payload.description) return "요약 설명을 입력해 주세요.";
    if (!payload.detailDescription) return "상세 설명을 입력해 주세요.";
    if (!payload.instructorId) return "강사 ID를 입력해 주세요.";
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) return "세션은 최소 1개가 필요합니다.";
    if ((payload.detailImageDataList?.length ?? 0) > MAX_IMAGE_COUNT) return `상세 이미지는 최대 ${MAX_IMAGE_COUNT}장까지 등록할 수 있습니다.`;

    for (let i = 0; i < payload.sessions.length; i += 1) {
      const row = payload.sessions[i];
      const prefix = `세션 ${i + 1}`;
      if (!row.startAt) return `${prefix} 시작일시를 입력해 주세요.`;
      if (!row.slot) return `${prefix} 시간대를 선택해 주세요.`;
      if (!Number.isInteger(row.capacity) || row.capacity <= 0) return `${prefix} 정원은 1 이상이어야 합니다.`;
      if (!Number.isInteger(row.price) || row.price < 0) return `${prefix} 가격은 0 이상이어야 합니다.`;
    }
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createOneDayClass(payload);
        setMessage("클래스가 등록되었습니다.");
      } else {
        await updateOneDayClass(form.id, payload);
        setMessage("클래스가 수정되었습니다.");
      }

      await loadClasses();
      setMode("list");
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.message ?? "요청 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeClass = async (classId) => {
    if (!window.confirm("클래스를 삭제하시겠습니까? 예약 이력이 있으면 삭제할 수 없습니다.")) return;
    setError("");
    setMessage("");
    try {
      await deleteOneDayClass(classId);
      setMessage("클래스가 삭제되었습니다.");
      await loadClasses();
    } catch (e) {
      setError(e?.message ?? "클래스 삭제에 실패했습니다.");
    }
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const setSessionField = (index, name, value) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    }));
  };

  const addSession = () => {
    setForm((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { startAt: "", slot: "PM", capacity: "10", price: "50000" }],
    }));
  };

  const removeSession = (index) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.length <= 1 ? prev.sessions : prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const handleImageFiles = async (event) => {
    setError("");
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remain = MAX_IMAGE_COUNT - form.detailImageDataList.length;
    if (remain <= 0) {
      setError(`상세 이미지는 최대 ${MAX_IMAGE_COUNT}장까지 등록할 수 있습니다.`);
      return;
    }

    const limited = files.slice(0, remain);
    const nextImages = [];

    for (const file of limited) {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError("이미지 파일은 2MB 이하만 업로드할 수 있습니다.");
        return;
      }
      nextImages.push(await readFileAsDataUrl(file));
    }

    setField("detailImageDataList", [...form.detailImageDataList, ...nextImages]);
    event.target.value = "";
  };

  const removeDetailImage = (index) => {
    setField(
      "detailImageDataList",
      form.detailImageDataList.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="admin-oneday-wrap">
      <div className="admin-oneday-head">
        <div>
          <h2>원데이 클래스 관리</h2>
          <p>관리자 페이지 내부에서 클래스 등록/조회/수정/삭제를 모두 처리할 수 있습니다.</p>
        </div>
        <div className="admin-oneday-head-actions">
          <button className="btn-ghost" onClick={loadClasses} disabled={loading}>
            {loading ? "불러오는 중..." : "전체 클래스 새로고침"}
          </button>
          <button className="btn-primary" onClick={openCreate}>
            클래스 등록
          </button>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-oneday-grid">
        <section className="admin-oneday-panel">
          <h3>전체 클래스</h3>
          {classes.length === 0 ? (
            <div className="muted">등록된 클래스가 없습니다.</div>
          ) : (
            <div className="class-list">
              {classes.map((item) => (
                <article key={item.id} className="class-row">
                  <div className="class-row-main">
                    <strong>{item.title || `클래스 #${item.id}`}</strong>
                    <div className="class-row-meta">
                      <span>{toKoreanLevel(item.level)}</span>
                      <span>{toKoreanRunType(item.runType)}</span>
                      <span>{toKoreanCategory(item.category)}</span>
                      <span>강사 ID: {item.instructorId ?? "-"}</span>
                    </div>
                  </div>
                  <div className="class-row-actions">
                    <button className="btn-ghost" onClick={() => openEdit(item.id)}>
                      수정
                    </button>
                    <button className="btn-danger" onClick={() => removeClass(item.id)}>
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-oneday-panel">
          <h3>{mode === "create" ? "클래스 등록" : mode === "edit" ? `클래스 수정 #${form.id}` : "입력 대기"}</h3>
          {mode === "list" ? (
            <div className="muted">왼쪽 목록에서 수정할 클래스를 선택하거나 "클래스 등록" 버튼을 눌러 주세요.</div>
          ) : (
            <form className="class-form" onSubmit={submit}>
              <label>
                <span>클래스 제목</span>
                <input value={form.title} onChange={(e) => setField("title", e.target.value)} maxLength={80} />
              </label>

              <label>
                <span>요약 설명</span>
                <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </label>

              <label>
                <span>상세 설명</span>
                <textarea
                  className="detail-textarea"
                  value={form.detailDescription}
                  onChange={(e) => setField("detailDescription", e.target.value)}
                />
              </label>

              <label>
                <span>상세 이미지 (여러 장)</span>
                <input type="file" accept="image/*" multiple onChange={handleImageFiles} />
              </label>
              {form.detailImageDataList.length > 0 ? (
                <div className="preview-wrap">
                  <div className="preview-grid">
                    {form.detailImageDataList.map((img, index) => (
                      <div key={`detail-img-${index}`} className="preview-item">
                        <img src={img} alt={`상세 이미지 ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => removeDetailImage(index)}
                        >
                          이미지 삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="class-form-grid">
                <label>
                  <span>강사 ID</span>
                  <input
                    type="number"
                    min="1"
                    value={form.instructorId}
                    onChange={(e) => setField("instructorId", e.target.value)}
                  />
                </label>

                <label>
                  <span>레벨</span>
                  <select value={form.level} onChange={(e) => setField("level", e.target.value)}>
                    <option value="BEGINNER">입문</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="ADVANCED">고급</option>
                  </select>
                </label>

                <label>
                  <span>운영 유형</span>
                  <select value={form.runType} onChange={(e) => setField("runType", e.target.value)}>
                    <option value="ALWAYS">상시</option>
                    <option value="EVENT">이벤트</option>
                  </select>
                </label>

                <label>
                  <span>카테고리</span>
                  <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
                    <option value="KOREAN">한식</option>
                    <option value="BAKERY">베이커리</option>
                  </select>
                </label>
              </div>

              <div className="session-head">
                <strong>세션 목록</strong>
                <button type="button" className="btn-ghost" onClick={addSession}>
                  세션 추가
                </button>
              </div>

              <div className="session-list">
                {form.sessions.map((session, index) => (
                  <article key={`session-${index}`} className="session-row">
                    <div className="session-row-head">
                      <strong>세션 {index + 1}</strong>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeSession(index)}
                        disabled={form.sessions.length <= 1}
                      >
                        삭제
                      </button>
                    </div>
                    <div className="session-grid">
                      <label>
                        <span>시작일시</span>
                        <input
                          type="datetime-local"
                          value={session.startAt}
                          onChange={(e) => setSessionField(index, "startAt", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>시간대</span>
                        <select value={session.slot} onChange={(e) => setSessionField(index, "slot", e.target.value)}>
                          <option value="AM">오전</option>
                          <option value="PM">오후</option>
                        </select>
                      </label>
                      <label>
                        <span>정원</span>
                        <input
                          type="number"
                          min="1"
                          value={session.capacity}
                          onChange={(e) => setSessionField(index, "capacity", e.target.value)}
                        />
                      </label>
                      <label>
                        <span>가격</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={session.price}
                          onChange={(e) => setSessionField(index, "price", e.target.value)}
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "처리 중..." : mode === "create" ? "등록하기" : "수정 저장"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setMode("list");
                    setForm(EMPTY_FORM);
                    setError("");
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function toIsoWithSeconds(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

function toKoreanLevel(level) {
  if (level === "BEGINNER") return "입문";
  if (level === "INTERMEDIATE") return "중급";
  if (level === "ADVANCED") return "고급";
  return level || "-";
}

function toKoreanRunType(runType) {
  if (runType === "ALWAYS") return "상시";
  if (runType === "EVENT") return "이벤트";
  return runType || "-";
}

function toKoreanCategory(category) {
  if (category === "KOREAN") return "한식";
  if (category === "BAKERY") return "베이커리";
  return category || "-";
}
