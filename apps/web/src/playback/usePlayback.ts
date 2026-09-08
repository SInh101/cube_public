import { useCallback, useEffect, useRef, useState } from 'react';

import type { CubeMove } from '../components/cubeViewModel';
import type { PlaybackState } from './playbackTypes';

/** Appから再生state machineへ渡す境界。 */
export interface UsePlaybackOptions {
  readonly moves: readonly CubeMove[];
  readonly isAnimating: boolean;
  readonly applyMove: (move: CubeMove) => Promise<void>;
}

/** PlaybackControlsとAppが利用する操作境界。 */
export interface UsePlaybackResult {
  readonly state: PlaybackState;
  readonly play: () => void;
  readonly pause: () => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly reversePlay: () => void;
  readonly reset: () => void;
  readonly handleAnimationComplete: (animationId: number) => void;
}

const createInitialState = (moves: readonly CubeMove[]): PlaybackState => ({
  moves,
  currentIndex: 0,
  direction: 'forward',
  status: 'idle',
});

export function usePlayback({
  moves,
  isAnimating,
  applyMove,
}: UsePlaybackOptions): UsePlaybackResult {
  const [state, setState] = useState<PlaybackState>(() =>
    createInitialState(moves),
  );
  const moveRequestPending = useRef(false);

  useEffect(() => {
    setState((current) => {
      if (haveSameMoves(current.moves, moves)) return current;
      moveRequestPending.current = false;
      return createInitialState(moves);
    });
  }, [moves]);

  const sendNextMove = useCallback(async (): Promise<void> => {
    if (
      isAnimating ||
      moveRequestPending.current ||
      state.currentIndex >= state.moves.length
    ) {
      return;
    }

    const move = state.moves[state.currentIndex];
    if (move === undefined) return;

    moveRequestPending.current = true;
    try {
      await applyMove(move);
    } catch (error: unknown) {
      moveRequestPending.current = false;
      setState((current) => ({ ...current, status: 'paused' }));
      throw error;
    }
  }, [applyMove, isAnimating, state.currentIndex, state.moves]);

  useEffect(() => {
    if (state.status === 'playing') void sendNextMove();
  }, [sendNextMove, state.status]);

  const play = useCallback((): void => {
    setState((current) =>
      current.currentIndex >= current.moves.length
        ? current
        : { ...current, direction: 'forward', status: 'playing' },
    );
  }, []);

  const next = useCallback((): void => {
    if (state.status === 'playing') return;
    void sendNextMove();
  }, [sendNextMove, state.status]);

  const handleAnimationComplete = useCallback((animationId: number): void => {
    void animationId;
    if (!moveRequestPending.current) return;

    moveRequestPending.current = false;
    setState((current) => {
      const currentIndex = Math.min(
        current.currentIndex + 1,
        current.moves.length,
      );
      return {
        ...current,
        currentIndex,
        status: currentIndex >= current.moves.length ? 'idle' : current.status,
      };
    });
  }, []);

  return {
    state,
    play,
    next,
    handleAnimationComplete,
    // TODO(M8 self): 残る4操作を実装する。
    pause: () => undefined,
    previous: () => undefined,
    reversePlay: () => undefined,
    reset: () => undefined,
  };
}

function haveSameMoves(
  left: readonly CubeMove[],
  right: readonly CubeMove[],
): boolean {
  return (
    left.length === right.length &&
    left.every((move, index) => move === right[index])
  );
}
