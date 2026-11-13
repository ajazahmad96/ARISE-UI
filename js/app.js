/* Prototype router. UI only: no data, no persistence. */
const $ = (s) => document.querySelector(s);
const byId = (id) => SCREENS.find(s => s.id === id);
let current = 'library';
function library() {
  const cats = [...new Set(SCREENS.map(s => s.cat))];
  return `<div class="hdr"><div class="brand"><img src="${A}logo/arise-logo.svg" alt="ARISE logo"><div><b>ARISE</b><small>UI STUDIO</small></div></div><h1>Screen Library</h1></div>
  <div class="view lib"><div class="sub">Every screen and state in the app. Tap to preview.</div>${cats.map(c => `<h3>${c}</h3>${SCREENS.filter(s => s.cat === c).map(s => `<button data-go="${s.id}">${s.title}${C.ic('chevron')}</button>`).join('')}`).join('')}</div>`;
}
function open(id) {
  current = id;
  const def = byId(id);
  const scr = $('#screen'), ovl = $('#overlay');
  ovl.innerHTML = ''; scr.style.animation = 'none'; void scr.offsetWidth; scr.style.animation = '';
  if (id === 'library') { scr.innerHTML = library(); $('#name').textContent = 'Screen Library'; return; }
  if (def.full) scr.innerHTML = def.full();
  else scr.innerHTML = MAIN[def.main ? id : def.base]();
  if (def.ov) ovl.innerHTML = def.ov();
  $('#name').textContent = def.title;
  const v = scr.querySelector('.view'); if (v) v.scrollTop = 0;
}
document.addEventListener('click', (e) => {
  const seg = e.target.closest('[data-seg] .chip');
  if (seg) { seg.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); seg.classList.add('on'); return; }
  const go = e.target.closest('[data-go]');
  if (go) { open(go.dataset.go); return; }
  if (e.target.closest('[data-close]')) { $('#overlay').innerHTML = ''; return; }
});
$('#toLib').addEventListener('click', () => open('library'));
open(new URLSearchParams(location.search).get('screen') || 'library');
