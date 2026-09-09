import type {
  AnalyzedCubieKindDto,
  SequenceAnalysisResponseDto,
} from '@rubiks-learning/api-contract';
import { useState, type FormEvent } from 'react';
import type { CycleSelection } from '../analysis/cycleVisualization';
import type {
  PlaybackDirection,
  PlaybackStatus,
} from '../playback/playbackTypes';
import './cycle-teaching-panel.css';

export type CycleDisplayMode = 'highlight' | 'labels' | 'stickers';
export interface CycleTeachingPanelProps {
  readonly result?: SequenceAnalysisResponseDto;
  readonly selection?: CycleSelection;
  readonly displayMode: CycleDisplayMode;
  readonly currentIndex: number;
  readonly moveCount: number;
  readonly status: PlaybackStatus;
  readonly direction: PlaybackDirection;
  readonly isLoading: boolean;
  readonly disabled?: boolean;
  readonly playbackDisabled?: boolean;
  readonly errorMessage?: string;
  readonly onAnalyze: (sequence: string) => void;
  readonly onSelectCycle: (kind: AnalyzedCubieKindDto, index: number) => void;
  readonly onDisplayModeChange: (mode: CycleDisplayMode) => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onPlay: () => void;
  readonly onReversePlay: () => void;
}

export function CycleTeachingPanel(props: CycleTeachingPanelProps) {
  const [sequence, setSequence] = useState("R' D R U2 R' D' R U2");
  const isBusy = props.disabled || props.status === 'playing';
  const playbackBusy = isBusy || props.playbackDisabled;
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    props.onAnalyze(sequence);
  };
  return (
    <section className="cycle-teaching" aria-labelledby="cycle-title">
      <h2 id="cycle-title">3-cycle analysis</h2>
      <form className="cycle-teaching__form" onSubmit={submit}>
        <label>
          Sequence
          <input
            value={sequence}
            disabled={isBusy || props.isLoading}
            onChange={(event) => setSequence(event.target.value)}
          />
        </label>
        <button type="submit" disabled={isBusy || props.isLoading}>
          {props.isLoading ? 'Analyzing…' : 'Analyze sequence'}
        </button>
      </form>
      {props.errorMessage !== undefined && (
        <p role="alert">{props.errorMessage}</p>
      )}
      {props.result !== undefined && (
        <>
          <p>
            {props.result.analysis.identity
              ? 'Identity'
              : 'Permutation detected'}
          </p>
          <div className="cycle-teaching__cycles">
            {(['corner', 'edge'] as const).map((kind) => {
              const cycles =
                kind === 'corner'
                  ? props.result!.analysis.corners.threeCycles
                  : props.result!.analysis.edges.threeCycles;
              return (
                <div key={kind}>
                  <h3>
                    {kind === 'corner' ? 'Corner 3-cycles' : 'Edge 3-cycles'}
                  </h3>
                  {cycles.length === 0 ? (
                    <p>None</p>
                  ) : (
                    cycles.map((cycle, index) => (
                      <button
                        key={cycle.join('-')}
                        type="button"
                        aria-pressed={
                          props.selection?.kind === kind &&
                          props.selection.index === index
                        }
                        onClick={() => props.onSelectCycle(kind, index)}
                      >
                        ({cycle.join(' → ')})
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
          <div className="cycle-teaching__details">
            <p>
              Corner orientation:{' '}
              {formatOrientations(
                props.result.analysis.corners.orientationChanges,
              )}
            </p>
            <p>
              Edge orientation:{' '}
              {formatOrientations(
                props.result.analysis.edges.orientationChanges,
              )}
            </p>
            <p>
              Fixed corners:{' '}
              {props.result.analysis.corners.fixedCubieLabels.join(', ') ||
                'none'}
            </p>
            <p>
              Fixed edges:{' '}
              {props.result.analysis.edges.fixedCubieLabels.join(', ') ||
                'none'}
            </p>
          </div>
          <fieldset className="cycle-teaching__modes">
            <legend>3D display</legend>
            <label>
              <input
                type="radio"
                name="cycle-display"
                checked={props.displayMode === 'highlight'}
                onChange={() => props.onDisplayModeChange('highlight')}
              />
              Highlight pieces
            </label>
            <label>
              <input
                type="radio"
                name="cycle-display"
                checked={props.displayMode === 'labels'}
                onChange={() => props.onDisplayModeChange('labels')}
              />
              Show position labels
            </label>
            <label>
              <input
                type="radio"
                name="cycle-display"
                checked={props.displayMode === 'stickers'}
                onChange={() => props.onDisplayModeChange('stickers')}
              />
              Visualize stickers
            </label>
          </fieldset>
          <p aria-label="Cycle playback position">
            {props.currentIndex} / {props.moveCount} ({props.direction})
          </p>
          <div className="cycle-teaching__playback">
            <button
              type="button"
              disabled={playbackBusy || props.currentIndex <= 0}
              onClick={props.onPrevious}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={playbackBusy || props.currentIndex >= props.moveCount}
              onClick={props.onNext}
            >
              Next
            </button>
            <button
              type="button"
              disabled={playbackBusy || props.currentIndex >= props.moveCount}
              onClick={props.onPlay}
            >
              Play all
            </button>
            <button
              type="button"
              disabled={playbackBusy || props.currentIndex <= 0}
              onClick={props.onReversePlay}
            >
              Reverse all
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function formatOrientations(
  changes: SequenceAnalysisResponseDto['analysis']['corners']['orientationChanges'],
): string {
  return changes.length === 0
    ? 'none'
    : changes
        .map(({ fromLabel, delta }) => `${fromLabel} Δ${delta}`)
        .join(', ');
}
