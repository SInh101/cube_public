import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import {
  Cube,
  MOVES,
  type CubeState,
  type Move,
} from '@rubiks-learning/cube-core';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createLocalApiServer } from '../local/localServer.js';
import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { handleCubeRequest } from './handleCubeRequest.js';

const CUBES_URL = 'http://localhost/api/cubes';

describe('Milestone 3 Move REST API', () => {
  describe('Happy path', () => {
    it('M3-HP-01: Rを1手適用し、適用後のstateを返す', async () => {
      const cubeId = await createCube();

      const response = await sendMove(cubeId, 'R');

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        cubeId,
        state: expectedState(['R']),
      });
      await expect(getState(cubeId)).resolves.toEqual(expectedState(['R']));
    });

    it.each(MOVES)('M3-HP-02: Move「%s」を適用できる', async (move) => {
      const cubeId = await createCube();

      const response = await sendMove(cubeId, move);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        cubeId,
        state: expectedState([move]),
      });
    });
  });

  describe('State transition and property', () => {
    it('M3-ST-01: Rを4回適用するとidentityになる', async () => {
      const cubeId = await createCube();

      for (let count = 0; count < 4; count += 1) {
        expect((await sendMove(cubeId, 'R')).status).toBe(200);
      }

      await expect(getState(cubeId)).resolves.toEqual(expectedState([]));
    });

    it("M3-ST-02: Rの後にR'を適用するとidentityになる", async () => {
      const cubeId = await createCube();

      expect((await sendMove(cubeId, 'R')).status).toBe(200);
      expect((await sendMove(cubeId, "R'")).status).toBe(200);

      await expect(getState(cubeId)).resolves.toEqual(expectedState([]));
    });

    it('M3-ST-03: R2とRを2回適用したstateが等しい', async () => {
      const r2CubeId = await createCube();
      const twiceCubeId = await createCube();

      expect((await sendMove(r2CubeId, 'R2')).status).toBe(200);
      expect((await sendMove(twiceCubeId, 'R')).status).toBe(200);
      expect((await sendMove(twiceCubeId, 'R')).status).toBe(200);

      await expect(getState(r2CubeId)).resolves.toEqual(
        await getState(twiceCubeId),
      );
    });

    it('M3-ST-04: Move適用後のresetでsolvedへ戻る', async () => {
      const cubeId = await createCube();
      expect((await sendMove(cubeId, 'F')).status).toBe(200);

      const reset = await handleCubeRequest(
        new Request(`${CUBES_URL}/${cubeId}/reset`, { method: 'PUT' }),
      );

      expect(reset.status).toBe(200);
      await expect(getState(cubeId)).resolves.toEqual(expectedState([]));
    });

    it('M3-ST-05: Cube AへのMoveがCube Bへ影響しない', async () => {
      const firstCubeId = await createCube();
      const secondCubeId = await createCube();

      expect((await sendMove(firstCubeId, 'U')).status).toBe(200);

      await expect(getState(firstCubeId)).resolves.toEqual(
        expectedState(['U']),
      );
      await expect(getState(secondCubeId)).resolves.toEqual(expectedState([]));
    });
  });

  describe('Invalid input', () => {
    it('M3-IV-01: 存在しないCubeは404', async () => {
      const response = await sendMove(crypto.randomUUID(), 'R');

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Cube not found' },
      });
    });

    it('M3-IV-02: 不正cubeIdはrepository検索前に400', async () => {
      const findById = vi.spyOn(cubeRepository, 'findById');

      const response = await sendMove('invalid-id', 'R');

      await expectError(response, 400, 'IDENTIFIER_NOT_CORRECT');
      expect(findById).not.toHaveBeenCalled();
      findById.mockRestore();
    });

    it('M3-IV-03: 壊れたJSONは400 JSON_NOT_CORRECT', async () => {
      const cubeId = await createCube();
      const response = await sendRawMove(cubeId, '{"move":');

      await expectError(response, 400, 'JSON_NOT_CORRECT');
    });

    it.each([null, [], 'R', {}, { move: 1 }])(
      'M3-IV-04〜06: body shape不正「%j」は400 REQUEST_NOT_CORRECT',
      async (body) => {
        const cubeId = await createCube();
        const response = await sendRawMove(cubeId, JSON.stringify(body));

        await expectError(response, 400, 'REQUEST_NOT_CORRECT');
      },
    );

    it.each(['', 'r', ' R', 'R ', 'X', 'R3'])(
      'M3-IV-07: 未対応Move「%s」は400 MOVE_NOT_CORRECT',
      async (move) => {
        const cubeId = await createCube();
        const response = await sendRawMove(cubeId, JSON.stringify({ move }));

        await expectError(response, 400, 'MOVE_NOT_CORRECT');
      },
    );

    it('M3-IV-08: 不正requestはCubeStateを変更しない', async () => {
      const cubeId = await createCube();
      const before = await getState(cubeId);

      const invalidResponse = await sendRawMove(
        cubeId,
        JSON.stringify({ move: 'invalid' }),
      );
      await expectError(invalidResponse, 400, 'MOVE_NOT_CORRECT');

      await expect(getState(cubeId)).resolves.toEqual(before);
    });

    it.each([null, 'text/plain'])(
      'M3-IV-09: Content-Type「%s」は415',
      async (contentType) => {
        const cubeId = await createCube();
        const response = await sendRawMove(
          cubeId,
          JSON.stringify({ move: 'R' }),
          contentType,
        );

        await expectError(response, 415, 'UNSUPPORTED_MEDIA_TYPE');
      },
    );

    it('M3-IV-10: 未許可methodは405', async () => {
      const cubeId = await createCube();
      const response = await handleCubeRequest(
        new Request(`${CUBES_URL}/${cubeId}/moves`, { method: 'PUT' }),
      );

      await expectError(response, 405, 'METHOD_NOT_ALLOWED');
    });
  });

  describe('Boundary', () => {
    it.each(['R', "R'", 'R2'] as const)(
      'M3-BD-01〜03: 境界表現「%s」を受理する',
      async (move) => {
        const cubeId = await createCube();
        expect((await sendMove(cubeId, move)).status).toBe(200);
      },
    );

    it('M3-BD-04: 余分なfieldを拒否する', async () => {
      const cubeId = await createCube();
      const response = await sendRawMove(
        cubeId,
        JSON.stringify({ move: 'R', extra: true }),
      );

      await expectError(response, 400, 'REQUEST_NOT_CORRECT');
    });

    it('M3-BD-05: bodyなしは400 JSON_NOT_CORRECT', async () => {
      const cubeId = await createCube();
      const response = await sendRawMove(cubeId, '');

      await expectError(response, 400, 'JSON_NOT_CORRECT');
    });

    it('parameter付きapplication/jsonを受理する', async () => {
      const cubeId = await createCube();
      const response = await sendRawMove(
        cubeId,
        JSON.stringify({ move: 'R' }),
        'application/json; charset=utf-8',
      );

      expect(response.status).toBe(200);
    });
  });

  describe('Integration', () => {
    it('Vercel rewrite形式のquery routeでもMoveを適用できる', async () => {
      const cubeId = await createCube();
      const response = await handleCubeRequest(
        new Request(`${CUBES_URL}?cubeId=${cubeId}&operation=move`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ move: 'R' }),
        }),
      );

      expect(response.status).toBe(200);
      await expect(getState(cubeId)).resolves.toEqual(expectedState(['R']));
    });

    it('M3-IN-01: Cube作成、Move適用、GETをHTTP境界だけで実行する', async () => {
      const cubeId = await createCube();

      const move = await sendMove(cubeId, 'R');
      const state = await getState(cubeId);

      expect(move.status).toBe(200);
      expect(state).toEqual(expectedState(['R']));
    });

    it('M3-IN-02: 複数Move後にGETし、reset後はsolvedへ戻る', async () => {
      const cubeId = await createCube();
      const moves = ['R', 'U', "R'", "U'"] as const;

      for (const move of moves) {
        expect((await sendMove(cubeId, move)).status).toBe(200);
      }
      await expect(getState(cubeId)).resolves.toEqual(expectedState(moves));

      const reset = await handleCubeRequest(
        new Request(`${CUBES_URL}/${cubeId}/reset`, { method: 'PUT' }),
      );
      expect(reset.status).toBe(200);
      await expect(getState(cubeId)).resolves.toEqual(expectedState([]));
    });

    it('M3-IN-03: error responseがMilestone 2と同じshapeになる', async () => {
      const cubeId = await createCube();
      const response = await sendRawMove(cubeId, '{"move":');
      const body = (await response.json()) as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body).toEqual({
        error: {
          code: 'JSON_NOT_CORRECT',
          message: expect.any(String),
        },
      });
      expect(JSON.stringify(body)).not.toContain('stack');
    });
  });

  describe('Regression', () => {
    it.each(MOVES)('M3-RG-01: %s適用後もCube不変条件を保つ', async (move) => {
      const cubeId = await createCube();
      const response = await sendMove(cubeId, move);
      expect(response.status).toBe(200);
      const body = (await response.json()) as { state: CubeState };
      const stickers = Object.values(body.state.faces).flat();

      expect(stickers).toHaveLength(54);
      for (const color of new Set(stickers)) {
        expect(stickers.filter((value) => value === color)).toHaveLength(9);
      }
      expect(body.state.faces.U[4]).toBe('white');
      expect(body.state.faces.R[4]).toBe('red');
      expect(body.state.faces.F[4]).toBe('green');
      expect(body.state.faces.D[4]).toBe('yellow');
      expect(body.state.faces.L[4]).toBe('orange');
      expect(body.state.faces.B[4]).toBe('blue');
    });

    it('M3-RG-02: response変更がrepository内stateへ影響しない', async () => {
      const cubeId = await createCube();
      const response = await sendMove(cubeId, 'R');
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        state: { faces: { U: string[] } };
      };
      const before = await getState(cubeId);

      body.state.faces.U[0] = 'tampered';

      await expect(getState(cubeId)).resolves.toEqual(before);
    });

    it('M3-RG-03: create、GET、resetが引き続き成功する', async () => {
      const cubeId = await createCube();
      expect((await getCubeResponse(cubeId)).status).toBe(200);
      expect(
        (
          await handleCubeRequest(
            new Request(`${CUBES_URL}/${cubeId}/reset`, { method: 'PUT' }),
          )
        ).status,
      ).toBe(200);
    });
  });
});

describe('M3-IN-04: local server integration', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createLocalApiServer();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) =>
        error === undefined ? resolve() : reject(error),
      );
    });
  });

  it('実HTTPでCube作成、Move適用、状態取得ができる', async () => {
    const create = await fetch(`${baseUrl}/api/cubes`, { method: 'POST' });
    const { cubeId } = (await create.json()) as { cubeId: string };

    const move = await fetch(`${baseUrl}/api/cubes/${cubeId}/moves`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ move: 'R' }),
    });
    const get = await fetch(`${baseUrl}/api/cubes/${cubeId}`);

    expect(move.status).toBe(200);
    expect(get.status).toBe(200);
    await expect(get.json()).resolves.toEqual({
      cubeId,
      state: expectedState(['R']),
    });
  });
});

async function createCube(): Promise<string> {
  const response = await handleCubeRequest(
    new Request(CUBES_URL, { method: 'POST' }),
  );
  const body = (await response.json()) as { cubeId: string };
  expect(response.status).toBe(201);
  return body.cubeId;
}

function sendMove(cubeId: string, move: Move): Promise<Response> {
  return sendRawMove(cubeId, JSON.stringify({ move }));
}

function sendRawMove(
  cubeId: string,
  body: string,
  contentType: string | null = 'application/json',
): Promise<Response> {
  const headers =
    contentType === null ? undefined : { 'content-type': contentType };
  return handleCubeRequest(
    new Request(`${CUBES_URL}/${cubeId}/moves`, {
      method: 'POST',
      headers,
      body,
    }),
  );
}

async function getState(cubeId: string): Promise<CubeState> {
  const response = await getCubeResponse(cubeId);
  const body = (await response.json()) as { state: CubeState };
  return body.state;
}

function getCubeResponse(cubeId: string): Promise<Response> {
  return handleCubeRequest(
    new Request(`${CUBES_URL}/${cubeId}`, { method: 'GET' }),
  );
}

function expectedState(moves: readonly Move[]): CubeState {
  const cube = Cube.solved();
  for (const move of moves) cube.applyMove(move);
  return cube.getState();
}

async function expectError(
  response: Response,
  status: number,
  code: string,
): Promise<void> {
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toMatchObject({ error: { code } });
}
