/* PMC account menu. Every PMC app uses this one file; apps made by others can restyle it.
   PmcAccount.mount(button, () => options)   turns an empty button into the account picture and opens the menu from it.
   PmcAccount.open(anchor, options)          opens the menu from any element.
   options = {
     user:   { name, email, img }             img is optional (an address or a data: picture)
     others: [{ name, email, img }]           other accounts on this device; the group hides when empty
     manage: 'https://id.pmcstudios.uk/info'  Manage PMC ID
     addAccount: 'https://id.pmcstudios.uk/?add=1'
     onSettings()                             leave out and the Settings row is not drawn
     onSwitch(account), onSignOut()
     look: 'pmc' | 'flat' | 'round'           'pmc' by default; flat and round are for apps that are not PMC's own
     vars: { '--pa-font': '...', ... }        any of the CSS variables below, to match another app
   }
   Privacy and Terms always go to pmcstudios.uk. */
(function () {
  if (window.PmcAccount) return;
  var S = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="1.5"';
  function svg(d, n) { return '<svg viewBox="0 0 24 24" width="' + (n || 20) + '" height="' + (n || 20) + '" ' + S + ' aria-hidden="true"><path d="' + d + '"/></svg>'; }
  /* From PMC Icons (icons/pmc-icons.js), copied in so this file needs nothing else. */
  var I = {
    user: 'M8 4h8v8H8zM4 21v-3h16v3',
    plus: 'M12 4v16M4 12h16',
    pen: 'M4 20l1-5L16 4l4 4L9 19zM13 7l4 4',
    gear: 'M10 3h4v3l2.2 1.3L19 5.8l2 3.4-2.8 1.5v2.6l2.8 1.5-2 3.4-2.8-1.5L14 18v3h-4v-3l-2.2-1.3L5 18.2l-2-3.4 2.8-1.5v-2.6L3 9.2l2-3.4 2.8 1.5L10 6zM10 10h4v4h-4z',
    out: 'M10 4H4v16h6M9 12h12M16 7l5 5-5 5',
    close: 'M5 5l14 14M19 5L5 19',
  };

  var CSS = [
    ':root{--pa-ink:#171717;--pa-paper:#FBF6EC;--pa-shadow:#1A4934;--pa-accent:#337957;--pa-danger:#B3261E;--pa-frame:3px;--pa-radius:0px;--pa-lift:8px;',
    '--pa-font:"PMC Symbols L4 Upright","PMC Font Upright","PMC Font","Plex","Courier New",monospace;--pa-head:"PMC Symbols L2","PMC Header","Shoulders","Arial Narrow",Impact,sans-serif;--pa-case:uppercase}',
    '.pa-look-flat{--pa-frame:1px;--pa-lift:0px;--pa-radius:0px;--pa-head:system-ui,sans-serif;--pa-font:system-ui,sans-serif;--pa-case:none}',
    '.pa-look-round{--pa-frame:1px;--pa-lift:0px;--pa-radius:14px;--pa-head:system-ui,sans-serif;--pa-font:system-ui,sans-serif;--pa-case:none}',
    '.pa-btn{display:grid;place-items:center;width:40px;height:40px;padding:0;overflow:hidden;background:var(--pa-cbg,#B49A57);color:var(--pa-cfg,var(--pa-ink));border:var(--pa-frame) solid var(--pa-ink);border-radius:var(--pa-radius);cursor:pointer;font:400 20px/1 var(--pa-head);text-transform:uppercase}',
    '.pa-btn:hover,.pa-btn[aria-expanded=true],.pa-btn:focus-visible{outline:none;box-shadow:3px 3px 0 var(--pa-shadow)}.pa-btn:hover,.pa-btn[aria-expanded=true]{transform:translate(-2px,-2px)}.pa-btn:active{transform:translate(1px,1px);box-shadow:0 0 0 var(--pa-shadow);transition-duration:.04s}.pa-btn{transition:transform .12s,box-shadow .12s,background-color .15s}.pa-pop :focus-visible{outline:none}.pa-foot a:focus-visible{background:var(--pa-accent);color:#FBF6EC;text-decoration:none;opacity:1}',
    '.pa-btn img,.pa-av img{width:100%;height:100%;object-fit:cover;display:block}',
    '.pa-pop{position:fixed;z-index:2147483000;width:min(380px,calc(100vw - 16px));box-sizing:border-box;background:var(--pa-paper);color:var(--pa-ink);border:var(--pa-frame) solid var(--pa-ink);border-radius:var(--pa-radius);box-shadow:var(--pa-lift) var(--pa-lift) 0 var(--pa-shadow);font:400 14px/1.35 var(--pa-font);font-synthesis:none;overflow:hidden;transition:height .26s cubic-bezier(.16,1,.3,1);animation:pa-up .18s cubic-bezier(.16,1,.3,1)}',
    '.pa-look-flat.pa-pop,.pa-look-round.pa-pop{box-shadow:0 10px 30px rgba(0,0,0,.16)}',
    '@keyframes pa-up{from{transform:translateY(10px);opacity:0}}',
    '.pa-in{padding:10px}',
    '.dpfp{width:62%;height:62%;display:block}.pa-av .dpfp{stroke-width:2}.pa-h{font-family:var(--pa-head);text-transform:var(--pa-case);font-weight:400;letter-spacing:.03em;line-height:.95}',
    '.pa-card{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;padding:18px 14px;border:var(--pa-frame) solid var(--pa-ink);border-radius:var(--pa-radius);background:var(--pa-cbg,var(--pa-paper));color:var(--pa-cfg,var(--pa-ink));transition:background .2s,color .2s}',
    '.pa-card>*{position:relative;z-index:1}',
    '.pa-dots{position:absolute!important;z-index:0!important;inset:0;color:var(--pa-c);pointer-events:none}',
    '.pa-dots i{position:absolute;inset:0}',
    '.pa-dots i:nth-child(1){background:radial-gradient(circle at center,currentColor 0 3px,transparent 3.2px) 0 0/11px 11px;-webkit-mask-image:radial-gradient(circle farthest-corner at 100% 0,#000 0 9%,transparent 30%);mask-image:radial-gradient(circle farthest-corner at 100% 0,#000 0 9%,transparent 30%)}',
    '.pa-dots i:nth-child(2){background:radial-gradient(circle at center,currentColor 0 2.2px,transparent 2.4px) 0 0/11px 11px;-webkit-mask-image:radial-gradient(circle farthest-corner at 100% 0,transparent 0 9%,#000 24%,transparent 48%);mask-image:radial-gradient(circle farthest-corner at 100% 0,transparent 0 9%,#000 24%,transparent 48%)}',
    '.pa-dots i:nth-child(3){background:radial-gradient(circle at center,currentColor 0 1.2px,transparent 1.4px) 0 0/11px 11px;-webkit-mask-image:radial-gradient(circle farthest-corner at 100% 0,transparent 0 24%,#000 40%,transparent 66%);mask-image:radial-gradient(circle farthest-corner at 100% 0,transparent 0 24%,#000 40%,transparent 66%)}',
    
    '.pa-av{flex:none;display:grid;place-items:center;width:62px;height:62px;overflow:hidden;background:#B49A57;color:var(--pa-ink);border:var(--pa-frame) solid var(--pa-ink);border-radius:var(--pa-radius);font:400 32px/1 var(--pa-head);text-transform:uppercase}',
    '.pa-look-round .pa-av,.pa-look-round.pa-btn{border-radius:50%}',
    '.pa-who{min-width:0}',
    '.pa-name{font-size:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pa-mail{display:block;margin-top:5px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pa-accs{display:grid}.pa-accs>.pa-card+.pa-card{border-top:0}',
    '.pa-grp{display:grid;margin-top:10px;border:var(--pa-frame) solid var(--pa-ink);border-radius:var(--pa-radius);overflow:hidden}',
    '.pa-btn.pa-on{background:var(--pa-ink)!important;color:var(--pa-paper)}',
    '.pa-other{width:100%;text-align:left;cursor:pointer;padding:9px 10px;gap:10px;font:inherit}',
    '.pa-other .pa-av{width:36px;height:36px;font-size:18px}',
    '.pa-other .pa-name{font-size:19px}.pa-other .pa-mail{margin-top:2px;font-size:12.5px}',
    '.pa-other:hover .pa-who,.pa-other:focus-visible .pa-who{text-decoration:underline;text-underline-offset:3px}.pa-other:focus-visible{outline:none;box-shadow:inset 0 0 0 3px var(--pa-accent)}',
    
    '.pa-row{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;margin:0;background:transparent;color:inherit;border:0;border-top:var(--pa-frame) solid var(--pa-ink);cursor:pointer;font:400 19px/1 var(--pa-head);text-transform:var(--pa-case);letter-spacing:.03em;text-align:left;text-decoration:none;box-sizing:border-box}',
    '.pa-look-flat .pa-row,.pa-look-round .pa-row{font-size:15px;font-weight:500;letter-spacing:0}',
    '.pa-row:first-child{border-top:0}',
    '.pa-row:hover,.pa-row:focus-visible{background:var(--pa-ink);color:var(--pa-paper);outline:none}',
    '.pa-row.pa-so{color:var(--pa-danger)}.pa-row.pa-so:hover,.pa-row.pa-so:focus-visible{background:var(--pa-danger);color:#FBF6EC}',
    '.pa-fl{display:grid;width:38px;flex:none}.pa-fl svg{width:100%;height:auto;display:block}.pa-fk{display:flex;gap:6px}.pa-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;padding:2px 0 0;font-size:11.5px;line-height:1.4}',
        '.pa-foot a{color:inherit;text-decoration:none;opacity:.85}.pa-foot a:hover{text-decoration:underline;opacity:1}',
    '@media (prefers-reduced-motion:reduce){.pa-pop{animation:none;transition:none}}',
  ].join('');

  var GOLD = '#B49A57', cache = {};
  function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
  function rgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
  function lum(c) { return c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function mix(c, t, k) { return c.map(function (v, i) { return v + (t[i] - v) * k; }); }
  /* The colours for a card behind a picture: the picture's main colour as the background, text in ink or white (whichever reads better),
     and dots in the same colour, darker on a light background and lighter on a dark one. No picture: PMC gold. */
  function tone(h) {
    var c = rgb(h), L = lum(c), ink = (L + 0.05) / 0.0588, white = 1.0004 / (L + 0.05);   // contrast with #171717 and #FBF6EC
    var light = ink >= white;
    return { bg: h, fg: light ? '#171717' : '#FBF6EC', dots: hex(light ? mix(c, [0, 0, 0], 0.32) : mix(c, [255, 255, 255], 0.34)) };
  }
  /* The most common colour in a picture (colours grouped into buckets, the fullest bucket averaged). */
  function dominant(src) {
    if (!src) return Promise.resolve(GOLD);
    if (cache[src]) return Promise.resolve(cache[src]);
    return new Promise(function (res) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = c.height = 32;
          var x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 32);
          var d = x.getImageData(0, 0, 32, 32).data, B = {}, best = null;
          for (var i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            var k = (d[i] >> 5) + '.' + (d[i + 1] >> 5) + '.' + (d[i + 2] >> 5), b = B[k] || (B[k] = [0, 0, 0, 0]);
            b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++;
            if (!best || b[3] > best[3]) best = b;
          }
          res(cache[src] = best ? hex([best[0] / best[3], best[1] / best[3], best[2] / best[3]]) : GOLD);
        } catch (e) { res(GOLD); }
      };
      im.onerror = function () { res(GOLD); };
      im.src = src;
    });
  }
  function paint(el, src) { return dominant(src).then(function (h) { var t = tone(h); el.style.setProperty('--pa-cbg', t.bg); el.style.setProperty('--pa-cfg', t.fg); el.style.setProperty('--pa-c', t.dots); return t; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function letter() { return '<svg class="dpfp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="miter" aria-hidden="true"><rect x="8" y="3" width="8" height="8"/><path d="M3 21v-6h18v6"/></svg>'; }
  function avatar(u) { return '<span class="pa-av">' + (u.img ? '<img alt="" src="' + esc(u.img) + '">' : letter(u)) + '</span>'; }
  function dots() { return '<span class="pa-dots" aria-hidden="true"><i></i><i></i><i></i></span>'; }

  var pop = null, opener = null, ro = null;
  function style() {
    if (document.getElementById('pa-css')) return;
    var s = document.createElement('style'); s.id = 'pa-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function close() {
    if (!pop) return;
    if (ro) ro.disconnect();
    pop.remove(); pop = null;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', onOut, true);
    if (opener) { opener.setAttribute('aria-expanded', 'false'); if (opener._pa) { opener.classList.remove('pa-on'); opener.innerHTML = opener._pa; opener.setAttribute('aria-label', 'Your PMC ID'); } opener.focus(); opener = null; }
  }
  function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
  function onOut(e) { if (pop && !pop.contains(e.target) && !(opener && opener.contains(e.target))) close(); }

  function draw(o) {
    var u = o.user, h = '<div class="pa-in">';
    h += '<div class="pa-accs"><div class="pa-card" data-c="' + esc(u.img || '') + '">' + dots() + avatar(u) + '<span class="pa-who"><span class="pa-h pa-name">' + esc(u.name || 'PMC user') + '</span><span class="pa-mail">' + esc(u.email) + '</span></span></div>';
    if (o.others && o.others.length) {
      o.others.forEach(function (a, i) {
        h += '<button type="button" class="pa-card pa-other" data-pa="switch" data-i="' + i + '" data-c="' + esc(a.img || '') + '">' + dots() + avatar(a) + '<span class="pa-who"><span class="pa-h pa-name">' + esc(a.name || a.email) + '</span><span class="pa-mail">' + esc(a.email) + '</span></span></button>';
      });
    }
    h += '</div>';
    h += '<div class="pa-grp">';
    h += '<a class="pa-row" href="' + esc(o.addAccount || 'https://id.pmcstudios.uk/?add=1') + '">' + svg(I.plus) + 'Add account</a>';
    h += '<button class="pa-row pa-so" type="button" data-pa="out">' + svg(I.out) + 'Sign out</button>';
    h += '</div>';
    h += '<div class="pa-grp"><a class="pa-row" href="' + esc(o.manage || 'https://id.pmcstudios.uk/info') + '">' + svg(I.pen) + 'Manage PMC ID</a></div>';
    if (o.onSettings) h += '<div class="pa-grp"><button class="pa-row" type="button" data-pa="settings">' + svg(I.gear) + 'Settings</button></div>';
    h += '<div class="pa-foot">' + (o.footerLogo === false || !window.PmcLogo ? '' : '<span class="pa-fl" aria-hidden="true">' + PmcLogo.mark('mark') + '</span>') + '<span class="pa-fk"><a href="https://pmcstudios.uk/privacy">Privacy Policy</a> · <a href="https://pmcstudios.uk/terms">Terms of Service</a></span></div>';
    return h + '</div>';
  }

  function open(anchor, o) {
    if (pop) { var same = opener === anchor; close(); if (same) return; }
    if (!o || !o.user) return;
    style();
    opener = anchor;
    pop = document.createElement('div');
    pop.className = 'pa-pop pa-look-' + (o.look || 'pmc');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Your PMC ID');
    if (o.vars) Object.keys(o.vars).forEach(function (k) { pop.style.setProperty(k, o.vars[k]); });
    pop.innerHTML = draw(o);
    document.body.appendChild(pop);
    pop.querySelectorAll('[data-c]').forEach(function (c) { paint(c, c.getAttribute('data-c')); });
    var r = anchor.getBoundingClientRect();
    pop.style.top = Math.min(r.bottom + 10, innerHeight - 20) + 'px';
    pop.style.right = Math.max(8, innerWidth - r.right) + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    if (anchor._pa != null) { anchor.classList.add('pa-on'); anchor.innerHTML = svg(I.close, 20); anchor.setAttribute('aria-label', 'Close'); }
    /* The box grows and shrinks smoothly when what is inside changes size. */
    var inner = pop.firstChild, last = 0;
    ro = new ResizeObserver(function () { var h = inner.offsetHeight + 2 * parseFloat(getComputedStyle(pop).borderTopWidth); if (h !== last) { pop.style.height = h + 'px'; last = h; } });
    ro.observe(inner);
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pa]'); if (!b) return;
      var a = b.getAttribute('data-pa');
      if (a === 'close') close();
      else if (a === 'settings') { close(); o.onSettings(); }
      else if (a === 'out') { close(); if (o.onSignOut) o.onSignOut(); }
      else if (a === 'switch') { var acc = o.others[+b.getAttribute('data-i')]; close(); if (o.onSwitch) o.onSwitch(acc); }
    });
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onOut, true);
    var first = pop.querySelector('.pa-row'); if (first) first.focus({ preventScroll: true });
  }

  function mount(btn, get) {
    style();
    btn.classList.add('pa-btn');
    btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
    var o = get();
    if (o.look) btn.classList.add('pa-look-' + o.look);
    btn.setAttribute('aria-label', 'Your PMC ID');
    btn.innerHTML = btn._pa = o.user && o.user.img ? '<img alt="" src="' + esc(o.user.img) + '">' : letter(o.user);
    btn.addEventListener('click', function () { open(btn, get()); });
  }

  window.PmcAccount = { mount: mount, open: open, close: close, paint: paint, tone: tone, dominant: dominant };
})();
