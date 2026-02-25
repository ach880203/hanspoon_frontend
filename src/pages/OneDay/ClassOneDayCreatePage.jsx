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
      setError("?대?吏 ?뚯씪留??낅줈?쒗븷 ???덉뒿?덈떎.");
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
    if (!admin) return "愿由ъ옄留??먮뜲???대옒?ㅻ? ?깅줉?????덉뒿?덈떎.";
    if (!payload.title) return "?대옒???쒕ぉ???낅젰??二쇱꽭??";
    if (!payload.description) return "?대옒???붿빟 ?ㅻ챸???낅젰??二쇱꽭??";
    if (!payload.detailDescription) return "?곸꽭 ?ㅻ챸???낅젰??二쇱꽭??";
    if (!payload.instructorId) return "媛뺤궗 ID瑜??낅젰??二쇱꽭??";
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) {
      return "?몄뀡? 理쒖냼 1媛??댁긽 ?꾩슂?⑸땲??";
    }
    for (let i = 0; i < payload.sessions.length; i += 1) {
      const row = payload.sessions[i];
      const prefix = `?몄뀡 ${i + 1}`;
      if (!row.startAt) return `${prefix} ?쒖옉?쇱떆瑜??낅젰??二쇱꽭??`;
      if (!row.slot) return `${prefix} ?쒓컙?瑜??좏깮??二쇱꽭??`;
      if (!Number.isInteger(row.capacity) || row.capacity <= 0) return `${prefix} ?뺤썝? 1 ?댁긽?댁뼱???⑸땲??`;
      if (!Number.isInteger(row.price) || row.price < 0) return `${prefix} 媛寃⑹? 0 ?댁긽?댁뼱???⑸땲??`;
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
      setMessage(`?대옒?ㅺ? ?깅줉?섏뿀?듬땲?? (ID: ${result?.classId ?? "-"})`);
      if (result?.classId) {
        navigate(`/classes/oneday/classes/${result.classId}`);
      }
    } catch (e) {
      setError(e?.message ?? "?대옒???깅줉 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1040, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>?먮뜲???대옒???깅줉</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>
          ?대옒??湲곕낯 ?뺣낫, ?곸꽭 ?ㅻ챸, ?몄뀡 ?뺣낫瑜??낅젰???깅줉?????덉뒿?덈떎.
        </p>

        {!admin ? <div style={warnBox}>?꾩옱 怨꾩젙? 愿由ъ옄 沅뚰븳???꾨떃?덈떎. ?깅줉 ???쒕쾭?먯꽌 嫄곕??⑸땲??</div> : null}
        {error ? <div style={errorBox}>{error}</div> : null}
        {message ? <div style={okBox}>{message}</div> : null}

        <form style={panel} onSubmit={submit}>
          <h2 style={sectionTitle}>湲곕낯 ?뺣낫</h2>

          <div style={grid2}>
            <Field label="?대옒???쒕ぉ">
              <input
                style={input}
                value={form.title}
                maxLength={80}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="?? 二쇰쭚 釉뚮윴移??대옒??
              />
            </Field>

            <Field label="媛뺤궗 ID">
              <input
                style={input}
                type="number"
                min="1"
                value={form.instructorId}
                onChange={(e) => setField("instructorId", e.target.value)}
                placeholder="?? 1"
              />
            </Field>
          </div>

          <Field label="?붿빟 ?ㅻ챸">
            <textarea
              style={textarea}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="?대옒??移대뱶??蹂댁뿬以??붿빟 ?ㅻ챸???낅젰?섏꽭??"
            />
          </Field>

          <Field label="?곸꽭 ?ㅻ챸">
            <textarea
              style={{ ...textarea, minHeight: 180 }}
              value={form.detailDescription}
              onChange={(e) => setField("detailDescription", e.target.value)}
              placeholder="?곸꽭 ?섏씠吏?먯꽌 ?몄뀡 ?꾨옒??蹂댁뿬以??ㅻ챸???낅젰?섏꽭??"
            />
          </Field>

          <Field label="?곸꽭 ?대?吏">
            <div style={{ display: "grid", gap: 10 }}>
              <input type="file" accept="image/*" onChange={handleImageFile} />
              {form.detailImageData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <img
                    src={form.detailImageData}
                    alt="?곸꽭 ?대?吏 誘몃━蹂닿린"
                    style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }}
                  />
                  <button type="button" style={btnGhost} onClick={() => setField("detailImageData", "")}>
                    ?대?吏 ?쒓굅
                  </button>
                </div>
              ) : (
                <span style={{ color: "#6b7280", fontSize: 13 }}>?대?吏瑜??좏깮?섎㈃ ?곸꽭 ?섏씠吏 ?곷떒???쒖떆?⑸땲??</span>
              )}
            </div>
          </Field>

          <div style={grid3}>
            <Field label="?쒖씠??>
              <select style={input} value={form.level} onChange={(e) => setField("level", e.target.value)}>
                <option value="BEGINNER">?낅Ц</option>
                <option value="INTERMEDIATE">以묎툒</option>
                <option value="ADVANCED">怨좉툒</option>
              </select>
            </Field>

            <Field label="?댁쁺 ?좏삎">
              <select style={input} value={form.runType} onChange={(e) => setField("runType", e.target.value)}>
                <option value="ALWAYS">?곸떆</option>
                <option value="EVENT">?대깽??/option>
              </select>
            </Field>

            <Field label="移댄뀒怨좊━">
              <select style={input} value={form.category} onChange={(e) => setField("category", e.target.value)}>
                <option value="KOREAN">?쒖떇</option>
                <option value="BAKERY">踰좎씠而ㅻ━</option>
              </select>
            </Field>
          </div>

          <h2 style={sectionTitle}>?몄뀡 ?뺣낫</h2>
          {sessions.map((session, index) => (
            <div key={`session-${index}`} style={sessionCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>?몄뀡 {index + 1}</strong>
                <button
                  type="button"
                  style={btnDanger}
                  disabled={sessions.length <= 1 || submitting}
                  onClick={() => removeSession(index)}
                >
                  ??젣
                </button>
              </div>

              <div style={grid4}>
                <Field label="?쒖옉?쇱떆">
                  <input
                    style={input}
                    type="datetime-local"
                    value={session.startAt}
                    onChange={(e) => setSessionField(index, "startAt", e.target.value)}
                  />
                </Field>

                <Field label="?쒓컙?">
                  <select style={input} value={session.slot} onChange={(e) => setSessionField(index, "slot", e.target.value)}>
                    <option value="AM">?ㅼ쟾</option>
                    <option value="PM">?ㅽ썑</option>
                  </select>
                </Field>

                <Field label="?뺤썝">
                  <input
                    style={input}
                    type="number"
                    min="1"
                    value={session.capacity}
                    onChange={(e) => setSessionField(index, "capacity", e.target.value)}
                  />
                </Field>

                <Field label="媛寃???">
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
              ?몄뀡 異붽?
            </button>
            <button type="submit" style={btnPrimary} disabled={submitting}>
              {submitting ? "?깅줉 以?.." : "?대옒???깅줉"}
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
  return value.length === 16 ? `${value}:00` : value;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("?대?吏 ?쎄린???ㅽ뙣?덉뒿?덈떎."));
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


