package com.evcharging.userservice.dto;
import lombok.Data;
import java.util.List;
@Data public class ProfileDto {
    private String firstName; 
    private String lastName; 
    private String phone;
    private String profileImageUrl;
    private List<Long> favoriteStationIds;
}
