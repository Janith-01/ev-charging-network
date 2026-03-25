package com.evcharging.bookingservice.dto;

import lombok.Data;
import java.util.List;

/**
 * Mirrors the StationResponse from station-service
 * used to deserialize the Feign response.
 */
@Data
public class StationDto {
    private Long id;
    private String name;
    private Integer totalChargers;
    private Double pricingPerKwh;
    private String contactNumber;
    private String address;
    private Double latitude;
    private Double longitude;
    private List<ChargerDto> chargers;
    private Integer availableSlots;
}
