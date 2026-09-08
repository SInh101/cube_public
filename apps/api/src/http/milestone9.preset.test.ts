import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPresetRepository } from '../repository/InMemoryPresetRepository.js';
import { handlePresetRequest } from './handlePresetRequest.js';
const URL = 'http://localhost/api/presets';
let repository: InMemoryPresetRepository;
beforeEach(() => {
  repository = new InMemoryPresetRepository();
});
describe('Milestone 9 preset REST contract', () => {
  it('M9-REST-01: createは201と正規化済みPresetを返す', async () => {
    const response = await call('', {
      method: 'POST',
      body: { name: '  Sexy Move  ', moves: "R U R'" },
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      name: 'Sexy Move',
      moves: "R U R'",
    });
  });
  it('M9-REST-02: listは作成済みPresetを返す', async () => {
    await create();
    const response = await call();
    expect(
      ((await response.json()) as { presets: unknown[] }).presets,
    ).toHaveLength(1);
  });
  it('M9-REST-03: IDで取得する', async () => {
    const preset = await create();
    const response = await call(`/${preset.id}`);
    expect(await response.json()).toMatchObject({
      id: preset.id,
      name: 'Test',
    });
  });
  it('M9-REST-04: nameとmovesを更新する', async () => {
    const preset = await create();
    const response = await call(`/${preset.id}`, {
      method: 'PATCH',
      body: { name: 'Updated', moves: 'U2' },
    });
    expect(await response.json()).toMatchObject({
      name: 'Updated',
      moves: 'U2',
    });
  });
  it('M9-REST-05: delete後は取得できない', async () => {
    const preset = await create();
    expect((await call(`/${preset.id}`, { method: 'DELETE' })).status).toBe(
      204,
    );
    expect((await call(`/${preset.id}`)).status).toBe(404);
  });
  it('M9-REST-06: repositoryを共有するrequest間で永続化する', async () => {
    const preset = await create();
    expect((await call(`/${preset.id}`)).status).toBe(200);
  });
  it.each([
    { name: '', moves: 'R' },
    { name: 'ok', moves: 'X' },
  ])('M9-REST-07: 不正入力を公開errorで返す', async (body) => {
    const response = await call('', { method: 'POST', body });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: 'REQUEST_NOT_CORRECT' },
    });
  });
  it('M9-REST-08: 存在しないPresetは404', async () => {
    expect((await call('/00000000-0000-4000-8000-000000000000')).status).toBe(
      404,
    );
  });
});
async function create(): Promise<{ id: string }> {
  const response = await call('', {
    method: 'POST',
    body: { name: 'Test', moves: 'R U' },
  });
  return response.json() as Promise<{ id: string }>;
}
function call(
  path = '',
  options: { method?: string; body?: unknown } = {},
): Promise<Response> {
  return handlePresetRequest(
    new Request(`${URL}${path}`, {
      method: options.method,
      headers:
        options.body === undefined
          ? undefined
          : { 'content-type': 'application/json' },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    }),
    repository,
  );
}
