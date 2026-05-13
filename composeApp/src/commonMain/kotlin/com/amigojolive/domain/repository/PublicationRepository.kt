package com.amigojolive.domain.repository

import com.amigojolive.core.network.ApiResult
import com.amigojolive.core.network.ApiService
import com.amigojolive.domain.model.Publication
import com.amigojolive.domain.model.PublicationRequest

class PublicationRepository(private val apiService: ApiService) {

    suspend fun getPublications(): ApiResult<List<Publication>> = apiService.getPublications()

    suspend fun getById(id: Int): ApiResult<Publication> = apiService.getPublication(id)

    suspend fun create(request: PublicationRequest): ApiResult<Publication> =
        apiService.createPublication(request)

    suspend fun update(id: Int, request: PublicationRequest): ApiResult<Publication> =
        apiService.updatePublication(id, request)

    suspend fun delete(id: Int): ApiResult<Unit> = apiService.deletePublication(id)

    /** Filtra publicaciones propias en cliente; no hay endpoint específico en backend. */
    suspend fun getMyPublications(myUserId: Int): ApiResult<List<Publication>> {
        return when (val result = getPublications()) {
            is ApiResult.Success -> ApiResult.Success(
                result.data.filter { it.author?.id == myUserId }
            )
            is ApiResult.Error -> result
        }
    }
}
