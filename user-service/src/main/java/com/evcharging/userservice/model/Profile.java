package com.evcharging.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile {
    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String firstName;
    private String lastName;
    private String phone;

    @ElementCollection
    @CollectionTable(name = "user_favorite_stations", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "station_id")
    private List<Long> favoriteStationIds;
}
