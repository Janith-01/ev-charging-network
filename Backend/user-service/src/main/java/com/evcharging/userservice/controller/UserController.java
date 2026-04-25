package com.evcharging.userservice.controller;

import com.evcharging.userservice.dto.ProfileDto;
import com.evcharging.userservice.model.Profile;
import com.evcharging.userservice.model.User;
import com.evcharging.userservice.model.Vehicle;
import com.evcharging.userservice.repository.AuthTokenRepository;
import com.evcharging.userservice.repository.ProfileRepository;
import com.evcharging.userservice.repository.UserRepository;
import com.evcharging.userservice.repository.VehicleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SuppressWarnings("null")
@Validated
public class UserController {

    private final ProfileRepository profileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;

    @GetMapping
    public ResponseEntity<List<ProfileDto>> getAllProfiles() {
        List<ProfileDto> profiles = profileRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDto> getProfile(@PathVariable @Positive(message = "User id must be positive") Long id) {
        Profile profile = profileRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return ResponseEntity.ok(mapToDto(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProfile(
            @PathVariable @Positive(message = "User id must be positive") Long id,
            @Valid @RequestBody ProfileDto profileDto
    ) {
        Profile profile = profileRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        profile.setFirstName(profileDto.getFirstName());
        profile.setLastName(profileDto.getLastName());
        profile.setPhone(profileDto.getPhone());
        profile.setFavoriteStationIds(profileDto.getFavoriteStationIds());
        
        profileRepository.save(profile);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<Vehicle>> getUserVehicles(@PathVariable @Positive(message = "User id must be positive") Long id) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(id);
        return ResponseEntity.ok(vehicles);
    }

    @PostMapping("/{id}/vehicles")
    public ResponseEntity<Vehicle> addVehicle(
            @PathVariable @Positive(message = "User id must be positive") Long id,
            @Valid @RequestBody Vehicle vehicleDto
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .make(vehicleDto.getMake())
                .model(vehicleDto.getModel())
                .batteryCapacity(vehicleDto.getBatteryCapacity())
                .connectorType(vehicleDto.getConnectorType())
                .build();
                
        return ResponseEntity.ok(vehicleRepository.save(vehicle));
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<User> uploadAvatar(
            @PathVariable @Positive(message = "User id must be positive") Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            String base64Image = "data:" + contentType + ";base64," + 
                    Base64.getEncoder().encodeToString(file.getBytes());
            
            user.setProfileImageUrl(base64Image);
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> deleteUser(@PathVariable @Positive(message = "User id must be positive") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        authTokenRepository.deleteByUser_Id(id);
        vehicleRepository.deleteByUserId(id);
        profileRepository.deleteByUserId(id);
        userRepository.delete(user);

        return ResponseEntity.ok("User deleted successfully");
    }
    
    private ProfileDto mapToDto(Profile profile) {
        ProfileDto dto = new ProfileDto();
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setPhone(profile.getPhone());
        dto.setFavoriteStationIds(profile.getFavoriteStationIds());
        if (profile.getUser() != null) {
            dto.setProfileImageUrl(profile.getUser().getProfileImageUrl());
        }
        return dto;
    }
}
