import { handleCubeRequest } from '../src/http/handleCubeRequest.js';
import { withCors } from '../src/http/withCors.js';

export default {
  fetch: withCors(handleCubeRequest),
};
