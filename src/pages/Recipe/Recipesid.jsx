import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deleteRecipe, getRecipeDetail } from '../../api/recipeApi'; // API 함수 임포트
import { toBackendUrl } from '../../utils/backendUrl';

const Recipesid = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentServings, setCurrentServings] = useState(1);
  const [flavor, setFlavor] = useState({ spiciness: 3, sweetness: 3, saltiness: 3 });
  const [baseFlavor, setBaseFlavor] = useState({ spiciness: 3, sweetness: 3, saltiness: 3 });
  const [editingIng, setEditingIng] = useState({ id: null, value: ""});

  // 서버로부터 데이터 로드
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await getRecipeDetail(id);
        const data = response.data;

        console.log("서버 원본 데이터:", data);
        
        setRecipe(data);
        // 서버의 기본 인분 수 설정 (기본값 1)
        setCurrentServings(Number(data.baseServings) || 1);

        const initialFlavor = {
          spiciness: data.spiciness ?? 3,
          sweetness: data.sweetness ?? 3,
          saltiness: data.saltiness ?? 3
        };

        console.log("파싱된 초기 맛:", initialFlavor);
        
        // 맛 설정 (서버 데이터 우선, 없으면 3)
        setFlavor(initialFlavor);
        setBaseFlavor(initialFlavor)
      } catch (error) {
        console.error("레시피 로드 중 에러 발생:", error);
        alert("레시피 데이터를 불러올 수 없습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id, navigate]);

  // [계산 로직] 인분 변경에 따른 배율 계산
  const ratio = useMemo(() => {
    if (!recipe || !recipe.baseServings) return 1;
    const base = Number(recipe.baseServings);
    return base > 0 ? currentServings / base : 1;
  }, [currentServings, recipe]);

  const getFlavorWeight = (key, currentVal) => {
    if (!baseFlavor || baseFlavor[key] === undefined) return 1;
    const baseVal = baseFlavor[key];
    return 1+ (currentVal - baseVal) * 0.1;
  };

  const getCalculatedAmount = (ing) =>{
    let amount = Number(ing.baseAmount);

    let adjustedRatio = ratio;

    if (recipe.category === 'KOREAN' || recipe.category === '한식') {
      if(!ing.main) {
        if (ratio > 1) {
          adjustedRatio = 1 + (ratio - 1) * 0.5;
        } else if (ratio < 1) {
          adjustedRatio = ratio;
        }
      }
    }
    amount = amount * adjustedRatio;

    if (ing.tasteType === 'SPICY') amount *= getFlavorWeight('spiciness', flavor.spiciness);
    if (ing.tasteType === 'SWEET') amount *= getFlavorWeight('sweetness', flavor.sweetness);
    if (ing.tasteType === 'SALTY') amount *= getFlavorWeight('saltiness', flavor.saltiness);
    if (isNaN(amount)) return "0";

    return amount.toFixed(1).replace(/\.0$/,'');
  };

  const handleIngAmountChange = (ingId, ingBaseAmount, inputValue) => {

    setEditingIng({ id: ingId, value: inputValue});
    if (inputValue === "" || isNaN(parseFloat(inputValue))) {
      setCurrentServings(0);
      return;
    }

    const newAmount = parseFloat(inputValue);
    const baseServings = Number(recipe.baseServings) || 1;
    const nextServings = (newAmount / Number(ingBaseAmount)) * baseServings;

    setCurrentServings(Math.round(nextServings * 10) / 10);
  };

  // [치환 로직] @재료명 -> 실시간 수치 포함 텍스트로 변경
  const renderInstruction = (content) => {
    if (!content || !recipe) return content;
    const regex = /@([가-힣a-zA-Z0-9\s]+?)(?=\s|$|[.,!])/g;

    return content.replace(regex, (match, ingName) => {
      const trimmedName = ingName.trim();
      let foundIng = null;

      const groups = recipe.ingredientGroups || recipe.ingredientGroup;
      groups?.forEach(group => {
        const ing = group.ingredients?.find(i => i.name.trim() === trimmedName);
        if (ing) foundIng = ing;
      });

      if (foundIng) {
        const calcAmount = getCalculatedAmount(foundIng);
        return `<strong style="color: #ff6b6b; font-weight: bold;">${trimmedName} ${calcAmount}${foundIng.unit}</strong>`;
      }
      return match;
    });
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) {
      try {
        await deleteRecipe(id);
        alert("삭제되었습니다");
        navigate("/recipes/list");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다");
      }
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
  if (!recipe) return <div style={{ padding: '100px', textAlign: 'center' }}>레시피 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={bodyStyle}>
      {/* 폰트 및 아이콘 로드 */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={headerFlex}>
            {/* 왼쪽: 메인 이미지 */}
            <div style={imgWrapper}>
              <img 
                src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : 'https://via.placeholder.com/600x400?text=No+Image'} 
                alt={recipe.title} 
                style={mainImgStyle}
              />
            </div>

            {/* 오른쪽: 정보 카드 */}
            <div style={infoCard}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                <span style={categoryBadge}>{recipe.category}</span>
                <h1 style={titleStyle}>{recipe.title}</h1>
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
                <span style={{fontWeight:'bold'}}>인분 기준 (조절 가능)</span>
              </div>

              {/* 맛 조절 UI */}
              <div style={flavorDisplayBox}>
                <div style={{fontSize:'12px', color:'#6366f1', fontWeight:'bold', marginBottom:'10px'}}>
                  😋 내 입맛에 맞게 조절해보기
                </div>
                {['spiciness', 'sweetness', 'saltiness'].map((key, idx) => {
                  const labels = ['매운맛', '단맛', '짠맛'];
                  const colors = ['#ff6b6b', '#ffc107', '#6366f1'];
                  return (
                    <div key={key} style={flavorRow}>
                      <span style={{width:'50px', fontSize:'12px'}}>{labels[idx]}
                        {flavor[key] === baseFlavor[key]
                          ? ''
                          : `${flavor[key] > baseFlavor[key] ? '+' : ''}${(flavor[key] - baseFlavor[key]) * 10}%`}
                      </span>
                      <input 
                        type="range" min="0" max="5" 
                        value={flavor[key]} 
                        onChange={(e) => setFlavor({...flavor, [key]: parseInt(e.target.value)})}
                        style={{flex:1, accentColor: colors[idx]}}
                      />
                      <span style={{...currentValueBadge, backgroundColor: colors[idx]}}>
                        현재: {flavor[key]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 재료 목록 */}
              <h4 style={subTitleStyle}>
                <i className="fa-solid fa-basket-shopping"></i> 필요한 재료
              </h4>

              <div style={ingredientScrollArea}>
                {(recipe.ingredientGroups || recipe.ingredientGroup)?.map((group, gIdx) => (
                  <div key={gIdx} style={{ marginBottom: '15px' }}>
                    <div style={ingGroupTitle}>{group.groupName || group.name}</div>
                    {group.ingredients?.map((ing, iIdx) => (
                      <div key={iIdx} style={ingRow}>
                        
                        {/* 재료명 영역: 이름 + 메인(Key) 배지 */}
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {ing.name}
                          {/* 메인 재료인 경우 작은 배지 노출 */}
                          {ing.main && (
                            <span style={{ 
                              fontSize: '10px', backgroundColor: '#fff3cd', color: '#856404',
                              padding: '1px 4px', borderRadius: '3px', marginLeft: '6px', fontWeight: 'bold' 
                            }}>Key</span>
                          )}
                        </span>

                        {/* 수량 및 비율 영역 */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* 1. 제빵(BAKERY) 카테고리이면서 비율 데이터가 있을 때만 노출 */}
                          {recipe.category === 'BAKERY' && ing.ratio != undefined && ing.ratio != null && (
                            <span style={{ 
                              fontSize: '11px', color: '#888', backgroundColor: '#f5f5f5', 
                              padding: '0 6px', borderRadius: '4px', fontWeight: '500' 
                            }}>
                              {Number(ing.ratio).toFixed(1)}%
                            </span>
                          )}
                          
                          {/* 2. 계산된 수량 표시 */}
                            <span style={{display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <input
                                type="number"
                                value={
                                  editingIng.id === `${gIdx}-${iIdx}`
                                  ? editingIng.value
                                  : (currentServings === 0 
                                    ? "" 
                                    : getCalculatedAmount(ing)
                                        )}
                                step="0.1"
                                onChange={(e) => handleIngAmountChange(
                                  `${gIdx}-${iIdx}`, ing.baseAmount, e.target.value)}
                                style={{
                                  width: '60px',
                                  padding: '2px 5px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  textAlign: 'right',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: '#333'
                                }}
                                />
                              <span style={unitText}>{ing.unit}</span>
                            </span>
                           
                          </span>
                      </div>
                    ))}
                  </div>
                ))}
                 <button
                  onClick = {() => setCurrentServings(Number(recipe.baseServings))}
                  style={{...navBtn, color: '#666'}}>원래 수량으로</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 조리 순서 섹션 */}
      <div style={{...containerStyle, marginTop:'40px', paddingBottom:'80px'}}>
        <h3 style={sectionTitleStyle}><i className="fa-solid fa-fire-burner"></i> 조리 순서</h3>
        <div style={{maxWidth: '850px', margin: '0 auto'}}>
          {(recipe.instructionGroup || recipe.instructionGroup)?.map((group, gIdx) => (
            <div key={gIdx} style={{marginBottom: '40px'}}>
              <h5 style={stepGroupTitle}>{group.groupTitle || group.title}</h5>
              {group.instructions?.map((step, sIdx) => (
                <div key={sIdx} style={stepCard}>
                  <div style={stepContentFlex}>
                    <div style={stepNumberBadge}>{sIdx + 1}</div>
                    <div style={stepInfo}>
                      <p 
                        style={stepText}
                        dangerouslySetInnerHTML={{ __html: renderInstruction(step.content) }}
                      />
                    </div>
                    {step.stepImg && (
                      <div style={stepImgWrapper}>
                        <img 
                          src={toBackendUrl(`/images/recipe/${step.stepImg}`)} 
                          alt={`Step ${sIdx+1}`} 
                          style={stepImg} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 하단 네비게이션 */}
        <div style={bottomNav}>
          <button onClick={() => navigate(-1)} style={navBtn}>이전으로</button>
          <Link to="/recipe/list" style={{...navBtn, backgroundColor:'#ff6b6b', color:'#fff', border:'none'}}>전체 레시피 보기</Link>
          <button
            onClick={() => navigate(`/recipes/edit/${id}`)}
            style={{...navBtn, backgroundColor:'#4dabf7', color:'#fff', border:'none'}}
            >수정하기</button>

           <button
            onClick={handleDelete}
            style={{...navBtn, backgroundColor:'#df1a1a', color:'#fff', border:'none'}}
            >삭제하기</button>  
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 (기존 스타일 유지 및 보완) ---
const bodyStyle = { backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Pretendard', sans-serif" };
const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' };
const headerStyle = { background: '#fff', padding: '50px 0', borderBottom: '1px solid #eee' };
const headerFlex = { display: 'flex', gap: '40px', flexWrap: 'wrap' };
const imgWrapper = { flex: '1 1 400px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' };
const mainImgStyle = { width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' };
const infoCard = { flex: '1.2 1 450px' };
const titleStyle = { fontSize: '28px', fontWeight: 'bold', margin: 0 };
const categoryBadge = { background: '#6366f1', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' };
const servingsBox = { margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' };
const servingsInput = { width: '60px', padding: '5px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' };
const flavorDisplayBox = { background: '#fcfcfc', border: '1px solid #f1f3f5', padding: '15px', borderRadius: '12px', marginBottom: '20px' };
const flavorRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' };
const currentValueBadge = { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', minWidth: '55px', textAlign: 'center' };
const subTitleStyle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' };
const ingredientScrollArea = { maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' };
const ingGroupTitle = { fontSize: '14px', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '8px', borderLeft: '3px solid #ff6b6b', paddingLeft: '8px' };
const ingRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8f9fa', fontSize: '14px' };
const unitText = { color: '#888', marginLeft: '3px', fontSize: '13px' };
const sectionTitleStyle = { textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '30px' };
const stepGroupTitle = { fontSize: '16px', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '20px' };
const stepCard = { background: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', marginBottom: '20px' };
const stepContentFlex = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const stepNumberBadge = { flexShrink: 0, width: '30px', height: '30px', backgroundColor: '#ff6b6b', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', marginTop: '2px' };
const stepInfo = { flex: '1 1 400px' };
const stepText = { fontSize: '16px', lineHeight: '1.7', color: '#333', margin: 0 };
const stepImgWrapper = { flex: '0 0 200px' };
const stepImg = { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' };
const bottomNav = { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' };
const navBtn = { padding: '12px 25px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', color: '#333' };

export default Recipesid;
