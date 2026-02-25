import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRecipeList } from '../../api/recipeApi';
import { toBackendUrl } from '../../utils/backendUrl';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [pageInfo, setPageInfo] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "0");

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await getRecipeList({ keyword, category, page });
                if (response.data && response.data.data) {
                    setRecipes(response.data.data.content);
                    setPageInfo(response.data.data);
                }
            } catch (error) {
                console.error("레시피 로드 실패:", error);
                setRecipes([]);
            }
        };
        fetchRecipes();
    }, [keyword, category, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ category, keyword: e.target.elements.keyword.value, page: 0 });
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px 20px' }}>
            <h2 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '30px' }}>맛있는 레시피 찾아보기</h2>

            {/* 검색창 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', maxWidth: '500px' }}>
                    <input
                        name="keyword"
                        defaultValue={keyword}
                        placeholder="검색어를 입력하세요"
                        style={{ flex: 1, padding: '12px 20px', borderRadius: '25px 0 0 25px', border: '1px solid #ddd', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '0 25px', background: '#333', color: '#fff', border: 'none', borderRadius: '0 25px 25px 0', cursor: 'pointer' }}>
                        검색
                    </button>
                </form>
            </div>

            {/* 카테고리 네비게이션 (DeleteList 스타일 적용) */}
            <div className="category-nav" style={{ marginBottom: '40px' }}>
                <ul style={{ display: "flex", justifyContent: "center", listStyle: "none", gap: "10px", padding: 0 }}>
                    {["", "KOREAN", "BAKERY", "DESSERT", "ETC"].map((cat) => (
                        <li key={cat}>
                            <button
                                onClick={() => setSearchParams({ category: cat, keyword, page: 0 })}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "25px",
                                    backgroundColor: category === cat ? "#ff6b6b" : "#f0f0f0",
                                    color: category === cat ? "#fff" : "#333",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: '600',
                                    transition: '0.2s'
                                }}
                            >
                                {cat === "" ? "전체" : cat === "KOREAN" ? "한식" : cat === "BAKERY" ? "베이커리" : cat === "DESSERT" ? "디저트" : "기타"}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 레시피 그리드 (3열 고정) */}
            <div
                className="recipe-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "30px",
                    marginTop: "20px"
                }}
            >
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card" style={{
                            border: "1px solid #eee",
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            background: '#fff'
                        }}>
                            {/* 이미지: 200x200 정사각 고정 */}
                            <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
                                <img
                                    src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "/images/recipe/default.jpg"}
                                    alt={recipe.title}
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        marginBottom: '15px'
                                    }}
                                />
                                <h4 style={{ fontSize: '1.1rem', color: '#333', fontWeight: '700', marginBottom: '10px' }} className="text-truncate">
                                    {recipe.title}
                                </h4>
                            </Link>

                            <p style={{ color: '#ff9f43', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                리뷰 {recipe.reviewCount || 0}
                            </p>

                            <Link
                                to={`/recipes/${recipe.id}`}
                                style={{
                                    display: 'block',
                                    width: "100%",
                                    padding: "10px",
                                    backgroundColor: "#333",
                                    color: "white",
                                    textDecoration: "none",
                                    borderRadius: "8px",
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    marginTop: '10px'
                                }}
                            >
                                레시피 보기
                            </Link>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", gridColumn: "1/4", padding: "100px 0", color: '#999' }}>
                        등록된 레시피가 없습니다.
                    </div>
                )}
            </div>

            {/* 페이지네이션 (간소화 버전) */}
            {pageInfo.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '50px' }}>
                    {[...Array(pageInfo.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setSearchParams({ category, keyword, page: i })}
                            style={{
                                width: '35px', height: '35px', borderRadius: '50%', border: 'none',
                                backgroundColor: page === i ? '#333' : '#f0f0f0',
                                color: page === i ? '#fff' : '#333',
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
};

export default RecipeList;