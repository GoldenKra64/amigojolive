package com.amigojolive.ui.publications

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import com.amigojolive.core.network.ApiResult
import com.amigojolive.domain.model.*
import com.amigojolive.domain.repository.CategoryRepository
import com.amigojolive.domain.repository.PublicationRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PublicationsState(
    val loading: Boolean = false,
    val publications: List<Publication> = emptyList(),
    val categories: List<Category> = emptyList(),
    val selectedPublication: Publication? = null,
    val error: String? = null,
    val actionSuccess: String? = null,
)

class PublicationsViewModel(
    private val pubRepo: PublicationRepository,
    private val catRepo: CategoryRepository,
    private val currentUserId: Int,
) : ScreenModel {

    private val _state = MutableStateFlow(PublicationsState())
    val state: StateFlow<PublicationsState> = _state.asStateFlow()

    init {
        loadFeed()
        loadCategories()
    }

    fun loadFeed() {
        screenModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val r = pubRepo.getPublications()) {
                is ApiResult.Success -> _state.update { it.copy(loading = false, publications = r.data) }
                is ApiResult.Error   -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    fun loadDetail(id: Int) {
        screenModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val r = pubRepo.getById(id)) {
                is ApiResult.Success -> _state.update { it.copy(loading = false, selectedPublication = r.data) }
                is ApiResult.Error   -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    fun create(request: PublicationRequest) {
        screenModelScope.launch {
            _state.update { it.copy(loading = true) }
            when (val r = pubRepo.create(request)) {
                is ApiResult.Success -> {
                    _state.update { it.copy(loading = false, actionSuccess = "Publicación creada") }
                    loadFeed()
                }
                is ApiResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    fun update(id: Int, request: PublicationRequest) {
        screenModelScope.launch {
            _state.update { it.copy(loading = true) }
            when (val r = pubRepo.update(id, request)) {
                is ApiResult.Success -> {
                    _state.update { it.copy(loading = false, actionSuccess = "Publicación actualizada") }
                    loadFeed()
                }
                is ApiResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    fun delete(id: Int) {
        screenModelScope.launch {
            _state.update { it.copy(loading = true) }
            when (val r = pubRepo.delete(id)) {
                is ApiResult.Success -> {
                    _state.update { st -> st.copy(
                        loading = false,
                        actionSuccess = "Publicación eliminada",
                        publications = st.publications.filter { it.id != id },
                    )}
                }
                is ApiResult.Error -> _state.update { it.copy(loading = false, error = r.message) }
            }
        }
    }

    private fun loadCategories() {
        screenModelScope.launch {
            when (val r = catRepo.getAll()) {
                is ApiResult.Success -> _state.update { it.copy(categories = r.data) }
                else -> Unit
            }
        }
    }

    fun myPublications() = _state.value.publications.filter { it.author?.id == currentUserId }

    fun clearMessages() = _state.update { it.copy(error = null, actionSuccess = null) }
}
