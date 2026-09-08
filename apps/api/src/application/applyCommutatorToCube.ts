import type { CommutatorResponseDto } from '@rubiks-learning/api-contract';
import {
  Commutator,
  InvalidMoveSequenceError,
  parseSequence,
  type MoveSequence,
} from '@rubiks-learning/cube-core';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import {
  CommutatorInputError,
  type CommutatorInputPart,
} from './CommutatorInputError.js';
import { CubeNotFoundError } from './CubeNotFoundError.js';

/** 交換子を完全に検証してから対象Cubeへ適用し、教材表示用情報を返す。 */
export async function applyCommutatorToCube(
  cubeId: string,
  aSource: string,
  bSource: string,
): Promise<CommutatorResponseDto> {
  const a = parsePart('a', aSource);
  const b = parsePart('b', bSource);
  const commutator = new Commutator(a, b);
  const cube = await cubeRepository.findById(cubeId);

  if (cube === undefined) throw new CubeNotFoundError(cubeId);

  for (const move of commutator.sequence) cube.applyMove(move);
  await cubeRepository.save(cubeId, cube);

  return {
    cubeId,
    sequence: commutator.sequence.toString(),
    moves: commutator.sequence.moves,
    boundaries: commutator.boundaries,
    state: cube.getState(),
  };
}

function parsePart(part: CommutatorInputPart, source: string): MoveSequence {
  try {
    return parseSequence(source);
  } catch (error: unknown) {
    if (error instanceof InvalidMoveSequenceError) {
      throw new CommutatorInputError(part, error.token, error.tokenIndex);
    }
    throw error;
  }
}
