package com.amigojolive.ui.home

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import com.amigojolive.core.network.ApiResult
import com.amigojolive.domain.model.Publication
import com.amigojolive.domain.model.UserSummary
import com.amigojolive.domain.repository.PublicationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeState(
    val loading: Boolean = false,
    val currentUser: UserSummary? = null,
    val myPublications: List<Publication> = emptyList(),
    val totalPublications: Int = 0,
    val tagDistribution: Map<String, Int> = emptyMap(),
    val error: String? = null,
)

class HomeViewModel(
    private val pubRepo: PublicationRepository,
    private val currentUser: UserSummary,
) : ScreenModel {

    private val _state = MutableStateFlow(HomeState(currentUser = currentUser))
    val state: StateFlow<HomeState> = _state.asStateFlow()

    init { loadDashboard() }

    fun loadDashboard() {
        screenModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val result = pubRepo.getMyPublications(currentUser.id)) {
                is ApiResult.Success -> {
                    val pubs = result.data
                    // Métricas derivadas — no hay endpoints específicos de KPIs en backend
                    val dist = pubs.flatMap { it.tags }.groupingBy { it.name }.eachCount()
                    _state.update {
                        it.copy(
                            loading = false,
                            myPublications = pubs,
                            totalPublications = pubs.size,
                            tagDistribution = dist,
                        )
                    }
                }
                is ApiResult.Error -> _state.update {
                    it.copy(loading = false, error = result.message)
                }
            }
        }
    }
}
