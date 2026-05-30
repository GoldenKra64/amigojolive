package com.amigojolive.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary          = AmigojoBlue,
    onPrimary        = AmigojoOnPrimary,
    primaryContainer = AmigojoLightBlue,
    secondary        = AmigojoAccent,
    background       = AmigojoBackground,
    surface          = AmigojoSurface,
    error            = AmigojoError,
    outline          = AmigojoOutline,
)

private val DarkColorScheme = darkColorScheme(
    primary          = AmigojoLightBlue,
    onPrimary        = AmigojoBlue,
    primaryContainer = AmigojoAccent,
    secondary        = AmigojoLightBlue,
    background       = Color_DarkBg,
    surface          = Color_DarkSurface,
    error            = Color_DarkError,
)

@Composable
expect fun AmigojoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
)

/** Tema base sin color dinámico: funciona en todos los targets. */
@Composable
fun AmigojoBaseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    colorScheme: ColorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = colorScheme,
        typography  = AmigojoTypography,
        content     = content,
    )
}
