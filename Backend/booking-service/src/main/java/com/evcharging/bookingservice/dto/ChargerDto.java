package com.evcharging.bookingservice.dto;

import lombok.Data;

@Data
public class ChargerDto {
    private Long id;
    private String status;
    private String connectorType;
}
