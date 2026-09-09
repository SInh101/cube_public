import { Cube, type CubeState } from '@rubiks-learning/cube-core';
import type { CubeRepository } from './CubeRepository.js';

interface CubeRow {
  readonly state: CubeState;
}

export class SupabaseCubeRepository implements CubeRepository {
  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {}

  async save(cubeId: string, cube: Cube): Promise<void> {
    const response = await this.request('?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: cubeId, state: cube.getState() }),
    });
    if (!response.ok)
      throw new Error(`Cube repository failed: ${response.status}`);
  }

  async findById(cubeId: string): Promise<Cube | undefined> {
    const response = await this.request(
      `?id=eq.${encodeURIComponent(cubeId)}&select=state`,
    );
    if (!response.ok)
      throw new Error(`Cube repository failed: ${response.status}`);
    const rows = (await response.json()) as CubeRow[];
    return rows[0] === undefined ? undefined : Cube.fromState(rows[0].state);
  }

  private request(query: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('apikey', this.key);
    headers.set('content-type', 'application/json');
    if (!this.key.startsWith('sb_secret_')) {
      headers.set('authorization', `Bearer ${this.key}`);
    }
    return fetch(`${this.url}/rest/v1/cubes${query}`, {
      ...init,
      headers,
    });
  }
}
