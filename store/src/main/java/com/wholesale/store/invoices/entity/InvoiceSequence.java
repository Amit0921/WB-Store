package com.wholesale.store.invoices.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "invoice_sequences")
public class InvoiceSequence {

    @Id
    private String financialYear;

    private Long lastNumber;
}