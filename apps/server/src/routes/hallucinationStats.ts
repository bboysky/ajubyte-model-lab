const REPORT_LABELS = new Set([
  'correct',
  'correct_refusal',
  'partial',
  'hallucination',
  'wrong_refusal',
  'accepted_false_premise',
]);

export type ReportHallucinationLabel =
  | 'correct'
  | 'correct_refusal'
  | 'partial'
  | 'hallucination'
  | 'wrong_refusal'
  | 'accepted_false_premise'
  | 'unclassified';

/** Only explicit evaluator labels belong in the hallucination distribution. */
export function extractHallucinationLabel(evidence: string[] | null | undefined): ReportHallucinationLabel {
  const found = evidence?.find((item) => item.startsWith('HALLUCINATION_LABEL:'));
  const label = found?.slice('HALLUCINATION_LABEL:'.length);
  return label && REPORT_LABELS.has(label)
    ? label as ReportHallucinationLabel
    : 'unclassified';
}
