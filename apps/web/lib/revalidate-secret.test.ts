import { describe, expect, it } from 'vitest';
import { isRevalidateRequestAuthorized, resolveRevalidateSecret } from './revalidate-secret';

describe('resolveRevalidateSecret', () => {
  it('uses the configured secret in any environment', () => {
    expect(resolveRevalidateSecret({ envSecret: 's3cret', nodeEnv: 'production' })).toBe('s3cret');
    expect(resolveRevalidateSecret({ envSecret: 's3cret', nodeEnv: 'development' })).toBe('s3cret');
  });

  it('falls back to the development default only in development', () => {
    expect(resolveRevalidateSecret({ envSecret: undefined, nodeEnv: 'development' })).toBe(
      'dev-revalidate-secret',
    );
  });

  it('has no secret in production when the env var is missing or blank', () => {
    expect(resolveRevalidateSecret({ envSecret: undefined, nodeEnv: 'production' })).toBeNull();
    expect(resolveRevalidateSecret({ envSecret: '  ', nodeEnv: 'production' })).toBeNull();
  });

  it('has no secret when NODE_ENV is unset or test', () => {
    expect(resolveRevalidateSecret({ envSecret: undefined, nodeEnv: undefined })).toBeNull();
    expect(resolveRevalidateSecret({ envSecret: undefined, nodeEnv: 'test' })).toBeNull();
  });
});

describe('isRevalidateRequestAuthorized', () => {
  it('accepts a matching header', () => {
    expect(isRevalidateRequestAuthorized('abc', 'abc')).toBe(true);
  });

  it('rejects a mismatching or missing header', () => {
    expect(isRevalidateRequestAuthorized('abc', 'abd')).toBe(false);
    expect(isRevalidateRequestAuthorized('abc', null)).toBe(false);
  });

  it('fails closed when no secret is configured, even for the default string', () => {
    expect(isRevalidateRequestAuthorized(null, 'dev-revalidate-secret')).toBe(false);
    expect(isRevalidateRequestAuthorized(null, null)).toBe(false);
    expect(isRevalidateRequestAuthorized(null, '')).toBe(false);
  });
});
