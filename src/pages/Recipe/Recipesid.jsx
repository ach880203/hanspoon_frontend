import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteRecipe, deletewihses, getRecipeDetail, Recommend, toggleWish } from "../../api/recipeApi";
import { toBackendUrl } from "../../utils/backendUrl";
import RecipeFeedbackPanel from "./RecipeFeedbackPanel";
import { useAuth } from "../../contexts/AuthContext.jsx";

// 🚩 1. 숫자가 1000g 이상이면 kg으로 자동 변환하는 함수 추가
const formatWeight = (amount, unit) => {
    const numAmount = Number(amount);
    if (unit === "g" && numAmount >= 1000) {
        return `${(numAmount / 1000).toFixed(1).replace(/\.0$/, "")}kg`;
    }
    // g이 아니거나 1000 미만이면 숫자 + 단위를 결합하여 반환
    return `${numAmount.toFixed(1).replace(/\.0$/, "")}${unit}`;
};

const getCalculatedAmount = (ing, ratio, recipeData, flavor) => {
    let amount = Number(ing.baseAmount);
    let adjustedRatio = ratio;

    if (recipeData.category === "KOREAN" || recipeData.category === "한식") {
        if (!ing.main && ratio > 1) {
            adjustedRatio = 1 + (ratio - 1) * 0.5;
        }
    }

    amount *= adjustedRatio;
    const getWeight = (key) => 1 + (flavor[key] - (recipeData[key] || 3)) * 0.1;

    if (ing.tasteType === "SPICY") amount *= getWeight("spiciness");
    if (ing.tasteType === "SWEET") amount *= getWeight("sweetness");
    if (ing.tasteType === "SALT") amount *= getWeight("saltiness");

    if (Number.isNaN(amount)) return 0;

    return amount; // 🚩 나중에 formatWeight를 씌우기 위해 숫자값 그대로 반환
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderInstruction = (content, ratio, recipe, flavor) => {
    if (!content || !recipe) return content;

    const ingredients = (recipe.ingredientGroup || [])
        .flatMap((group) => group.ingredients || [])
        .filter((ing) => typeof ing?.name === "string" && ing.name.trim().length > 0)
        .sort((a, b) => b.name.trim().length - a.name.trim().length);

    let converted = content;
    ingredients.forEach((ing) => {
        const name = ing.name.trim();
        const rawAmount = getCalculatedAmount(ing, ratio, recipe, flavor);
        // 🚩 조리 단계 설명 텍스트 내부에도 kg 변환 적용
        const displayAmount = formatWeight(rawAmount, ing.unit);

        const tokenRegex = new RegExp(`@${escapeRegExp(name)}`, "g");
        converted = converted.replace(
            tokenRegex,
            `<strong style="color: #ff6b6b; font-weight: bold;">${name} ${displayAmount}</strong>`
        );
    });

    return converted;
};

const Recipesid = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentServings, setCurrentServings] = useState(1);
    const [flavor, setFlavor] = useState({ spiciness: 3, sweetness: 3, saltiness: 3 });
    const [baseFlavor, setBaseFlavor] = useState({ spiciness: 3, sweetness: 3, saltiness: 3 });
    const [editingIng, setEditingIng] = useState({ id: null, value: "" });
    const [isFavorite, setIsFavorite] = useState(false);
    const [recommendCount, setRecommendCount] = useState(0);
    const [isRecommended, setIsRecommended] = useState(false);

    const isAdmin = !!user?.role?.includes("ADMIN");

    const isMyRecipe = useMemo(() => {
        if (!recipe || !user) return false;
        return String(recipe.userId) === String(user.userId);
    }, [recipe, user]);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const response = await getRecipeDetail(id);
                const data = response.data.data;
                setRecipe(data);
                setCurrentServings(Number(data.baseServings) || 1);
                setIsFavorite(data.wished);
                setRecommendCount(data.recommendCount || 0);
                setIsRecommended(data.recommended || false);

                const initialFlavor = {
                    spiciness: data.spiciness ?? 3,
                    sweetness: data.sweetness ?? 3,
                    saltiness: data.saltiness ?? 3,
                };
                setFlavor(initialFlavor);
                setBaseFlavor(initialFlavor);
            } catch (error) {
                console.error("로드 실패:", error);
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRecipe();
    }, [id, navigate]);

    const handleToggleRecommend = async () => {
        if (isMyRecipe) {
            alert("본인의 레시피는 추천할 수 없습니다.");
            return;
        }
        try {
            const response = await Recommend(id);
            if (response.status === 200 || response.status === 201) {
                if (!isRecommended) {
                    setRecommendCount(prev => prev + 1);
                    setIsRecommended(true);
                    alert("이 레시피를 추천했습니다! 🥄");
                } else {
                    setRecommendCount(prev => prev - 1);
                    setIsRecommended(false);
                    alert("추천을 취소했습니다.");
                }
            }
        } catch (error) {
            console.error("추천 처리 실패:", error);
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

    const ratio = useMemo(() => {
        if (!recipe || !recipe.baseServings) return 1;
        const base = Number(recipe.baseServings);
        return base > 0 ? currentServings / base : 1;
    }, [currentServings, recipe]);

    const handleIngAmountChange = (ingId, ingBaseAmount, inputValue) => {
        setEditingIng({ id: ingId, value: inputValue });
        if (inputValue === "" || Number.isNaN(parseFloat(inputValue))) {
            setCurrentServings(0);
            return;
        }
        const newAmount = parseFloat(inputValue);
        const baseServings = Number(recipe.baseServings) || 1;
        const nextServings = (newAmount / Number(ingBaseAmount)) * baseServings;
        setCurrentServings(Math.round(nextServings * 10) / 10);
    };

    const handleDelete = async () => {
        if (!window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) return;
        try {
            await deleteRecipe(id);
            alert("레시피가 삭제되었습니다.");
            navigate("/recipes/list");
        } catch (error) {
            console.error("레시피 처리 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await deletewihses(recipe.wihsid);
                setIsFavorite(false);
                alert("관심 목록에서 제거되었습니다.");
            } else {
                await toggleWish(id);
                setIsFavorite(true);
                alert("관심 목록에 등록되었습니다.");
            }
        } catch (error) {
            console.error("목록 처리 실패:", error);
            alert("요청을 처리할 수 없습니다.");
        }
    };

    if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>데이터를 불러오는 중입니다...</div>;
    if (!recipe) return <div style={{ padding: "100px", textAlign: "center" }}>레시피 정보를 찾을 수 없습니다.</div>;

    return (
        <div style={bodyStyle}>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            <header style={headerStyle}>
                <div style={containerStyle}>
                    <div style={headerFlex}>
                        <div style={imgWrapper}>
                            <img
                                src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "https://via.placeholder.com/600x400?text=%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%97%86%EC%9D%8C"}
                                alt={recipe.title}
                                style={mainImgStyle}
                            />
                        </div>

                        <div style={infoCard}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                <span style={categoryBadge}>{recipe.category}</span>
                                <h1 style={titleStyle}>{recipe.title}</h1>
                                <button
                                    onClick={handleToggleFavorite}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: isFavorite ? "#ff6b6b" : "#ccc" }}
                                >
                                    <i className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                                </button>
                            </div>

                            <div style={servingsBox}>
                                <input
                                    type="number"
                                    // 🚩 빈 문자열일 때는 공백으로 보여주기 위해 조건 추가
                                    value={currentServings === 0 ? "" : currentServings}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setCurrentServings(0); // 🚩 지웠을 때는 일단 0(또는 "")으로 둡니다.
                                        } else {
                                            setCurrentServings(Number(val));
                                        }
                                    }}
                                    // 🚩 입력을 마치고 마우스를 뗐을 때 최소값(0.1) 체크
                                    onBlur={() => {
                                        if (currentServings < 0.1) {
                                            setCurrentServings(0.1);
                                        }
                                    }}
                                    style={servingsInput}
                                    step="0.5"
                                    placeholder="0"
                                />
                                <span style={{ fontWeight: "bold" }}>인분 기준</span>
                            </div>

                            <div style={flavorDisplayBox}>
                                <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "bold", marginBottom: "10px" }}>내 입맛에 맞게 맛 조절</div>
                                {["spiciness", "sweetness", "saltiness"].map((key, idx) => {
                                    const labels = ["매운맛", "단맛", "짠맛"];
                                    const colors = ["#ff6b6b", "#ffc107", "#6366f1"];
                                    return (
                                        <div key={key} style={flavorRow}>
                                            <span style={{ width: "50px", fontSize: "12px" }}>{labels[idx]}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="5"
                                                value={flavor[key]}
                                                onChange={(e) => setFlavor({ ...flavor, [key]: parseInt(e.target.value, 10) })}
                                                style={{ flex: 1, accentColor: colors[idx] }}
                                            />
                                            <span style={{ ...currentValueBadge, backgroundColor: colors[idx] }}>현재: {flavor[key]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <h4 style={subTitleStyle}><i className="fa-solid fa-basket-shopping" /> 필요 재료</h4>
                            <div style={ingredientScrollArea}>
                                {(recipe.ingredientGroup || []).map((group, gIdx) => (
                                    <div key={gIdx} style={{ marginBottom: "15px" }}>
                                        <div style={ingGroupTitle}>{group.groupName || group.name}</div>
                                        {group.ingredients?.map((ing, iIdx) => (
                                            <div key={iIdx} style={ingRow}>
                                                <span>{ing.name}{ing.main && <span style={mainBadge}>핵심</span>}</span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                {/* 🚩 재료 목록에 kg 변환 로직 적용된 input */}
                                                    <input
                                                        type="text"
                                                        value={
                                                            // 🚩 수정 중일 때는 내가 타이핑하는 숫자(editingIng.value)를 보여주고,
                                                            // 평소에는 kg 변환이 적용된 값(formatWeight...)을 보여줍니다.
                                                            editingIng.id === `${gIdx}-${iIdx}`
                                                                ? editingIng.value
                                                                : currentServings === 0
                                                                    ? ""
                                                                    : formatWeight(getCalculatedAmount(ing, ratio, recipe, flavor), ing.unit)
                                                        }
                                                        // 🚩 클릭(Focus)하면 수정 모드로 전환! 이때 kg을 떼고 '숫자'만 넣어줍니다.
                                                        onFocus={() => {
                                                            const rawAmount = getCalculatedAmount(ing, ratio, recipe, flavor);
                                                            setEditingIng({
                                                                id: `${gIdx}-${iIdx}`,
                                                                value: rawAmount.toFixed(1).replace(/\.0$/, "")
                                                            });
                                                        }}
                                                        // 🚩 입력창 밖을 클릭(Blur)하면 수정 모드 종료
                                                        onBlur={() => setEditingIng({ id: null, value: "" })}
                                                        onChange={(e) => handleIngAmountChange(`${gIdx}-${iIdx}`, ing.baseAmount, e.target.value)}

                                                        // 🚩 readOnly는 이제 삭제하거나 아래처럼 동적으로 관리합니다.
                                                        style={{
                                                            width: "80px",
                                                            padding: "2px 5px",
                                                            border: "1px solid #ddd",
                                                            borderRadius: "4px",
                                                            textAlign: "right",
                                                            fontSize: "14px",
                                                            fontWeight: "bold",
                                                            // 수정 중일 때는 하얀색 배경과 강조 테두리를 줍니다.
                                                            backgroundColor: editingIng.id === `${gIdx}-${iIdx}` ? "#fff" : "#f9f9f9",
                                                            outline: editingIng.id === `${gIdx}-${iIdx}` ? "2px solid #6366f1" : "none",
                                                            cursor: "pointer"
                                                        }}
                                                    />
                                                    {/* g인 경우 formatWeight에서 이미 단위가 붙어 나오므로, g가 아닐 때만 단위를 따로 표시 */}
                                                    {/*{ing.unit !== "g" && <span style={unitText}>{ing.unit}</span>}*/}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <button onClick={() => setCurrentServings(Number(recipe.baseServings))} style={resetBtn}>원래 인분으로</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ ...containerStyle, marginTop: "40px", paddingBottom: "80px", whiteSpace: "pre-wrap" }}>
                <h3 style={sectionTitleStyle}><i className="fa-solid fa-fire-burner" /> 조리 순서</h3>
                <div style={{ maxWidth: "850px", margin: "0 auto" }}>
                    {(recipe.instructionGroup || []).map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: "40px" }}>
                            <h5 style={stepGroupTitle}>{group.groupTitle || group.title}</h5>
                            {group.instructions?.map((step, sIdx) => (
                                <div key={sIdx} style={stepCard}>
                                    <div style={stepContentFlex}>
                                        <div style={stepNumberBadge}>{sIdx + 1}</div>
                                        <div style={stepInfo}>
                                            <p
                                                style={stepText}
                                                dangerouslySetInnerHTML={{ __html: renderInstruction(step.content, ratio, recipe, flavor) }}
                                            />
                                        </div>
                                        {step.instImg && (
                                            <div style={stepImgWrapper}>
                                                <img src={toBackendUrl(`/images/recipe/${step.instImg}`)} alt={`단계 ${sIdx + 1}`} style={stepImg} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <RecipeFeedbackPanel recipeId={id} />

                <div style={bottomNav}>
                    <button onClick={() => navigate(-1)} style={navBtn}>이전으로</button>
                    <Link to="/recipes/list" style={{ ...navBtn, backgroundColor: "#ff6b6b", color: "#fff", border: "none" }}>전체 레시피 보기</Link>
                    {isAdmin && (
                        <>
                            <button onClick={() => navigate(`/recipes/edit/${id}`)} style={{ ...navBtn, backgroundColor: "#4dabf7", color: "#fff", border: "none" }}>수정하기</button>
                            <button onClick={handleDelete} style={{ ...navBtn, backgroundColor: "#df1a1a", color: "#fff", border: "none" }}>삭제하기</button>
                        </>
                    )}
                </div>

                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    {isMyRecipe ? (
                        <div style={myRecipeLabel}>
                            <i className="fa-solid fa-thumbs-up"></i> 내 레시피가 받은 추천 <span style={{ color: '#ff6b6b' }}>{recommendCount}</span>개
                        </div>
                    ) : (
                        <button onClick={handleToggleRecommend} style={{ ...recommendBtn, backgroundColor: isRecommended ? '#ff6b6b' : '#fff', color: isRecommended ? '#fff' : '#ff6b6b' }}>
                            <i className={`fa-${isRecommended ? 'solid' : 'regular'} fa-thumbs-up`}></i>
                            <span>{isRecommended ? "추천 완료" : "레시피 추천"}</span>
                            <span style={recCountDivider}>{recommendCount}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 스타일 정의 ---
const bodyStyle = { backgroundColor: "#fcfcfc", minHeight: "100vh", fontFamily: "'Pretendard', sans-serif", color: "#333" };
const containerStyle = { maxWidth: "900px", margin: "0 auto", padding: "0 20px" };
const headerStyle = { background: "#fff", padding: "40px 0", borderBottom: "1px solid #f1f1f1" };
const headerFlex = { display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center" };
const imgWrapper = { flex: "0 0 300px", height: "300px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)", border: "1px solid #eee" };
const mainImgStyle = { width: "100%", height: "100%", objectFit: "cover" };
const infoCard = { flex: "1 1 400px", minWidth: "300px" };
const titleStyle = { fontSize: "26px", fontWeight: "800", margin: 0, color: "#1a1a1a" };
const categoryBadge = { background: "#6366f1", color: "#fff", padding: "5px 14px", borderRadius: "30px", fontSize: "13px", fontWeight: "600" };
const servingsBox = { margin: "15px 0", padding: "10px 15px", background: "#f8f9fa", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "10px" };
const servingsInput = { width: "55px", padding: "4px", borderRadius: "6px", border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" };
const flavorDisplayBox = { background: "#fff", border: "1px solid #edf2f7", padding: "18px", borderRadius: "16px", marginBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" };
const flavorRow = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" };
const currentValueBadge = { color: "#fff", padding: "3px 8px", borderRadius: "8px", fontSize: "11px", minWidth: "55px", textAlign: "center", fontWeight: "600" };
const subTitleStyle = { fontSize: "19px", fontWeight: "700", marginBottom: "15px", marginTop: "25px", display: "flex", alignItems: "center", gap: "8px" };
const ingredientScrollArea = { maxHeight: "300px", overflowY: "auto", paddingRight: "10px", borderTop: "1px solid #f8f9fa" };
const ingGroupTitle = { fontSize: "15px", fontWeight: "700", color: "#ff6b6b", marginTop: "15px", marginBottom: "10px", borderLeft: "4px solid #ff6b6b", paddingLeft: "10px" };
const ingRow = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f3f5", fontSize: "14px" };
const mainBadge = { fontSize: "10px", backgroundColor: "#fff3cd", color: "#856404", padding: "1px 4px", borderRadius: "3px", marginLeft: "6px", fontWeight: "bold" };
const resetBtn = { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "13px", marginTop: "10px" };
const sectionTitleStyle = { textAlign: "center", fontSize: "24px", fontWeight: "800", marginBottom: "40px", color: "#1a1a1a" };
const stepGroupTitle = { fontSize: "16px", color: "#666", borderBottom: "2px solid #eee", paddingBottom: "8px", marginBottom: "20px" };
const stepCard = { background: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: "25px", border: "1px solid #f8f9fa" };
const stepContentFlex = { display: "flex", gap: "20px", flexWrap: "wrap" };
const stepInfo = { flex: "1 1 400px" };
const stepText = { fontSize: "16px", lineHeight: "1.7", color: "#333", margin: 0 };
const stepImgWrapper = { flex: "0 0 200px" };
const stepImg = { width: "100%", height: "140px", objectFit: "cover", borderRadius: "12px" };
const stepNumberBadge = { flexShrink: 0, width: "32px", height: "32px", backgroundColor: "#ff6b6b", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" };
const bottomNav = { display: "flex", justifyContent: "center", gap: "15px", marginTop: "50px", borderTop: "1px solid #eee", paddingTop: "30px" };
const navBtn = { padding: "14px 28px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "15px", textDecoration: "none", color: "#333" };
const myRecipeLabel = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#f1f3f5', borderRadius: '20px', color: '#495057', fontSize: '15px', fontWeight: '600' };
const recommendBtn = { padding: '12px 25px', borderRadius: '30px', border: '2px solid #ff6b6b', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' };
const recCountDivider = { marginLeft: '8px', borderLeft: '1px solid', paddingLeft: '10px', opacity: 0.9 };

export default Recipesid;
