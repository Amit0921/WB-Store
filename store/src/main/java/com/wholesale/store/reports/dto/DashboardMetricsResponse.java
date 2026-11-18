package com.wholesale.store.reports.dto;

import com.wholesale.store.invoices.dto.InvoiceResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class DashboardMetricsResponse {

    private BigDecimal todaySales;
    private BigDecimal todayPayments;
    private BigDecimal totalOutstandingDue;
    private Long activeCustomers;
    private Long todayInvoicesCount;
    private BigDecimal monthSales;
    private BigDecimal monthPayments;
    private List<InvoiceResponse> recentInvoices;
    private List<OutstandingCustomerItem> topDueCustomers;
}
