package com.amigojolive.ui.publications

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import com.amigojolive.domain.model.Publication
import com.amigojolive.navigation.CreateEditPublicationScreen
import com.amigojolive.navigation.PublicationDetailScreen
import com.amigojolive.ui.components.AmigojoSnackbarHost
import com.amigojolive.ui.components.LoadingOverlay
import com.amigojolive.ui.components.PublicationList

/** Feed comunitario: todas las publicaciones. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedContent(viewModel: PublicationsViewModel) {
    val navigator = LocalNavigator.currentOrThrow
    val state     by viewModel.state.collectAsState()
    val snackbar  = remember { SnackbarHostState() }

    LaunchedEffect(state.error, state.actionSuccess) {
        (state.error ?: state.actionSuccess)?.let {
            snackbar.showSnackbar(it)
            viewModel.clearMessages()
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Feed comunitario") }, navigationIcon = {
            IconButton(onClick = { navigator.pop() }) { Icon(Icons.Default.ArrowBack, null) }
        }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { navigator.push(CreateEditPublicationScreen()) }) {
                Icon(Icons.Default.Add, "Nueva publicación")
            }
        },
        snackbarHost = { AmigojoSnackbarHost(snackbar) },
    ) { padding ->
        if (state.loading) { LoadingOverlay(Modifier.padding(padding)); return@Scaffold }

        PublicationList(
            publications = state.publications,
            onPublicationClick = { navigator.push(PublicationDetailScreen(it)) },
            modifier = Modifier.padding(padding)
        )
    }
}

/** Mis aportes: filtrando por author.id == currentUserId */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyPublicationsContent(viewModel: PublicationsViewModel) {
    val navigator = LocalNavigator.currentOrThrow
    val state     by viewModel.state.collectAsState()
    val myPubs    = viewModel.myPublications()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Mis aportes") }, navigationIcon = {
            IconButton(onClick = { navigator.pop() }) { Icon(Icons.Default.ArrowBack, null) }
        }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { navigator.push(CreateEditPublicationScreen()) }) {
                Icon(Icons.Default.Add, "Nueva publicación")
            }
        },
    ) { padding ->
        if (state.loading) { LoadingOverlay(Modifier.padding(padding)); return@Scaffold }
        if (myPubs.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Aún no tienes publicaciones.", style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            return@Scaffold
        }
        PublicationList(
            publications = myPubs,
            onPublicationClick = { navigator.push(PublicationDetailScreen(it)) },
            modifier = Modifier.padding(padding)
        )
    }
}

