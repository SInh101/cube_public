import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
  MoveSequenceResponseDto,
} from '@rubiks-learning/api-contract';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AnimationSpeedControl,
  CubeView,
  DEFAULT_ANIMATION_DURATION_MS,
  FaceControlPanel,
  MoveSequenceControl,
  type CubeMove,
  type FacePreview,
} from './components';
import './components/face-controls.css';

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
  const [isSequenceLoading, setIsSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState<string>();

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
      if (cubeId === null) return;

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
      } catch {
        setMoveError(true);
      }
    },
    [cubeId],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const face = event.key.toUpperCase();
      if (!isFaceMove(face)) return;

      const move: CubeMove = event.shiftKey ? `${face}'` : face;
      void applyMove(move);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyMove]);

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
      setPreparedMoves(dto.moves);
    } catch {
      setPreparedMoves([]);
      setSequenceError('Could not prepare move sequence.');
    } finally {
      setIsSequenceLoading(false);
    }
  }, [sequenceInput]);

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
            />
            <div className="cube-controls">
              <AnimationSpeedControl
                value={animationDurationMs}
                onChange={setAnimationDurationMs}
              />
              <FaceControlPanel
                state={cubeState}
                onMove={(move) => void applyMove(move)}
                onPreviewChange={setFacePreview}
              />
              <MoveSequenceControl
                sequenceInput={sequenceInput}
                preparedMoves={preparedMoves}
                isLoading={isSequenceLoading}
                errorMessage={sequenceError}
                onSequenceInputChange={(value) => {
                  setSequenceInput(value);
                  setSequenceError(undefined);
                }}
                onPrepare={() => void validateMoveSequence()}
                onApplyMove={(move) => void applyMove(move)}
              />
            </div>
          </div>
          {moveError && <p role="alert">Error applying move.</p>}
        </>
      )}
    </main>
  );
}

function isFaceMove(value: string): value is FaceMove {
  return (FACE_MOVES as readonly string[]).includes(value);
}
