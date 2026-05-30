package com.amigojolive.core.session

import kotlinx.browser.localStorage

private const val KEY_TOKEN = "amigojolive_auth_token"

actual class TokenStorage {
    actual fun getToken(): String?       = localStorage.getItem(KEY_TOKEN)
    actual fun saveToken(token: String)  { localStorage.setItem(KEY_TOKEN, token) }
    actual fun clearToken()              { localStorage.removeItem(KEY_TOKEN) }
}
