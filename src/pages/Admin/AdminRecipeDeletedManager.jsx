import { useState, useEffect, useCallback, useMemo } from "react";
import {deletelist, deletereturn} from "../../api/recipeApi";
import "./AdminRecipeManager.css"; // 공통 관리자 스타일

export default function AdminRecipeDeletedManager() {
    const [deletedRecipes, setDeletedRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");

    // 1. 삭제된 레시피 목록 불러오기 (deleted=true인 것들)
    const loadDeletedRecipes = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // API 호출 시 파라미터로 삭제된 상태(true)만 요청한다고 가정
            const data = await deletelist({ deleted: true });
            setDeletedRecipes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError("삭제된 레시피 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDeletedRecipes();
    }, [loadDeletedRecipes]);

    // 2. 검색 필터링 (레시피명, 작성자)
    const filteredRecipes = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        return deletedRecipes.filter((r) => {
            if (!normalizedKeyword) return true;
            return (
                r.title?.toLowerCase().includes(normalizedKeyword) ||
                r.username?.toLowerCase().includes(normalizedKeyword)
            );
        });
    }, [deletedRecipes, keyword]);

    // 3. 복구 처리 (deleted를 다시 false로)
    const handleRestore = async (id) => {
        if (!window.confirm("이 레시피를 목록으로 복구하시겠습니까?")) return;
        try {
            await deletereturn(id);
            alert("복구되었습니다.");
            await deletelist(); // 목록 새로고침
        } catch (e) {
            console.error(e);
            alert("복구 중 오류가 발생했습니다.");
        }
    };
/*
    // 4. (선택) 영구 삭제 처리
    const handlePermanentDelete = async (id) => {
        if (!window.confirm("정말 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
        try {
            await permanentDeleteRecipe(id);
            alert("영구 삭제되었습니다.");
            await loadDeletedRecipes();
        } catch (e) {
            console.error(e);
            alert("영구 삭제 중 오류가 발생했습니다.");
        }
    };
*/
    return (
        <section className="admin-class-panel">
            <div className="admin-class-panel-head">
                <h3>삭제된 레시피 관리</h3>
                <div className="admin-class-panel-actions">
                    <input
                        className="admin-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="레시피명, 작성자 검색"
                    />
                    <button
                        type="button"
                        className="admin-btn-search"
                        onClick={() => void loadDeletedRecipes()}
                        disabled={loading}
                    >
                        {loading ? "조회 중..." : "새로고침"}
                    </button>
                </div>
            </div>

            {error && <div className="admin-class-msg admin-class-msg-error">{error}</div>}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>이미지</th>
                        <th>레시피명</th>
                        <th>작성자</th>
                        <th>삭제일</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRecipes.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="admin-class-empty-row">
                                삭제된 레시피 내역이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        filteredRecipes.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>
                                    <img
                                        src={item.recipeMainImg || "/default-recipe.png"}
                                        alt="thumbnail"
                                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                    />
                                </td>
                                <td className="admin-class-ellipsis" title={item.title}>
                                    {item.title}
                                </td>
                                <td>{item.username || "알 수 없음"}</td>
                                <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="admin-btn-sm"
                                        onClick={() => void handleRestore(item.id)}
                                        style={{ marginRight: "5px", backgroundColor: "#4caf50", color: "white" }}
                                    >
                                        복구
                                    </button>
                                    {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="admin-btn-sm"*/}
                                    {/*    onClick={() => void handlePermanentDelete(item.id)}*/}
                                    {/*    style={{ backgroundColor: "#f44336", color: "white" }}*/}
                                    {/*>*/}
                                    {/*    영구삭제*/}
                                    {/*</button>*/}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
