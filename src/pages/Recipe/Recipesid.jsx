import React, { useState, useEffect, useMemo } from "react";
import {useParams, useNavigate, Link, replace} from "react-router-dom";
import {deleteRecipe, deletewihses, getRecipeDetail, Recommend, toggleWish, updateRecipe} from "../../api/recipeApi";
import { toBackendUrl } from "../../utils/backendUrl";
import RecipeFeedbackPanel from "./RecipeFeedbackPanel";
import {useAuth} from "../../contexts/AuthContext.jsx";

const getCalculatedAmount = (ing, ratio, recipeData, flavor) => {
  let amount = Number(ing.baseAmount);
  let adjustedRatio = ratio;

  // 한식은 메인 재료가 아닌 경우 증량 기울기를 완만하게 적용한다.
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
  if (Number.isNaN(amount)) return "0";

  return amount.toFixed(1).replace(/\.0$/, "");
};

// 정규식 안전 치환을 위해 재료명을 escape 처리한다.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 조리 단계의 "@재료명" 토큰을 실제 계산된 중량 문자열로 치환한다.
const renderInstruction = (content, ratio, recipe, flavor) => {
  if (!content || !recipe) return content;

  // 공백이 있는 재료명도 정확히 치환되도록 전체 재료를 평탄화 후 길이순으로 처리한다.
  const ingredients = (recipe.ingredientGroup || [])
    .flatMap((group) => group.ingredients || [])
    .filter((ing) => typeof ing?.name === "string" && ing.name.trim().length > 0)
    .sort((a, b) => b.name.trim().length - a.name.trim().length);

  let converted = content;
  ingredients.forEach((ing) => {
    const name = ing.name.trim();
    const amount = getCalculatedAmount(ing, ratio, recipe, flavor);
    const tokenRegex = new RegExp(`@${escapeRegExp(name)}(?![\\w\\uAC00-\\uD7A3_])`, "g");
    converted = converted.replace(
      tokenRegex,
      `<strong style="color: #ff6b6b; font-weight: bold;">${name} ${amount}${ing.unit}</strong>`
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

        // 로그로 확인 (F12 콘솔창)
        console.log("레시피 작성자 ID:", recipe.userId);
        console.log("현재 로그인 유저 ID:", user.userId);

        return String(recipe.userId) === String(user.userId);
    }, [recipe, user]);
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await getRecipeDetail(id);
        const data = response.data.data;
        console.log("레시피",data)

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
        console.error("레시피 로드 실패:", error);
        alert("레시피 정보를 불러오지 못했습니다.");
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
        // 백엔드 toggle 로직에 따라 프론트 상태 변경
        if (!isRecommended) {
          setRecommendCount(prev => prev + 1);
          setIsRecommended(true);
          alert("이 레시피를 추천했습니다! 스푼이 적립되었어요 🥄");
        } else {
          setRecommendCount(prev => prev - 1);
          setIsRecommended(false);
          alert("추천을 취소했습니다.");
        }
      }
    } catch (error) {
      console.error("추천 처리 실패:", error);
      alert("로그인이 필요하거나 본인 레시피는 추천할 수 없습니다.");
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
      console.error("레시피 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };
  const handleToggleFavorite = async () => {
    try {

      if (isFavorite) {
        await deletewihses(recipe.wihsid);
        setIsFavorite(false);
        alert("관심 목록에서 제거되었습니다")
        console.log ("관심목록 삭제");
      }else{
        await toggleWish(id);
        setIsFavorite(true);
        alert("관심 목록에 등록되었습니다")
        console.log ("관심목록 등록");
      }
    } catch (error) {
      console.error("관심 등록/해제 실패:", error);
      alert("로그인이 필요하거나 요청을 처리할 수 없습니다.");
    }
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>데이터를 불러오는 중입니다...</div>;
  if (!recipe) return <div style={{ padding: "100px", textAlign: "center" }}>레시피 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={bodyStyle}>
      {/* 하트 아이콘 로드 */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={headerFlex}>
            {/* 왼쪽: 메인 이미지 */}
            <div style={imgWrapper}>
              <img
                src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "https://via.placeholder.com/600x400?text=%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%97%86%EC%9D%8C"}
                alt={recipe.title}
                style={mainImgStyle}
              />
            </div>

            {/* 오른쪽: 레시피 정보 카드 */}
            <div style={infoCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={categoryBadge}>{recipe.category}</span>
                <h1 style={titleStyle}>{recipe.title}</h1>
                <button
                  onClick={handleToggleFavorite}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    color: isFavorite ? "#ff6b6b" : "#ccc",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  <i className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                </button>
              </div>

              {/* 인분 조절 UI */}
              <div style={servingsBox}>
                <input
                  type="number"
                  value={currentServings}
                  onChange={(e) => setCurrentServings(Math.max(0.1, Number(e.target.value)))}
                  style={servingsInput}
                  step="0.5"
                />
                <span style={{ fontWeight: "bold" }}>인분 기준 (직접 조절 가능)</span>
              </div>

              {/* 맛 조절 UI */}
              <div style={flavorDisplayBox}>
                <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "bold", marginBottom: "10px" }}>내 입맛에 맞게 맛을 조절해보세요</div>
                {["spiciness", "sweetness", "saltiness"].map((key, idx) => {
                  const labels = ["매운맛", "단맛", "짠맛"];
                  const colors = ["#ff6b6b", "#ffc107", "#6366f1"];
                  return (
                    <div key={key} style={flavorRow}>
                      <span style={{ width: "50px", fontSize: "12px" }}>
                        {labels[idx]}
                        {flavor[key] === baseFlavor[key] ? "" : `${flavor[key] > baseFlavor[key] ? "+" : ""}${(flavor[key] - baseFlavor[key]) * 10}%`}
                      </span>
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

              {/* 재료 목록 */}
              <h4 style={subTitleStyle}>
                <i className="fa-solid fa-basket-shopping" /> 필요 재료
              </h4>

              <div style={ingredientScrollArea}>
                {(recipe.ingredientGroup || []).map((group, gIdx) => (
                  <div key={gIdx} style={{ marginBottom: "15px" }}>
                    <div style={ingGroupTitle}>{group.groupName || group.name}</div>
                    {group.ingredients?.map((ing, iIdx) => (
                      <div key={iIdx} style={ingRow}>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          {ing.name}
                          {ing.main && (
                            <span
                              style={{
                                fontSize: "10px",
                                backgroundColor: "#fff3cd",
                                color: "#856404",
                                padding: "1px 4px",
                                borderRadius: "3px",
                                marginLeft: "6px",
                                fontWeight: "bold",
                              }}
                            >
                              핵심
                            </span>
                          )}
                        </span>

                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {recipe.category === "BAKERY" && ing.ratio !== undefined && ing.ratio !== null && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                backgroundColor: "#f5f5f5",
                                padding: "0 6px",
                                borderRadius: "4px",
                                fontWeight: "500",
                              }}
                            >
                              {Number(ing.ratio).toFixed(1)}%
                            </span>
                          )}

                          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <input
                              type="number"
                              value={editingIng.id === `${gIdx}-${iIdx}` ? editingIng.value : currentServings === 0 ? "" : getCalculatedAmount(ing, ratio, recipe, flavor)}
                              step="0.1"
                              onChange={(e) => handleIngAmountChange(`${gIdx}-${iIdx}`, ing.baseAmount, e.target.value)}
                              style={{
                                width: "60px",
                                padding: "2px 5px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                textAlign: "right",
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#333",
                              }}
                            />
                            <span style={unitText}>{ing.unit}</span>
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                <button onClick={() => setCurrentServings(Number(recipe.baseServings))} style={{ ...navBtn, color: "#666", cursor: "pointer" }}>
                  원래 인분으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 조리 순서 섹션 */}
      <div style={{ ...containerStyle, marginTop: "40px", paddingBottom: "80px" }}>
        <h3 style={sectionTitleStyle}>
          <i className="fa-solid fa-fire-burner" /> 조리 순서
        </h3>
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
                        key={`${sIdx}-${ratio}-${flavor.spiciness}-${flavor.sweetness}-${flavor.saltiness}`}
                        style={stepText}
                        dangerouslySetInnerHTML={{
                          __html: renderInstruction(step.content, ratio, recipe, flavor),
                        }}
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

        {/* 하단 네비게이션 */}
        <div style={bottomNav}>
          <button onClick={() => navigate(-1)} style={navBtn}>
            이전으로
          </button>
          <Link to="/recipes/list" style={{ ...navBtn, backgroundColor: "#ff6b6b", color: "#fff", border: "none" }}>
            전체 레시피 보기
          </Link>
            {isAdmin && (
                <>
                    <button
                        onClick={() => navigate(`/recipes/edit/${id}`)}
                        style={{ ...navBtn, backgroundColor: "#4dabf7", color: "#fff", border: "none" }}
                    >
                        수정하기
                    </button>

                    <button
                        onClick={handleDelete}
                        style={{ ...navBtn, backgroundColor: "#df1a1a", color: "#fff", border: "none" }}
                    >
                        삭제하기
                    </button>
                </>
            )}
        </div>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
              {isMyRecipe ? (
                  // 🚩 내 레시피일 때: 버튼 대신 추천수 정보만 표시
                  <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#f1f3f5',
                      borderRadius: '20px',
                      color: '#495057',
                      fontSize: '15px',
                      fontWeight: '600'
                  }}>
                      <i className="fa-solid fa-thumbs-up" style={{ color: '#adb5bd' }}></i>
                      내 레시피가 받은 추천 <span style={{ color: '#ff6b6b', marginLeft: '4px' }}>{recommendCount}</span>개
                  </div>
              ) : (
                  // 🚩 남의 레시피일 때: 기존 추천 버튼 표시
                  <button
                      onClick={handleToggleRecommend}
                      style={{
                          padding: '12px 25px',
                          borderRadius: '30px',
                          border: '2px solid #ff6b6b',
                          backgroundColor: isRecommended ? '#ff6b6b' : '#fff',
                          color: isRecommended ? '#fff' : '#ff6b6b',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s'
                      }}
                  >
                      <i className={`fa-${isRecommended ? 'solid' : 'regular'} fa-thumbs-up`}></i>
                      <span>{isRecommended ? "추천 완료" : "레시피 추천"}</span>
                      <span style={{
                          marginLeft: '8px',
                          borderLeft: '1px solid',
                          paddingLeft: '10px',
                          opacity: 0.9
                      }}>
                {recommendCount}
              </span>
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};

// --- 수정된 스타일 정의 (변수명 누락 완벽 체크) ---
const bodyStyle = {
    backgroundColor: "#fcfcfc",
    minHeight: "100vh",
    fontFamily: "'Pretendard', -apple-system, sans-serif",
    color: "#333"
};

const containerStyle = { maxWidth: "900px", margin: "0 auto", padding: "0 20px" };

const headerStyle = {
    background: "#fff",
    padding: "40px 0",
    borderBottom: "1px solid #f1f1f1"
};

const headerFlex = {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center"
};

// 🚩 메인 이미지 크기 조절 (Max 300x300)
const imgWrapper = {
    flex: "0 0 300px",
    height: "300px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    border: "1px solid #eee"
};

const mainImgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
};

const infoCard = {
    flex: "1 1 400px",
    minWidth: "300px"
};

const titleStyle = {
    fontSize: "26px",
    fontWeight: "800",
    margin: 0,
    color: "#1a1a1a",
    letterSpacing: "-0.5px"
};

const categoryBadge = {
    background: "#6366f1",
    color: "#fff",
    padding: "5px 14px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "600"
};

const servingsBox = {
    margin: "15px 0",
    padding: "10px 15px",
    background: "#f8f9fa",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px"
};

const servingsInput = {
    width: "55px",
    padding: "4px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontWeight: "bold",
    outline: "none"
};

const flavorDisplayBox = {
    background: "#fff",
    border: "1px solid #edf2f7",
    padding: "18px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
};

const flavorRow = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" };

const currentValueBadge = {
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "8px",
    fontSize: "11px",
    minWidth: "55px",
    textAlign: "center",
    fontWeight: "600"
};

const subTitleStyle = {
    fontSize: "19px",
    fontWeight: "700",
    marginBottom: "15px",
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#444"
};

const ingredientScrollArea = {
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "10px",
    borderTop: "1px solid #f8f9fa"
};

const ingGroupTitle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#ff6b6b",
    marginTop: "15px",
    marginBottom: "10px",
    borderLeft: "4px solid #ff6b6b",
    paddingLeft: "10px"
};

const ingRow = {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f1f3f5",
    fontSize: "14px"
};

const unitText = { color: "#999", marginLeft: "4px", fontSize: "13px" };

const sectionTitleStyle = {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "40px",
    color: "#1a1a1a"
};

const stepGroupTitle = {
    fontSize: "16px",
    color: "#666",
    borderBottom: "2px solid #eee",
    paddingBottom: "8px",
    marginBottom: "20px"
};

const stepCard = {
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    marginBottom: "25px",
    border: "1px solid #f8f9fa"
};

// 🚩 누락되었던 변수들 추가
const stepContentFlex = { display: "flex", gap: "20px", flexWrap: "wrap" };
const stepInfo = { flex: "1 1 400px" };
const stepText = { fontSize: "16px", lineHeight: "1.7", color: "#333", margin: 0 };
const stepImgWrapper = { flex: "0 0 200px" };
const stepImg = {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const stepNumberBadge = {
    flexShrink: 0,
    width: "32px",
    height: "32px",
    backgroundColor: "#ff6b6b",
    color: "#fff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "16px",
};

const bottomNav = {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "50px",
    borderTop: "1px solid #eee",
    paddingTop: "30px"
};

const navBtn = {
    padding: "14px 28px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
    textDecoration: "none",
    color: "#333"
};
export default Recipesid;
