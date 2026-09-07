import type {
  CubeColorDto,
  CubeStateResponseDto,
} from '@rubiks-learning/api-contract';

export const CUBE_FACE_DIRECTIONS = ['R', 'L', 'U', 'D', 'F', 'B'] as const;

export type CubeFaceDirection = (typeof CUBE_FACE_DIRECTIONS)[number];
export type CubiePosition = readonly [x: number, y: number, z: number];

export interface CubieViewModel {
  readonly position: CubiePosition;
  readonly stickers: Readonly<
    Record<CubeFaceDirection, CubeColorDto | undefined>
  >;
}

export type CubeViewState = CubeStateResponseDto['state'];

/** APIのface配列を、Three.jsで描画する26個のcubieへ変換する。 */
export function createCubieViewModels(
  state: CubeViewState,
): readonly CubieViewModel[] {
  const cubies: CubieViewModel[] = [];

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        if (x === 0 && y === 0 && z === 0) continue;

        cubies.push({
          position: [x, y, z],
          stickers: {
            R: x === 1 ? state.faces.R[faceIndex(1 - y, 1 - z)] : undefined,
            L: x === -1 ? state.faces.L[faceIndex(1 - y, z + 1)] : undefined,
            U: y === 1 ? state.faces.U[faceIndex(z + 1, x + 1)] : undefined,
            D: y === -1 ? state.faces.D[faceIndex(1 - z, x + 1)] : undefined,
            F: z === 1 ? state.faces.F[faceIndex(1 - y, x + 1)] : undefined,
            B: z === -1 ? state.faces.B[faceIndex(1 - y, 1 - x)] : undefined,
          },
        });
      }
    }
  }

  return cubies;
}

function faceIndex(row: number, column: number): number {
  return row * 3 + column;
}
