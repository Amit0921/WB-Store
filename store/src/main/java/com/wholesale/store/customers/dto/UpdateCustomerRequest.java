package com.wholesale.store.customers.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateCustomerRequest {

    private String shopName;

    private String ownerName;

    private String phone;

    private String alternatePhone;

    private String gstin;

    private String address;

    private BigDecimal creditLimit;
}