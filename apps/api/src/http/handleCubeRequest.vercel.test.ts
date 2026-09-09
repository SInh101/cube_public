import { describe, expect, it } from 'vitest';

import { handleCubeRequest } from './handleCubeRequest.js';

describe('Vercel request URL compatibility', () => {
  it('accepts a relative request target supplied by a server adapter', async () => {
    const request = {
      method: 'DELETE',
      url: '/api/cubes',
    } as Request;

    const response = await handleCubeRequest(request);

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'METHOD_NOT_ALLOWED' },
    });
  });
});
