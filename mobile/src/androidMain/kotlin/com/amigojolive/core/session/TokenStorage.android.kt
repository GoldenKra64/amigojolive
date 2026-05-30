package com.amigojolive.core.session

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

private const val PREFS_FILE = "amigojolive_prefs"
private const val KEY_TOKEN   = "auth_token"

actual class TokenStorage(private val context: Context) {

    private val prefs: SharedPreferences by lazy {
        runCatching {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                context,
                PREFS_FILE,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
            )
        }.getOrElse {
            // Fallback sin cifrado si el dispositivo no admite EncryptedSharedPreferences.
            context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
        }
    }

    actual fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    actual fun saveToken(token: String) = prefs.edit().putString(KEY_TOKEN, token).apply()

    actual fun clearToken() = prefs.edit().remove(KEY_TOKEN).apply()
}
