import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
} from '@rubiks-learning/api-contract';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CubeView, type CubeMove } from './components';

type LoadStatus = 'loading' | 'ready' | 'error';
type FaceMove = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';
type MoveCommand = FaceMove | `${FaceMove}'`;

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
    async (move: MoveCommand): Promise<void> => {
      if (cubeId === null) return;

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

      const move: MoveCommand = event.shiftKey ? `${face}'` : face;
      void applyMove(move);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyMove]);

  const cubeAnimation = useMemo(
    () => (lastMove === null ? undefined : { move: lastMove }),
    [lastMove],
  );

  return (
    <main>
      <h1>Rubik&apos;s Cube Learning</h1>
      {status === 'loading' && <p>Loading cube...</p>}
      {status === 'error' && <p role="alert">Error loading cube.</p>}
      {status === 'ready' && cubeState !== null && (
        <>
          <CubeView state={cubeState} animation={cubeAnimation} />
          <div aria-label="Cube moves" role="group">
            {FACE_MOVES.map((move) => (
              <button
                key={move}
                type="button"
                onClick={() => void applyMove(move)}
              >
                {move}
              </button>
            ))}
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
