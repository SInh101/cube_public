import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createLocalApiServer } from './localServer.js';

describe('local API server over HTTP', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createLocalApiServer();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) =>
        error === undefined ? resolve() : reject(error),
      );
    });
  });

  it('POST → GET → reset → GETを別HTTP request間で維持する', async () => {
    const createResponse = await fetch(`${baseUrl}/api/cubes`, {
      method: 'POST',
    });
    const created = (await createResponse.json()) as { cubeId: string };

    const firstGet = await fetch(`${baseUrl}/api/cubes/${created.cubeId}`);
    const reset = await fetch(`${baseUrl}/api/cubes/${created.cubeId}/reset`, {
      method: 'PUT',
    });
    const secondGet = await fetch(`${baseUrl}/api/cubes/${created.cubeId}`);

    expect(createResponse.status).toBe(201);
    expect(firstGet.status).toBe(200);
    expect(reset.status).toBe(200);
    expect(secondGet.status).toBe(200);
    await expect(secondGet.json()).resolves.toMatchObject({
      cubeId: created.cubeId,
      state: { faces: expect.any(Object) },
    });
  });
});
