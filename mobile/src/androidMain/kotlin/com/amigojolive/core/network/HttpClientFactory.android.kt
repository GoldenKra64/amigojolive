package com.amigojolive.core.network

import com.amigojolive.core.session.TokenStorage
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp

actual fun createHttpClient(tokenStorage: TokenStorage): HttpClient =
    HttpClient(OkHttp) { applyCommonConfig(tokenStorage) }
