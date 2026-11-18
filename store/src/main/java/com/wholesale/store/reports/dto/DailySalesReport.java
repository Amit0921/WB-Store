package com.wholesale.store.reports.dto;

import com.wholesale.store.invoices.dto.InvoiceResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class DailySalesReport {

    private LocalDate reportDate;
    private Long totalInvoices;
    private BigDecimal grossSales;
    private BigDecimal gstCollected;
    private BigDecimal discountGiven;
    private BigDecimal netSales;
    private BigDecimal cashCollections;
    private BigDecimal creditIssued;
    private List<InvoiceResponse> invoices;
}
