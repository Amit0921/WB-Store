package com.wholesale.store.invoices.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.invoices.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ApiResponse<InvoiceResponse> createInvoice(
            @RequestBody CreateInvoiceRequest request
    ) {
        return ApiResponse.<InvoiceResponse>builder()
                .success(true)
                .message("Invoice created successfully")
                .data(invoiceService.createInvoice(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<InvoiceResponse>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) InvoiceStatus invoiceStatus
    ) {
        return ApiResponse.<Page<InvoiceResponse>>builder()
                .success(true)
                .message("Invoices fetched successfully")
                .data(invoiceService.getAllInvoices(page, size, customerId, paymentStatus, invoiceStatus))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> getInvoiceById(@PathVariable Integer id) {
        return ApiResponse.<InvoiceResponse>builder()
                .success(true)
                .message("Invoice fetched successfully")
                .data(invoiceService.getInvoiceById(id))
                .build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InvoiceResponse> cancelInvoice(@PathVariable Integer id) {
        return ApiResponse.<InvoiceResponse>builder()
                .success(true)
                .message("Invoice cancelled successfully")
                .data(invoiceService.cancelInvoice(id))
                .build();
    }
}
