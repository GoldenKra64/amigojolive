package com.amigojolive.core.network

import kotlinx.serialization.Serializable

/**
 * Envoltorio estándar del backend (api.response.js):
 *   { success, statusCode, message, data }
 */
@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val statusCode: Int,
    val message: String,
    val data: T? = null,
)

/** Resultado tipado que las pantallas y ViewModels consumen. */
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val code: Int = 0) : ApiResult<Nothing>()
}

/**
 * Desenvuelve ApiResponse<T>: si success==true y data!=null devuelve Success;
 * si success==false o data es null devuelve Error con el message del backend.
 */
fun <T> ApiResponse<T>.unwrap(): ApiResult<T> =
    if (success && data != null) ApiResult.Success(data)
    else ApiResult.Error(message.ifBlank { "Error desconocido" }, statusCode)
