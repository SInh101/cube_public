import type {
  AnalyzeSequenceRequestDto,
  ApiErrorCode,
  ErrorDetailDto,
  ErrorResponseDto,
} from '@rubiks-learning/api-contract';
import { InvalidMoveSequenceError } from '@rubiks-learning/cube-core';

import {
  analyzeCubeSequence,
  CubeNotFoundError,
} from '../../application/index.js';

/** sequenceによるCube変化を返す解析HTTP境界。 */
export async function handleSequenceAnalysisRequest(
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
  if (!isRequestDto(body)) {
    return errorResponse(
      400,
      'REQUEST_NOT_CORRECT',
      'Request body must contain only a string sequence',
    );
  }

  try {
    return Response.json(await analyzeCubeSequence(cubeId, body.sequence), {
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof InvalidMoveSequenceError) {
      return errorResponse(
        400,
        'SEQUENCE_NOT_CORRECT',
        'sequence contains an unsupported Move',
        [
          {
            field: 'sequence',
            reason: `token ${error.tokenIndex + 1} is unsupported: ${error.token}`,
          },
        ],
      );
    }
    if (error instanceof CubeNotFoundError) {
      return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Cube not found');
    }
    return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'internal server error');
  }
}

function isRequestDto(body: unknown): body is AnalyzeSequenceRequestDto {
  if (typeof body !== 'object' || body === null || Array.isArray(body))
    return false;
  const keys = Object.keys(body);
  return (
    keys.length === 1 &&
    keys[0] === 'sequence' &&
    typeof (body as Record<string, unknown>).sequence === 'string'
  );
}

function isJsonContentType(contentType: string | null): boolean {
  return (
    contentType?.split(';', 1)[0]?.trim().toLowerCase() === 'application/json'
  );
}

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: readonly ErrorDetailDto[],
): Response {
  const dto: ErrorResponseDto = {
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
  return Response.json(dto, { status });
}
