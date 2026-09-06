import type {
  ApiErrorCode,
  ErrorResponseDto,
  MoveRequestDto,
} from '@rubiks-learning/api-contract';
import { MOVES, type Move } from '@rubiks-learning/cube-core';

import { applyMoveToCube } from '../../application/applyMoveToCube.js';
import { CubeNotFoundError } from '../../application/CubeNotFoundError.js';

export async function handleApplyMoveRequest(
  request: Request,
  cubeId: string,
): Promise<Response> {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return errorResponse(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Content-Type must be application/json',
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      'JSON_NOT_CORRECT',
      'Request body must be valid JSON',
    );
  }

  if (!isMoveRequestDto(body)) {
    return errorResponse(
      400,
      'REQUEST_NOT_CORRECT',
      'Request body does not match the required shape',
    );
  }

  if (!isMove(body.move)) {
    return errorResponse(
      400,
      'MOVE_NOT_CORRECT',
      'move must be one of the supported Move values',
    );
  }

  try {
    return Response.json(await applyMoveToCube(cubeId, body.move), {
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof CubeNotFoundError) {
      return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Cube not found');
    }

    return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'internal server error');
  }
}

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) return false;
  return (
    contentType.split(';', 1)[0]?.trim().toLowerCase() === 'application/json'
  );
}

function isMoveRequestDto(value: unknown): value is MoveRequestDto {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return (
    keys.length === 1 &&
    keys[0] === 'move' &&
    typeof (value as Record<string, unknown>).move === 'string'
  );
}

function isMove(value: string): value is Move {
  return (MOVES as readonly string[]).includes(value);
}

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
): Response {
  const dto: ErrorResponseDto = { error: { code, message } };
  return Response.json(dto, { status });
}
