/* ==========================================================================
   EMERSON GUIMARÃES // PORTFOLIO — main.js
   Vanilla JS, sem dependências. Módulos independentes, cada um em uma IIFE.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------------------------------------------------
     1. BOOT SEQUENCE (MAGI)
     ------------------------------------------------------------------------ */
  const Boot = (() => {
    const el = $('#boot');
    if (!el) return { done: Promise.resolve() };

    const seen = (() => { try { return sessionStorage.getItem('magi-boot'); } catch { return null; } })();
    if (REDUCED || seen) {
      el.hidden = true;
      return { done: Promise.resolve() };
    }

    const log = $('#bootLog');
    const bar = $('#bootBar');
    const units = $$('.magi-unit');
    let finished = false;
    let resolveDone;
    const done = new Promise((r) => (resolveDone = r));

    const lines = [
      ['MAGI SYSTEM v3.0 — inicializando núcleo...', ''],
      ['Carregando perfil: EMERSON_GUIMARAES.dat', ''],
      ['MELCHIOR-1 .......... OK', 'ok'],
      ['BALTHASAR-2 ......... OK', 'ok'],
      ['CASPAR-3 ............ OK', 'ok'],
      ['Sincronizando repositórios GitHub ....... 16 projetos', ''],
      ['Nível de acesso: COORDENAÇÃO // Belém-PA', 'warn'],
      ['Sistema operacional. Bem-vindo.', 'ok'],
    ];

    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('magi-boot', '1'); } catch { /* ignore */ }
      el.classList.add('is-done');
      setTimeout(() => { el.hidden = true; }, 650);
      resolveDone();
    };

    $('#bootSkip').addEventListener('click', finish);

    (async () => {
      const total = lines.length;
      for (let i = 0; i < total && !finished; i++) {
        const [txt, cls] = lines[i];
        const d = document.createElement('div');
        d.textContent = '> ' + txt;
        if (cls) d.className = cls;
        log.appendChild(d);
        if (i === 2) units[0].classList.add('is-on');
        if (i === 3) units[1].classList.add('is-on');
        if (i === 4) units[2].classList.add('is-on');
        bar.style.width = ((i + 1) / total) * 100 + '%';
        await sleep(i < 2 ? 260 : 190);
      }
      await sleep(380);
      finish();
    })();

    return { done };
  })();

  /* ------------------------------------------------------------------------
     2. CANVAS DE FUNDO — grade em perspectiva + partículas com conexões
     ------------------------------------------------------------------------ */
  (() => {
    const cv = $('#bg');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let particles = [];
    let running = true;
    let t = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor((W * H) / 14000));
      particles = Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r: rand(0.6, 1.8),
        c: Math.random() < 0.82 ? '255,23,68' : '0,229,255',
      }));
    };

    const drawGrid = () => {
      // Grade em perspectiva na metade inferior, deslocando para o observador
      const horizon = H * 0.62;
      const speed = REDUCED ? 0 : (t * 0.35) % 40;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,23,68,0.07)';
      ctx.lineWidth = 1;
      // linhas horizontais (com perspectiva exponencial)
      for (let i = 0; i < 26; i++) {
        const p = (i * 40 + speed) / (26 * 40);
        const y = horizon + Math.pow(p, 2.2) * (H - horizon);
        ctx.globalAlpha = 0.15 + p * 0.85;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // linhas verticais convergindo para o ponto de fuga
      ctx.globalAlpha = 0.6;
      const vpX = W / 2 + (mouse.x > 0 ? (mouse.x - W / 2) * 0.05 : 0);
      for (let i = -14; i <= 14; i++) {
        const xBottom = W / 2 + i * (W / 12);
        ctx.beginPath(); ctx.moveTo(vpX, horizon); ctx.lineTo(xBottom, H); ctx.stroke();
      }
      // linha do horizonte com brilho
      const g = ctx.createLinearGradient(0, horizon, W, horizon);
      g.addColorStop(0, 'rgba(255,23,68,0)');
      g.addColorStop(0.5, 'rgba(255,23,68,0.35)');
      g.addColorStop(1, 'rgba(255,23,68,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(W, horizon); ctx.stroke();
      ctx.restore();
    };

    const drawParticles = () => {
      const LINK = 110;
      for (const p of particles) {
        if (!REDUCED) {
          p.x += p.vx; p.y += p.vy;
          // atração leve pelo mouse
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180) { p.x += dx * 0.0025; p.y += dy * 0.0025; }
        }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.fillStyle = `rgba(${p.c},0.7)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${a.c},${(1 - d / LINK) * 0.22})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // ligação ao mouse
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 160) {
          ctx.strokeStyle = `rgba(0,229,255,${(1 - dm / 160) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    };

    const frame = () => {
      if (!running) return;
      t++;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawParticles();
      if (REDUCED) return; // desenha um frame estático apenas
      requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { mouse.tx = -9999; mouse.ty = -9999; });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    resize();
    frame();
  })();

  /* ------------------------------------------------------------------------
     3. CURSOR CUSTOMIZADO
     ------------------------------------------------------------------------ */
  (() => {
    if (!FINE_POINTER || REDUCED) return;
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('has-cursor');
    let x = 0, y = 0, rx = 0, ry = 0;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }, { passive: true });
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = 'a, button, .card, .filter, input, [data-hover]';
    document.addEventListener('pointerover', (e) => { if (e.target.closest(hoverables)) ring.classList.add('is-hover'); });
    document.addEventListener('pointerout', (e) => { if (e.target.closest(hoverables)) ring.classList.remove('is-hover'); });
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
  })();

  /* ------------------------------------------------------------------------
     4. NAV — progresso, esconder ao rolar, seção ativa, menu mobile
     ------------------------------------------------------------------------ */
  (() => {
    const nav = $('#nav'), prog = $('#navProgress'), links = $$('#navLinks a');
    const burger = $('#burger'), navLinks = $('#navLinks'), backTop = $('#backTop');
    let lastY = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 300 && !navLinks.classList.contains('is-open'));
      backTop.classList.toggle('is-visible', y > 600);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));

    const closeMenu = () => { navLinks.classList.remove('is-open'); burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    links.forEach((a) => a.addEventListener('click', closeMenu));
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
  })();

  /* ------------------------------------------------------------------------
     5. RELÓGIO (Belém, UTC-3) + ano + contagem de repositórios
     ------------------------------------------------------------------------ */
  (() => {
    const clock = $('#clock');
    const fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Belem', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { if (clock) clock.textContent = fmt.format(new Date()) + ' BEL'; };
    tick(); setInterval(tick, 1000);
    const yr = $('#year'); if (yr) yr.textContent = String(new Date().getFullYear());

    const rc = $('#repoCount');
    if (rc && navigator.onLine) {
      fetch('https://api.github.com/users/Gor0d', { headers: { Accept: 'application/vnd.github+json' } })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j && j.public_repos) rc.textContent = String(j.public_repos); })
        .catch(() => { /* mantém fallback */ });
    }
  })();

  /* ------------------------------------------------------------------------
     6. SCRAMBLE / DECODE de texto (papel rotativo no hero)
     ------------------------------------------------------------------------ */
  const scrambleTo = (el, text, { chars = '!<>-_\\/[]{}—=+*^?#01', speed = 28 } = {}) => new Promise((resolve) => {
    if (REDUCED) { el.textContent = text; resolve(); return; }
    const from = el.textContent;
    const len = Math.max(from.length, text.length);
    const queue = [];
    for (let i = 0; i < len; i++) {
      const start = Math.floor(Math.random() * 18);
      queue.push({ from: from[i] || '', to: text[i] || '', start, end: start + Math.floor(Math.random() * 14) + 4 });
    }
    let frame = 0;
    const step = () => {
      let out = '', complete = 0;
      for (const q of queue) {
        if (frame >= q.end) { complete++; out += q.to; }
        else if (frame >= q.start) { out += `<span style="opacity:.45">${chars[Math.floor(Math.random() * chars.length)]}</span>`; }
        else out += q.from;
      }
      el.innerHTML = out;
      if (complete === queue.length) { resolve(); return; }
      frame++;
      setTimeout(() => requestAnimationFrame(step), 1000 / speed);
    };
    step();
  });

  (() => {
    const el = $('#roleScramble');
    if (!el) return;
    let roles = [];
    try { roles = JSON.parse(el.dataset.roles.replace(/&amp;/g, '&')); } catch { roles = [el.textContent]; }
    let i = 0;
    const cycle = async () => {
      await sleep(3400);
      i = (i + 1) % roles.length;
      await scrambleTo(el, roles[i]);
      cycle();
    };
    Boot.done.then(cycle);
  })();

  /* ------------------------------------------------------------------------
     7. TERMINAL DO HERO — digitação real, linha a linha
     ------------------------------------------------------------------------ */
  (() => {
    const body = $('#heroTerm');
    if (!body) return;
    const script = [
      { cmd: 'whoami', out: 'Technology Leader | <span class="t-hl">Applied AI</span> | Automation | Data | Healthcare' },
      { cmd: 'cat stack.json', out: '{ Leadership, Python, SQL/Oracle, APIs, <span class="t-cy">Agents & RAG</span>, BI, <span class="t-hl">Automation</span> }' },
      { cmd: 'impact --year 2026', out: '<span class="t-hl">25 sistemas</span> · 12 painéis BI · 5.944 chamados · R$ 1,93M em valor equivalente de mercado' },
      { cmd: 'magi --status', out: '<span class="t-cy">MELCHIOR</span> OK · <span class="t-cy">BALTHASAR</span> OK · <span class="t-cy">CASPAR</span> OK — <span class="t-hl">disponível para novos projetos</span>' },
    ];

    const line = (html) => { const d = document.createElement('div'); d.className = 't-line'; d.innerHTML = html; body.appendChild(d); return d; };

    const run = async () => {
      if (REDUCED) {
        script.forEach((s) => { line(`<span class="t-prompt">❯</span><span class="t-cmd">${s.cmd}</span>`); line(`<span class="t-out">${s.out}</span>`); });
        line('<span class="t-prompt">❯</span><span class="caret"></span>');
        return;
      }
      await sleep(300);
      for (const s of script) {
        const l = line('<span class="t-prompt">❯</span><span class="t-cmd"></span><span class="caret"></span>');
        const cmdEl = l.querySelector('.t-cmd');
        for (const ch of s.cmd) { cmdEl.textContent += ch; await sleep(rand(35, 85)); }
        await sleep(220);
        l.querySelector('.caret').remove();
        line(`<span class="t-out">${s.out}</span>`);
        await sleep(380);
      }
      line('<span class="t-prompt">❯</span><span class="caret"></span>');
    };
    Boot.done.then(run);
  })();

  /* ------------------------------------------------------------------------
     8. REVEAL + CONTADORES + SEGMENTOS DE SKILL
     ------------------------------------------------------------------------ */
  (() => {
    // constrói segmentos (5 barras) a partir de data-level
    $$('.seg').forEach((seg) => {
      const lvl = Number(seg.dataset.level || 0);
      seg.innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
      seg.setAttribute('aria-label', `Nível ${lvl} de 5`);
    });

    const countUp = (el) => {
      const to = Number(el.dataset.to || 0);
      if (REDUCED) { el.textContent = to.toLocaleString('pt-BR'); return; }
      const dur = 1400, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        $$('.count', en.target).forEach((c) => { if (!c.dataset.done) { c.dataset.done = '1'; countUp(c); } });
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  })();

  /* ------------------------------------------------------------------------
     9. TILT 3D + brilho seguindo o mouse nos cards
     ------------------------------------------------------------------------ */
  (() => {
    if (!FINE_POINTER || REDUCED) return;
    $$('.tilt').forEach((card) => {
      const inner = $('.card-inner', card);
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const max = card.classList.contains('featured') ? 3 : 6;
          card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
          inner.style.setProperty('--mx', px * 100 + '%');
          inner.style.setProperty('--my', py * 100 + '%');
        });
      });
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); card.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------------------
     10. FILTROS DE PROJETOS
     ------------------------------------------------------------------------ */
  (() => {
    const grid = $('#projectsGrid');
    const btns = $$('.filter'), cards = $$('.card', grid).sort((a, b) => Number(a.dataset.priority || 99) - Number(b.dataset.priority || 99));
    if (!btns.length) return;
    cards.forEach((card) => grid.appendChild(card));
    // contadores nos botões
    btns.forEach((b) => {
      const f = b.dataset.filter;
      const n = f === 'all' ? cards.length : cards.filter((c) => c.dataset.cat.split(' ').includes(f)).length;
      const s = document.createElement('span'); s.className = 'n'; s.textContent = String(n).padStart(2, '0');
      b.appendChild(s);
    });
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const f = b.dataset.filter;
      let i = 0;
      cards.forEach((c) => {
        const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
        if (show) {
          c.classList.remove('is-hidden');
          c.classList.remove('is-visible');
          c.style.setProperty('--d', (i++ * 0.05) + 's');
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('is-visible')));
        } else {
          c.classList.add('is-hidden');
        }
      });
    }));
  })();

  /* ------------------------------------------------------------------------
     11. BOTÕES MAGNÉTICOS
     ------------------------------------------------------------------------ */
  (() => {
    if (!FINE_POINTER || REDUCED) return;
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------------------
     12. GLITCH — aleatório no hero + ao passar o mouse
     ------------------------------------------------------------------------ */
  (() => {
    if (REDUCED) return;
    const els = $$('.glitch');
    const fire = (el) => { el.classList.remove('is-glitching'); void el.offsetWidth; el.classList.add('is-glitching'); setTimeout(() => el.classList.remove('is-glitching'), 600); };
    els.forEach((el) => el.addEventListener('pointerenter', () => fire(el)));
    const loop = () => { setTimeout(() => { fire(els[Math.floor(Math.random() * els.length)]); loop(); }, rand(3500, 8000)); };
    Boot.done.then(loop);
  })();

  /* ------------------------------------------------------------------------
     13. COPIAR E-MAIL
     ------------------------------------------------------------------------ */
  (() => {
    const btn = $('#copyBtn');
    if (!btn) return;
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      try {
        await navigator.clipboard.writeText('emersongsguimaraes@gmail.com');
        btn.textContent = 'COPIADO ✓'; btn.classList.add('is-copied');
        setTimeout(() => { btn.textContent = 'COPIAR'; btn.classList.remove('is-copied'); }, 1800);
      } catch { btn.textContent = 'ERRO'; }
    });
  })();

  /* ------------------------------------------------------------------------
     14. TICKER — duplica o conteúdo para loop contínuo
     ------------------------------------------------------------------------ */
  (() => {
    const t = $('#ticker');
    if (t) t.innerHTML += t.innerHTML;
  })();

  /* ------------------------------------------------------------------------
     15. TERMINAL INTERATIVO (tecla ` ou botão TERMINAL)
     ------------------------------------------------------------------------ */
  (() => {
    const overlay = $('#termOverlay'), out = $('#termOut'), input = $('#termInput'), btn = $('#termBtn');
    if (!overlay) return;
    const history = [];
    let hIdx = -1;

    const print = (html) => { out.innerHTML += html + '\n'; out.scrollTop = out.scrollHeight; };
    const goto = (id) => { const s = $('#' + id); if (s) { close(); s.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); return true; } return false; };

    const projects = $$('#projectsGrid .card').map((c) => ({
      id: $('.card-id', c).textContent.trim().split(' ')[0],
      name: $('.card-name', c).childNodes[0].textContent.trim(),
      status: $('.badge', c).textContent.trim(),
      link: ($('.card-links a', c) || {}).href || '',
      priority: Number(c.dataset.priority || 99),
    })).sort((a, b) => a.priority - b.priority);

    const cmds = {
      help: () => print([
        '<span class="h">COMANDOS DISPONÍVEIS</span>',
        '  <span class="c">whoami</span>      quem sou',
        '  <span class="c">impact</span>       impacto de 2026',
        '  <span class="c">projects</span>    lista os projetos do portfólio',
        '  <span class="c">stack</span>       stack técnica resumida',
        '  <span class="c">experience</span>  experiência profissional',
        '  <span class="c">contact</span>     canais de contato',
        '  <span class="c">goto</span> &lt;seção&gt;  about | projects | skills | experience | education | contact',
        '  <span class="c">magi</span>        status do sistema',
        '  <span class="c">clear</span>       limpa a tela',
        '  <span class="c">exit</span>        fecha o terminal',
      ].join('\n')),
      whoami: () => print('<span class="y">Emerson Gabriel da Silva Guimarães</span> — Technology Leader | Applied AI | Automation | Data | Healthcare.\nCoordenador de Tecnologia da Informação @ Hospital Beneficente Portuguesa do Pará · Belém-PA.'),
      impact: () => print('<span class="y">2026:</span> 25 sistemas/módulos · 12 painéis de BI · 5.944 chamados de TI\n<span class="h">R$ 1,93M</span> em valor equivalente de mercado estimado · R$ 137,2 mil/ano em licenças evitadas.'),
      projects: () => print(projects.map((p) => `  <span class="c">${p.id}</span>  ${p.name.padEnd(36, ' ')} <span class="h">${p.status}</span>${p.link ? `  <a href="${p.link}" target="_blank" rel="noopener">↗</a>` : ''}`).join('\n')),
      stack: () => print('<span class="y">IA & Automação:</span> LLMs · Agents · RAG · MCP · OpenAI · Claude · Gemini\n<span class="y">Dados:</span> Python · SQL/Oracle · PL/SQL · Power BI · ETL/ELT\n<span class="y">Sistemas:</span> FastAPI · REST · Node · TypeScript · Next.js · Supabase · Docker\n<span class="y">HealthTech:</span> SoulMV/DBAMV · SUS · TISS · ANS · LGPD · liderança técnica'),
      experience: () => print('<span class="y">Atual:</span> Coordenador de Tecnologia da Informação @ Hospital Beneficente Portuguesa do Pará (abr/2026 → atual)\n<span class="y">Anterior:</span> Hospital Adventista de Belém (out/2024 → mar/2026)\n<span class="y">Anterior:</span> Hospital Beneficente Portuguesa (nov/2021 → out/2024)\n<span class="y">Anterior:</span> Hospital Maradei (ago/2016 → jun/2021)'),
      contact: () => print('  e-mail    <a href="mailto:emersongsguimaraes@gmail.com">emersongsguimaraes@gmail.com</a>\n  linkedin  <a href="https://linkedin.com/in/emersongsguimaraes" target="_blank" rel="noopener">/in/emersongsguimaraes</a>\n  github    <a href="https://github.com/Gor0d" target="_blank" rel="noopener">@Gor0d</a>'),
      magi: () => print('<span class="c">MELCHIOR-1</span> ... OK\n<span class="c">BALTHASAR-2</span> .. OK\n<span class="c">CASPAR-3</span> ..... OK\n<span class="h">Decisão unânime: aprovado.</span>'),
      goto: (arg) => { if (!arg || !goto(arg)) print(`<span class="e">seção não encontrada:</span> ${arg || '(vazio)'}`); },
      clear: () => { out.innerHTML = ''; },
      exit: () => close(),
      sudo: () => print('<span class="e">emerson is not in the sudoers file. This incident will be reported.</span>'),
      ls: () => print('about/  projects/  skills/  experience/  education/  contact/'),
    };

    const exec = (raw) => {
      const [c, ...rest] = raw.trim().split(/\s+/);
      if (!c) return;
      print(`<span class="e">❯</span> <span class="c">${raw}</span>`);
      const fn = cmds[c.toLowerCase()];
      if (fn) fn(rest.join(' '));
      else print(`<span class="e">comando não encontrado:</span> ${c}. Digite <span class="c">help</span>.`);
    };

    const open = () => {
      overlay.classList.add('is-open');
      if (!out.innerHTML) print('<span class="h">MAGI TERMINAL v3.0</span> — digite <span class="c">help</span> para começar.');
      setTimeout(() => input.focus(), 50);
    };
    const close = () => { overlay.classList.remove('is-open'); input.blur(); };

    btn && btn.addEventListener('click', open);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && document.activeElement !== input;
      if (e.key === '`' && !typing) { e.preventDefault(); overlay.classList.contains('is-open') ? close() : open(); }
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const v = input.value; if (v.trim()) { history.unshift(v); hIdx = -1; } input.value = ''; exec(v); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (history.length) { hIdx = Math.min(hIdx + 1, history.length - 1); input.value = history[hIdx]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.max(hIdx - 1, -1); input.value = hIdx === -1 ? '' : history[hIdx]; }
    });
  })();

  /* ------------------------------------------------------------------------
     16. Console easter egg
     ------------------------------------------------------------------------ */
  console.log('%cMAGI SYSTEM %cv3.0 — CASPAR-3 online.\n%cCurioso? Aperte ` para abrir o terminal.', 'color:#ff1744;font-weight:bold;font-size:14px', 'color:#00e5ff', 'color:#8b8b99');
})();
