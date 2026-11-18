package com.wholesale.store.reports.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class OutstandingCustomerItem {

    private Integer customerId;
    private String shopName;
    private String ownerName;
    private String phone;
    private BigDecimal currentDue;
    private BigDecimal creditLimit;
    private LocalDateTime oldestPendingInvoiceDate;
    private Long daysOverdue;
    private String agingBracket;
    private Long unpaidInvoicesCount;
}
