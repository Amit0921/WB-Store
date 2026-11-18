import api from "./axiosConfig";

export const getAllUsers = async (page = 0, size = 50) => {
  const res = await api.get("/users", { params: { page, size } });
  return res.data.data?.content || [];
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

export const updateUserStatus = async (id, active) => {
  const res = await api.patch(`/users/${id}/status`, { active });
  return res.data.data;
};

export const changeUserPassword = async (id, data) => {
  const res = await api.put(`/users/${id}/password`, data);
  return res.data.data;
};
