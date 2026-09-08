// @vitest-environment jsdom

import type { CubeStateResponseDto } from '@rubiks-learning/api-contract';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

vi.mock('./components', () => ({
  DEFAULT_ANIMATION_DURATION_MS: 240,
  AnimationSpeedControl: () => null,
  CubeView: ({
    animation,
    onAnimationComplete,
  }: {
    animation?: { id: number };
    onAnimationComplete?: (id: number) => void;
  }) => (
    <button
      type="button"
      aria-label="Complete animation"
      data-animation-id={animation?.id}
      onClick={() => animation && onAnimationComplete?.(animation.id)}
    />
  ),
  FaceControlPanel: ({
    onMove,
    disabled,
  }: {
    onMove: (move: string) => void;
    disabled?: boolean;
  }) => (
    <button type="button" disabled={disabled} onClick={() => onMove('R')}>
      R move
    </button>
  ),
  MoveSequenceControl: ({
    disabled,
    onPrepare,
  }: {
    disabled?: boolean;
    onPrepare: () => void;
  }) => (
    <>
      <button type="button" disabled={disabled}>
        Sequence move
      </button>
      <button type="button" disabled={disabled} onClick={onPrepare}>
        Prepare sequence
      </button>
    </>
  ),
  PlaybackControls: ({
    currentIndex,
    moveCount,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onReversePlay,
    onReset,
  }: {
    currentIndex: number;
    moveCount: number;
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onReversePlay: () => void;
    onReset: () => void;
  }) => (
    <div>
      <output aria-label="Playback position">
        {currentIndex} / {moveCount}
      </output>
      <button type="button" onClick={onPlay}>
        Play
      </button>
      <button type="button" onClick={onPause}>
        Pause
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
      <button type="button" onClick={onPrevious}>
        Previous
      </button>
      <button type="button" onClick={onReversePlay}>
        Reverse Play
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

const CUBE_ID = '00000000-0000-4000-8000-000000000008';
const STATE = solvedState();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Milestone 8 animation boundary', () => {
  it('M8-AN-01: 実回転中は操作をdisableし、完了通知後に再開する', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ cubeId: CUBE_ID }, 201))
      .mockResolvedValueOnce(response({ cubeId: CUBE_ID, state: STATE }))
      .mockResolvedValueOnce(response({ cubeId: CUBE_ID, state: STATE }));
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    const moveButton = await screen.findByRole('button', { name: 'R move' });
    const sequenceButton = screen.getByRole('button', {
      name: 'Sequence move',
    });
    fireEvent.click(moveButton);
    await waitFor(() => expect(moveButton).toHaveProperty('disabled', true));
    expect(sequenceButton).toHaveProperty('disabled', true);

    fireEvent.click(moveButton);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await completeAnimation(1);
    await waitFor(() => expect(moveButton).toHaveProperty('disabled', false));
    expect(sequenceButton).toHaveProperty('disabled', false);
  });

  it('M8-PB-01〜06: Playback操作を既存REST境界へ接続する', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ cubeId: CUBE_ID }, 201))
      .mockResolvedValueOnce(response({ cubeId: CUBE_ID, state: STATE }))
      .mockResolvedValueOnce(response({ sequence: 'R U', moves: ['R', 'U'] }))
      .mockImplementation(() =>
        Promise.resolve(response({ cubeId: CUBE_ID, state: STATE })),
      );
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    await screen.findByRole('button', { name: 'Prepare sequence' });
    fireEvent.click(screen.getByRole('button', { name: 'Prepare sequence' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Playback position').textContent).toContain(
        '0 / 2',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(lastRequestBody(fetchMock)).toEqual({ move: 'R' }),
    );
    await completeAnimation(1);
    await waitFor(() =>
      expect(screen.getByLabelText('Playback position').textContent).toContain(
        '1 / 2',
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'R move' })).toHaveProperty(
        'disabled',
        false,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await waitFor(() =>
      expect(lastRequestBody(fetchMock)).toEqual({ move: "R'" }),
    );
    await completeAnimation(2);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'R move' })).toHaveProperty(
        'disabled',
        false,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    await waitFor(() =>
      expect(lastRequestBody(fetchMock)).toEqual({ move: 'R' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    await completeAnimation(3);
    await waitFor(() =>
      expect(screen.getByLabelText('Playback position').textContent).toContain(
        '1 / 2',
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'R move' })).toHaveProperty(
        'disabled',
        false,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reverse Play' }));
    await waitFor(() =>
      expect(lastRequestBody(fetchMock)).toEqual({ move: "R'" }),
    );
    await completeAnimation(4);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'R move' })).toHaveProperty(
        'disabled',
        false,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(lastRequestBody(fetchMock)).toEqual({ move: 'R' }),
    );
    await completeAnimation(5);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        `/api/cubes/${CUBE_ID}/reset`,
        { method: 'PUT' },
      ),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Playback position').textContent).toContain(
        '0 / 2',
      ),
    );
  });
});

function solvedState(): CubeStateResponseDto['state'] {
  return {
    faces: {
      U: Array(9).fill('white'),
      R: Array(9).fill('red'),
      F: Array(9).fill('green'),
      D: Array(9).fill('yellow'),
      L: Array(9).fill('orange'),
      B: Array(9).fill('blue'),
    },
  } as unknown as CubeStateResponseDto['state'];
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function lastRequestBody(fetchMock: ReturnType<typeof vi.fn>): unknown {
  const body = fetchMock.mock.calls.at(-1)?.[1]?.body;
  return typeof body === 'string' ? JSON.parse(body) : undefined;
}

async function completeAnimation(animationId: number): Promise<void> {
  const button = screen.getByRole('button', { name: 'Complete animation' });
  await waitFor(() =>
    expect(button.getAttribute('data-animation-id')).toBe(String(animationId)),
  );
  fireEvent.click(button);
}
