/* ==========================================================================
   AZIMUT · theme.js
   1. Les comportements de la référence (apparitions, en-tête, parallaxe, itinéraire en accordéon, menu).
   2. Les ajouts boutique : formulaire « concepteur », panier en tiroir, réservation d'une date, carte cadeau, avis.
   Vanilla, chargé en defer. Sans JS, tous les formulaires restent natifs.
   ========================================================================== */
(function () {
  var A = window.Azimut || { routes: {} };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Apparitions (référence) ---------- */
  var els = $$('.rv,.clip');
  if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var c = new Map();
    els.forEach(function (e) { var p = e.parentNode, n = c.get(p) || 0; e.style.setProperty('--d', (Math.min(n, 4) * .09) + 's'); c.set(p, n + 1); });
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .05, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
    requestAnimationFrame(function () { els.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); }); });
  }

  /* ---------- En-tête qui se solidifie (accueil seulement) ---------- */
  var hd = $('[data-header]'), cta = $('#navcta');
  if (hd && hd.dataset.home === 'true') {
    var scrollNav = function () {
      var solid = scrollY > innerHeight * .82;
      hd.classList.toggle('solid', solid);
      if (cta) cta.className = 'b ' + (solid ? 'b-ink' : 'b-lt');
    };
    addEventListener('scroll', scrollNav, { passive: true }); scrollNav();
  }

  /* ---------- Parallaxe hero + bande (référence) ---------- */
  var hi = $('#heroImg'), hm = $('#heroMark'), bi = $('#bandImg'), tick = false;
  function para() {
    var y = scrollY;
    if (hi && hm && y < innerHeight * 1.2) { hi.style.transform = 'translateY(' + (y * .28) + 'px)'; hm.style.transform = 'translateY(' + (y * -.12) + 'px)'; hm.style.opacity = Math.max(0, 1 - y / (innerHeight * .7)); }
    if (bi) { var r = bi.parentNode.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { var p = (innerHeight - r.top) / (innerHeight + r.height); bi.style.transform = 'translateY(' + ((p - .5) * 90) + 'px)'; } }
    tick = false;
  }
  if (!reduce) addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(para); } }, { passive: true });
  para();

  /* ---------- Accordéons animés, un seul ouvert par groupe (référence) ---------- */
  $$('.acc').forEach(function (group) {
    var items = $$('.ac', group);
    function ouvrir(d) {
      var bd = $('.bd', d); d.open = true;
      bd.style.height = '0px'; bd.getBoundingClientRect();
      bd.style.height = bd.scrollHeight + 'px';
      bd.addEventListener('transitionend', function f(e) { if (e.propertyName !== 'height') return; bd.style.height = 'auto'; bd.removeEventListener('transitionend', f); });
    }
    function fermer(d) {
      var bd = $('.bd', d);
      bd.style.height = bd.scrollHeight + 'px'; bd.getBoundingClientRect();
      bd.style.height = '0px';
      bd.addEventListener('transitionend', function f(e) { if (e.propertyName !== 'height') return; d.open = false; bd.removeEventListener('transitionend', f); });
    }
    items.forEach(function (d) {
      var bd = $('.bd', d);
      if (d.open) { bd.style.height = 'auto'; bd.style.opacity = '1'; }
      $('summary', d).addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open) { fermer(d); return; }
        items.filter(function (x) { return x.open && x !== d; }).forEach(fermer);
        ouvrir(d);
      });
    });
  });

  /* ---------- Menu mobile (panneau sous l'en-tête) ---------- */
  var bg = $('[data-burger]'), nl = $('#NavLinks');
  if (bg && nl) {
    bg.addEventListener('click', function () {
      var open = nl.classList.toggle('is-open');
      bg.setAttribute('aria-expanded', String(open));
      hd.classList.toggle('menu-open', open);
    });
    $$('a,button', nl).forEach(function (a) { a.addEventListener('click', function () { nl.classList.remove('is-open'); bg.setAttribute('aria-expanded', 'false'); hd.classList.remove('menu-open'); }); });
  }

  /* ---------- « Au quotidien » : cartes dépliables sur mobile ---------- */
  $$('[data-fl-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.closest('.float').classList.toggle('is-open');
      b.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Galerie de la fiche : visionneuse plein écran ---------- */
  var lb = $('#Lightbox');
  if (lb && lb.showModal) {
    var lbItems = $$('[data-gal] [data-lb]'), lbI = 0;
    var lbImg = $('[data-lb-img]', lb), lbCap = $('[data-lb-cap]', lb), lbN = $('[data-lb-n]', lb);
    var pad = function (k) { return (k < 10 ? '0' : '') + k; };
    var lbShow = function (k) {
      lbI = (k + lbItems.length) % lbItems.length;
      var it = lbItems[lbI], th = it.querySelector('img'), pre = new Image();
      var done = function (src) { lbImg.src = src; lbImg.alt = it.dataset.cap || ''; lbImg.style.opacity = 1; };
      lbImg.style.opacity = 0;
      pre.onload = function () { done(pre.src); };
      pre.onerror = function () { if (th) done(th.currentSrc || th.src); };
      pre.src = it.dataset.full || (th && (th.currentSrc || th.src));
      lbCap.textContent = it.dataset.cap || '';
      lbN.textContent = pad(lbI + 1) + ' / ' + pad(lbItems.length);
    };
    var lbOpen = function (k) { lbShow(k); lb.showModal(); document.body.style.overflow = 'hidden'; };
    lbItems.forEach(function (it) { if (it.tagName === 'BUTTON') it.addEventListener('click', function () { lbOpen(+it.dataset.lb); }); });
    var all = $('[data-lb-all]'); if (all) all.addEventListener('click', function () { lbOpen(0); });
    $('[data-lb-prev]', lb).addEventListener('click', function () { lbShow(lbI - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { lbShow(lbI + 1); });
    $('[data-lb-close]', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('close', function () { document.body.style.overflow = ''; });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1));
    });
    if (lbItems.length < 2) $$('.zm-nav', lb).forEach(function (b) { b.hidden = true; });
  }

  /* ---------- Dialogues : « Parler à un concepteur », film ---------- */
  var dlg = $('#ContactDlg');
  document.addEventListener('click', function (e) {
    var op = e.target.closest('[data-dlg-open]');
    if (op && dlg && typeof dlg.showModal === 'function') {
      e.preventDefault();
      var trip = op.dataset.tripName, field = $('[data-dlg-trip]', dlg);
      if (trip && field && !field.value) field.value = trip;
      dlg.showModal();
      return;
    }
    var vo = e.target.closest('[data-video-open]');
    if (vo) { var v = document.getElementById(vo.dataset.videoOpen); if (v) { v.showModal(); var vid = $('video', v); if (vid) vid.play().catch(function () {}); } return; }
    var cl = e.target.closest('[data-dlg-close]');
    if (cl) { var d = cl.closest('dialog'); if (d) { var vv = $('video', d); if (vv) vv.pause(); d.close(); } }
  });
  $$('dialog').forEach(function (d) { d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); });
  if (dlg && /contact_posted=true|form_type=contact/.test(location.search + location.hash)) { try { dlg.showModal(); } catch (e) {} }

  /* ---------- Panier en tiroir (Section Rendering API) ---------- */
  var drawer = $('[data-drawer]');
  function openDrawer() { if (!drawer) return; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; setTimeout(function () { $('.pn', drawer).focus(); }, 60); }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  function renderDrawer(html) {
    if (!drawer || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = $('[data-drawer-inner]', doc), cur = $('[data-drawer-inner]', drawer);
    if (fresh && cur) { cur.replaceWith(fresh); $$('[data-cart-count]').forEach(function (el) { el.textContent = fresh.dataset.count; el.dataset.n = fresh.dataset.count; }); }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-open]') && drawer) { e.preventDefault(); openDrawer(); }
    if (e.target.closest('[data-drawer-close]')) closeDrawer();
    var rm = e.target.closest('[data-drawer] [data-line]');
    if (rm) {
      fetch(A.routes.cart_change + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ line: +rm.dataset.line, quantity: +rm.dataset.qty, sections: ['cart-drawer'], sections_url: location.pathname }) })
        .then(function (r) { return r.json(); }).then(function (d) { if (d.sections) renderDrawer(d.sections['cart-drawer']); }).catch(function () { location.href = A.routes.cart; });
    }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.action || form.action.indexOf('/cart/add') === -1 || !drawer) return;
    e.preventDefault();
    var btn = $('[data-atc]', form) || $('[type="submit"]', form), err = $('[data-form-error]', form);
    if (btn) btn.classList.add('is-loading');
    if (err) err.hidden = true;
    var body = new FormData(form);
    body.append('sections', 'cart-drawer');
    body.append('sections_url', location.pathname);
    fetch(A.routes.cart_add + '.js', { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: body })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || res.d.status) throw new Error(res.d.description || res.d.message || 'Ajout impossible');
        renderDrawer(res.d.sections && res.d.sections['cart-drawer']); openDrawer();
      })
      .catch(function (x) { if (err) { err.textContent = x.message; err.hidden = false; } })
      .then(function () { if (btn) btn.classList.remove('is-loading'); });
  });

  /* ---------- Réservation d'une date : Départ × Voyageurs ---------- */
  var trip = $('[data-trip]'), form = $('#ProductForm');
  var euro = function (n) { return Math.round(n).toLocaleString('fr-FR').replace(/ |\s/g, ' ') + ' €'; };
  if (trip && form && $('[data-variants]', form)) {
    var variants = JSON.parse($('[data-variants]', form).textContent);
    var base = +trip.dataset.price, factors = [1, .92, .88], mins = [2, 3, 5];
    var idInput = $('[data-variant-id]', form), atc = $('[data-atc]', form), atcLabel = $('[data-atc-label]', form);
    var selected = function (n) { var r = $('input[data-opt="' + n + '"]:checked', form); return r ? r.value : null; };
    var update = function () {
      var o1 = selected(1), o2 = selected(2);
      var v = variants.find(function (x) { return x.option1 === o1 && (o2 === null || x.option2 === o2); });
      $$('input[data-opt="1"]', form).forEach(function (r) {
        var any = variants.some(function (x) { return x.option1 === r.value && x.available; });
        r.disabled = !any;
      });
      var gi = 0, g = $('input[data-opt="2"]:checked', form); if (g) gi = +g.dataset.index;
      var pp = base * (factors[gi] || 1);
      $('[data-pp]', form).textContent = euro(pp);
      $('[data-tot]', form).textContent = '≈ ' + euro(pp * mins[gi]) + ' pour ' + mins[gi] + ' voyageurs, tout compris sur place';
      if (v) {
        idInput.value = v.id;
        $$('[data-atc-price]').forEach(function (el) { el.textContent = euro(v.price / 100); });
        atc.disabled = !v.available;
        atcLabel.textContent = v.available ? 'Bloquer ma date · acompte' : 'Date complète';
        var url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
      }
    };
    form.addEventListener('change', function (e) { if (e.target.matches('[data-opt]')) update(); });
    update();
  }

  /* ---------- Barre de réservation mobile : visible tant que la carte n'est pas à l'écran ---------- */
  var mbar = $('[data-mbar]'), book = $('.book');
  if (mbar && book && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: .15 }).observe(book);
  }

  /* ---------- Carte cadeau ---------- */
  if (form && $('[data-gc-toggle]', form)) {
    var tg = $('[data-gc-toggle]', form), fields = $('[data-gc-fields]', form);
    tg.addEventListener('change', function () {
      fields.hidden = !tg.checked;
      $$('input,textarea', fields).forEach(function (i) { i.disabled = !tg.checked; });
      var em = $('input[type="email"]', fields); if (em) em.required = tg.checked;
    });
    $$('input[name="gc-amount"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        $('[data-variant-id]', form).value = r.value;
        $$('[data-gc-amount],[data-atc-price]').forEach(function (el) { el.textContent = r.dataset.price; });
      });
    });
  }

  /* ---------- Avis : défilement au bouton, compteur ---------- */
  $$('[data-rv-track]').forEach(function (track) {
    var wrap = track.parentNode, prev = $('[data-rv-prev]', wrap), next = $('[data-rv-next]', wrap), count = $('[data-rv-count]', wrap);
    var cards = $$('.rc', track);
    var step = function () { return cards[0] ? cards[0].offsetWidth + 18 : 300; };
    var upd = function () {
      var i = Math.round(track.scrollLeft / step());
      if (count) count.textContent = String(Math.min(cards.length, i + 1)).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', upd); upd();
  });
})();
