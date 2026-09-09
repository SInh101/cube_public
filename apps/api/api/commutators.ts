import { handleCommutatorRequest } from '../src/http/handlers/handleCommutatorRequest.js';
import { withCors } from '../src/http/withCors.js';

export default {
  fetch: withCors(handleCommutatorRequest),
};
