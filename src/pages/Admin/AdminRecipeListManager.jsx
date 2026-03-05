import { useState, useEffect, useCallback, useMemo } from "react";
import { deleteRecipe, getRecipeList } from "../../api/recipeApi";
import { Link, useNavigate } from "react-router-dom";
import "./AdminRecipeManager.css";
import { toBackendUrl } from "../../utils/backendUrl.js";

export default function AdminRecipeListManager() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    // [추가] 페이지 정보 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const navigate = useNavigate();

    const loadRecipes = useCallback(async () => {
        setLoading(true);
        try {
            // [수정] params에 page 번호를 함께 전달합니다.
            const response = await getRecipeList({ deleted: false, page: page });

            const result = response.data?.data || response;
            console.log("실제 추출된 결과 객체:", result);

            if (result && result.content) {
                setRecipes(result.content);
                // [추가] 백엔드에서 준 페이지 정보 저장 (Page 객체 대응)
                setTotalPages(result.page?.totalPages || result.totalPages || 0);
            } else {
                setRecipes([]);
                setTotalPages(0);
            }
        } catch (e) {
            console.error("레시피 로딩 실패", e);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    }, [page]); // [수정] page가 바뀔 때마다 다시 호출되도록 설정

    useEffect(() => {
        void loadRecipes();
    }, [loadRecipes]);

    // 검색 필터링 (현재 페이지 내에서 검색)
    const filteredRecipes = useMemo(() => {
        return recipes.filter(r =>
            r.title?.toLowerCase().includes(keyword.toLowerCase()) ||
            r.username?.toLowerCase().includes(keyword.toLowerCase())
        );
    }, [recipes, keyword]);

    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 레시피를 삭제(비활성화) 하시겠습니까?")) return;
        try {
            await deleteRecipe(id);
            alert("삭제되었습니다.");
            await loadRecipes();
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <section className="admin-panel">
            <div className="admin-panel-head">
                <h3>레시피 목록</h3>
                <div className="admin-panel-actions">
                    <input
                        className="admin-input"
                        placeholder="레시피명, 작성자 검색"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(0); // 검색어 입력 시 첫 페이지로 리셋
                        }}
                    />
                    <button className="admin-btn-main" onClick={() => navigate("/recipes")}>
                        신규 레시피 등록
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>이미지</th>
                        <th>레시피명</th>
                        <th>작성자</th>
                        <th>추천수</th>
                        <th>리뷰수</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: "40px 0" }}>
                                레시피 목록을 불러오는 중입니다.
                            </td>
                        </tr>
                    ) : filteredRecipes.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: "40px 0" }}>
                                조건에 맞는 레시피가 없습니다.
                            </td>
                        </tr>
                    ) : filteredRecipes.map(recipe => (
                        <tr key={recipe.id}>
                            <td>{recipe.id}</td>
                            <td>
                                <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
                                    <img src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "/images/recipe/default.jpg"}
                                         alt="thumb" width="50" style={{ objectFit: 'cover', height: '50px', borderRadius: '4px' }} />
                                </Link>
                            </td>
                            <td>{recipe.title}</td>
                            <td>{recipe.username}</td>
                            <td>🥄 {recipe.recommendCount}</td>
                            <td>🗨️ {recipe.reviewCount}</td>
                            <td>
                                <button className="admin-btn-sm" onClick={() => navigate(`/recipes/edit/${recipe.id}`)}>
                                    수정하기
                                </button>
                                <button className="admin-btn-sm btn-danger" onClick={() => handleDelete(recipe.id)}>
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* [추가] 페이지네이션 UI */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', paddingBottom: '20px' }}>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                backgroundColor: page === i ? '#333' : '#fff',
                                color: page === i ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontWeight: page === i ? 'bold' : 'normal'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
