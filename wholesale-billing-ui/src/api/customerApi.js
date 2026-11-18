// import api from "./axiosConfig";

// export const getAllCustomers = () => api.get("/customers");
// export const getCustomerById = (id) => api.get(`/customers/${id}`);
// export const searchCustomers = (query) => api.get("/customers/search", { params: query });
// export const getCustomerSummary = (id) => api.get(`/customers/${id}/summary`);
// export const getCustomerStatement = (id) => api.get(`/customers/${id}/statement`);
// export const createCustomer = (data) => api.post("/customers", data);
// export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
// export const updateCustomerStatus = (id, status) => api.patch(`/customers/${id}/status`, { status });

import api from "./axiosConfig";

export const getAllCustomers = async (page = 0, size = 100) => {
  const res = await api.get("/customers", { params: { page, size } });
  return res.data.data?.content || [];
};

export const getCustomerById = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data.data;
};

export const searchCustomers = async (query) => {
  const params = typeof query === "string" ? { keyword: query } : query;
  const res = await api.get("/customers/search", { params });
  return res.data.data?.content || res.data.data || [];
};

export const getCustomerSummary = async (id) => {
  const res = await api.get(`/customers/${id}/summary`);
  return res.data.data;
};

export const getCustomerStatement = async (id) => {
  const res = await api.get(`/customers/${id}/statement`);
  return res.data.data;
};

export const createCustomer = async (data) => {
  const res = await api.post("/customers", data);
  return res.data.data;
};

export const updateCustomer = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data.data;
};

export const updateCustomerStatus = async (id, status) => {
  const res = await api.patch(`/customers/${id}/status`, { status });
  return res.data.data;
};