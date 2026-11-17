package com.wholesale.store.ledger.entity;

import com.wholesale.store.customers.entity.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "customer_credit_history")
public class CustomerCreditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String transactionType;

    private String referenceNo;

    private BigDecimal amount;

    private String remarks;

    private LocalDateTime createdAt;
}