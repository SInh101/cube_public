import { handleMoveSequenceRequest } from '../src/http/handlers/handleMoveSequenceRequest.js';
import { withCors } from '../src/http/withCors.js';

/** Vercel Function entry point for /api/move-sequences. */
export default {
  fetch: withCors(handleMoveSequenceRequest),
};
