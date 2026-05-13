package com.amigojolive.core.network

import com.amigojolive.domain.model.*
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.http.*

/** URL base de la API. Debe apuntar al backend en cada entorno. */
const val BASE_URL = "https://amigojolive-production.up.railway.app/api/v1"

/** Servicio de red: envuelve llamadas Ktor y desenvuelve ApiResponse. */
class ApiService(private val client: HttpClient) {

    // ─── Auth ──────────────────────────────────────────────────────────────

    suspend fun login(request: LoginRequest): ApiResult<AuthData> = safeCall {
        client.post("$BASE_URL/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body<ApiResponse<AuthData>>().unwrap()
    }

    suspend fun registerRequest(request: RegisterRequest): ApiResult<Unit> = safeCall {
        client.post("$BASE_URL/auth/register-request") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body<ApiResponse<Unit>>().unwrap()
    }

    suspend fun getMe(): ApiResult<UserSummary> = safeCall {
        client.get("$BASE_URL/auth/me").body<ApiResponse<UserSummary>>().unwrap()
    }

    // ─── Perfil ─────────────────────────────────────────────────────────────

    suspend fun getProfile(): ApiResult<ProfileSummary> = safeCall {
        client.get("$BASE_URL/profiles/me").body<ApiResponse<ProfileSummary>>().unwrap()
    }

    suspend fun updateProfile(request: UpdateProfileRequest): ApiResult<ProfileSummary> = safeCall {
        client.patch("$BASE_URL/profiles/me") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body<ApiResponse<ProfileSummary>>().unwrap()
    }

    // ─── Publicaciones ───────────────────────────────────────────────────────

    suspend fun getPublications(): ApiResult<List<Publication>> = safeCall {
        client.get("$BASE_URL/publications").body<ApiResponse<List<Publication>>>().unwrap()
    }

    suspend fun getPublication(id: Int): ApiResult<Publication> = safeCall {
        client.get("$BASE_URL/publications/$id").body<ApiResponse<Publication>>().unwrap()
    }

    suspend fun createPublication(request: PublicationRequest): ApiResult<Publication> = safeCall {
        val response = client.submitFormWithBinaryData(
            url = "$BASE_URL/publications",
            formData = buildFormData(request),
        ) { method = HttpMethod.Post }
        response.body<ApiResponse<Publication>>().unwrap()
    }

    suspend fun updatePublication(id: Int, request: PublicationRequest): ApiResult<Publication> = safeCall {
        val response = client.submitFormWithBinaryData(
            url = "$BASE_URL/publications/$id",
            formData = buildFormData(request),
        ) { method = HttpMethod.Put }
        response.body<ApiResponse<Publication>>().unwrap()
    }

    suspend fun deletePublication(id: Int): ApiResult<Unit> = safeCall {
        client.delete("$BASE_URL/publications/$id").body<ApiResponse<Unit>>().unwrap()
    }

    // ─── Categorías ──────────────────────────────────────────────────────────

    suspend fun getCategories(): ApiResult<List<Category>> = safeCall {
        client.get("$BASE_URL/categories").body<ApiResponse<List<Category>>>().unwrap()
    }

    suspend fun createCategory(request: CategoryRequest): ApiResult<Category> = safeCall {
        client.post("$BASE_URL/categories") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body<ApiResponse<Category>>().unwrap()
    }

    suspend fun updateCategory(id: Int, request: CategoryRequest): ApiResult<Category> = safeCall {
        client.put("$BASE_URL/categories/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body<ApiResponse<Category>>().unwrap()
    }

    suspend fun deleteCategory(id: Int): ApiResult<Unit> = safeCall {
        client.delete("$BASE_URL/categories/$id").body<ApiResponse<Unit>>().unwrap()
    }

    // ─── Admin usuarios ─────────────────────────────────────────────────────

    suspend fun getUsers(): ApiResult<List<AdminUser>> = safeCall {
        client.get("$BASE_URL/admin/users").body<ApiResponse<List<AdminUser>>>().unwrap()
    }

    suspend fun updateUserStatus(userId: Int, isActive: Boolean): ApiResult<Unit> = safeCall {
        client.patch("$BASE_URL/admin/users/$userId/status") {
            contentType(ContentType.Application.Json)
            setBody(UpdateUserStatusRequest(isActive))
        }.body<ApiResponse<Unit>>().unwrap()
    }

    // ─── Admin solicitudes ───────────────────────────────────────────────────

    suspend fun getRegistrationRequests(): ApiResult<List<RegistrationRequest>> = safeCall {
        client.get("$BASE_URL/admin/registration-requests")
            .body<ApiResponse<List<RegistrationRequest>>>().unwrap()
    }

    suspend fun approveRequest(id: Int): ApiResult<Unit> = safeCall {
        client.patch("$BASE_URL/admin/registration-requests/$id/approve")
            .body<ApiResponse<Unit>>().unwrap()
    }

    suspend fun rejectRequest(id: Int): ApiResult<Unit> = safeCall {
        // El controlador puede responder 204 sin cuerpo; toleramos body nulo.
        client.patch("$BASE_URL/admin/registration-requests/$id/reject")
        ApiResult.Success(Unit)
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private fun buildFormData(req: PublicationRequest) = formData {
        append("title", req.title)
        append("content", req.content)
        append("isAnonymous", req.isAnonymous.toString())
        req.tagIds.forEach { tagId -> append("tags[]", tagId.toString()) }
        req.files.forEach { file ->
            append(
                key = "files",
                value = file.bytes,
                headers = Headers.build {
                    append(HttpHeaders.ContentType, file.mimeType)
                    append(HttpHeaders.ContentDisposition,
                        "form-data; name=\"files\"; filename=\"${file.name}\"")
                },
            )
        }
    }

    private inline fun <T> safeCall(block: () -> ApiResult<T>): ApiResult<T> = try {
        block()
    } catch (e: Exception) {
        ApiResult.Error(e.message ?: "Error de red")
    }
}
