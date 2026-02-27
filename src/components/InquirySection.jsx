// src/components/InquirySection.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createProductInquiry, fetchProductInquiries } from "../api/productInquiries";
import { toErrorMessage } from "../api/http";
import "./InquirySection.css";

function formatDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString();
  } catch {
    return String(v);
  }
}

function previewTitle(q) {
  // 비밀글은 제목을 “비밀글입니다.”로 통일(노출 최소화)
  if (q?.secret) return "비밀글입니다.";
  const text = String(q?.content || "").replace(/\s+/g, " ").trim();
  if (!text) return "(내용 없음)";
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

function displayWriter(q) {
  // DTO에 writerName 없을 수 있으니 안전한 fallback
  if (q?.writerName) return q.writerName;
  if (q?.userName) return q.userName;
  if (q?.userId != null) {
    const s = String(q.userId);
    return `USER-${s.slice(-4).padStart(4, "0")}`;
  }
  return "-";
}

export default function InquirySection({ productId }) {
  const nav = useNavigate();
  const loc = useLocation();

  const [data, setData] = useState(null); // Page<InquiryResponseDto>
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null); // 펼친 문의 id
  const [form, setForm] = useState({ content: "", secret: false });

  const page = data?.number ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const list = data?.content || [];

  const totalCount = data?.totalElements ?? list.length ?? 0;

  const goLogin = () => {
    const returnUrl = encodeURIComponent(loc.pathname + loc.search);
    nav(`/login?returnUrl=${returnUrl}`);
  };

  const load = async (p = 0) => {
    setErr("");
    setLoading(true);
    try {
      const d = await fetchProductInquiries(productId, p, 10);
      setData(d);
    } catch (e) {
      if (e?.status === 401) return goLogin();
      setErr(toErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowForm(false);
    setOpenId(null);
    setForm({ content: "", secret: false });
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submit = async () => {
    const content = form.content.trim();
    if (!content) {
      setErr("문의 내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await createProductInquiry(productId, { ...form, content });
      setForm({ content: "", secret: false });
      setShowForm(false);
      await load(0);
    } catch (e) {
      if (e?.status === 401) return goLogin();
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const infoLines = useMemo(
    () => [
      "상품에 대한 문의를 남기는 공간입니다. 해당 게시판의 성격과 다른 글은 사전동의 없이 담당 게시판으로 이동될 수 있습니다.",
      "배송/주문(취소/교환/환불) 관련 문의는 별도 1:1 문의를 이용해 주세요.",
    ],
    []
  );

  return (
    <div className="iqWrap">
      {/* 헤더 */}
      <div className="iqHeader">
        <div className="iqHeaderLeft">
          <h3 className="iqTitle">상품 문의</h3>
          <div className="iqDesc">
            {infoLines.map((t, idx) => (
              <div key={idx} className="iqDescLine">
                • {t}
              </div>
            ))}
          </div>
        </div>

        <div className="iqHeaderRight">
          <button
            type="button"
            className="iqPrimaryBtn"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "작성 닫기" : "문의하기"}
          </button>
        </div>
      </div>

      {err && <div className="iqError">{err}</div>}

      {/* 작성 폼 (Kurly처럼 버튼 눌렀을 때만 열리도록) */}
      {showForm && (
        <div className="iqForm">
          <textarea
            className="iqTextarea"
            placeholder="문의 내용을 입력해 주세요."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={4}
            maxLength={1000}
            disabled={busy}
          />

          <div className="iqFormBottom">
            <label className="iqCheck">
              <input
                type="checkbox"
                checked={form.secret}
                onChange={(e) => setForm((f) => ({ ...f, secret: e.target.checked }))}
                disabled={busy}
              />
              비밀글
            </label>

            <div className="iqFormRight">
              <div className="iqHint">{form.content.length}/1000</div>
              <button type="button" className="iqSubmitBtn" disabled={busy} onClick={submit}>
                {busy ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="iqTableWrap">
        <div className="iqTableTop">
          <div className="iqCount">총 {Number(totalCount).toLocaleString()}개</div>
        </div>

        <div className="iqTable">
          <div className="iqTr iqTh">
            <div className="iqTd iqColTitle">문의 내용</div>
            <div className="iqTd writer">작성자</div>
            <div className="iqTd date">작성일</div>
            <div className="iqTd status">답변상태</div>
          </div>

          {loading ? (
            <div className="iqEmpty">불러오는 중…</div>
          ) : list.length === 0 ? (
            <div className="iqEmpty">아직 문의가 없어요.</div>
          ) : (
            list.map((q) => {
              const opened = openId === q.inqId;
              const statusText = q.answeredYn ? "답변완료" : "답변대기";

              return (
                <div key={q.inqId} className="iqRowBlock">
                  <button
                    type="button"
                    className={opened ? "iqTr iqTrBtn open" : "iqTr iqTrBtn"}
                    onClick={() => setOpenId((cur) => (cur === q.inqId ? null : q.inqId))}
                  >
                    <div className="iqTd iqColTitle">
                      {q.secret && <span className="iqLock" aria-label="비밀글">🔒</span>}
                      <span className="iqTitleText">{previewTitle(q)}</span>
                    </div>
                    <div className="iqTd writer">{displayWriter(q)}</div>
                    <div className="iqTd date">{formatDate(q.createdAt)}</div>
                    <div className="iqTd status">
                      <span className={q.answeredYn ? "iqStatus done" : "iqStatus wait"}>
                        {statusText}
                      </span>
                    </div>
                  </button>

                  {/* 펼침 영역(Q/A) */}
                  {opened && (
                    <div className="iqDetail">
                      <div className="iqQA">
                        <div className="iqQ">
                          <div className="iqQLabel">Q</div>
                          <div className="iqQText">
                            {q.secret ? "비밀글입니다." : String(q.content || "")}
                          </div>
                        </div>

                        <div className="iqA">
                          <div className="iqALabel">A</div>
                          <div className="iqAText">
                            {q.answer ? (
                              <span>{q.answer}</span>
                            ) : (
                              <span className="iqMuted">아직 답변이 없습니다.</span>
                            )}
                          </div>
                        </div>

                        {q.answeredAt && (
                          <div className="iqAnsweredAt">
                            답변일: {formatDate(q.answeredAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        {data && totalPages > 1 && (
          <div className="iqPager">
            <button
              className="iqGhost"
              disabled={busy || page <= 0}
              onClick={() => load(page - 1)}
              type="button"
            >
              이전
            </button>
            <div className="iqPageText">
              {page + 1} / {totalPages}
            </div>
            <button
              className="iqGhost"
              disabled={busy || page + 1 >= totalPages}
              onClick={() => load(page + 1)}
              type="button"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}