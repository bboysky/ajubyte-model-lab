import {describe,it,expect} from 'vitest';
import {gradeChallenge,referenceAnswer} from './challengePack.js';
import {buildRebalancedEvidenceChallenges} from './challengeRebalance.js';
import type {EvidenceCase} from './challengeTypes.js';

const cases=buildRebalancedEvidenceChallenges();
const item=(id:string)=>cases.find(c=>c.id===id)!;
const answer=(c:EvidenceCase)=>referenceAnswer(c) as Record<string,{value:unknown;status:string;sources:string[]}>;
describe('citation rubric v2 separates support, relevance and factual correctness',()=>{
 it('accepts research-directory context without penalizing a correct evidence chain',()=>{
  const c=item('HC3-001'),a=answer(c);a.r17_tested_repair.sources=['D1','D2'];
  expect(gradeChallenge(c,JSON.stringify(a))).toMatchObject({strictPass:true,answerPass:true,evidencePass:true});
 });
 it('accepts the scan caveat when the full vulnerability chain is already present',()=>{
  const c=item('HC2-005'),a=answer(c);a.c_affected.sources=['D1','D2','D3','D4','D5','D6'];
  expect(gradeChallenge(c,JSON.stringify(a)).strictPass).toBe(true);
 });
 it('distinguishes unrelated real citations from missing evidence and wrong facts',()=>{
  const c=item('HC3-001'),a=answer(c);a.r17_tested_repair.sources=['D1','D7'];const g=gradeChallenge(c,JSON.stringify(a));
  expect(g).toMatchObject({strictPass:false,answerPass:true,evidencePass:true});
  expect(g.citationDiagnostics?.[0]).toMatchObject({valid:true,sufficient:true,relevant:false,unsupportedSources:['D7']});
 });
 it.each([['D1','D999'],['D1','D1'],[],['D1','D2','D3','D4','D5','D6','D7']])('invalid citations cannot certify support: %j',(...sources)=>{
  const c=item('HC3-001'),a=answer(c);a.r17_tested_repair.sources=sources as string[];
  expect(gradeChallenge(c,JSON.stringify(a))).toMatchObject({strictPass:false,evidencePass:false});
 });
 it('keeps incorrect conclusions and incomplete answers from passing diagnostic aggregates',()=>{
  const c=item('HC3-001'),a=answer(c);a.r17_tested_repair.value=true;
  expect(gradeChallenge(c,JSON.stringify(a))).toMatchObject({strictPass:false,answerPass:false,evidencePass:false});
  expect(gradeChallenge(c,JSON.stringify(answer(c)),false)).toMatchObject({strictPass:false,answerPass:false,evidencePass:false});
 });
 it('does not change grading semantics when loading an older case without the new policy',()=>{
  const c=structuredClone(item('HC3-001'));delete c.citationPolicy;c.fields[0].allowedSources=['D1'];
  const a=answer(c);a.r17_tested_repair.sources=['D1','D2'];const g=gradeChallenge(c,JSON.stringify(a));
  expect(g.strictPass).toBe(false);expect(g.citationDiagnostics).toBeUndefined();
 });
});
