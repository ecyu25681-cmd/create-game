(function(g){'use strict';
const scores={title:{bpm:74,base:45,notes:[0,7,12,10,7,3,5,7,0,7,15,14,10,7,3,2]},explore:{bpm:86,base:43,notes:[0,7,3,10,0,5,8,7,0,7,12,10,8,5,3,2]},battle:{bpm:124,base:45,notes:[0,0,7,3,10,7,5,3,0,7,12,10,7,5,3,2]},boss:{bpm:142,base:40,notes:[0,1,7,0,6,7,12,6,0,3,10,7,6,3,1,0]},calm:{bpm:64,base:48,notes:[0,7,10,14,12,7,5,3,0,5,12,10,7,3,2,7]}};
let context,interval=null,track='title',step=0,bgm=true,sfx=true,started=false;
function tone(freq,duration,type,volume,delay=0){if(!context)return;const o=context.createOscillator(),gain=context.createGain(),t=context.currentTime+delay;o.type=type;o.frequency.value=freq;o.connect(gain);gain.connect(context.destination);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);o.start(t);o.stop(t+duration+.02);}
function play(){if(interval)clearInterval(interval);if(!started||!bgm)return;const song=scores[track];function beat(){if(document.hidden)return;const n=song.base+song.notes[step%song.notes.length],f=440*Math.pow(2,(n-69)/12);tone(f,.6,'triangle',.027);if(step%4===0)tone(440*Math.pow(2,(song.base-12-69)/12),1.6,'sine',.04);if(track==='battle'||track==='boss'){tone(55,.07,'square',.014);if(step%2)tone(f*2,.09,'sine',.012);}step++;}beat();interval=setInterval(beat,60000/song.bpm/2);}
function start(){try{context=context||new(window.AudioContext||window.webkitAudioContext)();context.resume();if(!started){started=true;play();}}catch{}}
function music(name){if(!scores[name])name='explore';if(track!==name){track=name;step=0;play();}}
function fx(kind){if(!sfx)return;start();const sounds={fuse:[300,400,600,800],hit:[160,90],choose:[500,670],error:[110,90],win:[330,440,550,660],heal:[430,570,720]};(sounds[kind]||sounds.choose).forEach((f,i)=>tone(f,.16,kind==='hit'?'square':'triangle',.06,i*.055));}
function settings(b,s){bgm=b;sfx=s;play();}
g.RuinsAudio={start,music,fx,settings};})(globalThis);
