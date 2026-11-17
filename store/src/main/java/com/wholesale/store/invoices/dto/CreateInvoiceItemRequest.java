package com.wholesale.store.invoices.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateInvoiceItemRequest {

    private String itemCode;

    private String itemName;

    private String brand;

    private String color;

    private String size;

    private BigDecimal quantity;

    private String unit;

    private BigDecimal rate;
}