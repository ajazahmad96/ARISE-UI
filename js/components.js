/* Reusable UI building blocks. Each returns an HTML string; change one here, every screen follows. */
const A = 'assets/';
const C = {
  ic: (n, cls = '') => `<img class="ic ${cls}" src="${A}icons/${n}.svg" alt="">`,
  header: (title) => `<div class="hdr"><div class="brand"><img src="${A}logo/arise-logo.svg" alt="ARISE logo"><div><b>ARISE</b><small>TRACKER &amp; AUDIT</small></div></div><h1>${title}</h1></div>`,
  nav: (active) => [['dashboard','Dashboard'],['tasks','Tasks'],['audit','Audit'],['stats','Stats'],['awards','Awards'],['calendar','Calendar'],['profile','Profile']]
    .map(([k, l]) => `<button class="${k === active ? 'on' : ''}" data-go="${k}">${C.ic(k + (k === active ? '-active' : ''))}${l}</button>`).join(''),
  chips: (items, on = 0) => `<div class="chips" data-seg>${items.map((t, i) => `<button class="chip ${i === on ? 'on' : ''}">${t}</button>`).join('')}</div>`,
  ring(pct, size = 120, sw = 10, inner = '') {
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><defs><linearGradient id="rg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0564F4"/><stop offset="1" stop-color="#63C9FF"/></linearGradient></defs><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${(c*pct/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg><div>${inner}</div></div>`;
  },
  tile: (l, v, s = '') => `<div class="card"><div class="lbl">${l}</div><div class="big" style="margin-top:6px">${v}</div>${s ? `<div class="sub">${s}</div>` : ''}</div>`,
  rank: (name, cls = '') => `<img class="rank ${cls}" src="${A}ranks/${name.toLowerCase().replace(/ /g, '-')}.svg" alt="${name}">`,
  task: (t, cat, time, done) => `<div class="row" style="padding:12px 0;border-bottom:1px solid var(--border)"><div class="ck ${done ? 'on' : ''}"></div><div class="grow"><div class="${done ? 'done' : ''}" style="font-size:15px;font-weight:500">${t}</div><div class="sub">${time}</div></div><span class="tag">${cat}</span></div>`,
  bar: (p) => `<div class="bar"><i style="width:${p}%"></i></div>`,
  sheet: (title, body) => `<div class="scrim" data-close><div class="sheet" onclick="event.stopPropagation()"><div class="row"><h2 class="grow">${title}</h2><button data-close>${C.ic('close')}</button></div>${body}</div></div>`,
  dialog: (title, body, btns) => `<div class="scrim mid" data-close><div class="dlg" onclick="event.stopPropagation()"><h2>${title}</h2>${body}${btns}</div></div>`,
  toast: (t) => `<div class="toast">${t}</div>`,
};
