package com.evcharging.stationservice.dto.ocm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OcmStationDto {
    
    @JsonProperty("AddressInfo")
    private AddressInfo addressInfo;

    @JsonProperty("Connections")
    private List<Connection> connections;

    @JsonProperty("UsageCost")
    private String usageCost;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressInfo {
        @JsonProperty("Title")
        private String title;

        @JsonProperty("AddressLine1")
        private String addressLine1;

        @JsonProperty("Latitude")
        private Double latitude;

        @JsonProperty("Longitude")
        private Double longitude;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Connection {
        @JsonProperty("Level")
        private Level level;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Level {
        @JsonProperty("IsFastChargeCapable")
        private Boolean isFastChargeCapable;
    }
}
