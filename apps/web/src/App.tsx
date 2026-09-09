import type {
  CommutatorPartDto,
  CreateCubeResponseDto,
  CubeStateResponseDto,
  MoveSequenceResponseDto,
  PreparedCommutatorResponseDto,
  PresetResponseDto,
} from '@rubiks-learning/api-contract';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AnimationSpeedControl,
  CommutatorTeachingPanel,
  CubeView,
  DEFAULT_ANIMATION_DURATION_MS,
  FaceControlPanel,
  findChangedCubieIds,
  MoveSequenceControl,
  PlaybackControls,
  PresetPanel,
  type CubeMove,
  type FacePreview,
} from './components';
import './components/face-controls.css';
import { usePlayback } from './playback/usePlayback';

type LoadStatus = 'loading' | 'ready' | 'error';
type FaceMove = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';

const FACE_MOVES = ['R', 'L', 'U', 'D', 'F', 'B'] as const;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function App() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [cubeId, setCubeId] = useState<string | null>(null);
  const [cubeState, setCubeState] = useState<
    CubeStateResponseDto['state'] | null
  >(null);
  const [moveError, setMoveError] = useState(false);
  const [lastMove, setLastMove] = useState<CubeMove | null>(null);
  const [animationId, setAnimationId] = useState(0);
  const [animationDurationMs, setAnimationDurationMs] = useState(
    DEFAULT_ANIMATION_DURATION_MS,
  );
  const [facePreview, setFacePreview] = useState<FacePreview | null>(null);
  const [sequenceInput, setSequenceInput] = useState('');
  const [preparedMoves, setPreparedMoves] = useState<readonly CubeMove[]>([]);
  const [preparedMovesRevision, setPreparedMovesRevision] = useState(0);
  const [isSequenceLoading, setIsSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState<string>();
  const [isAnimating, setIsAnimating] = useState(false);
  const [commutator, setCommutator] = useState<
    PreparedCommutatorResponseDto | undefined
  >();
  const [commutatorBaseState, setCommutatorBaseState] = useState<
    CubeStateResponseDto['state'] | undefined
  >();
  const [isCommutatorLoading, setIsCommutatorLoading] = useState(false);
  const [commutatorError, setCommutatorError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    async function loadCube(): Promise<void> {
      try {
        const createResponse = await fetch(`${API_BASE_URL}/api/cubes`, {
          method: 'POST',
          signal: controller.signal,
        });
        if (!createResponse.ok) {
          throw new Error(`Cube creation failed: ${createResponse.status}`);
        }
        const createDto =
          (await createResponse.json()) as CreateCubeResponseDto;

        const getResponse = await fetch(
          `${API_BASE_URL}/api/cubes/${createDto.cubeId}`,
          { signal: controller.signal },
        );
        if (!getResponse.ok) {
          throw new Error(`Cube retrieval failed: ${getResponse.status}`);
        }
        const stateDto = (await getResponse.json()) as CubeStateResponseDto;

        setCubeId(createDto.cubeId);
        setCubeState(stateDto.state);
        setStatus('ready');
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setStatus('error');
      }
    }

    void loadCube();
    return () => controller.abort();
  }, []);

  const applyMove = useCallback(
    async (move: CubeMove): Promise<void> => {
      if (cubeId === null) throw new Error('Cube is not ready');
      if (isAnimating) throw new Error('Cube is animating');

      setFacePreview(null);
      setMoveError(false);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cubes/${cubeId}/moves`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ move }),
          },
        );
        if (!response.ok) {
          throw new Error(`Move application failed: ${response.status}`);
        }
        const dto = (await response.json()) as CubeStateResponseDto;
        setCubeState(dto.state);
        setLastMove(move);
        setAnimationId((current) => current + 1);
        setIsAnimating(true);
      } catch (error: unknown) {
        setMoveError(true);
        throw error;
      }
    },
    [cubeId, isAnimating],
  );
  const applyMoveRef = useRef(applyMove);
  applyMoveRef.current = applyMove;

  const resetCube = useCallback(async (): Promise<void> => {
    if (cubeId === null || isAnimating) return;

    setMoveError(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cubes/${cubeId}/reset`,
        { method: 'PUT' },
      );

      if (!response.ok) {
        throw new Error(`Cube reset failed: ${response.status}`);
      }

      const dto = (await response.json()) as CubeStateResponseDto;

      setCubeState(dto.state);
      setLastMove(null);
      if (commutator !== undefined) setCommutatorBaseState(dto.state);
    } catch (error: unknown) {
      setMoveError(true);
      throw error;
    }
  }, [commutator, cubeId, isAnimating]);

  const {
    state: playbackState,
    start: startPlayback,
    play,
    playUntil,
    pause,
    next,
    previous,
    reversePlay,
    reset,
    handleAnimationComplete: completePlaybackAnimation,
  } = usePlayback({
    moves: preparedMoves,
    isAnimating,
    applyMove,
    resetCube,
    sequenceRevision: preparedMovesRevision,
  });

  const prepareCommutator = useCallback(
    async (a: string, b: string): Promise<void> => {
      if (cubeState === null || isAnimating) return;
      setIsCommutatorLoading(true);
      setCommutatorError(undefined);
      try {
        const response = await fetch(`${API_BASE_URL}/api/commutators`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ a, b }),
        });
        if (!response.ok) {
          throw new Error(`Commutator preparation failed: ${response.status}`);
        }
        const dto = (await response.json()) as PreparedCommutatorResponseDto;
        setCommutator(dto);
        setCommutatorBaseState(cubeState);
        setPreparedMoves(dto.moves);
        setPreparedMovesRevision((current) => current + 1);
      } catch {
        setCommutator(undefined);
        setCommutatorBaseState(undefined);
        setCommutatorError('Could not prepare commutator.');
      } finally {
        setIsCommutatorLoading(false);
      }
    },
    [cubeState, isAnimating],
  );

  const activeCommutatorPart = useMemo<CommutatorPartDto | undefined>(() => {
    if (commutator === undefined) return undefined;
    const moveIndex =
      playbackState.direction === 'reverse'
        ? playbackState.currentIndex - 1
        : playbackState.currentIndex;
    return commutator.boundaries.find(
      ({ startIndex, endIndex }) =>
        startIndex <= moveIndex && moveIndex < endIndex,
    )?.part;
  }, [commutator, playbackState.currentIndex, playbackState.direction]);

  const nextCommutatorPartEnd = useMemo(
    () =>
      commutator?.boundaries.find(
        ({ startIndex, endIndex }) =>
          startIndex <= playbackState.currentIndex &&
          playbackState.currentIndex < endIndex,
      )?.endIndex,
    [commutator, playbackState.currentIndex],
  );

  const changedCubieIds = useMemo(
    () =>
      commutatorBaseState === undefined || cubeState === null
        ? []
        : findChangedCubieIds(commutatorBaseState, cubeState),
    [commutatorBaseState, cubeState],
  );

  const clearCommutatorLesson = useCallback((): void => {
    setCommutator(undefined);
    setCommutatorBaseState(undefined);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (isEditableTarget(event.target)) return;

      const face = event.key.toUpperCase();
      if (!isFaceMove(face)) return;

      const move: CubeMove = event.shiftKey ? `${face}'` : face;
      clearCommutatorLesson();
      void applyMoveRef.current(move).catch(() => undefined);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearCommutatorLesson]);

  const cubeAnimation = useMemo(
    () =>
      lastMove === null
        ? undefined
        : {
            id: animationId,
            move: lastMove,
            durationMs: animationDurationMs,
          },
    [animationDurationMs, animationId, lastMove],
  );

  const handleAnimationComplete = useCallback(
    (completedId: number) => {
      if (completedId !== animationId) return;

      setIsAnimating(false);
      completePlaybackAnimation(completedId);
    },
    [animationId, completePlaybackAnimation],
  );

  const validateMoveSequence = useCallback(async (): Promise<void> => {
    setIsSequenceLoading(true);
    setSequenceError(undefined);
    try {
      const response = await fetch(`${API_BASE_URL}/api/move-sequences`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sequence: sequenceInput }),
      });
      if (!response.ok) {
        throw new Error(`Move sequence validation failed: ${response.status}`);
      }
      const dto = (await response.json()) as MoveSequenceResponseDto;
      clearCommutatorLesson();
      setPreparedMoves(dto.moves);
      setPreparedMovesRevision((current) => current + 1);
    } catch {
      setPreparedMoves([]);
      setSequenceError('Could not prepare move sequence.');
    } finally {
      setIsSequenceLoading(false);
    }
  }, [clearCommutatorLesson, sequenceInput]);

  const preparePresetPlayback = useCallback(
    async (preset: PresetResponseDto, reverse: boolean): Promise<void> => {
      if (isAnimating || playbackState.status === 'playing') return;
      clearCommutatorLesson();
      setSequenceInput(preset.moves);
      setSequenceError(undefined);
      try {
        const response = await fetch(`${API_BASE_URL}/api/move-sequences`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sequence: preset.moves }),
        });
        if (!response.ok) throw new Error('Preset sequence is invalid');
        const dto = (await response.json()) as MoveSequenceResponseDto;
        const moves = reverse ? invertMoves(dto.moves) : dto.moves;
        setPreparedMoves(moves);
        startPlayback(moves);
      } catch {
        setSequenceError('Could not prepare preset playback.');
      }
    },
    [clearCommutatorLesson, isAnimating, playbackState.status, startPlayback],
  );

  return (
    <main>
      <h1>Rubik&apos;s Cube Learning</h1>
      {status === 'loading' && <p>Loading cube...</p>}
      {status === 'error' && <p role="alert">Error loading cube.</p>}
      {status === 'ready' && cubeState !== null && (
        <>
          <div className="cube-workspace">
            <CubeView
              state={cubeState}
              animation={cubeAnimation}
              preview={facePreview}
              onAnimationComplete={handleAnimationComplete}
              highlightedCubieIds={changedCubieIds}
              dimUnhighlighted={commutator !== undefined}
            />
            <div className="cube-controls">
              <AnimationSpeedControl
                value={animationDurationMs}
                onChange={setAnimationDurationMs}
              />
              <FaceControlPanel
                state={cubeState}
                onMove={(move) => {
                  clearCommutatorLesson();
                  void applyMove(move).catch(() => undefined);
                }}
                onPreviewChange={setFacePreview}
                disabled={isAnimating}
              />
              <button
                className="cube-reset-control"
                type="button"
                disabled={isAnimating}
                onClick={reset}
              >
                Reset cube
              </button>
              <MoveSequenceControl
                sequenceInput={sequenceInput}
                preparedMoves={preparedMoves}
                isLoading={isSequenceLoading}
                disabled={isAnimating}
                errorMessage={sequenceError}
                onSequenceInputChange={(value) => {
                  setSequenceInput(value);
                  setSequenceError(undefined);
                }}
                onPrepare={() => void validateMoveSequence()}
                onApplyMove={(move) => {
                  clearCommutatorLesson();
                  void applyMove(move).catch(() => undefined);
                }}
              />
              <PlaybackControls
                currentIndex={playbackState.currentIndex}
                moveCount={playbackState.moves.length}
                status={playbackState.status}
                direction={playbackState.direction}
                disabled={isAnimating}
                onPlay={play}
                onPause={pause}
                onNext={next}
                onPrevious={previous}
                onReversePlay={reversePlay}
                onReset={reset}
              />
              <PresetPanel
                apiBaseUrl={API_BASE_URL}
                disabled={isAnimating || playbackState.status === 'playing'}
                onPlay={(preset) => void preparePresetPlayback(preset, false)}
                onReversePlay={(preset) =>
                  void preparePresetPlayback(preset, true)
                }
              />
              <CommutatorTeachingPanel
                definition={commutator}
                activePart={activeCommutatorPart}
                isLoading={isCommutatorLoading}
                disabled={isAnimating || playbackState.status === 'playing'}
                playDisabled={playbackState.currentIndex !== 0}
                playNextDisabled={nextCommutatorPartEnd === undefined}
                errorMessage={commutatorError}
                onPrepare={(a, b) => void prepareCommutator(a, b)}
                onPlay={() => {
                  if (commutator !== undefined) {
                    startPlayback(commutator.moves);
                  }
                }}
                onPlayNextPart={() => {
                  if (nextCommutatorPartEnd !== undefined) {
                    playUntil(nextCommutatorPartEnd);
                  }
                }}
              />
            </div>
          </div>
          {moveError && <p role="alert">Error applying move.</p>}
        </>
      )}
    </main>
  );
}

function invertMoves(moves: readonly CubeMove[]): readonly CubeMove[] {
  return [...moves]
    .reverse()
    .map((move) =>
      move.endsWith('2')
        ? move
        : move.endsWith("'")
          ? (move[0] as CubeMove)
          : (`${move}'` as CubeMove),
    );
}

function isFaceMove(value: string): value is FaceMove {
  return (FACE_MOVES as readonly string[]).includes(value);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}
