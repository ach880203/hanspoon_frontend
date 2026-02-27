import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOneDayClass, isOneDayAdmin } from "../../api/onedayApi";
import { OneDayTopTabs } from "./OneDayTopTabs";

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

export const ClassOneDayCreatePage = () => {
  const navigate = useNavigate();
  const admin = isOneDayAdmin();

  const [form, setForm] = useState({
    title: "",
    description: "",
    detailDescription: "",
    detailImageData: "",
    level: "BEGINNER",
    runType: "ALWAYS",
    category: "KOREAN",
    instructorId: "",
  });

  const [sessions, setSessions] = useState([
    { startAt: "", slot: "AM", capacity: "10", price: "50000" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const payload = useMemo(() => {
    const instructorId = Number(form.instructorId);

    // 화면 입력값을 서버 DTO 형태로 변환합니다.
    // 숫자/시간 형식을 이 단계에서 맞춰두면 submit 로직이 단순해집니다.
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      detailDescription: form.detailDescription.trim(),
      detailImageData: form.detailImageData || "",
      level: form.level,
      runType: form.runType,
      category: form.category,
      instructorId: Number.isInteger(instructorId) && instructorId > 0 ? instructorId : null,
      sessions: sessions.map((row) => ({
        startAt: toIsoWithSeconds(row.startAt),
        slot: row.slot,
        capacity: Number(row.capacity),
        price: Number(row.price),
      })),
    };
  }, [form, sessions]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const setSessionField = (index, name, value) => {
    setSessions((prev) => prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)));
  };

  const addSession = () => {
    setSessions((prev) => [...prev, { startAt: "", slot: "PM", capacity: "10", price: "50000" }]);
  };

  const removeSession = (index) => {
    setSessions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleImageFile = async (event) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("이미지는 50MB 이하로 업로드해 주세요.");
      return;
    }

    const fileDataUrl = await readFileAsDataUrl(file);
    setField("detailImageData", fileDataUrl);
  };

  const validate = () => {
    if (!admin) return "관리자만 원데이 클래스를 등록할 수 있습니다.";
    if (!payload.title) return "클래스 제목을 입력해 주세요.";
    if (!payload.description) return "클래스 요약 설명을 입력해 주세요.";
    if (!payload.detailDescription) return "클래스 상세 설명을 입력해 주세요.";
    if (!payload.instructorId) return "강사 ID를 입력해 주세요.";
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) {
      return "세션은 최소 1개 이상 필요합니다.";
    }

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
      const result = await createOneDayClass(payload);
      setMessage(`클래스가 등록되었습니다. (ID: ${result?.classId ?? "-"})`);
      if (result?.classId) {
        navigate(`/classes/oneday/classes/${result.classId}`);
      }
    } catch (e) {
      setError(e?.message ?? "클래스 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1040, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>원데이 클래스 등록</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>
          클래스 기본 정보, 상세 설명, 세션 정보를 입력해 등록할 수 있습니다.
        </p>

        {!admin ? <div style={warnBox}>현재 계정은 관리자 권한이 아닙니다. 등록 요청은 서버에서 거절됩니다.</div> : null}
        {error ? <div style={errorBox}>{error}</div> : null}
        {message ? <div style={okBox}>{message}</div> : null}

        <form style={panel} onSubmit={submit}>
          <h2 style={sectionTitle}>기본 정보</h2>

          <div style={grid2}>
            <Field label="클래스 제목">
              <input
                style={input}
                value={form.title}
                maxLength={80}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="예: 주말 브런치 클래스"
              />
            </Field>

            <Field label="강사 ID">
              <input
                style={input}
                type="number"
                min="1"
                value={form.instructorId}
                onChange={(e) => setField("instructorId", e.target.value)}
                placeholder="예: 1"
              />
            </Field>
          </div>

          <Field label="요약 설명">
            <textarea
              style={textarea}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="클래스 카드에 표시할 짧은 설명을 입력해 주세요."
            />
          </Field>

          <Field label="상세 설명">
            <textarea
              style={{ ...textarea, minHeight: 180 }}
              value={form.detailDescription}
              onChange={(e) => setField("detailDescription", e.target.value)}
              placeholder="상세 페이지에서 보여줄 설명을 입력해 주세요."
            />
          </Field>

          <Field label="상세 이미지">
            <div style={{ display: "grid", gap: 10 }}>
              <input type="file" accept="image/*" onChange={handleImageFile} />
              {form.detailImageData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <img
                    src={form.detailImageData}
                    alt="상세 이미지 미리보기"
                    style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }}
                  />
                  <button type="button" style={btnGhost} onClick={() => setField("detailImageData", "")}>이미지 제거</button>
                </div>
              ) : (
                <span style={{ color: "#6b7280", fontSize: 13 }}>이미지를 선택하면 상세 페이지 상단에 표시됩니다.</span>
              )}
            </div>
          </Field>

          <div style={grid3}>
            <Field label="레벨">
              <select style={input} value={form.level} onChange={(e) => setField("level", e.target.value)}>
                <option value="BEGINNER">입문</option>
                <option value="INTERMEDIATE">중급</option>
                <option value="ADVANCED">고급</option>
              </select>
            </Field>

            <Field label="운영 유형">
              <select style={input} value={form.runType} onChange={(e) => setField("runType", e.target.value)}>
                <option value="ALWAYS">상시</option>
                <option value="EVENT">이벤트</option>
              </select>
            </Field>

            <Field label="카테고리">
              <select style={input} value={form.category} onChange={(e) => setField("category", e.target.value)}>
                <option value="KOREAN">한식</option>
                <option value="BAKERY">베이커리</option>
              </select>
            </Field>
          </div>

          <h2 style={sectionTitle}>세션 정보</h2>
          {sessions.map((session, index) => (
            <div key={`session-${index}`} style={sessionCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>세션 {index + 1}</strong>
                <button
                  type="button"
                  style={btnDanger}
                  disabled={sessions.length <= 1 || submitting}
                  onClick={() => removeSession(index)}
                >
                  삭제
                </button>
              </div>

              <div style={grid4}>
                <Field label="시작일시">
                  <input
                    style={input}
                    type="datetime-local"
                    value={session.startAt}
                    onChange={(e) => setSessionField(index, "startAt", e.target.value)}
                  />
                </Field>

                <Field label="시간대">
                  <select style={input} value={session.slot} onChange={(e) => setSessionField(index, "slot", e.target.value)}>
                    <option value="AM">오전</option>
                    <option value="PM">오후</option>
                  </select>
                </Field>

                <Field label="정원">
                  <input
                    style={input}
                    type="number"
                    min="1"
                    value={session.capacity}
                    onChange={(e) => setSessionField(index, "capacity", e.target.value)}
                  />
                </Field>

                <Field label="가격(원)">
                  <input
                    style={input}
                    type="number"
                    min="0"
                    step="1000"
                    value={session.price}
                    onChange={(e) => setSessionField(index, "price", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={btnGhost} onClick={addSession} disabled={submitting}>
              세션 추가
            </button>
            <button type="submit" style={btnPrimary} disabled={submitting}>
              {submitting ? "등록 중..." : "클래스 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function toIsoWithSeconds(value) {
  if (!value) return "";

  // datetime-local은 초가 없는 경우가 많아서 서버 검증 포맷(초 포함)에 맞춰 보정합니다.
  return value.length === 16 ? `${value}:00` : value;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("이미지 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};

const sectionTitle = {
  margin: "8px 0 0",
  fontSize: 18,
};

const sessionCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  display: "grid",
  gap: 10,
  background: "#fcfcfd",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 10,
};

const labelStyle = {
  fontSize: 13,
  color: "#374151",
  fontWeight: 700,
};

const input = {
  height: 40,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 14,
  minWidth: 140,
};

const textarea = {
  ...input,
  minHeight: 110,
  padding: 10,
  resize: "vertical",
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

const btnGhost = {
  height: 36,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  cursor: "pointer",
};

const btnDanger = {
  height: 30,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};

const warnBox = {
  border: "1px solid #fde68a",
  background: "#fffbeb",
  color: "#92400e",
  borderRadius: 10,
  padding: 10,
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
