// ============================================================
// NexusStream UI Engine — Hologram Animation Core
// ============================================================

const UI = (() => {

  // ── Particle System ────────────────────────────────────────
  function createParticleField(container, count = 60) {
    container.querySelectorAll('.ns-particle').forEach(p => p.remove());
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'ns-particle';
      p.style.cssText = `
        position:absolute;
        width:${1 + Math.random() * 2}px;
        height:${1 + Math.random() * 2}px;
        background:rgba(0,240,255,${0.1 + Math.random() * 0.5});
        border-radius:50%;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation: particleDrift ${4 + Math.random() * 8}s linear infinite;
        animation-delay:-${Math.random() * 8}s;
        pointer-events:none;
      `;
      container.appendChild(p);
    }
  }

  // ── Hologram Card Build Effect ──────────────────────────────
  function buildCardEffect(el, delay = 0) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px) scale(0.97)';
    el.style.filter = 'blur(8px) brightness(2)';
    setTimeout(() => {
      el.style.transition = 'all 0.6s cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.filter = 'blur(0) brightness(1)';
    }, delay);
  }

  function buildCardsStaggered(cards, baseDelay = 0) {
    cards.forEach((card, i) => buildCardEffect(card, baseDelay + i * 80));
  }

  // ── Scan Line Effect ────────────────────────────────────────
  function scanEffect(el, duration = 800) {
    const scan = document.createElement('div');
    scan.style.cssText = `
      position:absolute; inset:0; pointer-events:none; overflow:hidden;
      border-radius:inherit; z-index:10;
    `;
    scan.innerHTML = `<div style="
      position:absolute; width:100%; height:2px;
      background:linear-gradient(90deg,transparent,rgba(0,240,255,0.8),transparent);
      top:-2px; animation:scanDown ${duration}ms linear forwards;
    "></div>`;
    el.style.position = el.style.position || 'relative';
    el.appendChild(scan);
    setTimeout(() => scan.remove(), duration + 100);
  }

  // ── Loading Skeleton Constructor ────────────────────────────
  function showSkeletonLoader(container, type = 'grid') {
    const skeletons = [];
    const count = type === 'grid' ? 8 : type === 'row' ? 4 : 6;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'ns-skeleton';
      sk.style.cssText = `
        animation-delay:${i * 0.07}s;
      `;
      if (type === 'grid') {
        sk.innerHTML = `
          <div class="sk-thumb"></div>
          <div class="sk-line" style="width:90%;margin-top:10px"></div>
          <div class="sk-line" style="width:60%;margin-top:6px"></div>
        `;
      }
      container.appendChild(sk);
      skeletons.push(sk);
    }
    return skeletons;
  }

  // ── Page Transition ─────────────────────────────────────────
  function pageTransition(url) {
    const overlay = document.getElementById('ns-transition') || createTransitionOverlay();
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 400);
  }

  function createTransitionOverlay() {
    const div = document.createElement('div');
    div.id = 'ns-transition';
    div.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:radial-gradient(circle at center, rgba(0,240,255,0.15), #000);
      opacity:0; transition:opacity 0.4s ease; pointer-events:none;
    `;
    div.innerHTML = `<div style="
      position:absolute; inset:0;
      background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,0.03) 2px,rgba(0,240,255,0.03) 4px);
      animation:scanLines 0.1s linear infinite;
    "></div>`;
    document.body.appendChild(div);
    return div;
  }

  // ── Glow Pulse on Element ───────────────────────────────────
  function glowPulse(el, color = 'rgba(0,240,255,0.6)', duration = 600) {
    const prev = el.style.boxShadow;
    el.style.transition = `box-shadow ${duration/2}ms ease`;
    el.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
    setTimeout(() => {
      el.style.boxShadow = prev || '0 0 0 transparent';
    }, duration / 2);
  }

  // ── Typing Effect ───────────────────────────────────────────
  function typeText(el, text, speed = 40) {
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed);
      }
    };
    type();
  }

  // ── Wave Distortion on Search Input ────────────────────────
  let waveInterval = null;
  function startSearchWave(inputWrapper) {
    let phase = 0;
    clearInterval(waveInterval);
    waveInterval = setInterval(() => {
      phase += 0.3;
      const wave = Math.sin(phase) * 3;
      inputWrapper.style.transform = `scaleY(${1 + wave * 0.005})`;
      inputWrapper.style.filter = `brightness(${1 + Math.abs(wave) * 0.05})`;
    }, 30);
  }
  function stopSearchWave(inputWrapper) {
    clearInterval(waveInterval);
    inputWrapper.style.transform = 'scaleY(1)';
    inputWrapper.style.filter = 'brightness(1)';
  }

  // ── Render Video Card ───────────────────────────────────────
  function renderVideoCard(video, size = 'normal') {
    const card = document.createElement('div');
    card.className = `ns-card ${size === 'hero' ? 'ns-card--hero' : ''}`;
    card.dataset.id = video.id;
    card.innerHTML = `
      <div class="ns-card__thumb">
        <img src="${video.thumb}" alt="${video.title}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${video.id}/480/270'">
        <div class="ns-card__duration">${video.duration || '—'}</div>
        <div class="ns-card__glow-ring"></div>
        <div class="ns-card__hover-overlay">
          <div class="ns-card__play-icon">▶</div>
        </div>
      </div>
      <div class="ns-card__info">
        <div class="ns-card__title">${video.title}</div>
        <div class="ns-card__meta">
          <span class="ns-card__channel">${video.channel}</span>
          <span class="ns-card__views">${video.views || ''} views</span>
        </div>
        ${video.category ? `<div class="ns-card__tag">${video.category}</div>` : ''}
      </div>
    `;
    card.addEventListener('click', () => pageTransition(`watch.html?v=${video.id}`));
    card.addEventListener('mouseenter', () => scanEffect(card));
    return card;
  }

  // ── Render Channel Avatar ───────────────────────────────────
  function renderChannelAvatar(ch) {
    const el = document.createElement('div');
    el.className = 'ns-channel-avatar';
    el.innerHTML = `
      <div class="ns-channel-avatar__ring"></div>
      <div class="ns-channel-avatar__img-wrap">
        <img src="${ch.avatar}" alt="${ch.name}" onerror="this.src='https://picsum.photos/seed/${ch.id}/100/100'">
      </div>
      <div class="ns-channel-avatar__name">${ch.name}</div>
      <div class="ns-channel-avatar__subs">${ch.subs} subscribers</div>
      <div class="ns-channel-avatar__preview">
        <span>View Channel →</span>
      </div>
    `;
    el.addEventListener('click', () => pageTransition(`channel.html?c=${ch.id}`));
    return el;
  }

  // ── Init Universal Components ───────────────────────────────
  function initHeader() {
    const header = document.getElementById('ns-header');
    if (!header) return;
    // Active nav highlighting
    const path = window.location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('[data-page]').forEach(link => {
      if (link.dataset.page === path) link.classList.add('active');
    });
    // Scroll glass effect
    window.addEventListener('scroll', () => {
      header.style.backdropFilter = window.scrollY > 30 ? 'blur(20px) saturate(180%)' : 'blur(10px)';
      header.style.borderBottom = window.scrollY > 30
        ? '1px solid rgba(0,240,255,0.2)'
        : '1px solid rgba(0,240,255,0.08)';
    });
  }

  function initGlobalStyles() {
    if (document.getElementById('ns-global-anim')) return;
    const style = document.createElement('style');
    style.id = 'ns-global-anim';
    style.textContent = `
      @keyframes particleDrift {
        0%   { transform: translate(0,0) scale(1); opacity:0; }
        10%  { opacity:1; }
        90%  { opacity:1; }
        100% { transform: translate(${Math.random()>0.5?'':'-'}${20+Math.random()*40}px, -${30+Math.random()*60}px) scale(0.3); opacity:0; }
      }
      @keyframes scanDown {
        from { top:-2px; }
        to   { top:100%; }
      }
      @keyframes scanLines {
        from { background-position: 0 0; }
        to   { background-position: 0 4px; }
      }
      @keyframes rotateRing {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes pulseGlow {
        0%,100% { box-shadow: 0 0 10px rgba(0,240,255,0.3), 0 0 20px rgba(0,240,255,0.1); }
        50%     { box-shadow: 0 0 25px rgba(0,240,255,0.7), 0 0 50px rgba(0,240,255,0.3), 0 0 80px rgba(0,240,255,0.1); }
      }
      @keyframes holoFlicker {
        0%,100% { opacity:1; }
        92% { opacity:1; }
        93% { opacity:0.85; }
        94% { opacity:1; }
        96% { opacity:0.9; }
        97% { opacity:1; }
      }
      @keyframes nodeOrbit {
        from { transform: rotate(0deg) translateX(var(--orbit-r, 120px)) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(var(--orbit-r, 120px)) rotate(-360deg); }
      }
      @keyframes skeletonShimmer {
        0%   { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      @keyframes energyPulse {
        0%,100% { transform: scale(1); opacity:0.6; }
        50%     { transform: scale(1.08); opacity:1; }
      }
      @keyframes glitchH {
        0%,100% { clip-path: inset(0 0 100% 0); }
        20% { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
        40% { clip-path: inset(50% 0 30% 0); transform: translateX(4px); }
        60% { clip-path: inset(10% 0 80% 0); transform: translateX(-2px); }
        80% { clip-path: inset(70% 0 10% 0); transform: translateX(2px); }
      }
      .ns-transition-active { opacity:1 !important; pointer-events:all !important; }
      .ns-skeleton {
        background: linear-gradient(90deg, rgba(0,240,255,0.04) 25%, rgba(0,240,255,0.1) 50%, rgba(0,240,255,0.04) 75%);
        background-size: 800px 100%;
        animation: skeletonShimmer 1.5s infinite;
        border-radius:8px; overflow:hidden;
      }
      .sk-thumb { width:100%; padding-top:56.25%; background:rgba(0,240,255,0.06); border-radius:6px; }
      .sk-line  { height:12px; background:rgba(0,240,255,0.08); border-radius:4px; }
    `;
    document.head.appendChild(style);
  }

  // ── Expose Public API ───────────────────────────────────────
  return {
    createParticleField,
    buildCardEffect,
    buildCardsStaggered,
    scanEffect,
    showSkeletonLoader,
    pageTransition,
    glowPulse,
    typeText,
    startSearchWave,
    stopSearchWave,
    renderVideoCard,
    renderChannelAvatar,
    initHeader,
    initGlobalStyles,
  };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  UI.initGlobalStyles();
  UI.initHeader();
});
