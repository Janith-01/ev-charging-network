package com.evcharging.userservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Vehicle make is required")
    @Size(max = 100, message = "Vehicle make must be at most 100 characters")
    private String make;

    @NotBlank(message = "Vehicle model is required")
    @Size(max = 100, message = "Vehicle model must be at most 100 characters")
    private String model;

    @Positive(message = "Battery capacity must be positive")
    private Double batteryCapacity;

    @NotBlank(message = "Connector type is required")
    private String connectorType;
}
