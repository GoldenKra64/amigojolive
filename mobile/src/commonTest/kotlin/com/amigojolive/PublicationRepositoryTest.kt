package com.amigojolive

import com.amigojolive.core.network.ApiResponse
import com.amigojolive.core.network.ApiService
import com.amigojolive.domain.model.Publication
import com.amigojolive.domain.repository.PublicationRepository
import com.amigojolive.core.network.ApiResult
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.*
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlin.test.Test
import kotlin.test.assertIs
import kotlin.test.assertEquals

class PublicationRepositoryTest {

    private fun mockClient(responseBody: String, status: HttpStatusCode = HttpStatusCode.OK): HttpClient {
        return HttpClient(MockEngine) {
            engine {
                addHandler { _ ->
                    respond(
                        content = responseBody,
                        status = status,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                }
            }
            install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
        }
    }

    @Test
    fun `getAll devuelve Success con lista de publicaciones`() = runTest {
        val pubs = listOf(
            Publication(id = 1, title = "Test", content = "Contenido"),
        )
        val body = Json.encodeToString(ApiResponse(success = true, statusCode = 200, message = "OK", data = pubs))
        val client = mockClient(body)
        val service = ApiService(client)
        val repo    = PublicationRepository(service)

        val result = repo.getAll()
        assertIs<ApiResult.Success<List<Publication>>>(result)
        assertEquals(1, result.data.size)
        assertEquals("Test", result.data.first().title)
    }

    @Test
    fun `getAll devuelve Error cuando backend retorna success=false`() = runTest {
        val body = Json.encodeToString(
            ApiResponse<List<Publication>>(success = false, statusCode = 401, message = "No autorizado", data = null)
        )
        val client = mockClient(body)
        val service = ApiService(client)
        val repo    = PublicationRepository(service)

        val result = repo.getAll()
        assertIs<ApiResult.Error>(result)
        assertEquals("No autorizado", result.message)
    }

    @Test
    fun `myPublications filtra por author id`() = runTest {
        val pubs = listOf(
            Publication(id = 1, title = "Mía",     content = "…", author = com.amigojolive.domain.model.PublicationAuthor(id = 42, role = "docente")),
            Publication(id = 2, title = "Ajena",   content = "…", author = com.amigojolive.domain.model.PublicationAuthor(id = 99, role = "docente")),
        )
        val body = Json.encodeToString(ApiResponse(success = true, statusCode = 200, message = "OK", data = pubs))
        val client = mockClient(body)
        val service = ApiService(client)
        val repo    = PublicationRepository(service)

        val result = repo.getMyPublications(myUserId = 42)
        assertIs<ApiResult.Success<List<Publication>>>(result)
        assertEquals(1, result.data.size)
        assertEquals("Mía", result.data.first().title)
    }
}
