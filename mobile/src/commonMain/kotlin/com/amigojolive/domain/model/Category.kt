package com.amigojolive.domain.model

import kotlinx.serialization.Serializable

/**
 * Elemento de GET /categories.
 * El backend opera sobre el modelo Prisma `Tag`, pero las rutas se
 * montan bajo /categories según category.routes.js.
 */
@Serializable
data class Category(
    val id: Int,
    val name: String,
)

/** Payload de POST /categories y PUT /categories/:id */
@Serializable
data class CategoryRequest(val name: String)
