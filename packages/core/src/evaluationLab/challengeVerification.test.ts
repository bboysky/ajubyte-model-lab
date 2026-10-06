import {describe,it,expect} from 'vitest';
import {buildChallengePack,gradeChallenge,referenceAnswer} from './challengePack.js';
import type {MathCase} from './challengeTypes.js';

const pack=buildChallengePack();
const item=(id:string)=>pack.cases.find(c=>c.id===id)!;
const math=(id:string)=>item(id) as MathCase;
describe('post-review reference and grading verification',()=>{
 it('recomputes project selection from public data without the production feasibility helper',()=>{
  const c=math('MC2-003'),d=c.data as any;let best=-Infinity;
  for(let mask=0;mask<2**d.items.length;mask++){
   const chosen=d.items.filter((_:unknown,i:number)=>(mask>>i)&1),selected=chosen.map((p:any)=>p.id);
   const sums=chosen.reduce((a:any,p:any)=>({cost:a.cost+p.cost,staff:a.staff+p.staff,value:a.value+p.value}),{cost:0,staff:0,value:0});
   if(sums.cost>d.budget||sums.staff>d.staff||d.requiredSkills.some((s:string)=>!chosen.some((p:any)=>p.skills.includes(s)))||d.requires.some(([a,b]:string[])=>selected.includes(a)&&!selected.includes(b))||d.exclusive.some(([a,b]:string[])=>selected.includes(a)&&selected.includes(b)))continue;
   best=Math.max(best,sums.value);
   expect(gradeChallenge(c,JSON.stringify({selected,...sums})).strictPass).toBe(sums.value===c.reference.value);
  }
  expect(best).toBe(48);expect(c.reference.value).toBe(best);
 });
 it.each(['MC2-007','MC2-008'])('%s accepts exact numeric strings throughout the certificate',id=>{
  const c=item(id);const strings=JSON.parse(JSON.stringify(referenceAnswer(c),(_,v)=>typeof v==='number'?`${v}e0`:v));
  expect(gradeChallenge(c,JSON.stringify(strings)).strictPass).toBe(true);
 });
 it('rejects numerically equivalent duplicate roots and fractional graph vertices',()=>{
  const c=item('MC2-007'),a=referenceAnswer(c) as any;a.roots32[1]='1.0';
  expect(gradeChallenge(c,JSON.stringify(a)).strictPass).toBe(false);
  const g=item('MC2-008'),b=referenceAnswer(g) as any;b.deleted[0]='5/2';
  expect(gradeChallenge(g,JSON.stringify(b)).strictPass).toBe(false);
  b.deleted=[2,'2.0',7,10];expect(gradeChallenge(g,JSON.stringify(b)).strictPass).toBe(false);
 });
 it.each([
  ['HC3-001','lumen_deployed_repair',['D7']],
  ['HC3-003','pilot_approved',['D4']],
  ['HC3-004','production_reproduced',['D4']],
  ['HC3-004','sensor_root_cause',['D5']],
  ['HC3-006','c104_any_certificate',['D7']],
  ['HC2-008','s_awarded',['D7']],
 ] as const)('%s.%s accepts a self-contained sufficient citation',(id,key,sources)=>{
  const c=item(id),a=referenceAnswer(c) as any;a[key].sources=[...sources];
  expect(gradeChallenge(c,JSON.stringify(a)).strictPass).toBe(true);
  a[key].value=a[key].value===null?true:null;
  expect(gradeChallenge(c,JSON.stringify(a)).strictPass).toBe(false);
 });
 it('independently checks migrated applied math and rejects swapped interval directions',()=>{
  const expected:Record<string,unknown>={
   'MC2-009':{cap:460,net:440,payment:440,later_payment:400},
   'MC2-010':{new_itt:60,old_itt:50,itt_gap:10,complete_gap:15},
   'MC2-011':{external_a:126,external_b:104,consolidated:230},
   'MC2-012':{any_min:59,any_max:65,clean_min:135,clean_max:141},
  };
  for(const [id,a] of Object.entries(expected))expect(gradeChallenge(item(id),JSON.stringify(a)).strictPass,id).toBe(true);
  // Construct every admissible overlap, not just the stored endpoint formulas.
  const counts=Array.from({length:7},(_,i)=>({any:42+35-(12+i),clean:200-42-35+(12+i)}));
  expect(math('MC2-012').reference).toEqual({any_min:Math.min(...counts.map(x=>x.any)),any_max:Math.max(...counts.map(x=>x.any)),clean_min:Math.min(...counts.map(x=>x.clean)),clean_max:Math.max(...counts.map(x=>x.clean))});
  expect(gradeChallenge(item('MC2-012'),JSON.stringify({any_min:65,any_max:59,clean_min:141,clean_max:135})).strictPass).toBe(false);
 });
});
