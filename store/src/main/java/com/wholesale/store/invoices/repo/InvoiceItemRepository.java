package com.wholesale.store.invoices.repo;

import com.wholesale.store.invoices.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Integer> {
}
