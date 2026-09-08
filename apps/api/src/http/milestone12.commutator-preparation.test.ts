import type {
  ErrorResponseDto,
  PreparedCommutatorResponseDto,
} from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { handleCommutatorRequest } from './handlers/handleCommutatorRequest.js';

const URL = 'http://localhost/api/commutators';

describe('Milestone 12 commutator preparation REST contract', () => {
  it('M12-REST-01: Cubeを変更せず交換子と境界を準備する', async () => {
    const response = await request({ a: 'R', b: 'U' });
    const dto = (await response.json()) as PreparedCommutatorResponseDto;

    expect(response.status).toBe(200);
    expect(dto.sequence).toBe("R U R' U'");
    expect(dto.moves).toEqual(['R', 'U', "R'", "U'"]);
    expect(dto.boundaries.map((boundary) => boundary.part)).toEqual([
      'A',
      'B',
      'A_INVERSE',
      'B_INVERSE',
    ]);
    expect(dto).not.toHaveProperty('cubeId');
    expect(dto).not.toHaveProperty('state');
  });

  it('M12-REST-02: A/Bの不正Moveをfield付き400にする', async () => {
    const response = await request({ a: 'R', b: 'X' });
    const dto = (await response.json()) as ErrorResponseDto;
    expect(response.status).toBe(400);
    expect(dto.error.details?.[0]?.field).toBe('b');
  });

  it('M12-REST-03: request shapeを厳密に検証する', async () => {
    const response = await request({ a: 'R', b: 'U', apply: true });
    expect(response.status).toBe(400);
    expect(((await response.json()) as ErrorResponseDto).error.code).toBe(
      'REQUEST_NOT_CORRECT',
    );
  });
});

function request(body: unknown): Promise<Response> {
  return handleCommutatorRequest(
    new Request(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}
