package com.evcharging.stationservice.dto;

import com.evcharging.stationservice.model.ConnectorType;
import com.evcharging.stationservice.model.ChargerStatus;
import lombok.Data;

@Data
public class ChargerDto {
    private Long id;
    private ChargerStatus status;
    private ConnectorType connectorType;
}
