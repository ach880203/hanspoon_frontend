import axiosInstance from "./axios"

const api = axiosInstance.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})
//1. 목록 조회 (페이징/검색/카테고리 포함)
export const getRecipeList = ({ keyword = "", category = "", page = 0, size } = {}) => {
  return api.get("/api/recipe/list", {   
    params: {
      keyword,
      category,
      page,
      ...(size ? { size } : {}),
    },
  });
};

//2. 상세 조회
export const getRecipeDetail = (id) => {
    return api.get(`/api/recipe/detail/${id}`);
};

//3. 등록
export const createRecipe = (recipeData) => {
    return api.post(`/api/recipe/new`, recipeData);
};

//4. 수정
export const updateRecipe = (id, recipeData) => {
    return api.post(`/api/recipe/edit/${id}`, recipeData);
};

//5. 삭제
export const deleteRecipe = (id) => {
    return api.post(`/api/recipe/delete/${id}`);
};

//6. 삭제리스트
export const deletelist = (category) => {
    return api.get(`/api/recipe/deleted`, {
        params: {category: category}
    });
};

//7. 복원
export const deletereturn = (id) => {
    return api.post(`/api/recipe/deleteReturn/${id}`)
}
 
