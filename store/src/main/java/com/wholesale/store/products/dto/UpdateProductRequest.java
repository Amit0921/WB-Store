package com.wholesale.store.products.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String sku;

    private String category;

    private String brand;

    private String unit;

    private String hsnCode;

    @NotNull(message = "Default price is required")
    private BigDecimal defaultPrice;

    private BigDecimal gstRate;
}
