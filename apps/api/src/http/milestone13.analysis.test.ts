import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
  ErrorResponseDto,
  SequenceAnalysisResponseDto,
} from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { handleCubeRequest } from './handleCubeRequest.js';

const API = 'http://localhost/api/cubes';

describe('Milestone 13 analysis REST contract', () => {
  it('M13-REST-01: sequence結果のcorner/edge cycleを分けて返す', async () => {
    const cubeId = await createCube();
    const response = await analyze(cubeId, 'R');
    const dto = (await response.json()) as SequenceAnalysisResponseDto;
    expect(response.status).toBe(200);
    expect(dto.analysis.corners.cycles.map((cycle) => cycle.length)).toEqual([
      4,
    ]);
    expect(dto.analysis.edges.cycles.map((cycle) => cycle.length)).toEqual([4]);
    expect(dto.analysis.corners.permutation).toHaveLength(8);
    expect(dto.analysis.edges.permutation).toHaveLength(12);
  });

  it('M13-REST-02: 3-cycle、fixed cubie、orientation changeを返す', async () => {
    const cubeId = await createCube();
    const dto = (await (
      await analyze(cubeId, "R U' R' D R U R' D'")
    ).json()) as SequenceAnalysisResponseDto;
    expect(dto.analysis.corners.threeCycles.length).toBeGreaterThan(0);
    expect(dto.analysis.corners.fixedCubieLabels.length).toBeGreaterThan(0);
    expect(
      dto.analysis.corners.orientationChanges.every(
        ({ delta }) => delta === 1 || delta === 2,
      ),
    ).toBe(true);
  });

  it('M13-REST-03: identityを明示し、解析元Cubeを変更しない', async () => {
    const cubeId = await createCube();
    const before = await getCube(cubeId);
    const response = await analyze(cubeId, "R R'");
    const dto = (await response.json()) as SequenceAnalysisResponseDto;
    expect(dto.analysis.identity).toBe(true);
    expect(dto.analysis.corners.identity).toBe(true);
    expect(dto.analysis.edges.identity).toBe(true);
    expect(dto.resultState).toEqual(before.state);
    expect((await getCube(cubeId)).state).toEqual(before.state);
  });

  it('M13-REST-04: 不正sequenceを位置付き400として返す', async () => {
    const cubeId = await createCube();
    const response = await analyze(cubeId, 'R X');
    const dto = (await response.json()) as ErrorResponseDto;
    expect(response.status).toBe(400);
    expect(dto.error.code).toBe('SEQUENCE_NOT_CORRECT');
    expect(dto.error.details).toEqual([
      { field: 'sequence', reason: 'token 2 is unsupported: X' },
    ]);
  });

  it('M13-REST-05: 存在しないCubeを404として返す', async () => {
    const response = await analyze('00000000-0000-4000-8000-000000000000', 'R');
    expect(response.status).toBe(404);
  });

  it('M13-REST-06: 不正UUID、method、media type、shapeを拒否する', async () => {
    expect((await analyze('invalid-id', 'R')).status).toBe(400);
    const cubeId = await createCube();
    expect(
      (
        await handleCubeRequest(
          new Request(`${API}/${cubeId}/analyses`, { method: 'GET' }),
        )
      ).status,
    ).toBe(405);
    expect(
      (
        await handleCubeRequest(
          new Request(`${API}/${cubeId}/analyses`, {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: '{}',
          }),
        )
      ).status,
    ).toBe(415);
    expect(
      (await analyzeBody(cubeId, { sequence: 'R', extra: true })).status,
    ).toBe(400);
  });

  it('M13-IN-01: Vercel rewrite後のquery routeでも解析できる', async () => {
    const cubeId = await createCube();
    const response = await handleCubeRequest(
      new Request(`${API}?cubeId=${cubeId}&operation=analysis`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sequence: 'R' }),
      }),
    );
    expect(response.status).toBe(200);
  });
});

async function createCube(): Promise<string> {
  const response = await handleCubeRequest(
    new Request(API, { method: 'POST' }),
  );
  return ((await response.json()) as CreateCubeResponseDto).cubeId;
}

async function getCube(cubeId: string): Promise<CubeStateResponseDto> {
  return (await (
    await handleCubeRequest(new Request(`${API}/${cubeId}`))
  ).json()) as CubeStateResponseDto;
}

function analyze(cubeId: string, sequence: string): Promise<Response> {
  return analyzeBody(cubeId, { sequence });
}

function analyzeBody(cubeId: string, body: unknown): Promise<Response> {
  return handleCubeRequest(
    new Request(`${API}/${cubeId}/analyses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}
