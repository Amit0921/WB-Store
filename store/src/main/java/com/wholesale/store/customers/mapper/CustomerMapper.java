package com.wholesale.store.customers.mapper;

import com.wholesale.store.customers.dto.CustomerResponse;
import com.wholesale.store.customers.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer customer) {

        return CustomerResponse.builder()
                .id(customer.getId())
                .shopName(customer.getShopName())
                .ownerName(customer.getOwnerName())
                .phone(customer.getPhone())
                .gstin(customer.getGstin())
                .creditLimit(customer.getCreditLimit())
                .currentDue(customer.getCurrentDue())
                .status(customer.getStatus())
                .build();
    }
}