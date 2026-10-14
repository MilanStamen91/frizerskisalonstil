/* =========================================================
   Frizerski salon STIL — vanilla JavaScript
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Radno vreme (0 = nedelja … 6 = subota) ---------- */
  var HOURS = {
    0: null,
    1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19],
    6: [9, 16]
  };
  var DAY_NAMES = ['nedelju', 'ponedeljak', 'utorak', 'sredu', 'četvrtak', 'petak', 'subotu'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // Trenutno vreme u Nišu, bez obzira na vremensku zonu posetioca
  function nowInBelgrade() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Belgrade',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[map.weekday], hour: parseInt(map.hour, 10), minute: parseInt(map.minute, 10) };
  }

  function nextOpening(day, hour) {
    for (var i = 0; i < 8; i++) {
      var d = (day + i) % 7;
      var h = HOURS[d];
      if (!h) continue;
      if (i === 0 && hour >= h[0]) continue;
      var when = i === 0 ? 'danas' : (i === 1 ? 'sutra' : 'u ' + DAY_NAMES[d]);
      return when + ' u ' + pad(h[0]) + ' h';
    }
    return '';
  }

  function updateOpenStatus() {
    var now = nowInBelgrade();
    var today = HOURS[now.day];
    var t = now.hour + now.minute / 60;
    var isOpen = !!today && t >= today[0] && t < today[1];

    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.classList.toggle('is-open', isOpen);
      el.classList.toggle('is-closed', !isOpen);
      el.textContent = isOpen
        ? 'Sada otvoreno · do ' + pad(today[1]) + ' h'
        : 'Sada zatvoreno · otvaramo ' + nextOpening(now.day, now.hour);
    });

    // Istakni današnji dan u tabeli radnog vremena
    document.querySelectorAll('[data-hours] [data-day]').forEach(function (el) {
      var spec = el.getAttribute('data-day');
      var match = spec.indexOf('-') > -1
        ? (function (r) { return now.day >= +r[0] && now.day <= +r[1]; })(spec.split('-'))
        : +spec === now.day;
      el.classList.toggle('is-today', match);
    });
  }

  /* ---------- Mobilni meni ---------- */
  function initMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) return;
    var label = toggle.querySelector('[data-nav-toggle-label]');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Zatvori' : 'Meni';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  /* ---------- Header senka + dugme „na vrh“ ---------- */
  function initScrollUi() {
    var header = document.querySelector('[data-header]');
    var toTop = document.querySelector('[data-to-top]');
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 900);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---------- Aktivna stavka menija prema sekciji ---------- */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__link[href^="#"], .pill[href^="#"]')
    );
    if (!links.length) return;

    var byId = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      (byId[id] = byId[id] || []).push(link);
    });

    var sections = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        (byId[entry.target.id] || []).forEach(function (l) { l.classList.add('is-active'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Pojavljivanje elemenata pri skrolu ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Godina u podnožju ---------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initScrollUi();
    initScrollSpy();
    initReveal();
    initYear();
    updateOpenStatus();
    setInterval(updateOpenStatus, 60 * 1000);
  });
})();
