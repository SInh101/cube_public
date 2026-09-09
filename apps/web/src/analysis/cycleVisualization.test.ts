import type { SequenceAnalysisResponseDto } from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import {
  createCycleStickerMarkers,
  createCycleVisualization,
  firstThreeCycle,
} from './cycleVisualization';

describe('cycleVisualization', () => {
  it('M14-VM-01: corner 3-cycleを優先選択する', () => {
    expect(firstThreeCycle(fixture())).toEqual({ kind: 'corner', index: 0 });
  });

  it('M14-VM-02: cycle順を安定IDと1/2/3 markerへ変換する', () => {
    expect(
      createCycleVisualization(fixture(), { kind: 'corner', index: 0 }),
    ).toEqual({
      labels: ['URF', 'DLF', 'ULB'],
      cubieIds: ['piece-1', 'piece-2', 'piece-3'],
      markers: [
        { cubieId: 'piece-1', label: '1' },
        { cubieId: 'piece-2', label: '2' },
        { cubieId: 'piece-3', label: '3' },
      ],
    });
  });

  it('M14-VM-03: 選択pieceの物理ステッカーを現在面へ配置する', () => {
    expect(
      createCycleStickerMarkers(solvedState(), ['green-red-white']),
    ).toEqual([
      { cubieId: 'green-red-white', face: 'R', label: 'R' },
      { cubieId: 'green-red-white', face: 'U', label: 'U' },
      { cubieId: 'green-red-white', face: 'F', label: 'F' },
    ]);
  });
});

function fixture(): SequenceAnalysisResponseDto {
  const entries = ['URF', 'DLF', 'ULB'].map((label, index) => ({
    cubieId: `piece-${index + 1}`,
    from: [0, 0, 0] as const,
    to: [0, 0, 0] as const,
    fromLabel: label,
    toLabel: label,
  }));
  return {
    cubeId: 'cube',
    sequence: 'R',
    moves: ['R'],
    state: {} as SequenceAnalysisResponseDto['state'],
    resultState: {} as SequenceAnalysisResponseDto['resultState'],
    analysis: {
      identity: false,
      corners: {
        identity: false,
        permutation: entries,
        cycles: [['URF', 'DLF', 'ULB']],
        threeCycles: [['URF', 'DLF', 'ULB']],
        fixedCubieLabels: [],
        orientationChanges: [],
      },
      edges: {
        identity: true,
        permutation: [],
        cycles: [],
        threeCycles: [],
        fixedCubieLabels: [],
        orientationChanges: [],
      },
    },
  };
}

function solvedState(): SequenceAnalysisResponseDto['state'] {
  return {
    faces: {
      U: Array(9).fill('white'),
      R: Array(9).fill('red'),
      F: Array(9).fill('green'),
      D: Array(9).fill('yellow'),
      L: Array(9).fill('orange'),
      B: Array(9).fill('blue'),
    },
  } as unknown as SequenceAnalysisResponseDto['state'];
}
