import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
} from '@rubiks-learning/api-contract';
import { useEffect, useState } from 'react';

import { CubeView } from './components';

type LoadStatus = 'loading' | 'ready' | 'error';

export function App() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [cubeState, setCubeState] = useState<
    CubeStateResponseDto['state'] | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

    async function loadCube(): Promise<void> {
      try {
        const createResponse = await fetch(`${apiBaseUrl}/api/cubes`, {
          method: 'POST',
          signal: controller.signal,
        });
        if (!createResponse.ok) {
          throw new Error(`Cube creation failed: ${createResponse.status}`);
        }
        const { cubeId } =
          (await createResponse.json()) as CreateCubeResponseDto;

        const getResponse = await fetch(`${apiBaseUrl}/api/cubes/${cubeId}`, {
          signal: controller.signal,
        });
        if (!getResponse.ok) {
          throw new Error(`Cube retrieval failed: ${getResponse.status}`);
        }
        const dto = (await getResponse.json()) as CubeStateResponseDto;

        setCubeState(dto.state);
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

  return (
    <main>
      <h1>Rubik&apos;s Cube Learning</h1>
      {status === 'loading' && <p>Loading cube...</p>}
      {status === 'error' && <p role="alert">Error loading cube.</p>}
      {status === 'ready' && cubeState !== null && (
        <CubeView state={cubeState} />
      )}
    </main>
  );
}
