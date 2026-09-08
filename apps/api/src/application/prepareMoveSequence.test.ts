import { InvalidMoveSequenceError } from '@rubiks-learning/cube-core';
import { describe, expect, it } from 'vitest';

import { prepareMoveSequence } from './prepareMoveSequence.js';

describe('prepareMoveSequence', () => {
  it('M7-APP-01: 検証済みMove配列をDTOとして返す', () => {
    expect(prepareMoveSequence("R  U\nR' U'")).toEqual({
      moves: ['R', 'U', "R'", "U'"],
    });
  });

  it('M7-APP-02: 不正tokenをdomain errorのままHTTP境界へ伝える', () => {
    expect(() => prepareMoveSequence('R X')).toThrowError(
      InvalidMoveSequenceError,
    );
  });
});
