package com.amigojolive.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

/**
 * Tema Android con color dinámico (Material You) en Android 12+.
 * En versiones anteriores usa el esquema semilla de marca.
 */
@Composable
actual fun AmigojoTheme(
    darkTheme: Boolean,
    content: @Composable () -> Unit,
) {
    val context = LocalContext.current
    val colorScheme = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (darkTheme) dynamicDarkColorScheme(context)
            else           dynamicLightColorScheme(context)
        darkTheme -> darkColorScheme(
            primary = AmigojoLightBlue,
            onPrimary = AmigojoBlue,
            background = Color_DarkBg,
            surface = Color_DarkSurface,
        )
        else -> lightColorScheme(
            primary = AmigojoBlue,
            onPrimary = AmigojoOnPrimary,
            background = AmigojoBackground,
            surface = AmigojoSurface,
        )
    }
    AmigojoBaseTheme(darkTheme = darkTheme, colorScheme = colorScheme, content = content)
}
