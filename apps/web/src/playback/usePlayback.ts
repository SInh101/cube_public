import type { CubeMove } from '../components/cubeViewModel';
import type { PlaybackState } from './playbackTypes';

/** Appから再生state machineへ渡す境界。 */
export interface UsePlaybackOptions {
  readonly moves: readonly CubeMove[];
  readonly isAnimating: boolean;
  readonly applyMove: (move: CubeMove) => Promise<void>;
}

/** PlaybackControlsとAppが利用する操作境界。 */
export interface UsePlaybackResult {
  readonly state: PlaybackState;
  readonly play: () => void;
  readonly pause: () => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly reversePlay: () => void;
  readonly reset: () => void;
  readonly handleAnimationComplete: (animationId: number) => void;
}

/*
 * TODO(M8 self): usePlayback(options: UsePlaybackOptions)を実装する。
 *
 * - 固定時間のtimerではなく、animation完了通知を次手への契機にする。
 * - reverseでは逆順に進むだけでなく、送信するMoveをinverseへ変換する。
 * - PauseはcurrentIndexを維持する。
 * - ResetがCube stateも戻す方法は、既存reset endpointとの接続を検討する。
 */
