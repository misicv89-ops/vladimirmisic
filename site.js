(() => {
  const CUSTOM_CURSOR = true; // false = sistemski kursor
  const TO = 'misicv89@gmail.com'; // adresa na koju stižu upiti (FormSubmit)
  const E = 'cubic-bezier(.2,.7,0,1)';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3), smooth = t => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const IV = [243, 241, 236], INK = [17, 17, 17];
  const root = document.documentElement;
  const DICT = window.DICT || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursorOn = fine && CUSTOM_CURSOR;
  const isMob = () => innerWidth < 760;

  // ---------- Jezik (SRB / ENG) ----------
  let lang = root.lang === 'en' ? 'en' : 'sr';
  const tr = k => (DICT[k] ? DICT[k][lang] : '');
  const applyLang = l => {
    lang = l === 'en' ? 'en' : 'sr';
    root.lang = lang;
    try { localStorage.setItem('vm-lang', lang); } catch (e) {}
    $$('[data-i18n]').forEach(el => { const v = tr(el.dataset.i18n); if (v) el.textContent = v; });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split('|').forEach(p => {
      const [a, k] = p.split(':'); const v = tr(k); if (v) el.setAttribute(a, v);
    }));
    $$('[data-lang-set]').forEach(b => b.setAttribute('aria-pressed', b.dataset.langSet === lang ? 'true' : 'false'));
    cMode = null;
    if (typeof paintSvc === 'function') paintSvc();
    if (typeof paintForm === 'function') paintForm();
  };
  $$('[data-lang-set]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.langSet)));

  // ---------- Pojavljivanje pri skrolu ----------
  if (!reduced && 'IntersectionObserver' in window) {
    const els = $$('[data-reveal]');
    els.forEach(el => {
      const t = el.dataset.reveal, d = +(el.dataset.delay || 0);
      if (t === 'lines') $$('[data-line]', el).forEach((l, i) => { l.style.transform = 'translate3d(0,110%,0)'; l.style.transition = `transform 1s ${E} ${d + i * 90}ms`; });
      else if (t === 'clip') { el.style.clipPath = 'inset(100% 0 0 0)'; el.style.transition = `clip-path 1.25s cubic-bezier(.7,0,.15,1) ${d}ms`; }
      else if (t === 'num') { el.style.opacity = 0; el.style.transform = 'translate3d(-24px,0,0)'; el.style.transition = `opacity .6s ${E} ${d}ms, transform .9s ${E} ${d}ms`; }
      else { el.style.opacity = 0; el.style.transform = 'translate3d(0,28px,0)'; el.style.transition = `opacity .7s ${E} ${d}ms, transform .9s ${E} ${d}ms`; }
    });
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target.__rv || en.target, t = el.dataset.reveal;
      if (t === 'lines') $$('[data-line]', el).forEach(l => { l.style.transform = 'none'; });
      else if (t === 'clip') el.style.clipPath = 'inset(0 0 0 0)';
      else { el.style.opacity = 1; el.style.transform = 'none'; }
      io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    // element sa clip-path ima nultu vidljivu površinu, pa se posmatra njegov roditelj
    els.forEach(el => {
      if (el.dataset.reveal === 'clip' && el.parentElement) { el.parentElement.__rv = el; io.observe(el.parentElement); }
      else io.observe(el);
    });
  }

  // ---------- Kursor ----------
  const cur = $('[data-cursor-root]'), dot = cur && cur.firstElementChild, lab = dot && dot.firstElementChild, coords = $('[data-coords]');
  const m = { x: -100, y: -100, nx: 0, ny: 0, hx: 0, hy: 0, cx: -100, cy: -100, px: 0, py: 0 };
  let cMode;
  if (cursorOn && cur) { root.classList.add('dc-cursor-on'); cur.style.display = 'block'; }
  const setCursor = t => {
    if (!cursorOn || !t || !t.closest || !dot) return;
    const c = t.closest('[data-cursor]');
    const mode = c ? c.dataset.cursor : (t.closest('a,button,select,label,[role=button]') ? 'link' : 'default');
    if (mode === cMode) return;
    cMode = mode;
    const S = { default: [10, '#F3F1EC', 'difference', ''], link: [34, '#F3F1EC', 'difference', ''], view: [92, '#2D4BE0', 'normal', tr('cursorView')], explore: [116, '#111111', 'normal', tr('cursorExplore')] }[mode];
    dot.style.width = dot.style.height = S[0] + 'px';
    dot.style.margin = `-${S[0] / 2}px 0 0 -${S[0] / 2}px`;
    dot.style.background = S[1];
    cur.style.mixBlendMode = S[2];
    lab.textContent = S[3];
    lab.style.opacity = S[3] ? 1 : 0;
  };
  addEventListener('mousemove', e => {
    m.x = e.clientX; m.y = e.clientY;
    m.nx = e.clientX / innerWidth * 2 - 1; m.ny = e.clientY / innerHeight * 2 - 1;
    if (cursorOn && cur) cur.style.opacity = 1;
    if (coords) coords.textContent = `X ${((m.nx + 1) / 2).toFixed(2)} / Y ${((m.ny + 1) / 2).toFixed(2)}`;
  }, { passive: true });
  if (cursorOn) {
    document.addEventListener('mouseover', e => setCursor(e.target));
    document.addEventListener('mouseout', e => { if (!e.relatedTarget && cur) cur.style.opacity = 0; });
  }

  // ---------- Usluge: pregled na hover (desktop) / dugme (mobilni) ----------
  const svc = $$('#services ul > li');
  let hs = -1, os = -1;
  function paintSvc() {
    const mob = isMob();
    svc.forEach((li, i) => {
      const act = mob ? os === i : hs === i;
      const pv = $('[data-preview]', li), btn = $('button', li);
      li.style.opacity = !mob && hs >= 0 && hs !== i ? 0.2 : 1;
      li.firstElementChild.style.color = act ? '#2D4BE0' : '#6B6B67';
      $('h3', li).style.transform = !mob && act ? 'translate3d(20px,0,0)' : 'none';
      if (pv) {
        pv.style.display = mob ? (os === i ? 'block' : 'none') : (fine ? 'block' : 'none');
        pv.style.opacity = mob ? 1 : (act ? 1 : 0);
        pv.firstElementChild.style.transform = mob || act ? 'scale(1)' : 'scale(.9)';
      }
      if (btn) {
        btn.setAttribute('aria-expanded', os === i ? 'true' : 'false');
        const sp = $('[data-i18n]', btn);
        if (sp) { sp.dataset.i18n = os === i ? 'previewClose' : 'previewOpen'; sp.textContent = tr(sp.dataset.i18n); }
      }
    });
  }
  svc.forEach((li, i) => {
    li.addEventListener('mouseenter', () => { if (!isMob() && fine) { hs = i; paintSvc(); } });
    li.addEventListener('mouseleave', () => { hs = -1; paintSvc(); });
    const btn = $('button', li);
    btn && btn.addEventListener('click', () => { os = os === i ? -1 : i; paintSvc(); });
  });
  addEventListener('resize', paintSvc);

  // ---------- Traka (marquee) ----------
  const mqEl = $('[data-marquee]'), mq = { off: 0, speed: 1, target: 1 };
  if (mqEl) {
    const w = mqEl.parentElement;
    w.addEventListener('mouseenter', () => { mq.target = 0.22; });
    w.addEventListener('mouseleave', () => { mq.target = 1; });
  }

  // ---------- Glavna petlja animacija ----------
  const depthEls = $$('[data-depth]'), spinEls = $$('[data-spin]'), parEls = $$('[data-parallax]'), pvEls = $$('[data-preview]');
  const intro = $('[data-intro]'), introA = $('[data-intro-a]'), introB = $('[data-intro-b]');
  const proc = $('[data-process]'), procFill = $('[data-process-fill]'), stepEls = $$('[data-step]'), nodeEls = $$('[data-step-node]');
  const hsec = $('[data-hscroll]'), htrack = $('[data-htrack]'), hbar = $('[data-hbar]');
  const stmt = $('[data-statement]'), stmtIn = $('[data-statement-inner]'), moveEl = $('[data-move]');
  let spin = 0, compact = null;
  const tick = () => {
    requestAnimationFrame(tick);
    const vh = innerHeight, vw = innerWidth, mob = vw < 760, sy = scrollY;
    if (cursorOn && cur) {
      m.cx += (m.x - m.cx) * 0.24; m.cy += (m.y - m.cy) * 0.24;
      cur.style.transform = `translate3d(${m.cx.toFixed(1)}px,${m.cy.toFixed(1)}px,0)`;
    }
    m.hx += (m.nx - m.hx) * 0.06; m.hy += (m.ny - m.hy) * 0.06;
    if (!reduced && sy < vh * 1.4) depthEls.forEach(el => {
      const d = +el.dataset.depth;
      el.style.transform = fine && !mob
        ? `translate3d(${(m.hx * d * -10).toFixed(2)}px,${(m.hy * d * -7).toFixed(2)}px,0)`
        : `translate3d(0,${(Math.min(sy, vh) * d * -0.05).toFixed(1)}px,0)`;
    });
    if (!reduced) { spin += 1; spinEls.forEach(el => { el.style.transform = `rotate(${(spin * +el.dataset.spin).toFixed(2)}deg)`; }); }
    parEls.forEach(el => {
      const b = el.parentElement.getBoundingClientRect();
      if (b.bottom < -50 || b.top > vh + 50) return;
      const c = (b.top + b.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0,${reduced ? 0 : (c * (mob ? -12 : -28)).toFixed(1)}px,0)`;
    });
    if (fine && !mob) {
      const tx = m.x + 380 > vw ? m.x - 368 : m.x + 28;
      m.px += (tx - m.px) * 0.14; m.py += (m.y - 115 - m.py) * 0.14;
      const rot = clamp((tx - m.px) * 0.03, -4, 4);
      pvEls.forEach(el => { el.style.transform = `translate3d(${m.px.toFixed(1)}px,${m.py.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`; });
    } else pvEls.forEach(el => { el.style.transform = 'none'; });
    if (mqEl) {
      mq.speed += ((reduced ? 0 : mq.target) - mq.speed) * 0.04;
      mq.off -= mq.speed * 0.6;
      const w = mqEl.scrollWidth / 2;
      if (w && -mq.off >= w) mq.off += w;
      mqEl.style.transform = `translate3d(${mq.off.toFixed(1)}px,0,0)`;
    }
    if (intro && introA && introB) {
      const b = intro.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) {
        const p = reduced ? 1 : clamp(-b.top / (b.height - vh));
        const pad = parseFloat(getComputedStyle(introA.parentElement).paddingLeft) || 20;
        const travel = reduced ? 0 : Math.max(0, introA.scrollWidth - (vw - pad * 2));
        introA.style.transform = `translate3d(${(-travel * easeOut(clamp(p / 0.5))).toFixed(1)}px,0,0)`;
        introA.style.opacity = (1 - 0.78 * clamp((p - 0.48) / 0.25)).toFixed(3);
        const q = easeOut(clamp((p - 0.4) / 0.45));
        introB.style.transform = `scale(${(0.22 + 0.78 * q).toFixed(4)})`;
        introB.style.opacity = clamp((p - 0.36) / 0.14).toFixed(3);
      }
    }
    if (proc && procFill) {
      const b = proc.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) {
        const p = reduced ? 1 : clamp((vh * 0.75 - b.top) / (b.height * 0.75));
        procFill.style.transform = mob ? `scaleY(${p.toFixed(4)})` : `scaleX(${p.toFixed(4)})`;
        stepEls.forEach((s, i) => {
          const on = p >= i / 5 * 0.92 + 0.03 ? '1' : '0';
          if (s.dataset.on === on) return;
          s.dataset.on = on;
          s.style.transition = `opacity .6s ${E}, transform .7s ${E}`;
          s.style.opacity = on === '1' ? 1 : 0.18;
          s.style.transform = on === '1' ? 'none' : 'translate3d(0,14px,0)';
          if (nodeEls[i]) nodeEls[i].style.background = on === '1' ? '#2D4BE0' : '#111111';
        });
      }
    }
    // Portfolio: horizontalni skrol na desktopu
    if (hsec && htrack) {
      if (mob) {
        if (hsec.style.height) { hsec.style.height = ''; htrack.style.transform = 'none'; }
      } else {
        const inner = htrack.parentElement, cs = getComputedStyle(inner);
        const avail = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const travel = Math.max(0, htrack.scrollWidth - avail);
        const h = Math.round(vh + travel) + 'px';
        if (hsec.style.height !== h) hsec.style.height = h;
        const b = hsec.getBoundingClientRect();
        const p = travel ? clamp(-b.top / travel) : 0;
        htrack.style.transform = `translate3d(${(-travel * p).toFixed(1)}px,0,0)`;
        if (hbar) hbar.style.transform = `scaleX(${p.toFixed(4)})`;
      }
    }
    if (stmt && stmtIn) {
      const b = stmt.getBoundingClientRect();
      if (b.bottom > -vh && b.top < vh * 1.2) {
        const p = clamp(-b.top / (b.height - vh));
        const t = smooth(clamp((p - 0.12) / 0.45));
        stmt.style.background = `rgb(${mix(IV, INK, t)})`;
        stmtIn.style.color = `rgb(${mix(INK, IV, t)})`;
        if (moveEl) moveEl.style.transform = reduced ? 'none' : `scale(${(1 + 0.34 * easeOut(clamp(p / 0.85))).toFixed(4)})`;
      }
    }
    const c = sy > 60;
    if (c !== compact) { compact = c; root.classList.toggle('compact', c); }
  };
  requestAnimationFrame(tick);

  // ---------- Mobilni meni ----------
  const menu = $('#mobile-menu'), menuBtn = $('[data-menu-btn]');
  const menuOpen = () => menu && !menu.hidden;
  const openMenu = () => {
    menu.hidden = false; document.body.style.overflow = 'hidden'; menuBtn.setAttribute('aria-expanded', 'true');
    const items = $$('[data-menu-line]', menu);
    if (items[0]) items[0].focus({ preventScroll: true });
    if (reduced) return;
    items.forEach((el, i) => {
      el.style.transition = 'none'; el.style.transform = 'translate3d(0,105%,0)';
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = `transform .8s ${E} ${i * 60}ms`; el.style.transform = 'none'; }));
    });
  };
  const closeMenu = silent => {
    menu.hidden = true; document.body.style.overflow = ''; menuBtn.setAttribute('aria-expanded', 'false');
    if (silent !== true) menuBtn.focus();
  };
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', openMenu);
    $('button', menu).addEventListener('click', () => closeMenu());
    addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen()) closeMenu(); });
  }

  // ---------- Navigacija po stranici ----------
  const scrollToId = id => {
    const behavior = reduced ? 'auto' : 'smooth';
    if (id === 'top') return scrollTo({ top: 0, behavior });
    const el = document.getElementById(id); if (!el) return;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - (id === 'contact-form' ? 120 : 0), behavior });
  };
  document.addEventListener('click', e => {
    const g = e.target.closest && e.target.closest('[data-go]');
    if (g) { e.preventDefault(); scrollToId(g.dataset.go); return; }
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || id === 'main' || !document.getElementById(id)) return;
    e.preventDefault();
    if (menuOpen()) closeMenu(true);
    requestAnimationFrame(() => scrollToId(id));
    if (id === 'contact-form') setTimeout(() => { const el = $('#f-name'); el && el.focus({ preventScroll: true }); }, reduced ? 0 : 700);
  });

  // ---------- Kontakt forma ----------
  const form = $('#contact-form');
  let paintForm = null;
  if (form) {
    const KEYS = ['name', 'email', 'business', 'project', 'message'];
    const btn = $('button[type=submit]', form), errBox = $('[data-js=error]'), success = $('[data-js=success]');
    const btnLab = $('[data-i18n]', btn), btnArrow = btn.children[1], btnBar = btn.children[2];
    let submitted = false, honey = '', status = 'idle', focusK = null, errors = {};
    const val = k => $('#f-' + k).value.trim();
    const validate = () => {
      const e = {};
      if (val('name').length < 2) e.name = 'errName';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) e.email = 'errEmail';
      if (val('message').length < 10) e.message = 'errMsg';
      return e;
    };
    const paint = () => KEYS.forEach(k => {
      const el = $('#f-' + k), line = el.parentElement.lastElementChild, label = $('label', el.parentElement.parentElement), errP = $('#f-' + k + '-err');
      const err = errors[k], foc = focusK === k;
      errP.textContent = err ? tr(err) : '';
      el.setAttribute('aria-invalid', err ? 'true' : 'false');
      line.style.transform = foc || err ? 'scaleX(1)' : 'scaleX(0)';
      line.style.background = err && !foc ? '#8A9BFF' : '#2D4BE0';
      label.style.color = foc ? '#F3F1EC' : '#D9D6CF';
    });
    const setStatus = s => {
      status = s;
      const loading = s === 'loading';
      btn.disabled = loading;
      btn.setAttribute('aria-busy', String(loading));
      btnLab.dataset.i18n = loading ? 'sending' : s === 'error' ? 'tryAgain' : 'send';
      btnLab.textContent = tr(btnLab.dataset.i18n);
      btnArrow.textContent = loading ? '' : '↗';
      btnBar.style.transform = loading ? 'scaleX(.92)' : 'scaleX(0)';
      if (errBox) errBox.hidden = s !== 'error';
      form.hidden = s === 'success';
      if (success) success.hidden = s !== 'success';
    };
    paintForm = () => { paint(); setStatus(status); };
    KEYS.forEach(k => {
      const el = $('#f-' + k);
      el.addEventListener('input', () => { if (submitted || errors[k]) errors = validate(); if (status === 'error') setStatus('idle'); paint(); });
      el.addEventListener('focus', () => { focusK = k; paint(); });
      el.addEventListener('blur', () => { focusK = null; if (el.value) errors = { ...errors, [k]: validate()[k] }; paint(); });
    });
    const hp = $('[name=_honey]', form);
    hp && hp.addEventListener('input', e => { honey = e.target.value; });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (status === 'loading') return;
      submitted = true; errors = validate(); paint();
      const first = KEYS.find(k => errors[k]);
      if (first) { $('#f-' + first).focus(); return; }
      setStatus('loading');
      try {
        if (!honey) {
          const data = {}; KEYS.forEach(k => { data[k] = val(k); });
          const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(TO), {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, _subject: tr('subject') + ' — ' + data.name, _template: 'table', _captcha: 'false' }),
          });
          if (!res.ok) throw new Error('send');
        }
        form.reset(); submitted = false; errors = {}; paint();
        setStatus('success');
      } catch (err) { setStatus('error'); }
    });
    success && $('button', success).addEventListener('click', () => setStatus('idle'));
  }

  applyLang(lang);
})();
