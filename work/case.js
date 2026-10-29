(() => {
  /* reveal on scroll. Anything already scrolled past (for example after a refresh) is shown straight away. */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.rv').forEach(el => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('in'); else io.observe(el); });

  /* click (or press Enter on) a screenshot to see it large */
  const lb = document.getElementById('lb'), big = lb.querySelector('img'), x = lb.querySelector('.lbx'); let from = null;
  const close = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (from) from.focus(); };
  const show = f => { const i = f.querySelector('img'); from = f; big.src = i.currentSrc || i.src; big.alt = i.alt; lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); lb.scrollTop = 0; document.body.style.overflow = 'hidden'; x.focus(); };
  document.querySelectorAll('.shot .frame, .device .frame').forEach(f => {
    f.addEventListener('click', () => show(f));
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(f); } });
  });
  lb.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('on')) close(); });
})();