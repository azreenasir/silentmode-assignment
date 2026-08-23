import express from "express";
import http from "http";
import "dotenv/config";

import clientsRouter from "./routes/clients.routes.js";
import { setupWebSocketServer } from "./websocket/websocketServer.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.json());

// Clients API
app.use("/clients", clientsRouter);

// WebSocket server
setupWebSocketServer(server);

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
