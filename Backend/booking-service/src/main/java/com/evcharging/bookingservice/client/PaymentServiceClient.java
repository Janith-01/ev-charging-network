package com.evcharging.bookingservice.client;

import com.evcharging.bookingservice.dto.PaymentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "payment-service",
        url = "${feign.payment-service.url}"
)
public interface PaymentServiceClient {

    @PostMapping("/api/payments")
    Object createPayment(@RequestBody PaymentRequest request);
}
