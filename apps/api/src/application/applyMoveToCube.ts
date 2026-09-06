import type { CubeStateResponseDto } from '@rubiks-learning/api-contract';
import type { Move } from '@rubiks-learning/cube-core';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { CubeNotFoundError } from './CubeNotFoundError.js';

export async function applyMoveToCube(
  cubeId: string,
  move: Move,
): Promise<CubeStateResponseDto> {
  const cube = await cubeRepository.findById(cubeId);

  if (cube === undefined) {
    throw new CubeNotFoundError(cubeId);
  }

  cube.applyMove(move);

  await cubeRepository.save(cubeId, cube);

  return {
    cubeId,
    state: cube.getState(),
  };
}
