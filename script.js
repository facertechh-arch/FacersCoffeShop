document.addEventListener('DOMContentLoaded', () => {
  // === STRICT AUDIO HANDLING === 
  // Tüm diğer audio elemanlarını dur ve sil (duplicate ses sorunu için)
  const allAudioElements = document.querySelectorAll('audio');
  let primaryAudio = null;
  
  if (allAudioElements.length > 1) {
    console.warn(`⚠️ Multiple audio elements found (${allAudioElements.length}). Removing duplicates...`);
    allAudioElements.forEach((audio, index) => {
      if (index === 0) {
        primaryAudio = audio;
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.remove();
      }
    });
  } else if (allAudioElements.length === 1) {
    primaryAudio = allAudioElements[0];
  }
  
  // Primary audio'yu kontrol altına al
  if (primaryAudio) {
    primaryAudio.id = 'ambientAudio';
    primaryAudio.pause(); // Başında durdur
    primaryAudio.currentTime = 0;
  }

  // Burger Menu kontrolü
  const burgerBtn = document.querySelector('.burger-menu-btn');
  const nav = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('navBackdrop');
  
  if (burgerBtn && nav && navBackdrop) {
    const toggleMenu = () => {
      const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
      burgerBtn.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('active');
      navBackdrop.classList.toggle('active');
    };

    burgerBtn.addEventListener('click', toggleMenu);

    // Menü linkine tıklandığında menüyü kapat
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('active');
        navBackdrop.classList.remove('active');
      });
    });

    // Backdrop'a tıklandığında menüyü kapat
    navBackdrop.addEventListener('click', toggleMenu);

    // Dış tarafta tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
      if (!burgerBtn.contains(e.target) && !nav.contains(e.target) && !navBackdrop.contains(e.target)) {
        burgerBtn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('active');
        navBackdrop.classList.remove('active');
      }
    });
  }

  // Scroll to Top Button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  // Stagger efekt: her konteyner içindeki reveal'lara küçük gecikme ver
  const applyStagger = (container) => {
    const items = container.querySelectorAll('.reveal');
    items.forEach((el, i) => { el.style.transitionDelay = `${i * 80}ms`; });
  };
  document.querySelectorAll('.grid, .parallax-content, .hero-content').forEach(applyStagger);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const qrImg = document.getElementById('qrImage');
  if (qrImg) {
    const menuPath = '/%20Facer%20Coffe%20shop/menu.html';
    const url = `${location.protocol}//${location.host}${menuPath}`;
    const api = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({ size: '200x200', data: url });
    qrImg.src = `${api}?${params.toString()}`;
  }

  const fxSections = document.querySelectorAll('.parallax');
  let lastY = 0;
  let ticking = false;
  const updateParallax = () => {
    fxSections.forEach(sec => {
      sec.style.backgroundPosition = `center ${-lastY * 0.08}px`;
    });
    ticking = false;
  };
  const onScroll = () => {
    lastY = window.scrollY || window.pageYOffset;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // === AUDIO CONTROL (STRICT) ===
  const audioBtn = document.querySelector('.audio-toggle');
  const ambient = primaryAudio || document.getElementById('ambientAudio');
  
  if (audioBtn && ambient) {
    ambient.volume = 0.7;
    
    const setIcon = () => {
      const pressed = audioBtn.getAttribute('aria-pressed') === 'true';
      audioBtn.textContent = pressed ? '⏸' : '▶';
    };

    // Başlangıç durumu
    audioBtn.setAttribute('aria-pressed', 'false');
    ambient.pause();
    ambient.currentTime = 0;
    setIcon();

    // Buton tıklama kontrolü
    audioBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const pressed = audioBtn.getAttribute('aria-pressed') === 'true';
      
      try {
        if (!pressed) {
          // Oynat
          await ambient.play();
          audioBtn.setAttribute('aria-pressed', 'true');
          console.log('🔊 Audio started');
        } else {
          // Durdur
          ambient.pause();
          audioBtn.setAttribute('aria-pressed', 'false');
          console.log('🔇 Audio stopped');
        }
      } catch (error) {
        console.error('❌ Audio error:', error);
        audioBtn.setAttribute('aria-pressed', 'false');
      }
      setIcon();
    });

    // Audio event listeners
    ambient.addEventListener('play', () => {
      if (audioBtn.getAttribute('aria-pressed') !== 'true') {
        audioBtn.setAttribute('aria-pressed', 'true');
        setIcon();
      }
    });

    ambient.addEventListener('pause', () => {
      if (audioBtn.getAttribute('aria-pressed') === 'true') {
        audioBtn.setAttribute('aria-pressed', 'false');
        setIcon();
      }
    });

    ambient.addEventListener('error', (e) => {
      console.error('❌ Audio playback error:', e);
      audioBtn.setAttribute('aria-pressed', 'false');
      setIcon();
    });
  }

  // QR menü modal aç/kapat
  const qrLinks = document.querySelectorAll('.qr-link');
  const qrModal = document.getElementById('qrModal');
  const closeBtn = qrModal ? qrModal.querySelector('.modal-close') : null;
  const openModal = () => { if (qrModal) { qrModal.classList.add('visible'); qrModal.setAttribute('aria-hidden', 'false'); } };
  const closeModal = () => { if (qrModal) { qrModal.classList.remove('visible'); qrModal.setAttribute('aria-hidden', 'true'); } };
  qrLinks.forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (qrModal) qrModal.addEventListener('click', (e) => { if (e.target === qrModal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const src = el.getAttribute('data-bg');
        if (src) {
          el.style.backgroundImage = `url('${src}')`;
          el.removeAttribute('data-bg');
        }
        bgObserver.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('.parallax[data-bg]').forEach(el => bgObserver.observe(el));
});
