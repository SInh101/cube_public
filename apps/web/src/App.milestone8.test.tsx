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
  MoveSequenceControl: () => null,
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
    fireEvent.click(moveButton);
    await waitFor(() => expect(moveButton).toHaveProperty('disabled', true));

    fireEvent.click(moveButton);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'Complete animation' }));
    await waitFor(() => expect(moveButton).toHaveProperty('disabled', false));
  });

  it.todo('M8-PB-01: Playでsequenceを先頭から順に再生する');
  it.todo('M8-PB-02: Pauseで現在位置を保って停止する');
  it.todo('M8-PB-03: Nextで一手だけ進む');
  it.todo('M8-PB-04: Previousで一手だけ戻る');
  it.todo('M8-PB-05: Reverse Playで逆順・inverse Moveを再生する');
  it.todo('M8-PB-06: Resetで初期状態と再生位置へ戻す');
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
