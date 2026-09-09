import { afterEach, describe, expect, it, vi } from 'vitest';
import { withCors } from './withCors.js';

afterEach(() => vi.unstubAllEnvs());

describe('withCors', () => {
  it('設定したFrontend originを通常応答へ付ける', async () => {
    vi.stubEnv('CORS_ALLOWED_ORIGIN', 'https://owner.github.io');
    const response = await withCors(() => Response.json({ ok: true }))(
      new Request('https://api.example.test/api/health'),
    );
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://owner.github.io',
    );
  });

  it('preflightへ204を返しhandlerを実行しない', async () => {
    const handler = vi.fn(() => new Response());
    const response = await withCors(handler)(
      new Request('https://api.example.test/api/cubes', { method: 'OPTIONS' }),
    );
    expect(response.status).toBe(204);
    expect(handler).not.toHaveBeenCalled();
  });
});
