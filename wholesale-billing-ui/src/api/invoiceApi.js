// import api from "./axiosConfig";

// export const createInvoice = (data) => api.post("/invoices", data);

import api from "./axiosConfig";

export const createInvoice = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data.data;
};