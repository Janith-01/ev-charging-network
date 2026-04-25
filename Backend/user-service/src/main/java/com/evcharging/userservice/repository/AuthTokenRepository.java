package com.evcharging.userservice.repository;
import com.evcharging.userservice.model.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);
    void deleteByUser_Id(Long userId);
}
