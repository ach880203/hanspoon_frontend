import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRecipeList } from '../../api/recipeApi';
import { toBackendUrl } from '../../utils/backendUrl';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [pageInfo, setPageInfo] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    
    // URL에서 검색어와 카테고리 가져오기
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "0");

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // API 호출 시 쿼리 파라미터 전달
                const response = await getRecipeList({ keyword, category, page });
                if (response.data && response.data.data) {
                    console.log("3. 실제내용", response.data.data.content);
                    setRecipes(response.data.data.content);
                }
            } catch (error) {
                console.error("레시피 목록 로드 실패:", error);
            }
        };
        fetchRecipes();
    }, [keyword, category, page]);

    // 카테고리 변경 함수
    const handleCategoryChange = (cat) => {
        setSearchParams({ category: cat, keyword, page: 0 });
    };

    // 검색 실행 함수
    const handleSearch = (e) => {
        e.preventDefault();
        const searchKeyword = e.target.elements.keyword.value;
        setSearchParams({ category, keyword: searchKeyword, page: 0 });
    };

    return (
        <div className="container mt-5 d-flex flex-column align-items-center">
            <div className="text-center mb-6 w-100">
                <h2 className="main-title mb-3" style={{ fontWeight: 800, color: '#1a1a1a' }}>맛있는 레시피 찾아보기</h2>
                <div className="d-flex justify-content-center mb-4">
                    <Link to="/recipes" className="btn btn-register shadow-sm" style={btnRegisterStyle}>
                        + 나만의 레시피 등록
                    </Link>
                </div>

                <div className="row justify-content-center mt-5 w-100 m-10"
                            style={{margin: 20}}>
                    <div className="col-md-6">
                        <form onSubmit={handleSearch} className="input-group mb-3">
                            <input 
                                className="form-control search-input shadow-sm" 
                                type="search" 
                                name="keyword"
                                defaultValue={keyword}
                                placeholder="검색어를 입력하세요 (예: 제육볶음)"
                                style={searchInputStyle}
                            />
                            <button className="btn btn-dark search-btn" type="submit" style={searchBtnStyle}>
                                검색
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="w-100 mb-5">
                <ul className="nav nav-tabs border-0 gap-2" 
                    style={{ listStyle: 'none', padding: 0, flexWrap: 'nowrap', 
                        display: 'flex', margin: 20, justifyContent: 'center'}}
                    role="tablist">
                    {['', 'KOREAN', 'BAKERY', 'DESSERT', 'ETC'].map((cat) => (
                        <li className="nav-item" key={cat}>
                            <button 
                                className={`nav-link ${category === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                                style={category === cat ? activeNavLinkStyle : navLinkStyle}
                            >
                                {cat === '' ? '전체' : cat === 'KOREAN' ? '한식' : cat === 'BAKERY' ? '베이커리' : cat === 'DESSERT' ? '디저트' : '기타'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 레시피 목록 */}
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div className="col" key={recipe.id}>
                            <div className="card h-100 shadow-sm border-0 recipe-card" style={cardStyle}>
                                <div className="card-img-wrapper" style={imgWrapperStyle}>
                                    <Link to={`/recipes/${recipe.id}`}>
                                        <img 
                                            src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : '/images/recipe/default.jpg'}
                                            className="card-img-top" 
                                            style={{ height: '100%', width: '100%', objectFit: 'cover', transition: '0.5s' }}
                                            alt={recipe.title}
                                        />
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title text-truncate" style={{ fontWeight: 700 }}>{recipe.title}</h5>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="review-info" style={{ color: '#ff9f43', fontWeight: 700 }}>
                                            리뷰 <span>{recipe.reviewCount || 0}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent border-0 pb-3 px-3">
                                    <Link to={`/recipes/${recipe.id}`} className="btn btn-outline-dark btn-sm w-100 fw-bold">자세히 보기</Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">레시피가 없습니다.</div>
                )}
            </div>

            {/* 페이지네이션 */}
            <nav className="py-5">
                <ul className="pagination justify-content-center">
                    {!pageInfo.first && (
                        <li className="page-item"><button className="page-link" onClick={() => setSearchParams({ category, keyword, page: page - 1 })}>&laquo;</button></li>
                    )}
                    {[...Array(pageInfo.totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setSearchParams({ category, keyword, page: i })}>{i + 1}</button>
                        </li>
                    ))}
                    {!pageInfo.last && (
                        <li className="page-item"><button className="page-link" onClick={() => setSearchParams({ category, keyword, page: page + 1 })}>&raquo;</button></li>
                    )}
                </ul>
            </nav>

            <style>{`
                .recipe-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
                .recipe-card:hover img { transform: scale(1.1); }
            `}</style>
        </div>
    );
};

// 스타일 객체
const btnRegisterStyle = {
    backgroundColor: '#ff6b6b', color: 'white', borderRadius: '50px',
    padding: '10px 24px', fontWeight: '600', border: 'none'
};

const searchInputStyle = { borderRadius: '50px 0 0 50px', paddingLeft: '25px', border: '2px solid #eee' };
const searchBtnStyle = { borderRadius: '0 50px 50px 0', padding: '0 25px', background: '#333', border: 'none' };

const navLinkStyle = {
    border: 'none', color: '#777', fontWeight: '600', padding: '12px 25px',
    borderRadius: '50px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const activeNavLinkStyle = {
    ...navLinkStyle, background: '#ff6b6b', color: 'white', boxShadow: '0 5px 15px rgba(255,107,107,0.3)'
};

const cardStyle = { borderRadius: '20px', transition: '0.3s', background: '#fff' };
const imgWrapperStyle = { borderRadius: '20px 20px 0 0', overflow: 'hidden', height: '220px' };

export default RecipeList;
