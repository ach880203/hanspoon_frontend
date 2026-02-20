import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { deletelist, deletereturn } from "../../api/recipeApi";// API 함수 가져오기

const RecipeDeleteList = () => {
    const [recipes, setRecipes] = useState([]);
    console.log("현재 recipes 상태 : ", recipes)

    const [category, setCategory] = useState('');
    const navigate = useNavigate(); // 괄호 추가 필수!

    // 삭제된 레시피 목록 로드 (mount 시 실행)

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log("------- API 호출 실행--------");
                const response = await deletelist(category);
                console.log("서버에서 준 진짜 데이터 : ", response.data);

                const data = response.data.content || response.data;

                setRecipes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("목록 로드 실패: ", error)
                setRecipes([]);
            }
        };
        loadData();
    }, [category]);

    const handleCategoryChange = (cat) => {
        setCategory(cat);
    };

    const handleRestore = async (id) => {
        if (!window.confirm("이 레시피를 복원하시겠습니까?")) return;
        
        try {
            await deletereturn(id);
            alert("복원되었습니다.");
            // 복원 성공 후, 현재 리스트에서 해당 레시피 제거 (화면 갱신)
            setRecipes(recipes.filter(r => r.id !== id));
        } catch (error) {
            alert("복원 실패: " + error.response?.data || "오류 발생");
        }
    };

    return (
        <div className="container">
            <h2> 삭제된 레시피 (휴지통) </h2>
            
            {/* 카테고리 탭 */}
            <div className="category-nav">
                <ul style={{ display: 'flex', listStyle: 'none', gap: '10px' }}>
                    {['', 'KOREAN', 'BAKERY', 'DESSERT', 'ETC'].map((cat) => (
                        <li key={cat}>
                            <button 
                                onClick={() => handleCategoryChange(cat)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    backgroundColor: category === cat ? '#4CAF50' : '#f0f0f0',
                                    color: category === cat ? '#fff' : '#000',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {cat === '' ? '전체' : cat === 'KOREAN' ? '한식' : cat === 'BAKERY' ? '제빵' : cat === 'DESSERT' ? '제과' :'기타'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 레시피 리스트 */}
            <div className="recipe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                {recipes.length > 0 ? (
                    recipes?.map((recipe) => (
                        <div key={recipe.id} className="recipe-card" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                            <img
                                src={recipe.recipeImg ? `http://localhost:8080/images/recipe/${recipe.recipeImg}` : '/images/recipe/default.jpg'}
                                alt={recipe.title}
                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                            /> 
                            <h4 style={{ margin: '10px 0' }}>{recipe.title}</h4>
                            
                            {/* 복원 버튼이 각 카드 안에 있어야 함 */}
                            <button
                                onClick={() => handleRestore(recipe.id)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                복원하기
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', gridColumn: '1/4', padding: '50px' }}>
                        삭제된 레시피가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDeleteList;