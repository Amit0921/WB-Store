package com.wholesale.store.ledger.entity;

import com.wholesale.store.common.entity.BaseEntity;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.ledger.enums.LedgerEntryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Getter
@Setter
public class LedgerEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private LedgerEntryType entryType;

    private String referenceNo;

    @Column(precision = 12, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal runningBalance = BigDecimal.ZERO;

    private LocalDateTime entryDate;
}