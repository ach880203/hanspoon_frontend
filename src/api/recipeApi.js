import axiosInstance from "./axios";

const api = axiosInstance;

export const getRecipeList = (params) => {
  return api.get("/api/recipe/list", { params });
};

export const getRecipeDetail = (id) => {
  return api.get(`/api/recipe/detail/${id}`);
};

export const createRecipe = (recipeData) => {
  return api.post("/api/recipe/new", recipeData);
};

export const updateRecipe = (id, recipeData) => {
  return api.post(`/api/recipe/edit/${id}`, recipeData);
};

export const deleteRecipe = (id) => {
  return api.post(`/api/recipe/delete/${id}`);
};

export const deletelist = (category) => {
  return api.get("/api/recipe/deleted", {
    params: { category },
  });
};

export const deletereturn = (id) => {
  return api.post(`/api/recipe/deleteReturn/${id}`);
};

export const createwishes = (id) => {
  return api.post(`/api/recipe/createWishes/${id}`, {});
};

export const wisheslist = ({ page = 0, size = 12, category = "" } = {}) => {
  return api.get("/api/recipe/wishesList", {
    params: { page, size, category },
  });
};

export const fetchMyWishes = async (page = 0, size = 12, category = "") => {
  const response = await api.get("/api/recipe/wishesList", {
    params: { page, size, category },
  });
  return response.data;
};

export const toggleWish = async (id) => {
  const response = await api.post(`/api/recipe/createWishes/${id}`, {});
  return response.data;
};
