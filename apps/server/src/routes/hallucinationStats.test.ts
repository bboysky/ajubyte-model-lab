import { describe, expect, it } from 'vitest';
import { extractHallucinationLabel } from './hallucinationStats.js';

describe('hallucination report label extraction', () => {
  it('does not classify results without an explicit label as hallucination', () => {
    expect(extractHallucinationLabel(['CHALLENGE_EXTENSION: HC3-004 kind=coverage complete=true pass=true']))
      .toBe('unclassified');
  });

  it('preserves an explicit evaluator label', () => {
    expect(extractHallucinationLabel([
      'DETERMINISTIC_FACT: complete offline answer verified',
      'HALLUCINATION_LABEL:correct',
    ])).toBe('correct');
  });
});
