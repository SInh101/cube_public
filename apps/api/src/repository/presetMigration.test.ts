import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationPath = fileURLToPath(
  new URL(
    '../../../../supabase/migrations/202609080001_create_presets.sql',
    import.meta.url,
  ),
);
const migration = readFileSync(migrationPath, 'utf8').toLowerCase();

describe('Milestone 9 preset migration', () => {
  it.each(['id', 'name', 'moves', 'created_at', 'updated_at'])(
    'M9-DB-01: %s columnを定義する',
    (column) => expect(migration).toMatch(new RegExp(`\\b${column}\\b`)),
  );

  it('M9-DB-02: idをdatabase生成UUID primary keyにする', () => {
    expect(migration).toMatch(
      /id uuid primary key default gen_random_uuid\(\)/u,
    );
  });

  it('M9-DB-03: update時にupdated_atを更新する', () => {
    expect(migration).toContain('create trigger presets_set_updated_at');
    expect(migration).toContain('new.updated_at = now()');
  });

  it('M9-DB-04: browserからの直接利用を許可するpolicyを作らない', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).not.toContain('create policy');
  });
});
