import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getOneDayClasses } from "../api/onedayApi";
import { fetchProducts } from "../api/products";
import { getRecipeList } from "../api/recipeApi";
import { toBackendUrl } from "../utils/backendUrl";
import ProductCard from "../components/ProductCard";
import "./SearchPage.css";

// 간단한 카드 컴포넌트
const SearchResultCard = ({ item, type }) => {
    if (type === "product") return <ProductCard p={item} />;

    const link = type === "class" ? `/classes/oneday/classes/${item.id}` : `/recipes/${item.id}`;
    const title = item.title || item.classTitle || "제목 없음";

    // 레시피 이미지 경로 처리
    const image = type === "recipe"
        ? (item.recipeImg ? toBackendUrl(`/images/recipe/${item.recipeImg}`) : "/images/recipe/default.jpg")
        : (item.mainImage || item.thumbnail || item.imageUrl || "https://via.placeholder.com/300");

    return (
        <Link to={link} className="search-result-card">
            <div className="card-image">
                <img src={image} alt={title} />
            </div>
            <div className="card-info">
                <span className="card-category">{item.categoryLabel || item.category || (type === "class" ? "클래스" : "레시피")}</span>
                <h3 className="card-title">{title}</h3>
                {type === "class" && <p className="card-meta">{item.levelLabel} · {item.instructorName}</p>}
                {type === "recipe" && <p className="card-meta">리뷰 {item.reviewCount || 0}</p>}
            </div>
        </Link>
    );
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";

    const [results, setResults] = useState({
        classes: [],
        products: [],
        recipes: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;

        const fetchAll = async () => {
            setLoading(true);
            try {
                const [classRes, productRes, recipeRes] = await Promise.allSettled([
                    getOneDayClasses({ keyword: query, size: 8 }),
                    fetchProducts({ keyword: query, size: 8 }),
                    getRecipeList({ keyword: query, size: 8 }) // keyword로 통일
                ]);

                setResults({
                    classes: classRes.status === "fulfilled" ? (classRes.value.content || classRes.value || []) : [],
                    products: productRes.status === "fulfilled" ? (productRes.value.content || productRes.value || []) : [],
                    recipes: recipeRes.status === "fulfilled" ? (recipeRes.value.data?.data?.content || recipeRes.value.data?.content || []) : []
                });
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [query]);

    const isEmpty = !results.classes.length && !results.products.length && !results.recipes.length;

    return (
        <div className="search-page container">
            <header className="search-header">
                <h1>"{query}" 검색 결과</h1>
                <p>총 {results.classes.length + results.products.length + results.recipes.length}개의 항목을 찾았습니다.</p>
            </header>

            {loading ? (
                <div className="search-loading">검색 중...</div>
            ) : isEmpty ? (
                <div className="search-empty">
                    <p>검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>
                </div>
            ) : (
                <div className="search-sections">
                    {results.classes.length > 0 && (
                        <section className="search-section">
                            <div className="section-header">
                                <h2>원데이 클래스 ({results.classes.length})</h2>
                                <Link to="/classes/oneday/classes">더보기</Link>
                            </div>
                            <div className="search-grid">
                                {results.classes.map(item => <SearchResultCard key={item.id} item={item} type="class" />)}
                            </div>
                        </section>
                    )}

                    {results.products.length > 0 && (
                        <section className="search-section">
                            <div className="section-header">
                                <h2>마켓 상품 ({results.products.length})</h2>
                                <Link to="/products">더보기</Link>
                            </div>
                            <div className="search-grid">
                                {results.products.map(item => <SearchResultCard key={item.id} item={item} type="product" />)}
                            </div>
                        </section>
                    )}

                    {results.recipes.length > 0 && (
                        <section className="search-section">
                            <div className="section-header">
                                <h2>레시피 ({results.recipes.length})</h2>
                                <Link to="/recipes/list">더보기</Link>
                            </div>
                            <div className="search-grid">
                                {results.recipes.map(item => <SearchResultCard key={item.id} item={item} type="recipe" />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
