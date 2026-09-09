type RequestHandler = (request: Request) => Response | Promise<Response>;

/** GitHub Pagesなど別originのFrontendからVercel Functionを安全に呼び出す。 */
export function withCors(handler: RequestHandler): RequestHandler {
  return async (request) => {
    const origin = process.env.CORS_ALLOWED_ORIGIN ?? '*';
    const headers = {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type',
      vary: 'Origin',
    };
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers });
    const response = await handler(request);
    const wrapped = new Response(response.body, response);
    for (const [name, value] of Object.entries(headers))
      wrapped.headers.set(name, value);
    return wrapped;
  };
}
