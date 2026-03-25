package com.evcharging.stationservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class StationRequest {
    private String name;
    private Integer totalChargers;
    private Double pricingPerKwh;
    private String contactNumber;
    private String address;
    private Double latitude;
    private Double longitude;
    private List<ChargerDto> chargers;
}
