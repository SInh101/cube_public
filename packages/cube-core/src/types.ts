export const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;

export type Face = (typeof FACES)[number];

export const COLORS = [
  'white',
  'red',
  'green',
  'yellow',
  'orange',
  'blue',
] as const;

export type Color = (typeof COLORS)[number];

export const MOVES = [
  'R',
  "R'",
  'R2',
  'L',
  "L'",
  'L2',
  'U',
  "U'",
  'U2',
  'D',
  "D'",
  'D2',
  'F',
  "F'",
  'F2',
  'B',
  "B'",
  'B2',
] as const;

export type Move = (typeof MOVES)[number];

export type FaceState = readonly [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
];

export interface CubeState {
  readonly faces: Readonly<Record<Face, FaceState>>;
}
