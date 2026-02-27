import { useState, useEffect, useCallback, useMemo } from "react";
import {deleteRecipe, getRecipeList, updateRecipe} from "../../api/recipeApi"; // API 경로는 프로젝트에 맞게
import {Link, useNavigate} from "react-router-dom";
import "./AdminRecipeManager.css";
import {toBackendUrl} from "../../utils/backendUrl.js";

export default function AdminRecipeListManager() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const loadRecipes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getRecipeList({ deleted: false });

            // 로그에 찍힌 "Object { content: Array(3), ... }" 형태를 처리합니다.
            // Axios를 사용 중이시라면 보통 response.data 안에 백엔드 데이터가 들어있습니다.
            const result = response.data?.data || response;

            console.log("실제 추출된 결과 객체:", result);

            if (result && Array.isArray(result.content)) {
                // 🚩 핵심: result.content가 우리가 원하는 레시피 배열입니다!
                setRecipes(result.content);
            } else if (Array.isArray(result)) {
                // 혹시라도 나중에 배열로 바로 올 경우를 대비
                setRecipes(result);
            } else {
                setRecipes([]);
            }
        } catch (e) {
            console.error("레시피 로딩 실패", e);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    }, [getRecipeList]);

    useEffect(() => {
        void loadRecipes(); // void를 붙이면 await 없이 실행해도 ESLint가 허용해주는 경우가 많습니다.
    }, [loadRecipes]);

    // 검색 필터링
    const filteredRecipes = useMemo(() => {
        return recipes.filter(r =>
            r.title.toLowerCase().includes(keyword.toLowerCase()) ||
            r.username?.toLowerCase().includes(keyword.toLowerCase())
        );
    }, [recipes, keyword]);

    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 레시피를 삭제(비활성화) 하시겠습니까?")) return;
        try {
            await deleteRecipe(id);
            alert("삭제되었습니다.");

            // 🚩 여기가 포인트입니다!
            // loadRecipes가 비동기 함수이므로, 목록을 다시 불러오는 것이 완료될 때까지 기다려야 합니다.
            await loadRecipes();

        } catch (e) {
            console.error(e); // 에러 로그를 남겨두면 나중에 확인하기 좋아요!
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
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button className="admin-btn-main" onClick={() => navigate("/recipe/new")}>
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
                    {filteredRecipes.map(recipe => (
                        <tr key={recipe.id}>
                            <td>{recipe.id}</td>
                            <td>
                                <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
                                    <img src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "/images/recipe/default.jpg"}
                                     alt="thumb" width="50" />
                                </Link>
                            </td>
                            <td>{recipe.title}</td>
                            <td>{recipe.username}</td>
                            <td>🥄 {recipe.recommendCount}</td>
                            <td> {recipe.reviewCount}</td>
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
        </section>
    );
}
