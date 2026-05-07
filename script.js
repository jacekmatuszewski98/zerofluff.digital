/* ============================================
   ZERO FLUFF DIGITAL
   ============================================ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const isTouch = window.matchMedia('(pointer: coarse)').matches;

/* ============================================
   TEXT SCRAMBLE
   ============================================ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%*?&0123456789';
    this.update = this.update.bind(this);
  }
  setText(text) {
    const len = text.length;
    return new Promise(resolve => {
      this.queue = Array.from(text).map((char, i) => ({
        to: char,
        start: Math.floor(Math.random() * 12),
        end: Math.floor(Math.random() * 12) + 12,
        char: ''
      }));
      cancelAnimationFrame(this.frameReq);
      this.frame = 0;
      this.resolve = resolve;
      this.update();
    });
  }
  update() {
    let out = '';
    let done = 0;
    for (let i = 0; i < this.queue.length; i++) {
      const { to, start, end } = this.queue[i];
      let { char } = this.queue[i];
      if (this.frame >= end) {
        done++;
        out += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.3) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        out += `<span class="scramble-char" style="color:var(--red);opacity:.7">${char}</span>`;
      } else {
        out += to;
      }
    }
    this.el.innerHTML = out;
    if (done === this.queue.length) {
      this.resolve();
    } else {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

/* ============================================
   CURSOR
   ============================================ */
if (!isTouch) {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  /* quickTo: reuses a single tween per axis — no tween spam on mousemove */
  const curX = gsap.quickTo(cursor,   'x', { duration: 0,    ease: 'none' });
  const curY = gsap.quickTo(cursor,   'y', { duration: 0,    ease: 'none' });
  const folX = gsap.quickTo(follower, 'x', { duration: 0.06, ease: 'power2.out' });
  const folY = gsap.quickTo(follower, 'y', { duration: 0.06, ease: 'power2.out' });

  document.addEventListener('mousemove', e => {
    curX(e.clientX); curY(e.clientY);
    folX(e.clientX); folY(e.clientY);
  });

  const hoverEls = document.querySelectorAll('a, button, .how-step, .why-item, .trait, .versus-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('is-hovering'); follower.classList.add('is-hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hovering'); follower.classList.remove('is-hovering'); });
  });

  /* Cursor spotlight glow — intentionally slow for ambient feel */
  const glow = document.createElement('div');
  glow.id = 'cursorGlow';
  document.body.appendChild(glow);
  const glowX = gsap.quickTo(glow, 'x', { duration: 1.0, ease: 'power3.out' });
  const glowY = gsap.quickTo(glow, 'y', { duration: 1.0, ease: 'power3.out' });
  document.addEventListener('mousemove', e => { glowX(e.clientX); glowY(e.clientY); });

  /* Magnetic buttons */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: dx * 0.18, y: dy * 0.18, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ============================================
   NAV
   ============================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

const burger   = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  burger.classList.remove('open');
  document.body.style.overflow = '';
}));

/* ============================================
   HERO ENTRANCE + SCRAMBLE
   ============================================ */
/* Set initial hidden states via JS — not CSS — so crawlers see content at full opacity */
gsap.set('.hero-label',  { opacity: 0, y: 12 });
gsap.set('.hero-bottom', { opacity: 0, y: 20 });

const heroTl = gsap.timeline({ delay: 0.1 });

heroTl
  .to('.hero-label', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  .fromTo('.hero-headline .word-reveal',
    { yPercent: 115, rotateX: -8, opacity: 0 },
    { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power4.out' },
    '-=0.3'
  )
  .to('.hero-bottom', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

const heroEl = document.querySelector('.hero');

/* Hero ring — CSS animation handles spin, GSAP just fades it in */
gsap.to('.hero-ring', { opacity: 1, duration: 2, ease: 'power2.out', delay: 0.6 });

/* ============================================
   HERO HIGHLIGHT — glitch on hover + random timer
   ============================================ */
const heroHighlight = document.querySelector('.hero-highlight');
if (heroHighlight) {
  const fireGlitch = () => {
    if (heroHighlight.classList.contains('is-glitching')) return;
    heroHighlight.classList.add('is-glitching');
    heroHighlight.addEventListener('animationend', () => {
      heroHighlight.classList.remove('is-glitching');
    }, { once: true });
  };

  /* Hover trigger */
  heroHighlight.addEventListener('mouseenter', fireGlitch);

  /* Random ambient trigger: every 9 – 16 s */
  const scheduleRandom = () => {
    setTimeout(() => { fireGlitch(); scheduleRandom(); }, 9000 + Math.random() * 7000);
  };
  scheduleRandom();
}

/* ============================================
   GHOST TEXT — cursor-reactive parallax
   ============================================ */
const ghostEls = gsap.utils.toArray('.ghost-text');
const ghostTweens = ghostEls.map(el => ({
  x: gsap.quickTo(el, 'x', { duration: 1.8, ease: 'power2.out' }),
  y: gsap.quickTo(el, 'y', { duration: 1.8, ease: 'power2.out' }),
  factor: parseFloat(el.dataset.parallax || '14')
}));

window.addEventListener('mousemove', (e) => {
  const cx = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 to 1
  const cy = (e.clientY / window.innerHeight - 0.5) * 2;
  ghostTweens.forEach(({ x, y, factor }) => {
    x(cx * factor);
    y(cy * factor);
  });
});

/* ============================================
   COUNT UP
   ============================================ */
function countUp(selector) {
  ScrollTrigger.create({
    trigger: selector,
    start: 'top 85%',
    once: true,
    onEnter() {
      document.querySelectorAll(selector + ' [data-target]').forEach(el => {
        gsap.fromTo(el,
          { innerText: 0 },
          {
            innerText: +el.dataset.target,
            duration: 2, ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate() { el.innerText = Math.round(+el.innerText); }
          }
        );
      });
    }
  });
}
/* (verdict section removed) */

/* ============================================
   SCROLL REVEALS
   ============================================ */
function reveal(targets, opts = {}) {
  const els = typeof targets === 'string' ? gsap.utils.toArray(targets) : targets;
  if (!els.length) return;
  els.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: opts.y ?? 28 },
      {
        opacity: 1, y: 0,
        duration: opts.duration ?? 0.75,
        delay: (opts.stagger ?? 0) * i,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: opts.trigger ?? el,
          start: opts.start ?? 'top 88%',
          once: true
        }
      }
    );
  });
}

/* Section label char-split reveals */
document.querySelectorAll('.section-label').forEach(el => {
  const raw = el.textContent;
  el.innerHTML = [...raw].map(ch =>
    ch === ' ' ? '<span style="display:inline-block;width:.3em"> </span>'
               : `<span class="char" style="display:inline-block">${ch}</span>`
  ).join('');
  gsap.fromTo(el.querySelectorAll('.char'),
    { opacity: 0, y: 10, rotateX: -40, transformPerspective: 400 },
    {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.35, stagger: 0.025, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    }
  );
});

reveal('.truth-section .section-headline');
reveal('.versus-grid');
reveal('.truth-cta-row');
reveal('.how-step', { trigger: '.how-steps', stagger: 0.1, y: 20 });
reveal('.manifesto-line', { trigger: '.manifesto-strip', stagger: 0.1, y: 16 });
reveal('.manifesto-inner .btn', { trigger: '.manifesto-strip', y: 12 });
reveal('.operator-left > *', { stagger: 0.08 });
reveal('.trait', { trigger: '.operator-traits', stagger: 0.07, y: 12 });
reveal('.why-section .section-label, .why-section .section-headline');
reveal('.why-item', { trigger: '.why-grid', stagger: 0.07, y: 16 });
reveal('.cta-inner > *', { stagger: 0.09 });

/* Versus item stagger reveal */
gsap.utils.toArray('.versus-item').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 10 },
    {
      opacity: 1, y: 0,
      duration: 0.45, delay: i * 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '.versus-grid', start: 'top 82%', once: true }
    }
  );
});

/* (operator ghost parallax replaced by float above) */

/* ============================================
   WHY-ITEM HOVER ANIMATIONS
   ============================================ */
document.querySelectorAll('.why-item').forEach(item => {

  /* Budget reallocation (item 02) */
  const alloc = item.querySelector('.wv-alloc-animated');
  if (alloc) {
    const fills = alloc.querySelectorAll('.wv-alloc-fill');
    const pcts  = alloc.querySelectorAll('.wv-alloc-pct');

    const animateAlloc = (toKey, dur, ease) => {
      fills.forEach((fill, i) => {
        gsap.killTweensOf(fill);
        const target = +fill.dataset[toKey];
        const current = parseFloat(fill.style.width) || +fill.dataset.from;
        const obj = { v: current };
        gsap.to(fill, { width: target + '%', duration: dur, ease, delay: i * 0.05 });
        gsap.to(obj,  { v: target, duration: dur, ease, delay: i * 0.05,
          onUpdate() { pcts[i].textContent = Math.round(obj.v) + '%'; }
        });
      });
    };

    item.addEventListener('mouseenter', () => animateAlloc('to',   0.65, 'power2.inOut'));
    item.addEventListener('mouseleave', () => animateAlloc('from', 0.35, 'power2.out'));
  }

});

/* ============================================
   3D CARD TILT (why-items)
   ============================================ */
document.querySelectorAll('.why-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 14;
    gsap.to(card, {
      rotateY: x, rotateX: -y,
      transformPerspective: 700,
      duration: 0.35, ease: 'power2.out',
      transformOrigin: 'center center'
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.35)' });
  });
});

/* ============================================
   CREATIVE CARD — bars animate to winner on hover
   ============================================ */
const creativeCard = document.querySelector('.why-creative');
if (creativeCard) {
  const bars    = creativeCard.querySelectorAll('.wv-bar');
  // [A, B, C-winner, D]
  const neutral = [30, 30, 30, 30];
  const final   = [30, 50, 95, 35];

  /* Set neutral on load so the "reveal" animates in on first hover */
  bars.forEach((bar, i) => { bar.style.height = neutral[i] + '%'; });

  creativeCard.addEventListener('mouseenter', () => {
    bars.forEach((bar, i) => {
      gsap.to(bar, {
        height: final[i] + '%',
        duration: 0.38 + i * 0.04,
        ease: i === 2 ? 'elastic.out(1, 0.55)' : 'power2.out',
        delay: i * 0.05
      });
    });
  });
  creativeCard.addEventListener('mouseleave', () => {
    bars.forEach((bar, i) => {
      gsap.to(bar, { height: neutral[i] + '%', duration: 0.28, ease: 'power2.inOut', delay: i * 0.03 });
    });
  });
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
const progressEl = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  gsap.to(progressEl, { scaleX: pct, duration: 0.1, ease: 'none', transformOrigin: 'left' });
}, { passive: true });

/* ============================================
   HERO AMBIENT PARTICLES
   ============================================ */
if (heroEl && !isTouch) {
  const particleColors = [
    'rgba(232,49,42,0.18)', 'rgba(232,49,42,0.08)',
    'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.04)'
  ];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 2.5 + 1;
    p.style.cssText = [
      'position:absolute',
      `width:${size}px`, `height:${size}px`,
      `background:${particleColors[Math.floor(Math.random() * particleColors.length)]}`,
      'border-radius:50%',
      `left:${10 + Math.random() * 80}%`,
      `top:${10 + Math.random() * 80}%`,
      'pointer-events:none', 'z-index:1'
    ].join(';');
    heroEl.appendChild(p);
    gsap.to(p, {
      x: (Math.random() - 0.5) * 140,
      y: (Math.random() - 0.5) * 100,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 8 + 5,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
      delay: Math.random() * 5
    });
  }
}

/* ============================================
   SMOOTH ANCHOR SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: t, offsetY: 70 }, duration: 0.55, ease: 'power2.inOut' });
  });
});
