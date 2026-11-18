package com.wholesale.store.reports.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class MonthlySummaryReport {

    private int year;
    private int month;
    private BigDecimal totalRevenue;
    private BigDecimal totalGstCollected;
    private BigDecimal totalPaymentsCollected;
    private BigDecimal netCreditChange;
    private Long totalInvoices;
    private Long totalPayments;
}
