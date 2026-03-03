import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRecipeList, permanentDeleteRecipe } from "../../api/recipeApi.js";
import { toBackendUrl } from "../../utils/backendUrl.js";

function Recipesuser() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🚩 페이지네이션 상태 추가
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const navigate = useNavigate();

    const authData = localStorage.getItem("hanspoon_auth");
    const currentUser = authData ? JSON.parse(authData) : null;
    const currentUserId = currentUser?.userId;

    // 🚩 useCallback으로 감싸고 page 의존성 추가
    const fetchMyList = useCallback(async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            // 1. API 호출
            const response = await getRecipeList({ page: page, userId: currentUserId, size: 10 });

            // 2. 데이터 추출 (구조: response.data (ApiResponse) -> .data (Page객체))
            // 한나님의 ApiResponse 구조상 response.data.data에 Page 정보가 들어있습니다.
            const result = response.data?.data;

            console.log("백엔드에서 온 실제 데이터 객체:", result);

            if (result) {
                // 🚩 1. 실제 데이터 목록은 result.content에 있네요. (이건 잘 하셨어요!)
                setRecipes(result.content || []);

                // 🚩 2. 전체 페이지 수 추출 경로 수정!
                // 로그를 보니 'result.page.totalPages' 안에 숫자가 들어있습니다.
                const total = result.page?.totalPages || 0;

                setTotalPages(total);

                console.log("실제 접근한 전체 페이지 수:", total);
            }
        } catch (error) {
            console.error("내 레시피 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, page]);

    useEffect(() => {
        fetchMyList();
    }, [fetchMyList]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("정말 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
        try {
            await permanentDeleteRecipe(id);
            // 삭제 후 목록 새로고침 (현재 페이지 데이터 갱신)
            await fetchMyList();
            alert("레시피가 완전히 삭제되었습니다.");
        } catch {
            alert("삭제 실패: 관련 데이터가 있어 삭제할 수 없습니다.");
        }
    };

    return (
        <div className="recipe-user-page" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#1e293b" }}>내 레시피 관리</h2>
                    <p style={{ color: "#64748b" }}>내 레시피 목록을 관리하세요.</p>
                </div>
                <button onClick={() => navigate("/recipes")} style={navBtnStyle}>+ 새 레시피 작성</button>
            </header>

            <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <tr>
                        <th style={thStyle}>이미지</th>
                        <th style={thStyle}>레시피명</th>
                        <th style={thStyle}>카테고리</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" style={{ padding: "100px", textAlign: "center", color: "#94a3b8" }}>
                                레시피를 불러오는 중입니다.
                            </td>
                        </tr>
                    ) : recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <tr key={recipe.id} className="table-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={tdStyle}>
                                    <img
                                        src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "https://via.placeholder.com/50"}
                                        alt="thumb"
                                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" }}
                                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                                    />
                                </td>
                                <td style={{ ...tdStyle, fontWeight: "500", cursor: "pointer" }} onClick={() => navigate(`/recipes/${recipe.id}`)}>
                                    {recipe.title}
                                </td>
                                <td style={tdStyle}><span style={categoryBadgeStyle}>{recipe.category}</span></td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                    <button className="edit-btn" onClick={() => navigate(`/recipes/edit/${recipe.id}`)} style={actionBtnStyle}>수정</button>
                                    <button className="delete-btn" onClick={(e) => handleDelete(recipe.id, e)} style={{ ...actionBtnStyle, color: "#ef4444" }}>삭제</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ padding: "100px", textAlign: "center", color: "#94a3b8" }}>작성한 레시피가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 🚩 페이지네이션 UI 추가 */}
            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "30px" }}>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            style={{
                                ...pageBtnStyle,
                                backgroundColor: page === i ? "#4f46e5" : "#fff",
                                color: page === i ? "#fff" : "#475569",
                                borderColor: page === i ? "#4f46e5" : "#e2e8f0"
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .table-row:hover { background-color: #f8fafc; }
                .edit-btn:hover { background-color: #e0e7ff !important; color: #4338ca !important; }
                .delete-btn:hover { background-color: #fee2e2 !important; }
            `}</style>
        </div>
    );
}

// 기존 스타일 유지 및 페이지 번호 스타일 추가
const thStyle = { padding: "15px", color: "#475569", fontSize: "0.9rem", fontWeight: "600" };
const tdStyle = { padding: "12px 15px", color: "#1e293b", fontSize: "0.95rem", verticalAlign: "middle" };
const actionBtnStyle = {
    padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "#fff",
    fontSize: "0.85rem", cursor: "pointer", marginLeft: "5px", transition: "0.2s"
};
const categoryBadgeStyle = { padding: "4px 8px", backgroundColor: "#f1f5f9", borderRadius: "4px", fontSize: "0.75rem", color: "#6366f1", fontWeight: "bold" };
const navBtnStyle = { padding: "10px 20px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" };

// 🚩 페이지 번호용 스타일 추가
const pageBtnStyle = {
    padding: "8px 14px", border: "1px solid", borderRadius: "6px", cursor: "pointer",
    fontSize: "0.9rem", fontWeight: "500", transition: "0.2s"
};

export default Recipesuser;
