import { afterEach, describe, expect, it, vi } from 'vitest';
import { listPropertyFacets } from './properties';

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

describe('listPropertyFacets', () => {
  it('returns the facets when the API answers 200', async () => {
    const facets = [{ citySlug: 'cartago', count: 2 }];
    stubFetch({ ok: true, status: 200, json: async () => facets });
    await expect(listPropertyFacets()).resolves.toEqual(facets);
  });

  it('returns an empty list when the API predates the endpoint (404)', async () => {
    stubFetch({ ok: false, status: 404 });
    await expect(listPropertyFacets()).resolves.toEqual([]);
  });

  it('returns an empty list on a 5xx so categories degrade instead of breaking the page', async () => {
    stubFetch({ ok: false, status: 503 });
    await expect(listPropertyFacets()).resolves.toEqual([]);
  });

  it('returns an empty list on a network failure', async () => {
    stubFetch(new TypeError('fetch failed'));
    await expect(listPropertyFacets()).resolves.toEqual([]);
  });

  it('returns an empty list when the body is not a list', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({ message: 'nope' }) });
    await expect(listPropertyFacets()).resolves.toEqual([]);
  });
});
