package com.amigojolive

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.CanvasBasedWindow
import com.amigojolive.core.session.TokenStorage

/**
 * Punto de entrada web (jsMain).
 * Compose Multiplatform renderiza la UI en un elemento <canvas> del DOM.
 *
 * Para producción: `./gradlew jsBrowserDistribution` genera el bundle JS
 * que puede alojarse en cualquier hosting estático (S3, Netlify, Vercel…).
 */
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    CanvasBasedWindow(
        title = "AmigojoLive",
        canvasElementId = "ComposeTarget"
    ) {
        App(TokenStorage())
    }
}
