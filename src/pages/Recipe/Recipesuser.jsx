import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api';
import { getRecipeList } from '../../api/recipeApi.js';

function Recipesuser() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  const IMAGE_BASE_URL = "http://localhost:8080/ikmages/recipe/";

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await getRecipeList({ page: 0, category: 'KOREAN'});
        setRecipes(response.data.content);
      }catch (error) {
        console.error("목록 로드 실패", error);
      }
    };

    const savedUser = JSON.parse(localStorage.getItem('userRecipes') || '[]');
    const savedMy = JSON.parse(localStorage.getItem('myRecipes') || '[]');
    
    const allRecipes = [...savedUser, ...savedMy];
    const uniqueRecipes = allRecipes.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    
    fetchList();
  }, []);

  const handleDelete = (id, e) => {
    //삭제 버튼
    e.stopPropagation();
    if (window.confirm("🗑️ 이 레시피를 삭제할까요?")) {
      const updated = recipes.filter(r => String(r.id) !== String(id));
      localStorage.setItem('userRecipes', JSON.stringify(updated));
      localStorage.setItem('myRecipes', JSON.stringify(updated));
      setRecipes(updated);
    }
  };

  const handleEdit = (recipe, e) => {
    // 수정 버튼 
    e.stopPropagation();
    navigate('/recipes', { state: { editData: recipe } });
  };

  // 상세 보기로 이동하는 함수
  const goToDetail = (id) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="recipe-user-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div style={{ width: '95%', maxWidth: '1600px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', padding: '0 10px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
            나의 레시피 📖
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
              총 <b>{recipes.length}</b>개의 맛있는 기록이 있습니다.
            </p>
            <button onClick={() => navigate('/recipes')} style={navBtnStyle}>
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>+</span> 새 레시피 작성
            </button>
          </div>
        </header>
        <div style={{ minHeight: '500px' }}>
          {recipes.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '25px',
              width: '100%'
            }}>
              {recipes.map(recipe => (
                <div // 보여지는 카드 영역
                  key={recipe.id} 
                  className="recipe-card" 
                  style={{ ...cardStyle, cursor: 'pointer' }} 
                  onClick={() => goToDetail(recipe.id)}
                >
                  <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img 
                      src={recipe.recipeMainImg || 'https://images.unsplash.com/photo-1495195129352-aec325a55b65?q=80&w=600'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      alt={recipe.title}
                    />
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold' }}>
                        {recipe.category}
                      </span>
                      <h5 style={{ fontWeight: 'bold', marginTop: '5px', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {recipe.title || "제목 없음"}
                      </h5>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <span>👥 {recipe.baseServings}인분</span>
                      <span>📅 {new Date(recipe.id).toLocaleDateString()}</span>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                      
                      {/* 수정 버튼 */}
                      <button onClick={(e) => handleEdit(recipe, e)} style={smallIconBtnStyle} title="수정">
                        <i className="fa-solid fa-pen-to-square"></i> 수정
                      </button>

                      {/* 삭제 버튼 */}
                      <button onClick={(e) => handleDelete(recipe.id, e)} style={{ ...smallIconBtnStyle, color: '#ef4444' }} title="삭제">
                        <i className="fa-solid fa-trash-can"></i> 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{ marginBottom: '20px' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '50px', color: '#cbd5e1' }}></i>
              </div>
              <p style={{ color: '#64748b' }}>아직 작성된 레시피가 없어요.</p>
              <button onClick={() => navigate('/recipes')} style={navBtnStyle}>
                레시피 작성하러 가기
              </button>
            </div>
          )}
        </div>

        <footer style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '80px 0 40px' }}>
          <Link to="/" style={navBtnStyle}>메인으로</Link>
          <Link to="/products" style={navBtnStyle}>마켓(상품)</Link>
          <Link to="/cart" style={navBtnStyle}>장바구니</Link>
          <Link to="/admin/add-product" style={navBtnStyle}>관리자: 상품등록</Link>
        </footer>
      </div>

      <style>{`
        .recipe-card { transition: all 0.3s ease; }
        .recipe-card:hover { transform: translateY(-8px); box-shadow: 0 12px 25px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}

const navBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 20px",
  borderRadius: "10px", 
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#475569",
  background: "white",
  fontSize: "0.95rem",
  fontWeight: "500",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  cursor: "pointer",
  transition: "all 0.2s"
};

const cardStyle = {
  backgroundColor: '#fff', 
  borderRadius: '15px', 
  overflow: 'hidden', 
  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  border: '1px solid #f1f5f9'
};

const smallIconBtnStyle = {
  ...navBtnStyle,
  padding: "6px 12px",
  fontSize: "0.85rem",
  borderRadius: "6px",
  backgroundColor: "#f8fafc",
  gap: "5px"
};

export default Recipesuser;