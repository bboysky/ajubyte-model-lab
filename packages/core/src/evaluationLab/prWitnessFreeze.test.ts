import { existsSync } from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the private PR-witness development artifact out of the public package', () => {
  expect(existsSync('data/scenarios/pr-witness-development.json')).toBe(false);
});
