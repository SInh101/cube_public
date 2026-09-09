import { Cube } from '@rubiks-learning/cube-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabaseCubeRepository } from './SupabaseCubeRepository.js';

afterEach(() => vi.unstubAllGlobals());

describe('SupabaseCubeRepository', () => {
  it('Cube stateをupsertし、行から復元する', async () => {
    const state = Cube.solved().getState();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(Response.json([{ state }]));
    vi.stubGlobal('fetch', fetchMock);
    const repository = new SupabaseCubeRepository(
      'https://example.supabase.co',
      'server-secret',
    );
    const id = crypto.randomUUID();
    await repository.save(id, Cube.solved());
    expect((await repository.findById(id))?.getState()).toEqual(state);
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('prefer')).toBe(
      'resolution=merge-duplicates,return=minimal',
    );
    expect(headers.get('apikey')).toBe('server-secret');
  });

  it('新Secret keyはapikeyだけへ設定する', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const repository = new SupabaseCubeRepository(
      'https://example.supabase.co',
      'sb_secret_example',
    );
    await repository.save(crypto.randomUUID(), Cube.solved());
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('apikey')).toBe('sb_secret_example');
    expect(headers.has('authorization')).toBe(false);
  });
});
