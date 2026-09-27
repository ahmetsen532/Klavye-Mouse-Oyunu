(() => {
  const key = 'son-hat-interface-motion';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motionToggle');
  let saved = null;
  try { saved = localStorage.getItem(key); } catch {}
  let enabled = saved === null ? !preference.matches : saved === 'on';
  function apply() {
    document.documentElement.classList.toggle('motion-on', enabled && !preference.matches);
    button.textContent = `ANİMASYON: ${enabled && !preference.matches ? 'AÇIK' : 'KAPALI'}`;
    button.setAttribute('aria-pressed', String(enabled && !preference.matches));
    button.title = preference.matches ? 'Sistemindeki azaltılmış hareket tercihi etkin.' : 'Menü ve düğme efektlerini aç / kapat';
  }
  button.addEventListener('click', () => {
    enabled = !document.documentElement.classList.contains('motion-on');
    try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
    apply();
  });
  preference.addEventListener('change', apply);
  apply();

  const nav = document.querySelector('.trainingNav');
  let navigating = false;
  function cleanup() {
    navigating = false;
    document.body.classList.remove('content-slide-out-left','content-slide-out-right');
    document.documentElement.classList.remove('page-sliding');
  }
  // The embedded destination must stay still while its parent slides it in.
  if (window.self !== window.top) document.documentElement.classList.add('slide-preview');
  try {
    if (sessionStorage.getItem('son-hat-slide-arrival') === location.pathname) {
      sessionStorage.removeItem('son-hat-slide-arrival');
      document.documentElement.classList.add('slide-preview');
      setTimeout(() => document.documentElement.classList.remove('slide-preview'), 650);
    }
  } catch {}
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !nav.contains(link) || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.getAttribute('aria-current') === 'page') { event.preventDefault(); return; }
    if (!document.documentElement.classList.contains('motion-on')) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const destination = new URL(link.href);
    const direction = destination.pathname.endsWith('/mouse.html') ? 'left' : 'right';
    document.body.classList.add(direction === 'left' ? 'content-slide-out-left' : 'content-slide-out-right');
    setTimeout(() => location.assign(destination.href), 180);
  });
  addEventListener('pageshow', cleanup);
})();
