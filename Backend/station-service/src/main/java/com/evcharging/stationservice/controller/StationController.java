package com.evcharging.stationservice.controller;

import com.evcharging.stationservice.dto.AvailabilityRequest;
import com.evcharging.stationservice.dto.StationRequest;
import com.evcharging.stationservice.dto.StationResponse;
import com.evcharging.stationservice.model.Availability;
import com.evcharging.stationservice.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@Tag(name = "Station Controller", description = "Manage EV Charging Stations")
@Validated
public class StationController {

    private final StationService stationService;

    @GetMapping
    @Operation(summary = "Get all stations", description = "Fetch a paginated list of all charging stations")
    public ResponseEntity<Page<StationResponse>> getAllStations(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be >= 0") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size must be >= 1") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(stationService.getAllStations(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station by ID", description = "Fetch detailed information for a specific station including its chargers")
    public ResponseEntity<StationResponse> getStationById(@PathVariable @Positive(message = "Station id must be positive") Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @PostMapping
    @Operation(summary = "Add a new station (Admin only)", description = "Create a new charging station in the network")
    public ResponseEntity<StationResponse> createStation(@Valid @RequestBody StationRequest request) {
        return ResponseEntity.ok(stationService.createStation(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update station details", description = "Update basic station details and charger setup")
    public ResponseEntity<StationResponse> updateStation(
            @PathVariable @Positive(message = "Station id must be positive") Long id,
            @Valid @RequestBody StationRequest request
    ) {
        return ResponseEntity.ok(stationService.updateStation(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete station", description = "Delete station and associated chargers and availability")
    public ResponseEntity<String> deleteStation(@PathVariable @Positive(message = "Station id must be positive") Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.ok("Station deleted successfully");
    }

    @PutMapping("/{id}/availability")
    @Operation(summary = "Update availability", description = "Update the real-time availability of slots at a station")
    public ResponseEntity<Availability> updateAvailability(
            @PathVariable @Positive(message = "Station id must be positive") Long id,
            @Valid @RequestBody AvailabilityRequest request
    ) {
        return ResponseEntity.ok(stationService.updateAvailability(id, request));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby stations", description = "Fetch stations within a specific radius (default 10km) based on coordinates")
    public ResponseEntity<List<StationResponse>> getNearbyStations(
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be >= -90") @DecimalMax(value = "90.0", message = "Latitude must be <= 90") double lat,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be >= -180") @DecimalMax(value = "180.0", message = "Longitude must be <= 180") double lng,
            @RequestParam(defaultValue = "10") @DecimalMin(value = "0.1", message = "Radius must be > 0") double radius
    ) {
        return ResponseEntity.ok(stationService.getNearbyStations(lat, lng, radius));
    }
}
