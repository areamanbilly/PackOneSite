/* ── Camping Background Canvas ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Stars */
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.65,
    r: Math.random() * 1.6 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * 0.008 + 0.003,
    phase: Math.random() * Math.PI * 2,
  }));

  /* Fireflies */
  const flies = Array.from({ length: 28 }, () => ({
    x: Math.random() * window.innerWidth,
    y: window.innerHeight * 0.45 + Math.random() * window.innerHeight * 0.4,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random(),
    fade: Math.random() > 0.5 ? 0.012 : -0.012,
  }));

  /* Campfire particles */
  const embers = Array.from({ length: 60 }, () => makeEmber());

  function makeEmber() {
    return {
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 18,
      y: window.innerHeight,
      vx: (Math.random() - 0.5) * 1.1,
      vy: -(Math.random() * 2.8 + 1.2),
      life: 1,
      decay: Math.random() * 0.012 + 0.007,
      size: Math.random() * 4 + 1,
      hue: Math.random() * 40 + 10,
    };
  }

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let t = 0;

  function draw() {
    t += 0.016;
    const W = canvas.width;
    const H = canvas.height;

    /* Sky gradient — shifts from deep night (top) to warm glow near ground */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#04111f');
    sky.addColorStop(0.55, '#091e35');
    sky.addColorStop(0.78, '#1a2e18');
    sky.addColorStop(1, '#0d1a0c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* Stars */
    stars.forEach(s => {
      const pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,230,${pulse * 0.9})`;
      ctx.fill();
    });

    /* Moon */
    const moonX = W * 0.82;
    const moonY = H * 0.12;
    const glow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 48);
    glow.addColorStop(0, 'rgba(255,250,220,.18)');
    glow.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,252,230,.92)';
    ctx.fill();

    /* Tree silhouettes */
    drawTrees(ctx, W, H);

    /* Fireflies */
    flies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.alpha += f.fade;
      if (f.alpha > 1 || f.alpha < 0) { f.fade *= -1; }
      if (f.x < 0 || f.x > W) f.vx *= -1;
      if (f.y < H * 0.42 || f.y > H * 0.97) f.vy *= -1;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 6);
      g.addColorStop(0, `rgba(200,255,140,${Math.max(0, f.alpha)})`);
      g.addColorStop(1, 'rgba(200,255,140,0)');
      ctx.beginPath();
      ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* Campfire glow */
    const fireX = W * 0.5;
    const fireY = H * 0.91;
    const flicker = 0.7 + 0.3 * Math.sin(t * 7) * Math.cos(t * 3.7);
    const fireGlow = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, 160 * flicker);
    fireGlow.addColorStop(0, `rgba(255,160,30,${0.22 * flicker})`);
    fireGlow.addColorStop(0.5, `rgba(255,80,10,${0.10 * flicker})`);
    fireGlow.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.ellipse(fireX, fireY, 160 * flicker, 90 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Embers */
    embers.forEach((e, i) => {
      e.x += e.vx;
      e.y += e.vy;
      e.life -= e.decay;
      if (e.life <= 0) {
        embers[i] = makeEmber();
        embers[i].x = fireX + (Math.random() - 0.5) * 22;
        embers[i].y = fireY - 10;
        return;
      }
      const a = e.life * 0.85;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue},100%,65%,${a})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  function drawTrees(ctx, W, H) {
    ctx.fillStyle = '#04100a';

    function pine(x, h, spread) {
      const tiers = 5;
      const base = H * 0.97;
      ctx.beginPath();
      ctx.moveTo(x, base - h);
      for (let i = 0; i < tiers; i++) {
        const ty = base - h + (h * 0.82 * i) / tiers;
        const tw = spread * (0.25 + 0.75 * (i / (tiers - 1)));
        ctx.lineTo(x + tw, ty + h * 0.18);
        ctx.lineTo(x, ty - h * 0.04 * (tiers - i));
        ctx.lineTo(x - tw, ty + h * 0.18);
      }
      ctx.lineTo(x, base - h);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x - spread * 0.06, base - h * 0.22, spread * 0.12, h * 0.22);
    }

    const treeData = [
      [0.01, 0.38, 0.055], [0.06, 0.30, 0.045], [0.12, 0.42, 0.06],
      [0.17, 0.28, 0.038], [0.22, 0.36, 0.05],
      [0.72, 0.34, 0.048], [0.77, 0.44, 0.062], [0.83, 0.29, 0.040],
      [0.88, 0.38, 0.054], [0.94, 0.32, 0.046], [0.99, 0.41, 0.058],
    ];
    treeData.forEach(([fx, fh, fs]) => pine(fx * W, fh * H, fs * W));
  }

  draw();
})();

/* ── Scroll reveal animations ── */
(function () {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => io.observe(el));
})();

/* ── Parallax hero ── */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.backgroundPositionY = `calc(50% + ${y * 0.35}px)`;
  }, { passive: true });
})();

/* ── Counter animation ── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      let start = 0;
      const step = target / 50;
      const tick = () => {
        start = Math.min(start + step, target);
        el.textContent = Math.round(start) + (el.dataset.suffix || '');
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

/* ── Badge hover ripple ── */
document.querySelectorAll('.badge').forEach(b => {
  b.addEventListener('mouseenter', () => b.classList.add('badge-pop'));
  b.addEventListener('animationend', () => b.classList.remove('badge-pop'));
});

/* ── Photo grid rotator ── */
(function () {
  const pool = [
    { src: 'images/IMG_0239.jpeg',         caption: 'Outdoor adventures on the water.' },
    { src: 'images/IMG_1563.jpg',          caption: 'Campfires, outdoor skills, and friendship.' },
    { src: 'images/IMG_1913.jpg',          caption: 'Hands-on creativity and problem solving.' },
    { src: 'images/IMG_3567.jpeg',         caption: 'Field trips that spark curiosity.' },
    { src: 'images/IMG_3973.jpeg',         caption: 'Service projects that help our neighbors.' },
    { src: 'images/IMG_3941.jpeg',         caption: 'Pinewood Derby — build, race, repeat.' },
    { src: 'images/photo_woodworking.jpeg',caption: 'Real skills, real tools, real confidence.' },
    { src: 'images/photo_ceremony.jpg',    caption: 'Scouts serving their community with pride.' },
    { src: 'images/photo_campfire2.jpeg',  caption: 'Evenings around the fire with friends.' },
    { src: 'images/photo_canoe.jpg',       caption: 'Paddling adventures on the water.' },
    { src: 'images/photo_hiking.jpg',      caption: 'Exploring the outdoors together.' },
    { src: 'images/photo_pinewood.jpeg',   caption: 'The thrill of race day!' },
    { src: 'images/photo_tent.jpeg',       caption: 'Camping memories that last a lifetime.' },
  ];

  const intervals = [13000, 17750, 11500, 20750, 15000];

  function pickNext(current) {
    const choices = pool.filter(p => p.src !== current);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function startSlot(figure, intervalMs) {
    const img = figure.querySelector('img');
    const cap = figure.querySelector('figcaption');

    const initial = pool[Math.floor(Math.random() * pool.length)];
    img.src = initial.src;
    img.alt = initial.caption;
    if (cap) cap.textContent = initial.caption;
    let currentSrc = initial.src;

    setInterval(() => {
      const next = pickNext(currentSrc);
      img.classList.add('fading');
      setTimeout(() => {
        img.src = next.src;
        img.alt = next.caption;
        if (cap) cap.textContent = next.caption;
        currentSrc = next.src;
        img.classList.remove('fading');
      }, 900);
    }, intervalMs);
  }

  const slots = document.querySelectorAll('.photo-slot');
  slots.forEach((slot, i) => startSlot(slot, intervals[i] || 5000 + i * 1300));
})();
