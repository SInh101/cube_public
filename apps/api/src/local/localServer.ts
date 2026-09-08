import { createServer, type IncomingMessage, type Server } from 'node:http';

import { handleCubeRequest } from '../http/handleCubeRequest.js';
import { handleMoveSequenceRequest } from '../http/handlers/handleMoveSequenceRequest.js';
import { handleCommutatorRequest } from '../http/handlers/handleCommutatorRequest.js';
import { handlePresetRequest } from '../http/handlePresetRequest.js';

/** Milestone 2～8向けの、process内repositoryを維持するローカルHTTP server。 */
export function createLocalApiServer(): Server {
  return createServer(async (incoming, outgoing) => {
    try {
      if (incoming.method === 'OPTIONS') {
        outgoing.writeHead(204, corsHeaders());
        outgoing.end();
        return;
      }

      const request = await toWebRequest(incoming);
      const pathname = new URL(request.url).pathname;
      const response =
        pathname === '/api/health'
          ? Response.json({ status: 'ok' }, { status: 200 })
          : pathname === '/api/commutators'
            ? await handleCommutatorRequest(request)
            : pathname === '/api/move-sequences'
              ? await handleMoveSequenceRequest(request)
              : pathname === '/api/presets' ||
                  pathname.startsWith('/api/presets/')
                ? await handlePresetRequest(request)
                : await handleCubeRequest(request);
      const headers = Object.fromEntries(response.headers.entries());
      const body = Buffer.from(await response.arrayBuffer());

      outgoing.writeHead(response.status, {
        ...headers,
        ...corsHeaders(),
      });
      outgoing.end(body);
    } catch {
      outgoing.writeHead(500, {
        'content-type': 'application/json',
        ...corsHeaders(),
      });
      outgoing.end(
        JSON.stringify({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'internal server error',
          },
        }),
      );
    }
  });
}

async function toWebRequest(incoming: IncomingMessage): Promise<Request> {
  const host = incoming.headers.host ?? '127.0.0.1';
  const url = new URL(incoming.url ?? '/', `http://${host}`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(incoming.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const method = incoming.method ?? 'GET';
  const bodyBuffer =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : await readBody(incoming);
  const body =
    bodyBuffer === undefined || bodyBuffer.byteLength === 0
      ? undefined
      : (bodyBuffer.buffer.slice(
          bodyBuffer.byteOffset,
          bodyBuffer.byteOffset + bodyBuffer.byteLength,
        ) as ArrayBuffer);

  return new Request(url, {
    method,
    headers,
    body,
  });
}

async function readBody(incoming: IncomingMessage): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of incoming) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}
