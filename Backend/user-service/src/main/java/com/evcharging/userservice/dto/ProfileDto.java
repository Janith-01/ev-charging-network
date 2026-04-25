package com.evcharging.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProfileDto {
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be at most 100 characters")
    private String lastName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9+\\-()\\s]{7,20}$", message = "Phone format is invalid")
    private String phone;

    private String profileImageUrl;

    private List<@Positive(message = "Favorite station id must be positive") Long> favoriteStationIds;
}
