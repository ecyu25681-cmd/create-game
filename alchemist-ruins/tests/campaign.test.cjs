const test=require('node:test'),assert=require('node:assert/strict');
const {simulate}=require('./campaign-sim.cjs');
test('40 seeded campaigns terminate through normal game actions, with reachable victories',()=>{
 const runs=Array.from({length:40},(_,i)=>simulate(i+1));
 for(const r of runs){assert.ok(['dead','victory'].includes(r.phase),JSON.stringify(r));assert.ok(r.actions<3000);}
 assert.ok(runs.some(r=>r.phase==='victory'&&r.floor===10));
 assert.ok(runs.some(r=>r.phase==='dead'));
});
test('endless reaches a further boss cycle through normal play',()=>{
 const r=simulate(1,'endless');assert.equal(r.floor,12);assert.equal(r.phase,'map');
});
