/* ==========================================================================
   SANSMODÉ · theme.js
   Vanilla, ~0 dépendance, chargé en defer. Tout fonctionne sans JS (formulaires natifs),
   le JS ajoute : panier en tiroir (Section Rendering API), sélection d'offre, barre collante,
   dates de livraison, lightbox, onglets, galerie.
   ========================================================================== */
(() => {
  const S = window.Sansmode || {};
  const calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- En-tête : ombre au scroll ---------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile : fermer au clic sur un lien ---------- */
  $$('[data-mnav] a').forEach((a) => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));

  /* ---------- Tiroir panier ---------- */
  const drawer = $('[data-cart-drawer]');
  let lastFocus = null;

  const openDrawer = () => {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.drawer__panel', drawer).focus(), 50);
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  const updateCount = (count) => {
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('is-empty', Number(count) === 0);
      el.classList.remove('is-bump');
      void el.offsetWidth;
      el.classList.add('is-bump');
    });
    $$('[data-cart-open]').forEach((el) => el.setAttribute('aria-label', `Panier, ${count} article(s)`));
  };

  const renderDrawer = (html) => {
    if (!drawer || !html) return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fresh = $('[data-cart-inner]', doc);
    const current = $('[data-cart-inner]', drawer);
    if (fresh && current) {
      current.replaceWith(fresh);
      updateCount(fresh.dataset.count || 0);
    }
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-cart-open]');
    if (opener && drawer) {
      e.preventDefault();
      openDrawer();
      return;
    }
    if (e.target.closest('[data-cart-close]')) closeDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* Modifier une quantité depuis le tiroir */
  if (drawer) {
    drawer.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-line]');
      if (!btn) return;
      const inner = $('[data-cart-inner]', drawer);
      inner.classList.add('is-busy');
      try {
        const res = await fetch(`${S.routes.cart_change}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ line: Number(btn.dataset.line), quantity: Number(btn.dataset.qty), sections: ['cart-drawer'], sections_url: window.location.pathname })
        });
        const data = await res.json();
        if (data.sections) renderDrawer(data.sections['cart-drawer']);
      } catch (err) {
        window.location.href = S.routes.cart;
      } finally {
        const fresh = $('[data-cart-inner]', drawer);
        if (fresh) fresh.classList.remove('is-busy');
      }
    });
  }

  /* Ajout au panier en AJAX pour TOUS les formulaires produit (grille, fiche, offres, upsell) */
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.matches || !form.action || !form.action.includes('/cart/add') || !drawer) return;
    e.preventDefault();

    const submitter = e.submitter || $('[type="submit"]', form) || $(`[form="${form.id}"]`);
    const buttons = [$('[type="submit"]', form), ...(form.id ? $$(`[form="${form.id}"]`) : [])].filter(Boolean);
    buttons.forEach((b) => { b.classList.add('is-loading'); b.setAttribute('aria-busy', 'true'); });
    const errorEl = $('[data-form-error]', form);
    if (errorEl) errorEl.hidden = true;

    const body = new FormData(form);
    body.append('sections', 'cart-drawer');
    body.append('sections_url', window.location.pathname);

    try {
      const res = await fetch(`${S.routes.cart_add}.js`, { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || 'Ajout impossible');
      renderDrawer(data.sections && data.sections['cart-drawer']);
      buttons.forEach((b) => b.classList.add('is-added'));
      setTimeout(() => buttons.forEach((b) => b.classList.remove('is-added')), 1600);
      openDrawer();
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message; errorEl.hidden = false; } else { alertFallback(err.message); }
    } finally {
      buttons.forEach((b) => { b.classList.remove('is-loading'); b.removeAttribute('aria-busy'); });
      if (submitter && submitter.blur) submitter.blur();
    }
  });
  function alertFallback(msg) {
    const live = document.createElement('p');
    live.setAttribute('role', 'status');
    live.className = 'visually-hidden';
    live.textContent = msg;
    document.body.appendChild(live);
    setTimeout(() => live.remove(), 4000);
  }

  /* ---------- Fiche produit : choix de l'offre ---------- */
  const form = $('#ProductForm');
  if (form) {
    const idInput = $('[data-variant-input]', form);
    const subNote = $('[data-sub-note]', form);
    const stickyVariant = $('[data-sticky-variant]');
    $$('input[name="sm-variant"]', form).forEach((radio) => {
      radio.addEventListener('change', () => {
        idInput.value = radio.value;
        $$('[data-atc-price]').forEach((el) => { el.innerHTML = radio.dataset.price; });
        if (subNote) subNote.hidden = radio.dataset.sub !== 'true';
        if (stickyVariant) stickyVariant.textContent = radio.closest('.opt').querySelector('.opt__name').textContent;
        const url = new URL(window.location.href);
        url.searchParams.set('variant', radio.value);
        window.history.replaceState({}, '', url);
      });
    });
  }

  /* ---------- Barre d'ajout collante (mobile) ---------- */
  const mainAtc = $('[data-main-atc]');
  const sticky = $('[data-sticky-atc]');
  if (mainAtc && sticky && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $('button', sticky).tabIndex = show ? 0 : -1;
    }).observe(mainAtc);
  }

  /* ---------- Galerie : points synchronisés au swipe ---------- */
  $$('[data-gallery]').forEach((gallery) => {
    const track = $('[data-gallery-track]', gallery);
    const dots = $$('[data-gallery-dot]', gallery);
    if (!track || !dots.length) return;
    const slides = $$('.gallery__slide', track);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const i = slides.indexOf(en.target);
          dots.forEach((d, j) => d.setAttribute('aria-current', String(i === j)));
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach((s) => obs.observe(s));
    dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
      e.preventDefault();
      track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    }));
  });


  /* ---------- Carrousels mobiles (avis) : flèches + points générés, masqués sur ordinateur ---------- */
  const arrow = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  $$('[data-mcarousel]').forEach((track) => {
    const items = Array.from(track.children);
    if (items.length < 2) return;
    const nav = document.createElement('div');
    nav.className = 'm-nav';
    nav.innerHTML = `<button type="button" class="m-btn" data-dir="-1" aria-label="Précédent">${arrow('M19 12H6M11 6l-6 6 6 6')}</button><div class="m-dots" aria-hidden="true">${items.map(() => '<i></i>').join('')}</div><button type="button" class="m-btn" data-dir="1" aria-label="Suivant">${arrow('M5 12h13M13 6l6 6-6 6')}</button>`;
    track.after(nav);
    const dots = $$('i', nav);
    const btns = $$('.m-btn', nav);
    const step = () => items[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
    const idx = () => Math.round(track.scrollLeft / step());
    const update = () => {
      const i = Math.min(items.length - 1, idx());
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      btns[0].disabled = track.scrollLeft <= 4;
      btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const i = Math.max(0, Math.min(items.length - 1, idx() + Number(b.dataset.dir)));
      track.scrollTo({ left: i * step(), behavior: 'smooth' });
    }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Onglets « J'ai 2 minutes / J'ai le temps » ---------- */
  $$('[data-tabs]').forEach((tabs) => {
    const list = $$('[role="tab"]', tabs);
    const select = (tab) => {
      list.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
      });
      tab.focus();
    };
    list.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length]);
        }
      });
    });
  });

  /* ---------- Date de livraison estimée (jours ouvrés, heure limite d'expédition) ---------- */
  const delivery = $('[data-delivery]');
  if (delivery) {
    const text = $('[data-delivery-text]', delivery);
    const cutoff = Number(S.cutoffHour || 14);
    const isOpen = (d) => d.getDay() !== 0 && d.getDay() !== 6;
    const addBusinessDays = (date, n) => {
      const d = new Date(date);
      while (n > 0) { d.setDate(d.getDate() + 1); if (isOpen(d)) n -= 1; }
      return d;
    };
    const fmt = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\.$/, '');
    const render = () => {
      const now = new Date();
      let ship = new Date(now);
      const shipsToday = isOpen(now) && now.getHours() < cutoff;
      if (!shipsToday) { ship = addBusinessDays(now, 1); }
      const [hMin, hMax] = (delivery.dataset.home || '2,3').split(',').map(Number);
      const from = addBusinessDays(ship, hMin);
      const to = addBusinessDays(ship, hMax);
      let lead;
      if (shipsToday) {
        const left = new Date(now); left.setHours(cutoff, 0, 0, 0);
        const mins = Math.max(0, Math.round((left - now) / 60000));
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        lead = `Commande dans les <strong>${h ? `${h} h ` : ''}${String(m).padStart(h ? 2 : 1, '0')} min</strong>, expédié aujourd’hui.`;
      } else {
        lead = `Expédié ${fmt(ship)} depuis Montélimar.`;
      }
      text.innerHTML = `${lead} Reçu entre le <strong>${fmt(from)}</strong> et le <strong>${fmt(to)}</strong>.`;
    };
    render();
    setInterval(render, 60000);
  }

  /* ---------- Lightbox (vidéos d'avis, visite de l'atelier) ---------- */
  const lightbox = $('#Lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const content = $('[data-lightbox-content]', lightbox);
    let opener = null;
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox]');
      if (!trigger) return;
      const tpl = document.getElementById(trigger.dataset.lightbox);
      if (!tpl) return;
      e.preventDefault();
      opener = trigger;
      content.replaceChildren(tpl.content.cloneNode(true));
      $$('img', content).forEach((img) => img.setAttribute('loading', 'eager'));
      lightbox.showModal();
      const video = $('video', content);
      if (video) video.play().catch(() => {});
    });
    const close = () => lightbox.close();
    $('[data-lightbox-close]', lightbox).addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    lightbox.addEventListener('close', () => { content.replaceChildren(); if (opener) opener.focus(); });
  }


  /* ---------- Roue cadeau (ouverte au clic uniquement, un seul tour par visiteur) ---------- */
  const gw = $('[data-gift-wheel]');
  if (gw) {
    const dialog = $('[data-gw-dialog]', gw);
    const disc = $('[data-gw-disc]', gw);
    const form = $('form', gw);
    const tip = $('[data-gw-tip]', gw);
    const key = gw.dataset.key;
    const store = {
      get() { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
      set(v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
    };
    const segs = $$('[data-gw-seg]', gw).map((el) => ({ mid: Number(el.dataset.mid), weight: Number(el.dataset.weight), code: el.dataset.code, prize: el.dataset.prize }));
    const showResult = (win) => {
      $('[data-gw-step="form"]', gw).hidden = true;
      $('[data-gw-step="result"]', gw).hidden = false;
      $('[data-gw-prize]', gw).textContent = win.prize;
      $('[data-gw-code]', gw).textContent = win.code;
      $('[data-gw-apply]', gw).href = `/discount/${encodeURIComponent(win.code)}?redirect=${encodeURIComponent(S.routes.all_products_collection || '/collections/all')}`;
      gw.classList.add('is-done');
    };
    const saved = store.get();
    if (saved && saved.code) { showResult(saved); disc.style.transition = 'none'; disc.style.transform = `rotate(${saved.rot}deg)`; }

    const open = () => { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); if (tip) tip.classList.remove('is-on'); };
    $('[data-gw-open]', gw).addEventListener('click', open);
    $$('[data-gw-close]', gw).forEach((b) => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

    if (tip && !saved) {
      setTimeout(() => tip.classList.add('is-on'), 4000);
      setTimeout(() => tip.classList.remove('is-on'), 11000);
    }

    const pick = () => {
      const winners = segs.filter((sg) => sg.weight > 0 && sg.code);
      let r = Math.random() * winners.reduce((t, sg) => t + sg.weight, 0);
      return winners.find((sg) => (r -= sg.weight) < 0) || winners[0];
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('[data-gw-email]', gw);
      const err = $('[data-gw-error]', gw);
      if (!email.checkValidity() || !email.value) { err.hidden = false; email.focus(); return; }
      err.hidden = true;
      const win = pick();
      if (!win) return;
      const step = 360 / segs.length;
      const jitter = (Math.random() - 0.5) * step * 0.55;
      const rot = 360 * 6 + (90 - win.mid) + jitter;
      const btn = $('[data-gw-spin]', gw);
      btn.disabled = true;
      gw.classList.add('is-spinning');
      disc.style.transform = `rotate(${rot}deg)`;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'text/html' } }).catch(() => {});
      const done = () => {
        gw.classList.remove('is-spinning');
        store.set({ code: win.code, prize: win.prize, rot: rot % 360 });
        setTimeout(() => showResult(win), 350);
      };
      if (calmMotion) done(); else disc.addEventListener('transitionend', done, { once: true });
    });

    $('[data-gw-copy]', gw).addEventListener('click', async () => {
      const label = $('[data-gw-copy-label]', gw);
      try { await navigator.clipboard.writeText($('[data-gw-code]', gw).textContent); label.textContent = 'Copié !'; } catch (e) { label.textContent = 'Sélectionne le code'; }
      setTimeout(() => { label.textContent = 'Copier'; }, 1800);
    });
  }

  /* ---------- Animations à l'entrée des sections (désactivées si l'utilisateur réduit les animations) ---------- */
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !calm) {
    const once = (els, cb, opts) => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { cb(en.target); obs.unobserve(en.target); } });
      }, opts || { rootMargin: '0px 0px -10% 0px' });
      els.forEach((el) => obs.observe(el));
    };

    /* Titres : chaque mot monte, en léger décalé */
    const splitWords = (el) => {
      let i = 0;
      const walk = (node) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            const parts = child.textContent.split(/([ \t\n\r]+)/); /* espaces insécables conservés : « 15 % » ne se coupe jamais */
            const frag = document.createDocumentFragment();
            parts.forEach((part) => {
              if (!part) return;
              if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span');
              w.className = 'w';
              const inner = document.createElement('span');
              inner.style.setProperty('--i', i++);
              inner.textContent = part;
              w.appendChild(inner);
              frag.appendChild(w);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1 && !child.classList.contains('logo')) {
            walk(child);
          }
        });
      };
      el.setAttribute('aria-label', el.textContent.trim().replace(/[ \t\n\r]+/g, ' '));
      walk(el);
      el.classList.add('split');
    };
    const titles = $$('.h2, .hero__title, .pdp__title, .offer__title, .duo__title').filter((el) => !el.querySelector('.logo'));
    titles.forEach(splitWords);
    once(titles, (el) => el.classList.add('is-in'), { rootMargin: '0px 0px -6% 0px' });

    const kickers = $$('.kicker');
    kickers.forEach((k) => k.classList.add('fx'));
    once(kickers, (el) => el.classList.add('is-in'));

    /* Chiffres qui comptent (80 %, 6 g, 5…) */
    once($$('[data-count]'), (el) => {
      const m = el.textContent.match(/^(\D*)(\d+)(.*)$/);
      if (!m) return;
      const [, pre, num, post] = m;
      const end = Number(num);
      const t0 = performance.now();
      const dur = 1200;
      el.textContent = `${pre}0${post}`;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = `${pre}${Math.round(end * (1 - Math.pow(1 - p, 3)))}${post}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });

    /* Comparatif : la colonne SANSMODÉ se lève, les coches apparaissent ligne par ligne */
    once($$('[data-cmp]'), (el) => el.classList.add('is-in'), { threshold: 0.3 });

    /* Blocs sous la ligne de flottaison : apparition douce */
    const blocks = $$('.card, .benefit, .vr, .offer, .review, .duo__tile').filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    blocks.forEach((el) => el.classList.add('reveal'));
    once(blocks, (el) => el.classList.add('is-in'), { rootMargin: '0px 0px -8% 0px' });
  } else {
    $$('[data-cmp]').forEach((el) => el.classList.add('is-in'));
  }
})();
