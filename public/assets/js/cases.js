/* =========================================================
   آرایه — cases.js
   Case studies page (/results) interactions:
   - animated counters
   - tilt cards on hover
   - scroll-driven case bars
   - impact calculator
   No external dependencies.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Animated counters ---------- */
  function formatFa(n) {
    return String(n.toFixed(1).replace(/\.0$/, "")).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  }

  const counters = $$('.counter[data-target]');
  if (counters.length && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || "";
          const duration = 1600;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = formatFa(val) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = formatFa(parseFloat(c.dataset.target)) + (c.dataset.suffix || "");
    });
  }

  /* ---------- Tilt cards ---------- */
  const tiltCards = $$('.case-client-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 12;
      const rotateY = (x - 0.5) * 12;
      card.style.setProperty('--rotateX', rotateX + 'deg');
      card.style.setProperty('--rotateY', rotateY + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotateX', '0deg');
      card.style.setProperty('--rotateY', '0deg');
    });
  });

  /* ---------- Scroll-driven case bars ---------- */
  const bars = $$('.case-bar');
  if (bars.length && !reduceMotion) {
    bars.forEach((bar) => {
      const inner = bar.querySelector('span');
      if (inner && inner.style.width) {
        bar.style.setProperty('--w', inner.style.width);
        inner.style.width = '0';
      }
    });
    const barIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            barIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    bars.forEach((b) => barIo.observe(b));
  } else {
    bars.forEach((bar) => {
      const inner = bar.querySelector('span');
      if (inner) inner.style.width = inner.style.width || '50%';
    });
  }

  /* ---------- Impact calculator ---------- */
  const range = $('#impactRange');
  const val = $('#impactVal');
  const lost = $('#impactLost');
  const saved = $('#impactSaved');
  if (range && val && lost && saved) {
    const AVERAGE_VALUE = 400000; // 400k Toman per booking/order
    const RECOVERY_RATE = 0.7;

    function toFaCurrency(n) {
      if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, "") + " میلیارد تومان";
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + " میلیون تومان";
      return n.toLocaleString('fa-IR') + " تومان";
    }

    function update() {
      const count = parseInt(range.value, 10);
      const lostVal = count * AVERAGE_VALUE;
      const savedVal = Math.round(lostVal * RECOVERY_RATE);
      val.textContent = count.toLocaleString('fa-IR');
      lost.textContent = toFaCurrency(lostVal);
      saved.textContent = toFaCurrency(savedVal);
    }
    range.addEventListener('input', update);
    update();
  }
})();
