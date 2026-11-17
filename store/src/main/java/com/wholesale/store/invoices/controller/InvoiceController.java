package com.wholesale.store.invoices.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.service.InvoiceService;
import lombok.RequiredArgsConstructor;
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
}