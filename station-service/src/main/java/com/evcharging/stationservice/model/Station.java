package com.evcharging.stationservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "stations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer totalChargers;

    private Double pricingPerKwh;

    private String contactNumber;

    @Embedded
    private Location location;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Charger> chargers;
}
