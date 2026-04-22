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
  { // 3 — Violet Spire (PMU) — deep indigo-violet
    name: 'Spire',
    bg: [19, 10, 31], bg2: [10, 4, 22],
    text: [241, 229, 255], textDim: [170, 150, 200],
    accent: [185, 123, 255],
    hairline: 'rgba(185,123,255,0.18)', grain: 0.035,
    streakHue: 280, streakSat: 80, streakAlpha: 0.5,
    glow: 'rgba(185,123,255,0.4)'
  },
  { // 4 — Cosmic Sunset (contact) — warm black with amber
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
  // Snap scroll is enforced for all users; no longer user-togglable.
  h.classList.add('snap-on');
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
