import { io, Socket } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from './client';

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:3000';

let socket: Socket | null = null;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function getChatbotSocket(): Socket {
  if (socket) return socket;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  socket = io(`${SOCKET_URL}/chatbot`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Conectado al chatbot');
  });

  socket.on('disconnect', (reason) => {
    console.log('Desconectado del chatbot:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Error de conexión al chatbot:', err.message);
  });

  return socket;
}

export function disconnectChatbot(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const s = getChatbotSocket();

    const onResponse = (data: { message: string }) => {
      cleanup();
      resolve(data.message);
    };

    const onError = (data: { message: string }) => {
      cleanup();
      reject(new Error(data.message));
    };

    const cleanup = () => {
      s.off('chat:response', onResponse);
      s.off('chat:error', onError);
    };

    s.once('chat:response', onResponse);
    s.once('chat:error', onError);

    s.emit('chat:message', { messages });
  });
}

export function sendChatStream(
  messages: ChatMessage[],
  onToken: (token: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const s = getChatbotSocket();
    let fullContent = '';

    const onTokenHandler = (data: { token: string }) => {
      fullContent += data.token;
      onToken(data.token);
    };

    const onDone = () => {
      cleanup();
      resolve(fullContent);
    };

    const onError = (data: { message: string }) => {
      cleanup();
      reject(new Error(data.message));
    };

    const cleanup = () => {
      s.off('chat:token', onTokenHandler);
      s.off('chat:done', onDone);
      s.off('chat:error', onError);
    };

    s.on('chat:token', onTokenHandler);
    s.once('chat:done', onDone);
    s.once('chat:error', onError);

    s.emit('chat:stream', { messages });
  });
}
