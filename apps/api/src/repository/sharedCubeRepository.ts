import { InMemoryCubeRepository } from './InMemoryCubeRepository.js';
import { SupabaseCubeRepository } from './SupabaseCubeRepository.js';
import type { CubeRepository } from './CubeRepository.js';

/** 各handlerで同じin-memory stateを参照する共有instance。 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const cubeRepository: CubeRepository =
  url && key
    ? new SupabaseCubeRepository(url.replace(/\/$/u, ''), key)
    : new InMemoryCubeRepository();
