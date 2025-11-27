document.addEventListener('DOMContentLoaded', () => {
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
  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    fxSections.forEach(sec => {
      sec.style.backgroundPosition = `center ${-y * 0.08}px`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Ambiyans ses kontrolü
  const audioBtn = document.querySelector('.audio-toggle');
  const ambient = document.getElementById('ambientAudio');
  if (ambient) ambient.volume = 0.5;
  if (audioBtn && ambient) {
    const setIcon = () => {
      const pressed = audioBtn.getAttribute('aria-pressed') === 'true';
      audioBtn.textContent = pressed ? '⏸' : '▶';
    };
    // Autoplay: sayfa yüklenince çalmayı dene
    (async () => {
      try {
        await ambient.play();
        audioBtn.setAttribute('aria-pressed', 'true');
      } catch (e) {
        // Autoplay engeli olabilir; ilk etkileşimde tekrar deneyeceğiz
      } finally {
        setIcon();
      }
    })();

    // Fallback: ilk scroll veya ilk tıklamada oynatmayı dene (bir kez)
    const tryPlayOnce = async () => {
      if (ambient.paused) {
        try {
          await ambient.play();
          audioBtn.setAttribute('aria-pressed', 'true');
          setIcon();
        } catch {}
      }
      window.removeEventListener('scroll', tryPlayOnce);
      window.removeEventListener('click', tryPlayOnce);
    };
    window.addEventListener('scroll', tryPlayOnce, { once: true });
    window.addEventListener('click', tryPlayOnce, { once: true });

    // Buton kontrolü
    setIcon();
    audioBtn.addEventListener('click', async () => {
      const pressed = audioBtn.getAttribute('aria-pressed') === 'true';
      if (!pressed) {
        try {
          await ambient.play();
          audioBtn.setAttribute('aria-pressed', 'true');
        } catch (e) {
          // Autoplay engeli varsa pressed'i değiştirme
        }
      } else {
        ambient.pause();
        audioBtn.setAttribute('aria-pressed', 'false');
      }
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
});