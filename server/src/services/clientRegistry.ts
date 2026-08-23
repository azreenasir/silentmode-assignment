import WebSocket from "ws";

// Manages connected clients
class ClientRegistry {
  // Map of client IDs to WebSocket connections
  private clients = new Map<string, WebSocket>();

  // Registers a new client
  registerClient(clientId: string, socket: WebSocket) {
    this.clients.set(clientId, socket);
  }

  // Retrieves a client by its ID
  getClient(clientId: string) {
    return this.clients.get(clientId);
  }

  // Retrieves all connected clients
  getAllClients() {
    return Array.from(this.clients.keys());
  }

  // Removes a client by its WebSocket connection
  removeClientBySocket(socket: WebSocket) {
    for (const [clientId, clientSocket] of this.clients.entries()) {
      if (clientSocket === socket) {
        this.clients.delete(clientId);
        return clientId;
      }
    }

    return null;
  }
}

export const clientRegistry = new ClientRegistry();
