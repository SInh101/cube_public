export type MoveDto =
  | 'R'
  | "R'"
  | 'R2'
  | 'L'
  | "L'"
  | 'L2'
  | 'U'
  | "U'"
  | 'U2'
  | 'D'
  | "D'"
  | 'D2'
  | 'F'
  | "F'"
  | 'F2'
  | 'B'
  | "B'"
  | 'B2';

export interface MoveRequestDto {
  readonly move: MoveDto;
}
