package com.wholesale.store.reports.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.reports.dto.DailySalesReport;
import com.wholesale.store.reports.dto.DashboardMetricsResponse;
import com.wholesale.store.reports.dto.MonthlySummaryReport;
import com.wholesale.store.reports.dto.OutstandingDuesResponse;
import com.wholesale.store.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardMetricsResponse> getDashboardMetrics() {
        return ApiResponse.<DashboardMetricsResponse>builder()
                .success(true)
                .message("Dashboard metrics fetched successfully")
                .data(reportService.getDashboardMetrics())
                .build();
    }

    @GetMapping("/reports/outstanding")
    public ApiResponse<OutstandingDuesResponse> getOutstandingDuesReport() {
        return ApiResponse.<OutstandingDuesResponse>builder()
                .success(true)
                .message("Outstanding dues aging report fetched successfully")
                .data(reportService.getOutstandingDuesReport())
                .build();
    }

    @GetMapping("/reports/daily-sales")
    public ApiResponse<DailySalesReport> getDailySalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ApiResponse.<DailySalesReport>builder()
                .success(true)
                .message("Daily sales report fetched successfully")
                .data(reportService.getDailySalesReport(targetDate))
                .build();
    }

    @GetMapping("/reports/monthly-summary")
    public ApiResponse<MonthlySummaryReport> getMonthlySummaryReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();

        return ApiResponse.<MonthlySummaryReport>builder()
                .success(true)
                .message("Monthly summary report fetched successfully")
                .data(reportService.getMonthlySummaryReport(targetYear, targetMonth))
                .build();
    }
}
