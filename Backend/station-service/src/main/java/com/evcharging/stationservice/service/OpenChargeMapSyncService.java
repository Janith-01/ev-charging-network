package com.evcharging.stationservice.service;

import com.evcharging.stationservice.dto.ChargerDto;
import com.evcharging.stationservice.dto.StationRequest;
import com.evcharging.stationservice.dto.ocm.OcmStationDto;
import com.evcharging.stationservice.model.ChargerStatus;
import com.evcharging.stationservice.model.ConnectorType;
import com.evcharging.stationservice.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenChargeMapSyncService implements CommandLineRunner {

    private final StationRepository stationRepository;
    private final StationService stationService;

    @Value("${openchargemap.api-key:e0ecfd81-2250-4f0f-8ed7-64d72d11fe25}")
    private String apiKey;

    private static final String OCM_API_URL = "https://api.openchargemap.io/v3/poi?countrycode=LK&maxresults=1000";

    @Override
    public void run(String... args) {
        if (stationRepository.count() > 0) {
            log.info("Stations already exist in database. OpenChargeMap sync skipped.");
            return;
        }

        log.info("Station database is empty. Beginning OpenChargeMap synchronization...");
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-API-Key", apiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<OcmStationDto[]> response = restTemplate.exchange(
                    OCM_API_URL, HttpMethod.GET, entity, OcmStationDto[].class);

            if (response.getBody() == null || response.getBody().length == 0) {
                log.warn("OpenChargeMap API returned empty results.");
                return;
            }

            int count = 0;
            for (OcmStationDto ocmStation : response.getBody()) {
                if (ocmStation.getAddressInfo() == null) continue;

                StationRequest request = new StationRequest();
                request.setName(ocmStation.getAddressInfo().getTitle());
                request.setAddress(ocmStation.getAddressInfo().getAddressLine1());
                request.setLatitude(ocmStation.getAddressInfo().getLatitude());
                request.setLongitude(ocmStation.getAddressInfo().getLongitude());
                request.setContactNumber("N/A"); // Default fallback

                // Parse usage cost
                double pricing = 75.0; // Default LKR
                if (ocmStation.getUsageCost() != null && !ocmStation.getUsageCost().isEmpty()) {
                    try {
                        String costStr = ocmStation.getUsageCost().replaceAll("[^\\d.]", "");
                        if (!costStr.isEmpty()) {
                            pricing = Double.parseDouble(costStr);
                        }
                    } catch (Exception e) {
                        log.debug("Failed to parse pricing, using default 75.0: {}", ocmStation.getUsageCost());
                    }
                }
                request.setPricingPerKwh(pricing);

                // Build Chargers
                List<ChargerDto> chargerDtos = new ArrayList<>();
                if (ocmStation.getConnections() != null && !ocmStation.getConnections().isEmpty()) {
                    for (OcmStationDto.Connection conn : ocmStation.getConnections()) {
                        ConnectorType type = ConnectorType.TYPE_2; // Default
                        if (conn.getLevel() != null && Boolean.TRUE.equals(conn.getLevel().getIsFastChargeCapable())) {
                            type = ConnectorType.CCS;
                        }
                        ChargerDto chargerDto = new ChargerDto();
                        chargerDto.setConnectorType(type);
                        chargerDto.setStatus(ChargerStatus.AVAILABLE);
                        chargerDtos.add(chargerDto);
                    }
                } else {
                    // Fallback to exactly 1 standard charger if no connections array is present
                    ChargerDto fallback = new ChargerDto();
                    fallback.setConnectorType(ConnectorType.TYPE_2);
                    fallback.setStatus(ChargerStatus.AVAILABLE);
                    chargerDtos.add(fallback);
                }

                request.setChargers(chargerDtos);
                request.setTotalChargers(chargerDtos.size());

                // Save transitionally via StationService
                stationService.createStation(request);
                count++;
            }

            log.info("Successfully synced {} stations from OpenChargeMap.", count);

        } catch (Exception e) {
            log.error("Failed to sync stations from OpenChargeMap: {}", e.getMessage(), e);
        }
    }
}
