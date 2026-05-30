package com.amigojolive.core.session

/**
 * Almacenamiento del JWT por plataforma.
 *   Android → EncryptedSharedPreferences (actual en androidMain)
 *   Web     → localStorage                (actual en jsMain)
 */
expect class TokenStorage {
    fun getToken(): String?
    fun saveToken(token: String)
    fun clearToken()
}
