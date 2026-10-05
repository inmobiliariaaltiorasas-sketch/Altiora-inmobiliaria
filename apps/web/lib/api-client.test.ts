import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './api-client';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: Partial<Response> | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('apiClient', () => {
  it('returns the parsed JSON body on success', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({ hello: 'world' }) });
    await expect(apiClient('/x')).resolves.toEqual({ hello: 'world' });
  });

  it('throws an ApiError carrying the HTTP status on a non-OK response', async () => {
    stubFetch({ ok: false, status: 404 });
    const error = await apiClient('/properties/nope').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe('API /properties/nope respondió 404');
  });

  it('keeps the original message format for other statuses', async () => {
    stubFetch({ ok: false, status: 503 });
    const error = (await apiClient('/blog').catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(503);
    expect(error.message).toBe('API /blog respondió 503');
  });

  it('lets network errors propagate untouched', async () => {
    const networkError = new TypeError('fetch failed');
    stubFetch(networkError);
    await expect(apiClient('/x')).rejects.toBe(networkError);
  });
});
