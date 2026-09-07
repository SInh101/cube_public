import type { CubeColorDto, FaceStateDto } from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { createCubieViewModels, type CubeViewState } from './cubeViewModel';

describe('createCubieViewModels', () => {
  it('M5-01: 3D表示に必要な26個のcubieを生成する', () => {
    expect(createCubieViewModels(solvedState())).toHaveLength(26);
  });

  it('M5-02: solved stateの各色を外側の9面へ割り当てる', () => {
    const stickers = createCubieViewModels(solvedState()).flatMap((cubie) =>
      Object.values(cubie.stickers).filter(
        (sticker): sticker is CubeColorDto => sticker !== undefined,
      ),
    );

    expect(stickers).toHaveLength(54);
    for (const color of ['white', 'red', 'green', 'yellow', 'orange', 'blue']) {
      expect(stickers.filter((sticker) => sticker === color)).toHaveLength(9);
    }
  });

  it('M5-03: face配列の位置を対応する外向き面へ割り当てる', () => {
    const state = solvedState();
    const markedState: CubeViewState = {
      faces: {
        ...state.faces,
        F: ['blue', ...state.faces.F.slice(1)] as unknown as FaceStateDto,
      },
    };

    const frontTopLeft = createCubieViewModels(markedState).find(
      ({ position }) =>
        position[0] === -1 && position[1] === 1 && position[2] === 1,
    );

    expect(frontTopLeft?.stickers.F).toBe('blue');
  });
});

function solvedState(): CubeViewState {
  return {
    faces: {
      U: face('white'),
      R: face('red'),
      F: face('green'),
      D: face('yellow'),
      L: face('orange'),
      B: face('blue'),
    },
  };
}

function face(color: CubeColorDto): FaceStateDto {
  return Array<CubeColorDto>(9).fill(color) as unknown as FaceStateDto;
}
