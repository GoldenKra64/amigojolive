/**
 * Par de transports MCP enlazados en memoria (cliente ↔ servidor en el mismo proceso).
 */
class LinkedTransport {
  constructor() {
    this._peer = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this._started = false;
  }

  _setPeer(peer) {
    this._peer = peer;
  }

  async start() {
    this._started = true;
  }

  async close() {
    this._started = false;
    this.onclose?.();
    if (this._peer) {
      this._peer.onclose?.();
    }
  }

  async send(message) {
    if (!this._peer?._started) {
      throw new Error("Linked transport peer not started");
    }
    setImmediate(() => {
      try {
        this._peer.onmessage?.(message);
      } catch (err) {
        this._peer.onerror?.(err);
      }
    });
  }
}

function createLinkedTransportPair() {
  const clientTransport = new LinkedTransport();
  const serverTransport = new LinkedTransport();
  clientTransport._setPeer(serverTransport);
  serverTransport._setPeer(clientTransport);
  return { clientTransport, serverTransport };
}

module.exports = {
  LinkedTransport,
  createLinkedTransportPair,
};
