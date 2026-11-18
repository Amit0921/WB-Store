import api from "./axiosConfig";

export const getDashboardMetrics = async () => {
  const res = await api.get("/dashboard");
  return res.data.data;
};

export const getOutstandingDuesReport = async () => {
  const res = await api.get("/reports/outstanding");
  return res.data.data;
};

export const getDailySalesReport = async (date = null) => {
  const params = {};
  if (date) params.date = date;
  const res = await api.get("/reports/daily-sales", { params });
  return res.data.data;
};

export const getMonthlySummaryReport = async (year = null, month = null) => {
  const params = {};
  if (year) params.year = year;
  if (month) params.month = month;
  const res = await api.get("/reports/monthly-summary", { params });
  return res.data.data;
};
