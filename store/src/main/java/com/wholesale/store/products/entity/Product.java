package com.wholesale.store.products.entity;

import com.wholesale.store.common.entity.BaseAuditEntity;
import com.wholesale.store.products.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product extends BaseAuditEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String sku;

    private String category;

    private String brand;

    private String unit = "PIECE";

    private String hsnCode;

    @Column(precision = 12, scale = 2)
    private BigDecimal defaultPrice = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal gstRate = new BigDecimal("5.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;
}
