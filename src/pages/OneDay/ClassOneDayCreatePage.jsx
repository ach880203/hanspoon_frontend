import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOneDayClass, isOneDayAdmin } from "../../api/onedayApi";
import { OneDayTopTabs } from "./OneDayTopTabs";

/**
 * 원데이 클래스 등록 페이지
 *
 * 초보자 참고:
 * - 클래스 1건을 만들 때 세션을 여러 개 같이 등록할 수 있도록 만들었습니다.
 * - 화면에서 입력한 값을 그대로 서버로 보내지 않고,
 *   숫자/날짜 타입을 맞춰 payload를 다시 만들어 전송합니다.
 */
export const ClassOneDayCreatePage = () => {
  const navigate = useNavigate();
  const admin = isOneDayAdmin();

  // 클래스 기본 정보 입력 상태
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "BEGINNER",
    runType: "ALWAYS",
    category: "KOREAN",
    instructorId: "",
  });

  // 세션 목록 입력 상태
  // startAt은 datetime-local input 문자열(예: 2026-02-21T10:00) 형태로 관리합니다.
  const [sessions, setSessions] = useState([
    { startAt: "", slot: "AM", capacity: "10", price: "50000" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /**
   * 서버 전송용 payload를 계산합니다.
   * useMemo를 사용한 이유:
   * - 매번 submit 시점에서 값 조립 로직을 다시 작성하지 않아도 됨
   * - 화면 표시/검증에 같은 데이터를 재사용하기 쉬움
   */
  const payload = useMemo(() => {
    const instructorId = Number(form.instructorId);

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      level: form.level,
      runType: form.runType,
      category: form.category,
      instructorId: Number.isInteger(instructorId) && instructorId > 0 ? instructorId : null,
      sessions: sessions.map((s) => ({
        startAt: toIsoWithSeconds(s.startAt),
        slot: s.slot,
        capacity: Number(s.capacity),
        price: Number(s.price),
      })),
    };
  }, [form, sessions]);

  const handleChangeForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeSession = (index, field, value) => {
    setSessions((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddSession = () => {
    setSessions((prev) => [
      ...prev,
      { startAt: "", slot: "PM", capacity: "10", price: "50000" },
    ]);
  };

  const handleRemoveSession = (index) => {
    setSessions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateBeforeSubmit = () => {
    if (!admin) {
      setError("관리자만 원데이 클래스를 등록할 수 있습니다.");
      return false;
    }
    if (!payload.title) {
      setError("클래스 제목을 입력해 주세요.");
      return false;
    }
    if (!payload.instructorId) {
      setError("강사 ID를 입력해 주세요.");
      return false;
    }
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) {
      setError("세션을 최소 1개 이상 입력해 주세요.");
      return false;
    }

    for (let i = 0; i < payload.sessions.length; i += 1) {
      const row = payload.sessions[i];
      const prefix = `세션 ${i + 1}`;

      if (!row.startAt) {
        setError(`${prefix} 시작일시를 입력해 주세요.`);
        return false;
      }
      if (!row.slot) {
        setError(`${prefix} 시간대를 선택해 주세요.`);
        return false;
      }
      if (!Number.isInteger(row.capacity) || row.capacity <= 0) {
        setError(`${prefix} 정원은 1 이상이어야 합니다.`);
        return false;
      }
      if (!Number.isInteger(row.price) || row.price < 0) {
        setError(`${prefix} 가격은 0 이상이어야 합니다.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!validateBeforeSubmit()) return;

    setSubmitting(true);
    try {
      const result = await createOneDayClass(payload);
      setMessage(`클래스 등록 완료 (#${result?.classId ?? "-"})`);

      // 등록 성공 후 상세 페이지로 이동합니다.
      // 사용자가 방금 만든 클래스 내용을 바로 확인할 수 있어 UX가 좋아집니다.
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

      <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>원데이 클래스 등록하기</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>
          클래스 기본 정보와 세션(시작일시/시간대/정원/가격)을 입력해 등록합니다.
        </p>

        {!admin ? (
          <div style={warnBox}>
            현재 계정은 관리자 권한이 아닐 수 있습니다. 저장 시 서버에서 거부될 수 있습니다.
          </div>
        ) : null}

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}

        <form style={panel} onSubmit={handleSubmit}>
          <h2 style={{ margin: 0, fontSize: 18 }}>기본 정보</h2>

          <div style={grid2}>
            <Field label="제목">
              <input
                style={input}
                type="text"
                value={form.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
                maxLength={80}
                placeholder="예: 주말 브런치 클래스"
              />
            </Field>

            <Field label="강사 ID">
              <input
                style={input}
                type="number"
                min="1"
                value={form.instructorId}
                onChange={(e) => handleChangeForm("instructorId", e.target.value)}
                placeholder="예: 1"
              />
            </Field>
          </div>

          <Field label="설명">
            <textarea
              style={{ ...input, minHeight: 120, padding: 10, resize: "vertical" }}
              value={form.description}
              onChange={(e) => handleChangeForm("description", e.target.value)}
              placeholder="클래스 소개를 입력해 주세요."
            />
          </Field>

          <div style={grid3}>
            <Field label="난이도">
              <select style={input} value={form.level} onChange={(e) => handleChangeForm("level", e.target.value)}>
                <option value="BEGINNER">입문</option>
                <option value="INTERMEDIATE">중급</option>
                <option value="ADVANCED">고급</option>
              </select>
            </Field>

            <Field label="운영 유형">
              <select style={input} value={form.runType} onChange={(e) => handleChangeForm("runType", e.target.value)}>
                <option value="ALWAYS">상시</option>
                <option value="EVENT">이벤트</option>
              </select>
            </Field>

            <Field label="카테고리">
              <select style={input} value={form.category} onChange={(e) => handleChangeForm("category", e.target.value)}>
                <option value="KOREAN">한식</option>
                <option value="BAKERY">베이커리</option>
              </select>
            </Field>
          </div>

          <h2 style={{ margin: "8px 0 0", fontSize: 18 }}>세션 정보</h2>

          {sessions.map((session, index) => (
            <div key={`session-${index}`} style={sessionCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <strong>세션 {index + 1}</strong>
                <button
                  type="button"
                  style={btnDanger}
                  onClick={() => handleRemoveSession(index)}
                  disabled={sessions.length <= 1 || submitting}
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
                    onChange={(e) => handleChangeSession(index, "startAt", e.target.value)}
                  />
                </Field>

                <Field label="시간대">
                  <select
                    style={input}
                    value={session.slot}
                    onChange={(e) => handleChangeSession(index, "slot", e.target.value)}
                  >
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
                    onChange={(e) => handleChangeSession(index, "capacity", e.target.value)}
                  />
                </Field>

                <Field label="가격(원)">
                  <input
                    style={input}
                    type="number"
                    min="0"
                    step="1000"
                    value={session.price}
                    onChange={(e) => handleChangeSession(index, "price", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={btnGhost} onClick={handleAddSession} disabled={submitting}>
              세션 추가
            </button>
            <button type="submit" style={btnPrimary} disabled={submitting}>
              {submitting ? "등록중..." : "클래스 등록"}
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

/**
 * datetime-local 값을 LocalDateTime ISO 형태(초 포함)로 변환합니다.
 * 예: "2026-02-21T10:00" -> "2026-02-21T10:00:00"
 */
function toIsoWithSeconds(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};

const sessionCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 10,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
  height: 38,
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
