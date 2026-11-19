import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_URL } from './config';
import { ApiError, api } from './api';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const ok = (data: unknown) => json(200, { success: true, data });
const unauth = () => json(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Please log in' } });

/** Fake API: the access cookie is "expired" until /auth/refresh is called once. */
function fakeServer({ refreshOk = true } = {}) {
  let session = false;
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = String(input).replace(API_URL, '');
    calls.push(path);
    if (path === '/auth/refresh') {
      await new Promise((r) => setTimeout(r, 5));
      if (!refreshOk) return unauth();
      session = true;
      return ok({ user: {} });
    }
    return session ? ok({ path }) : unauth();
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls };
}

describe('api client session refresh', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refreshes once on 401 and replays the request', async () => {
    const { calls } = fakeServer();
    await expect(api('/cart')).resolves.toEqual({ path: '/cart' });
    expect(calls).toEqual(['/cart', '/auth/refresh', '/cart']);
  });

  it('shares one refresh between concurrent 401s', async () => {
    const { calls } = fakeServer();
    await Promise.all([api('/a'), api('/b'), api('/c')]);
    expect(calls.filter((c) => c === '/auth/refresh')).toHaveLength(1);
  });

  it('surfaces the 401 when the refresh fails, without looping', async () => {
    const { calls } = fakeServer({ refreshOk: false });
    await expect(api('/cart')).rejects.toMatchObject({ status: 401 } satisfies Partial<ApiError>);
    expect(calls).toEqual(['/cart', '/auth/refresh']);
  });

  it('never tries to refresh for login itself', async () => {
    const { calls } = fakeServer();
    await expect(api('/auth/login', { method: 'POST', body: {} })).rejects.toBeInstanceOf(ApiError);
    expect(calls).toEqual(['/auth/login']);
  });
});
