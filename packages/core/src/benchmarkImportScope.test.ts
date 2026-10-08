import path from 'node:path';
import { describe, expect, it } from 'vitest';
// The production importer is plain Node ESM so users can run it without a TS loader.
// @ts-expect-error no declaration file is needed for this local script module
import { loadBenchmarkImportScope } from '../../../scripts/benchmark-import-scope.mjs';

describe('released benchmark import scope', () => {
  it('imports the canonical public bank without bundling other scenario arrays', () => {
    const scope = loadBenchmarkImportScope(path.resolve('data/scenarios'));
    expect(scope.scenarios).toHaveLength(615);
    expect(scope.scenarios.filter((scenario: any) => scenario.dimension === 'program')).toHaveLength(150);
    expect([...scope.accidentalBundledIds]).toHaveLength(0);
  });
});
