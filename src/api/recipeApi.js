import axiosInstance from "./axios";

// 공통 axios 인스턴스를 그대로 사용합니다.
// 이렇게 하면 인증 토큰/에러 처리/환경변수(baseURL) 정책이 전체 API에서 일관됩니다.
const api = axiosInstance;

// 1) 레시피 목록 조회 (검색어/카테고리/페이지 포함)
export const getRecipeList = (params) => {
  return api.get("/api/recipe/list", { params });
};

// 2) 레시피 상세 조회
export const getRecipeDetail = (id) => {
  return api.get(`/api/recipe/detail/${id}`);
};

// 3) 레시피 등록
export const createRecipe = (recipeData) => {
  return api.post("/api/recipe/new", recipeData);
};

// 4) 레시피 수정
export const updateRecipe = (id, recipeData) => {
  return api.post(`/api/recipe/edit/${id}`, recipeData);
};

// 5) 레시피 삭제
export const deleteRecipe = (id) => {
  return api.post(`/api/recipe/delete/${id}`);
};

// 6) 삭제 레시피 목록 조회
export const deletelist = (category) => {
  return api.get("/api/recipe/deleted", {
    params: { category },
  });
};

// 7) 레시피 복원
export const deletereturn = (id) => {
  return api.post(`/api/recipe/deleteReturn/${id}`);
};
