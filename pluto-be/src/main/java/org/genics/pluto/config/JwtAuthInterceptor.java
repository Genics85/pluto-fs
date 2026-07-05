package org.genics.pluto.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.util.JwtUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rejects any request that does not carry a valid app-issued JWT in the
 * {@code Authorization: Bearer <token>} header. Registered for /api/** except
 * the public auth endpoints (see WebConfig).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Let CORS preflight requests through.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token");
            return false;
        }

        String token = header.substring(7);
        if (!jwtUtil.isValid(token)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return false;
        }

        // Expose the authenticated identity to downstream controllers if needed.
        Claims claims = jwtUtil.parse(token);
        request.setAttribute("userId", claims.get("userId"));
        request.setAttribute("username", claims.getSubject());
        request.setAttribute("role", claims.get("role"));
        return true;
    }
}
