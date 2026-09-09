// @vitest-environment jsdom

import type { SequenceAnalysisResponseDto } from '@rubiks-learning/api-contract';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CycleTeachingPanel,
  type CycleTeachingPanelProps,
} from './CycleTeachingPanel';

afterEach(cleanup);

describe('CycleTeachingPanel', () => {
  it('M14-CP-01: 3-cycle、orientation、fixed pieceを表示する', () => {
    renderPanel();
    expect(
      screen
        .getByRole('button', { name: '(URF → DLF → ULB)' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByText('Corner orientation: URF Δ1')).toBeTruthy();
    expect(screen.getByText('Fixed edges: UF')).toBeTruthy();
  });

  it('M14-CP-02: cycleと3D表示モードを選択できる', () => {
    const onSelectCycle = vi.fn();
    const onDisplayModeChange = vi.fn();
    renderPanel({ onSelectCycle, onDisplayModeChange });
    fireEvent.click(screen.getByRole('button', { name: '(URF → DLF → ULB)' }));
    fireEvent.click(
      screen.getByRole('radio', { name: 'Show position labels' }),
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Visualize stickers' }));
    expect(onSelectCycle).toHaveBeenCalledWith('corner', 0);
    expect(onDisplayModeChange).toHaveBeenCalledWith('labels');
    expect(onDisplayModeChange).toHaveBeenCalledWith('stickers');
  });

  it('M14-CP-03: playback未同期時は再生操作だけを無効にする', () => {
    renderPanel({ playbackDisabled: true });
    expect(
      (screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole('button', {
          name: 'Analyze sequence',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
});

function renderPanel(overrides: Partial<CycleTeachingPanelProps> = {}): void {
  render(
    <CycleTeachingPanel
      result={fixture()}
      selection={{ kind: 'corner', index: 0 }}
      displayMode="highlight"
      currentIndex={0}
      moveCount={3}
      status="idle"
      direction="forward"
      isLoading={false}
      onAnalyze={vi.fn()}
      onSelectCycle={vi.fn()}
      onDisplayModeChange={vi.fn()}
      onNext={vi.fn()}
      onPrevious={vi.fn()}
      onPlay={vi.fn()}
      onReversePlay={vi.fn()}
      {...overrides}
    />,
  );
}

function fixture(): SequenceAnalysisResponseDto {
  const group = {
    identity: false,
    permutation: [],
    cycles: [['URF', 'DLF', 'ULB']],
    threeCycles: [['URF', 'DLF', 'ULB']] as [string, string, string][],
    fixedCubieLabels: [],
    orientationChanges: [
      {
        cubieId: 'piece-1',
        from: [1, 1, 1] as const,
        to: [1, 1, 1] as const,
        fromLabel: 'URF',
        toLabel: 'URF',
        delta: 1 as const,
      },
    ],
  };
  return {
    cubeId: 'cube',
    state: {} as SequenceAnalysisResponseDto['state'],
    sequence: 'R U F',
    moves: ['R', 'U', 'F'],
    resultState: {} as SequenceAnalysisResponseDto['resultState'],
    analysis: {
      identity: false,
      corners: group,
      edges: {
        ...group,
        identity: true,
        cycles: [],
        threeCycles: [],
        fixedCubieLabels: ['UF'],
        orientationChanges: [],
      },
    },
  };
}
