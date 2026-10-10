/* Original game rules. No libraries or external assets. */
(function (root) {
  'use strict';
  const ROUTE = [[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[10,3],[10,4],[10,5],[10,6],[11,6],[12,6],[13,6],[14,6],[15,6],[16,6],[17,6]];
  const DAYS = [
    ['まずは、床が見えるところから。','初めてのお客さまは、駆け出しの3人。汚れを片付けて、罠とおもてなしをひとつずつ。','駆け出し一行'],
    ['噂を聞いて、次のお客さま。','昨夜の冒険で、また散らかりました。設備はそのまま。掃除の合間に改装を。','寄り道探検隊'],
    ['足元注意、営業中。','少し丈夫な冒険者が来ます。粘液の次にトゲ罠を置くと、足を取られて連続ヒット。','鉄靴の傭兵団'],
    ['怖いだけでは、星は付かない。','途中に休憩ベンチを置けば、先の部屋まで遊んでもらえます。宝箱もお忘れなく。','週末冒険クラブ'],
    ['人気店にも、掃除の朝。','今日は4人の団体予約。設備の種類を増やして、それぞれの冒険を演出しましょう。','王都の調査隊'],
    ['明日は、あの勇者が来る。','常連さんの最終チェック。今日の売上で、明日の最後の改装を仕上げましょう。','古参の探索者'],
    ['勇者様、ご来店。','ここを壊した張本人が帰ってきます。今度は、また来たいと言わせましょう。','伝説の勇者一行']
  ];
  const ITEMS = {
    broom:{name:'あとしまつ',key:'1',cost:0,material:0,detail:'汚れをクリック。行動力1で、資材1と3Gを回収。'},
    spikes:{name:'トゲ罠',key:'2',cost:12,material:2,detail:'16ダメージ。粘液で滑った直後なら＋12。怖さを演出。'},
    slime:{name:'粘液トラップ',key:'3',cost:14,material:1,detail:'4ダメージ＋減速。3マス以内の次のトゲ罠と連携。'},
    mimic:{name:'ミミック',key:'4',cost:20,material:3,detail:'20ダメージのびっくり箱。罠の種類が増えると高評価。'},
    treasure:{name:'お宝箱',key:'5',cost:18,material:1,detail:'冒険のごほうび。初回遭遇で満足度アップ。'},
    bench:{name:'休憩ベンチ',key:'6',cost:12,material:2,detail:'体力を24回復。途中帰宅を防ぎ、初回利用で満足度アップ。'},
    remove:{name:'設備を撤去',key:'7',cost:0,material:0,detail:'行動力1で撤去。金額と資材を半分回収（切り捨て）。'}
  };
  const key = (x,y) => x+','+y;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function rng(seed) {return () => {seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function floor(x,y) {return (x>=1&&x<=5&&y>=2&&y<=6)||(x>=7&&x<=11&&y>=1&&y<=4)||(x>=12&&x<=16&&y>=4&&y<=8)||ROUTE.some(p=>p[0]===x&&p[1]===y);}
  function newGame(seed=Date.now() % 1000000) {
    const s={version:1,seed,day:1,phase:'prep',gold:65,material:3,energy:24,maxEnergy:24,upgrade:0,devices:{},debris:{},reports:[],totalVisitors:0,totalCleaned:0,cleaned:0,heroes:[],elapsed:0,events:[],lastReport:null};
    prepare(s); return s;
  }
  function prepare(s) {
    s.phase='prep';s.energy=s.maxEnergy;s.cleaned=0;s.heroes=[];s.elapsed=0;s.events=[];
    s.debris={};const rand=rng(s.seed+s.day*9323),cells=[];
    for(let y=1;y<9;y++)for(let x=1;x<17;x++) if(floor(x,y)&&!s.devices[key(x,y)])cells.push([x,y]);
    for(let i=cells.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
    cells.slice(0,12+s.day).forEach((p,i)=>s.debris[key(...p)]=['rubble','sword','spill','wood'][i%4]);
    s.initialDirt=Object.keys(s.debris).length;
  }
  function cleanliness(s){return 1-Object.keys(s.debris).length/s.initialDirt;}
  function inspect(s,x,y,tool) {
    const k=key(x,y),item=ITEMS[tool];
    if(s.phase!=='prep')return '営業中は見守りましょう';
    if(!item)return '道具を選んでください';
    if(s.energy<=0)return '今日の行動力は使い切りました。夜の営業へ！';
    if(tool==='broom')return s.debris[k]?null:'光る汚れや落とし物をクリック';
    if(tool==='remove')return s.devices[k]?null:'撤去する設備を選んでください';
    if(!ROUTE.slice(2,-1).some(p=>p[0]===x&&p[1]===y))return '点線の通路に設置できます';
    if(s.debris[k])return '先にここを掃除しましょう';
    if(s.devices[k])return '設置済みです。撤去してから置き直せます';
    if(s.gold<item.cost)return 'お金が足りません。掃除でも3Gずつ稼げます';
    if(s.material<item.material)return '資材が足りません。落とし物を回収しましょう';
    return null;
  }
  function act(s,x,y,tool) {
    const error=inspect(s,x,y,tool);if(error)return {ok:false,message:error};
    const k=key(x,y);s.energy--;
    if(tool==='broom'){delete s.debris[k];s.gold+=3;s.material++;s.cleaned++;s.totalCleaned++;return{ok:true,message:'きれいになった！ ＋3G / 資材＋1',effect:'clean'};}
    if(tool==='remove'){const item=ITEMS[s.devices[k]];s.gold+=Math.floor(item.cost/2);s.material+=Math.floor(item.material/2);delete s.devices[k];return{ok:true,message:'設備を回収しました',effect:'build'};}
    s.gold-=ITEMS[tool].cost;s.material-=ITEMS[tool].material;s.devices[k]=tool;
    return{ok:true,message:ITEMS[tool].name+'を設置しました',effect:'build'};
  }
  function upgrade(s) {
    const price=40+s.upgrade*25;
    if(s.phase!=='prep'||s.upgrade>=3||s.gold<price)return false;
    s.gold-=price;s.upgrade++;s.maxEnergy+=4;s.energy+=4;return true;
  }
  function event(s,text,type='normal'){s.events.unshift({text,type,time:s.elapsed});s.events=s.events.slice(0,24);}
  function startNight(s){
    if(s.phase!=='prep')return false;
    s.phase='night';s.elapsed=0;s.events=[];
    const names=s.day===7?['勇者アステル','僧侶リネ','魔術師モカ','剣士グラン']:['剣士ポル','斥候ニナ','魔法使いトト','騎士ベル'];
    s.heroes=Array.from({length:s.day>=5?4:3},(_,i)=>({id:i,name:names[i],hp:66+s.day*6+i*9,maxHp:66+s.day*6+i*9,pos:-i*3.4,seen:-1,damage:0,treasure:0,rests:0,types:[],slipperyUntil:-1,slow:0,done:false,escaped:false,rating:0,bubble:'',bubbleUntil:0}));
    event(s,DAYS[s.day-1][2]+'がやってきた！','arrival');return true;
  }
  function encounter(s,h,index) {
    const tile=ROUTE[index];if(!tile)return;
    const k=key(...tile),kind=s.devices[k];let speech='';
    if(s.debris[k]){h.hp-=3;h.damage+=3;speech='あっ、足元が…';}
    if(kind){
      if(!h.types.includes(kind))h.types.push(kind);
      if(kind==='slime'){h.hp-=4;h.damage+=4;h.slipperyUntil=index+3;h.slow=1.4;speech='つるっ！';}
      if(kind==='spikes'){const combo=index<=h.slipperyUntil,damage=combo?28:16;h.hp-=damage;h.damage+=damage;speech=combo?'滑って、トゲに！':'うわっ、トゲ！';if(combo)event(s,h.name+'：粘液 → トゲの連携！','combo');h.slipperyUntil=-1;}
      if(kind==='mimic'){h.hp-=20;h.damage+=20;speech='宝箱じゃなかった！';}
      if(kind==='treasure'){h.treasure++;speech='お宝、いただき！';}
      if(kind==='bench'){h.hp=Math.min(h.maxHp,h.hp+24);h.rests++;speech='ふう。いいベンチ。';}
    }
    if(speech){h.bubble=speech;h.bubbleUntil=s.elapsed+1.9;event(s,h.name+'「'+speech+'」',kind==='treasure'?'gold':'normal');}
    if(h.hp<=0){h.hp=0;h.done=true;h.escaped=true;finishHero(s,h);event(s,h.name+'は救出ロープで帰りました','retreat');}
  }
  function finishHero(s,h){
    const thrill=clamp(h.damage/h.maxHp,0,1)*0.8;
    h.rating=Math.round(clamp(1.4+cleanliness(s)*1.1+Math.min(1.2,h.types.length*.3)+thrill+(h.treasure>0?.45:0)+(h.rests>0?.25:0)-(h.escaped?1.4:0),1,5)*10)/10;
    h.review=h.escaped?'救出ロープは快適。でも、もう少し手加減を。':cleanliness(s)<.5?'仕掛けはいい。次は床の掃除もお願いします。':h.treasure&&h.rests?'怖い。お宝もある。休憩もできる。また来たい。':h.damage===0?'きれいなお散歩コース。次はドキドキも欲しい。':h.types.length>=3?'部屋ごとに驚きがある。設計者、わかってる。':h.treasure?'ちゃんとお宝がある。冒険のしがいがあった。':'床がきれいで感動。次はお宝も見つけたい。';
  }
  function tick(s,dt){
    if(s.phase!=='night')return;
    const delta=clamp(dt,0,.25);s.elapsed+=delta;
    for(const h of s.heroes){
      if(h.done)continue;
      h.slow=Math.max(0,h.slow-delta);h.pos+=delta*(h.slow>0?.58:1.15);
      const at=Math.min(ROUTE.length-1,Math.floor(h.pos));
      while(h.seen<at&&!h.done){h.seen++;encounter(s,h,h.seen);}
      if(!h.done&&h.pos>=ROUTE.length-1){h.done=true;finishHero(s,h);event(s,h.name+'が冒険を完走！','gold');}
    }
    if(s.heroes.every(h=>h.done))finishNight(s);
  }
  function finishNight(s){
    const rating=Math.round(s.heroes.reduce((a,h)=>a+h.rating,0)/s.heroes.length*10)/10;
    const revenue=s.heroes.reduce((a,h)=>a+16+Math.round(h.rating*3)-(h.escaped?7:0),0);
    const bonus=cleanliness(s)>=.999?15:0,fee=12+s.day*3;
    s.gold+=revenue+bonus-fee;s.totalVisitors+=s.heroes.length;
    s.lastReport={day:s.day,rating,revenue,bonus,fee,profit:revenue+bonus-fee,clean:Math.round(cleanliness(s)*100),finished:s.heroes.filter(h=>!h.escaped).length,count:s.heroes.length,reviews:s.heroes.map(h=>({name:h.name,stars:h.rating,text:h.review,escaped:h.escaped}))};
    s.reports.push(s.lastReport);s.phase='report';
  }
  function nextDay(s){if(s.phase!=='report')return false;if(s.day===7){s.phase='ending';return true;}s.day++;prepare(s);return true;}
  function validSave(s){return !!(s&&s.version===1&&Number.isInteger(s.day)&&s.day>=1&&s.day<=7&&['prep','report','ending'].includes(s.phase)&&Number.isFinite(s.gold)&&s.gold>=0&&Number.isFinite(s.energy)&&s.energy>=0&&Number.isFinite(s.material)&&s.material>=0&&Number.isFinite(s.maxEnergy)&&Number.isFinite(s.initialDirt)&&s.initialDirt>0&&Number.isFinite(s.seed)&&Array.isArray(s.reports)&&s.reports.length<=7&&s.devices&&s.debris&&Object.values(s.devices).every(k=>ITEMS[k]&&!['broom','remove'].includes(k))&&Array.isArray(s.events)&&Array.isArray(s.heroes));}
  root.DungeonCore={ROUTE,DAYS,ITEMS,key,floor,newGame,prepare,cleanliness,inspect,act,upgrade,startNight,tick,nextDay,validSave};
  if(typeof module!=='undefined')module.exports=root.DungeonCore;
})(globalThis);
