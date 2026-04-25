package com.evcharging.stationservice.repository;

import com.evcharging.stationservice.model.Charger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);
    void deleteByStationId(Long stationId);
}
