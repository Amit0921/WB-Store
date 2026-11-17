package com.wholesale.store.customers.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.customers.dto.*;
import com.wholesale.store.customers.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<CustomerResponse> create(
            @RequestBody CreateCustomerRequest request
    ) {

        return ApiResponse.<CustomerResponse>builder()
                .success(true)
                .message("Customer created successfully")
                .data(customerService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<CustomerResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ApiResponse.<Page<CustomerResponse>>builder()
                .success(true)
                .message("Customers fetched successfully")
                .data(customerService.getAll(page, size))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> getById(
            @PathVariable Integer id
    ) {

        return ApiResponse.<CustomerResponse>builder()
                .success(true)
                .message("Customer fetched successfully")
                .data(customerService.getById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<CustomerResponse> update(
            @PathVariable Integer id,
            @RequestBody UpdateCustomerRequest request
    ) {

        return ApiResponse.<CustomerResponse>builder()
                .success(true)
                .message("Customer updated successfully")
                .data(customerService.update(id, request))
                .build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Void> updateStatus(
            @PathVariable Integer id,
            @RequestBody UpdateCustomerStatusRequest request
    ) {

        customerService.updateStatus(
                id,
                request.getStatus());

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Customer status updated")
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<Page<CustomerResponse>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ApiResponse.<Page<CustomerResponse>>builder()
                .success(true)
                .message("Search completed")
                .data(customerService.search(
                        keyword,
                        page,
                        size))
                .build();
    }

    @GetMapping("/{customerId}/statement")
    public ApiResponse<List<StatementResponse>> getStatement(
            @PathVariable Integer customerId
    ) {
        return ApiResponse.<List<StatementResponse>>builder()
                .success(true)
                .message("Statement fetched successfully")
                .data(customerService.getStatement(customerId))
                .build();
    }

    @GetMapping("/{customerId}/summary")
    public ApiResponse<CustomerSummaryResponse> getSummary(
            @PathVariable Integer customerId
    ) {
        return ApiResponse.<CustomerSummaryResponse>builder()
                .success(true)
                .message("Customer summary fetched successfully")
                .data(customerService.getSummary(customerId))
                .build();
    }
}