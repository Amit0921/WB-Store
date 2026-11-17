package com.wholesale.store.invoices.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class InvoiceResponse {

    private Integer id;

    private String invoiceNo;

    private String customerName;

    private BigDecimal finalAmount;

    private BigDecimal paidAmount;

    private BigDecimal dueAmount;
}
