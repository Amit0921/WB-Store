package com.wholesale.store.products.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.products.dto.CreateProductRequest;
import com.wholesale.store.products.dto.ProductResponse;
import com.wholesale.store.products.dto.UpdateProductRequest;
import com.wholesale.store.products.entity.Product;
import com.wholesale.store.products.enums.ProductStatus;
import com.wholesale.store.products.repo.ProductRepository;
import com.wholesale.store.products.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (request.getSku() != null && !request.getSku().isBlank()) {
            if (productRepository.existsBySku(request.getSku().trim())) {
                throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists");
            }
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setSku(request.getSku() != null && !request.getSku().isBlank() ? request.getSku().trim() : null);
        product.setCategory(request.getCategory() != null ? request.getCategory().trim() : null);
        product.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        product.setUnit(request.getUnit() != null && !request.getUnit().isBlank() ? request.getUnit().trim() : "PIECE");
        product.setHsnCode(request.getHsnCode() != null ? request.getHsnCode().trim() : null);
        product.setDefaultPrice(request.getDefaultPrice() != null ? request.getDefaultPrice() : BigDecimal.ZERO);
        product.setGstRate(request.getGstRate() != null ? request.getGstRate() : new BigDecimal("5.00"));
        product.setStatus(ProductStatus.ACTIVE);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(Integer id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.getSku() != null && !request.getSku().isBlank()) {
            String newSku = request.getSku().trim();
            if (!newSku.equalsIgnoreCase(product.getSku()) && productRepository.existsBySku(newSku)) {
                throw new BadRequestException("Product with SKU '" + newSku + "' already exists");
            }
            product.setSku(newSku);
        } else {
            product.setSku(null);
        }

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory() != null ? request.getCategory().trim() : null);
        product.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            product.setUnit(request.getUnit().trim());
        }
        product.setHsnCode(request.getHsnCode() != null ? request.getHsnCode().trim() : null);
        product.setDefaultPrice(request.getDefaultPrice() != null ? request.getDefaultPrice() : BigDecimal.ZERO);
        if (request.getGstRate() != null) {
            product.setGstRate(request.getGstRate());
        }

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void updateStatus(Integer id, ProductStatus status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStatus(status);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAll(int page, int size, String category, ProductStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Product> products;

        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategory(category.trim(), pageable);
        } else if (status != null) {
            products = productRepository.findByStatus(status, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Product> products = productRepository.searchProducts(keyword.trim(), pageable);
        return products.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchActive(String keyword) {
        List<Product> products = productRepository.searchActiveForInvoice(keyword != null ? keyword.trim() : "");
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .brand(product.getBrand())
                .unit(product.getUnit())
                .hsnCode(product.getHsnCode())
                .defaultPrice(product.getDefaultPrice())
                .gstRate(product.getGstRate())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
