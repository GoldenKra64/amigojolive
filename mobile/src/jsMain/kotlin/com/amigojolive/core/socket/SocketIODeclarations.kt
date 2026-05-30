@file:JsModule("socket.io-client")
@file:JsNonModule

package com.amigojolive.core.socket

/**
 * Declaraciones `external` que mapean directamente a la librería NPM socket.io-client.
 *
 * Webpack bundlea socket.io-client como módulo CommonJS. Al usar @file:JsModule
 * el compilador Kotlin/JS emite: import { io } from "socket.io-client"
 * (equivalente en CJS: const { io } = require("socket.io-client")).
 *
 * NO se reimplementa ninguna lógica del protocolo: toda la fidelidad de
 * WebSocket/polling, reconexión y versión de engine corre por cuenta del paquete NPM.
 */

/** Conecta al namespace indicado. `opts` es un objeto JS dinámico. */
@JsName("io")
external fun socketIO(url: String, opts: dynamic = definedExternally): RawSocket

/** Superficie mínima necesaria del Socket de socket.io-client. */
external interface RawSocket {
    val connected: Boolean
    fun on(event: String, callback: (args: dynamic) -> Unit): RawSocket
    fun off(event: String): RawSocket
    fun emit(event: String, data: dynamic = definedExternally): RawSocket
    fun connect(): RawSocket
    fun disconnect(): RawSocket
}
