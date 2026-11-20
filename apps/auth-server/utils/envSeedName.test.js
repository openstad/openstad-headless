import { expect, test } from 'vitest';

const envSeedName = require('./envSeedName');

test('does not fall back to development when NODE_ENV is unset', () => {
  expect(envSeedName(undefined)).toBeNull();
  expect(envSeedName('')).toBeNull();
});

test('returns NODE_ENV when set', () => {
  expect(envSeedName('development')).toBe('development');
});
