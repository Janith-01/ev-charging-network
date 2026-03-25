package com.evcharging.stationservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chargers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Charger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonBackReference
    private Station station;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargerStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectorType connectorType;
}
