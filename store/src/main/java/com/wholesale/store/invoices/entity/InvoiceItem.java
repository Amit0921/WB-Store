package com.wholesale.store.invoices.entity;

import com.wholesale.store.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Getter
@Setter
public class InvoiceItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(nullable = false)
    private String itemName;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String color;

    @Column(length = 50)
    private String size;

    @Column(length = 50)
    private String hsnCode;

    @Column(precision = 12, scale = 2)
    private BigDecimal quantity;

    private String unit;

    @Column(precision = 12, scale = 2)
    private BigDecimal rate;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

}