package com.wholesale.store.customers.dto;

import com.wholesale.store.customers.enums.CustomerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class CustomerSummaryResponse {

    private String shopName;

    private String ownerName;

    private String phone;

    private String gstin;

    private String address;

    private CustomerStatus status;

    private BigDecimal creditLimit;

    private BigDecimal currentDue;

    private BigDecimal totalInvoiceAmount;

    private BigDecimal totalPaidAmount;

    private Long totalInvoices;
}
