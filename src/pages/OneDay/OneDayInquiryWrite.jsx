import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  answerOneDayInquiry,
  createOneDayInquiry,
  getOneDayInquiries,
  isOneDayAdmin,
  resolveOneDayUserId,
} from "../../api/onedayApi";
import { OneDayTopTabs } from "./OneDayTopTabs";

// 사용자가 쉽게 선택할 수 있도록 문의 분류를 고정 옵션으로 제공합니다.
const CATEGORY_OPTIONS = ["예약", "결제", "클래스", "기타"];

export const OneDayInquiryWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 클래스 상세에서 넘어오면 classId를 자동으로 채워서 사용자가 다시 입력하지 않도록 합니다.
  const initialClassId = searchParams.get("classId") || "";

  // 작성 폼 상태
  const [form, setForm] = useState({
    classProductId: initialClassId,
    category: CATEGORY_OPTIONS[0],
    title: "",
    content: "",
    secret: false,
    hasAttachment: false,
  });

  // 목록/답글 처리 상태
  const [inquiries, setInquiries] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerDraftById, setAnswerDraftById] = useState({});
  const [openAnswerInquiryId, setOpenAnswerInquiryId] = useState(null);

  // 사용자 메시지 상태
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const currentUserId = Number(resolveOneDayUserId() ?? 0);
  const admin = isOneDayAdmin();

  // 실제 서버로 보낼 payload를 한 곳에서 생성합니다.
  // 이렇게 분리하면 검증 로직과 제출 로직에서 동일한 값을 재사용할 수 있습니다.
  const payload = useMemo(() => {
    const classProductId = Number(form.classProductId);
    return {
      classProductId: Number.isInteger(classProductId) && classProductId > 0 ? classProductId : null,
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      secret: Boolean(form.secret),
      hasAttachment: Boolean(form.hasAttachment),
    };
  }, [form]);

  // 문의 목록은 공개 페이지 성격이라 로그인 여부와 관계없이 조회를 시도합니다.
  // 서버가 권한에 맞춰 본문을 마스킹해서 내려줍니다.
  const loadInquiries = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getOneDayInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "문의 목록을 불러오지 못했습니다.");
      setInquiries([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    // 서버에서도 검증하지만, 사용자 UX를 위해 프런트에서 1차 검증을 먼저 수행합니다.
    if (!payload.classProductId) {
      setError("관련 클래스 ID(classProductId)를 입력해 주세요.");
      return;
    }
    if (!payload.category) {
      setError("문의 분류를 선택해 주세요.");
      return;
    }
    if (!payload.title) {
      setError("문의 제목을 입력해 주세요.");
      return;
    }
    if (!payload.content) {
      setError("문의 내용을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await createOneDayInquiry(payload);
      setMessage(`문의가 접수되었습니다. 문의 번호 #${data?.inquiryId ?? "-"}`);

      // 등록 후에는 제목/내용/옵션만 초기화하고 classProductId는 유지합니다.
      // 같은 클래스에 연속 문의를 남길 때 입력 피로를 줄여줍니다.
      setForm((prev) => ({ ...prev, title: "", content: "", secret: false, hasAttachment: false }));
      await loadInquiries();
    } catch (e) {
      setError(e?.message ?? "문의 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (inquiryId) => {
    setError("");
    setMessage("");

    const answerContent = String(answerDraftById[inquiryId] || "").trim();
    if (!answerContent) {
      setError("답글 내용을 입력해 주세요.");
      return;
    }

    setAnsweringId(inquiryId);
    try {
      await answerOneDayInquiry(inquiryId, { answerContent });
      setMessage("답글이 등록되었습니다.");
      setAnswerDraftById((prev) => ({ ...prev, [inquiryId]: "" }));
      setOpenAnswerInquiryId(null);
      await loadInquiries();
    } catch (e) {
      setError(e?.message ?? "답글 등록에 실패했습니다.");
    } finally {
      setAnsweringId(null);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>원데이 문의하기</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>
          공개글은 모두 열람 가능하며, 비밀글은 작성자와 관리자만 본문을 볼 수 있습니다.
        </p>

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}

        <form style={panel} onSubmit={handleSubmit}>
          <h2 style={{ margin: 0, fontSize: 18 }}>문의 작성</h2>

          <div style={grid2}>
            <label style={field}>
              <span style={label}>문의 분류</span>
              <select
                style={input}
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label style={field}>
              <span style={label}>관련 클래스 ID(필수)</span>
              <input
                style={input}
                type="number"
                min="1"
                placeholder="예: 12"
                value={form.classProductId}
                onChange={(e) => setForm((prev) => ({ ...prev, classProductId: e.target.value }))}
              />
            </label>
          </div>

          <label style={field}>
            <span style={label}>제목</span>
            <input
              style={input}
              type="text"
              maxLength={150}
              placeholder="제목을 입력해 주세요."
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </label>

          <label style={field}>
            <span style={label}>내용</span>
            <textarea
              style={{ ...input, height: 180, padding: 12, resize: "vertical" }}
              maxLength={4000}
              placeholder="문의 내용을 입력해 주세요."
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            />
          </label>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={form.secret}
                onChange={(e) => setForm((prev) => ({ ...prev, secret: e.target.checked }))}
              />
              비밀글
            </label>
            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={form.hasAttachment}
                onChange={(e) => setForm((prev) => ({ ...prev, hasAttachment: e.target.checked }))}
              />
              첨부파일 있음
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" style={btnPrimary} disabled={submitting}>
              {submitting ? "등록중..." : "문의 등록"}
            </button>
            <button
              type="button"
              style={btnGhost}
              onClick={() => navigate("/classes/oneday/classes")}
              disabled={submitting}
            >
              클래스 목록 이동
            </button>
          </div>
        </form>

        <section style={panel}>
          <h2 style={{ margin: 0, fontSize: 18 }}>문의 목록</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
            답글 작성 권한: 문의 작성자 또는 관리자
          </p>

          {loadingList ? (
            <div>불러오는 중...</div>
          ) : inquiries.length === 0 ? (
            <div style={{ color: "#6b7280" }}>등록된 문의가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {inquiries.map((item) => {
                // 서버가 canAnswer를 내려주지만, 안전하게 프런트에서도 현재 사용자 기준을 한 번 더 계산해 UI를 제어합니다.
                const fallbackCanAnswer = admin || Number(item.userId) === currentUserId;
                const canAnswer = Boolean(item.canAnswer ?? fallbackCanAnswer);
                const isPrivate = String(item.visibility) === "PRIVATE";

                return (
                  <article key={item.inquiryId} style={card}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <strong>#{item.inquiryId}</strong>
                        <span style={chip}>{item.category}</span>
                        <span style={chip}>{isPrivate ? "비밀글" : "공개글"}</span>
                        <span style={chip}>{item.answered ? "답변완료" : "답변대기"}</span>
                        <span style={{ color: "#6b7280", fontSize: 12 }}>작성자: {item.writerName || "이름 없음"}</span>
                        <span style={{ color: "#6b7280", fontSize: 12 }}>클래스 ID: {item.classProductId ?? "-"}</span>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700 }}>{item.title}</div>
                        <div style={{ marginTop: 4, display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 220 }}>{item.content}</div>
                          {canAnswer ? (
                            <button
                              type="button"
                              style={btnReply}
                              onClick={() =>
                                setOpenAnswerInquiryId((prev) => (prev === item.inquiryId ? null : item.inquiryId))
                              }
                            >
                              답글
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div style={{ color: "#6b7280", fontSize: 12 }}>
                        작성시각: {fmtDate(item.createdAt)}
                      </div>

                      {item.answered ? (
                        <div style={answerBox}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>답글</div>
                          <div>{item.answerContent || "(내용 없음)"}</div>
                          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                            답글시각: {fmtDate(item.answeredAt)} / 답글작성자 ID: {item.answeredByUserId ?? "-"}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {canAnswer && openAnswerInquiryId === item.inquiryId ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        {/* 
                          초보자 참고:
                          문의도 리뷰와 같은 방식으로 버튼을 눌렀을 때만 입력창을 열어
                          "원문 아래 대댓글" 구조가 명확하게 보이도록 맞췄습니다.
                        */}
                        <textarea
                          style={{ ...input, height: 90, padding: 10, resize: "vertical" }}
                          placeholder="답글을 입력해 주세요."
                          value={answerDraftById[item.inquiryId] || ""}
                          onChange={(e) =>
                            setAnswerDraftById((prev) => ({ ...prev, [item.inquiryId]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          style={btnPrimary}
                          onClick={() => handleAnswerSubmit(item.inquiryId)}
                          disabled={answeringId === item.inquiryId}
                        >
                          {answeringId === item.inquiryId ? "등록중..." : "답글 등록"}
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("ko-KR");
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

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const field = {
  display: "grid",
  gap: 6,
};

const label = {
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
};

const checkLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "#111827",
  fontSize: 14,
};

const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  display: "grid",
  gap: 10,
  background: "#fff",
};

const answerBox = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  borderRadius: 8,
  padding: 10,
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

const btnReply = {
  height: 28,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  width: "fit-content",
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
