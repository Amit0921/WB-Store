package com.wholesale.store.customers.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class StatementResponse {

    private LocalDateTime transactionDate;

    private String transactionType;

    private String referenceNo;

    private BigDecimal debit;

    private BigDecimal credit;

    private BigDecimal runningBalance;
}