package com.wholesale.store.payments.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payment_sequences")
public class PaymentSequence {

    @Id
    private String financialYear;

    private Long lastNumber;
}