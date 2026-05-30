package com.amigojolive.domain.repository

import com.amigojolive.core.network.ApiResult
import com.amigojolive.core.network.ApiService
import com.amigojolive.domain.model.Category
import com.amigojolive.domain.model.CategoryRequest

class CategoryRepository(private val apiService: ApiService) {
    suspend fun getAll(): ApiResult<List<Category>> = apiService.getCategories()
    suspend fun create(name: String): ApiResult<Category> = apiService.createCategory(CategoryRequest(name))
    suspend fun update(id: Int, name: String): ApiResult<Category> = apiService.updateCategory(id, CategoryRequest(name))
    suspend fun delete(id: Int): ApiResult<Unit> = apiService.deleteCategory(id)
}
