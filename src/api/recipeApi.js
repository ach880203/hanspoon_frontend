import axiosInstance from "./axios";
import {loadAuth} from "../utils/authStorage.js";

const api = axiosInstance;

//1. 목록 조회 (페이징/검색/카테고리 포함)
export const getRecipeList = (params) => {
    return api.get(`/api/recipe/list`, {params});
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
    return api.post(`/api/recipe/deleteReturn/${id}`);
};

//9.관심목록

export const fetchMyWishes = async (page = 0, size = 12, category = "") => {
    const authData = loadAuth();
    const token = authData?.accessToken;
    const response = await api.get(`/api/recipe/RecipeWishes`, {
      params: {
        page,
        size,
        ...(category ? { category } : {}),
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
};

export const toggleWish = async (id) => {
    const authData = loadAuth();
    const token = authData?.accessToken;

    const response = await api.post(`/api/recipe/toggleWish/${id}`, {}, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ""
        }
    });
    return response.data;
};

export const deletewihses = async (id) => {
   return await api.delete(`/api/recipe/deletewihses/${id}`);
}

// 로그인 사용자가 작성한 레시피 리뷰 목록 조회
// 반환값은 백엔드 ApiResponse의 data 필드(List<MyRecipeReviewDto>)입니다.
export const fetchMyRecipeReviews = async () => {
    const response = await api.get(`/api/recipe/reviews/me`);
    return response?.data?.data ?? [];
};
