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

// === RESERVATION FORM ===
const reservationForm = document.getElementById('reservationForm');
if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Gerçek backend olmadığı için başarılı simülasyonu
        const btn = reservationForm.querySelector('button');
        const originalText = btn.textContent;

        btn.textContent = 'Gönderiliyor...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Rezervasyon talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.');
            reservationForm.reset();
            btn.textContent = 'Gönderildi ✓';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }, 1000);
    });
}

// === LANGUAGE SUPPORT ===
const langBtn = document.getElementById('langBtn');
const translations = {
    tr: {
        about: "Hakkımızda",
        vibes: "Atmosfer",
        qr: "QR Menü",
        contact: "İletişim",
        heroTitle: "Sıcak bir kahve molasına hoş geldiniz",
        heroDesc: "Şehrin kalbinde, iç ısıtan kahverengi tonlarda bir deneyim.",
        heroBtn: "QR Menüye Git",
        aboutTitle: "Biz Kimiz?",
        aboutDesc: "Facer Coffe Shop, kaliteli çekirdeklerle özenle hazırlanmış kahveleri, dost canlısı bir atmosferde sunar.",
        vibesTitle: "İç ısıtan kahverengi tema",
        vibesDesc: "Doğal dokular, yumuşak ışıklar ve sakin renk paleti ile huzurlu bir ambiyans.",
        signatureTitle: "İmza Lezzetler",
        reviewsTitle: "Mutlu Müdavimler",
        galleryTitle: "Facer'dan Kareler",
        eventsTitle: "Etkinlikler",
        contactTitle: "Rezervasyon & İletişim",
        formTitle: "Masa Ayırtın",
        formDesc: "Özel günleriniz veya kalabalık gruplar için yerinizi şimdiden hazırlayalım.",
        formName: "Adınız Soyadınız",
        formPhone: "Telefon Numaranız",
        formBtn: "Rezervasyon Yap"
    },
    en: {
        about: "About Us",
        vibes: "Vibes",
        qr: "QR Menu",
        contact: "Contact",
        heroTitle: "Welcome to a Warm Coffee Break",
        heroDesc: "An experience in warm brown tones in the heart of the city.",
        heroBtn: "Go to QR Menu",
        aboutTitle: "Who Are We?",
        aboutDesc: "Facer Coffee Shop serves carefully prepared coffees with quality beans in a friendly atmosphere.",
        vibesTitle: "Heartwarming Brown Theme",
        vibesDesc: "A peaceful ambiance with natural textures, soft lights and a calm color palette.",
        signatureTitle: "Signature Flavors",
        reviewsTitle: "Happy Regulars",
        galleryTitle: "Moments from Facer",
        eventsTitle: "Events",
        contactTitle: "Reservation & Contact",
        formTitle: "Book a Table",
        formDesc: "Let us prepare your place in advance for your special days or large groups.",
        formName: "Full Name",
        formPhone: "Phone Number",
        formBtn: "Make Reservation"
    }
};

let currentLang = 'tr';

if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        const t = translations[currentLang];
        const langText = langBtn.querySelector('.lang-text');
        if (langText) langText.textContent = currentLang.toUpperCase();

        // Navigation
        document.querySelector('a[href="#about"]').textContent = t.about;
        document.querySelector('a[href="#vibes"]').textContent = t.vibes;
        document.querySelectorAll('.qr-link').forEach(l => { if (l.tagName === 'A' && l.classList.contains('nav-link')) l.textContent = t.qr; }); // Nav link specific check might be needed
        document.querySelector('a[href="#contact"]').textContent = t.contact;

        // Hero
        document.querySelector('.hero h2').textContent = t.heroTitle;
        document.querySelector('.hero p').textContent = t.heroDesc;
        document.querySelector('.hero .btn').textContent = t.heroBtn;

        // About
        const aboutCard = document.querySelector('#about .card:nth-child(1)');
        if (aboutCard) {
            aboutCard.querySelector('h3').textContent = t.aboutTitle;
            aboutCard.querySelector('p').textContent = t.aboutDesc;
        }

        // Sections Headers
        const sigHeader = document.querySelector('#signature .section-header');
        if (sigHeader) sigHeader.querySelector('h2').textContent = t.signatureTitle;

        const revHeader = document.querySelector('#reviews .section-header');
        if (revHeader) revHeader.querySelector('h2').textContent = t.reviewsTitle;

        const galHeader = document.querySelector('#gallery .section-header');
        if (galHeader) galHeader.querySelector('h2').textContent = t.galleryTitle;

        const evtHeader = document.querySelector('#events .section-header');
        if (evtHeader) evtHeader.querySelector('h2').textContent = t.eventsTitle;

        const conHeader = document.querySelector('#contact .section-header');
        if (conHeader) conHeader.querySelector('h2').textContent = t.contactTitle;

        // Form
        const form = document.querySelector('.reservation-form');
        if (form) {
            form.querySelector('h3').textContent = t.formTitle;
            form.querySelector('p').textContent = t.formDesc;
            form.querySelector('input[type="text"]').placeholder = t.formName;
            form.querySelector('input[type="tel"]').placeholder = t.formPhone;
            form.querySelector('button').textContent = t.formBtn;
        }
    });
}
