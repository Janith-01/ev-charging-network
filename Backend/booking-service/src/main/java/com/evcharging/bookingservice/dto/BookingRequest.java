package com.evcharging.bookingservice.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "User id is required")
    @Positive(message = "User id must be positive")
    private Long userId;

    @NotNull(message = "Station id is required")
    @Positive(message = "Station id must be positive")
    private Long stationId;

    @NotNull(message = "Charger id is required")
    @Positive(message = "Charger id must be positive")
    private Long chargerId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate date;
}
