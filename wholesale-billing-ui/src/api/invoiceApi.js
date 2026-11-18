import api from "./axiosConfig";

export const createInvoice = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data.data;
};

export const getInvoices = async (
  page = 0,
  size = 10,
  customerId = null,
  paymentStatus = null,
  invoiceStatus = null
) => {
  const params = { page, size };
  if (customerId) params.customerId = customerId;
  if (paymentStatus) params.paymentStatus = paymentStatus;
  if (invoiceStatus) params.invoiceStatus = invoiceStatus;
  const res = await api.get("/invoices", { params });
  return res.data.data;
};

export const getInvoiceById = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data.data;
};

export const cancelInvoice = async (id) => {
  const res = await api.patch(`/invoices/${id}/cancel`);
  return res.data.data;
};
