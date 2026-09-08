import { describe, expect, it } from 'vitest';

import { createCube } from '../application/createCube.js';
import { getCube } from '../application/getCube.js';
import { handleMoveSequenceRequest } from './handlers/handleMoveSequenceRequest.js';

describe('Milestone 7 MoveSequence REST contract', () => {
  it('M7-REST-01: sequenceを検証してMove配列を200で返す', async () => {
    const response = await handleMoveSequenceRequest(
      jsonRequest({ sequence: "R U R' U'" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ moves: ['R', 'U', "R'", "U'"] });
  });

  it('M7-REST-02: 連続空白と改行を正規化する', async () => {
    const response = await handleMoveSequenceRequest(
      jsonRequest(
        { sequence: "  R  \n U'  " },
        'application/json; charset=utf-8',
      ),
    );
    expect(await response.json()).toEqual({ moves: ['R', "U'"] });
  });

  it('M7-REST-03: 不正Moveを400 SEQUENCE_NOT_CORRECTで返す', async () => {
    const response = await handleMoveSequenceRequest(
      jsonRequest({ sequence: 'R X' }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: 'SEQUENCE_NOT_CORRECT',
        message: 'sequence contains an unsupported Move',
        details: [{ field: 'sequence', reason: 'token 2 is unsupported: X' }],
      },
    });
  });

  it('M7-REST-04: malformed JSONを400で返す', async () => {
    const response = await handleMoveSequenceRequest(
      new Request('http://localhost/api/move-sequences', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    );
    expect(response.status).toBe(400);
    expect(await errorCode(response)).toBe('JSON_NOT_CORRECT');
  });

  it('M7-REST-05: Content-Type不正を415で返す', async () => {
    const response = await handleMoveSequenceRequest(
      new Request('http://localhost/api/move-sequences', {
        method: 'POST',
        body: JSON.stringify({ sequence: 'R' }),
      }),
    );
    expect(response.status).toBe(415);
    expect(await errorCode(response)).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('M7-REST-06: GETをContent-Typeより先に405で返す', async () => {
    const response = await handleMoveSequenceRequest(
      new Request('http://localhost/api/move-sequences'),
    );
    expect(response.status).toBe(405);
    expect(await errorCode(response)).toBe('METHOD_NOT_ALLOWED');
  });

  it('M7-REST-07: requestによってCubeStateを変更しない', async () => {
    const { cubeId } = await createCube();
    const before = await getCube(cubeId);
    await handleMoveSequenceRequest(jsonRequest({ sequence: 'R U' }));
    expect(await getCube(cubeId)).toEqual(before);
  });

  it.each([null, [], {}, { sequence: 1 }, { sequence: 'R', extra: true }])(
    'M7-REST-08: DTO外のbody %#を400で返す',
    async (body) => {
      const response = await handleMoveSequenceRequest(jsonRequest(body));
      expect(response.status).toBe(400);
      expect(await errorCode(response)).toBe('REQUEST_NOT_CORRECT');
    },
  );
});

function jsonRequest(body: unknown, contentType = 'application/json'): Request {
  return new Request('http://localhost/api/move-sequences', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: JSON.stringify(body),
  });
}

async function errorCode(response: Response): Promise<string> {
  const body = (await response.json()) as { error: { code: string } };
  return body.error.code;
}
