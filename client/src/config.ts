import "dotenv/config";

export const SERVER_URL = process.env.SERVER_URL || "ws://localhost:3000";
export const CLIENT_ID = process.env.CLIENT_ID || "client-0001";
export const FILE_PATH = process.env.FILE_PATH || "test-files/test-sample.txt";
