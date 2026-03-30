package com.evcharging.stationservice.repository;

import com.evcharging.stationservice.model.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.List;

public interface StationRepository extends JpaRepository<Station, Long> {

    @NonNull
    Page<Station> findAll(@NonNull Pageable pageable);

    /**
     * Haversine formula to find stations within a given radius (in km).
     * Uses the earth's radius of 6371 km.
     */
    @Query(value = """
        SELECT * FROM stations s
        WHERE (6371 * acos(
            cos(radians(:lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(s.latitude))
        )) <= :radius
        ORDER BY (6371 * acos(
            cos(radians(:lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(s.latitude))
        )) ASC
        """, nativeQuery = true)
    List<Station> findNearbyStations(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius
    );
}
