(function(g){'use strict';
const elements=['fire','water','thunder','poison','ice','wind','earth'];
const cards={
 sword:{name:'剣',glyph:'剣',mp:0,damage:10,type:'attack',color:'#bfccd7'},bottle:{name:'瓶',glyph:'瓶',mp:2,damage:6,aoe:true,type:'attack',color:'#ccabdb'},
 fire:{name:'火',glyph:'火',mp:3,damage:12,burn:3,type:'attack',color:'#ff8864'},water:{name:'水',glyph:'水',mp:3,damage:8,heal:5,type:'attack',color:'#79c9ef'},
 thunder:{name:'雷',glyph:'雷',mp:5,damage:8,paralyze:1,type:'attack',color:'#eed579'},poison:{name:'毒',glyph:'毒',mp:3,damage:9,poison:4,type:'attack',color:'#b591ec'},
 ice:{name:'氷',glyph:'氷',mp:3,damage:9,chill:2,type:'attack',color:'#97e7e6'},wind:{name:'風',glyph:'風',mp:3,damage:10,haste:3,type:'attack',color:'#a5d6a1'},earth:{name:'土',glyph:'土',mp:3,damage:10,guard:4,type:'attack',color:'#d1b181'},
 big:{name:'大',glyph:'大',mp:2,type:'modifier',color:'#f0b479'},double:{name:'双',glyph:'双',mp:3,type:'modifier',color:'#eaaaca'},
 might:{name:'闘気の薬',glyph:'闘',mp:3,might:1,type:'self',color:'#e7ac85'},smoke:{name:'煙玉',glyph:'煙',mp:4,smoke:1,type:'self',color:'#b4b9c4'},
 dismantle:{name:'分解',glyph:'解',mp:0,dismantle:1,type:'utility',color:'#a3cbb9'},extract:{name:'抽出',glyph:'抽',mp:1,draw:1,type:'self',color:'#b9cb99'},eye:{name:'鑑定眼',glyph:'眼',mp:2,eye:1,type:'enemy',color:'#d6c7ed'},
 summon:{name:'召喚獣サモン',glyph:'召',mp:8,summon:5,type:'self',rare:true,color:'#b69bef'},counter:{name:'カウンター',glyph:'反',mp:5,counter:.75,type:'self',rare:true,color:'#efc983'},phalanx:{name:'ファランクス',glyph:'陣',mp:10,invincible:2,type:'self',rare:true,color:'#b9dfe8'}
};
// 45 fixed recipes: combinations with repetition of seven elements, sword and bottle.
const recipes=[
 ['sword','sword','双牙の剣',25,2],['sword','bottle','砕刃の散弾',19,3],['bottle','bottle','破裂フラスコ',22,4],
 ['fire','sword','焔の剣',29,4],['water','sword','清流の剣',24,4],['thunder','sword','雷鳴の剣',24,6],['poison','sword','毒牙の剣',25,4],['ice','sword','霜月の剣',25,4],['wind','sword','疾風の剣',27,4],['earth','sword','岩砕きの剣',29,4],
 ['fire','bottle','火炎瓶',22,5],['water','bottle','潮騒の瓶',18,5],['thunder','bottle','蓄雷の瓶',18,7],['poison','bottle','瘴気の瓶',20,5],['ice','bottle','吹雪の瓶',20,5],['wind','bottle','竜巻の瓶',21,5],['earth','bottle','砂嵐の瓶',23,5],
 ['fire','fire','紅蓮',32,5],['fire','water','蒸気爆発',28,5],['fire','thunder','雷火',30,7],['fire','poison','灼毒',28,5],['fire','ice','熱衝撃',31,5],['fire','wind','火走り',30,5],['fire','earth','溶岩弾',33,5],
 ['water','water','奔流',24,5],['water','thunder','感電水',25,7],['water','poison','腐食液',24,5],['water','ice','氷河',26,5],['water','wind','雨嵐',25,5],['water','earth','濁流',28,5],
 ['thunder','thunder','轟雷',30,8],['thunder','poison','神経毒',26,7],['thunder','ice','凍雷',27,7],['thunder','wind','雷嵐',29,7],['thunder','earth','磁界崩壊',31,7],
 ['poison','poison','猛毒',25,5],['poison','ice','凍毒',26,5],['poison','wind','毒の旋風',27,5],['poison','earth','腐敗の大地',29,5],
 ['ice','ice','絶氷',28,5],['ice','wind','白夜の風',28,5],['ice','earth','凍土',30,5],['wind','wind','暴風',30,5],['wind','earth','砂塵の渦',31,5],['earth','earth','地裂',35,5]
];
const buffs=[
 ['vital','生命の結晶','最大HP＋15'],['mana','月の雫','最大MP＋5'],['quick','羽の指輪','素早さ＋2'],['power','赤い指輪','攻撃ダメージ＋12%'],['regen','苔の護符','ターン開始時HP＋2'],['flow','魔力の泉','毎ターンのMP回復＋1'],['craft','錬金の鍵','錬成MP−1（最低1）'],['coin','金の嗅覚','戦闘コイン＋25%'],['rest','安眠の香','休憩回復＋15%'],['waterheart','清水の心','回復効果＋25%'],['flameheart','焔の心','火ダメージ＋20%'],['stormheart','嵐の心','雷ダメージ＋20%'],['frostheart','霜の心','氷ダメージ＋20%'],['venomheart','毒の心','毒ダメージ＋20%'],['windheart','風の心','風ダメージ＋20%'],['earthheart','土の心','土ダメージ＋20%'],['waterpower','潮の心','水ダメージ＋20%'],['sharp','研がれた意思','無属性ダメージ＋20%'],['grit','石の皮膚','受けるダメージ−2'],['lucky','幸運の貨幣','宝箱コイン＋15'],['vamp','吸血の印','攻撃で与えたダメージの8%回復'],['initial','予見の書','初手に追加で1枚抽出（上限5）'],['sight','地図の記憶','方向音痴を無効化'],['clean','浄化の灯','状態異常ダメージ−2'],['barter','交渉の指輪','ショップ価格−10%'],['stairs','旅人の靴','階層突破時HPさらに＋10%'],['summoner','呼応の鈴','サモンの追撃係数＋0.1']
].map(([id,name,desc])=>({id,name,desc}));
const curses=[['fragile','脆弱','受けるダメージ＋20%'],['tax','錬金の枷','錬成MP＋2'],['slow','鉛の足','素早さ−3'],['lost','方向音痴','20%で隣の到達可能マスへ迷う'],['bleed','血の刻印','ターン開始時HP−2'],['dry','枯れた泉','ターンMP回復−1'],['weak','衰弱','攻撃ダメージ−15%'],['greed','貪欲の印','買値＋15%']].map(([id,name,desc])=>({id,name,desc}));
const regions={forest:{name:'翡翠の森',color:'#6ac997',price:.9,enemy:['moss','wolf','thorn','wisp','seed','druid']},city:{name:'灰の廃都市',color:'#d4ad7c',price:1.1,enemy:['rust','bandit','bomb','ghost','sentinel','crow']},temple:{name:'地下神殿',color:'#a39fef',price:1,enemy:['idol','shade','oracle','golem','mirror','spirit']}};
const enemies={
 moss:{name:'苔スライム',shape:'slime',color:'#87be79',personality:'鈍重',hp:34,atk:7,speed:5,weak:'fire',resist:'water'},
 wolf:{name:'森の牙狼',shape:'beast',color:'#b9b8a5',personality:'速攻',hp:30,atk:8,speed:13,weak:'fire',trait:'double'},
 thorn:{name:'棘の守り手',shape:'tree',color:'#a2b475',personality:'妨害',hp:40,atk:7,speed:6,weak:'fire',resist:'earth',trait:'thorns'},
 wisp:{name:'迷い火',shape:'ghost',color:'#a0dcba',personality:'適応',hp:28,atk:8,speed:12,weak:'water',resist:'fire',trait:'spirit'},
 seed:{name:'破裂する種',shape:'bomb',color:'#b9af77',personality:'自爆',hp:28,atk:7,speed:7,weak:'ice',trait:'core'},
 druid:{name:'根の祈祷師',shape:'mage',color:'#91b28c',personality:'支援',hp:32,atk:6,speed:8,weak:'poison',trait:'summon'},
 rust:{name:'錆びた騎士',shape:'knight',color:'#b99870',personality:'鈍重',hp:44,atk:9,speed:6,weak:'thunder',resist:'earth',trait:'shield'},
 bandit:{name:'空洞の盗賊',shape:'mage',color:'#ca9792',personality:'妨害',hp:31,atk:7,speed:12,weak:'ice',trait:'drop'},
 bomb:{name:'残響爆弾',shape:'bomb',color:'#d7ab78',personality:'自爆',hp:30,atk:8,speed:9,weak:'water',trait:'core'},
 ghost:{name:'帰らない住人',shape:'ghost',color:'#a3bdd1',personality:'妨害',hp:34,atk:7,speed:9,weak:'fire',resist:'ice',trait:'spirit'},
 sentinel:{name:'崩塔の番兵',shape:'knight',color:'#d4b085',personality:'適応',hp:40,atk:9,speed:8,weak:'water',trait:'shield'},
 crow:{name:'二つ首の鴉',shape:'beast',color:'#b19dcc',personality:'速攻',hp:31,atk:7,speed:14,weak:'wind',trait:'double'},
 idol:{name:'祈られない偶像',shape:'golem',color:'#c9c1ac',personality:'支援',hp:43,atk:7,speed:5,weak:'thunder',trait:'summon'},
 shade:{name:'頁喰い',shape:'ghost',color:'#b6a3d3',personality:'妨害',hp:33,atk:8,speed:11,weak:'wind',resist:'poison',trait:'drop'},
 oracle:{name:'無言の司祭',shape:'mage',color:'#b3a8de',personality:'支援',hp:34,atk:8,speed:10,weak:'earth',resist:'thunder'},
 golem:{name:'黒曜の巨像',shape:'golem',color:'#969cac',personality:'鈍重',hp:49,atk:11,speed:4,weak:'water',trait:'core'},
 mirror:{name:'鏡面の意思',shape:'crystal',color:'#d4b6e9',personality:'適応',hp:37,atk:8,speed:10,weak:'earth',trait:'shield'},
 spirit:{name:'青白い残響',shape:'ghost',color:'#b2e0e2',personality:'速攻',hp:31,atk:8,speed:13,weak:'fire',trait:'spirit'}
};
const events=[
 {id:'traveler',who:'旅の商人',text:'「遺跡の中では、金も命も重さが変わる。君は何を軽くする？」',choices:[['20コインを差し出す','buyBuff'],['傷を見せる','heal'],['静かに立ち去る','leave']]},
 {id:'scribe',who:'記録を続ける者',text:'「同じ元素ばかり使うと、壁が覚える。この頁を持っていきなさい。」',choices:[['頁を受け取る','card'],['不要なカードを差し出す','remove'],['会釈して去る','leave']]},
 {id:'altar',who:'名のない声',text:'「傷ひとつで、力ひとつ。交換こそが錬金術。」',choices:[['血を一滴落とす（HP−12）','trade'],['祭壇を清める（解呪）','cleanse'],['背を向ける','leave']]},
 {id:'forest1',region:'forest',who:'苔をまとった少女',text:'「森はね、何を燃やしたか覚えてる。でも水をくれたことも覚えてる。」',choices:[['泉の水を飲む','heal'],['種を受け取る','buff'],['森に礼をして去る','leave']]},
 {id:'forest2',region:'forest',who:'樹洞の錬金術師',text:'「この根は古い剣を食べる。代わりに、新しい刃が育つ。」',choices:[['剣を一本預ける','refine'],['根元を調べる','coin'],['足を止めず進む','leave']]},
 {id:'forest3',region:'forest',who:'蛍の群れ',text:'緑の明滅が、手のひらのカードを照らしている。',choices:[['カードを光にかざす','refine'],['光を瓶に集める','mana'],['蛍を見送る','leave']]},
 {id:'city1',region:'city',who:'時計塔の修理工',text:'「誰もいなくなっても、時計だけは動かしたいんだ。」',choices:[['修理を手伝う','coin'],['歯車に魔力を注ぐ','buff'],['懐中時計を眺めて去る','leave']]},
 {id:'city2',region:'city',who:'市場の残響',text:'「最後の一品、最後のお客さま。さあ、選んで。」',choices:[['古びた包みを開く','card'],['財布を差し出す（20G）','buyBuff'],['店先を掃いて去る','heal']]},
 {id:'city3',region:'city',who:'灰色の郵便屋',text:'「宛先のない手紙を、君は受け取ってくれるかい。」',choices:[['手紙を受け取る','buff'],['配達を手伝う','coin'],['帽子を上げて見送る','leave']]},
 {id:'temple1',region:'temple',who:'水鏡の巫女',text:'「映るのは姿ではない。まだ捨てられないものだ。」',choices:[['鏡へ手を伸ばす','cleanse'],['カードを水面に置く','remove'],['目を伏せて去る','leave']]},
 {id:'temple2',region:'temple',who:'眠る石像',text:'「起こしたのは、君か。それとも遺跡か。」',choices:[['魔力を流す','mana'],['碑文を写す','card'],['石像に布をかける','heal']]},
 {id:'temple3',region:'temple',who:'地下の鐘守',text:'「鐘は三度鳴る。戻る者、進む者、変わる者のために。」',choices:[['進む鐘を鳴らす','buff'],['変わる鐘を鳴らす','refine'],['戻る鐘を鳴らす','heal']]},
 {id:'rare1',rare:true,who:'星を飼う人',text:'「この小さな星は、誰かの呼び声を待っている。」',choices:[['両手で星を受け止める','summon'],['星明かりを浴びる','maxmana'],['空を指さす','buff']]},
 {id:'rare2',rare:true,who:'昨日の自分',text:'何も言わず、もう一人の錬金術師が盾を差し出す。',choices:[['盾に手を重ねる','counter'],['互いの傷を確かめる','maxhp'],['うなずいて別れる','buff']]}
];
g.RuinsData={elements,cards,recipes,buffs,curses,regions,enemies,events};if(typeof module!=='undefined')module.exports=g.RuinsData;
})(globalThis);
