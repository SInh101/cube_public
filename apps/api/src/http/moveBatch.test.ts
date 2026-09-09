import { afterEach, describe, expect, it, vi } from 'vitest';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { handleCubeRequest } from './handleCubeRequest.js';

const API = 'http://localhost/api/cubes';
const INVALID_BATCHES: readonly unknown[][] = [[], ['R', 'X'], ['R', 1]];

afterEach(() => vi.restoreAllMocks());

describe('batched move HTTP contract', () => {
  it('creates a cube with its initial state in one response', async () => {
    const response = await handleCubeRequest(
      new Request(API, { method: 'POST' }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(body).toHaveProperty('cubeId');
    expect(body).toHaveProperty('state.faces.U');
  });

  it('accepts multiple moves and saves once', async () => {
    const created = (await (
      await handleCubeRequest(new Request(API, { method: 'POST' }))
    ).json()) as { cubeId: string };
    const save = vi.spyOn(cubeRepository, 'save');

    const response = await handleCubeRequest(
      new Request(`${API}/${created.cubeId}/moves`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moves: ['R', 'U'] }),
      }),
    );
    const body = (await response.json()) as {
      moves: string[];
      states: unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.moves).toEqual(['R', 'U']);
    expect(body.states).toHaveLength(2);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it.each(INVALID_BATCHES)('rejects invalid batches: %j', async (moves) => {
    const response = await handleCubeRequest(
      new Request(`${API}/${crypto.randomUUID()}/moves`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moves }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
