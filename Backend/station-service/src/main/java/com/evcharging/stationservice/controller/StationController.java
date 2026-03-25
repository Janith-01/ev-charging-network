package com.evcharging.stationservice.controller;

import com.evcharging.stationservice.dto.AvailabilityRequest;
import com.evcharging.stationservice.dto.StationRequest;
import com.evcharging.stationservice.dto.StationResponse;
import com.evcharging.stationservice.model.Availability;
import com.evcharging.stationservice.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@Tag(name = "Station Controller", description = "Manage EV Charging Stations")
public class StationController {

    private final StationService stationService;

    @GetMapping
    @Operation(summary = "Get all stations", description = "Fetch a paginated list of all charging stations")
    public ResponseEntity<Page<StationResponse>> getAllStations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(stationService.getAllStations(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station by ID", description = "Fetch detailed information for a specific station including its chargers")
    public ResponseEntity<StationResponse> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @PostMapping
    @Operation(summary = "Add a new station (Admin only)", description = "Create a new charging station in the network")
    public ResponseEntity<StationResponse> createStation(@RequestBody StationRequest request) {
        return ResponseEntity.ok(stationService.createStation(request));
    }

    @PutMapping("/{id}/availability")
    @Operation(summary = "Update availability", description = "Update the real-time availability of slots at a station")
    public ResponseEntity<Availability> updateAvailability(
            @PathVariable Long id,
            @RequestBody AvailabilityRequest request
    ) {
        return ResponseEntity.ok(stationService.updateAvailability(id, request));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby stations", description = "Fetch stations within a specific radius (default 10km) based on coordinates")
    public ResponseEntity<List<StationResponse>> getNearbyStations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius
    ) {
        return ResponseEntity.ok(stationService.getNearbyStations(lat, lng, radius));
    }
}
