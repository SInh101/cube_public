import { describe, expect, it } from 'vitest';
import { createSolvedCube } from '../application/index.js';
import { InMemoryCubeRepository } from './InMemoryCubeRepository.js';

describe('InMemoryCubeRepository', () => {
  it('saves and finds a Cube by its ID', async () => {
    const repository = new InMemoryCubeRepository();
    const cube = createSolvedCube();

    await repository.save('cube-id', cube);

    expect(await repository.findById('cube-id')).toBe(cube);
  });

  it('returns undefined when the Cube does not exist', async () => {
    const repository = new InMemoryCubeRepository();

    expect(await repository.findById('missing-id')).toBeUndefined();
  });

  it('does not share state between repository instances', async () => {
    const first = new InMemoryCubeRepository();
    const second = new InMemoryCubeRepository();

    await first.save('cube-id', createSolvedCube());

    expect(await second.findById('cube-id')).toBeUndefined();
  });
});
