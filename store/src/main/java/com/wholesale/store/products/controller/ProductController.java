package com.wholesale.store.products.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.products.dto.CreateProductRequest;
import com.wholesale.store.products.dto.ProductResponse;
import com.wholesale.store.products.dto.UpdateProductRequest;
import com.wholesale.store.products.dto.UpdateProductStatusRequest;
import com.wholesale.store.products.enums.ProductStatus;
import com.wholesale.store.products.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product created successfully")
                .data(productService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ProductStatus status
    ) {
        return ApiResponse.<Page<ProductResponse>>builder()
                .success(true)
                .message("Products fetched successfully")
                .data(productService.getAll(page, size, category, status))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product fetched successfully")
                .data(productService.getById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<ProductResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product updated successfully")
                .data(productService.update(id, request))
                .build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Void> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateProductStatusRequest request
    ) {
        productService.updateStatus(id, request.getStatus());
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Product status updated successfully")
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<Page<ProductResponse>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ProductResponse>>builder()
                .success(true)
                .message("Product search completed")
                .data(productService.search(keyword, page, size))
                .build();
    }

    @GetMapping("/autocomplete")
    public ApiResponse<List<ProductResponse>> autocomplete(
            @RequestParam(defaultValue = "") String keyword
    ) {
        return ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .message("Active products fetched for invoice")
                .data(productService.searchActive(keyword))
                .build();
    }
}
