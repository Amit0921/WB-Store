package com.wholesale.store.invoices.entity;

import com.wholesale.store.common.entity.BaseAuditEntity;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter
@Setter
public class Invoice extends BaseAuditEntity {

    @Column(nullable = false, unique = true)
    private String invoiceNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 12, scale = 2)
    private BigDecimal gstAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal dueAmount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus invoiceStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime invoiceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<InvoiceItem> items = new ArrayList<>();
}