package com.evcharging.bookingservice.repository;

import com.evcharging.bookingservice.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
}
