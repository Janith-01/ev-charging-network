package com.evcharging.userservice.controller;

import com.evcharging.userservice.dto.AuthRequest;
import com.evcharging.userservice.dto.AuthResponse;
import com.evcharging.userservice.dto.RegisterRequest;
import com.evcharging.userservice.model.AuthToken;
import com.evcharging.userservice.model.Profile;
import com.evcharging.userservice.model.User;
import com.evcharging.userservice.repository.AuthTokenRepository;
import com.evcharging.userservice.repository.ProfileRepository;
import com.evcharging.userservice.repository.UserRepository;
import com.evcharging.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .build();
        User savedUser = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .build();
        profileRepository.save(profile);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        AuthToken authToken = AuthToken.builder()
                .user(user)
                .token(jwtToken)
                .revokedStatus(false)
                .build();
        authTokenRepository.save(authToken);

        return ResponseEntity.ok(new AuthResponse(jwtToken));
    }
}
