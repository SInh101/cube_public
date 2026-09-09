import { Cube } from '@rubiks-learning/cube-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { applyMovesToCube } from './applyMoveToCube.js';

afterEach(() => vi.restoreAllMocks());

describe('applyMovesToCube', () => {
  it('returns every animation state and persists only the final state', async () => {
    const cube = Cube.solved();
    vi.spyOn(cubeRepository, 'findById').mockResolvedValue(cube);
    const save = vi.spyOn(cubeRepository, 'save').mockResolvedValue(undefined);

    const result = await applyMovesToCube('cube-id', ['R', 'U']);

    expect(result.moves).toEqual(['R', 'U']);
    expect(result.states).toHaveLength(2);
    expect(result.states[0]).not.toEqual(result.states[1]);
    expect(result.state).toEqual(result.states[1]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('cube-id', cube);
  });
});
