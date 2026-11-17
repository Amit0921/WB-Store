package com.wholesale.store.invoices.repo;

import com.wholesale.store.invoices.entity.InvoiceSequence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, String> {
}
