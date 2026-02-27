import axiosInstance from "./axios";
import {loadAuth} from "../utils/authStorage.js";

const api = axiosInstance;

const unwrapRecipeResponse = (response) => {
    const body = response?.data;

    if (body && typeof body === "object" && "success" in body) {
        if (!body.success) {
            throw new Error(body?.message || "요청 처리 중 오류가 발생했습니다.");
        }
        return body.data;
    }

    return body;
};

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

//영구삭제
export const permanentDeleteRecipe = (id) => {
    return api.post(`/api/recipe/hard_delete/${id}`)
}

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
    return unwrapRecipeResponse(response) ?? [];
};

// 레시피 상세용 리뷰 목록 조회
export const getRecipeReviews = async (recipeId) => {
    const response = await api.get(`/api/recipe/reviews/recipes/${recipeId}`);
    return unwrapRecipeResponse(response) ?? [];
};

// 레시피 리뷰 작성/수정/삭제 API
export const createRecipeReview = async (payload) => {
    const response = await api.post(`/api/recipe/reviews`, payload);
    return unwrapRecipeResponse(response);
};

export const updateRecipeReview = async (reviewId, payload) => {
    const response = await api.patch(`/api/recipe/reviews/${reviewId}`, payload);
    return unwrapRecipeResponse(response);
};

export const deleteRecipeReview = async (reviewId) => {
    const response = await api.delete(`/api/recipe/reviews/${reviewId}`);
    return unwrapRecipeResponse(response);
};

// 관리자용 레시피 리뷰 관리 API
export const fetchAdminRecipeReviews = async () => {
    const response = await api.get(`/api/recipe/reviews/admin`);
    return unwrapRecipeResponse(response) ?? [];
};

export const answerRecipeReview = async (reviewId, payload) => {
    const response = await api.post(`/api/recipe/reviews/${reviewId}/answer`, payload);
    return unwrapRecipeResponse(response);
};

// 레시피 문의 목록/내 문의/관리자 문의 조회 API
export const getRecipeInquiries = async (recipeId) => {
    const response = await api.get(`/api/recipe/inquiries/recipes/${recipeId}`);
    return unwrapRecipeResponse(response) ?? [];
};

export const fetchMyRecipeInquiries = async () => {
    const response = await api.get(`/api/recipe/inquiries/me`);
    return unwrapRecipeResponse(response) ?? [];
};

export const fetchAdminRecipeInquiries = async () => {
    const response = await api.get(`/api/recipe/inquiries/admin`);
    return unwrapRecipeResponse(response) ?? [];
};

// 레시피 문의 작성/수정/삭제/답글 API
export const createRecipeInquiry = async (payload) => {
    const response = await api.post(`/api/recipe/inquiries`, payload);
    return unwrapRecipeResponse(response);
};

export const updateRecipeInquiry = async (inquiryId, payload) => {
    const response = await api.patch(`/api/recipe/inquiries/${inquiryId}`, payload);
    return unwrapRecipeResponse(response);
};

export const deleteRecipeInquiry = async (inquiryId) => {
    const response = await api.delete(`/api/recipe/inquiries/${inquiryId}`);
    return unwrapRecipeResponse(response);
};

export const answerRecipeInquiry = async (inquiryId, payload) => {
    const response = await api.post(`/api/recipe/inquiries/${inquiryId}/answer`, payload);
    return unwrapRecipeResponse(response);
};

export const Recommend = async (id) => {
    return await api.post(`api/recipe/${id}/recommend`);
}
