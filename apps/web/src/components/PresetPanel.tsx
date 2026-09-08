import type { PresetResponseDto } from '@rubiks-learning/api-contract';
import { usePresets } from '../presets';
import { PresetManager } from './PresetManager';
export interface PresetPanelProps {
  readonly apiBaseUrl: string;
  readonly onPlay: (preset: PresetResponseDto) => void;
  readonly onReversePlay: (preset: PresetResponseDto) => void;
}
export function PresetPanel({
  apiBaseUrl,
  onPlay,
  onReversePlay,
}: PresetPanelProps) {
  const presets = usePresets(apiBaseUrl);
  return (
    <PresetManager
      presets={presets.presets}
      status={presets.status}
      error={presets.error}
      onCreate={(input) => void presets.create(input)}
      onUpdate={(id, input) => void presets.update(id, input)}
      onDelete={(id) => void presets.remove(id)}
      onPlay={onPlay}
      onReversePlay={onReversePlay}
    />
  );
}
