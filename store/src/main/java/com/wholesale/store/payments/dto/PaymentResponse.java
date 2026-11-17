package com.wholesale.store.payments.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private String invoiceNo;

    private String customerName;

    private BigDecimal paidAmount;

    private BigDecimal remainingDue;
}