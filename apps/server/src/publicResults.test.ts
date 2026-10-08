import { describe, expect, it } from 'vitest';
import { isPublicRun } from './publicResults.js';

const released = new Map([['public-1', { scenarioHash: 'hash-1' }]]);

describe('public run visibility', () => {
  it('allows only runs with released frozen scenarios', () => {
    const manifest = JSON.stringify({ benchmarkPack: { scenarios: [{ id: 'public-1', scenarioHash: 'hash-1' }] } });
    expect(isPublicRun(manifest, [], released)).toBe(true);
    expect(isPublicRun(JSON.stringify({ benchmarkPack: { scenarios: [{ id: 'private-1', scenarioHash: 'other' }] } }), [], released)).toBe(false);
    expect(isPublicRun(JSON.stringify({ benchmarkPack: { scenarios: [{ id: 'public-1', scenarioHash: 'changed' }] } }), [], released)).toBe(false);
    expect(isPublicRun(JSON.stringify({ benchmarkPack: { scenarios: [] } }), ['public-1'], released)).toBe(false);
    expect(isPublicRun(JSON.stringify({ benchmarkPack: {} }), ['public-1'], released)).toBe(false);
  });

  it('checks legacy runs against their result scenario IDs', () => {
    expect(isPublicRun(null, ['public-1'], released)).toBe(true);
    expect(isPublicRun(null, ['public-1', 'private-1'], released)).toBe(false);
    expect(isPublicRun(null, [], released)).toBe(false);
  });
});
