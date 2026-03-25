package com.evcharging.bookingservice.client;

import com.evcharging.bookingservice.dto.StationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "station-service",
        url = "${feign.station-service.url}"
)
public interface StationServiceClient {

    @GetMapping("/api/stations/{id}")
    StationDto getStationById(@PathVariable("id") Long id);
}
