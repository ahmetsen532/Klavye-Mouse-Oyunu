(() => {
  const key = 'son-hat-scores-v1';
  const empty = () => ({recent: [], records: {}});
  const valid = r => r && ['keyboard','mouse'].includes(r.kind) && ['survival','sprint','click','track'].includes(r.mode) && ['easy','medium','hard'].includes(r.difficulty) && ['tr','en'].includes(r.language) && Number.isFinite(r.duration) && Number.isFinite(r.elapsed) && r.stats && Object.values(r.stats).every(v => v === null || (Number.isFinite(v) && v >= 0));
  let memory = empty(), storageFailed = false;
  function read() {
    if (storageFailed) return memory;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data) return memory;
      if (!Array.isArray(data.recent) || !data.records || typeof data.records !== 'object') return memory;
      memory = {recent:data.recent.filter(valid).slice(0,5),records:Object.fromEntries(Object.entries(data.records).filter(([,r])=>valid(r)))};
    } catch { /* Keep this session usable if storage is unavailable or damaged. */ }
    return memory;
  }
  const group = r => [r.kind,r.mode,r.difficulty,r.language,r.duration].join(':');
  const score = r => r.kind === 'keyboard' ? r.stats.correct : r.mode === 'click' ? r.stats.hits : r.stats.tracking;
  function enabled(){try{return localStorage.getItem('son-hat-save-scores')==='on';}catch{return false;}}
  function clear(){localStorage.removeItem(key);memory=empty();storageFailed=false;}
  function save(result) {
    if(!enabled())return;
    if (!valid(result)) return;
    const data = read(), entry = {...result,date:new Date().toISOString()};
    data.recent = [entry,...data.recent].slice(0,5);
    const id = group(entry);
    if (!data.records[id] || score(entry) > score(data.records[id])) data.records[id] = entry;
    memory = data;
    try { localStorage.setItem(key,JSON.stringify(data)); storageFailed = false; } catch { storageFailed = true; }
  }
  const api = {read,save,group,score,enabled,clear};
  if (typeof module !== 'undefined' && module.exports) { module.exports=api; return; }
  window.ScoreHistory=api;
  const en = typeof language !== 'undefined' && language === 'en';
  const t = (tr,enText) => en ? enText : tr;
  const fmt = n => Number(n).toLocaleString(en?'en-US':'tr-TR',{maximumFractionDigits:2});
  const node = (tag,text,className) => {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
  const dialog = node('dialog',undefined,'scoresDialog');
  dialog.setAttribute('aria-labelledby','scoresTitle');
  const top=node('div',undefined,'scoresTop'),title=node('h2',t('Skorlarım','My scores')),close=node('button',t('Kapat ×','Close ×'));
  title.id='scoresTitle';close.type='button';top.append(title,close);dialog.append(top);
  const content=node('div');dialog.append(content);document.body.append(dialog);
  const open=document.getElementById('scoresOpen');open.textContent=t('SKORLARIM','MY SCORES');
  close.onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  // Keep Escape local to the dialog so it cannot resume a paused game.
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
  const modes={survival:t('Hayatta kal','Survival'),sprint:t('Hız turu','Speed round'),click:t('Hedef avı','Target hunt'),track:t('Akıcı takip','Smooth tracking')};
  const levels={easy:t('Kolay','Easy'),medium:t('Orta','Medium'),hard:t('Zor','Hard')};
  const label=r=>`${modes[r.mode]} · ${levels[r.difficulty]} · ${r.language.toUpperCase()} · ${r.duration} ${t('sn','s')}`;
  const value=r=>`${fmt(score(r))} ${r.kind==='keyboard'?t('kelime','words'):r.mode==='click'?t('isabet','hits'):'%'}`;
  function row(r) {
    const details=node('details',undefined,'scoreEntry'),summary=node('summary');
    summary.append(node('span',label(r)),node('strong',value(r)));
    details.append(summary,node('p',new Date(r.date).toLocaleString(en?'en-US':'tr-TR')));
    const stats=r.stats,grid=node('dl',undefined,'scoreMetrics');
    const metrics=r.kind==='keyboard'?[[t('Doğru kelime','Correct words'),stats.correct],[t('Kelime / saniye','Words / second'),stats.rate],[t('Hatalı deneme','Incorrect attempts'),stats.errors],[t('Kaçırılan kelime','Missed words'),stats.missed]]:r.mode==='click'?[[t('İsabet','Hits'),stats.hits],[t('Boşa tıklama','Empty clicks'),stats.misses],[t('Kaçan hedef','Missed targets'),stats.expired],[t('İsabet oranı (%)','Accuracy (%)'),stats.accuracy],[t('Tepki süresi (ms)','Reaction time (ms)'),stats.reaction],[t('İsabet / saniye','Hits / second'),stats.rate]]:[[t('Takip oranı (%)','Tracking (%)'),stats.tracking],[t('Hedef üzerinde (sn)','Time on target (s)'),stats.onTarget]];
    metrics.push([t('Oynanan süre (sn)','Active time (s)'),r.elapsed]);
    for(const [name,n] of metrics){const item=node('div');item.append(node('dt',name),node('dd',n===null?'—':fmt(n)));grid.append(item);}
    details.append(grid);return details;
  }
  open.onclick=()=>{
    if(typeof running!=='undefined'&&running&&!paused)pause();
    else if(typeof round!=='undefined'&&round&&!round.done&&!paused)pause();
    content.replaceChildren();const data=read();
    const setting=node('label',undefined,'scorePreference'),check=node('input');check.type='checkbox';check.checked=enabled();
    setting.append(check,document.createTextNode(t('Skorlarımı bu cihazda hatırla','Remember my scores on this device')));content.append(setting);
    const status=node('p');status.setAttribute('role','status');
    check.onchange=()=>{try{localStorage.setItem('son-hat-save-scores',check.checked?'on':'off');status.textContent=t('Tercihin kaydedildi. Kapatmak eski kayıtları silmez.','Preference saved. Turning this off does not delete older records.');}catch{check.checked=enabled();status.textContent=t('Tarayıcı tercihi kaydedemedi.','Your browser could not save the preference.');}};
    const remove=node('button',t('Skor kayıtlarını sil','Delete score history'));remove.type='button';remove.onclick=()=>{if(!confirm(t('Tüm skor geçmişin ve rekorların silinsin mi? Bu işlem geri alınamaz.','Delete all score history and personal bests? This cannot be undone.')))return;try{clear();dialog.close();open.click();}catch{status.textContent=t('Kayıtlar silinemedi. Tarayıcı ayarlarından site verilerini temizleyebilirsin.','Could not delete records. You can clear site data in browser settings.');}};
    content.append(remove,status);
    if(!enabled())content.append(node('p',t('Skor kaydı kapalı. İstersen yukarıdan açabilirsin; oyun sonuçları her tur sonunda yine gösterilir.','Score saving is off. Enable it above if you wish; round results are still shown after each game.')));
    content.append(node('p',storageFailed?t('Tarayıcı kayıt yapamadı. Bu oturumdaki skorlar kapanınca kaybolabilir.','Browser storage failed. Scores from this session may be lost when you close it.'):t('Bu tarayıcıda saklanır. Tarayıcı verileri silinirse skorlar da silinir.','Saved in this browser. Clearing browser data also removes scores.')));
    content.append(node('h3',t('Son 5 oyun','Last 5 games')));
    if(!data.recent.length)content.append(node('p',t('Henüz tamamlanan bir oyun yok. İlk turunu bitir!','No completed games yet. Finish your first round!')));
    data.recent.forEach(r=>content.append(row(r)));
    content.append(node('h3',t('Kişisel rekorlar','Personal bests')),node('p',t('Mod, zorluk, dil ve tur süresi ayrı değerlendirilir. Klavyede doğru kelime, hedef avında isabet, takipte yüzde esas alınır. Ayrıntılar için bir kayda tıkla.','Records are separate by mode, difficulty, language and round duration. Ranked by correct words, target hits or tracking percentage. Click a record for details.')));
    Object.values(data.records).sort((a,b)=>label(a).localeCompare(label(b))).forEach(r=>content.append(row(r)));
    dialog.showModal();
  };
})();

