import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migration = (name: string): string =>
  readFileSync(
    fileURLToPath(
      new URL(`../../../../supabase/migrations/${name}`, import.meta.url),
    ),
    'utf8',
  ).toLowerCase();

describe('Public repository Data API migrations', () => {
  it.each([
    ['202609080001_create_presets.sql', 'presets'],
    ['202609090001_create_cubes.sql', 'cubes'],
  ])(
    '%sはbrowser roleを拒否してservice_roleだけへCRUDを許可する',
    (file, table) => {
      const sql = migration(file);
      expect(sql).toContain(
        `revoke all on table public.${table} from anon, authenticated`,
      );
      expect(sql).toContain(
        `grant select, insert, update, delete on table public.${table} to service_role`,
      );
      expect(sql).not.toContain('create policy');
    },
  );
});
