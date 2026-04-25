package com.evcharging.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RefundRequest {
    @NotNull(message = "Refund amount is required")
    @Positive(message = "Refund amount must be positive")
    private Double refundAmount;

    @NotBlank(message = "Refund reason is required")
    @Size(max = 300, message = "Refund reason must be at most 300 characters")
    private String reason;
}
