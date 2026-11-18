package com.wholesale.store.products.dto;

import com.wholesale.store.products.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductStatusRequest {

    @NotNull(message = "Product status is required")
    private ProductStatus status;
}
