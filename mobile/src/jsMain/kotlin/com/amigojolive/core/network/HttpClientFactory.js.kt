package com.amigojolive.core.network

import com.amigojolive.core.session.TokenStorage
import io.ktor.client.HttpClient
import io.ktor.client.engine.js.Js

actual fun createHttpClient(tokenStorage: TokenStorage): HttpClient =
    HttpClient(Js) { applyCommonConfig(tokenStorage) }
