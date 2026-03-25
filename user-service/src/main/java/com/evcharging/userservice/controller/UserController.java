package com.evcharging.userservice.controller;

import com.evcharging.userservice.dto.ProfileDto;
import com.evcharging.userservice.model.Profile;
import com.evcharging.userservice.model.Vehicle;
import com.evcharging.userservice.repository.ProfileRepository;
import com.evcharging.userservice.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ProfileRepository profileRepository;
    private final VehicleRepository vehicleRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDto> getProfile(@PathVariable Long id) {
        Profile profile = profileRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return ResponseEntity.ok(mapToDto(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProfile(@PathVariable Long id, @RequestBody ProfileDto profileDto) {
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
    public ResponseEntity<List<Vehicle>> getUserVehicles(@PathVariable Long id) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(id);
        return ResponseEntity.ok(vehicles);
    }
    
    private ProfileDto mapToDto(Profile profile) {
        ProfileDto dto = new ProfileDto();
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setPhone(profile.getPhone());
        dto.setFavoriteStationIds(profile.getFavoriteStationIds());
        return dto;
    }
}
