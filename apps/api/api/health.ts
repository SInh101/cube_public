export default {
  fetch(): Response {
    return Response.json({ status: 'ok' }, { status: 200 });
  },
};
