import type { PlaybackDirection, PlaybackStatus } from '../playback';

/** AppまたはusePlaybackから受け取る表示・操作境界。 */
export interface PlaybackControlsProps {
  readonly currentIndex: number;
  readonly moveCount: number;
  readonly status: PlaybackStatus;
  readonly direction: PlaybackDirection;
  readonly disabled?: boolean;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onReversePlay: () => void;
  readonly onReset: () => void;
}

/**
 * TODO(M8 self): 6操作と現在位置を表示する。
 * 自力実装開始前に完成UIを提供しないため、現時点では描画しない。
 */
export function PlaybackControls(props: PlaybackControlsProps) {
  void props;
  return null;
}
