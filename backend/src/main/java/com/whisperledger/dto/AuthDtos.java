package com.whisperledger.dto;

import lombok.*;

public class AuthDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String name;
        private String email;
        private String department;
        private Integer year;
        private String password;
        private String role; // STUDENT, HOD, DEAN, GRIEVANCE_COMMITTEE, ADMIN
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private String role;
        private String department;
        private Integer year;
        private String anonymousId; // Blind pseudonym for students
    }
}
