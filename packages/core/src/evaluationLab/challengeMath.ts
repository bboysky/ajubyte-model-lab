import {type MathCase,fraction,numericEqual,sameSet,exactKeys,exactIntegerArray,result} from './challengeTypes.js';

const projects={budget:18,staff:12,requiredSkills:['x','y','z'],items:[
 {id:'A',cost:5,staff:3,value:12,skills:['x']},{id:'B',cost:4,staff:3,value:10,skills:['y']},
 {id:'C',cost:6,staff:4,value:15,skills:['z']},{id:'D',cost:3,staff:2,value:8,skills:['x','y']},
 {id:'E',cost:5,staff:3,value:14,skills:['z']},{id:'F',cost:2,staff:2,value:6,skills:['y']},
 {id:'G',cost:4,staff:2,value:11,skills:['x','z']},{id:'H',cost:3,staff:2,value:9,skills:['y','z']},
 ],requires:[['E','A'],['H','B']],exclusive:[['C','G'],['D','F']]};
export function evaluateProjects(selected:unknown){
 if(!Array.isArray(selected)||new Set(selected).size!==selected.length||selected.some(id=>!projects.items.some(p=>p.id===id)))return null;
 const entries=projects.items.filter(p=>selected.includes(p.id));const cost=entries.reduce((a,p)=>a+p.cost,0),staff=entries.reduce((a,p)=>a+p.staff,0),value=entries.reduce((a,p)=>a+p.value,0);
 if(cost>projects.budget||staff>projects.staff||projects.requires.some(([a,b])=>selected.includes(a)&&!selected.includes(b))||projects.exclusive.some(([a,b])=>selected.includes(a)&&selected.includes(b))||projects.requiredSkills.some(s=>!entries.some(p=>p.skills.includes(s))))return null;
 return {cost,staff,value};
}
export function urnReference(){
 function enumerate(colors:string[]){let event=0,eventThenRed=0;
   for(let a=0;a<10;a++)for(let b=0;b<10;b++)if(b!==a)for(let c=0;c<10;c++)if(c!==a&&c!==b){const drawn=[a,b,c].map(i=>colors[i]);
     if(drawn.filter(x=>x==='G').length!==1||!drawn.includes('R'))continue;event++;
     for(let d=0;d<10;d++)if(d!==a&&d!==b&&d!==c&&colors[d]==='R')eventThenRed++;
   }return {event,eventThenRed};
 }
 const a=enumerate([...('RRRRRBBBGG')]),b=enumerate([...('RRBBBBBGGG')]);const weighted=2*a.event+3*b.event;
 return {event_a:fraction(a.event,720),event_b:fraction(b.event,720),posterior_a:fraction(2*a.event,weighted),next_red:fraction(2*a.eventThenRed+3*b.eventThenRed,7*weighted)};
}
export function congruenceReference(){const roots32=Array.from({length:32},(_,i)=>i).filter(x=>x*x%32===1),roots27=Array.from({length:27},(_,i)=>i).filter(x=>x*x%27===4);
 const solutions=Array.from({length:6048},(_,i)=>i).filter(x=>x*x%32===1&&x*x%27===4&&x%7===5);return {roots32,roots27,solutions};}
export const graph={vertices:Array.from({length:12},(_,i)=>i+1),protected:[1,4],edges:[[1,2],[2,3],[3,1],[4,5],[5,6],[6,4],[7,8],[8,9],[9,7],[10,11],[11,12],[12,10],[2,5],[3,7],[6,10],[8,11],[9,12],[1,8],[4,11]]};
export function bipartition(deleted:unknown){
 if(!Array.isArray(deleted)||new Set(deleted).size!==deleted.length||deleted.some(v=>!graph.vertices.includes(v)||graph.protected.includes(v)))return null;
 const color=new Map<number,number>();for(const start of graph.vertices){if(deleted.includes(start)||color.has(start))continue;color.set(start,0);const queue=[start];
   for(let k=0;k<queue.length;k++){const v=queue[k];for(const [a,b]of graph.edges){const u=a===v?b:b===v?a:null;if(u===null||deleted.includes(u))continue;
     if(color.has(u)){if(color.get(u)===color.get(v))return null;}else{color.set(u,1-color.get(v)!);queue.push(u);}}}}
 return {part_a:[...color].filter(([,c])=>c===0).map(([v])=>v),part_b:[...color].filter(([,c])=>c===1).map(([v])=>v)};
}

let cache:MathCase[]|undefined;
export function buildMathChallenges():MathCase[]{if(cache)return structuredClone(cache);
 const choices=Array.from({length:256},(_,mask)=>projects.items.filter((_,i)=>mask&(1<<i)).map(p=>p.id)).map(selected=>({selected,sim:evaluateProjects(selected)})).filter(r=>r.sim).sort((a,b)=>b.sim!.value-a.sim!.value);
 const deletions=Array.from({length:4096},(_,mask)=>graph.vertices.filter((_,i)=>mask&(1<<i))).sort((a,b)=>a.length-b.length).map(deleted=>({deleted,parts:bipartition(deleted)})).filter(r=>r.parts);
 if(!choices.length||!deletions.length)throw new Error('Infeasible challenge design');
 const wrap=(id:string,family:string,title:string,task:string,data:unknown,reference:Record<string,unknown>):MathCase=>({id,dimension:'reasoning_math',family,title,task,data,reference});
 cache=[
 wrap('MC2-003','precedence-budgeted-set-selection','前置依赖与资源约束下的项目组合',
 '每个项目最多选择一次，cost、staff、value 可加；总 cost 不超过 budget，总 staff 不超过 staff；每个 requiredSkills 至少被一个所选项目覆盖。requires=[a,b] 表示选 a 必须选 b，exclusive 中两个项目不能同时选。最大化总 value。输出 selected（ID 数组，顺序不限）、cost、staff、value；任何最优组合均可。',projects,{selected:choices[0].selected,...choices[0].sim!}),
 wrap('MC2-005','conditional-mixture-without-replacement','隐含来源下的不放回条件概率',
 '先以 2/5 的概率选箱 A、3/5 选箱 B。A 有红 5、蓝 3、绿 2 球，B 有红 2、蓝 5、绿 3 球。同箱内各球等概率，每次不放回。观察前 3 次恰有 1 个绿球且至少 1 个红球，记事件 E。仍从所选箱抽第 4 球。输出 event_a=P(E|A)、event_b=P(E|B)、posterior_a=P(A|E)、next_red=P(第4球红|E)。必须用精确分数或精确等价小数，不得用近似小数。',{},urnReference()),
 wrap('MC2-007','composite-modular-root-completeness','复合模数下的全部整数解',
 '求 0≤x<6048 中全部满足 x²≡1 (mod 32)、x²≡4 (mod 27)、x≡5 (mod 7) 的整数。输出 roots32（0..31 的第一式全部根）、roots27（0..26 的第二式全部根）、solutions（全部 x）。三个数组顺序不限，但不得重复或漏解。',{},congruenceReference()),
 wrap('MC2-008','protected-vertex-bipartization','保护顶点约束下的最小删除构造',
 '给定简单无向图，删除尽量少的顶点使剩余诱导图为二分图；protected 顶点不得删除。输出 deleted（删除顶点）、minimum（最少删除数）、part_a、part_b（剩余顶点的完整不重叠划分）。任一最优删除方案及有效划分均可，所有数组顺序不限。',graph,{deleted:deletions[0].deleted,minimum:deletions[0].deleted.length,...deletions[0].parts!}),
 ];return structuredClone(cache);
}

function numericArray(a:unknown,b:unknown):boolean{return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>Array.isArray(x)?numericArray(x,b[i]):numericEqual(x,b[i]));}
export function gradeMath(c:MathCase,a:unknown){
 if(!exactKeys(a,Object.keys(c.reference)))return result(c.id,[],false,'Response keys do not match the task');
 const checks:{id:string;pass:boolean}[]=[];const check=(id:string,pass:unknown)=>checks.push({id,pass:!!pass});
 if(c.id==='MC2-003'){const sim=evaluateProjects(a.selected);check('constraints',sim);for(const k of ['cost','staff','value']as const)check(k,sim&&numericEqual(a[k],sim[k]));check('global_optimum',sim&&sim.value===c.reference.value);}
 else if(c.id==='MC2-008'){const normalized=exactIntegerArray(a.deleted),partA=exactIntegerArray(a.part_a),partB=exactIntegerArray(a.part_b);
   const valid=bipartition(normalized);check('valid_deletion',valid);check('global_minimum',valid&&normalized&&normalized.length===c.reference.minimum&&numericEqual(a.minimum,c.reference.minimum));
   const parts=partA&&partB?[...partA,...partB]:null;
   const deleted=normalized??[];
   const remaining=graph.vertices.filter(v=>!deleted.includes(v));
   check('partition_covers_remaining',valid&&sameSet(parts,remaining));
   check('every_edge_crosses',valid&&parts&&sameSet(parts,remaining)&&graph.edges.every(([u,v])=>!remaining.includes(u)||!remaining.includes(v)||partA!.includes(u)!==partA!.includes(v)));}
 else for(const [key,value]of Object.entries(c.reference))check(key,Array.isArray(value)?c.id==='MC2-007'?sameSet(exactIntegerArray(a[key]),value):numericArray(a[key],value):numericEqual(a[key],value));
 return result(c.id,checks);
}
