package com.wholesale.store.invoices.dto;

import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class InvoiceResponse {

    private Integer id;
    private String invoiceNo;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String customerGstin;
    private String customerAddress;
    private BigDecimal subtotal;
    private BigDecimal gstAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;
    private PaymentStatus paymentStatus;
    private InvoiceStatus invoiceStatus;
    private String notes;
    private LocalDateTime invoiceDate;
    private List<InvoiceItemResponse> items;
}
