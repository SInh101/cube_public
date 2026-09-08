// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePlayback } from './usePlayback';

describe('usePlayback', () => {
  it('M8-PB-01: Playはanimation完了ごとにsequenceを一手ずつ進める', async () => {
    const applyMove = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlayback({ moves: ['R', 'U'], isAnimating: false, applyMove }),
    );

    act(() => result.current.play());
    await waitFor(() => expect(applyMove).toHaveBeenCalledWith('R'));
    expect(applyMove).toHaveBeenCalledTimes(1);

    act(() => result.current.handleAnimationComplete(1));
    await waitFor(() => expect(applyMove).toHaveBeenCalledWith('U'));
    expect(applyMove).toHaveBeenCalledTimes(2);

    act(() => result.current.handleAnimationComplete(2));
    expect(result.current.state.currentIndex).toBe(2);
    expect(result.current.state.status).toBe('idle');
  });

  it('M8-PB-03: Nextは一手だけ進め、自動再生を開始しない', async () => {
    const applyMove = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlayback({ moves: ['R', 'U'], isAnimating: false, applyMove }),
    );

    act(() => result.current.next());
    await waitFor(() => expect(applyMove).toHaveBeenCalledWith('R'));
    act(() => result.current.handleAnimationComplete(1));

    expect(result.current.state.currentIndex).toBe(1);
    expect(result.current.state.status).toBe('idle');
    expect(applyMove).toHaveBeenCalledTimes(1);
  });
});
