import WebSocket from "ws";
import { SERVER_URL, CLIENT_ID, FILE_PATH } from "./config";
import { sendFile } from "./fileTransfer";

// Create WebSocket connection
const socket = new WebSocket(SERVER_URL);

socket.on("open", () => {
  console.log("Connected to server");

  // Register the client
  socket.send(
    JSON.stringify({
      type: "REGISTER",
      clientId: CLIENT_ID,
    })
  );
});

// Handle incoming messages
socket.on("message", async (message, isBinary) => {
  if (isBinary) {
    return;
  }

  const data = JSON.parse(message.toString());

  console.log("Message from server:", data);

  // Handle download request
  if (data.type === "DOWNLOAD_FILE") {
    await sendFile(socket, FILE_PATH);
  }
});

socket.on("close", () => {
  console.log("Disconnected from server");
});

socket.on("error", (error) => {
  console.error("WebSocket error:", error);
});
