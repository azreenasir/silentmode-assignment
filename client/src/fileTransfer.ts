import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import WebSocket from "ws";

export async function sendFile(socket: WebSocket, filePath: string) {

  // check if the file exists
  if (!fs.existsSync(filePath)) {
    socket.send(
      JSON.stringify({
        type: "FILE_ERROR",
        message: "File not found",
      })
    );

    return;
  }

  // Get file stats
  const stats = fs.statSync(filePath);
  const transferId = randomUUID();

  // Notify the server about the file transfer start
  socket.send(
    JSON.stringify({
      type: "FILE_START",
      transferId,
      fileName: path.basename(filePath),
      fileSize: stats.size,
    })
  );

  // Create a read stream for the file
  const readStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
  let bytesSent = 0;
  for await (const chunk of readStream) {
    socket.send(chunk);

    // Update progress
    bytesSent += chunk.length;

    // Calculate progress
    const progress = ((bytesSent / stats.size) * 100).toFixed(2);

    // Log progress
    console.log(`Upload progress: ${progress}%`);
  }

  // Notify the server about the file transfer completion
  socket.send(
    JSON.stringify({
      type: "FILE_COMPLETE",
      transferId,
    })
  );

  console.log("File transfer completed");
}
