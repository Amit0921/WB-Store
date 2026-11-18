import api from "./axiosConfig";

export const login = (credentials) => api.post("/auth/login", credentials);

export const refreshTokenApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
