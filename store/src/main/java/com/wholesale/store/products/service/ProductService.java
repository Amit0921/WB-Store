package com.wholesale.store.products.service;

import com.wholesale.store.products.dto.CreateProductRequest;
import com.wholesale.store.products.dto.ProductResponse;
import com.wholesale.store.products.dto.UpdateProductRequest;
import com.wholesale.store.products.enums.ProductStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    ProductResponse create(CreateProductRequest request);

    ProductResponse getById(Integer id);

    ProductResponse update(Integer id, UpdateProductRequest request);

    void updateStatus(Integer id, ProductStatus status);

    Page<ProductResponse> getAll(int page, int size, String category, ProductStatus status);

    Page<ProductResponse> search(String keyword, int page, int size);

    List<ProductResponse> searchActive(String keyword);
}
