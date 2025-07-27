package com.furEverHome.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.furEverHome.util.JwtUtil;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private JwtUtil jwtUtil;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).authorizeHttpRequests(auth -> {
			auth.requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
					.requestMatchers("/api/auth/**", "/api/admin/auth/**", "/api/superadmin/auth/**", "/api/test",
							"/api/user/pets", "/api/user/pets/{id}")
					.permitAll() // Added /api/user/pets/{id}
					.requestMatchers("/api/user/**").hasRole("USER")
					.requestMatchers("/api/admin/**").hasRole("ADMIN")
					.requestMatchers("/api/superadmin/**").hasRole("SUPERADMIN")
					.anyRequest().authenticated();
		}).addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)
				.formLogin(form -> form.disable()).httpBasic(httpBasic -> httpBasic.disable());
		return http.build();
	}
}