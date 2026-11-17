package com.wholesale.store.customers.dto;

import com.wholesale.store.customers.enums.CustomerStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCustomerStatusRequest {

    private CustomerStatus status;

}