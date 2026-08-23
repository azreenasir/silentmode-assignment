import express from "express";
import WebSocket from "ws";

import { clientRegistry } from "../services/clientRegistry.js";

const router = express.Router();

// get all clients
router.get("/", (req, res) => {
  res.json({
    clients: clientRegistry.getAllClients(),
  });
});

// request file download
router.post("/:clientId/download", (req, res) => {
  const { clientId } = req.params;

  const socket = clientRegistry.getClient(clientId);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return res.status(404).json({
      message: "Client not connected",
    });
  }

  socket.send(JSON.stringify({type: "DOWNLOAD_FILE"}));

  console.log(`Download request sent to ${clientId}`);
  res.json({message: `Download request sent to ${clientId}`});

});

export default router;
