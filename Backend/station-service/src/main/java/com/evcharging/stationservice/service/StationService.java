package com.evcharging.stationservice.service;

import com.evcharging.stationservice.dto.*;
import com.evcharging.stationservice.model.*;
import com.evcharging.stationservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StationService {

    private final StationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final AvailabilityRepository availabilityRepository;

    public Page<StationResponse> getAllStations(Pageable pageable) {
        return stationRepository.findAll(pageable).map(this::mapToResponse);
    }

    public StationResponse getStationById(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        return mapToResponse(station);
    }

    @Transactional
    public StationResponse createStation(StationRequest request) {
        Station station = Station.builder()
                .name(request.getName())
                .totalChargers(request.getTotalChargers())
                .pricingPerKwh(request.getPricingPerKwh())
                .contactNumber(request.getContactNumber())
                .location(Location.builder()
                        .address(request.getAddress())
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .build())
                .build();

        Station savedStation = stationRepository.save(station);

        // Create chargers if provided
        if (request.getChargers() != null && !request.getChargers().isEmpty()) {
            List<Charger> chargers = request.getChargers().stream()
                    .map(dto -> Charger.builder()
                            .station(savedStation)
                            .status(dto.getStatus() != null ? dto.getStatus() : ChargerStatus.AVAILABLE)
                            .connectorType(dto.getConnectorType())
                            .build())
                    .collect(Collectors.toList());
            chargerRepository.saveAll(chargers);
            savedStation.setChargers(chargers);
        }

        // Initialize availability
        Availability availability = Availability.builder()
                .stationId(savedStation.getId())
                .availableSlots(request.getTotalChargers())
                .build();
        availabilityRepository.save(availability);

        return mapToResponse(savedStation);
    }

    @Transactional
    public Availability updateAvailability(Long stationId, AvailabilityRequest request) {
        stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + stationId));

        Availability availability = availabilityRepository.findByStationId(stationId)
                .orElse(Availability.builder().stationId(stationId).build());

        availability.setAvailableSlots(request.getAvailableSlots());
        return availabilityRepository.save(availability);
    }

    public List<StationResponse> getNearbyStations(double lat, double lng, double radiusKm) {
        List<Station> stations = stationRepository.findNearbyStations(lat, lng, radiusKm);
        return stations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public StationResponse updateStation(Long id, StationRequest request) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        station.setName(request.getName());
        station.setTotalChargers(request.getTotalChargers());
        station.setPricingPerKwh(request.getPricingPerKwh());
        station.setContactNumber(request.getContactNumber());
        station.setLocation(Location.builder()
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build());

        chargerRepository.deleteByStationId(id);
        if (request.getChargers() != null && !request.getChargers().isEmpty()) {
            List<Charger> chargers = request.getChargers().stream()
                    .map(dto -> Charger.builder()
                            .station(station)
                            .status(dto.getStatus() != null ? dto.getStatus() : ChargerStatus.AVAILABLE)
                            .connectorType(dto.getConnectorType())
                            .build())
                    .collect(Collectors.toList());
            chargerRepository.saveAll(chargers);
            station.setChargers(chargers);
        }

        Availability availability = availabilityRepository.findByStationId(id)
                .orElse(Availability.builder().stationId(id).build());
        availability.setAvailableSlots(request.getTotalChargers());
        availabilityRepository.save(availability);

        Station updated = stationRepository.save(station);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteStation(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        chargerRepository.deleteByStationId(id);
        availabilityRepository.deleteByStationId(id);
        stationRepository.delete(station);
    }

    // ---- Mapping Helpers ----

    private StationResponse mapToResponse(Station station) {
        StationResponse response = new StationResponse();
        response.setId(station.getId());
        response.setName(station.getName());
        response.setTotalChargers(station.getTotalChargers());
        response.setPricingPerKwh(station.getPricingPerKwh());
        response.setContactNumber(station.getContactNumber());

        if (station.getLocation() != null) {
            response.setAddress(station.getLocation().getAddress());
            response.setLatitude(station.getLocation().getLatitude());
            response.setLongitude(station.getLocation().getLongitude());
        }

        if (station.getChargers() != null) {
            response.setChargers(station.getChargers().stream()
                    .map(this::mapChargerToDto)
                    .collect(Collectors.toList()));
        } else {
            response.setChargers(Collections.emptyList());
        }

        availabilityRepository.findByStationId(station.getId())
                .ifPresent(a -> response.setAvailableSlots(a.getAvailableSlots()));

        return response;
    }

    private ChargerDto mapChargerToDto(Charger charger) {
        ChargerDto dto = new ChargerDto();
        dto.setId(charger.getId());
        dto.setStatus(charger.getStatus());
        dto.setConnectorType(charger.getConnectorType());
        return dto;
    }
}
