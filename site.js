/* ═══════════════════════════════════════════════════════════════
   Brayden portfolio — time-warp universe scroll + game reveals
   ═══════════════════════════════════════════════════════════════ */

/* ─── UNIVERSE PALETTES ─── */
const UNIVERSES = [
  { // 0 — Dawn (hero) — warm off-white
    name: 'Dawn',
    bg: [251, 251, 253], bg2: [244, 242, 246],
    text: [29, 29, 31], textDim: [110, 110, 115],
    accent: [245, 158, 86],          // warm amber
    hairline: 'rgba(0,0,0,0.08)', grain: 0.02,
    streakHue: 28, streakSat: 80, streakAlpha: 0.35,
    glow: 'rgba(245,158,86,0.22)'
  },
  { // 1 — Dusk Valley (about) — mauve fog
    name: 'Dusk',
    bg: [234, 230, 240], bg2: [222, 216, 232],
    text: [40, 34, 54], textDim: [108, 100, 130],
    accent: [130, 102, 210],
    hairline: 'rgba(40,34,54,0.12)', grain: 0.03,
    streakHue: 260, streakSat: 55, streakAlpha: 0.4,
    glow: 'rgba(130,102,210,0.28)'
  },
  { // 2 — Deep Space (VB) — xeno green on black
    name: 'Void',
    bg: [5, 10, 8], bg2: [2, 6, 4],
    text: [230, 255, 239], textDim: [150, 180, 165],
    accent: [0, 255, 136],
    hairline: 'rgba(0,255,136,0.14)', grain: 0.04,
    streakHue: 150, streakSat: 95, streakAlpha: 0.55,
    glow: 'rgba(0,255,136,0.4)'
  },
  { // 3 — Blood Arena (Sword Rush) — crimson steel
    name: 'Arena',
    bg: [18, 6, 8], bg2: [28, 10, 12],
    text: [255, 232, 222], textDim: [200, 150, 145],
    accent: [255, 70, 58],
    hairline: 'rgba(255,70,58,0.18)', grain: 0.045,
    streakHue: 8, streakSat: 88, streakAlpha: 0.55,
    glow: 'rgba(255,70,58,0.42)'
  },
  { // 4 — Violet Spire (PMU) — deep indigo-violet
    name: 'Spire',
    bg: [19, 10, 31], bg2: [10, 4, 22],
    text: [241, 229, 255], textDim: [170, 150, 200],
    accent: [185, 123, 255],
    hairline: 'rgba(185,123,255,0.18)', grain: 0.035,
    streakHue: 280, streakSat: 80, streakAlpha: 0.5,
    glow: 'rgba(185,123,255,0.4)'
  },
  { // 5 — Cosmic Sunset (contact) — warm black with amber
    name: 'Sunset',
    bg: [18, 10, 14], bg2: [28, 16, 22],
    text: [255, 237, 220], textDim: [200, 170, 155],
    accent: [255, 160, 90],
    hairline: 'rgba(255,160,90,0.18)', grain: 0.03,
    streakHue: 20, streakSat: 85, streakAlpha: 0.5,
    glow: 'rgba(255,160,90,0.4)'
  }
];

/* ─── TWEAK STATE ─── */
const TWEAKS = Object.assign({
  intensity: 'medium',
  warpStreaks: true,
  universeBleed: true,
  scrollSnap: false
}, (window.TWEAK_DEFAULTS || {}));

function applyTweaksToHtml() {
  const h = document.documentElement;
  h.dataset.intensity = TWEAKS.intensity;
  h.dataset.warp = TWEAKS.warpStreaks ? 'on' : 'off';
  h.classList.toggle('snap-on', !!TWEAKS.scrollSnap);
}
applyTweaksToHtml();

/* ─── HERO TITLE SPLIT ─── */
(function splitHero() {
  const el = document.getElementById('hero-title');
  if (!el) return;
  const words = [
    { t: 'Hi,', br: false },
    { t: "I'm", br: false },
    { t: 'Brayden.', br: true, highlight: true },
    { t: "I'm", br: false },
    { t: 'building', br: false },
    { t: 'the', br: false },
    { t: 'games', br: false },
    { t: 'I', br: false },
    { t: 'wish', br: false },
    { t: 'existed.', br: false }
  ];
  let html = '';
  let i = 0;
  words.forEach((w, idx) => {
    html += `<span class="word${w.highlight ? ' highlight' : ''}" style="--w-i:${i};">${w.t}</span>${w.br ? '<br>' : ' '}`;
    i++;
  });
  el.innerHTML = html;
})();

/* ─── CONTACT TITLE SPLIT ─── */
(function splitContact() {
  const el = document.getElementById('contact-title');
  if (!el) return;
  const text = "Let's talk.";
  let html = '';
  let i = 0;
  for (const ch of text) {
    if (ch === ' ') html += `<span class="letter space" aria-hidden="true">&nbsp;</span>`;
    else html += `<span class="letter" style="--l-i:${i};">${ch}</span>`;
    i++;
  }
  el.innerHTML = html;
})();

/* ─── NAV HIDE-ON-SCROLL ─── */
const nav = document.getElementById('nav');
let lastScroll = 0;
function updateNav() {
  const y = window.scrollY;
  if (y > 80 && y > lastScroll) nav.classList.add('hidden');
  else nav.classList.remove('hidden');
  lastScroll = y;
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ─── UNIVERSE INTERPOLATION ───
   For every paint, find which two universes we're between
   based on the position of each [data-universe] section, then
   lerp their palettes and write CSS vars. */
const universeSections = Array.from(document.querySelectorAll('[data-universe]'));
const root = document.documentElement;

function lerpRGB(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}
function rgbStr(arr) { return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`; }
function rgbaStr(arr, a) { return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${a})`; }

function getSectionCenters() {
  return universeSections.map(s => {
    const rect = s.getBoundingClientRect();
    const center = rect.top + rect.height / 2 + window.scrollY;
    return {
      el: s,
      idx: parseInt(s.dataset.universe, 10),
      top: rect.top + window.scrollY,
      center: center,
      height: rect.height
    };
  });
}

let centersCache = getSectionCenters();
window.addEventListener('resize', () => { centersCache = getSectionCenters(); });

function findBlendT() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  // find the two universes whose centers bracket the viewport center
  const sorted = centersCache.slice().sort((a, b) => a.center - b.center);
  let lo = sorted[0], hi = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].center <= viewportCenter) lo = sorted[i];
    if (sorted[i].center >= viewportCenter) { hi = sorted[i]; break; }
  }
  if (lo === hi) return { a: lo.idx, b: hi.idx, t: 0 };
  const span = hi.center - lo.center;
  const t = span > 0 ? Math.max(0, Math.min(1, (viewportCenter - lo.center) / span)) : 0;
  return { a: lo.idx, b: hi.idx, t };
}

// ease for color blending — snappier transitions
function smooth(t) { return t * t * (3 - 2 * t); }

function updateUniverse() {
  const { a, b, t } = findBlendT();
  // If bleed disabled, snap to nearest
  const blend = TWEAKS.universeBleed ? smooth(t) : (t > 0.5 ? 1 : 0);
  const A = UNIVERSES[a], B = UNIVERSES[b];
  const bg = lerpRGB(A.bg, B.bg, blend);
  const bg2 = lerpRGB(A.bg2, B.bg2, blend);
  const text = lerpRGB(A.text, B.text, blend);
  const textDim = lerpRGB(A.textDim, B.textDim, blend);
  const accent = lerpRGB(A.accent, B.accent, blend);

  root.style.setProperty('--u-bg', rgbStr(bg));
  root.style.setProperty('--u-bg-2', rgbStr(bg2));
  root.style.setProperty('--u-text', rgbStr(text));
  root.style.setProperty('--u-text-dim', rgbStr(textDim));
  root.style.setProperty('--u-accent', rgbStr(accent));
  root.style.setProperty('--u-glow', rgbaStr(accent, 0.35));
  root.style.setProperty('--u-hairline', blend < 0.5 ? A.hairline : B.hairline);
  root.style.setProperty('--u-grain', (A.grain + (B.grain - A.grain) * blend).toFixed(3));

  // Global scroll progress 0..1 for backdrop parallax vars
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const gp = docH > 0 ? window.scrollY / docH : 0;
  root.style.setProperty('--scroll-p', gp.toFixed(4));
  root.style.setProperty('--warp-t', (Math.sin(gp * Math.PI * 2) * 0.5 + 0.5).toFixed(3));
  root.style.setProperty('--sigil-angle', (gp * 720) + 'deg');

  // Warp streak palette — drive canvas
  WARP.hue = A.streakHue + (B.streakHue - A.streakHue) * blend;
  WARP.sat = A.streakSat + (B.streakSat - A.streakSat) * blend;
  WARP.alpha = A.streakAlpha + (B.streakAlpha - A.streakAlpha) * blend;
  WARP.transitionHeat = Math.abs(0.5 - t) < 0.2 ? (1 - Math.abs(0.5 - t) / 0.2) : 0;

  // Uni-rail active state
  const activeIdx = t < 0.5 ? a : b;
  document.querySelectorAll('.uni-rail-item').forEach((el, i) => {
    el.classList.toggle('active', i === activeIdx);
  });
}

/* ─── WARP CANVAS (time-warp streaks) ─── */
const WARP = { hue: 40, sat: 70, alpha: 0.3, transitionHeat: 0, stars: [] };
(function initWarp() {
  const cvs = document.getElementById('warp-canvas');
  const ctx = cvs.getContext('2d');
  let w, h, dpr;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = cvs.width = Math.floor(window.innerWidth * dpr);
    h = cvs.height = Math.floor(window.innerHeight * dpr);
    cvs.style.width = window.innerWidth + 'px';
    cvs.style.height = window.innerHeight + 'px';
    // seed streaks
    const count = TWEAKS.intensity === 'low' ? 60 : TWEAKS.intensity === 'high' ? 180 : 110;
    WARP.stars = [];
    for (let i = 0; i < count; i++) {
      WARP.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1 + 0.2,
        len: Math.random() * 18 + 4
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  let lastY = window.scrollY;
  let vel = 0;
  let t0 = performance.now();

  function draw() {
    const now = performance.now();
    const dt = Math.min(60, now - t0); t0 = now;
    const y = window.scrollY;
    const sv = (y - lastY);
    lastY = y;
    // smooth scroll velocity
    vel = vel * 0.85 + sv * 0.15;
    const speed = Math.min(3.5, Math.abs(vel) * 0.06);
    const idle = 0.18; // ambient drift

    ctx.clearRect(0, 0, w, h);
    const hue = WARP.hue;
    const sat = WARP.sat;
    const baseA = WARP.alpha * (TWEAKS.intensity === 'low' ? 0.5 : TWEAKS.intensity === 'high' ? 1.3 : 1);
    const heat = WARP.transitionHeat;

    for (const s of WARP.stars) {
      // move slightly down while idle, up faster when scrolling down
      const dy = (idle + speed * 6) * s.z * (dt / 16);
      s.y += dy;
      if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
      if (s.y < -30) { s.y = h + 20; s.x = Math.random() * w; }

      const streakLen = s.len + speed * 40 * s.z + heat * 30;
      const a = baseA * s.z * (0.6 + speed * 0.4 + heat * 0.5);
      const grad = ctx.createLinearGradient(s.x, s.y - streakLen, s.x, s.y + streakLen);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, 70%, 0)`);
      grad.addColorStop(0.5, `hsla(${hue}, ${sat}%, 70%, ${a})`);
      grad.addColorStop(1, `hsla(${hue}, ${sat}%, 70%, 0)`);
      ctx.fillStyle = grad;
      const wid = 1.2 * dpr * (0.7 + s.z);
      ctx.fillRect(s.x - wid / 2, s.y - streakLen, wid, streakLen * 2);
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ─── MAIN SCROLL HANDLER ─── */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => { updateUniverse(); ticking = false; });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { centersCache = getSectionCenters(); updateUniverse(); });
updateUniverse();

/* ─── HERO MOUSE PARALLAX ─── */
(function heroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let tx = 0, ty = 0;
  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    tx += (nx - tx) * 0.08; ty += (ny - ty) * 0.08;
    hero.style.setProperty('--mx', tx.toFixed(3));
    hero.style.setProperty('--my', ty.toFixed(3));
  });
})();

/* ─── REVEAL + SECTION LIT ─── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// about columns "lit" for top-line animation
const aboutColObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lit'); aboutColObs.unobserve(e.target); } });
}, { threshold: 0.4 });
document.querySelectorAll('.about-col').forEach(el => aboutColObs.observe(el));

/* ─── HERO LIT (first paint) ─── */
requestAnimationFrame(() => {
  setTimeout(() => document.querySelector('.hero')?.classList.add('lit'), 150);
});

/* ─── VB FRAME ANIMATION + SCRUB ─── */
const VB_TOTAL = 120;
const VB_PATH = (i) => `frames/frame_${String(i).padStart(4,'0')}.jpg`;
const VB_DUR = 3800;
const vbWrap = document.getElementById('vb-wrap');
const vbCanvas = document.getElementById('vb-canvas');
const vbCtx = vbCanvas ? vbCanvas.getContext('2d') : null;
const vbFill = document.getElementById('vb-scrub-fill');
const vbPct = document.getElementById('vb-scrub-pct');
const vbRank = document.getElementById('vb-rank');
const vbReplay = document.getElementById('vb-replay');
const vbSection = document.querySelector('.vb-section');
const vbFrames = new Array(VB_TOTAL);
let vbLoaded = 0, vbErrors = 0, vbCur = -1;
let vbW = 0, vbH = 0;
let vbAllLoaded = false;
let vbHasPlayed = false;
let vbAnimating = false;
let vbRaf = null;
const vbReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function vbSize() {
  if (!vbCanvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = vbWrap.getBoundingClientRect();
  vbW = rect.width; vbH = rect.height;
  vbCanvas.width = Math.round(vbW * dpr);
  vbCanvas.height = Math.round(vbH * dpr);
  vbCanvas.style.width = vbW + 'px';
  vbCanvas.style.height = vbH + 'px';
  vbCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (vbCur >= 0) vbDraw(vbCur, true);
}
function vbDraw(idx, force) {
  if (!vbCtx) return;
  idx = Math.max(0, Math.min(VB_TOTAL - 1, idx));
  if (!force && idx === vbCur) return;
  const img = vbFrames[idx];
  if (!img || !img.complete || !img.naturalWidth) return;
  vbCur = idx;
  const ia = img.naturalWidth / img.naturalHeight;
  const ca = vbW / vbH;
  let dw, dh;
  if (ia > ca) { dh = vbH; dw = dh * ia; } else { dw = vbW; dh = dw / ia; }
  const dx = (vbW - dw) / 2, dy = (vbH - dh) / 2;
  vbCtx.fillStyle = '#020303';
  vbCtx.fillRect(0, 0, vbW, vbH);
  vbCtx.drawImage(img, dx, dy, dw, dh);
  // scrub ui
  const p = idx / (VB_TOTAL - 1);
  if (vbFill) vbFill.style.width = (p * 100).toFixed(1) + '%';
  if (vbPct) vbPct.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
  if (vbRank) {
    const r = p < 0.22 ? '1/5' : p < 0.44 ? '2/5' : p < 0.66 ? '3/5' : p < 0.88 ? '4/5' : '5/5';
    vbRank.textContent = r;
  }
}
function vbPreload() {
  for (let i = 0; i < VB_TOTAL; i++) {
    const img = new Image();
    img.onload = () => {
      vbLoaded++;
      if (i === 0) vbDraw(0, true);
      if (vbLoaded === VB_TOTAL) vbAllLoaded = true;
    };
    img.onerror = () => {
      vbErrors++;
      if (vbErrors > 10) vbWrap.classList.add('has-error');
    };
    img.src = VB_PATH(i + 1);
    vbFrames[i] = img;
  }
}
function vbPlay() {
  if (vbAnimating || !vbCtx) return;
  vbAnimating = true;
  if (vbReduced) { vbDraw(VB_TOTAL - 1, true); vbAnimating = false; return; }
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / VB_DUR);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const idx = Math.min(VB_TOTAL - 1, Math.floor(eased * VB_TOTAL));
    vbDraw(idx);
    if (t < 1) vbRaf = requestAnimationFrame(step);
    else { vbDraw(VB_TOTAL - 1, true); vbAnimating = false; }
  }
  vbRaf = requestAnimationFrame(step);
}

if (vbCanvas && vbSection) {
  vbSize();
  window.addEventListener('resize', vbSize);
  if ('requestIdleCallback' in window) requestIdleCallback(vbPreload, { timeout: 1200 });
  else setTimeout(vbPreload, 300);

  // takeover reveal + first play
  const vbObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.35) {
        vbSection.classList.add('lit');
        if (!vbHasPlayed) {
          const go = () => { vbHasPlayed = true; vbPlay(); };
          if (vbAllLoaded) go();
          else {
            const iv = setInterval(() => {
              if (vbAllLoaded) { clearInterval(iv); go(); }
            }, 150);
            setTimeout(() => clearInterval(iv), 15000);
          }
        }
      }
    });
  }, { threshold: 0.35 });
  vbObs.observe(vbSection);

  // drag-to-scrub
  let scrubbing = false;
  function scrubAt(clientX) {
    const rect = vbWrap.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    vbDraw(Math.floor(p * (VB_TOTAL - 1)));
  }
  vbWrap.addEventListener('pointerdown', (e) => {
    if (!vbAllLoaded) return;
    if (vbRaf) cancelAnimationFrame(vbRaf);
    vbAnimating = false;
    scrubbing = true;
    vbWrap.classList.add('scrubbing');
    vbWrap.setPointerCapture(e.pointerId);
    scrubAt(e.clientX);
  });
  vbWrap.addEventListener('pointermove', (e) => {
    if (scrubbing) scrubAt(e.clientX);
    else if (vbAllLoaded && !vbAnimating) {
      // hover-scrub (subtle)
      const rect = vbWrap.getBoundingClientRect();
      const p = (e.clientX - rect.left) / rect.width;
      if (p >= 0 && p <= 1) vbDraw(Math.floor(p * (VB_TOTAL - 1)));
    }
    // parallax tilt
    const rect = vbWrap.getBoundingClientRect();
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    vbWrap.style.setProperty('--vb-tx', ny.toFixed(3));
    vbWrap.style.setProperty('--vb-ty', nx.toFixed(3));
  });
  vbWrap.addEventListener('pointerup', () => {
    scrubbing = false;
    vbWrap.classList.remove('scrubbing');
  });
  vbWrap.addEventListener('pointerleave', () => {
    vbWrap.style.setProperty('--vb-tx', 0);
    vbWrap.style.setProperty('--vb-ty', 0);
  });

  vbReplay.addEventListener('click', () => {
    if (vbRaf) cancelAnimationFrame(vbRaf);
    vbAnimating = false;
    vbDraw(0, true);
    setTimeout(vbPlay, 80);
  });
}

/* ─── PMU HEROES ─── */
const HEROES = [
  { name: 'Kaelwyn',  desc: 'Holds the line when others break. Remembers every ally she has lost.', trait: 'Stoic',     bond: 'Bonded × 3' },
  { name: 'Pip',      desc: 'Loots first, fights never. Argues with every order. Somehow survives.', trait: 'Cowardly', bond: 'Alone' },
  { name: 'Vess',     desc: 'Reads the tower like a book. Predicts traps three rooms ahead.',          trait: 'Cautious', bond: 'Bonded × 1' },
  { name: 'Duskarr',  desc: 'Trains in silence. Fuses skills nobody else dares attempt.',              trait: 'Obsessive',bond: 'Refuses bonds' },
  { name: 'Nyra',     desc: 'The loudest hero in the barracks. Morale buff incarnate.',                trait: 'Radiant',  bond: 'Bonded × 5' },
  { name: 'Orlo',     desc: 'Stolen from a raid tent aged nine. Never forgave anyone.',                trait: 'Vengeful', bond: 'Bonded × 2' },
  { name: 'Saen',     desc: 'Talks to the tower. The tower talks back. Nobody else listens.',          trait: 'Touched',  bond: 'Bonded × ∞' },
  { name: 'Marrik',   desc: 'Carried the first run on his back. Retired twice. Came back anyway.',     trait: 'Veteran',  bond: 'Bonded × 4' }
];
(function pmuInit() {
  const section = document.querySelector('.pmu-section');
  const tower = document.getElementById('pmu-tower');
  const card = document.getElementById('pmu-card');
  if (!section || !tower) return;

  const cardFloor = document.getElementById('pmu-card-floor');
  const cardName = document.getElementById('pmu-card-name');
  const cardDesc = document.getElementById('pmu-card-desc');
  const cardTrait = document.getElementById('pmu-card-trait');
  const cardBond = document.getElementById('pmu-card-bond');

  const pmuObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.3) {
        section.classList.add('lit');
      }
    });
  }, { threshold: 0.3 });
  pmuObs.observe(section);

  // Contact section lit trigger
  const contact = document.querySelector('.contact');
  if (contact) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.25) {
          contact.classList.add('lit');
        }
      });
    }, { threshold: 0.25 });
    cObs.observe(contact);
  }

  const floors = Array.from(tower.querySelectorAll('.pmu-floor'));
  let activeIdx = -1;
  let ambientIdx = -1;
  let ambientTimer = null;

  function showHero(i) {
    const h = HEROES[i] || HEROES[0];
    cardFloor.textContent = String(i + 1).padStart(2, '0');
    cardName.textContent = h.name;
    cardDesc.textContent = h.desc;
    cardTrait.textContent = h.trait;
    cardBond.textContent = h.bond;
    card.classList.add('visible');
  }
  function select(i) {
    activeIdx = i;
    floors.forEach((f, k) => {
      f.setAttribute('aria-selected', k === i ? 'true' : 'false');
      f.classList.toggle('active', k === i);
    });
    showHero(i);
  }

  floors.forEach((f, i) => {
    f.addEventListener('click', () => select(i));
    f.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
    });
  });

  // ambient pulse when nothing selected
  function ambient() {
    if (activeIdx !== -1) return;
    floors.forEach(f => f.classList.remove('active'));
    let idx;
    do { idx = Math.floor(Math.random() * floors.length); } while (idx === ambientIdx);
    ambientIdx = idx;
    floors[idx].classList.add('active');
  }
  ambientTimer = setInterval(ambient, 2200);
  setTimeout(ambient, 1500);
})();

/* ─── UNI-RAIL CLICK ─── */
document.querySelectorAll('.uni-rail-item').forEach(el => {
  el.addEventListener('click', () => {
    const sel = el.dataset.target;
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── TWEAKS PANEL (parent postMessage protocol) ─── */
(function tweaksInit() {
  const panel = document.getElementById('tweaks');
  if (!panel) return;

  function paintPanel() {
    // segments
    panel.querySelectorAll('.tweaks-seg').forEach(seg => {
      const key = seg.dataset.key;
      seg.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === TWEAKS[key]);
      });
    });
    // switches
    panel.querySelectorAll('.tweaks-switch').forEach(sw => {
      const key = sw.dataset.key;
      sw.classList.toggle('on', !!TWEAKS[key]);
    });
  }

  function send(key, val) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
    } catch (_) {}
  }

  panel.addEventListener('click', (e) => {
    const segBtn = e.target.closest('.tweaks-seg button');
    if (segBtn) {
      const key = segBtn.closest('.tweaks-seg').dataset.key;
      const val = segBtn.dataset.val;
      TWEAKS[key] = val;
      applyTweaksToHtml();
      paintPanel();
      send(key, val);
      // regenerate warp stars for intensity
      window.dispatchEvent(new Event('resize'));
      return;
    }
    const sw = e.target.closest('.tweaks-switch');
    if (sw) {
      const key = sw.dataset.key;
      TWEAKS[key] = !TWEAKS[key];
      applyTweaksToHtml();
      paintPanel();
      send(key, TWEAKS[key]);
      if (key === 'universeBleed') updateUniverse();
      return;
    }
    if (e.target.id === 'replay-all') {
      document.querySelectorAll('.reveal').forEach(r => r.classList.remove('revealed'));
      document.querySelector('.hero')?.classList.remove('lit');
      vbSection?.classList.remove('lit');
      document.querySelector('.pmu-section')?.classList.remove('lit');
      document.querySelectorAll('.about-col').forEach(c => c.classList.remove('lit'));
      vbHasPlayed = false;
      setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(r => revealObs.observe(r));
        document.querySelector('.hero')?.classList.add('lit');
        document.querySelectorAll('.about-col').forEach(c => aboutColObs.observe(c));
        // re-trigger sections via IntersectionObserver fires naturally on next scroll
      }, 50);
    }
  });

  paintPanel();

  // Edit-mode messaging protocol
  window.addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === '__activate_edit_mode') panel.classList.add('visible');
    else if (m.type === '__deactivate_edit_mode') panel.classList.remove('visible');
  });

  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
})();

/* ─── SWORD RUSH STAGE ─── */
(function srInit() {
  const stage = document.getElementById('sr-stage');
  const heroesWrap = document.getElementById('sr-heroes');
  const statsWrap = document.getElementById('sr-stats');
  const heroName = document.getElementById('sr-hero-name');
  const heroTag = document.getElementById('sr-hero-tag');
  const heroDesc = document.getElementById('sr-hero-desc');
  const hudHero = document.getElementById('sr-hud-hero');
  const hudReach = document.getElementById('sr-hud-reach');
  const speedVal = document.getElementById('sr-speed-val');
  const dur = document.getElementById('sr-dur');
  const durVal = document.getElementById('sr-dur-val');
  const weaponWrap = document.getElementById('sr-weapon-wrap');
  const target = document.getElementById('sr-target');
  const dmgLayer = document.getElementById('sr-dmg-layer');
  if (!stage || !heroesWrap || !weaponWrap) return;

  const HEROES = [
    { name: 'Dueler',     diff: '★☆☆', wpn: 'Longsword',    reach: '2.5m', stats: [3,3,3,3,3], desc: 'The teaching hero. Honest, well-rounded. Riposte Stance turns a clean parry into a guaranteed lunge.' },
    { name: 'Rusher',     diff: '★★☆', wpn: 'Dual Daggers',  reach: '1.4m', stats: [2,1,1,5,5], desc: 'Aerial assassin. Keeps everyone airborne. Wall-kick redirects on command, Blurstep unlocks mixups.' },
    { name: 'Juggernaut', diff: '★★☆', wpn: 'Warhammer',     reach: '2.8m', stats: [5,4,3,1,2], desc: 'Momentum incarnate. Slowest swings, highest per-hit damage. Brace makes you immovable.' },
    { name: 'Polearm',    diff: '★★★', wpn: 'Spear',         reach: '3.8m', stats: [3,2,5,3,3], desc: 'Space control. Punishes whiffs. Low Sweep knocks down — no Landing i-frames.' },
    { name: 'Grappler',   diff: '★★★', wpn: 'Chain & Hook',  reach: '2.3m', stats: [2,3,2,3,3], desc: 'Arena-shaper. Hook Grab, Ground Anchor, Maelstrom — a walking gravity well.' },
    { name: 'Speerow',    diff: '★★★', wpn: 'Gauntlets',     reach: '1.2m', stats: [2,2,1,5,5], desc: 'Grounded rushdown boxer. Slip Step cancels whiffs. Keeps kit even with broken "weapon".' }
  ];
  const STAT_LABELS = ['ATK','DEF','RNG','SPD','MOV'];

  // Weapon SVGs per hero (drawn bottom-up, hilt near bottom, blade up)
  const WEAPONS = {
    Dueler: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <polygon points="96,180 104,180 108,20 100,4 92,20" fill="#FFE8DE"/>
      <rect x="78" y="178" width="44" height="9" fill="#c8844e"/>
      <rect x="94" y="187" width="12" height="40" fill="#3a1a1e"/>
      <rect x="91" y="226" width="18" height="10" rx="2" fill="#c8844e"/>
      <rect x="72" y="230" width="22" height="34" rx="6" fill="#2a1014"/>
      <rect x="106" y="230" width="22" height="34" rx="6" fill="#2a1014"/>
    </svg>`,
    Rusher: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <polygon points="64,180 72,180 76,80 68,64 60,80" fill="#FFE8DE"/>
      <rect x="56" y="178" width="24" height="7" fill="#c8844e"/>
      <rect x="64" y="184" width="8" height="28" fill="#2a1014"/>
      <polygon points="128,180 136,180 140,80 132,64 124,80" fill="#FFE8DE"/>
      <rect x="120" y="178" width="24" height="7" fill="#c8844e"/>
      <rect x="128" y="184" width="8" height="28" fill="#2a1014"/>
      <rect x="52" y="214" width="22" height="34" rx="6" fill="#2a1014"/>
      <rect x="126" y="214" width="22" height="34" rx="6" fill="#2a1014"/>
    </svg>`,
    Juggernaut: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <rect x="94" y="80" width="12" height="140" fill="#3a1a1e"/>
      <rect x="60" y="30" width="80" height="56" rx="4" fill="#7a5a38" stroke="#3a1a1e" stroke-width="3"/>
      <rect x="66" y="38" width="68" height="8" fill="#c8844e"/>
      <rect x="66" y="72" width="68" height="8" fill="#c8844e"/>
      <circle cx="100" cy="58" r="8" fill="#8a1f1a"/>
      <rect x="72" y="226" width="22" height="34" rx="6" fill="#2a1014"/>
      <rect x="106" y="226" width="22" height="34" rx="6" fill="#2a1014"/>
    </svg>`,
    Polearm: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <rect x="97" y="40" width="6" height="200" fill="#6a4028"/>
      <polygon points="92,60 108,60 115,0 100,-14 85,0" fill="#FFE8DE" stroke="#8a1f1a" stroke-width="0.8"/>
      <rect x="88" y="58" width="24" height="4" fill="#c8844e"/>
      <rect x="72" y="238" width="22" height="26" rx="6" fill="#2a1014"/>
      <rect x="106" y="218" width="22" height="30" rx="6" fill="#2a1014"/>
    </svg>`,
    Grappler: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <g stroke="#8a6040" stroke-width="5" fill="none">
        <circle cx="100" cy="60" r="7"/><circle cx="100" cy="78" r="7"/><circle cx="100" cy="96" r="7"/>
        <circle cx="100" cy="114" r="7"/><circle cx="100" cy="132" r="7"/><circle cx="100" cy="150" r="7"/>
        <circle cx="100" cy="168" r="7"/><circle cx="100" cy="186" r="7"/>
      </g>
      <path d="M 100 30 Q 120 20 130 10 Q 138 2 132 -8 Q 125 -16 115 -10" fill="none" stroke="#c8844e" stroke-width="7" stroke-linecap="round"/>
      <path d="M 115 -10 L 110 0" stroke="#c8844e" stroke-width="4" stroke-linecap="round"/>
      <rect x="78" y="200" width="22" height="34" rx="6" fill="#2a1014"/>
      <rect x="102" y="200" width="22" height="34" rx="6" fill="#2a1014"/>
    </svg>`,
    Speerow: `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet">
      <rect x="56" y="140" width="36" height="50" rx="8" fill="#3a1a1e" stroke="#c8844e" stroke-width="2"/>
      <rect x="58" y="148" width="32" height="4" fill="#c8844e"/>
      <rect x="58" y="158" width="32" height="4" fill="#c8844e"/>
      <circle cx="74" cy="176" r="3" fill="#FF463A"/>
      <rect x="108" y="140" width="36" height="50" rx="8" fill="#3a1a1e" stroke="#c8844e" stroke-width="2"/>
      <rect x="110" y="148" width="32" height="4" fill="#c8844e"/>
      <rect x="110" y="158" width="32" height="4" fill="#c8844e"/>
      <circle cx="126" cy="176" r="3" fill="#FF463A"/>
      <rect x="56" y="188" width="36" height="30" rx="6" fill="#2a1014"/>
      <rect x="108" y="188" width="36" height="30" rx="6" fill="#2a1014"/>
    </svg>`
  };

  let active = 0;
  let durability = 100;

  function renderChips() {
    heroesWrap.innerHTML = HEROES.map((h, i) =>
      `<button class="sr-hero-chip${i===active?' active':''}" data-hero="${i}" role="tab" aria-selected="${i===active}">${h.name}<span class="diff">${h.diff}</span></button>`
    ).join('');
  }
  function renderStats() {
    const h = HEROES[active];
    statsWrap.innerHTML = h.stats.map((v, i) =>
      `<div class="sr-stat"><div class="lbl">${STAT_LABELS[i]}</div><div class="bars">${
        [1,2,3,4,5].map(n => `<i class="${n<=v?'on':''}"></i>`).join('')
      }</div></div>`
    ).join('');
  }
  function selectHero(i, opts = {}) {
    active = i;
    const h = HEROES[i];
    heroName.textContent = h.name;
    heroTag.textContent = `${h.wpn.toUpperCase()} · ${h.diff}`;
    heroDesc.textContent = h.desc;
    hudHero.textContent = h.name.toUpperCase();
    hudReach.textContent = h.reach;
    weaponWrap.innerHTML = WEAPONS[h.name] || WEAPONS.Dueler;
    renderChips();
    renderStats();
    if (opts.scroll) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  heroesWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.sr-hero-chip');
    if (!btn) return;
    selectHero(parseInt(btn.dataset.hero, 10), { scroll: true });
  });

  /* ── Swing engine (mouse/drag/release → velocity-based swing) ── */
  let idleAngle = 10;
  let currentAngle = idleAngle;
  let targetAngle = idleAngle;
  let swinging = false;
  let history = [];
  let downX = 0, downY = 0;

  function setWeaponAngle(deg) {
    weaponWrap.style.transform = `translate(-50%, 0) rotate(${deg}deg)`;
  }
  setWeaponAngle(idleAngle);

  function stageRect() { return stage.getBoundingClientRect(); }

  function sampleVelocity() {
    if (history.length < 2) return { speed: 0, dir: 0 };
    const a = history[0], b = history[history.length - 1];
    const dt = Math.max(16, b.t - a.t);
    const vx = (b.x - a.x) / dt * 1000;
    const vy = (b.y - a.y) / dt * 1000;
    return { speed: Math.hypot(vx, vy), dir: Math.atan2(vx, -vy) * 180 / Math.PI };
  }

  function doSwing(angle, power, hitX, hitY) {
    if (swinging) return;
    swinging = true;
    stage.classList.add('swinging');
    stage.classList.add('used');
    const clamped = Math.max(-130, Math.min(130, angle));
    const overshoot = clamped + Math.sign(clamped || 1) * (14 + power * 22);
    const startAng = currentAngle;
    const dur = 240 + (1 - power) * 260;
    const startT = performance.now();
    (function anim(now) {
      const t = Math.min(1, (now - startT) / dur);
      const eased = t < 0.55
        ? Math.pow(t / 0.55, 2)
        : 1 + Math.sin((t - 0.55) / 0.45 * Math.PI) * -0.18;
      const a = startAng + (overshoot - startAng) * eased;
      currentAngle = a;
      setWeaponAngle(a);
      if (t < 1) requestAnimationFrame(anim);
      else {
        currentAngle = idleAngle;
        setWeaponAngle(idleAngle);
        setTimeout(() => {
          stage.classList.remove('swinging');
          swinging = false;
        }, 80);
      }
    })(performance.now());

    // Durability tick
    const cost = Math.max(2, Math.round(power * 10));
    durability = Math.max(0, durability - cost);
    dur.style.width = durability + '%';
    durVal.textContent = durability;
    if (durability <= 0) {
      setTimeout(() => { durability = 100; dur.style.width = '100%'; durVal.textContent = 100; }, 700);
    }

    // hit detection mid-swing
    setTimeout(() => showHit(angle, power, hitX, hitY), dur * 0.45);
  }

  function showHit(angle, power, hitX, hitY) {
    const r = stageRect();
    const tRect = target.getBoundingClientRect();
    // Any swing with meaningful power counts as a hit against the center dummy
    if (power < 0.08) return;
    // Hero stat influence
    const h = HEROES[active];
    const atkBoost = 1 + (h.stats[0] - 3) * 0.12;
    const base = Math.floor((16 + power * 70) * atkBoost);
    const crit = power > 0.72 || (Math.random() < 0.14 + power * 0.15 && power > 0.35);
    const dmg = crit ? Math.floor(base * 1.7) : base;

    target.style.setProperty('--hit-x', (Math.sin(angle * Math.PI / 180) * 16) + 'px');
    target.style.setProperty('--hit-y', (-Math.cos(angle * Math.PI / 180) * 12) + 'px');
    target.style.setProperty('--hit-r', (angle * 0.08) + 'deg');
    stage.classList.remove('hit'); void stage.offsetWidth; stage.classList.add('hit');

    // Floating damage number
    if (dmgLayer) {
      const el = document.createElement('div');
      el.className = 'sr-dmg' + (crit ? ' crit' : '');
      const tx = tRect.left + tRect.width / 2 - r.left + (Math.random() - 0.5) * 36;
      const ty = tRect.top + tRect.height * 0.28 - r.top + (Math.random() - 0.5) * 16;
      el.style.left = tx + 'px';
      el.style.top = ty + 'px';
      el.innerHTML = crit ? `${dmg}<span class="crit-tag">CRIT</span>` : `${dmg}`;
      dmgLayer.appendChild(el);
      setTimeout(() => el.remove(), 950);
    }
  }

  /* Pointer events */
  stage.addEventListener('pointermove', (e) => {
    const r = stageRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.85;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const ang = Math.max(-120, Math.min(120, Math.atan2(dx, -dy) * 180 / Math.PI));
    if (!swinging) {
      targetAngle = ang * 0.65;
      currentAngle = targetAngle;
      setWeaponAngle(targetAngle);
    }
    history.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    while (history.length > 8) history.shift();
    if (speedVal) {
      const { speed } = sampleVelocity();
      speedVal.textContent = (speed / 1000).toFixed(1);
    }
  });

  stage.addEventListener('pointerdown', (e) => {
    try { stage.setPointerCapture(e.pointerId); } catch {}
    stage.classList.add('holding');
    downX = e.clientX; downY = e.clientY;
    history = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
  });

  stage.addEventListener('pointerup', (e) => {
    stage.classList.remove('holding');
    try { stage.releasePointerCapture(e.pointerId); } catch {}
    const { speed, dir } = sampleVelocity();
    const dragDx = e.clientX - downX;
    const dragDy = e.clientY - downY;
    const dragDist = Math.hypot(dragDx, dragDy);
    if (dragDist < 16 && speed < 180) return; // a tap — ignore
    const useDrag = dragDist > 45;
    const swingDir = useDrag ? Math.atan2(dragDx, -dragDy) * 180 / Math.PI : dir;
    const power = Math.min(1, (speed / 2400) * 0.55 + (dragDist / 380) * 0.45);
    doSwing(swingDir, Math.max(0.15, power), e.clientX, e.clientY);
  });

  stage.addEventListener('pointerleave', () => {
    stage.classList.remove('holding');
    if (!swinging) {
      targetAngle = idleAngle;
      currentAngle = idleAngle;
      setWeaponAngle(idleAngle);
    }
  });

  // Auto-demo swing on first reveal
  const srObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= 0.35) {
        setTimeout(() => {
          if (!swinging) doSwing(45, 0.55, 0, 0);
        }, 900);
        setTimeout(() => {
          if (!swinging) doSwing(-60, 0.75, 0, 0);
        }, 2000);
        srObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });
  srObs.observe(stage);

  selectHero(0);
})();
