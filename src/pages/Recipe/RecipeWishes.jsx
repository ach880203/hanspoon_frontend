import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyWishes, toggleWish } from "../../api/recipeApi.js";
import { toErrorMessage } from "../../api/http.js";

export default function RecipeWishes() {
  const nav = useNavigate();
  const [data, setData] = useState(null); // 백엔드 Page 객체
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);

  // 관심 목록 불러오기
  const load = async (p = page) => {
    setErr("");
    try {
      const response = await fetchMyWishes(p, 20);
      // 서버 응답 구조가 { success: true, data: { content: [...] } } 인 경우 처리
      if (response && response.success) {
        setData(response.data);
        setPage(response.data?.number ?? p);
      } else {
        setData(null);
      }
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  // 관심 목록 해제
  const unWish = async (recipeId) => {
    if (!window.confirm("관심 목록에서 제거하시겠습니까?")) return;

    setBusy(true);
    setErr("");
    try {
      const response = await toggleWish(recipeId);
      if (response && response.success) {
        // 현재 페이지의 데이터 재로드
        await load(page);
      }
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const list = data?.content || [];

  return (
      <div className="recipe-wishes-page">
        <h1>내 관심 레시피 목록</h1>
        {err && <div className="error">{err}</div>}

        <div className="panel">
          {list.length === 0 ? (
              <div className="muted">관심 목록이 비어 있습니다.</div>
          ) : (
              <div className="cartList">
                {/* 🚩 rw로 매핑 시작 */}
                {list.map((rw) => (
                    <div key={rw.id} className="cartItem">
                      <div className="cartThumb" onClick={() => nav(`/recipes/${rw.id}`)} style={{ cursor: "pointer" }}>
                        {rw.mainImage ? (
                            <img src={rw.mainImage} alt={rw.title} />
                        ) : (
                            <div className="thumbPlaceholder">이미지 없음</div>
                        )}
                      </div>

                      <div className="cartInfo">
                        <div
                            className="title"
                            style={{ cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem" }}
                            onClick={() => nav(`/recipes/${rw.id}`)}
                        >
                          {rw.title}
                        </div>

                        {/* 레시피는 가격 대신 작성자나 카테고리를 넣을 수 있습니다 */}
                        <div className="muted" style={{ marginTop: "4px" }}>맛있는 집밥 레시피</div>

                        <div className="row" style={{ gap: 8, marginTop: 12 }}>
                          <button className="ghost" onClick={() => nav(`/recipes/${rw.id}`)}>
                            레시피 보기
                          </button>
                          <button
                              className="danger"
                              disabled={busy}
                              onClick={() => unWish(rw.id)}
                          >
                            찜 해제
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}

          {/* 페이징 처리 */}
          {data && data.totalPages > 0 && (
              <div className="row" style={{ gap: 15, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
                <button
                    className="ghost"
                    disabled={busy || data.number <= 0}
                    onClick={() => load(data.number - 1)}
                >
                  이전
                </button>
                <div className="muted">
                  <strong>{data.number + 1}</strong> / {data.totalPages} 페이지
                </div>
                <button
                    className="ghost"
                    disabled={busy || data.number + 1 >= data.totalPages}
                    onClick={() => load(data.number + 1)}
                >
                  다음
                </button>
              </div>
          )}
        </div>
      </div>
  );
}