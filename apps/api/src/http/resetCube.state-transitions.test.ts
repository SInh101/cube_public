import { Cube } from '@rubiks-learning/cube-core';
import type { CubeStateResponseDto } from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { handleCubeRequest } from './handleCubeRequest.js';

const RESET_ENDPOINT = 'http://localhost/api/cubes';

describe('PUT /api/cubes/{cubeId}/reset state transitions', () => {
  it('M2-ST-01: 同じCubeを2回resetしても同じsolved状態になる', async () => {
    const cubeId = crypto.randomUUID();
    const cube = movedCube('R');
    await cubeRepository.save(cubeId, cube);

    const firstResponse = await handleCubeRequest(resetRequest(cubeId));
    const firstDto = (await firstResponse.json()) as CubeStateResponseDto;
    const secondResponse = await handleCubeRequest(resetRequest(cubeId));
    const secondDto = (await secondResponse.json()) as CubeStateResponseDto;

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(firstDto).toEqual(secondDto);
    expect(secondDto).toEqual({
      cubeId,
      state: solvedState(),
    });
  });

  it('M2-ST-02: 一方のCubeのresetが別のCubeへ影響しない', async () => {
    const firstCubeId = crypto.randomUUID();
    const secondCubeId = crypto.randomUUID();
    const firstCube = movedCube('R');
    const secondCube = movedCube('U');
    const secondStateBeforeReset = secondCube.getState();
    await cubeRepository.save(firstCubeId, firstCube);
    await cubeRepository.save(secondCubeId, secondCube);

    const response = await handleCubeRequest(resetRequest(firstCubeId));
    const dto = (await response.json()) as CubeStateResponseDto;

    expect(response.status).toBe(200);
    expect(dto.cubeId).toBe(firstCubeId);
    expect((await cubeRepository.findById(firstCubeId))?.getState()).toEqual(
      solvedState(),
    );
    expect(await cubeRepository.findById(secondCubeId)).toBe(secondCube);
    expect(secondCube.getState()).toEqual(secondStateBeforeReset);
  });

  it('M2-ST-03: 非solved状態のCubeをsolved状態へ戻す', async () => {
    const cubeId = crypto.randomUUID();
    const cube = movedCube("F'");
    expect(cube.getState()).not.toEqual(solvedState());
    await cubeRepository.save(cubeId, cube);

    const response = await handleCubeRequest(resetRequest(cubeId));
    const dto = (await response.json()) as CubeStateResponseDto;

    expect(response.status).toBe(200);
    expect(dto).toEqual({ cubeId, state: solvedState() });
    expect((await cubeRepository.findById(cubeId))?.getState()).toEqual(
      solvedState(),
    );
  });
});

function movedCube(move: 'R' | 'U' | "F'"): Cube {
  const cube = Cube.solved();
  cube.applyMove(move);
  return cube;
}

function resetRequest(cubeId: string): Request {
  return new Request(`${RESET_ENDPOINT}/${cubeId}/reset`, { method: 'PUT' });
}

function solvedState(): ReturnType<Cube['getState']> {
  return Cube.solved().getState();
}
