import { createLocalApiServer } from './localServer.js';

const DEFAULT_PORT = 3000;
const port = readPort(process.env.API_PORT);
const host = process.env.API_HOST ?? '127.0.0.1';
const server = createLocalApiServer();

server.listen(port, host, () => {
  console.log(`Local Cube API listening on http://${host}:${port}`);
});

function readPort(value: string | undefined): number {
  if (value === undefined) return DEFAULT_PORT;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(`API_PORT must be an integer from 1 to 65535: ${value}`);
  }
  return parsed;
}
