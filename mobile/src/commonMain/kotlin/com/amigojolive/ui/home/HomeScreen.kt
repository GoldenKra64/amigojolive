package com.amigojolive.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import com.amigojolive.domain.model.UserSummary
import com.amigojolive.navigation.*
import com.amigojolive.ui.components.LoadingOverlay
import com.amigojolive.ui.components.PublicationList
import com.amigojolive.ui.publications.PublicationsViewModel

/**
 * Pantalla de inicio del Panel del Docente.
 * Ahora muestra directamente el feed de publicaciones reemplazando el dashboard antiguo.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherHomeContent(
    publicationsViewModel: PublicationsViewModel,
    currentUser: UserSummary,
    onNavigateToCreatePost: () -> Unit,
    onLogout: () -> Unit = {}
) {
    val navigator = LocalNavigator.currentOrThrow
    val state     by publicationsViewModel.state.collectAsState()
    var menuExpanded by remember { mutableStateOf(false) }

    if (state.loading) {
        LoadingOverlay()
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AmigojoLive") },
                actions = {
                    IconButton(onClick = { menuExpanded = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menú")
                    }
                    DropdownMenu(expanded = menuExpanded, onDismissRequest = { menuExpanded = false }) {
                        DropdownMenuItem(
                            text = { Text("Perfil") },
                            leadingIcon = { Icon(Icons.Default.Person, null) },
                            onClick = { menuExpanded = false; navigator.push(ProfileScreen) },
                        )
                        DropdownMenuItem(
                            text = { Text("Cerrar sesión") },
                            leadingIcon = { Icon(Icons.Default.Logout, null) },
                            onClick = { menuExpanded = false; onLogout() },
                        )
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreatePost,
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Añadir publicación")
            }
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = true,
                    onClick = { /* Ya estamos aquí */ },
                    icon = { Icon(Icons.Default.Home, null) },
                    label = { Text("Inicio") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(FeedScreen) },
                    icon = { Icon(Icons.Default.Feed, null) },
                    label = { Text("Feed") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(ChatbotScreen) },
                    icon = { Icon(Icons.Default.SmartToy, null) },
                    label = { Text("Asistente") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(ProfileScreen) },
                    icon = { Icon(Icons.Default.Person, null) },
                    label = { Text("Perfil") },
                )
            }
        },
        content = { padding ->
            PublicationList(
                publications = state.publications,
                onPublicationClick = { navigator.push(PublicationDetailScreen(it)) },
                modifier = Modifier.padding(padding)
            )
        }
    )
}
