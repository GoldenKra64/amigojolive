const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const { sendChat, sendChatStream, sendChatWithForumContext } = require("./chatbot.service");

function setupChatbotSocket(io) {
    const chatNamespace = io.of("/chatbot");

    /**
     * Evento de conexión del socket al chatbot de IA
     */
    chatNamespace.on("connection", (socket) => {
        console.log(`Cliente conectado al chatbot: ${socket.id}`);

        async function resolveSocketUser() {
            const token = socket.handshake.auth?.token;
            if (!token) return null;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    include: { role: true },
                });
                if (!user || user.status !== "ACTIVO" || !user.role?.active) {
                    return null;
                }
                return {
                    id: user.id,
                    role: user.role.name,
                };
            } catch {
                return null;
            }
        }

        socket.on("chat:message", async (data) => {
            const { messages, useForumTools } = data;

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                socket.emit("chat:error", { message: "Se requiere un array de mensajes" });
                return;
            }

            try {
                let response;
                if (useForumTools) {
                    const user = await resolveSocketUser();
                    if (!user) {
                        socket.emit("chat:error", {
                            message: "Se requiere autenticación para consultar el foro",
                        });
                        return;
                    }
                    response = await sendChatWithForumContext(messages, user);
                } else {
                    response = await sendChat(messages);
                }
                socket.emit("chat:response", { message: response });
            } catch (err) {
                console.error(err);
                socket.emit("chat:error", { message: "Error al obtener respuesta de la IA" });
            }
        });

        /**
        * Stream de mensajes del socket al chatbot de IA
        */
        socket.on("chat:stream", async (data) => {
            const { messages, useForumTools } = data;

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                socket.emit("chat:error", { message: "Se requiere un array de mensajes" });
                return;
            }

            try {
                if (useForumTools) {
                    const user = await resolveSocketUser();
                    if (!user) {
                        socket.emit("chat:error", {
                            message: "Se requiere autenticación para consultar el foro",
                        });
                        return;
                    }
                    const response = await sendChatWithForumContext(messages, user);
                    socket.emit("chat:response", { message: response });
                    socket.emit("chat:done");
                    return;
                }

                await sendChatStream(messages, (token) => {
                    socket.emit("chat:token", { token });
                });
                socket.emit("chat:done");
            } catch (err) {
                console.error(err);
                socket.emit("chat:error", { message: "Error en el stream de la IA" });
            }
        });

        socket.on("chat:forum", async (data) => {
            const { messages } = data;

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                socket.emit("chat:error", { message: "Se requiere un array de mensajes" });
                return;
            }

            try {
                const user = await resolveSocketUser();
                if (!user) {
                    socket.emit("chat:error", {
                        message: "Se requiere autenticación para consultar el foro",
                    });
                    return;
                }
                const response = await sendChatWithForumContext(messages, user);
                socket.emit("chat:response", { message: response });
            } catch (err) {
                console.error(err);
                socket.emit("chat:error", { message: "Error al consultar el foro con IA" });
            }
        });

        /**
        * Disconnect del socket al chatbot de IA
        */
        socket.on("disconnect", () => {
            console.log(`Cliente desconectado del chatbot: ${socket.id}`);
        });
    });
}

module.exports = setupChatbotSocket;
