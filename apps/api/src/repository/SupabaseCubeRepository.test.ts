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
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Prefer: 'resolution=merge-duplicates,return=minimal',
      apikey: 'server-secret',
    });
  });
});
