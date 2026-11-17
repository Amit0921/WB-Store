// import api from "./axiosConfig";

// export const receivePayment = (data) => api.post("/payments", data);

import api from "./axiosConfig";

export const receivePayment = async (data) => {
  const res = await api.post("/payments", data);
  return res.data.data;
};