package com.amigojolive.core.session

import com.amigojolive.domain.model.UserSummary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Estado de sesión global accesible desde cualquier Screen.
 * Se actualiza tras login exitoso y se limpia en logout.
 */
object SessionStore {
    private val _currentUser = MutableStateFlow<UserSummary?>(null)
    val currentUser: StateFlow<UserSummary?> = _currentUser.asStateFlow()

    fun setUser(user: UserSummary) { _currentUser.value = user }
    fun clear()                    { _currentUser.value = null }
    fun getUser(): UserSummary?    = _currentUser.value
}
