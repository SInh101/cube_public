import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabasePresetRepository } from './SupabasePresetRepository.js';
afterEach(() => vi.unstubAllGlobals());
describe('SupabasePresetRepository', () => {
  it('service role headerを付け、DB rowをdomain recordへ変換する', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: '00000000-0000-4000-8000-000000000009',
            name: 'Test',
            moves: 'R',
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
          },
        ]),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const repository = new SupabasePresetRepository(
      'https://example.supabase.co',
      'secret',
    );
    expect(await repository.list()).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000009',
        name: 'Test',
        moves: 'R',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-02',
      },
    ]);
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('apikey')).toBe('secret');
    expect(headers.get('authorization')).toBe('Bearer secret');
  });
});
