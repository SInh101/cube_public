import type {
  CommutatorResponseDto,
  CreateCubeResponseDto,
  CubeStateResponseDto,
  ErrorResponseDto,
} from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { handleCubeRequest } from './handleCubeRequest.js';

const API = 'http://localhost/api/cubes';

describe('Milestone 11 commutator REST contract', () => {
  it('M11-REST-01: A/Bから交換子と4部分の境界を返す', async () => {
    const cubeId = await createCube();
    const response = await requestCommutator(cubeId, { a: 'R U', b: "F'" });
    const dto = (await response.json()) as CommutatorResponseDto;

    expect(response.status).toBe(200);
    expect(dto.sequence).toBe("R U F' U' R' F");
    expect(dto.moves).toEqual(['R', 'U', "F'", "U'", "R'", 'F']);
    expect(dto.boundaries).toEqual([
      { part: 'A', startIndex: 0, endIndex: 2, moves: ['R', 'U'] },
      { part: 'B', startIndex: 2, endIndex: 3, moves: ["F'"] },
      { part: 'A_INVERSE', startIndex: 3, endIndex: 5, moves: ["U'", "R'"] },
      { part: 'B_INVERSE', startIndex: 5, endIndex: 6, moves: ['F'] },
    ]);
  });

  it('M11-REST-02: 交換子を対象Cubeへ原子的に適用する', async () => {
    const cubeId = await createCube();
    const before = await getCube(cubeId);
    const response = await requestCommutator(cubeId, { a: 'R', b: 'U' });
    const applied = (await response.json()) as CommutatorResponseDto;
    const fetched = await getCube(cubeId);

    expect(applied.state).toEqual(fetched.state);
    expect(applied.state).not.toEqual(before.state);
  });

  it.each([
    ['a', { a: 'R X', b: 'U' }, 'X', 2],
    ['b', { a: 'R', b: 'U X' }, 'X', 2],
  ] as const)(
    'M11-REST-03/04: %sの不正Moveを位置付き400として返す',
    async (field, body, token, position) => {
      const cubeId = await createCube();
      const before = await getCube(cubeId);
      const response = await requestCommutator(cubeId, body);
      const dto = (await response.json()) as ErrorResponseDto;

      expect(response.status).toBe(400);
      expect(dto.error.code).toBe('SEQUENCE_NOT_CORRECT');
      expect(dto.error.details).toEqual([
        { field, reason: `token ${position} is unsupported: ${token}` },
      ]);
      expect((await getCube(cubeId)).state).toEqual(before.state);
    },
  );

  it('M11-REST-05: 存在しないCubeを404として返す', async () => {
    const response = await requestCommutator(
      '00000000-0000-4000-8000-000000000000',
      { a: 'R', b: 'U' },
    );
    const dto = (await response.json()) as ErrorResponseDto;

    expect(response.status).toBe(404);
    expect(dto.error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('M11-IV-01: request shapeを厳密に検証する', async () => {
    const cubeId = await createCube();
    const response = await requestCommutator(cubeId, { a: 'R' });
    expect(response.status).toBe(400);
    expect(((await response.json()) as ErrorResponseDto).error.code).toBe(
      'REQUEST_NOT_CORRECT',
    );
  });

  it('M11-IV-02: JSON以外のmedia typeを415にする', async () => {
    const cubeId = await createCube();
    const response = await handleCubeRequest(
      new Request(`${API}/${cubeId}/commutators`, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify({ a: 'R', b: 'U' }),
      }),
    );
    expect(response.status).toBe(415);
  });

  it('M11-IV-03: 不正cubeIdを400にする', async () => {
    const response = await requestCommutator('invalid-id', { a: 'R', b: 'U' });
    expect(response.status).toBe(400);
  });

  it('M11-IV-04: POST以外を405にする', async () => {
    const cubeId = await createCube();
    const response = await handleCubeRequest(
      new Request(`${API}/${cubeId}/commutators`),
    );
    expect(response.status).toBe(405);
  });

  it('M11-BD-01: 空のA/Bをidentityとして受理する', async () => {
    const cubeId = await createCube();
    const before = await getCube(cubeId);
    const response = await requestCommutator(cubeId, { a: '', b: '' });
    const dto = (await response.json()) as CommutatorResponseDto;
    expect(response.status).toBe(200);
    expect(dto.moves).toEqual([]);
    expect(dto.boundaries).toHaveLength(4);
    expect(dto.state).toEqual(before.state);
  });

  it('M11-IN-01: Vercel rewrite後のquery routeでも実行できる', async () => {
    const cubeId = await createCube();
    const response = await handleCubeRequest(
      new Request(`${API}?cubeId=${cubeId}&operation=commutator`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ a: 'R', b: 'U' }),
      }),
    );
    expect(response.status).toBe(200);
    expect(((await response.json()) as CommutatorResponseDto).sequence).toBe(
      "R U R' U'",
    );
  });
});

async function createCube(): Promise<string> {
  const response = await handleCubeRequest(
    new Request(API, { method: 'POST' }),
  );
  return ((await response.json()) as CreateCubeResponseDto).cubeId;
}

async function getCube(cubeId: string): Promise<CubeStateResponseDto> {
  const response = await handleCubeRequest(new Request(`${API}/${cubeId}`));
  return (await response.json()) as CubeStateResponseDto;
}

function requestCommutator(cubeId: string, body: unknown): Promise<Response> {
  return handleCubeRequest(
    new Request(`${API}/${cubeId}/commutators`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}
