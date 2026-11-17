package com.wholesale.store.common.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI wholesaleStoreOpenApi() {

        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
                .info(new Info()
                        .title("Wholesale Store API")
                        .description("""
                                        Test
                                        """)
//                        Wholesale Garments Management System
//
//                        Features:
//        - Authentication
//                - Staff Management
//                - Customer Management
//                - Invoice Management
//                - Payment Management
//                - Ledger & Statement
                        .version("1.0.0")
                        .contact(new Contact()
                                        .name("Amit Gupta")
                                        .email("amitguptaa0921@email.com")
                        )
                )
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(securitySchemeName)
                )
                .schemaRequirement(
                        securitySchemeName,
                        new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                )
                .externalDocs(
                        new ExternalDocumentation()
                                .description("Project Documentation")
                );
    }
}