import type {
  OrientationChangeDto,
  PermutationEntryDto,
  PieceAnalysisDto,
  SequenceAnalysisResponseDto,
} from '@rubiks-learning/api-contract';
import {
  analyzePermutation,
  parseSequence,
  type CubieKind,
  type OrientationChange,
  type PermutationAnalysis,
  type PermutationEntry,
} from '@rubiks-learning/cube-core';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { CubeNotFoundError } from './CubeNotFoundError.js';

/** 保存済みCubeを変更せず、指定sequence後のpermutationを解析する。 */
export async function analyzeCubeSequence(
  cubeId: string,
  sequenceSource: string,
): Promise<SequenceAnalysisResponseDto> {
  const sequence = parseSequence(sequenceSource);
  const cube = await cubeRepository.findById(cubeId);
  if (cube === undefined) throw new CubeNotFoundError(cubeId);

  const before = cube.getState();
  const simulated = cube.clone();
  for (const move of sequence) simulated.applyMove(move);
  const resultState = simulated.getState();
  const analysis = analyzePermutation(before, resultState);
  const corners = toPieceAnalysis(analysis, 'corner');
  const edges = toPieceAnalysis(analysis, 'edge');

  return {
    cubeId,
    state: before,
    sequence: sequence.toString(),
    moves: sequence.moves,
    resultState,
    analysis: {
      identity: corners.identity && edges.identity,
      corners,
      edges,
    },
  };
}

function toPieceAnalysis(
  analysis: PermutationAnalysis,
  kind: Exclude<CubieKind, 'center'>,
): PieceAnalysisDto {
  const entries = analysis.permutation.filter((entry) => entry.kind === kind);
  const entryById = new Map(entries.map((entry) => [entry.cubieId, entry]));
  const cycles = analysis.cycles
    .filter((cycle) => cycle.every((id) => entryById.has(id)))
    .map((cycle) => cycle.map((id) => entryById.get(id)!.fromLabel));
  const threeCycles = cycles.filter(
    (cycle): cycle is [string, string, string] => cycle.length === 3,
  );
  const orientationChanges = analysis.orientationChanges
    .filter((entry) => entry.kind === kind)
    .map(toOrientationDto);

  return {
    identity: cycles.length === 0 && orientationChanges.length === 0,
    permutation: entries.map(toPermutationDto),
    cycles,
    threeCycles,
    fixedCubieLabels: entries
      .filter((entry) => samePosition(entry.from, entry.to))
      .map((entry) => entry.fromLabel),
    orientationChanges,
  };
}

function toPermutationDto(entry: PermutationEntry): PermutationEntryDto {
  return {
    cubieId: entry.cubieId,
    from: entry.from,
    to: entry.to,
    fromLabel: entry.fromLabel,
    toLabel: entry.toLabel,
  };
}

function toOrientationDto(entry: OrientationChange): OrientationChangeDto {
  return { ...toPermutationDto(entry), delta: entry.delta };
}

function samePosition(
  left: readonly number[],
  right: readonly number[],
): boolean {
  return left.every((coordinate, index) => coordinate === right[index]);
}
