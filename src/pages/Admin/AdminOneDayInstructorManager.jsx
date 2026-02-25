import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import "./AdminOneDayInstructorManager.css";

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

const EMPTY_FORM = {
  id: null,
  userId: "",
  bio: "",
  specialty: "",
  career: "",
  profileImageData: "",
};

export default function AdminOneDayInstructorManager() {
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [instructors, setInstructors] = useState([]);
  const [candidateUsers, setCandidateUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCandidate = useMemo(
    () => candidateUsers.find((item) => String(item.userId) === String(form.userId)),
    [candidateUsers, form.userId]
  );

  const loadInstructors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getOneDayInstructors();
      setInstructors(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setError(e?.message ?? "강사 목록을 불러오지 못했습니다.");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCandidateUsers = useCallback(async (nextKeyword = "") => {
    try {
      const res = await adminApi.getInstructorCandidateUsers(nextKeyword);
      setCandidateUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setCandidateUsers([]);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
    loadCandidateUsers("");
  }, [loadInstructors, loadCandidateUsers]);

  const openCreate = () => {
    setMode("create");
    setForm(EMPTY_FORM);
    setError("");
    setMessage("");
  };

  const openEdit = (item) => {
    setMode("edit");
    setForm({
      id: item.id,
      userId: String(item.userId ?? ""),
      bio: item.bio ?? "",
      specialty: item.specialty ?? "",
      career: item.career ?? "",
      profileImageData: item.profileImageData ?? "",
    });
    setError("");
    setMessage("");
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("이미지 파일은 50MB 이하만 업로드할 수 있습니다.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setField("profileImageData", dataUrl);
    } catch (e) {
      setError(e?.message ?? "이미지를 읽어오지 못했습니다.");
    }
  };

  const validate = () => {
    if (!form.userId) return "강사로 등록할 회원을 선택해 주세요.";
    if (!form.bio.trim()) return "강사 소개를 입력해 주세요.";
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

    const payload = {
      userId: Number(form.userId),
      bio: String(form.bio || "").trim(),
      specialty: String(form.specialty || "").trim(),
      career: String(form.career || "").trim(),
      profileImageData: String(form.profileImageData || "").trim(),
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await adminApi.createOneDayInstructor(payload);
        setMessage("강사가 등록되었습니다.");
      } else {
        await adminApi.updateOneDayInstructor(form.id, payload);
        setMessage("강사 정보가 수정되었습니다.");
      }

      await loadInstructors();
      setMode("list");
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "요청 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeInstructor = async (instructorId) => {
    const ok = window.confirm("강사 정보를 삭제하시겠습니까? 연결된 클래스가 있으면 삭제할 수 없습니다.");
    if (!ok) return;

    setError("");
    setMessage("");

    try {
      await adminApi.deleteOneDayInstructor(instructorId);
      setMessage("강사가 삭제되었습니다.");
      await loadInstructors();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "강사 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="admin-inst-wrap">
      <div className="admin-inst-head">
        <div>
          <h2>원데이 강사 관리</h2>
          <p>강사를 등록하면 회원 권한이 강사로 설정되고, 클래스 상세에 강사 소개를 표시할 수 있습니다.</p>
        </div>

        <div className="admin-inst-head-actions">
          <button className="btn-ghost" onClick={loadInstructors} disabled={loading}>
            {loading ? "불러오는 중..." : "강사 목록 새로고침"}
          </button>
          <button className="btn-primary" onClick={openCreate}>
            강사 등록
          </button>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-inst-grid">
        <section className="admin-inst-panel">
          <h3>강사 목록</h3>
          {instructors.length === 0 ? (
            <div className="muted">등록된 강사가 없습니다.</div>
          ) : (
            <div className="inst-list">
              {instructors.map((item) => (
                <article
                  key={item.id}
                  className={`inst-row ${mode === "edit" && Number(form.id) === Number(item.id) ? "is-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEdit(item);
                    }
                  }}
                >
                  <div className="inst-row-main">
                    <strong>{item.userName || `강사 #${item.id}`}</strong>
                    <div className="inst-row-meta">
                      <span>회원 ID: {item.userId}</span>
                      <span>{item.email || "-"}</span>
                      <span>전문분야: {item.specialty || "-"}</span>
                    </div>
                  </div>

                  <div className="inst-row-actions">
                    <button
                      className="btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(item);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInstructor(item.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-inst-panel">
          <h3>{mode === "create" ? "강사 등록" : mode === "edit" ? `강사 수정 #${form.id}` : "입력 대기"}</h3>

          {mode === "list" ? (
            <div className="muted">왼쪽 목록에서 수정할 강사를 선택하거나 "강사 등록" 버튼을 눌러 주세요.</div>
          ) : (
            <form className="inst-form" onSubmit={submit}>
              <label>
                <span>회원 검색</span>
                <div className="inst-user-search">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="이름 또는 이메일로 검색"
                  />
                  <button type="button" className="btn-ghost" onClick={() => loadCandidateUsers(keyword.trim())}>
                    검색
                  </button>
                </div>
              </label>

              <label>
                <span>강사 회원 선택</span>
                <select value={form.userId} onChange={(e) => setField("userId", e.target.value)} disabled={mode === "edit"}>
                  <option value="">회원 선택</option>
                  {candidateUsers.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.userName} ({user.email}) / {user.role || "ROLE_USER"}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCandidate ? (
                <div className="inst-selected-user">
                  선택됨: {selectedCandidate.userName} ({selectedCandidate.email})
                </div>
              ) : null}

              <label>
                <span>강사 소개</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  maxLength={1000}
                  placeholder="강사 소개를 입력해 주세요"
                />
              </label>

              <label>
                <span>전문분야</span>
                <input
                  value={form.specialty}
                  onChange={(e) => setField("specialty", e.target.value)}
                  maxLength={1000}
                  placeholder="예: 한식 / 베이킹 / 디저트"
                />
              </label>

              <label>
                <span>경력</span>
                <textarea
                  value={form.career}
                  onChange={(e) => setField("career", e.target.value)}
                  maxLength={2000}
                  placeholder="경력 정보를 입력해 주세요"
                />
              </label>

              <label>
                <span>강사 사진</span>
                <input type="file" accept="image/*" onChange={handleProfileImage} />
              </label>

              {form.profileImageData ? (
                <div className="inst-preview">
                  <img src={form.profileImageData} alt="강사 사진 미리보기" />
                </div>
              ) : null}

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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("이미지를 읽어오지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

