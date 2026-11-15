package com.resortregistry.config;

import com.resortregistry.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * API stateless bằng JWT:
     * - Public: đăng nhập/đăng ký, xem tài sản, quote + availability (trang chi tiết cần trước khi đăng nhập)
     * - ADMIN: dashboard, fees, appointments, chats, các thao tác ghi tài sản, xem toàn bộ user/booking
     * - Endpoint còn lại: chỉ cần đăng nhập, phân quyền chi tiết (owner) kiểm tra trong controller
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bookings/quote", "/api/bookings/availability").permitAll()
                        // ADMIN
                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")
                        .requestMatchers("/api/fees/**").hasRole("ADMIN")
                        .requestMatchers("/api/settings/**").hasRole("ADMIN")
                        // Lịch hẹn: user được tự đặt lịch, xem và hủy lịch của mình (controller kiểm tra ownership),
                        // các thao tác còn lại (xem toàn bộ, sửa, xóa) chỉ ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/appointments").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/appointments/customer/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/status").authenticated()
                        .requestMatchers("/api/appointments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/properties/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/transaction/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/property/**").hasRole("ADMIN")
                        .requestMatchers("/api/bookings/stats/**").hasRole("ADMIN")
                        // Chỉ cần đăng nhập (controller kiểm tra ownership chi tiết)
                        .requestMatchers("/api/users/**", "/api/bookings/**", "/api/chats/**", "/api/payments/**").authenticated()
                        // Còn lại (frontend tĩnh) mở cho tất cả
                        .anyRequest().permitAll()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                writeJson(res, HttpServletResponse.SC_UNAUTHORIZED, "Chưa đăng nhập hoặc phiên đã hết hạn"))
                        .accessDeniedHandler((req, res, e) ->
                                writeJson(res, HttpServletResponse.SC_FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"))
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeJson(HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
