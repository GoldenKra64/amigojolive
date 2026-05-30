package com.amigojolive

import com.amigojolive.core.network.ApiResponse
import com.amigojolive.core.network.ApiResult
import com.amigojolive.core.network.unwrap
import kotlin.test.Test
import kotlin.test.assertIs
import kotlin.test.assertEquals

class ApiResponseTest {

    @Test
    fun `unwrap devuelve Success cuando success=true y data no nulo`() {
        val response = ApiResponse(success = true, statusCode = 200, message = "OK", data = "valor")
        val result = response.unwrap()
        assertIs<ApiResult.Success<String>>(result)
        assertEquals("valor", result.data)
    }

    @Test
    fun `unwrap devuelve Error cuando success=false`() {
        val response = ApiResponse<String>(success = false, statusCode = 401, message = "No autorizado", data = null)
        val result = response.unwrap()
        assertIs<ApiResult.Error>(result)
        assertEquals("No autorizado", result.message)
        assertEquals(401, result.code)
    }

    @Test
    fun `unwrap devuelve Error cuando data es null aunque success=true`() {
        val response = ApiResponse<String>(success = true, statusCode = 200, message = "Sin datos", data = null)
        val result = response.unwrap()
        assertIs<ApiResult.Error>(result)
    }
}
