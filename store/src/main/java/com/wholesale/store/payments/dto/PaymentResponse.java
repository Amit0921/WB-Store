package com.wholesale.store.payments.dto;

import com.wholesale.store.payments.enums.PaymentMode;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private Integer id;
    private String receiptNo;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private Integer invoiceId;
    private String invoiceNo;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private String notes;
    private LocalDateTime paymentDate;
    private BigDecimal remainingDue;
}
