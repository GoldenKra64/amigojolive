package com.amigojolive.core.network

import com.amigojolive.core.session.TokenStorage
import io.ktor.client.HttpClientConfig
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

/** Configuración compartida de plugins Ktor aplicada por las factorías de plataforma. */
fun HttpClientConfig<*>.applyCommonConfig(tokenStorage: TokenStorage) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            isLenient = true
            encodeDefaults = true
            explicitNulls = false
        })
    }

    install(Auth) {
        bearer {
            loadTokens {
                val token = tokenStorage.getToken() ?: return@loadTokens null
                BearerTokens(token, "")
            }
            // No refresh: cuando el token expira el backend devuelve 401
            // y el repositorio lo propaga como ApiResult.Error.
        }
    }

    install(Logging) { level = LogLevel.INFO }
}
