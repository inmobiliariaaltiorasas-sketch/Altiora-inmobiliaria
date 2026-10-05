import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api-client';
import { getBlogPostBySlug } from './blog';
import { getPropertyBySlug } from './properties';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: Partial<Response> | Error) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      if (response instanceof Error) throw response;
      return response as Response;
    }),
  );
}

const fetchers = [
  { name: 'getPropertyBySlug', call: () => getPropertyBySlug('casa-1', 'es-CO') },
  { name: 'getBlogPostBySlug', call: () => getBlogPostBySlug('guia', 'es-CO') },
];

describe.each(fetchers)('$name', ({ call }) => {
  it('returns the body when the API answers 200', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({ slug: 'x' }) });
    await expect(call()).resolves.toEqual({ slug: 'x' });
  });

  it('returns null only when the API answers 404', async () => {
    stubFetch({ ok: false, status: 404 });
    await expect(call()).resolves.toBeNull();
  });

  it('throws on a 5xx so the page does not become a 404', async () => {
    stubFetch({ ok: false, status: 503 });
    await expect(call()).rejects.toBeInstanceOf(ApiError);
  });

  it('throws on other 4xx statuses', async () => {
    stubFetch({ ok: false, status: 400 });
    await expect(call()).rejects.toMatchObject({ status: 400 });
  });

  it('throws on a network failure', async () => {
    stubFetch(new TypeError('fetch failed'));
    await expect(call()).rejects.toThrow('fetch failed');
  });
});
