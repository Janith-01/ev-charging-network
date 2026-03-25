package com.evcharging.userservice.dto;
import lombok.Data;
import java.util.List;
@Data public class ProfileDto {
    private String firstName; 
    private String lastName; 
    private String phone;
    private List<Long> favoriteStationIds;
}
