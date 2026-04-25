package com.evcharging.stationservice.dto;

import com.evcharging.stationservice.model.ConnectorType;
import com.evcharging.stationservice.model.ChargerStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChargerDto {
    private Long id;

    @NotNull(message = "Charger status is required")
    private ChargerStatus status;

    @NotNull(message = "Connector type is required")
    private ConnectorType connectorType;
}
