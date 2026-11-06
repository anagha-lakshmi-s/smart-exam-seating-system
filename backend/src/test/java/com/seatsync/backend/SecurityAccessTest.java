
package com.seatsync.backend;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.seatsync.backend.service.SeatLookupService;
import com.seatsync.backend.service.StudentService;

@SpringBootTest(properties = {
        "seatiq.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
@AutoConfigureMockMvc
class SecurityAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentService studentService;

    @MockitoBean
    private SeatLookupService seatLookupService;

    @Test
    void unauthenticatedUserCannotAccessStudents() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/students")
                .with(jwt().authorities(
                        new SimpleGrantedAuthority("ROLE_STUDENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessStudentManagement() throws Exception {
        when(studentService.getAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/students")
                .with(jwt().authorities(
                        new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    void studentCanAccessOwnSeatEndpoint() throws Exception {
        mockMvc.perform(get("/api/seating/me")
                .with(jwt()
                        .jwt(token -> token.subject("STU001"))
                        .authorities(
                                new SimpleGrantedAuthority("ROLE_STUDENT"))))
                .andExpect(status().isOk());

        verify(seatLookupService).findMySeat("STU001");
    }

    @Test
    void adminCannotAccessStudentOnlySeatEndpoint() throws Exception {
        mockMvc.perform(get("/api/seating/me")
                .with(jwt().authorities(
                        new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden());
    }
}
