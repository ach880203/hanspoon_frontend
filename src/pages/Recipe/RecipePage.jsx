import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { toBackendUrl } from '../../utils/backendUrl';

const RecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const api = axiosInstance

  // 파일 입력 제어용 Ref
  const mainFileRef = useRef(null);
  const stepFileRefs = useRef({});
  const nextIdRef = useRef(1006);

  const nextId = () => {
    const value = nextIdRef.current;
    nextIdRef.current += 1;
    return value;
  };

  const [recipe, setRecipe] = useState(() =>({
    id: Date.now(),
    title: '',
    spiciness: 3,
    sweetness: 3,
    saltiness: 3,
    category: '',
    baseServings: '1',
    recipeMainImg: null,
    recipeMainImgName: '', // 파일명 표시용
    recipeMainImgFile: null,
    ingredientGroup: [
      { id: 1, 
        name: '', 
        sortOrder: 1,
        ingredients: [
          { id: Date.now() + 1, 
            name: '', 
            baseAmount: '', 
            unit: '', 
            taste: 'NONE' }
          ] 
        }],
    instructionGroup: [
      { id: 1 + 2, 
        title: '', 
        sortOrder: 1,
        instructions: [
          { id: 1 + 3, 
            content: '', 
            stepImg: '', 
            stepOrder: 1,
            stepImgName: '',
            stepImgFile: ''}
          ] 
        }],
    subRecipes: []
  }));

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/api/recipe/edit/${id}`);
        const data = response.data.data;

        setRecipe({
          ...data,
          recipeMainImg: data.recipeMainImg ? toBackendUrl(`/images/recipe/${data.recipeMainImg}`) : null,
          recipeMainImgName: data.recipeMainImg || '기존 이미지',
          recipeMainImgFile: null
        });
      } catch (error) {
        console.error("레시피 로드 실패:", error);
        alert("데이터를 불러오지 못했습니다.");
      }
    }
    if (isEditMode && id) {
      fetchRecipe();
    }
  }, [id, isEditMode, api]);

  const handleImageChange = (e, type, gIdx, sIdx) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'main') {
          setRecipe({
             ...recipe, 
             recipeMainImg: reader.result, 
             recipeMainImgName: file.name,
             recipeMainImgFile: file
            });
        } else if (type === 'step') {
          const newGroups = [...recipe.instructionGroup];
          newGroups[gIdx].instructions[sIdx].stepImg = reader.result;
          newGroups[gIdx].instructions[sIdx].stepImgName = file.name;
          newGroups[gIdx].instructions[sIdx].stepImgFile = file;
          setRecipe({ ...recipe, instructionGroup: newGroups });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log("체크1 - 파일객체:", recipe.recipeMainImgFile);
    if (!recipe.title) {
      alert("레시피 제목을 입력해 주세요.");
      return;
    }
    
    try {
      const formData = new FormData();
      const pureRecipeData = { ...recipe };
      delete pureRecipeData.recipeMainImg;
      delete pureRecipeData.recipeMainImgFile;

      formData.append("recipe", new Blob([JSON.stringify(pureRecipeData)], {type: "application/json"}));

      if (recipe.recipeMainImgFile) {
        formData.append("recipeImage", recipe.recipeMainImgFile);
        console.log("파일 첨부:", recipe.recipeMainImgFile.name);
      } else {
        console.log("첨부할 파일이 없습니다.");
      }
      recipe.instructionGroup.forEach((group) => {
        group.instructions.forEach((step) => {
          if (step.stepImgFile instanceof File) {
            formData.append("instructionImages", step.stepImgFile);
            console.log("단계 파일 전송:", step.stepImgFile.name);
          }
          else {
      // 기존 단계 이미지는 파일 전송 없이 이름만 유지합니다.
           console.log("기존 파일 유지:", step.stepImgName);
          }
        });
      });

      const url = isEditMode ? `/api/recipe/edit/${recipe.id}` : `/api/recipe/new`;
      const response = await api.post(url, formData,{
        headers:{ "Content-Type" : "multipart/form-data"}
      });

      if ( response.status === 200 || response.status === 201) {
        alert(isEditMode ? "레시피를 수정했습니다." : "레시피가 저장되었습니다.");
        navigate("/recipes/list");
      }
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("서버 저장에 실패했습니다.");
    }
  };

  const removeElement = (type, gIdx, rIdx = null) => {
    const newRecipe = { ...recipe };
    const groupKey = type === 'ingredientGroups' || type === 'ingredientGroup' ? 'ingredientGroup' : 'instructionGroup';
    if (rIdx === null) {
      if (newRecipe[groupKey].length > 1) {
        newRecipe[groupKey].splice(gIdx, 1);
      } else {
        alert("최소 1개의 그룹은 있어야 합니다.");
        return;
      }
    } else {
      const targetList = groupKey === 'ingredientGroup' ? 'ingredients' : 'instructions';
      if (newRecipe[groupKey][gIdx][targetList].length > 1) {
        newRecipe[groupKey][gIdx][targetList].splice(rIdx, 1);
      } else {
        alert("최소 1개의 항목은 있어야 합니다.");
        return;
      }
    }
    setRecipe(newRecipe);
  };

  const addIngredientGroup = () => {
    setRecipe({
      ...recipe,
      ingredientGroup: [...recipe.ingredientGroup, 
        { id: nextId(), 
          name: '',
          sortOrder: 1, 
          ingredients: [
            { id: nextId()+1, 
              name: '', 
              baseAmount: '', 
              unit: '', 
              taste: 'NONE' }
            ] 
          }]
    });
  };

  const addIngredientRow = (gIdx) => {
    const newGroups = [...recipe.ingredientGroup];
    newGroups[gIdx].ingredients.push(
      { id: Date.now(), 
        name: '', 
        baseAmount: '', 
        unit: '', 
        taste: 'NONE' }
      );
    setRecipe({ ...recipe, ingredientGroup: newGroups });
  };

  const addInstructionGroup = () => {
    setRecipe({
      ...recipe,
      instructionGroup: [...recipe.instructionGroup, 
        { id: nextId(), 
          title: '', 
          sortOrder: recipe.instructionGroup.length,
          instructions: [
            { id: nextId()+1, 
              content: '', 
              stepImg: '', 
              stepOrder: 1,
              stepImgName: '' }] }]
    });
  };

  const addInstructionStep = (gIdx) => {
    const newGroups = [...recipe.instructionGroup];

    const nextOrder = newGroups[gIdx].instructions.length;

    newGroups[gIdx].instructions.push(
      { id: nextId(), 
        content: '', 
        stepImg: '', 
        stepOrder: nextOrder,
        stepImgName: '' }
      );
    setRecipe({ ...recipe, instructionGroup: newGroups });
  };

  // 페이지 스타일
  const css = `
    .recipe-body { background-color: #f8f9fa; padding: 50px 0; font-family: 'Pretendard', sans-serif; }
    .recipe-container { max-width: 950px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; }
    .logo span { color: #ff6b6b; }
    .save-btn { background: #ff6b6b; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; }

    .section-card { border: 1px solid #f1f3f5; border-radius: 12px; padding: 25px; margin-bottom: 30px; position: relative; }
    .section-title { font-size: 15px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; }
    .section-title i { color: #ffc107; margin-right: 8px; }

    .info-flex { display: flex; gap: 40px; }
    .info-left, .info-right { flex: 1; }
    .info-right { border-left: 1px solid #f1f3f5; padding-left: 40px; }
    
    .input-label { font-size: 12px; color: #666; margin-bottom: 8px; display: block; }
    .custom-input { width: 100%; border: 1px solid #dee2e6; border-radius: 4px; padding: 8px 12px; font-size: 13px; margin-bottom: 15px; background: #fff; }

    .file-select-box { display: flex; align-items: center; width: 100%; border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden; height: 35px; margin-bottom: 15px; cursor: pointer; }
    .file-btn { background: #f8f9fa; border-right: 1px solid #dee2e6; padding: 0 12px; height: 100%; display: flex; align-items: center; font-size: 12px; color: #333; white-space: nowrap; }
    .file-name { padding: 0 12px; font-size: 12px; color: #adb5bd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .flavor-row { display: flex; align-items: center; margin-bottom: 12px; font-size: 12px; }
    .flavor-row span { width: 50px; }
    .flavor-range { flex: 1; height: 4px; cursor: pointer; accent-color: #6366f1; }

    .group-box { border: 1px solid #f1f3f5; border-radius: 8px; padding: 20px; margin-bottom: 15px; position: relative; }
    .ing-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .ing-name { flex: 3; } .ing-amt { flex: 1; } .ing-unit { flex: 1; } .ing-taste { flex: 2; }
    
    .step-box { border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; gap: 15px; position: relative; background: #fff; }
    .step-text { flex: 1.5; }
    .step-img-area { flex: 1; border-left: 1px solid #eee; padding-left: 15px; }
    .preview-box { width: 100%; height: 120px; border-radius: 4px; object-fit: cover; margin-top: 8px; border: 1px solid #eee; background: #f8f9fa; }
    .preview-placeholder { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #adb5bd; background: #f8f9fa; border-radius: 4px; margin-top: 8px; }

    .add-circle { width: 30px; height: 30px; border: 1px solid #dee2e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 10px auto; cursor: pointer; color: #ccc; transition: 0.2s; }
    .add-circle:hover { background: #f8f9fa; color: #ff6b6b; }
    .add-group-btn, .add-step-btn { position: absolute; top: 20px; right: 25px; border: 1px solid #28a745; color: #28a745; background: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    .add-step-btn { border-color: #ff6b6b; color: #ff6b6b; }

    .remove-icon-btn { color: #ff6b6b; cursor: pointer; opacity: 0.6; transition: 0.2s; }
    .remove-icon-btn:hover { opacity: 1; }
    .group-remove-pos { position: absolute; top: 25px; right: 15px; font-size: 18px; }
  `;

  return (
    <div className="recipe-body">
      <style>{css}</style>
      
      <div className="recipe-container">
        <div className="header-area">
          <div className="logo"><span>한</span>스푼 레시피</div>
          <button className="save-btn" onClick={handleSave}>{isEditMode ? "레시피 수정하기" : "레시피 저장하기"}</button>
        </div>

        {/* 1. 기본 정보 */}
        <div className="section-card">
          <div className="section-title"><i className="fa-solid fa-circle-info"></i> 기본 정보 & 맛 조절</div>
          <div className="info-flex">
            <div className="info-left">
              <label className="input-label">레시피 대표 사진</label>
              <div className="file-select-box" onClick={() => mainFileRef.current.click()}>
                <div className="file-btn">파일 선택</div>
                <div className="file-name">{recipe.recipeMainImgName || "선택한 파일 없음"}</div>
              </div>
              <input type="file" ref={mainFileRef} style={{display:'none'}} onChange={(e) => handleImageChange(e, 'main')} />
              
              {recipe.recipeMainImg && <img src={recipe.recipeMainImg} className="preview-box" alt="Main Preview" />}
              
              <label className="input-label" style={{marginTop: '15px'}}>레시피 제목</label>
              <input type="text" className="custom-input" value={recipe.title} onChange={(e) => setRecipe({...recipe, title: e.target.value})} placeholder="레시피 제목" />
              
              <label className="input-label">카테고리</label>
              <select className="custom-input" value={recipe.category} onChange={(e) => setRecipe({...recipe, category: e.target.value})}>
                <option value="">--카테고리 선택--</option>
                <option value="KOREAN">한식</option>
                <option value="DESSERT">디저트</option>
                <option value="BAKERY">베이커리</option>
                <option value="ETC">기타</option>
              </select>
              
              <label className="input-label">기본 인분</label>
              <input type="number" className="custom-input" style={{width: '150px'}} value={recipe.baseServings} onChange={(e) => setRecipe({...recipe, baseServings: e.target.value})} />
            </div>
            <div className="info-right">
              <span className="input-label">전체 맛 조절 (0~5)</span>
              {['spiciness', 'sweetness', 'saltiness'].map((f, i) => (
                <div className="flavor-row" key={f}>
                  <span>{['매운맛', '단맛', '짠맛'][i]}</span>
                  <input type="range" className="flavor-range" min="0" max="5" value={recipe[f]} onChange={(e) => setRecipe({...recipe, [f]: parseInt(e.target.value)})} />
                  <b style={{marginLeft:'10px', color:'#6366f1'}}>{recipe[f]}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 재료 정보 */}
        <div className="section-card">
          <div className="section-title"><i className="fa-solid fa-basket-shopping" style={{color:'#28a745'}}></i> 재료 정보</div>
          <button className="add-group-btn" onClick={addIngredientGroup}>그룹 추가</button>
          {recipe.ingredientGroup.map((group, gIdx) => (
            <div className="group-box" key={`group-${gIdx}-${group.id || 'new'}`}
                style={{ mrginbottom: '20px'}}>
              <i className="fa-solid fa-trash-can remove-icon-btn group-remove-pos" onClick={() => removeElement('ingredientGroups', gIdx)}></i>
              <input type="text" className="custom-input" style={{width: '300px', fontWeight: 'bold'}} placeholder="그룹명(예: 메인 재료)" value={group.name} onChange={(e) => {
                const newGroups = [...recipe.ingredientGroup];
                newGroups[gIdx].name = e.target.value;
                setRecipe({...recipe, ingredientGroup: newGroups});
              }} />
              {group.ingredients.map((ing, rIdx) => (
                <div className="ing-row" key={`ing-${gIdx}-${rIdx}-${ing.id || 'temp'}`}>
                  <input type="text" className="custom-input ing-name" placeholder="재료명" value={ing.name} onChange={(e) => {
                    const newGroups = [...recipe.ingredientGroup];
                    newGroups[gIdx].ingredients[rIdx].name = e.target.value;
                    setRecipe({...recipe, ingredientGroup: newGroups});
                  }} />
                  <input type="number" className="custom-input ing-amt" placeholder="양" value={ing.baseAmount} onChange={(e) => {
                    const newGroups = [...recipe.ingredientGroup];
                    newGroups[gIdx].ingredients[rIdx].baseAmount = e.target.value;
                    setRecipe({...recipe, ingredientGroup: newGroups});
                  }} />
                  <input type="text" className="custom-input ing-unit" placeholder="단위" value={ing.unit} onChange={(e) => {
                    const newGroups = [...recipe.ingredientGroup];
                    newGroups[gIdx].ingredients[rIdx].unit = e.target.value;
                    setRecipe({...recipe, ingredientGroup: newGroups});
                  }} />
                  <select className="custom-input ing-taste" value={ing.taste} onChange={(e) => {
                    const newGroups = [...recipe.ingredientGroup];
                    newGroups[gIdx].ingredients[rIdx].taste = e.target.value;
                    setRecipe({...recipe, ingredientGroup: newGroups});
                  }}>
                    <option value="NONE">맛 영향 없음</option>
                    <option value="SWEET">단맛</option>
                    <option value="SALT">짠맛</option>
                    <option value="SPICY">매운맛</option>
                  </select>
                  <div className='ing-main-check'>
                    <input
                      type="checkbox"
                      checked={ing.main || false}
                      onChange={(e) => {
                        const newGroups = [...recipe.ingredientGroup];
                        newGroups[gIdx].ingredients[rIdx].main = e.target.checked;
                        setRecipe({...recipe, ingredientGroup: newGroups});
                      }}/>
                      <label>메인</label>
                  </div>
                  
                  <i className="fa-solid fa-xmark remove-icon-btn" onClick={() => removeElement('ingredientGroup', gIdx, rIdx)}></i>
                </div>
              ))}
              <div className="add-circle" onClick={() => addIngredientRow(gIdx)}><i className="fa-solid fa-plus"></i></div>
            </div>
          ))}
        </div>

        {/* 3. 조리 순서 */}
        <div className="section-card">
          <div className="section-title"><i className="fa-solid fa-fire-burner" style={{color:'#ff6b6b'}}></i> 조리 순서</div>
          <button className="add-step-btn" onClick={addInstructionGroup}>단계 그룹 추가</button>
          {recipe.instructionGroup.map((group, gIdx) => (
            <div className="group-box" key={`inst-group-${gIdx}`} style={{paddingBottom: '40px'}}>
              <i className="fa-solid fa-trash-can remove-icon-btn group-remove-pos" onClick={() => removeElement('instructionGroup', gIdx)}></i>
              <input type="text" className="custom-input" style={{width: '300px', fontWeight: 'bold'}} placeholder="순서 제목 (예: 고기 밑간하기)" value={group.title} onChange={(e) => {
                const newGroups = [...recipe.instructionGroup];
                newGroups[gIdx].title = e.target.value;
                setRecipe({...recipe, instructionGroup: newGroups});
              }} />
              {group.instructions.map((step, sIdx) => (
                <div className="step-box" key={step.id}>
                  <div className="step-text">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                      <div style={{fontSize:'11px', fontWeight:'bold', background:'#0f0e0e', color:'#fff', display:'inline-block', padding:'2px 10px', borderRadius:'4px'}}>조리 단계 {sIdx + 1}</div>
                      <i className="fa-solid fa-xmark remove-icon-btn" onClick={() => removeElement('instructionGroup', gIdx, sIdx)}></i>
                    </div>
                    <textarea className="custom-input" style={{height: '110px', resize:'none'}} value={step.content} onChange={(e) => {
                      const newGroups = [...recipe.instructionGroup];
                      newGroups[gIdx].instructions[sIdx].content = e.target.value;
                      setRecipe({...recipe, instructionGroup: newGroups});
                    }} placeholder="@재료명을 입력하세요"></textarea>
                  </div>
                  <div className="step-img-area">
                    <label className="input-label">과정 사진</label>
                    <div className="file-select-box" onClick={() => stepFileRefs.current[`${gIdx}-${sIdx}`].click()}>
                      <div className="file-btn">파일 선택</div>
                      <div className="file-name">{step.stepImgName || "선택한 파일 없음"}</div>
                    </div>
                    <input type="file" ref={el => stepFileRefs.current[`${gIdx}-${sIdx}`] = el} style={{display:'none'}} onChange={(e) => handleImageChange(e, 'step', gIdx, sIdx)} />
                    
                    {step.stepImg ? (
                      <img src={step.stepImg} className="preview-box" alt="Step Preview" />
                    ) : (
                      <div className="preview-placeholder">미리보기</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-circle" onClick={() => addInstructionStep(gIdx)}><i className="fa-solid fa-plus"></i></div>
            </div>
          ))}
        </div>

        {/* 4. 서브 레시피 */}
        <div className="section-card">
          <div className="section-title">같이 필요한 서브 레시피</div>
          <select multiple className="custom-input" style={{height: '120px', borderRadius:'8px'}} value={recipe.subRecipes} onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setRecipe({...recipe, subRecipes: values});
          }}>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;

