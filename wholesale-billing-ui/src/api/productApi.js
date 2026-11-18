import api from "./axiosConfig";

export const getProducts = (page = 0, size = 10, category = null, status = null) => {
  const params = { page, size };
  if (category) params.category = category;
  if (status) params.status = status;
  return api.get("/products", { params });
};

export const getProductById = (id) => api.get(`/products/${id}`);

export const createProduct = (data) => api.post("/products", data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const updateProductStatus = (id, status) =>
  api.patch(`/products/${id}/status`, { status });

export const searchProducts = (keyword, page = 0, size = 10) =>
  api.get("/products/search", { params: { keyword, page, size } });

export const autocompleteProducts = (keyword = "") =>
  api.get("/products/autocomplete", { params: { keyword } });
