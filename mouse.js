const byId=id=>document.getElementById(id);
const arena=byId('arena'),target=byId('target');
let selectedMode='click',round=null,paused=false,lastTime=0,roundSettings=null;
const levelNames={easy:'Kolay',medium:'Orta',hard:'Zor'};
function choose(mode){
 selectedMode=mode;
 for(const [id,value] of [['clickMode','click'],['trackMode','track']]){byId(id).classList.toggle('selected',mode===value);byId(id).setAttribute('aria-pressed',String(mode===value));}
 byId('exerciseLabel').textContent=mode==='click'?'HEDEF AVI':'AKICI TAKİP';
 byId('guideText').textContent=mode==='click'?'Daireye sol tıkla. Her isabette yeni bir hedef belirir.':'Tıklamana gerek yok. İmleci hareketli dairenin içinde tut.';
 byId('practiceHint').textContent=mode==='click'?'Hedef kaybolmadan tıkla. Boşa tıklamalar isabet oranını düşürür.':'Daire dolduğunda doğru yerdesin. Akıcı hareketlerle hedefi takip et.';
 byId('liveMetric').textContent=mode==='click'?'0 İSABET':'%0 TAKİP';
}
byId('clickMode').onclick=()=>choose('click');byId('trackMode').onclick=()=>choose('track');
byId('mouseDuration').onchange=()=>byId('mouseTimer').textContent=byId('mouseDuration').value+' sn';
function start(repeat=false){
 if(!repeat)roundSettings={mode:selectedMode,difficulty:byId('mouseLevel').value,duration:Number(byId('mouseDuration').value)};
 byId('setup').classList.add('hidden');byId('mouseResult').classList.add('hidden');document.querySelector('.practicePanel').classList.remove('hidden');document.body.classList.add('training');
 byId('idleGuide').classList.add('hidden');byId('pauseCover').classList.add('hidden');
 const rect=arena.getBoundingClientRect();round=new MouseRound({...roundSettings,width:rect.width,height:rect.height});paused=false;lastTime=performance.now();
 target.classList.remove('hidden');target.classList.toggle('tracking',round.mode==='track');byId('pauseMouse').disabled=false;byId('pauseMouse').textContent='DURAKLAT';
 arena.scrollIntoView({block:'center'});render();
}
function render(){
 const r=round.level.radius;target.style.width=r*2+'px';target.style.height=r*2+'px';target.style.transform=`translate(${round.target.x-r}px,${round.target.y-r}px)`;
 target.classList.toggle('inside',round.mode==='track'&&round.pointer.inside&&round.contains(round.pointer.x,round.pointer.y));
 byId('mouseTimer').textContent=Math.ceil(round.duration-round.elapsed)+' sn';
 const stats=round.results();byId('liveMetric').textContent=round.mode==='click'?stats.hits+' İSABET':'%'+Math.round(stats.tracking)+' TAKİP';
}
function advance(now){if(round&&!paused&&!round.done){round.tick(Math.max(0,(now-lastTime)/1000));lastTime=now;if(round.done){finish();return false;}}return !!round&&!paused&&!round.done;}
function frame(now){if(advance(now))render();requestAnimationFrame(frame)}requestAnimationFrame(frame);
arena.addEventListener('pointermove',event=>{if(!round||paused||round.done)return;advance(performance.now());if(round.done)return;const rect=arena.getBoundingClientRect();round.point(event.clientX-rect.left,event.clientY-rect.top);});
arena.addEventListener('pointerleave',()=>{if(round){advance(performance.now());round.pointer.inside=false;}});
arena.addEventListener('pointerdown',event=>{
 if(event.button!==0||!advance(performance.now()))return;
 const rect=arena.getBoundingClientRect();round.click(event.clientX-rect.left,event.clientY-rect.top);render();
});
function pause(){if(!round||round.done)return;if(!paused&&!advance(performance.now()))return;paused=!paused;lastTime=performance.now();round.pointer.inside=false;byId('pauseCover').classList.toggle('hidden',!paused);byId('pauseMouse').textContent=paused?'DEVAM ET':'DURAKLAT';}
byId('pauseMouse').onclick=pause;byId('resumeMouse').onclick=pause;
addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&round&&!round.done&&!paused)pause();});
addEventListener('scroll',()=>{if(round){advance(performance.now());round.pointer.inside=false;}},true);
addEventListener('blur',()=>{if(round&&!round.done&&!paused)pause();});
addEventListener('resize',()=>{if(!round||round.done)return;if(!paused)pause();const rect=arena.getBoundingClientRect();round.resize(rect.width,rect.height);render();});
function finish(){
 render();target.classList.add('hidden');byId('pauseCover').classList.add('hidden');byId('pauseMouse').disabled=true;document.body.classList.remove('training');document.querySelector('.practicePanel').classList.add('hidden');byId('mouseResult').classList.remove('hidden');
 const stats=round.results(),fmt=(n,d=0)=>n.toLocaleString('tr-TR',{maximumFractionDigits:d,minimumFractionDigits:d});
 const metrics=round.mode==='click'?[[stats.hits,'İSABET'],[stats.misses,'BOŞA TIKLAMA'],[stats.expired,'KAÇAN HEDEF'],[stats.accuracy===null?'—':'%'+fmt(stats.accuracy),'İSABET ORANI'],[stats.reaction===null?'—':fmt(stats.reaction)+' ms','ORT. TEPKİ SÜRESİ'],[fmt(stats.rate,2),'İSABET / SANİYE']]:[['%'+fmt(stats.tracking),'HEDEFTE KALMA'],[fmt(stats.onTarget,1)+' sn','HEDEF ÜZERİNDE'],[round.duration+' sn','TUR SÜRESİ']];
 byId('mouseStats').replaceChildren(...metrics.map(([value,label])=>{const item=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=value;small.textContent=label;item.append(strong,small);return item;}));
 byId('roundDescription').textContent=(round.mode==='click'?'Hedef avı':'Akıcı takip')+' · '+levelNames[roundSettings.difficulty]+' · '+round.duration+' saniye';
 byId('mouseSummary').textContent=round.mode==='click'?'İsabet oranı, tıkladığın hedeflerin tüm tıklamalarına oranıdır. Tepki süresi, vurduğun hedeflerin belirmesinden tıklamana kadar geçen süredir.':'Takip oranı, imlecin hedefin içinde kaldığı sürenin toplam tur süresine oranıdır.';
 byId('mouseResult').scrollIntoView({block:'center'});byId('mouseAgain').focus({preventScroll:true});
}
function menu(){round=null;paused=false;document.body.classList.remove('training');byId('setup').classList.remove('hidden');byId('mouseResult').classList.add('hidden');document.querySelector('.practicePanel').classList.remove('hidden');byId('idleGuide').classList.remove('hidden');byId('pauseCover').classList.add('hidden');target.classList.add('hidden');byId('pauseMouse').disabled=true;byId('pauseMouse').textContent='DURAKLAT';byId('mouseTimer').textContent=byId('mouseDuration').value+' sn';choose(selectedMode);byId('mouseStart').focus();}
byId('mouseStart').onclick=()=>start();byId('mouseAgain').onclick=()=>start(true);byId('mouseMenu').onclick=menu;byId('leaveMouse').onclick=menu;choose('click');
