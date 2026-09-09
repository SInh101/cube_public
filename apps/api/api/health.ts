import { withCors } from '../src/http/withCors.js';

export default {
  fetch: withCors((): Response => {
    return Response.json({ status: 'ok' }, { status: 200 });
  }),
};
