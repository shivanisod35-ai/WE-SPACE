/* ════════════════════════════════════════════════════════════
   WE SPACE — Interactive Engine (Rev 3)
   NASA APIs: APOD, Mars Rover Photos, EPIC Earth, Image Library
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const HERO_FRAME_COUNT = 240;
  const HERO_FRAME_PATH = 'Hero Section Video/ezgif-frame-';
  const NASA_KEY = '4yNobyrCC6zK9cfEbZzPEDLY3tyBcGme4W8m2OxP';

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
  function padFrame(n) { return String(n).padStart(3, '0'); }

  // ════════════════════════════════════════
  //  1. HOVER-ONLY NAVIGATION
  // ════════════════════════════════════════
  function initNav() {
    const trigger = document.getElementById('navTrigger');
    const nav = document.getElementById('ghostNav');
    if (!trigger || !nav) return;
    let hideTimeout;

    function showNav() { clearTimeout(hideTimeout); nav.classList.add('show'); }
    function scheduleHide() {
      hideTimeout = setTimeout(() => nav.classList.remove('show'), 600);
    }

    trigger.addEventListener('mouseenter', showNav);
    trigger.addEventListener('mouseleave', scheduleHide);
    nav.addEventListener('mouseenter', showNav);
    nav.addEventListener('mouseleave', scheduleHide);
  }

  // ════════════════════════════════════════
  //  2. HERO FRAME ANIMATION
  // ════════════════════════════════════════
  const heroCanvas = document.getElementById('heroCanvas');
  const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
  const heroImages = [];
  let heroImagesLoaded = 0;
  let currentHeroFrame = 0;

  function initHeroCanvas() {
    if (!heroCanvas) return;
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = window.innerHeight;
  }

  function preloadHeroFrames() {
    for (let i = 1; i <= HERO_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = HERO_FRAME_PATH + padFrame(i) + '.jpg';
      img.onload = () => {
        heroImagesLoaded++;
        if (heroImagesLoaded === 1) drawHeroFrame(0);
      };
      heroImages.push(img);
    }
  }

  function drawHeroFrame(index) {
    if (!heroCtx) return;
    const img = heroImages[index];
    if (!img || !img.complete) return;
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    const scale = Math.max(heroCanvas.width / img.width, heroCanvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (heroCanvas.width - w) / 2;
    const y = (heroCanvas.height - h) / 2;
    heroCtx.drawImage(img, x, y, w, h);
  }

  function updateHeroFrame() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const scrollRange = hero.offsetHeight - window.innerHeight;
    const progress = clamp(-rect.top / scrollRange, 0, 1);
    const frameIndex = Math.min(Math.floor(progress * HERO_FRAME_COUNT), HERO_FRAME_COUNT - 1);
    if (frameIndex !== currentHeroFrame) {
      currentHeroFrame = frameIndex;
      drawHeroFrame(frameIndex);
    }
  }

  // ════════════════════════════════════════
  //  3. HERO TITLE — Character Reveal
  // ════════════════════════════════════════
  function initHeroTitle() {
    const title = document.getElementById('heroTitle');
    if (!title) return;
    const chars = [
      { ch: 'W', cls: 'char-white' }, { ch: 'E', cls: 'char-white' },
      { ch: '\u00A0', cls: 'char-white' },
      { ch: 'S', cls: 'char-black' }, { ch: 'P', cls: 'char-white' },
      { ch: 'A', cls: 'char-black' }, { ch: 'C', cls: 'char-white' },
      { ch: 'E', cls: 'char-black' },
    ];
    title.innerHTML = '';
    chars.forEach((item, i) => {
      const span = document.createElement('span');
      span.className = `char ${item.cls}`;
      span.textContent = item.ch;
      span.style.animationDelay = `${0.4 + i * 0.1}s`;
      title.appendChild(span);
    });
  }

  // ════════════════════════════════════════
  //  5. CURSOR SPOTLIGHT
  // ════════════════════════════════════════
  function initSpotlight() {
    const section = document.getElementById('disclosure');
    const mask = document.getElementById('disclosureMask');
    if (!section || !mask) return;
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mask.style.background = `radial-gradient(circle 130px at ${x}px ${y}px, transparent 0%, #000 100%)`;
    });
    section.addEventListener('mouseleave', () => { mask.style.background = '#000'; });
  }

  // ════════════════════════════════════════
  //  6. COMPARISON SLIDER
  // ════════════════════════════════════════
  function initComparisonSlider() {
    const slider = document.getElementById('comparisonSlider');
    if (!slider) return;
    const afterImg = slider.querySelector('.slider-after');
    const divider = document.getElementById('sliderDivider');
    const handle = document.getElementById('sliderHandle');
    const beforeImg = slider.querySelector('.slider-before');
    if (!afterImg || !divider || !handle) return;
    let isDragging = false;

    function setPosition(x) {
      const rect = slider.getBoundingClientRect();
      const percent = clamp((x - rect.left) / rect.width * 100, 0, 100);
      afterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      divider.style.left = percent + '%';
      handle.style.left = percent + '%';
    }

    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      if (beforeImg) beforeImg.style.filter = 'blur(1.5px)';
      if (afterImg) afterImg.style.filter = 'blur(1.5px)';
      e.preventDefault();
    });
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('mousemove', (e) => { if (isDragging) setPosition(e.clientX); });
    window.addEventListener('touchmove', (e) => { if (isDragging) setPosition(e.touches[0].clientX); }, { passive: false });

    function stopDrag() {
      isDragging = false;
      if (beforeImg) beforeImg.style.filter = 'none';
      if (afterImg) afterImg.style.filter = 'none';
    }
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    setTimeout(() => {
      const rect = slider.getBoundingClientRect();
      setPosition(rect.left + rect.width / 2);
    }, 100);
  }

  // ════════════════════════════════════════
  //  7. NASA APOD
  //  Confirmed working: api.nasa.gov/planetary/apod
  // ════════════════════════════════════════
  async function fetchApod() {
    const loading = document.getElementById('apodLoading');
    const imageWrap = document.getElementById('apodImageWrap');
    const info = document.getElementById('apodInfo');
    const img = document.getElementById('apodImage');
    const title = document.getElementById('apodTitle');
    const date = document.getElementById('apodDate');
    const explanation = document.getElementById('apodExplanation');

    try {
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.code && data.code !== 200) throw new Error(data.msg || 'API error');

      if (loading) loading.style.display = 'none';

      if (data.media_type === 'image') {
        if (img) {
          img.src = data.hdurl || data.url;
          img.alt = data.title || '';
        }
        if (imageWrap) imageWrap.style.display = 'block';
      } else if (data.media_type === 'video') {
        if (imageWrap) {
          imageWrap.innerHTML = `<iframe src="${data.url}" frameborder="0" allowfullscreen style="width:100%;height:100%;min-height:340px;border-radius:inherit;"></iframe>`;
          imageWrap.style.display = 'block';
        }
      }

      if (title) title.textContent = data.title || '';
      if (date) date.textContent = data.date || '';
      if (explanation) explanation.textContent = data.explanation || '';
      if (info) info.style.display = 'block';

    } catch (err) {
      console.error('APOD error:', err.message);
      if (loading) loading.innerHTML = '<span style="color:rgba(255,255,255,0.3);">Signal lost — unable to reach NASA</span>';
    }
  }

  // ════════════════════════════════════════
  //  8. NASA MARS ROVER PHOTOS (Curiosity)
  //  Confirmed working: api.nasa.gov/mars-photos
  // ════════════════════════════════════════
  function renderMarsPhotos(photos) {
    const grid = document.getElementById('marsPhotosGrid');
    if (!grid) return;
    grid.innerHTML = '';
    photos.forEach(({ src, label }) => {
      const item = document.createElement('div');
      item.className = 'mars-photo-item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = label;
      img.loading = 'lazy';
      const lbl = document.createElement('div');
      lbl.className = 'mars-photo-label';
      lbl.textContent = label;
      item.appendChild(img);
      item.appendChild(lbl);
      grid.appendChild(item);
    });
  }

  async function fetchMarsPhotos() {
    const grid = document.getElementById('marsPhotosGrid');
    if (!grid) return;

    const res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${NASA_KEY}`);
    if (!res.ok) throw new Error('Mars API HTTP ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'Mars API error');

    const photos = data.latest_photos;
    if (!photos || photos.length === 0) throw new Error('No photos returned');

    const items = photos.slice(0, 6).map(p => ({
      src: p.img_src.replace(/^http:\/\//i, 'https://'),
      label: `${p.camera.name} · Sol ${p.sol}`
    }));
    renderMarsPhotos(items);
  }

  // ════════════════════════════════════════
  //  9. NASA IMAGE LIBRARY
  //  Confirmed working: images-api.nasa.gov/search
  // ════════════════════════════════════════
  const NASA_IMAGE_QUERIES = ['pillars of creation hubble', 'andromeda galaxy', 'carina nebula webb', 'saturn rings cassini'];

  async function fetchNASAImages() {
    const grid = document.getElementById('nasaImagesGrid');
    if (!grid) return;

    const query = NASA_IMAGE_QUERIES[Math.floor(Math.random() * NASA_IMAGE_QUERIES.length)];
    const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`);
    if (!res.ok) throw new Error('Images API HTTP ' + res.status);
    const data = await res.json();
    const items = data.collection && data.collection.items;

    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="mars-loading"><span>Archive unavailable</span></div>';
      return;
    }

    grid.innerHTML = '';

    const validItems = items.filter(item =>
      item.links && item.links.find(l => l.rel === 'preview') && item.data && item.data[0]
    ).slice(0, 5);

    if (validItems.length === 0) {
      grid.innerHTML = '<div class="mars-loading"><span>Archive unavailable</span></div>';
      return;
    }

    validItems.forEach((item) => {
      const previewLink = item.links.find(l => l.rel === 'preview');
      const div = document.createElement('div');
      div.className = 'nasa-img-item';

      const img = document.createElement('img');
      img.src = previewLink.href;
      img.alt = item.data[0].title || '';
      img.loading = 'lazy';

      const caption = document.createElement('p');
      caption.className = 'nasa-img-caption';
      caption.textContent = item.data[0].title || '';

      div.appendChild(img);
      div.appendChild(caption);
      grid.appendChild(div);
    });
  }

  // ════════════════════════════════════════
  //  10. NASA EPIC — Earth from Space
  //  Uses epic.gsfc.nasa.gov — tries last 5 days in parallel (no sequential round trip)
  // ════════════════════════════════════════
  async function fetchEpicImage() {
    const loadingEl = document.getElementById('epicLoading');
    const imgEl = document.getElementById('epicImage');
    const captionEl = document.getElementById('epicCaption');
    if (!imgEl) return;

    // Build last 14 candidate dates from today backwards (EPIC has up to ~7 day lag)
    function candidateDates() {
      const dates = [];
      const now = new Date();
      for (let i = 1; i <= 14; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      return dates;
    }

    // Fire all date requests in parallel, resolve with the first that has images
    const result = await Promise.any(
      candidateDates().map(date =>
        fetch(`https://epic.gsfc.nasa.gov/api/natural/date/${date}`)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(imgs => {
            if (!Array.isArray(imgs) || imgs.length === 0) throw new Error('empty');
            return { date, imgs };
          })
      )
    );

    const [year, month, day] = result.date.split('-');
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${result.imgs[0].image}.jpg`;
    const formatted = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    imgEl.onload = () => {
      if (loadingEl) loadingEl.style.display = 'none';
      imgEl.style.display = 'block';
      if (captionEl) captionEl.textContent = `Earth · DSCOVR/EPIC · ${formatted}`;
    };
    imgEl.onerror = () => {
      if (loadingEl) loadingEl.innerHTML = '<span style="color:rgba(255,255,255,0.25);">Earth signal unavailable</span>';
      imgEl.style.display = 'none';
    };
    imgEl.src = imageUrl;
  }

  // ════════════════════════════════════════
  //  11. 3D TILT ON HOVER
  // ════════════════════════════════════════
  function init3DTilt() {
    const apodCard = document.getElementById('apodCard');
    const apodInner = document.getElementById('apodCardInner');

    if (apodCard && apodInner) {
      apodCard.addEventListener('mousemove', (e) => {
        const rect = apodCard.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        apodInner.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      apodCard.addEventListener('mouseleave', () => {
        apodInner.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
      });
    }

    document.querySelectorAll('.knowledge-card, .bw-cell').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
      });
    });
  }

  // ════════════════════════════════════════
  //  12. SCROLL REVEAL (blur-up)
  // ════════════════════════════════════════
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.blur-up').forEach(el => observer.observe(el));
  }

  // ════════════════════════════════════════
  //  13. STAGGERED REVEALS
  // ════════════════════════════════════════
  function initStaggeredReveals() {
    const groups = [
      { selector: '.bw-cell', container: '#bwGrid' },
      { selector: '.knowledge-card', container: '.knowledge-grid' },
      { selector: '.doc-card', container: '#docsGrid' },
    ];
    groups.forEach(({ selector, container }) => {
      const parent = document.querySelector(container);
      if (!parent) return;
      const items = parent.querySelectorAll(selector);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Array.from(items).indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('revealed'), idx * 140);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      items.forEach(item => observer.observe(item));
    });
  }

  // ════════════════════════════════════════
  //  14. COUNTER ANIMATION
  // ════════════════════════════════════════
  function initCounters() {
    const allCounters = document.querySelectorAll('[data-target]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    allCounters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const duration = 2200;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      let display;
      if (target >= 1e12) display = (current / 1e12).toFixed(1) + 'T';
      else if (target >= 1e9) display = (current / 1e9).toFixed(1) + 'B';
      else if (target >= 1e6) display = (current / 1e6).toFixed(0) + 'M';
      else if (target >= 1e4) display = current.toLocaleString();
      else display = String(current);
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ════════════════════════════════════════
  //  15. OUTLINE TEXT FILL
  // ════════════════════════════════════════
  function initOutlineTextFill() {
    const el = document.getElementById('outlineText');
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { el.classList.toggle('filled', entry.isIntersecting); });
    }, { threshold: 0.5 });
    observer.observe(el);
  }

  // ════════════════════════════════════════
  //  16. SCROLL PROGRESS
  // ════════════════════════════════════════
  function updateScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / docH * 100) + '%';
  }

  // ════════════════════════════════════════
  //  17. NAV ACTIVE STATE
  // ════════════════════════════════════════
  function updateNavActive() {
    const links = document.querySelectorAll('.nav-link');
    const sections = ['hero', 'knowledge', 'disclosure', 'grid', 'docs', 'nasafeed', 'slider', 'apod'];
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight / 3) current = id;
    });
    links.forEach(link => link.classList.toggle('active', link.dataset.section === current));
  }

  // ════════════════════════════════════════
  //  18. MAGNETIC NAV LINKS
  // ════════════════════════════════════════
  function initMagneticNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        link.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translate(0, 0)';
        link.style.transition = 'transform 0.4s cubic-bezier(0.2,0,0.2,1)';
        setTimeout(() => link.style.transition = '', 400);
      });
    });
  }

  // ════════════════════════════════════════
  //  19. SMOOTH ANCHOR SCROLL
  // ════════════════════════════════════════
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ════════════════════════════════════════
  //  MAIN LOOP
  // ════════════════════════════════════════
  function loop() {
    updateHeroFrame();
    updateScrollProgress();
    updateNavActive();
    requestAnimationFrame(loop);
  }

  // ════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════
  function init() {
    initHeroCanvas();
    preloadHeroFrames();
    initHeroTitle();
    initNav();
    initSpotlight();
    initComparisonSlider();
    initScrollReveal();
    initStaggeredReveals();
    initCounters();
    initOutlineTextFill();
    initMagneticNav();
    initAnchorScroll();
    init3DTilt();

    fetchApod();
    fetchMarsPhotos();
    fetchNASAImages();
    fetchEpicImage();

    window.addEventListener('resize', () => {
      initHeroCanvas();
      drawHeroFrame(currentHeroFrame);
    });

    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
