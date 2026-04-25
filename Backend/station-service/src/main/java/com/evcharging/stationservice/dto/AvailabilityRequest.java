package com.evcharging.stationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityRequest {
    @NotNull(message = "Available slots is required")
    @Min(value = 0, message = "Available slots cannot be negative")
    private Integer availableSlots;
}
