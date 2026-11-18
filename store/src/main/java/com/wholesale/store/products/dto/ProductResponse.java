package com.wholesale.store.products.dto;

import com.wholesale.store.products.enums.ProductStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProductResponse {

    private Integer id;
    private String name;
    private String sku;
    private String category;
    private String brand;
    private String unit;
    private String hsnCode;
    private BigDecimal defaultPrice;
    private BigDecimal gstRate;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
