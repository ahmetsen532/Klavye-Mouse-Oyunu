const tr = typeof translate === 'function' ? translate : text => text;
const byId=id=>document.getElementById(id);
const arena=byId('arena'),target=byId('target');
let selectedMode='click',round=null,paused=false,lastTime=0,roundSettings=null;
const levelNames={easy:tr('Kolay'),medium:tr('Orta'),hard:tr('Zor')};
function choose(mode){
 selectedMode=mode;
 for(const [id,value] of [['clickMode','click'],['trackMode','track']]){byId(id).classList.toggle('selected',mode===value);byId(id).setAttribute('aria-pressed',String(mode===value));}
 byId('exerciseLabel').textContent=mode==='click'?tr('HEDEF AVI'):tr('AKICI TAKİP');
 byId('guideText').textContent=mode==='click'?tr('Daireye sol tıkla. Her isabette yeni bir hedef belirir.'):tr('Tıklamana gerek yok. İmleci hareketli dairenin içinde tut.');
 byId('practiceHint').textContent=mode==='click'?tr('Hedef kaybolmadan tıkla. Boşa tıklamalar isabet oranını düşürür.'):tr('Daire dolduğunda doğru yerdesin. Akıcı hareketlerle hedefi takip et.');
 byId('liveMetric').textContent=mode==='click'?tr('0 İSABET'):tr('%0 TAKİP');
}
byId('clickMode').onclick=()=>choose('click');byId('trackMode').onclick=()=>choose('track');
byId('mouseDuration').onchange=()=>byId('mouseTimer').textContent=byId('mouseDuration').value+tr(' sn');
function start(repeat=false){if(typeof lockLanguage==='function')lockLanguage(true);
 if(!repeat)roundSettings={mode:selectedMode,difficulty:byId('mouseLevel').value,duration:Number(byId('mouseDuration').value)};
 byId('setup').classList.add('hidden');byId('mouseResult').classList.add('hidden');document.querySelector('.practicePanel').classList.remove('hidden');document.body.classList.add('training');
 byId('idleGuide').classList.add('hidden');byId('pauseCover').classList.add('hidden');
 const rect=arena.getBoundingClientRect();round=new MouseRound({...roundSettings,width:rect.width,height:rect.height});paused=false;lastTime=performance.now();
 target.classList.remove('hidden');target.classList.toggle('tracking',round.mode==='track');byId('pauseMouse').disabled=false;byId('pauseMouse').textContent=tr('DURAKLAT');
 arena.scrollIntoView({block:'center'});render();
}
function render(){
 const r=round.level.radius;target.style.width=r*2+'px';target.style.height=r*2+'px';target.style.transform=`translate(${round.target.x-r}px,${round.target.y-r}px)`;
 target.classList.toggle('inside',round.mode==='track'&&round.pointer.inside&&round.contains(round.pointer.x,round.pointer.y));
 byId('mouseTimer').textContent=Math.ceil(round.duration-round.elapsed)+tr(' sn');
 const stats=round.results();byId('liveMetric').textContent=round.mode==='click'?stats.hits+tr(' İSABET'):'%'+Math.round(stats.tracking)+tr(' TAKİP');
}
function advance(now){if(round&&!paused&&!round.done){round.tick(Math.max(0,(now-lastTime)/1000));lastTime=now;if(round.done){finish();return false;}}return !!round&&!paused&&!round.done;}
function frame(now){if(advance(now))render();requestAnimationFrame(frame)}requestAnimationFrame(frame);
arena.addEventListener('pointermove',event=>{if(!round||paused||round.done)return;advance(performance.now());if(round.done)return;const rect=arena.getBoundingClientRect();round.point(event.clientX-rect.left,event.clientY-rect.top);});
arena.addEventListener('pointerleave',()=>{if(round){advance(performance.now());round.pointer.inside=false;}});
arena.addEventListener('pointerdown',event=>{
 if(event.button!==0||!advance(performance.now()))return;
 const rect=arena.getBoundingClientRect();round.click(event.clientX-rect.left,event.clientY-rect.top);render();
});
function pause(){if(!round||round.done)return;if(!paused&&!advance(performance.now()))return;paused=!paused;lastTime=performance.now();round.pointer.inside=false;byId('pauseCover').classList.toggle('hidden',!paused);byId('pauseMouse').textContent=paused?tr('DEVAM ET'):tr('DURAKLAT');}
byId('pauseMouse').onclick=pause;byId('resumeMouse').onclick=pause;
addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&round&&!round.done&&!paused)pause();});
addEventListener('scroll',()=>{if(round){advance(performance.now());round.pointer.inside=false;}},true);
addEventListener('blur',()=>{if(round&&!round.done&&!paused)pause();});
addEventListener('resize',()=>{if(!round||round.done)return;if(!paused)pause();const rect=arena.getBoundingClientRect();round.resize(rect.width,rect.height);render();});
function finish(){if(!round.historySaved){if(typeof ScoreHistory!=='undefined')ScoreHistory.save({kind:'mouse',mode:round.mode,difficulty:roundSettings.difficulty,language:typeof language==='undefined'?'tr':language,duration:round.duration,elapsed:round.elapsed,stats:round.results()});round.historySaved=true;}if(typeof lockLanguage==='function')lockLanguage(false);
 render();target.classList.add('hidden');byId('pauseCover').classList.add('hidden');byId('pauseMouse').disabled=true;document.body.classList.remove('training');document.querySelector('.practicePanel').classList.add('hidden');byId('mouseResult').classList.remove('hidden');
 const stats=round.results(),fmt=(n,d=0)=>n.toLocaleString((typeof locale === 'undefined' ? 'tr-TR' : locale),{maximumFractionDigits:d,minimumFractionDigits:d});
 const metrics=round.mode==='click'?[[stats.hits,tr('İSABET')],[stats.misses,tr('BOŞA TIKLAMA')],[stats.expired,tr('KAÇAN HEDEF')],[stats.accuracy===null?'—':'%'+fmt(stats.accuracy),tr('İSABET ORANI')],[stats.reaction===null?'—':fmt(stats.reaction)+' ms',tr('ORT. TEPKİ SÜRESİ')],[fmt(stats.rate,2),tr('İSABET / SANİYE')]]:[['%'+fmt(stats.tracking),tr('HEDEFTE KALMA')],[fmt(stats.onTarget,1)+tr(' sn'),tr('HEDEF ÜZERİNDE')],[round.duration+tr(' sn'),tr('TUR SÜRESİ')]];
 byId('mouseStats').replaceChildren(...metrics.map(([value,label])=>{const item=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=value;small.textContent=label;item.append(strong,small);return item;}));
 byId('roundDescription').textContent=(round.mode==='click'?tr('Hedef avı'):tr('Akıcı takip'))+' · '+levelNames[roundSettings.difficulty]+' · '+round.duration+tr(' saniye');
 byId('mouseSummary').textContent=round.mode==='click'?tr('İsabet oranı, tıkladığın hedeflerin tüm tıklamalarına oranıdır. Tepki süresi, vurduğun hedeflerin belirmesinden tıklamana kadar geçen süredir.'):tr('Takip oranı, imlecin hedefin içinde kaldığı sürenin toplam tur süresine oranıdır.');
 byId('mouseResult').scrollIntoView({block:'center'});byId('mouseAgain').focus({preventScroll:true});
}
function menu(){if(typeof lockLanguage==='function')lockLanguage(false);round=null;paused=false;document.body.classList.remove('training');byId('setup').classList.remove('hidden');byId('mouseResult').classList.add('hidden');document.querySelector('.practicePanel').classList.remove('hidden');byId('idleGuide').classList.remove('hidden');byId('pauseCover').classList.add('hidden');target.classList.add('hidden');byId('pauseMouse').disabled=true;byId('pauseMouse').textContent=tr('DURAKLAT');byId('mouseTimer').textContent=byId('mouseDuration').value+tr(' sn');choose(selectedMode);byId('mouseStart').focus();}
byId('mouseStart').onclick=()=>start();byId('mouseAgain').onclick=()=>start(true);byId('mouseMenu').onclick=menu;byId('leaveMouse').onclick=menu;choose('click');
