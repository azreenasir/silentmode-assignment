# Silentmode Assignment

## Prerequisites

- Node.js
- npm

## Installation

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

## Environment Configuration

The project uses `dotenv`.

The example environment file is at the repository root:

```bash
.env.example
```

Because the server and client are run from separate folders, copy the example
file into both package folders from the repository root:

```bash
cp .env.example server/.env
cp .env.example client/.env
```

Environment variables used by the server:

```env
PORT=3000
DOWNLOAD_DIR=./downloads
```

Environment variables used by the client:

```env
SERVER_URL=ws://localhost:3000
CLIENT_ID=client-0001
FILE_PATH=./test-files/test-sample.txt
```

`FILE_PATH` must point to a file that exists inside the `client/` folder. The
repository currently includes:

```text
client/test-files/test-sample.txt
```

## Running the Server

Terminal 1:

```bash
cd server
npm run dev
```

The server runs on the configured `PORT`, for example:

```text
http://localhost:3000
```

## Running the Client

Terminal 2:

```bash
cd client
npm run dev
```

The client connects to `SERVER_URL` and registers using `CLIENT_ID`.

## Check Connected Clients

With both server and client running:

```bash
curl http://localhost:3000/clients
```

Example response:

```json
{
  "clients": ["client-0001"]
}
```

## Trigger the File Download

Use the same client ID configured in `CLIENT_ID`:

```bash
curl -X POST http://localhost:3000/clients/client-0001/download
```

The downloaded file is saved in `DOWNLOAD_DIR` using this filename format:

```text
<clientId>-<originalFileName>
```

With the example configuration, the output file is:

```text
server/downloads/client-0001-test-sample.txt
```
