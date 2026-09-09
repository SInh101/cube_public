import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
  ErrorResponseDto,
  SequenceAnalysisResponseDto,
} from '@rubiks-learning/api-contract';
import { describe, expect, it } from 'vitest';

import { handleCubeRequest } from './handleCubeRequest.js';

const API = 'http://localhost/api/cubes';
const THREE_CYCLE = "R' D R U2 R' D' R U2";

describe('Milestone 14 conjugated 3-cycle analysis', () => {
  it("X A X'を構成し、元と移動後のcycleを返す", async () => {
    const cubeId = await createCube();
    const dto = await analyze(cubeId, THREE_CYCLE, 'U');

    expect(dto.sequence).toBe(`U ${THREE_CYCLE} U'`);
    expect(dto.conjugation).toMatchObject({
      setupSequence: 'U',
      inverseSetupSequence: "U'",
      baseSequence: THREE_CYCLE,
      conjugatedSequence: `U ${THREE_CYCLE} U'`,
      preservesThreeCycle: true,
    });
    expect(dto.conjugation?.baseAnalysis.corners.threeCycles).not.toEqual(
      dto.analysis.corners.threeCycles,
    );
  });

  it('共役解析は保存中のCubeを変更しない', async () => {
    const cubeId = await createCube();
    const before = await getCube(cubeId);
    await analyze(cubeId, THREE_CYCLE, 'F R');
    expect(await getCube(cubeId)).toEqual(before);
  });

  it('元手順がpure 3-cycleでない場合は維持判定をfalseにする', async () => {
    const cubeId = await createCube();
    const dto = await analyze(cubeId, 'R', 'U');
    expect(dto.conjugation?.preservesThreeCycle).toBe(false);
  });

  it('不正なsetupをconjugate fieldの400として返す', async () => {
    const cubeId = await createCube();
    const response = await requestAnalysis(cubeId, THREE_CYCLE, 'U X');
    const error = (await response.json()) as ErrorResponseDto;
    expect(response.status).toBe(400);
    expect(error.error).toMatchObject({
      code: 'SEQUENCE_NOT_CORRECT',
      details: [{ field: 'conjugate', reason: 'token 2 is unsupported: X' }],
    });
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

async function analyze(
  cubeId: string,
  sequence: string,
  conjugate: string,
): Promise<SequenceAnalysisResponseDto> {
  return (await (
    await requestAnalysis(cubeId, sequence, conjugate)
  ).json()) as SequenceAnalysisResponseDto;
}

function requestAnalysis(
  cubeId: string,
  sequence: string,
  conjugate: string,
): Promise<Response> {
  return handleCubeRequest(
    new Request(`${API}/${cubeId}/analyses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sequence, conjugate }),
    }),
  );
}
