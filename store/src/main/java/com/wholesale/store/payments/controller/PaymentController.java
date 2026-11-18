package com.wholesale.store.payments.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;
import com.wholesale.store.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> receivePayment(
            @RequestBody CreatePaymentRequest request
    ) {
        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment received successfully")
                .data(paymentService.receivePayment(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<PaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer customerId
    ) {
        return ApiResponse.<Page<PaymentResponse>>builder()
                .success(true)
                .message("Payments fetched successfully")
                .data(paymentService.getAllPayments(page, size, customerId))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPaymentById(@PathVariable Integer id) {
        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment receipt fetched successfully")
                .data(paymentService.getPaymentById(id))
                .build();
    }
}
