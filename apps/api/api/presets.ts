import { handlePresetRequest } from '../src/http/handlePresetRequest.js';
import { withCors } from '../src/http/withCors.js';
export default { fetch: withCors(handlePresetRequest) };
