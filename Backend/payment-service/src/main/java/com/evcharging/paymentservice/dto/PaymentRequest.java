package com.evcharging.paymentservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class PaymentRequest {
    @Positive(message = "Booking id must be positive")
    private Long bookingId;

    @NotNull(message = "User id is required")
    @Positive(message = "User id must be positive")
    private Long userId;

    @NotNull(message = "Station id is required")
    @Positive(message = "Station id must be positive")
    private Long stationId;

    @PositiveOrZero(message = "Amount cannot be negative")
    private Double amount;

    @PositiveOrZero(message = "kWh consumed cannot be negative")
    private Double kwhConsumed;

    @PositiveOrZero(message = "Price per kWh cannot be negative")
    private Double pricePerKwh;
}
