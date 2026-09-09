import type { PresetRecord, PresetRepository } from './PresetRepository.js';
type Row = {
  id: string;
  name: string;
  moves: string;
  created_at: string;
  updated_at: string;
};
export class SupabasePresetRepository implements PresetRepository {
  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {}
  async create(input: { name: string; moves: string }) {
    const rows = await this.request<Row[]>('', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(input),
    });
    return toRecord(required(rows[0]));
  }
  async list() {
    return (await this.request<Row[]>('?select=*&order=created_at.asc')).map(
      toRecord,
    );
  }
  async findById(id: string) {
    const rows = await this.request<Row[]>(
      `?id=eq.${encodeURIComponent(id)}&select=*`,
    );
    return rows[0] === undefined ? undefined : toRecord(rows[0]);
  }
  async update(id: string, input: { name?: string; moves?: string }) {
    const rows = await this.request<Row[]>(`?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(input),
    });
    return rows[0] === undefined ? undefined : toRecord(rows[0]);
  }
  async delete(id: string) {
    const rows = await this.request<Row[]>(`?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });
    return rows.length > 0;
  }
  private async request<T>(query: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set('apikey', this.key);
    headers.set('content-type', 'application/json');
    if (!this.key.startsWith('sb_secret_')) {
      headers.set('authorization', `Bearer ${this.key}`);
    }
    const response = await fetch(`${this.url}/rest/v1/presets${query}`, {
      ...init,
      headers,
    });
    if (!response.ok)
      throw new Error(`Preset repository failed: ${response.status}`);
    return response.json() as Promise<T>;
  }
}
function toRecord(row: Row): PresetRecord {
  return {
    id: row.id,
    name: row.name,
    moves: row.moves,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Preset repository returned no row');
  return value;
}
