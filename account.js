/* The account button in the top right. Signed out it takes you to PMC ID; signed in it shows your picture and the PMC account menu.
   This site never sees a password. It keeps a name, an email and a small picture, only to show who is signed in, and no token. */
(function () {
  var C = window.PMC_ACCOUNT || {};
  var URL_ = String(C.url || '').trim().replace(/\/+$/, ''), KEY = String(C.key || '').trim();
  var ON = /^https:\/\/[a-z0-9.-]+$/i.test(URL_) && !!KEY && !/^sb_secre[t]_/.test(KEY);
  var ID = 'https://id.pmcstudios.uk';
  var USER = 'pmc:studios:user', ASTATE = 'pmc:studios:astate';
  var USER_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M8 4h8v8H8zM4 21v-3h16v3"/></svg>';

  function okImg(v) { return typeof v === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(v) && v.length < 120000; }
  function same(x, y) { if (x.length !== y.length) return false; var d = 0; for (var i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i); return d === 0; }
  function b64u(a) { var s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

  function saved() {
    try {
      var v = JSON.parse(localStorage.getItem(USER) || 'null');
      return v && typeof v.email === 'string' && typeof v.name === 'string' ? { name: v.name.slice(0, 60), email: v.email.slice(0, 254), img: okImg(v.image) ? v.image : '' } : null;
    } catch (e) { return null; }
  }

  /* Goes to PMC ID. A one-time value is made here and kept in this tab; the way back is only taken if it brings the same value. */
  function startSignIn() {
    if (!ON) { location.assign(ID + '/'); return; }
    var a = new Uint8Array(24); crypto.getRandomValues(a);
    var st = b64u(a);
    try { sessionStorage.setItem(ASTATE, JSON.stringify({ st: st, at: Date.now() })); } catch (e) { location.assign(ID + '/'); return; }
    location.assign(ID + '/signin/?app=studios&state=' + st);
  }

  function head(token, extra) {
    var h = { apikey: KEY, 'content-type': 'application/json' };
    if (token.indexOf('sb_') !== 0) h.authorization = 'Bearer ' + token;
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }
  function timed(url, opt) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 8000); opt.signal = c.signal;
    return fetch(url, opt).finally(function () { clearTimeout(t); });
  }

  /* Coming back from PMC ID the sign-in is in the address. It is taken only if the one-time value matches, and the address is cleaned at once.
     The name and picture are read, then that sign-in is ended: this site only needs to know who you are. */
  function takeReturn() {
    if (!ON) return Promise.resolve();
    var h; try { h = new URLSearchParams(location.hash.replace(/^#/, '')); } catch (e) { return Promise.resolve(); }
    var st = h.get('pmc_state'); if (!st) return Promise.resolve();
    var access = h.get('access_token') || '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
    var want = null;
    try { want = JSON.parse(sessionStorage.getItem(ASTATE) || 'null'); sessionStorage.removeItem(ASTATE); } catch (e) { /* ignore */ }
    if (!want || !want.st || !same(want.st, st) || Date.now() - (want.at || 0) > 15 * 60000 || !access) return Promise.resolve();
    return timed(URL_ + '/auth/v1/user', { headers: head(access) }).then(function (r) { return r.ok ? r.json() : null; }).then(function (me) {
      var email = me && typeof me.email === 'string' ? me.email : ''; if (!email) return;
      return timed(URL_ + '/rest/v1/profiles?select=data', { headers: head(access) }).then(function (p) { return p.ok ? p.json() : []; }).catch(function () { return []; }).then(function (rows) {
        var d = rows && rows[0] && rows[0].data ? rows[0].data : {};
        var name = d.about && typeof d.about.name === 'string' ? d.about.name.trim().slice(0, 30) : '';
        var image = d.avatar && okImg(d.avatar.img) ? d.avatar.img : '';
        try { localStorage.setItem(USER, JSON.stringify({ name: name || email.split('@')[0].slice(0, 30), email: email, image: image })); } catch (e) { return; }
        timed(URL_ + '/rest/v1/app_access?on_conflict=user_id,app', { method: 'POST', headers: head(access, { prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ app: 'studios', label: 'PMC Studios', pmc: true, last_at: new Date().toISOString() }) }).catch(function () { /* the list on the account page just misses this site */ });
        timed(URL_ + '/auth/v1/logout?scope=local', { method: 'POST', headers: head(access) }).catch(function () { /* it runs out by itself */ });
      });
    }).catch(function () { /* nothing is shown as signed in */ });
  }

  function paint() {
    var old = document.getElementById('acct'); if (!old) return;
    var btn = old.cloneNode(false); old.replaceWith(btn);       // a fresh button, with no old click handlers
    var u = saved();
    if (u && window.PmcAccount) {
      PmcAccount.mount(btn, function () {
        return { user: u, others: [], manage: ID + '/info/?from=studios', addAccount: ID + '/add/?from=studios',
          onSignOut: function () { try { localStorage.removeItem(USER); } catch (e) { /* ignore */ } paint(); } };
      });
    } else {
      btn.className = 'pa-btn pa-out'; btn.setAttribute('aria-label', 'Sign in with PMC ID'); btn.innerHTML = USER_ICON;
      btn.addEventListener('click', startSignIn);
    }
  }

  function go() { paint(); takeReturn().then(paint); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  window.addEventListener('storage', function (e) { if (e.key === USER) paint(); });
})();
