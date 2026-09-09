import type {
  CreateCubeResponseDto,
  CubeStateResponseDto,
  ErrorResponseDto,
} from '@rubiks-learning/api-contract';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { cubeRepository } from '../repository/sharedCubeRepository.js';
import { handleCubeRequest } from './handleCubeRequest.js';

const CUBES_ENDPOINT = 'http://localhost/api/cubes';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('M2-IV: invalid input and not found', () => {
  it('M2-IV-01: 存在しないCubeの取得は404を返す', async () => {
    const response = await GET(getRequest(crypto.randomUUID()));

    expect(response.status).toBe(404);
    await expect(errorDto(response)).resolves.toEqual({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Cube not found',
      },
    });
  });

  it('M2-IV-02: 存在しないCubeのresetは404を返す', async () => {
    const response = await RESET(resetRequest(crypto.randomUUID()));

    expect(response.status).toBe(404);
    await expect(errorDto(response)).resolves.toEqual({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Cube not found',
      },
    });
  });

  it.each(['', 'short-id', 'not_allowed!'])(
    'M2-IV-03: 不正なcubeId「%s」はrepository検索前に400となる',
    async (cubeId) => {
      const findById = vi.spyOn(cubeRepository, 'findById');

      const response = await RESET(invalidResetRequest(cubeId));

      expect(response.status).toBe(400);
      expect(findById).not.toHaveBeenCalled();
      await expect(errorDto(response)).resolves.toMatchObject({
        error: { code: 'IDENTIFIER_NOT_CORRECT' },
      });
    },
  );

  it('M2-IV-03: GETでも不正なcubeIdはrepository検索前に400となる', async () => {
    const findById = vi.spyOn(cubeRepository, 'findById');

    const response = await GET(getRequest('invalid-id'));

    expect(response.status).toBe(400);
    expect(findById).not.toHaveBeenCalled();
    await expect(errorDto(response)).resolves.toMatchObject({
      error: { code: 'IDENTIFIER_NOT_CORRECT' },
    });
  });

  it('M2-IV-05: 許可していないmethodはstateを変更せず405を返す', async () => {
    const cubeId = await createCubeThroughHttp();
    const stateBeforeRequest = (
      await cubeRepository.findById(cubeId)
    )?.getState();

    const response = await handleCubeRequest(
      new Request(`${CUBES_ENDPOINT}/${cubeId}`, { method: 'DELETE' }),
    );

    expect(response.status).toBe(405);
    await expect(errorDto(response)).resolves.toMatchObject({
      error: { code: 'METHOD_NOT_ALLOWED' },
    });
    expect((await cubeRepository.findById(cubeId))?.getState()).toEqual(
      stateBeforeRequest,
    );
  });
});

describe('M2-BD: identifier and request boundaries', () => {
  it('M2-BD-01: UUID形式の境界内だけを識別子として受理する', async () => {
    const validButMissingId = crypto.randomUUID();

    expect((await RESET(resetRequest(validButMissingId))).status).toBe(404);
    expect((await RESET(resetRequest(validButMissingId.slice(1)))).status).toBe(
      400,
    );
    expect((await RESET(resetRequest(`${validButMissingId}0`))).status).toBe(
      400,
    );
  });

  it('M2-BD-02: resetはrequest bodyなしで成功する', async () => {
    const cubeId = await createCubeThroughHttp();

    const response = await RESET(resetRequest(cubeId));

    expect(response.status).toBe(200);
  });
});

describe('M2-IN: endpoint integration', () => {
  it('M2-IN-01: HTTPだけで生成したCubeStateを取得できる', async () => {
    const cubeId = await createCubeThroughHttp();

    const response = await GET(getRequest(cubeId));
    const dto = (await response.json()) as CubeStateResponseDto;

    expect(response.status).toBe(200);
    expect(dto).toEqual({
      cubeId,
      state: (await cubeRepository.findById(cubeId))?.getState(),
    });
  });

  it('M2-IN-02: HTTPだけで生成、reset、取得を同じ識別子へ行える', async () => {
    const cubeId = await createCubeThroughHttp();

    const resetResponse = await RESET(resetRequest(cubeId));
    const getResponse = await GET(getRequest(cubeId));
    const getDto = (await getResponse.json()) as CubeStateResponseDto;

    expect(resetResponse.status).toBe(200);
    expect(getResponse.status).toBe(200);
    expect(getDto).toEqual({
      cubeId,
      state: (await cubeRepository.findById(cubeId))?.getState(),
    });
  });

  it('M2-IN-03: create、reset、errorのresponse schemaが一貫する', async () => {
    const createResponse = await POST();
    const createDto = (await createResponse.json()) as CreateCubeResponseDto;
    const resetResponse = await RESET(resetRequest(createDto.cubeId));
    const resetDto = (await resetResponse.json()) as CubeStateResponseDto;
    const getResponse = await GET(getRequest(createDto.cubeId));
    const getDto = (await getResponse.json()) as CubeStateResponseDto;
    const errorResponse = await RESET(resetRequest('invalid-id'));
    const invalidIdDto = await errorDto(errorResponse);

    expect(createResponse.headers.get('content-type')).toContain(
      'application/json',
    );
    expect(createDto).toMatchObject({
      cubeId: expect.any(String),
      state: { faces: { U: expect.any(Array) } },
    });
    expect(resetResponse.headers.get('content-type')).toContain(
      'application/json',
    );
    expect(resetDto).toEqual({
      cubeId: createDto.cubeId,
      state: expect.objectContaining({ faces: expect.any(Object) }),
    });
    expect(getResponse.headers.get('content-type')).toContain(
      'application/json',
    );
    expect(getDto).toEqual(resetDto);
    expect(errorResponse.headers.get('content-type')).toContain(
      'application/json',
    );
    expect(invalidIdDto).toEqual({
      error: {
        code: 'IDENTIFIER_NOT_CORRECT',
        message: expect.any(String),
      },
    });
  });
});

describe('M2-RG: domain boundary regression', () => {
  it('M2-RG-01: Cubeの生成とresetを繰り返しても不変条件を保つ', async () => {
    for (let count = 0; count < 10; count += 1) {
      const cubeId = await createCubeThroughHttp();
      const response = await RESET(resetRequest(cubeId));
      const dto = (await response.json()) as CubeStateResponseDto;
      const stickers = Object.values(dto.state.faces).flat();

      expect(response.status).toBe(200);
      expect(stickers).toHaveLength(54);
      expect(new Set(stickers)).toEqual(
        new Set(['white', 'red', 'green', 'yellow', 'orange', 'blue']),
      );

      for (const color of new Set(stickers)) {
        expect(stickers.filter((sticker) => sticker === color)).toHaveLength(9);
      }

      for (const face of Object.values(dto.state.faces)) {
        expect(new Set(face)).toEqual(new Set([face[4]]));
      }

      expect({
        U: dto.state.faces.U[4],
        R: dto.state.faces.R[4],
        F: dto.state.faces.F[4],
        D: dto.state.faces.D[4],
        L: dto.state.faces.L[4],
        B: dto.state.faces.B[4],
      }).toEqual({
        U: 'white',
        R: 'red',
        F: 'green',
        D: 'yellow',
        L: 'orange',
        B: 'blue',
      });
    }
  });

  it('M2-RG-02: response DTOの変更がrepository内のCubeStateを変更しない', async () => {
    const cubeId = await createCubeThroughHttp();
    const response = await RESET(resetRequest(cubeId));
    const responseBody = (await response.json()) as {
      state: { faces: { U: string[] } };
    };
    const stateBeforeMutation = (
      await cubeRepository.findById(cubeId)
    )?.getState();

    responseBody.state.faces.U[0] = 'tampered';

    expect((await cubeRepository.findById(cubeId))?.getState()).toEqual(
      stateBeforeMutation,
    );
  });
});

function resetRequest(cubeId: string): Request {
  return new Request(`${CUBES_ENDPOINT}/${cubeId}/reset`, { method: 'PUT' });
}

function invalidResetRequest(cubeId: string): Request {
  return cubeId === ''
    ? new Request(`${CUBES_ENDPOINT}?cubeId=&operation=reset`, {
        method: 'PUT',
      })
    : resetRequest(cubeId);
}

function getRequest(cubeId: string): Request {
  return new Request(`${CUBES_ENDPOINT}/${cubeId}`, { method: 'GET' });
}

async function createCubeThroughHttp(): Promise<string> {
  const response = await POST();
  const dto = (await response.json()) as CreateCubeResponseDto;

  expect(response.status).toBe(201);
  return dto.cubeId;
}

function POST(): Promise<Response> {
  return handleCubeRequest(new Request(CUBES_ENDPOINT, { method: 'POST' }));
}

function GET(request: Request): Promise<Response> {
  return handleCubeRequest(request);
}

function RESET(request: Request): Promise<Response> {
  return handleCubeRequest(request);
}

async function errorDto(response: Response): Promise<ErrorResponseDto> {
  return (await response.json()) as ErrorResponseDto;
}
