package com.amigojolive.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Payload enviado a POST /auth/login */
@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

/** Respuesta de POST /auth/login → ApiResponse.data */
@Serializable
data class AuthData(
    val token: String,
    val user: UserSummary,
)

/**
 * Respuesta de GET /auth/me → ApiResponse.data
 * También se usa como proyección embebida en otras respuestas.
 */
@Serializable
data class UserSummary(
    val id: Int,
    val email: String,
    val role: String? = null,          // "docente" | "admin" | "moderador"
    val isActive: Boolean,
    val profile: ProfileSummary? = null,
)

@Serializable
data class ProfileSummary(
    val id: Int,
    val fullName: String?,
    val area: String?,
    val description: String?,
    val photoUrl: String?,
)

@Serializable
data class ApiResponse<T>(
    val status: String? = null,
    val data: T? = null,
    val message: String? = null
)