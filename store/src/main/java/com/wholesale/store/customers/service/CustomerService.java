package com.wholesale.store.customers.service;

import com.wholesale.store.customers.dto.*;
import com.wholesale.store.customers.enums.CustomerStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerService {

    CustomerResponse create(CreateCustomerRequest request);

    CustomerResponse getById(Integer id);

    Page<CustomerResponse> getAll(
            int page,
            int size
    );

    CustomerResponse update(
            Integer id,
            UpdateCustomerRequest request
    );

    void updateStatus(
            Integer id,
            CustomerStatus status
    );

    Page<CustomerResponse> search(
            String keyword,
            int page,
            int size
    );

    List<StatementResponse> getStatement(
            Integer customerId
    );

    CustomerSummaryResponse getSummary(
            Integer customerId
    );
}