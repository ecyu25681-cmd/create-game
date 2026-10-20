const C=require('../web/core.js'),D=C.D;
function score(c,s){const x=c.stats;return (x.damage||0)*C.magnitude(c)*C.hits(c)*(x.aoe?1.7:1)+(x.heal||0)*2+(x.paralyze||0)*15+(x.guard||0)*3+(x.counter||0)*35+(x.summon||0)*3-(x.smoke?20:0);}
function simulate(seed,mode='conquest'){
 const s=C.makeRun(mode,seed);C.attune(s,s.attunements.includes('water')?'water':s.attunements.includes('fire')?'fire':s.attunements[0]);let actions=0;
 while(!['dead','victory'].includes(s.phase)&&s.floor<=11&&actions++<3000){
  if(s.phase==='map'){const ids=C.available(s);const weight=n=>({rest:s.player.hp<75?8:4,chest:6,event:5,shop:s.player.coin>60?7:1,battle:2,elite:0}[n.type]||0);const best=ids.map(id=>({id,w:id==='exit'?99:weight(s.map.rows.flat().find(n=>n.id===id))})).sort((a,b)=>b.w-a.w)[0];C.enter(s,best.id);}
  else if(s.phase==='battle'){
   const b=s.battle;let used=false;
   if(b.fusionLeft>0){let options=[];for(let i=0;i<b.hand.length;i++)for(let j=i+1;j<b.hand.length;j++){const a=b.hand[i],d=b.hand[j],r=C.fusionInfo(s,a,d);if(r.ok&&r.cost<=s.player.mp)options.push({a,d,r,score:score(r.card,s)-score(a,s)-score(d,s)+10-r.cost});}options.sort((a,b)=>b.score-a.score);if(options[0]&&(b.tutorial&&!b.tutorialFused||options[0].score>0)){C.fuse(s,options[0].a.id,options[0].d.id);used=true;}}
   if(!used){const cs=b.hand.filter(c=>!['modifier','utility'].includes(c.stats.type)&&C.cost(c)<=s.player.mp&&!c.stats.smoke&&!c.stats.eye).sort((a,b)=>score(b,s)-score(a,s));for(const c of cs){const enemy=b.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0];if(C.use(s,c.id,c.stats.type==='self'?'self':enemy.id).ok){used=true;break;}}}
   if(!used){if(b.tutorial&&!b.tutorialFused)throw Error('tutorial stall');C.endTurn(s);}
  }else if(['reward','floorReward'].includes(s.phase)){const w={regen:90,vamp:100,power:80,vital:70,mana:60,stairs:95,flow:65,grit:75,craft:60,quick:50,clean:40};let options=s.reward.map((r,i)=>({i,w:r.type==='buff'?(w[r.id]||15):score(r.card,s)*.6-(s.deck.length>18?15:0)}));options.push({i:-1,w:0});options.sort((a,b)=>b.w-a.w);C.reward(s,options[0].i);}
  else if(s.phase==='rest'){if(s.player.hp<s.player.maxHp*.8)C.rest(s,'heal');else if(s.player.mp<10)C.rest(s,'mana');else{const c=s.deck.filter(c=>c.refine<3).sort((a,b)=>score(b,s)-score(a,s))[0];if(c)C.rest(s,'refine',c.id);else C.rest(s,'heal');}}
  else if(s.phase==='chest')C.chest(s);
  else if(s.phase==='shop'){if(s.player.hp<s.player.maxHp*.6)C.service(s,'heal');if(s.player.mp<10)C.service(s,'mana');for(let i=0;i<s.shop.buffs.length;i++){const x=s.shop.buffs[i];if(['regen','vamp','grit','stairs','power','vital'].includes(x.id))C.buy(s,'buff',i);}for(let i=0;i<s.shop.cards.length;i++)if(['water','counter','summon','phalanx'].includes(s.shop.cards[i].card.kind))C.buy(s,'card',i);C.leave(s);}
  else if(s.phase==='event'){const prefs=s.player.hp<s.player.maxHp*.65?['heal','maxhp','buff','summon','counter','coin']:['summon','counter','buff','maxmana','maxhp','coin','card','mana','heal'];let i=s.event.choices.findIndex(x=>x[1]===prefs.find(k=>s.event.choices.some(c=>c[1]===k)));if(i<0)i=s.event.choices.length-1;const r=C.eventChoice(s,i);if(r.select)C.eventCard(s,r.select,s.deck[0].id);}
  else throw Error(s.phase);
 }
 return{seed,phase:s.phase,floor:s.floor,battles:s.battles,actions};
}
module.exports={simulate};
if(require.main===module){const results=Array.from({length:40},(_,i)=>simulate(i+1));console.log(JSON.stringify({wins:results.filter(x=>x.phase==='victory').length,meanFloor:results.reduce((a,b)=>a+b.floor,0)/results.length,results}));}

