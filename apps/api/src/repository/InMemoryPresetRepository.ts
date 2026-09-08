import type { PresetRecord, PresetRepository } from './PresetRepository.js';
export class InMemoryPresetRepository implements PresetRepository {
  readonly #records = new Map<string, PresetRecord>();
  async create(input: { name: string; moves: string }): Promise<PresetRecord> {
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.#records.set(record.id, record);
    return record;
  }
  async list(): Promise<readonly PresetRecord[]> {
    return [...this.#records.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }
  async findById(id: string): Promise<PresetRecord | undefined> {
    return this.#records.get(id);
  }
  async update(
    id: string,
    input: { name?: string; moves?: string },
  ): Promise<PresetRecord | undefined> {
    const current = this.#records.get(id);
    if (!current) return undefined;
    const updated = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.#records.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    return this.#records.delete(id);
  }
}
