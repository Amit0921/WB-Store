package com.wholesale.store.customers.entity;

import com.wholesale.store.common.entity.BaseAuditEntity;
import com.wholesale.store.customers.enums.CustomerStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer extends BaseAuditEntity {

    @Column(nullable = false)
    private String shopName;

    private String ownerName;

    @Column(nullable = false, unique = true)
    private String phone;

    private String alternatePhone;

    @Column(unique = true)
    private String gstin;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(precision = 12, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal currentDue = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status = CustomerStatus.ACTIVE;
}