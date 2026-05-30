package com.amigojolive.ui.publications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import com.amigojolive.domain.model.Category
import com.amigojolive.domain.model.PublicationRequest
import com.amigojolive.ui.components.AmigojoButton
import com.amigojolive.ui.components.AmigojoTextField
import com.amigojolive.ui.components.AmigojoSnackbarHost

/**
 * Pantalla de creación/edición de publicaciones.
 *
 * Validación alineada al DTO backend (publication.dto.js):
 *   - title: max 150 caracteres, requerido
 *   - content: requerido
 *   - tags: array de ids de categoría
 *   - files: multipart vía Ktor submitFormWithBinaryData
 *
 * Para la selección de archivos: pendiente integrar FileKit o Peekaboo
 * (librerías KMP recomendadas en el plan) en función de la versión disponible.
 * El backend acepta el campo "files" como array multipart.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditPublicationContent(
    publicationId: Int?,
    viewModel: PublicationsViewModel,
) {
    val navigator   = LocalNavigator.currentOrThrow
    val state       by viewModel.state.collectAsState()
    val snackbar    = remember { SnackbarHostState() }
    val isEdit      = publicationId != null

    var title       by remember { mutableStateOf("") }
    var content     by remember { mutableStateOf("") }
    var isAnonymous by remember { mutableStateOf(false) }
    var selectedTags by remember { mutableStateOf(setOf<Int>()) }

    // Pre-cargar datos si es edición
    LaunchedEffect(publicationId, state.selectedPublication) {
        if (isEdit && state.selectedPublication?.id == publicationId) {
            state.selectedPublication?.let { pub ->
                title       = pub.title
                content     = pub.content
                isAnonymous = pub.isAnonymous
                selectedTags = pub.tags.map { it.id }.toSet()
            }
        }
    }

    LaunchedEffect(isEdit) {
        if (isEdit) viewModel.loadDetail(publicationId!!)
    }

    LaunchedEffect(state.actionSuccess) {
        state.actionSuccess?.let {
            snackbar.showSnackbar(it)
            viewModel.clearMessages()
            navigator.pop()
        }
    }

    LaunchedEffect(state.error) {
        state.error?.let {
            snackbar.showSnackbar(it)
            viewModel.clearMessages()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEdit) "Editar publicación" else "Nueva publicación") },
                navigationIcon = {
                    IconButton(onClick = { navigator.pop() }) { Icon(Icons.Default.ArrowBack, null) }
                },
            )
        },
        snackbarHost = { AmigojoSnackbarHost(snackbar) },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
        ) {
            item {
                AmigojoTextField(
                    value = title,
                    onValueChange = { if (it.length <= 150) title = it },
                    label = "Título (máx. 150 caracteres)",
                    isError = title.isBlank(),
                    supportingText = "${title.length}/150",
                )
            }

            item {
                AmigojoTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = "Contenido",
                    singleLine = false,
                    isError = content.isBlank(),
                    modifier = Modifier.heightIn(min = 120.dp),
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Publicar de forma anónima", style = MaterialTheme.typography.bodyMedium)
                    Switch(checked = isAnonymous, onCheckedChange = { isAnonymous = it })
                }
            }

            if (state.categories.isNotEmpty()) {
                item {
                    Text("Etiquetas", style = MaterialTheme.typography.titleSmall)
                    Spacer(Modifier.height(8.dp))
                    CategoryChips(
                        categories = state.categories,
                        selectedIds = selectedTags,
                        onToggle = { id ->
                            selectedTags = if (id in selectedTags) selectedTags - id
                            else selectedTags + id
                        },
                    )
                }
            }

            // TODO: integrar FileKit / Peekaboo para selección de archivos multiplataforma.
            // Por ahora se muestra un placeholder informativo; la lógica de multipart
            // con Ktor submitFormWithBinaryData está lista en ApiService.kt.
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Row(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Icon(Icons.Default.AttachFile, null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "Adjuntar archivos — integrar FileKit/Peekaboo en próxima iteración",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            item {
                AmigojoButton(
                    text = if (isEdit) "Guardar cambios" else "Publicar",
                    loading = state.loading,
                    enabled = title.isNotBlank() && content.isNotBlank(),
                    onClick = {
                        val request = PublicationRequest(
                            title = title.trim(),
                            content = content.trim(),
                            isAnonymous = isAnonymous,
                            tagIds = selectedTags.toList(),
                        )
                        if (isEdit) viewModel.update(publicationId!!, request)
                        else        viewModel.publishPost(request)
                    },
                )
            }
        }
    }
}

@Composable
private fun CategoryChips(
    categories: List<Category>,
    selectedIds: Set<Int>,
    onToggle: (Int) -> Unit,
) {
    @OptIn(ExperimentalLayoutApi::class)
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        categories.forEach { cat ->
            FilterChip(
                selected = cat.id in selectedIds,
                onClick  = { onToggle(cat.id) },
                label    = { Text(cat.name) },
            )
        }
    }
}
