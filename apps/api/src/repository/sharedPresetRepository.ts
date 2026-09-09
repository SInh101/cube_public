import { InMemoryPresetRepository } from './InMemoryPresetRepository.js';
import type { PresetRepository } from './PresetRepository.js';
import { SupabasePresetRepository } from './SupabasePresetRepository.js';
const url = process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
export const presetRepository: PresetRepository =
  url && key
    ? new SupabasePresetRepository(url.replace(/\/$/u, ''), key)
    : new InMemoryPresetRepository();
