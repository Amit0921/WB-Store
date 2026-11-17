package com.wholesale.store.ledger.repo;

import com.wholesale.store.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerRepository extends JpaRepository<LedgerEntry, Integer> {
    List<LedgerEntry> findByCustomerIdOrderByEntryDateAsc(
            Integer customerId
    );
}