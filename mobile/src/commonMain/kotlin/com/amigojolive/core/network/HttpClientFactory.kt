package com.amigojolive.core.network

import com.amigojolive.core.session.TokenStorage
import io.ktor.client.HttpClient

/**
 * Construye el HttpClient con el motor correcto para cada plataforma:
 *   Android → OkHttp
 *   JS      → Ktor-JS (fetch API del navegador)
 *
 * La configuración de plugins (Auth Bearer, ContentNegotiation, Logging)
 * se aplica en commonMain a través de configureHttpClient().
 */
expect fun createHttpClient(tokenStorage: TokenStorage): HttpClient
