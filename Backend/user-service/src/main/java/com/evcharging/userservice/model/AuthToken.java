package com.evcharging.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auth_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    @Column(nullable = false)
    private boolean revokedStatus;
}
