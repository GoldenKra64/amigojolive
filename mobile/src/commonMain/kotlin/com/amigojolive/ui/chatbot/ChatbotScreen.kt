package com.amigojolive.ui.chatbot

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import com.amigojolive.domain.model.ChatMessage
import com.amigojolive.ui.components.AmigojoSnackbarHost

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatbotContent(viewModel: ChatbotViewModel) {
    val navigator    = LocalNavigator.currentOrThrow
    val state        by viewModel.state.collectAsState()
    val snackbar     = remember { SnackbarHostState() }
    var inputText    by remember { mutableStateOf("") }
    val listState    = rememberLazyListState()

    LaunchedEffect(state.messages.size) {
        if (state.messages.isNotEmpty()) {
            listState.animateScrollToItem(state.messages.lastIndex)
        }
    }

    LaunchedEffect(state.error) {
        state.error?.let {
            snackbar.showSnackbar(it)
            viewModel.clearError()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Asistente IA")
                        Text(
                            if (state.connected) "Conectado" else "Desconectado",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (state.connected) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.error,
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navigator.pop() }) { Icon(Icons.Default.ArrowBack, null) }
                },
                actions = {
                    if (!state.connected) {
                        IconButton(onClick = { viewModel.connect() }) {
                            Icon(Icons.Default.Refresh, "Reconectar")
                        }
                    }
                },
            )
        },
        snackbarHost = { AmigojoSnackbarHost(snackbar) },
        bottomBar = {
            ChatInputBar(
                text        = inputText,
                onTextChange = { inputText = it },
                onSend      = {
                    viewModel.sendMessage(inputText)
                    inputText = ""
                },
                enabled  = state.connected && !state.streaming,
                loading  = state.streaming,
            )
        },
    ) { padding ->
        LazyColumn(
            state   = listState,
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (state.messages.isEmpty()) {
                item {
                    Box(Modifier.fillParentMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.SmartToy, null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(Modifier.height(16.dp))
                            Text("Hola, ¿en qué puedo ayudarte hoy?",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }

            items(state.messages, key = { it.id }) { msg ->
                ChatBubble(msg)
            }

            if (state.streaming) {
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        Spacer(Modifier.width(8.dp))
                        Text("Escribiendo…", style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatBubble(msg: ChatMessage) {
    val isUser = msg.role == "user"
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
    ) {
        Surface(
            shape = MaterialTheme.shapes.large,
            color = if (isUser) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.widthIn(max = 280.dp),
        ) {
            Text(
                text = msg.content,
                modifier = Modifier.padding(12.dp),
                style = MaterialTheme.typography.bodyMedium,
                color = if (isUser) MaterialTheme.colorScheme.onPrimary
                        else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun ChatInputBar(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    enabled: Boolean,
    loading: Boolean,
) {
    Surface(shadowElevation = 8.dp) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Escribe tu mensaje…") },
                maxLines = 4,
                enabled = enabled,
            )
            Spacer(Modifier.width(8.dp))
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(40.dp), strokeWidth = 3.dp)
            } else {
                IconButton(
                    onClick = onSend,
                    enabled = enabled && text.isNotBlank(),
                ) {
                    Icon(Icons.Default.Send, "Enviar",
                        tint = if (enabled && text.isNotBlank()) MaterialTheme.colorScheme.primary
                               else MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
