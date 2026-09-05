import type { ErrorResponseDto } from '@rubiks-learning/api-contract';

import {
  createCube,
  CubeNotFoundError,
  getCube,
  resetCube,
} from '../application/index.js';
import { isUuid } from '../validation/isUuid.js';

type CubeRoute =
  | { readonly kind: 'collection' }
  | { readonly kind: 'resource'; readonly cubeId: string }
  | { readonly kind: 'reset'; readonly cubeId: string }
  | { readonly kind: 'unknown' };

/** Cube APIの全URIを単一のVercel Function内で振り分ける。 */
export async function handleCubeRequest(request: Request): Promise<Response> {
  const route = resolveRoute(new URL(request.url));

  if (route.kind === 'unknown') {
    return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Resource not found');
  }

  if (!acceptsMethod(route, request.method)) {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
  }

  if (route.kind === 'collection') {
    try {
      return Response.json(await createCube(), { status: 201 });
    } catch {
      return internalErrorResponse();
    }
  }

  const cubeId = decodeCubeId(route.cubeId);
  if (cubeId === undefined || !isUuid(cubeId)) {
    return errorResponse(
      400,
      'IDENTIFIER_NOT_CORRECT',
      'cubeId must be a valid UUID',
    );
  }

  try {
    const dto =
      route.kind === 'resource'
        ? await getCube(cubeId)
        : await resetCube(cubeId);
    return Response.json(dto, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof CubeNotFoundError) {
      return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Cube not found');
    }

    return internalErrorResponse();
  }
}

function resolveRoute(url: URL): CubeRoute {
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments[0] !== 'api' || segments[1] !== 'cubes') {
    return { kind: 'unknown' };
  }

  if (segments.length === 2) {
    const rewrittenCubeId = url.searchParams.get('cubeId');
    if (rewrittenCubeId === null) return { kind: 'collection' };

    return url.searchParams.get('operation') === 'reset'
      ? { kind: 'reset', cubeId: rewrittenCubeId }
      : { kind: 'resource', cubeId: rewrittenCubeId };
  }

  if (segments.length === 3) {
    const cubeId = segments[2];
    return cubeId === undefined
      ? { kind: 'unknown' }
      : { kind: 'resource', cubeId };
  }

  if (segments.length === 4 && segments[3] === 'reset') {
    const cubeId = segments[2];
    return cubeId === undefined
      ? { kind: 'unknown' }
      : { kind: 'reset', cubeId };
  }

  return { kind: 'unknown' };
}

function acceptsMethod(route: CubeRoute, method: string): boolean {
  return (
    (route.kind === 'collection' && method === 'POST') ||
    (route.kind === 'resource' && method === 'GET') ||
    (route.kind === 'reset' && method === 'PUT')
  );
}

function decodeCubeId(encodedCubeId: string): string | undefined {
  try {
    return decodeURIComponent(encodedCubeId);
  } catch {
    return undefined;
  }
}

function internalErrorResponse(): Response {
  return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'internal server error');
}

function errorResponse(
  status: number,
  code: ErrorResponseDto['error']['code'],
  message: string,
): Response {
  const dto: ErrorResponseDto = { error: { code, message } };
  return Response.json(dto, { status });
}
