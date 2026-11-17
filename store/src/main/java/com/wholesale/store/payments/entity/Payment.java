package com.wholesale.store.payments.entity;

import com.wholesale.store.common.entity.BaseAuditEntity;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.payments.enums.PaymentMode;
import com.wholesale.store.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;

    private String referenceNumber;

    private String notes;

    private LocalDateTime paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by")
    private User receivedBy;

    @Column(unique = true)
    private String receiptNo;
}