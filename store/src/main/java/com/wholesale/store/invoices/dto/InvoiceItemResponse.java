package com.wholesale.store.invoices.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class InvoiceItemResponse {

    private Integer id;
    private String itemCode;
    private String itemName;
    private String brand;
    private String color;
    private String size;
    private String hsnCode;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal rate;
    private BigDecimal amount;
}
