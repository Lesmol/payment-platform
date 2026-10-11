package com.lvmp.authservice.controller;

import com.lvmp.authservice.model.request.LoginRequest;
import com.lvmp.authservice.model.request.RefreshRequest;
import com.lvmp.authservice.model.response.LoginResponse;
import com.lvmp.authservice.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/v1")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login-with-password")
    ResponseEntity<LoginResponse> loginWithPassword(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok().body(authenticationService.loginWithPassword(request));
    }

    @PostMapping("/sign-up")
    ResponseEntity<Void> signUp(@RequestBody @Valid LoginRequest request) {
        authenticationService.signUp(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    ResponseEntity<LoginResponse> refresh(@RequestBody @Valid RefreshRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authenticationService.refresh(request));
    }
}
