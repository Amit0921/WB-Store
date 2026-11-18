package com.wholesale.store.reports.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class OutstandingDuesResponse {

    private BigDecimal totalOutstanding;
    private BigDecimal bracket0To30;
    private BigDecimal bracket31To60;
    private BigDecimal bracket60Plus;
    private List<OutstandingCustomerItem> customers;
}
