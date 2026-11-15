package com.resortregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiSecurityAndBookingFlowTests {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        private String registerAndLogin(String emailPrefix) throws Exception {
                long nonce = System.nanoTime();
                String body = """
                                {"name":"Test User","email":"%s%d@test.vn","phone":"090%d","cmnd":"%s","address":"Ha Noi","password":"test123"}
                                """
                                .formatted(emailPrefix, nonce % 100000, nonce % 10000000,
                                                String.valueOf(nonce).substring(0, 12));

                String response = mockMvc.perform(post("/api/auth/register")
                                .contentType("application/json")
                                .content(body))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token").isNotEmpty())
                                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);

                JsonNode node = objectMapper.readTree(response);
                return node.get("token").asText();
        }

        private String adminToken() throws Exception {
                String response = mockMvc.perform(post("/api/auth/login")
                                .contentType("application/json")
                                .content("{\"email\":\"admin@resortregistry.vn\",\"password\":\"admin123\"}"))
                                .andExpect(status().isOk())
                                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
                return objectMapper.readTree(response).get("token").asText();
        }

        @Test
        void publicEndpoints_accessibleWithoutToken() throws Exception {
                mockMvc.perform(get("/api/properties")).andExpect(status().isOk());
                mockMvc.perform(get("/api/bookings/quote?propertyId=1&months=3")).andExpect(status().isOk());
                mockMvc.perform(get("/api/bookings/availability?propertyId=1&startDate=2030-05-01&months=2"))
                                .andExpect(status().isOk());
        }

        @Test
        void protectedEndpoints_requireToken() throws Exception {
                mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
                mockMvc.perform(get("/api/bookings/user/1")).andExpect(status().isUnauthorized());
        }

        @Test
        void adminEndpoints_forbiddenForNormalUser() throws Exception {
                String token = registerAndLogin("user");
                mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
                                .andExpect(status().isForbidden());
                mockMvc.perform(get("/api/dashboard/stats").header("Authorization", "Bearer " + token))
                                .andExpect(status().isForbidden());
                mockMvc.perform(get("/api/fees").header("Authorization", "Bearer " + token))
                                .andExpect(status().isForbidden());
        }

        @Test
        void adminEndpoints_allowedForAdmin() throws Exception {
                String token = adminToken();
                mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
                                .andExpect(status().isOk());
                mockMvc.perform(get("/api/dashboard/stats").header("Authorization", "Bearer " + token))
                                .andExpect(status().isOk());
        }

        @Test
        void normalUser_cannotEditAnotherUser() throws Exception {
                String token = registerAndLogin("promote");
                // PUT lên user seed (id 1) — không phải owner → 403
                mockMvc.perform(MockMvcRequestBuilders
                                .put("/api/users/1")
                                .header("Authorization", "Bearer " + token)
                                .contentType("application/json")
                                .content("{\"name\":\"X\",\"email\":\"x@x.vn\",\"phone\":\"0900000000\",\"cmnd\":\"000000000000\",\"address\":\"X\",\"role\":\"ADMIN\",\"status\":\"ACTIVE\"}"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void fullBookingFlow_register_quote_create_pay() throws Exception {
                String token = registerAndLogin("flow");
                String auth = "Bearer " + token;

                // 1. Báo giá server-side: 85×2 = 170, phí 5% = 8.5, cọc 1 tháng = 85, tổng
                // 263.5
                mockMvc.perform(get("/api/bookings/quote?propertyId=1&months=2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.basePrice").value(170.0))
                                .andExpect(jsonPath("$.processingFee").value(8.5))
                                .andExpect(jsonPath("$.deposit").value(85.0))
                                .andExpect(jsonPath("$.total").value(263.5));

                // 2. Tạo đặt chỗ — giá gửi từ client (totalPrice=1) phải bị bỏ qua
                String bookingBody = """
                                {"userId":999,"propertyId":1,"months":2,"startDate":"2030-06-01","paymentMethod":"Thẻ tín dụng","totalPrice":1}
                                """;
                String bookingResponse = mockMvc.perform(post("/api/bookings")
                                .header("Authorization", auth)
                                .contentType("application/json")
                                .content(bookingBody))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalPrice").value(263.5))
                                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
                long bookingId = objectMapper.readTree(bookingResponse).get("id").asLong();

                // 3. Thanh toán
                mockMvc.perform(post("/api/payments")
                                .header("Authorization", auth)
                                .contentType("application/json")
                                .content("{\"bookingId\":" + bookingId + ",\"method\":\"Thẻ tín dụng\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("SUCCESS"))
                                .andExpect(jsonPath("$.reference").isNotEmpty());

                // 4. Thanh toán lần nữa phải bị chặn
                mockMvc.perform(post("/api/payments")
                                .header("Authorization", auth)
                                .contentType("application/json")
                                .content("{\"bookingId\":" + bookingId + ",\"method\":\"Thẻ tín dụng\"}"))
                                .andExpect(status().isBadRequest());

                // 5. Đặt trùng lịch phải bị chặn
                mockMvc.perform(post("/api/bookings")
                                .header("Authorization", auth)
                                .contentType("application/json")
                                .content("{\"userId\":999,\"propertyId\":1,\"months\":2,\"startDate\":\"2030-07-01\"}"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void refund_adminOnly() throws Exception {
                // User thường gọi refund phải bị 403
                String token = registerAndLogin("refund");
                mockMvc.perform(post("/api/payments/booking/1/refund")
                                .header("Authorization", "Bearer " + token))
                                .andExpect(status().isForbidden());

                // Admin refund booking chưa thanh toán → 400 (không có giao dịch thành công)
                String admin = "Bearer " + adminToken();
                mockMvc.perform(post("/api/payments/booking/6/refund").header("Authorization", admin))
                                .andExpect(status().isBadRequest());
        }
}
