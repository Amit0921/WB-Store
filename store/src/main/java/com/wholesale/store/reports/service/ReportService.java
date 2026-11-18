package com.wholesale.store.reports.service;

import com.wholesale.store.reports.dto.DailySalesReport;
import com.wholesale.store.reports.dto.DashboardMetricsResponse;
import com.wholesale.store.reports.dto.MonthlySummaryReport;
import com.wholesale.store.reports.dto.OutstandingDuesResponse;

import java.time.LocalDate;

public interface ReportService {

    DashboardMetricsResponse getDashboardMetrics();

    OutstandingDuesResponse getOutstandingDuesReport();

    DailySalesReport getDailySalesReport(LocalDate date);

    MonthlySummaryReport getMonthlySummaryReport(int year, int month);
}
