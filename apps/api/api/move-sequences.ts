import { handleMoveSequenceRequest } from '../src/http/handlers/handleMoveSequenceRequest.js';

/** Vercel Function entry point for /api/move-sequences. */
export default {
  fetch: handleMoveSequenceRequest,
};
