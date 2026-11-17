package com.wholesale.store.invoices.dto;

import com.wholesale.store.invoices.dto.CreateInvoiceItemRequest;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateInvoiceRequest {

    private Integer customerId;

    private BigDecimal discountAmount;

    private BigDecimal paidAmount;

    private BigDecimal gstPercentage;

    private String notes;

    private List<CreateInvoiceItemRequest> items;
}