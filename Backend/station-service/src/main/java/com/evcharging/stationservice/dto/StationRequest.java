package com.evcharging.stationservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class StationRequest {
    @NotBlank(message = "Station name is required")
    @Size(max = 200, message = "Station name must be at most 200 characters")
    private String name;

    @NotNull(message = "Total chargers is required")
    @Min(value = 1, message = "Total chargers must be at least 1")
    private Integer totalChargers;

    @NotNull(message = "Pricing per kWh is required")
    @Positive(message = "Pricing per kWh must be positive")
    private Double pricingPerKwh;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9+\\-()\\s]{7,20}$", message = "Contact number format is invalid")
    private String contactNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private Double longitude;

    @NotNull(message = "Chargers list is required")
    @Size(min = 1, message = "At least one charger is required")
    private List<@Valid ChargerDto> chargers;
}
