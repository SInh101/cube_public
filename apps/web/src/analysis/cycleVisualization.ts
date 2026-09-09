import type {
  AnalyzedCubieKindDto,
  SequenceAnalysisResponseDto,
} from '@rubiks-learning/api-contract';
import type {
  CubeViewMarker,
  CubeViewStickerMarker,
} from '../components/CubeView';
import {
  createCubieViewModels,
  type CubeViewState,
} from '../components/cubeViewModel';

export interface CycleSelection {
  readonly kind: AnalyzedCubieKindDto;
  readonly index: number;
}

export interface CycleVisualization {
  readonly labels: readonly [string, string, string];
  readonly cubieIds: readonly string[];
  readonly markers: readonly CubeViewMarker[];
}

export function firstThreeCycle(
  response: SequenceAnalysisResponseDto,
): CycleSelection | undefined {
  if (response.analysis.corners.threeCycles.length > 0) {
    return { kind: 'corner', index: 0 };
  }
  if (response.analysis.edges.threeCycles.length > 0) {
    return { kind: 'edge', index: 0 };
  }
  return undefined;
}

/** RESTの位置ラベルを、3D表示で追跡できる安定したCubie IDへ変換する。 */
export function createCycleVisualization(
  response: SequenceAnalysisResponseDto,
  selection: CycleSelection | undefined,
): CycleVisualization | undefined {
  if (selection === undefined) return undefined;
  const group =
    selection.kind === 'corner'
      ? response.analysis.corners
      : response.analysis.edges;
  const labels = group.threeCycles[selection.index];
  if (labels === undefined) return undefined;
  const entryByLabel = new Map(
    group.permutation.map((entry) => [entry.fromLabel, entry]),
  );
  const cubieIds = labels.flatMap((label) => {
    const entry = entryByLabel.get(label);
    return entry === undefined ? [] : [entry.cubieId];
  });
  if (cubieIds.length !== 3) return undefined;

  return {
    labels,
    cubieIds,
    markers: cubieIds.map((cubieId, index) => ({
      cubieId,
      label: String(index + 1),
    })),
  };
}

const HOME_FACE_BY_COLOR = {
  white: 'U',
  red: 'R',
  green: 'F',
  yellow: 'D',
  orange: 'L',
  blue: 'B',
} as const;

/** 選択pieceに属する各物理ステッカーを、現在向いている面へ配置する。 */
export function createCycleStickerMarkers(
  state: CubeViewState,
  cubieIds: readonly string[],
): readonly CubeViewStickerMarker[] {
  const selectedIds = new Set(cubieIds);
  return createCubieViewModels(state).flatMap((cubie) => {
    if (!selectedIds.has(cubie.id)) return [];
    return Object.entries(cubie.stickers).flatMap(([face, color]) =>
      color === undefined
        ? []
        : [
            {
              cubieId: cubie.id,
              face: face as CubeViewStickerMarker['face'],
              label: HOME_FACE_BY_COLOR[color],
            },
          ],
    );
  });
}
