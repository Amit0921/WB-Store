package com.wholesale.store.payments.dto;

import com.wholesale.store.payments.enums.PaymentMode;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePaymentRequest {

    private Integer customerId;

    private Integer invoiceId;

    private BigDecimal amount;

    private PaymentMode paymentMode;

    private String referenceNumber;

    private String notes;
}