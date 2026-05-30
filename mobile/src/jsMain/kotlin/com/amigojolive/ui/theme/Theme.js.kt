package com.amigojolive.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable

/**
 * Tema web: no hay color dinámico del SO, se usa siempre la paleta semilla de marca.
 */
@Composable
actual fun AmigojoTheme(
    darkTheme: Boolean,
    content: @Composable () -> Unit,
) {
    AmigojoBaseTheme(darkTheme = darkTheme, content = content)
}
