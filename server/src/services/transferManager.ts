import fs from "fs";
import path from "path";
import WebSocket from "ws";


// Represents a single file transfer session
type TransferSession = {
  transferId: string;
  clientId: string;
  fileName: string;
  fileSize: number;
  bytesReceived: number;
  writeStream: fs.WriteStream;
};

// Manages file transfers between clients and the server
class TransferManager {
  private transfers = new Map<WebSocket, TransferSession>();

  // Files received by the server are kept in a local downloads directory.
  private downloadDir = path.resolve(process.env.DOWNLOAD_DIR || "downloads");

  // Check the download directory
  constructor() {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, {
        recursive: true,
      });
    }
  }

  // Starts a new file transfer
  startTransfer(socket: WebSocket, clientId: string, data: {
    transferId: string;
    fileName: string;
    fileSize: number;
    }
  ) {
    const safeFileName = path.basename(data.fileName);

    const destination = path.join(
      this.downloadDir,
      `${clientId}-${safeFileName}`
    );

    // Create a writable stream for the file
    const writeStream = fs.createWriteStream(destination);

    // Stream errors are emitted asynchronously. Handling them prevents a failed
    // disk write or mid-transfer cancellation from crashing the server process.
    writeStream.on("error", (error) => {
      console.error("File write error:", error);
    });

    this.transfers.set(socket, {
      transferId: data.transferId,
      clientId,
      fileName: safeFileName,
      fileSize: data.fileSize,
      bytesReceived: 0,
      writeStream,
    });

    console.log(`Starting download from ${clientId}`);
    console.log(`File: ${data.fileName}`);
    console.log(`Size: ${data.fileSize} bytes`);
  }

  // Handles incoming file chunks from the client
  handleChunk(socket: WebSocket, chunk: Buffer) {
    const transfer = this.transfers.get(socket);

    if (!transfer) {
      console.error("No active transfer");
      return;
    }

    // Write the incoming chunk to the file
    transfer.writeStream.write(chunk);

    transfer.bytesReceived += chunk.length;

    const progress = ((transfer.bytesReceived / transfer.fileSize) * 100).toFixed(2);

    console.log(`Download progress: ${progress}%`);
  }

  // Completes the file transfer
  completeTransfer(socket: WebSocket) {
    const transfer = this.transfers.get(socket);

    if (!transfer) {
      console.error("No active transfer");
      return;
    }

    // Closing the stream flushes buffered bytes and releases the file handle.
    transfer.writeStream.end();

    console.log(`Download completed from ${transfer.clientId}`);

    this.transfers.delete(socket);
  }

  // Cancels an ongoing file transfer
  cancelTransfer(socket: WebSocket) {
    const transfer = this.transfers.get(socket);

    if (!transfer) {
      return;
    }

    transfer.writeStream.destroy();

    this.transfers.delete(socket);
  }
}

export const transferManager = new TransferManager();
