import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import {deletewihses, fetchMyWishes} from "../../api/recipeApi.js";
import { toErrorMessage } from "../../api/http.js";
import { toBackendUrl } from "../../utils/backendUrl.js";

export default function RecipeWishes() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);

  const load = async (p = page) => {
    setErr("");
    try {
      const response = await fetchMyWishes(p, 20);
      if (response && response.success) {
        setData(response.data);
        setPage(response.data?.number ?? p);
      }
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  const unWish = async (wishId) => {
    if (!window.confirm("관심 목록에서 제거하시겠습니까?")) return;

    setBusy(true);
    try {

      const response = await deletewihses(wishId);
      console.log("백엔드",response);
      if (response && response.data.success) {
        setData(prev => ({

          ...prev,
          content: prev.content.filter(item => item.wishId !== wishId)

        }));
        if (data.content.length <= 1) {
          await load(page);
        }
        alert("삭제되었습니다");
      }
    } catch (e) {
      setErr(toErrorMessage(e));
      alert("삭제 중 오류가 발생했습니다");
    } finally {
      setBusy(false);
    }
  };

  const list = data?.content || [];

  return (
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '40px' }}>내 관심 레시피 목록</h2>

        {err && <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{err}</div>}

        {/* 레시피 그리드 영역: 3열 고정 */}
        <div
            className="recipe-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "30px",
              marginTop: "20px"
            }}
        >
          {list.length > 0 ? (
              list.map((rw) => (
                  <div key={rw.id} className="recipe-card" style={cardStyle}>
                    {/* 이미지 영역: 200x200 정사각 */}
                    <div style={{ cursor: "pointer" }} onClick={() => nav(`/recipes/${rw.id}`)}>
                      {rw.mainImage ? (
                          <img
                              src={toBackendUrl(`/images/recipe/${rw.mainImage}`)}
                              style={imageStyle}
                              alt={rw.title}
                          />
                      ) : (
                          <div style={placeholderStyle}>이미지 없음</div>
                      )}
                    </div>

                    <div style={{ padding: '0 10px' }}>
                      <h4
                          className="text-truncate"
                          style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px', cursor: 'pointer' }}
                          onClick={() => nav(`/recipes/${rw.id}`)}
                      >
                        {rw.title}
                      </h4>
                      <p style={{ color: '#ff6b6b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px' }}>
                        맛있는 집밥 레시피
                      </p>
                    </div>

                    {/* 버튼 영역 */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                          style={viewBtnStyle}
                          onClick={() => nav(`/recipes/${rw.id}`)}
                      >
                        보기
                      </button>
                      <button
                          style={deleteBtnStyle}
                          disabled={busy}
                          onClick={() => unWish(rw.wishId)}
                      >
                        찜 해제
                      </button>
                    </div>
                  </div>
              ))
          ) : (
              <div style={{ textAlign: "center", gridColumn: "1/4", padding: "100px 0", color: '#999' }}>
                관심 목록이 비어 있습니다.
              </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '50px' }}>
              {[...Array(data.totalPages)].map((_, i) => (
                  <button
                      key={i}
                      onClick={() => load(i)}
                      style={{
                        width: '35px', height: '35px', borderRadius: '50%', border: 'none',
                        backgroundColor: data.number === i ? '#333' : '#f0f0f0',
                        color: data.number === i ? '#fff' : '#333',
                        cursor: 'pointer'
                      }}
                  >
                    {i + 1}
                  </button>
              ))}
            </div>
        )}
      </div>
  );
}

// 재사용 스타일 객체
const cardStyle = {
  border: "1px solid #eee",
  padding: "20px",
  borderRadius: "15px",
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column'
};

const imageStyle = {
  width: "200px",
  height: "200px",
  objectFit: "cover",
  borderRadius: "12px",
  marginBottom: '15px'
};

const placeholderStyle = {
  width: "200px",
  height: "200px",
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 15px",
  color: "#ccc"
};

const viewBtnStyle = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#333",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: '0.85rem',
  fontWeight: 'bold',
  cursor: "pointer"
};

const deleteBtnStyle = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#fff",
  color: "#ff6b6b",
  border: "1px solid #ff6b6b",
  borderRadius: "8px",
  fontSize: '0.85rem',
  fontWeight: 'bold',
  cursor: "pointer"
};