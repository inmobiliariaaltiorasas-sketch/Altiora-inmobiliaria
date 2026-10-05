import { describe, expect, it } from 'vitest';
import { PRODUCTION_URL, resolveSiteUrl } from './site-url';

describe('resolveSiteUrl', () => {
  it('uses the configured origin when it is set', () => {
    expect(resolveSiteUrl({ envUrl: 'https://staging.example.com', nodeEnv: 'production' })).toBe(
      'https://staging.example.com',
    );
  });

  it('strips trailing slashes from the configured origin', () => {
    expect(resolveSiteUrl({ envUrl: 'https://staging.example.com//', nodeEnv: 'production' })).toBe(
      'https://staging.example.com',
    );
  });

  it('falls back to the production origin in production when the env var is missing', () => {
    expect(resolveSiteUrl({ envUrl: undefined, nodeEnv: 'production' })).toBe(PRODUCTION_URL);
    expect(resolveSiteUrl({ envUrl: '   ', nodeEnv: 'production' })).toBe(PRODUCTION_URL);
  });

  it('never returns localhost in production, even if the env var points to it', () => {
    for (const envUrl of [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:3000',
      'http://[::1]:3000',
    ]) {
      expect(resolveSiteUrl({ envUrl, nodeEnv: 'production' })).toBe(PRODUCTION_URL);
    }
  });

  it('treats an unparseable env value as missing in production', () => {
    expect(resolveSiteUrl({ envUrl: 'not a url', nodeEnv: 'production' })).toBe(PRODUCTION_URL);
  });

  it('treats an unset NODE_ENV as production (safe default)', () => {
    expect(resolveSiteUrl({ envUrl: undefined, nodeEnv: undefined })).toBe(PRODUCTION_URL);
  });

  it('allows localhost in development', () => {
    expect(resolveSiteUrl({ envUrl: 'http://localhost:3000', nodeEnv: 'development' })).toBe(
      'http://localhost:3000',
    );
  });

  it('defaults to localhost:3000 in development when the env var is missing', () => {
    expect(resolveSiteUrl({ envUrl: undefined, nodeEnv: 'development' })).toBe(
      'http://localhost:3000',
    );
  });
});
