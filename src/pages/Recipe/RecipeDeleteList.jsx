import { useEffect, useState } from "react";
import { deletelist, deletereturn } from "../../api/recipeApi";
import { toBackendUrl } from "../../utils/backendUrl";

const RecipeDeleteList = () => {
  const [recipes, setRecipes] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await deletelist(category);
        const data = response.data.content || response.data;
        setRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("삭제 레시피 목록 로드 실패:", error);
        setRecipes([]);
      }
    };

    loadData();
  }, [category]);

  const handleRestore = async (id) => {
    if (!window.confirm("이 레시피를 복원하시겠습니까?")) return;

    try {
      await deletereturn(id);
      alert("복원했습니다.");
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert(`복원 실패: ${error.response?.data || "오류가 발생했습니다."}`);
    }
  };

  return (
    <div className="container">
      <h2>삭제된 레시피</h2>

      <div className="category-nav">
        <ul style={{ display: "flex", listStyle: "none", gap: "10px" }}>
          {["", "KOREAN", "BAKERY", "DESSERT", "ETC"].map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: category === cat ? "#4CAF50" : "#f0f0f0",
                  color: category === cat ? "#fff" : "#000",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {cat === ""
                  ? "전체"
                  : cat === "KOREAN"
                    ? "한식"
                    : cat === "BAKERY"
                      ? "베이커리"
                      : cat === "DESSERT"
                        ? "디저트"
                        : "기타"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="recipe-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}
      >
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
              <img
                src={recipe.recipeImg ? toBackendUrl(`/images/recipe/${recipe.recipeImg}`) : "/images/recipe/default.jpg"}
                alt={recipe.title}
                style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
              />
              <h4 style={{ margin: "10px 0" }}>{recipe.title}</h4>

              <button
                onClick={() => handleRestore(recipe.id)}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                복원하기
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", gridColumn: "1/4", padding: "50px" }}>삭제된 레시피가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default RecipeDeleteList;
