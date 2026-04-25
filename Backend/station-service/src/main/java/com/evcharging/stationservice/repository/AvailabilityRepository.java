package com.evcharging.stationservice.repository;

import com.evcharging.stationservice.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    Optional<Availability> findByStationId(Long stationId);
    void deleteByStationId(Long stationId);
}
