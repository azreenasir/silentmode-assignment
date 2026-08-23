import http from "http";
import WebSocket, { WebSocketServer } from "ws";

import { clientRegistry } from "../services/clientRegistry.js";
import { transferManager } from "../services/transferManager.js";


export function setupWebSocketServer(server: http.Server) {
  // Create a WebSocket server
  const wss = new WebSocketServer({server});

  wss.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("message", (message, isBinary) => {
      if (isBinary) {
        const chunk = Array.isArray(message)
          ? Buffer.concat(message)
          : Buffer.isBuffer(message)
            ? message
            : Buffer.from(message);

        transferManager.handleChunk(socket, chunk);

        return;
      }

      const data = JSON.parse(message.toString());

      // Binds the live WebSocket to a clientId
      if (data.type === "REGISTER") {
        clientRegistry.registerClient(
          data.clientId,
          socket
        );

        console.log(`Registered client: ${data.clientId}`);

        return;
      }

      // Starts a new file transfer
      if (data.type === "FILE_START") {
        const clientId = clientRegistry.getAllClients().find(
          (id) => clientRegistry.getClient(id) === socket
        );

        if (!clientId) {
          console.error("Unknown client started transfer");
          return;
        }

        transferManager.startTransfer(socket, clientId, data);

        return;
      }

      // Completes the file transfer
      if (data.type === "FILE_COMPLETE") {
        transferManager.completeTransfer(socket);
        return;
      }

      // Cancels the file transfer
      if (data.type === "FILE_CANCEL") {
        transferManager.cancelTransfer(socket);
        return;
      }

      // Reports an error with the file transfer
      if (data.type === "FILE_ERROR") {
        console.error(
          `Client error: ${data.message}`
        );
      }
    });

    // Cleanup on socket close
    socket.on("close", () => {
      const removedClient =
        clientRegistry.removeClientBySocket(socket);

      transferManager.cancelTransfer(socket);

      if (removedClient) {
        console.log(
          `Removed client: ${removedClient}`
        );
      }
    });
  });
}
