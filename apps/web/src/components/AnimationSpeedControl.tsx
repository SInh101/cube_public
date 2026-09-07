export const ANIMATION_SPEEDS = {
  fast: { label: 'Fast', durationMs: 120 },
  standard: { label: 'Standard', durationMs: 240 },
  slow: { label: 'Slow', durationMs: 600 },
} as const;

export type AnimationSpeed = keyof typeof ANIMATION_SPEEDS;

export interface AnimationSpeedControlProps {
  readonly value: AnimationSpeed;
  readonly onChange: (speed: AnimationSpeed) => void;
}

export function AnimationSpeedControl({
  value,
  onChange,
}: AnimationSpeedControlProps) {
  return (
    <label className="animation-speed-control">
      <span>Animation speed</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AnimationSpeed)}
      >
        {Object.entries(ANIMATION_SPEEDS).map(([speed, setting]) => (
          <option key={speed} value={speed}>
            {setting.label}
          </option>
        ))}
      </select>
    </label>
  );
}
