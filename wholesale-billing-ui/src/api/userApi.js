// import api from "./axiosConfig";

// export const getAllUsers = () => api.get("/users");
// export const getUserById = (id) => api.get(`/users/${id}`);
// export const createUser = (data) => api.post("/users", data);
// export const updateUser = (id, data) => api.put(`/users/${id}`, data);
// export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status });

import api from "./axiosConfig";

export const getAllUsers = async () => {
  const res = await api.get("/users");
  return res.data.data.content || [];
};

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users", data);
  return res.data.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await api.patch(`/users/${id}/status`, { status });
  return res.data.data;
};