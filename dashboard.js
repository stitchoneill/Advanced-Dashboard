// =======================
// FUTURISTIC DASHBOARD VANILLA JS
// =======================

const canvas = document.getElementById('dashboard-canvas');
const ctx = canvas.getContext('2d');
const centerBtn = document.getElementById('center-btn');
const NEWS_TABS = [
  { key: "uk", label: "UK News", source: "bbc-news,independent" },
  { key: "world", label: "World", source: "reuters,cnn" },
  { key: "tech", label: "Tech", source: "techcrunch,the-verge" },
  { key: "business", label: "Business", source: "bloomberg,business-insider" },
  { key: "sports", label: "Sports", source: "bbc-sport,four-four-two" },
  { key: "entertainment", label: "Entertainment", source: "mtv-news-uk,buzzfeed" },
  { key: "science", label: "Science", source: "new-scientist,national-geographic" },
  { key: "politics", label: "Politics", source: "politico,the-hill" }
];
let activeTab = "top";

// Animation state
let burst = 0, burstDir = 0;
let voidBurst = 0, voidBurstDir = 0;
let widgetsAnim = 0, widgetsOut = false;
let entered = false;
let newsOpen = false;

// Geometry and drawing
// ── Geometry & animation constants ─────────────────────────────────────
const STAR_SPEED       = 0.12;      // drift velocity
const GLOW             = 12;
const WIDGET_R         = 220;

const STAR_PULSE_SPEED = 2.5;       // slower twinkle
const STAR_GLOW_RANGE  = [8, 15];    // per‑star blur radius

const SCALE     = 1.5;
const BTN_R     = 30 * SCALE;
const GAP       = 20 * SCALE;
const RING_INNER= BTN_R + GAP;
const TICK_R    = BTN_R + GAP * 4;

let cx = 0, cy = 0, w = 0, h = 0;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  cx = w/2; cy = h/2;
}
window.addEventListener('resize', resize);
resize();

// ---- Stars
const N = 100;
const stars = Array.from({ length: N }).map(() => {
  const a  = Math.random() * Math.PI * 2;
  const r  = RING_INNER + Math.random() * (TICK_R - RING_INNER);
  const ox = cx + Math.cos(a) * r;
  const oy = cy + Math.sin(a) * r;

  const hue   = 190 + Math.random() * 20;   // 190–210°
  const sat   = 60  + Math.random() * 25;   // 60–85 %
  const light = 80  + Math.random() * 15;   // 80–95 %
  
  return {
    originX : ox, originY : oy, x : ox, y : oy,
    vx      : (Math.random() - 0.5) * STAR_SPEED,
    vy      : (Math.random() - 0.5) * STAR_SPEED,
    phase   : Math.random() * Math.PI * 2,

    /* visible halo size, 7‑10 px in your current SCALE */
    glowRadius : 2.5 * SCALE + Math.random() * 1.5 * SCALE,

    /* subtle blue‑purple tint */
    colour : `hsl(${hue} ${sat}% ${light}%)`
  };
});

// [VOID STARS] Burst/fade-out effect from center
const VOID_STAR_COUNT = 100;
const voidStars = [];
function spawnVoidStars() {
  voidStars.length = 0;

  const INNER = RING_INNER + BTN_R * 0.8; // move a bit closer in
  const OUTER = WIDGET_R * Math.max(...widgets.map(w=>w.k)) * 1.18; // a bit further out

  for (let i = 0; i < VOID_STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rand = Math.sqrt(Math.random());
    const r = INNER + (OUTER - INNER) * rand;
    const tx = cx + Math.cos(angle) * r;
    const ty = cy + Math.sin(angle) * r;

    const hue   = 190 + Math.random() * 20;
    const sat   = 60  + Math.random() * 25;
    const light = 80  + Math.random() * 15;

    voidStars.push({
      originX : cx, originY : cy,
      targetX : tx, targetY : ty,
      x : cx, y : cy,
      vx : (Math.random() - 0.5) * STAR_SPEED,
      vy : (Math.random() - 0.5) * STAR_SPEED,
      phase   : Math.random() * Math.PI * 2,
      glowRadius : 2.5 * SCALE + Math.random() * 1.5 * SCALE,
      colour : `hsl(${hue} ${sat}% ${light}%)`
    });
  }
}



// ---- Widgets
const widgets = [
  {ang:-0.9     ,k:0.7,type:'news'   },
  {ang:-0.9+0.9 ,k:1.0,type:'weather'},
  {ang:-0.9+1.8 ,k:1.4,type:'crypto' }
];
widgets.forEach(w=>{w.screenX = cx; w.screenY = cy;});

// --- [NEW] Hover tracking variables and events for widget effects ---
let mouseX = -1, mouseY = -1;
let hoveredWidget = null;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
  mouseX = -1; mouseY = -1; hoveredWidget = null;
});

// ---- Animation loop
let last = performance.now(), gPhase = 0;
function draw(ts) {
  const dt = Math.min((ts-last)/1000, 0.1); last = ts; gPhase += dt*3;

  if (burstDir) {
    burst = Math.max(0, Math.min(1, burst + burstDir*dt*1.2));
    if (burst===0 && burstDir<0) burstDir = 0;
    if (burst===1 && burstDir>0) burstDir = 0;
  }

  if (voidBurstDir) {
  voidBurst = Math.max(0, Math.min(1, voidBurst + voidBurstDir * dt * 1.2));
  if (voidBurst === 0 && voidBurstDir < 0) voidBurstDir = 0;
  if (voidBurst === 1 && voidBurstDir > 0) voidBurstDir = 0;
}
  const ringScale = 1 - burst;

  // Widgets anim
  const WIDGET_SPD = 4;
  if (widgetsOut && widgetsAnim < 1)
    widgetsAnim = Math.min(1, widgetsAnim + dt * WIDGET_SPD);
  else if (!widgetsOut && widgetsAnim > 0)
    widgetsAnim = Math.max(0, widgetsAnim - dt * WIDGET_SPD);

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,w,h);

  // --- [NEW] Detect hovered widget for visual effect ---
  hoveredWidget = null;
  if (widgetsAnim > 0 && entered) {
    widgets.forEach(w => {
      if (Math.hypot(mouseX - w.screenX, mouseY - w.screenY) <= BTN_R) {
        hoveredWidget = w.type;
      }
    });
  }

  /* ---------- dotted neon clock rings (seconds / minutes / hours) ---------- */
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowBlur  = 8;
  ctx.shadowColor = 'rgba(0,255,255,0.9)';

  const now  = new Date();
  const sec  = now.getSeconds();
  const min  = now.getMinutes();
  const hrs  = now.getHours() % 12;

  /* radii that match the star‑bounce torus */
  const secR = (RING_INNER +  2)                             * ringScale;
  const minR = (RING_INNER + (TICK_R - RING_INNER) / 2)      * ringScale;
  const hrR  = (TICK_R   -  2)                               * ringScale;
  const radii = [secR, minR, hrR];

  radii.forEach((radius, ring) => {
    for (let t = 0; t < 60; t++) {
      const ang = t * Math.PI * 2 / 60 - Math.PI / 2;
      let rDot = 1.2 * SCALE * ringScale;
      let color = 'rgba(0,255,255,0.35)';

      if (ring === 0) { // seconds ring
        if (t === sec) {
          // White dot for the current second
          ctx.save();
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * radius, Math.sin(ang) * radius, 2.4 * SCALE, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 36;
          ctx.shadowColor = "#fff";
          ctx.fill();
          ctx.restore();
          continue;
        }
      } else if (ring === 1) {
        if (t === min)      { rDot = 2.4 * SCALE; color = '#ffffff'; }
        else if (t % 5 === 0){ rDot = 2.0 * SCALE; color = 'rgba(0,255,255,1)'; }
      } else {
        if (t % 15 === 0)   { rDot = 2.5 * SCALE; color = 'rgba(0,255,255,1)'; }
      }

      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * radius, Math.sin(ang) * radius, rDot, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.restore();

  // ── Stars ──
  ctx.save();
  stars.forEach(s => {
    // ── position update (unchanged) ──
    if (burst > 0 && burst < 1) {
      const dx = s.originX - cx, dy = s.originY - cy;
      s.x = s.originX + dx * burst * 3.5;
      s.y = s.originY + dy * burst * 3.5;
    } else {
      s.x += s.vx; s.y += s.vy;
      if (s.x <= 0 || s.x >= w) s.vx *= -1;
      if (s.y <= 0 || s.y >= h) s.vy *= -1;
    }
    if (burst === 0) {
      const dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy);
      if (d < RING_INNER || d > TICK_R) {
        const r0 = d < RING_INNER ? RING_INNER : TICK_R,
              nx = dx / d, ny = dy / d;
        s.x = cx + nx * r0; s.y = cy + ny * r0;
        const dot = s.vx * nx + s.vy * ny;
        s.vx -= 2 * dot * nx; s.vy -= 2 * dot * ny;
      }
    }
    // ── draw star ──
    s.phase += dt * STAR_PULSE_SPEED;
    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
    const warm  = Math.random() < 0.15;
    const tint  = warm ? '255,230,180' : '0,255,255';
    const baseA = 0.2 + Math.random() * 0.15;

    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowRadius);
    grd.addColorStop(0, `rgba(${tint},${baseA})`);
    grd.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2 * SCALE, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();

  // [VOID STARS] Draw and animate voidStars (EXPAND AND FADE OUT)
  // [VOID STARS] Move, twinkle, and bounce just like the main stars, but only draw when burst > 0
if (voidBurst > 0 || voidBurstDir !== 0) {
  ctx.save();
  voidStars.forEach(s => {
    if (voidBurst > 0 && voidBurst < 1) {
      // Interpolate between center and random void target
      s.x = s.originX + (s.targetX - s.originX) * voidBurst;
      s.y = s.originY + (s.targetY - s.originY) * voidBurst;
    } else if (voidBurst === 1) {
      // Drift/bounce inside the void ring
      s.x += s.vx;
      s.y += s.vy;
      const dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy);
      const INNER = RING_INNER + BTN_R * 0.8;
      const OUTER = WIDGET_R * Math.max(...widgets.map(w=>w.k)) * 1.18;
      if (d < INNER || d > OUTER) {
        const r0 = d < INNER ? INNER : OUTER,
              nx = dx / d, ny = dy / d;
        s.x = cx + nx * r0; s.y = cy + ny * r0;
        const dot = s.vx * nx + s.vy * ny;
        s.vx -= 2 * dot * nx; s.vy -= 2 * dot * ny;
      }
    } else if (voidBurst === 0) {
      // Retracted: park at center
      s.x = s.originX;
      s.y = s.originY;
    }
    // Twinkle & draw
    s.phase += dt * STAR_PULSE_SPEED;
    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
    const warm  = Math.random() < 0.15;
    const tint  = warm ? '255,230,180' : '0,255,255';
    const baseA = 0.2 + Math.random() * 0.15;

    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowRadius);
    grd.addColorStop(0, `rgba(${tint},${baseA})`);
    grd.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2 * SCALE, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

  // ---- WIDGETS [ONLY THIS PART IS VISUALLY CHANGED] ----
  if (widgetsAnim > 0) {
    widgets.forEach(w => {
      const r = WIDGET_R * w.k * widgetsAnim;
      const px = cx + Math.cos(w.ang) * r;
      const py = cy + Math.sin(w.ang) * r;
      w.screenX = px; w.screenY = py;

      // Hover effect
      const isHovered = hoveredWidget === w.type;
      const pulse = isHovered ? 1 + 0.08 * Math.sin(performance.now()/200) : 1;
      const scale = isHovered ? 1.15 * pulse : 1.0;

      ctx.save();
      ctx.shadowBlur = isHovered ? 70 : 38;
      ctx.shadowColor = isHovered ? "#0ff" : "#0bf";
      const grad = ctx.createRadialGradient(
        px - BTN_R * scale * 0.35,
        py - BTN_R * scale * 0.35,
        BTN_R * scale * 0.3,
        px, py, BTN_R * scale
      );
      grad.addColorStop(0, "#00d4ff");
      grad.addColorStop(1, "#007fb3");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, BTN_R * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let label = w.type.toUpperCase();
      let maxWidth = BTN_R * scale * 1.5;
      let fontSize = 1.3 * 16 * scale;
      do {
        ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif` ;
        if (ctx.measureText(label).width <= maxWidth) break; fontSize -= 1;
      } while (fontSize > 8 * scale);
      ctx.fillText(label, px, py);
      ctx.restore();
    });
  }

  function drawGlowDot(cx_, cy_, size, baseColor, highlightColor, glow = 1) {
    const grad = ctx.createRadialGradient(cx_, cy_, 0, cx_, cy_, size * 1.7);
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(0.5, baseColor.replace('1)', '0.55)'));
    grad.addColorStop(1, baseColor.replace('1)', '0.04)'));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = size * 2 * glow;
    ctx.shadowColor = highlightColor;
    ctx.beginPath();
    ctx.arc(cx_, cy_, size, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.93;
    ctx.fill();
    ctx.restore();
  }

  // HOUR hand: Outer ring
  {
    const hourAng = (now.getHours() % 12 + now.getMinutes() / 60) * Math.PI * 2 / 12 - Math.PI / 2;
    const hourR = TICK_R * (1 - burst);
    const hx = cx + Math.cos(hourAng) * hourR;
    const hy = cy + Math.sin(hourAng) * hourR;
    drawGlowDot(hx, hy, 10 * SCALE, "rgba(0,255,255,1)", "#abebff", 1.2);
  }
  // MINUTE hand: Middle ring
  {
    const midR = RING_INNER + (TICK_R - RING_INNER) / 2;
    const minAng = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    const mx = cx + Math.cos(minAng) * midR * (1 - burst);
    const my = cy + Math.sin(minAng) * midR * (1 - burst);
    drawGlowDot(mx, my, 8 * SCALE, "rgba(0,255,255,1)", "#fff", 1.1);
  }
  // SECOND hand: Inner ring, with smooth tail along the seconds ring
  const rolexSecR = (RING_INNER + 2) * (1 - burst);
  for (let t = 0; t < 60; t++) {
    const ang = (t / 60) * Math.PI * 2 - Math.PI / 2;
    const sx = cx + Math.cos(ang) * rolexSecR;
    const sy = cy + Math.sin(ang) * rolexSecR;
    let rDot = 1.5 * SCALE;
    let color = 'rgba(255, 255, 255, 1)';
    let blur = 0;
    let alpha = 0.95;
    if (t === Math.floor(now.getSeconds())) {
      rDot = 2.8 * SCALE;
      color = "#fff";
      blur = 32;
      alpha = 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, rDot, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = blur;
      ctx.shadowColor = "#fff";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(sx, sy, rDot * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, rDot, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(draw);
}
draw(last);

function setButton(label) {
  centerBtn.textContent = label;
}

// ---- Tabs at Top (with animation in/out)
function showNewsTabsAtTop() {
  const existing = document.querySelector('.news-float-tabs');
  if (existing) {
    existing.querySelectorAll('.news-float-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });
    return;
  }
  const { left, top, width, height } = centerBtn.getBoundingClientRect();
  const baseX = left + width  / 2;
  const baseY = top  + height / 2;
  const tabBar = document.createElement('div');
  tabBar.className = 'news-float-tabs';
  tabBar.style.left      = `${baseX}px`;
  tabBar.style.top       = `${baseY}px`;
  tabBar.style.opacity   = '0';
  tabBar.style.transform = 'none';
  tabBar.innerHTML = NEWS_TABS.map(t =>
    `<button class="news-float-tab${t.key === activeTab ? ' active' : ''}"
            data-tab="${t.key}">${t.label}</button>`
  ).join('');
  document.body.appendChild(tabBar);
  requestAnimationFrame(() => {
    tabBar.style.transition = 'all 0.6s cubic-bezier(.19,1,.22,1)';
    tabBar.style.left      = '50%';
    tabBar.style.top       = '40px';
    tabBar.style.opacity   = '1';
    tabBar.style.transform = 'translateX(-50%)';
    tabBar.classList.add('open');
    tabBar.querySelectorAll('.news-float-tab').forEach(btn => {
      btn.addEventListener('click', ev => {
        ev.stopPropagation();
        const key = btn.dataset.tab;
        if (activeTab !== key) {
          activeTab = key;
          fetchNewsAndShow(key);
          tabBar.querySelectorAll('.news-float-tab').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === activeTab)
          );
        }
      });
    });
  });
}
function hideNewsTabsAtTop() {
  const tabBar = document.querySelector('.news-float-tabs');
  if (tabBar) {
    const newsButtonRect = centerBtn.getBoundingClientRect();
    const baseX = newsButtonRect.left + newsButtonRect.width/2;
    const baseY = newsButtonRect.top + newsButtonRect.height/2;
    tabBar.style.transition = "all 0.42s cubic-bezier(.6,-0.28,.74,.05)";
    tabBar.style.left = baseX + "px";
    tabBar.style.top = baseY + "px";
    tabBar.style.opacity = "0";
    tabBar.style.transform = "none";
    setTimeout(() => tabBar.remove(), 400);
  }
}
function animateNewsCardsIn(cards, baseX, baseY, cardW, cardH) {
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.style.transition = "all 0.4s cubic-bezier(.6,-0.28,.74,.05)";
      card.style.left = (baseX - cardW / 2) + "px";
      card.style.top = (baseY - cardH / 2) + "px";
      card.style.opacity = "0";
      setTimeout(() => card.remove(), 400);
    }, i * 20);
  });
}
function clearOldNewsCards() {
  const newsButtonRect = centerBtn.getBoundingClientRect();
  const baseX = newsButtonRect.left + newsButtonRect.width/2;
  const baseY = newsButtonRect.top + newsButtonRect.height/2;
  const cardW = 220, cardH = 155;
  const cards = Array.from(document.querySelectorAll('.news-float-card'));
  if (cards.length) {
    animateNewsCardsIn(cards, baseX, baseY, cardW, cardH);
  }
}
// Use these new positions:
const positions = [
  // Row 1 (top) - 5 cards
  [ [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2] ],
  // Row 2 (middle) - 2 left, center, 2 right
  [ [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0] ],
  // Row 3 (bottom) - centered under button: prev, news, next
  [ [-1, 2], [0, 2], [1, 2] ]
];

// Y offset factors for each row (tightens vertical layout!)
const rowYFactors = [-1.13, 0, 1.13]; // tweak to taste

function highlightActiveTab() {
  const tabBar = document.querySelector('.news-float-tabs');
  if (tabBar) {
    tabBar.querySelectorAll('.news-float-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });
  }
}

function fetchNewsAndShow(tabKey = "uk", page = 1) {
  activeTab = tabKey;
  let currentPage = page || 1;
  const tabObj = NEWS_TABS.find(t => t.key === tabKey) || NEWS_TABS[0];
  let url = `http://localhost:3001/api/news?pageSize=11&page=${currentPage}&`;
  if (tabObj.source) url += `sources=${tabObj.source}`;
  else url += `country=gb`;
  if (tabObj.category) url += `&category=${tabObj.category}`;
  
  clearOldNewsCards();
  showNewsTabsAtTop();
  highlightActiveTab();   // Immediately highlight active tab
  
  centerBtn.textContent = "NEWS (Loading...)";
  fetch(url)
    .then(res => res.json())
    .then(data => {
      centerBtn.textContent = "NEWS";
      if (!data.articles || !data.articles.length) {
        centerBtn.textContent = "No News";
        return;
      }
      const newsButtonRect = centerBtn.getBoundingClientRect();
      const baseX = newsButtonRect.left + newsButtonRect.width / 2;
      const baseY = newsButtonRect.top + newsButtonRect.height / 2;
      const cardW = 220, cardH = 145;
      const pad = 28;    // spacing for top/mid rows
      const padBottom = 42; // spacing for bottom row

      let articleIdx = 0, cards = [];

      // ROW 1: 5 cards
      positions[0].forEach(([gx, gy]) => {
        let el = document.createElement("div");
        el.className = "news-float-card";
        el.style.left = (baseX - cardW/2) + "px";
        el.style.top = (baseY - cardH/2) + "px";
        el.style.opacity = "0";
        el.style.visibility = "visible";
        if (articleIdx < data.articles.length) {
          let a = data.articles[articleIdx++];
          el.innerHTML = `
            <a href="${a.url}" target="_blank" class="news-link-img" title="${a.title.replace(/"/g, '&quot;')}">
              ${a.urlToImage ? `<img src="${a.urlToImage}" alt="${a.title.replace(/"/g, '&quot;')}">` : ""}
              <div class="news-float-headline"><span>${a.title}</span></div>
            </a>
          `;
        } else {
          el.style.visibility = "hidden";
        }
        document.body.appendChild(el);
        cards.push({ card: el, gx, gy, row: 0 });
      });

      // ROW 2: 5 slots (center left empty for NEWS button)
      positions[1].forEach(([gx, gy], idx) => {
        let el = document.createElement("div");
        el.className = "news-float-card";
        el.style.left = (baseX - cardW/2) + "px";
        el.style.top = (baseY - cardH/2) + "px";
        el.style.opacity = "0";
        el.style.visibility = "visible";
        // Leave center slot blank
        if (idx === 2) {
          el.style.pointerEvents = "none";
          el.style.background = "none";
          el.style.boxShadow = "none";
          el.style.visibility = "hidden";
        } else if (articleIdx < data.articles.length) {
          let a = data.articles[articleIdx++];
          el.innerHTML = `
            <a href="${a.url}" target="_blank" class="news-link-img" title="${a.title.replace(/"/g, '&quot;')}">
              ${a.urlToImage ? `<img src="${a.urlToImage}" alt="${a.title.replace(/"/g, '&quot;')}">` : ""}
              <div class="news-float-headline"><span>${a.title}</span></div>
            </a>
          `;
        } else {
          el.style.visibility = "hidden";
        }
        document.body.appendChild(el);
        cards.push({ card: el, gx, gy, row: 1, idx });
      });

      // ROW 3: prev, news, next (gx = -1, 0, 1)
      ["prev", "news", "next"].forEach((type, idx) => {
        let el = document.createElement("div");
        el.className = "news-float-card";
        el.style.left = (baseX - cardW/2) + "px";
        el.style.top = (baseY - cardH/2) + "px";
        el.style.opacity = "0";
        el.style.visibility = "visible";
        if (type === "prev") {
          el.innerHTML = `<button class="news-nav-arrow" data-dir="prev">&#8592;</button>`;
        } else if (type === "news" && articleIdx < data.articles.length) {
          let a = data.articles[articleIdx++];
          el.innerHTML = `
            <a href="${a.url}" target="_blank" class="news-link-img" title="${a.title.replace(/"/g, '&quot;')}">
              ${a.urlToImage ? `<img src="${a.urlToImage}" alt="${a.title.replace(/"/g, '&quot;')}">` : ""}
              <div class="news-float-headline"><span>${a.title}</span></div>
            </a>
          `;
        } else if (type === "next") {
          el.innerHTML = `<button class="news-nav-arrow" data-dir="next">&#8594;</button>`;
        } else {
          el.style.visibility = "hidden";
        }
        document.body.appendChild(el);
        cards.push({ card: el, gx: idx - 1, gy: 2, row: 2, idx });
      });

      // Animate in with improved vertical centering!
      setTimeout(() => {
        cards.forEach(({ card, gx, gy, row }) => {
          let hpad = (row === 2) ? (cardW + padBottom) : (cardW + pad);
          let yMultiplier = rowYFactors[row];
          card.style.transition = "all 0.55s cubic-bezier(.19,1,.22,1)";
          card.style.left = (baseX + gx * hpad - cardW / 2) + "px";
          card.style.top = (baseY + yMultiplier * (cardH + pad) - cardH / 2) + "px";
          card.style.opacity = "1";
        });
      }, 20);

      // Arrows: cycle tabs instead of pages
      document.querySelectorAll(".news-nav-arrow").forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          let dir = btn.dataset.dir;
          let tabIndex = NEWS_TABS.findIndex(t => t.key === activeTab);
          if (dir === "prev") {
            tabIndex = (tabIndex - 1 + NEWS_TABS.length) % NEWS_TABS.length;
          } else if (dir === "next") {
            tabIndex = (tabIndex + 1) % NEWS_TABS.length;
          }
          const nextTabKey = NEWS_TABS[tabIndex].key;
          fetchNewsAndShow(nextTabKey, 1); // reset to page 1 when changing tabs
        };
      });

    });
}

function fetchCryptoAndShow() {
  clearOldNewsCards();
  centerBtn.textContent = "CRYPTO (Loading...)";

  fetch('http://localhost:3001/api/crypto')
    .then(res => res.json())
    .then(coins => {
      centerBtn.textContent = "CRYPTO";
      if (!coins || !coins.length) {
        centerBtn.textContent = "No Crypto Data";
        return;
      }
      const btnRect = centerBtn.getBoundingClientRect();
      const baseX = btnRect.left + btnRect.width / 2;
      const baseY = btnRect.top + btnRect.height / 2;
      const cardW = 220, cardH = 145, pad = 28;

      const positions = [
        [[-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2]],
        [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]],
        [[-1, 2], [0, 2], [1, 2]]
      ];

      let coinIdx = 0, cards = [];

      positions.flat().forEach(([gx, gy]) => {
        let el = document.createElement("div");
        el.className = "news-float-card";
        el.style.left = (baseX - cardW / 2) + "px";
        el.style.top = (baseY - cardH / 2) + "px";
        el.style.opacity = "0";

        if (coinIdx < coins.length) {
          let c = coins[coinIdx++];
          el.innerHTML = `
            <div class="news-link-img">
              <div class="news-float-headline"><span>${c.name} — $${c.current_price.toLocaleString()} (${c.symbol.toUpperCase()})</span></div>
            </div>
          `;
        } else {
          el.style.visibility = "hidden";
        }

        document.body.appendChild(el);
        cards.push({ card: el, gx, gy });
      });

      // Animate in
      setTimeout(() => {
        cards.forEach(({ card, gx, gy }) => {
          card.style.transition = "all 0.55s cubic-bezier(.19,1,.22,1)";
          card.style.left = (baseX + gx * (cardW + pad) - cardW / 2) + "px";
          card.style.top = (baseY + gy * (cardH + pad) - cardH / 2) + "px";
          card.style.opacity = "1";
        });
      }, 20);
    });
}

// When closing crypto overlay (could be on a click, or when you press ENTER etc)
function closeCryptoOverlay() {
  const overlay = document.getElementById('crypto-overlay');
  overlay.style.display = "none";
  overlay.classList.remove("active");
  document.getElementById('crypto-scroll').innerHTML = "";
}

// Simple chart using canvas API
function drawCoinChart(canvasId, prices) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !prices || prices.length === 0) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  
  // Find min/max for scaling
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  ctx.beginPath();
  prices.forEach((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - minPrice) / range) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}


// ---- Button click logic ----
centerBtn.textContent = "ENTER";
centerBtn.onclick = function () {
  if (!entered) {
    spawnVoidStars();
    voidBurst = 0; voidBurstDir = 1;
    burstDir = 1; entered = true; widgetsOut = true;
    setButton("DONE");
    clearOldNewsCards();
    hideNewsTabsAtTop();
  } else if (newsOpen) {
    newsOpen = false;
    clearOldNewsCards();
    hideNewsTabsAtTop();
    setTimeout(() => { widgetsOut = true; setButton("DONE"); }, 300);
  } else {
    voidBurstDir = -1;
    burstDir = -1; entered = false; widgetsOut = false;
    setButton("ENTER");
    clearOldNewsCards();
    hideNewsTabsAtTop();
  }
  if (voidBurst === 0 && voidBurstDir === 0 && voidStars.length > 0) {
  voidStars.length = 0;
}
};

// ---- Widget (NEWS) click
canvas.addEventListener('pointerdown', e => {
  if (!entered || widgetsAnim < 0.99) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const hit = widgets.find(w => Math.hypot(x - w.screenX, y - w.screenY) <= BTN_R);
  if (hit?.type === 'news' && !newsOpen) {
    widgetsOut = false;
    setTimeout(() => {
      newsOpen = true;
      setButton("NEWS");
      fetchNewsAndShow();
    }, 350);
  } else if (newsOpen) {
    newsOpen = false;
    clearOldNewsCards();
    hideNewsTabsAtTop();
    setTimeout(() => { widgetsOut = true; setButton("DONE"); }, 300);
  } else if (hit?.type === 'crypto') {
    widgetsOut = false;
    setTimeout(() => {
      setButton("CRYPTO");
      fetchCryptoAndShow();
    }, 350);
  } else if (hit?.type === 'weather') {
    setButton("DONE");
    widgetsOut = true;
    clearOldNewsCards();
    hideNewsTabsAtTop();
  }
});

