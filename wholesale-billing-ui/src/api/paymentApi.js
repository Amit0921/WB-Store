import api from "./axiosConfig";

export const receivePayment = async (data) => {
  const res = await api.post("/payments", data);
  return res.data.data;
};

export const getPayments = async (page = 0, size = 10, customerId = null) => {
  const params = { page, size };
  if (customerId) params.customerId = customerId;
  const res = await api.get("/payments", { params });
  return res.data.data;
};

export const getPaymentById = async (id) => {
  const res = await api.get(`/payments/${id}`);
  return res.data.data;
};
