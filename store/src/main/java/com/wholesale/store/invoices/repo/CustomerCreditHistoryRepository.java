package com.wholesale.store.invoices.repo;

import com.wholesale.store.ledger.entity.CustomerCreditHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerCreditHistoryRepository extends JpaRepository<CustomerCreditHistory, Integer> {
}
