import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
  ErrorResponseDto,
} from '@rubiks-learning/api-contract';
import { Cube } from '@rubiks-learning/cube-core';
import { describe, expect, it } from 'vitest';

import { handleCubeRequest } from './handleCubeRequest.js';

const CUBES_URL = 'http://localhost/api/cubes';

describe('Milestone 4 REST API contract', () => {
  it('M4-01: 正常なCube生成', async () => {
    const response = await createCubeResponse();
    const dto = (await response.json()) as CreateCubeResponseDto;

    expect(response.status).toBe(201);
    expect(dto).toMatchObject({
      cubeId: expect.any(String),
      state: { faces: { U: expect.any(Array) } },
    });
    expect(dto.cubeId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('M4-02: 存在しないCube', async () => {
    const response = await getCubeResponse(crypto.randomUUID());
    const dto = (await response.json()) as ErrorResponseDto;

    expect(response.status).toBe(404);
    expect(dto).toEqual({
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Cube not found' },
    });
  });

  it('M4-03: 正常Move', async () => {
    const cubeId = await createCube();
    const response = await moveResponse(cubeId, 'R');
    const dto = (await response.json()) as CubeStateResponseDto;

    expect(response.status).toBe(200);
    expect(dto).toEqual({ cubeId, state: stateAfter('R') });
  });

  it('M4-04: 不正Move', async () => {
    const cubeId = await createCube();
    const before = await getCubeState(cubeId);

    const response = await moveResponse(cubeId, 'X');
    const dto = (await response.json()) as ErrorResponseDto;

    expect(response.status).toBe(400);
    expect(dto).toEqual({
      error: {
        code: 'MOVE_NOT_CORRECT',
        message: 'move must be one of the supported Move values',
      },
    });
    await expect(getCubeState(cubeId)).resolves.toEqual(before);
  });

  it('M4-05: Reset', async () => {
    const cubeId = await createCube();
    expect((await moveResponse(cubeId, 'R')).status).toBe(200);

    const response = await resetCubeResponse(cubeId);
    const dto = (await response.json()) as CubeStateResponseDto;

    expect(response.status).toBe(200);
    expect(dto).toEqual({ cubeId, state: Cube.solved().getState() });
  });

  it('M4-06: R^4', async () => {
    const cubeId = await createCube();

    for (let count = 0; count < 4; count += 1) {
      expect((await moveResponse(cubeId, 'R')).status).toBe(200);
    }

    await expect(getCubeState(cubeId)).resolves.toEqual(
      Cube.solved().getState(),
    );
  });

  it("M4-07: R R'", async () => {
    const cubeId = await createCube();

    expect((await moveResponse(cubeId, 'R')).status).toBe(200);
    expect((await moveResponse(cubeId, "R'")).status).toBe(200);

    await expect(getCubeState(cubeId)).resolves.toEqual(
      Cube.solved().getState(),
    );
  });
});

function createCubeResponse(): Promise<Response> {
  return handleCubeRequest(new Request(CUBES_URL, { method: 'POST' }));
}

async function createCube(): Promise<string> {
  const response = await createCubeResponse();
  const dto = (await response.json()) as CreateCubeResponseDto;
  return dto.cubeId;
}

function getCubeResponse(cubeId: string): Promise<Response> {
  return handleCubeRequest(new Request(`${CUBES_URL}/${cubeId}`));
}

async function getCubeState(
  cubeId: string,
): Promise<CubeStateResponseDto['state']> {
  const response = await getCubeResponse(cubeId);
  const dto = (await response.json()) as CubeStateResponseDto;
  return dto.state;
}

function moveResponse(cubeId: string, move: string): Promise<Response> {
  return handleCubeRequest(
    new Request(`${CUBES_URL}/${cubeId}/moves`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ move }),
    }),
  );
}

function resetCubeResponse(cubeId: string): Promise<Response> {
  return handleCubeRequest(
    new Request(`${CUBES_URL}/${cubeId}/reset`, { method: 'PUT' }),
  );
}

function stateAfter(move: 'R'): CubeStateResponseDto['state'] {
  const cube = Cube.solved();
  cube.applyMove(move);
  return cube.getState();
}
