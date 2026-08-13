const preloader = document.querySelector('#site-preloader');
const preloadStartedAt = performance.now();
const preloadIsMobile = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)').matches;
const preloadMinimumMs = preloadIsMobile ? 260 : 420;
const preloadMaximumMs = preloadIsMobile ? 900 : 1200;
let preloaderFinished = false;

const optimizeImageLoading = () => {
  document.querySelectorAll('img').forEach((image) => {
    const isCritical = Boolean(image.closest('.site-preloader, .site-header, .hero, .career-index-hero, .career-hero, .career-life-hero, .career-dept-hero, .career-jobs-hero, .qhse-page-hero, .services-hero, .equipment-hero, .vessel-hero, .project-page-hero, .contact-page-hero, .news-page-hero, .board-hero, .profile-hero'));
    image.decoding = 'async';
    if (isCritical || image.loading === 'eager') {
      image.loading = 'eager';
      image.setAttribute('fetchpriority', 'high');
      return;
    }
    image.loading = 'lazy';
    image.setAttribute('fetchpriority', 'low');
  });
};

const shouldLoadVideo = (video) => {
  if (!video) return false;
  const isHeroVideo = video.matches('.hero-video, .career-index-video');
  if (!isHeroVideo) return true;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileView = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)').matches;
  return !reduceMotion && !mobileView;
};

const ensureVideoLoaded = (video) => {
  if (!video || !shouldLoadVideo(video)) return;
  if (!video.getAttribute('src') && video.dataset.src) {
    video.src = video.dataset.src;
    video.load();
  }
};

const scheduleHeroVideoLoad = (video) => {
  if (!video || !shouldLoadVideo(video)) return;

  const isHeroVideo = video.matches('.hero-video, .career-index-video');
  if (!isHeroVideo) {
    ensureVideoLoaded(video);
    return;
  }

  if (video.dataset.videoLoadScheduled === 'true' || video.getAttribute('src')) return;
  video.dataset.videoLoadScheduled = 'true';

  const loadVideo = () => ensureVideoLoaded(video);
  const loadWhenIdle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadVideo, { timeout: 1800 });
    else window.setTimeout(loadVideo, 900);
  };

  if (document.readyState === 'complete') loadWhenIdle();
  else window.addEventListener('load', loadWhenIdle, { once: true });
};

optimizeImageLoading();

if ('MutationObserver' in window) {
  new MutationObserver((mutations) => {
    if (mutations.some((mutation) => [...mutation.addedNodes].some((node) => node.nodeType === 1 && (node.matches?.('img') || node.querySelector?.('img'))))) {
      optimizeImageLoading();
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}

const finishPreload = () => {
  if (preloaderFinished) return;
  preloaderFinished = true;
  const elapsed = performance.now() - preloadStartedAt;
  const wait = Math.max(0, preloadMinimumMs - elapsed);
  window.setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    preloader?.classList.add('is-hidden');
    window.setTimeout(() => preloader?.remove(), 750);
  }, preloader ? wait : 0);
};

if (preloader) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finishPreload, { once: true });
  } else {
    window.requestAnimationFrame(finishPreload);
  }
  window.setTimeout(finishPreload, preloadMaximumMs);
} else {
  document.body.classList.add('is-ready');
}

document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
  const applyFallback = () => {
    if (!image.complete || image.naturalWidth === 0) {
      image.onerror = null;
      image.classList.remove('news-feature-image-contain');
      if (image.dataset.fallbackAlt) image.alt = image.dataset.fallbackAlt;
      image.src = image.dataset.fallbackSrc;
    }
  };

  window.setTimeout(applyFallback, 3200);
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const header = document.querySelector('.site-header');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 50);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuButton && nav) {
  const navDropdowns = [...nav.querySelectorAll('.nav-dropdown')];
  const isTouchNavigation = () => window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1100px)').matches;
  const closeNavDropdowns = (activeDropdown = null) => {
    navDropdowns.forEach((dropdown) => {
      if (dropdown === activeDropdown) return;
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (!open) closeNavDropdowns();
    setMenuLabels();
  });

  navDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-trigger');
    if (!trigger) return;

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (event) => {
      if (!isTouchNavigation()) return;

      const isOpen = dropdown.classList.contains('is-open');
      if (!isOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeNavDropdowns(dropdown);
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      closeNavDropdowns();
      setMenuLabels();
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeNavDropdowns();
  });
}

const careerHeader = document.querySelector('.career-header');
const careerMenuButton = document.querySelector('.career-menu-toggle');
const careerNavLinks = [...document.querySelectorAll('.career-nav a, .career-header-actions a')];

const updateCareerHeader = () => {
  const hasVisualCareerHero = Boolean(document.querySelector('.career-index-hero, .career-hero-video-stage, .career-life-hero, .career-dept-hero, .career-jobs-hero'));
  const shouldScroll = window.scrollY > 50 || (!hasVisualCareerHero && document.body.classList.contains('career-subpage'));
  careerHeader?.classList.toggle('scrolled', shouldScroll);
};
updateCareerHeader();
window.addEventListener('scroll', updateCareerHeader, { passive: true });

if (careerHeader && careerMenuButton) {
  const closeCareerMenu = () => {
    careerHeader.classList.remove('menu-open');
    careerMenuButton.setAttribute('aria-expanded', 'false');
  };

  careerMenuButton.addEventListener('click', () => {
    const open = careerHeader.classList.toggle('menu-open');
    careerMenuButton.setAttribute('aria-expanded', String(open));
  });

  careerNavLinks.forEach((link) => link.addEventListener('click', closeCareerMenu));
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
    link.closest('.nav-dropdown')?.querySelector('.nav-trigger')?.classList.add('active');
  }
});

document.querySelectorAll('.career-nav a, .career-header-actions a, .career-footer nav a').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
});

const languageButtons = [...document.querySelectorAll('[data-lang-switch]')];
const supportedLanguages = ['en', 'id'];
let activeLanguage = supportedLanguages.includes(localStorage.getItem('taka-language'))
  ? localStorage.getItem('taka-language')
  : 'en';

const staticTranslations = [
  ['title', 'Taka Hydrocore Indonesia | Survey, Drilling & Data Acquisition', 'Taka Hydrocore Indonesia | Survei, Pengeboran & Akuisisi Data'],
  ['meta[name="description"]', 'PT Taka Hydrocore Indonesia provides offshore survey, geotechnical, geophysical, drilling, and data acquisition services.', 'PT Taka Hydrocore Indonesia menyediakan layanan survei offshore, geoteknik, geofisika, pengeboran, dan akuisisi data.'],
  ['.preloader-inner p', 'Preparing field capability', 'Menyiapkan kapabilitas lapangan'],
  ['[data-i18n-nav="about"]', 'About Us', 'Tentang Kami'],
  ['[data-i18n-nav="company"]', 'Company Profile', 'Profil Perusahaan'],
  ['[data-i18n-nav="board"]', 'Board of Commissioners & Directors', 'Dewan Komisaris & Direksi'],
  ['[data-i18n-nav="services"]', 'Services', 'Layanan'],
  ['[data-i18n-nav="assets"]', 'Assets', 'Aset'],
  ['[data-i18n-nav="equipment"]', 'Equipment', 'Peralatan'],
  ['[data-i18n-nav="geotechEquipment"]', 'Geotechnical Equipment', 'Peralatan Geoteknik'],
  ['[data-i18n-nav="geophysEquipment"]', 'Hydrographic / Geophysical Equipment', 'Peralatan Hidrografi / Geofisika'],
  ['[data-i18n-nav="seismicEquipment"]', '2D/3D HR Seismic Equipment', 'Peralatan 2D/3D HR Seismic'],
  ['[data-i18n-nav="vessel"]', 'Vessel', 'Kapal'],
  ['[data-i18n-nav="qhse"]', 'QHSE', 'QHSE'],
  ['[data-i18n-nav="quality"]', 'Quality Management System', 'Sistem Manajemen Mutu'],
  ['[data-i18n-nav="hse"]', 'HSE', 'HSE'],
  ['[data-i18n-nav="projects"]', 'Project', 'Proyek'],
  ['[data-i18n-nav="news"]', 'News', 'Berita'],
  ['[data-i18n-nav="career"]', 'Career', 'Karier'],
  ['[data-i18n-nav="contact"]', 'Contact', 'Kontak'],
  ['.hero-actions .text-link', 'Discuss a project <span>→</span>', 'Diskusikan proyek <span>→</span>', 'html'],
  ['.hero-status>div:first-child p', 'Marine geophysical acquisition and interpretation', 'Akuisisi dan interpretasi geofisika marine'],
  ['.hero-status>div:nth-child(2) p', 'Geotechnical drilling and soil investigation', 'Pengeboran geoteknik dan investigasi tanah'],
  ['#about > .section-label', '<span>01</span> About Taka Hydrocore', '<span>01</span> Tentang Taka Hydrocore', 'html'],
  ['.intro-head .kicker', 'Company profile', 'Profil perusahaan'],
  ['.intro-head h2', 'Indonesian survey capability for subsurface decisions.', 'Kapabilitas survei Indonesia untuk keputusan bawah permukaan.'],
  ['.trusted-strip>p', 'Trusted by', 'Dipercaya oleh'],
  ['.trusted-section-label', 'Selected clients', 'Klien terpilih'],
  ['.intro-detail>p', 'Established in 2010, PT Taka Hydrocore Indonesia provides exploratory, geophysical, geotechnical, hydrogeological, environmental, and water-well drilling work for mining, oil and gas, infrastructure, contractor, and consulting clients.', 'Didirikan pada 2010, PT Taka Hydrocore Indonesia menyediakan pekerjaan eksplorasi, geofisika, geoteknik, hidrogeologi, lingkungan, dan pengeboran sumur air untuk klien pertambangan, minyak dan gas, infrastruktur, kontraktor, dan konsultan.'],
  ['.intro-detail .arrow-link', 'View company profile <span>→</span>', 'Lihat profil perusahaan <span>→</span>', 'html'],
  ['.intro-visual figcaption span', 'Offshore investigation', 'Investigasi offshore'],
  ['.intro-visual figcaption strong', 'Geotechnical drilling, sampling, and field testing support practical offshore engineering decisions.', 'Pengeboran geoteknik, sampling, dan pengujian lapangan mendukung keputusan engineering offshore.'],
  ['.credential-card-iso .credential-eyebrow', 'Integrated certification', 'Sertifikasi terintegrasi'],
  ['.credential-card-iso strong', 'ISO Certified', 'Sertifikasi ISO'],
  ['.credential-card-iso>p', 'Integrated ISO systems and Indonesian local SMK3 reference supporting safer, cleaner, and more controlled project delivery.', 'Sistem ISO terintegrasi dan referensi SMK3 lokal Indonesia mendukung pelaksanaan proyek yang lebih aman, bersih, dan terkendali.'],
  ['.iso-metric-list a:nth-child(1) small', 'Occupational Health & Safety', 'Kesehatan & Keselamatan Kerja'],
  ['.iso-metric-list a:nth-child(2) small', 'Environmental Management', 'Manajemen Lingkungan'],
  ['.iso-metric-list a:nth-child(3) small', 'Quality Management', 'Manajemen Mutu'],
  ['.iso-metric-list a:nth-child(4) small', 'Indonesian Local Certificate', 'Sertifikat Lokal Indonesia'],
  ['.credential-card-skup .credential-eyebrow', 'MIGAS capability', 'Kapabilitas MIGAS'],
  ['.credential-card-skup strong', 'SKUP', 'SKUP'],
  ['.credential-card-skup>p', 'Registered oil and gas supporting capability with company rating for field service readiness.', 'Kapabilitas penunjang minyak dan gas terdaftar dengan peringkat perusahaan untuk kesiapan layanan lapangan.'],
  ['.credential-card-award .credential-eyebrow', 'Safety recognition', 'Penghargaan keselamatan'],
  ['.credential-card-award strong', 'Zero Accident', 'Zero Accident'],
  ['.credential-card-award>p', 'Pertamina zero accident recognition reflecting disciplined HSE execution during project operations.', 'Penghargaan zero accident dari Pertamina yang mencerminkan disiplin pelaksanaan HSE selama operasi proyek.'],
  ['#services > .section-label', '<span>02</span> Capabilities', '<span>02</span> Kapabilitas', 'html'],
  ['#services .section-heading h2', 'Six core services for marine and land investigation.', 'Enam layanan utama untuk investigasi marine dan darat.'],
  ['#services .section-heading>p', 'THI configures each scope around project objective, water depth, soil target, acquisition method, drilling platform, and reporting needs.', 'THI mengonfigurasi setiap lingkup berdasarkan tujuan proyek, kedalaman air, target tanah, metode akuisisi, platform pengeboran, dan kebutuhan pelaporan.'],
  ['.capability-visual figcaption span', 'Service readiness', 'Kesiapan layanan'],
  ['.capability-visual figcaption strong', 'Geophysical acquisition, geotechnical drilling, seabed testing, and onshore investigation delivered by field-ready teams.', 'Akuisisi geofisika, pengeboran geoteknik, pengujian seabed, dan investigasi onshore dijalankan oleh tim siap lapangan.'],
  ['.service-marine .service-tag', 'Marine Geophysical', 'Geofisika Marine'],
  ['.service-marine h3', '2D/3D High Resolution Marine Seismic', 'Seismik Laut Resolusi Tinggi 2D/3D'],
  ['.service-marine div>p:last-child', 'High-resolution seismic acquisition, processing, and interpretation for geohazard, exploration, and subsea planning.', 'Akuisisi, pemrosesan, dan interpretasi seismik resolusi tinggi untuk geohazard, eksplorasi, dan perencanaan bawah laut.'],
  ['.service-offshore .service-tag', 'Offshore Geotechnical', 'Geoteknik Offshore'],
  ['.service-offshore h3', 'Offshore Geotechnical Survey', 'Survei Geoteknik Offshore'],
  ['.service-offshore div>p:last-child', 'Offshore drilling, CPT, sampling, coring, and downhole logging using suitable marine platforms and compensated systems.', 'Pengeboran offshore, CPT, sampling, coring, dan downhole logging menggunakan platform marine dan sistem kompensasi yang sesuai.'],
  ['.service-seabed .service-tag', 'Seabed Geotechnical', 'Geoteknik Seabed'],
  ['.service-seabed h3', 'Seabed Geotechnical', 'Geoteknik Seabed'],
  ['.service-seabed div>p:last-child', 'Seabed CPT and vibrocore systems for direct seabed investigation and shallow subsurface sampling.', 'Sistem Seabed CPT dan vibrocore untuk investigasi seabed langsung dan sampling bawah permukaan dangkal.'],
  ['.service-nearshore .service-tag', 'Nearshore Geotechnical', 'Geoteknik Nearshore'],
  ['.service-nearshore h3', 'Nearshore Geotechnical Drilling', 'Pengeboran Geoteknik Nearshore'],
  ['.service-nearshore div>p:last-child', 'Shallow-water investigation using staging, pontoon, or platform-based drilling for coastal and marine infrastructure.', 'Investigasi perairan dangkal menggunakan staging, pontoon, atau pengeboran berbasis platform untuk infrastruktur pesisir dan marine.'],
  ['.service-exploratory .service-tag', 'Exploratory Drilling', 'Pengeboran Eksplorasi'],
  ['.service-exploratory h3', 'Exploratory Drilling', 'Pengeboran Eksplorasi'],
  ['.service-exploratory div>p:last-child', 'Mining and resource drilling with quality coring, field geologist support, and fit-for-purpose drilling diameter.', 'Pengeboran tambang dan sumber daya dengan coring berkualitas, dukungan field geologist, dan diameter pengeboran sesuai kebutuhan.'],
  ['.service-onshore .service-tag', 'Onshore Geotechnical', 'Geoteknik Onshore'],
  ['.service-onshore h3', 'Onshore Geotechnical Survey', 'Survei Geoteknik Onshore'],
  ['.service-onshore div>p:last-child', 'SPT, CPT, pressuremeter, field vane shear, sampling, and laboratory-backed soil investigation for land projects.', 'SPT, CPT, pressuremeter, field vane shear, sampling, dan investigasi tanah berbasis laboratorium untuk proyek darat.'],
  ['#qhse > .section-label', '<span>03</span> QHSE', '<span>03</span> QHSE', 'html'],
  ['.home-qhse .qhse-dossier-head .kicker', 'Field Discipline', 'Disiplin Lapangan'],
  ['.home-qhse .qhse-dossier-head h2', 'QHSE is managed where the work happens.', 'QHSE dikelola di tempat pekerjaan berlangsung.'],
  ['.home-qhse .qhse-dossier-head>p', 'For Taka Hydrocore, QHSE is part of daily field control: method review, toolbox meeting, permit readiness, equipment assurance, emergency response, and close-out records.', 'Bagi Taka Hydrocore, QHSE adalah bagian dari kontrol lapangan harian: peninjauan metode, toolbox meeting, kesiapan izin, jaminan peralatan, respons darurat, dan catatan close-out.'],
  ['.home-qhse .qhse-visual figcaption span', 'Deck briefing', 'Briefing dek'],
  ['.home-qhse .qhse-visual figcaption strong', 'Crew, method, tools, and worksite controls are reviewed before execution begins.', 'Kru, metode, alat, dan kontrol area kerja ditinjau sebelum eksekusi dimulai.'],
  ['.home-qhse .qhse-register-title span', 'Field control board', 'Papan kontrol lapangan'],
  ['.home-qhse .qhse-register-title strong', 'What gets checked before work starts', 'Hal yang diperiksa sebelum pekerjaan dimulai'],
  ['.home-qhse .qhse-checklist article:nth-child(1) strong', 'Crew & responsibility', 'Kru & tanggung jawab'],
  ['.home-qhse .qhse-checklist article:nth-child(1) p', 'Role, task, risk, and communication line are confirmed with the site team.', 'Peran, tugas, risiko, dan jalur komunikasi dikonfirmasi bersama tim site.'],
  ['.home-qhse .qhse-checklist article:nth-child(2) strong', 'Equipment & certificates', 'Peralatan & sertifikat'],
  ['.home-qhse .qhse-checklist article:nth-child(2) p', 'Critical tools, lifting gear, and support equipment are checked before use.', 'Alat kritis, lifting gear, dan peralatan pendukung diperiksa sebelum digunakan.'],
  ['.home-qhse .qhse-checklist article:nth-child(3) strong', 'Permit & work area', 'Izin & area kerja'],
  ['.home-qhse .qhse-checklist article:nth-child(3) p', 'Access, SIMOPS, lifting activity, weather, and emergency readiness are reviewed on site.', 'Akses, SIMOPS, aktivitas lifting, cuaca, dan kesiapan darurat ditinjau di site.'],
  ['.home-qhse .qhse-checklist article:nth-child(4) strong', 'Records & close-out', 'Catatan & close-out'],
  ['.home-qhse .qhse-checklist article:nth-child(4) p', 'Toolbox talks, inspection notes, observations, and handover records stay traceable.', 'Toolbox talk, catatan inspeksi, observasi, dan handover tetap tertelusur.'],
  ['.home-qhse-links a:nth-child(1)', 'Quality Management System <span>→</span>', 'Sistem Manajemen Mutu <span>→</span>', 'html'],
  ['.home-qhse-links a:nth-child(2)', 'Health, Safety & Environment <span>→</span>', 'Kesehatan, Keselamatan & Lingkungan <span>→</span>', 'html'],
  ['.home-qhse .qhse-control-points>div:nth-child(1) strong', 'Management system', 'Sistem manajemen'],
  ['.home-qhse .qhse-control-points>div:nth-child(1) p', 'Policy, procedure, ISO, SMK3, and project records are kept ready for tender, audit, and project reference needs.', 'Policy, prosedur, ISO, SMK3, dan catatan proyek disiapkan untuk kebutuhan tender, audit, dan referensi proyek.'],
  ['.home-qhse .qhse-control-points>div:nth-child(2) strong', 'Site preparation', 'Persiapan site'],
  ['.home-qhse .qhse-control-points>div:nth-child(2) p', 'Toolbox meeting, risk review, permit, emergency response, and communication are aligned.', 'Toolbox meeting, review risiko, izin, respons darurat, dan komunikasi diselaraskan.'],
  ['.home-qhse .qhse-control-points>div:nth-child(3) strong', 'Equipment assurance', 'Jaminan peralatan'],
  ['.home-qhse .qhse-control-points>div:nth-child(3) p', 'Lifting gear, survey tools, drilling equipment, and field assets are checked before mobilization.', 'Lifting gear, alat survei, peralatan pengeboran, dan aset lapangan diperiksa sebelum mobilisasi.'],
  ['.home-qhse .qhse-control-points>div:nth-child(4) strong', 'Continuous improvement', 'Perbaikan berkelanjutan'],
  ['.home-qhse .qhse-control-points>div:nth-child(4) p', 'Observation, audit note, lesson learned, and close-out are reviewed for the next work.', 'Observasi, catatan audit, lesson learned, dan close-out ditinjau untuk pekerjaan berikutnya.'],
  ['#projects > .section-label', '<span>04</span> Projects', '<span>04</span> Proyek', 'html'],
  ['.projects-heading .light-text', 'Selected work', 'Pekerjaan pilihan'],
  ['.projects-heading h2', 'Field-proven experience by service discipline.', 'Pengalaman lapangan berdasarkan disiplin layanan.'],
  ['.projects-heading>p', 'Selected references are organized around the technical work delivered: geophysical acquisition, offshore geotechnical investigation, cable route survey, and seabed sampling.', 'Referensi pilihan disusun berdasarkan pekerjaan teknis yang dijalankan: akuisisi geofisika, investigasi geoteknik offshore, survei rute kabel, dan sampling seabed.'],
  ['[data-project="angola"] .project-content>p:first-child', 'Offshore Geotechnical / Angola', 'Geoteknik Offshore / Angola'],
  ['[data-project="angola"] .project-client', 'Client · RINA Consulting SpA', 'Klien · RINA Consulting SpA'],
  ['[data-project="angola"] h3', 'Marine Geotech Site Survey – Jackup Installation, Block 3/05', 'Survei Geoteknik Laut – Instalasi Jackup, Blok 3/05'],
  ['[data-project="angola"] .project-description', 'Provision of marine geotechnical site survey for jackup drilling unit installation in Block 3/05, Angola.', 'Penyediaan survei geoteknik laut untuk instalasi unit pengeboran jackup di Blok 3/05, Angola.'],
  ['[data-project="angola"] .project-detail-label', 'View project', 'Lihat proyek'],
  ['[data-project="keppel"] .project-content>p:first-child', 'Submarine Cable Route Survey', 'Survei Rute Kabel Bawah Laut'],
  ['[data-project="keppel"] .project-client', 'Client · Keppel Energy Pte Ltd', 'Klien · Keppel Energy Pte Ltd'],
  ['[data-project="keppel"] h3', 'Crescent Project – Indonesia Cable Route Survey', 'Proyek Crescent – Survei Rute Kabel Indonesia'],
  ['[data-project="keppel"] .project-detail-label', 'View project', 'Lihat proyek'],
  ['[data-project="karimun"] .project-content>p:first-child', 'Geophysical & Vibrocore Survey', 'Survei Geofisika & Vibrocore'],
  ['[data-project="karimun"] .project-client', 'Client · Karimun Besar Project', 'Klien · Proyek Karimun Besar'],
  ['[data-project="karimun"] h3', 'Geophysical & Vibrocore Survey – Karimun Besar', 'Survei Geofisika & Vibrocore – Karimun Besar'],
  ['[data-project="karimun"] .project-detail-label', 'View project', 'Lihat proyek'],
  ['.updates > .section-label', '<span>05</span> Updates', '<span>05</span> Pembaruan', 'html'],
  ['.updates-heading h2', 'Focused on field data, methods, and technical delivery.', 'Fokus pada data lapangan, metode, dan deliverable teknis.'],
  ['.updates-heading p', 'Operational strength comes from survey planning, fit-for-purpose equipment, disciplined field execution, and reporting that supports engineering decisions.', 'Kekuatan operasional datang dari perencanaan survei, peralatan sesuai kebutuhan, eksekusi lapangan disiplin, dan pelaporan yang mendukung keputusan engineering.'],
  ['.news-card:nth-child(1) .news-meta span', 'Geophysical', 'Geofisika'],
  ['.news-card:nth-child(1) .news-meta small', 'Marine', 'Marine'],
  ['.news-card:nth-child(1) h3', 'High-resolution marine seismic for geohazard and exploration work.', 'Seismik marine resolusi tinggi untuk geohazard dan eksplorasi.'],
  ['.news-card:nth-child(1) p', 'Acquisition, processing, and interpretation are aligned to project objectives and seabed conditions.', 'Akuisisi, pemrosesan, dan interpretasi diselaraskan dengan tujuan proyek dan kondisi seabed.'],
  ['.news-card:nth-child(2) .news-meta span', 'Geotechnical', 'Geoteknik'],
  ['.news-card:nth-child(2) .news-meta small', 'Offshore', 'Offshore'],
  ['.news-card:nth-child(2) h3', 'Offshore soil investigation configured around water depth and soil target.', 'Investigasi tanah offshore dikonfigurasi berdasarkan kedalaman air dan target tanah.'],
  ['.news-card:nth-child(2) p', 'Drilling, CPT, sampling, coring, and logging are selected to match site constraints.', 'Pengeboran, CPT, sampling, coring, dan logging dipilih sesuai batasan site.'],
  ['.news-card:nth-child(3) .news-meta span', 'QHSE', 'QHSE'],
  ['.news-card:nth-child(3) .news-meta small', 'Field', 'Lapangan'],
  ['.news-card:nth-child(3) h3', 'Controlled execution for higher confidence in technical data.', 'Eksekusi terkendali untuk data teknis yang lebih meyakinkan.'],
  ['.news-card:nth-child(3) p', 'Safety, quality, and compliance support every acquisition, drilling, and reporting workflow.', 'Keselamatan, kualitas, dan kepatuhan mendukung setiap workflow akuisisi, pengeboran, dan pelaporan.'],
  ['.contact-intro .section-label', '<span>06</span> Contact', '<span>06</span> Kontak', 'html'],
  ['.contact-intro .kicker', 'Start a project conversation', 'Mulai diskusi proyek'],
  ['.contact-intro h2', 'Bring your geophysical or geotechnical brief to THI.', 'Bawa kebutuhan geofisika atau geoteknik Anda ke THI.'],
  ['.contact-intro>p:last-of-type', 'Share your project location, survey objective, water depth or site condition, expected deliverables, and timeline. The team can help align the right method before mobilization.', 'Bagikan lokasi proyek, tujuan survei, kedalaman air atau kondisi site, deliverable yang diharapkan, dan timeline. Tim kami dapat membantu menyelaraskan metode yang tepat sebelum mobilisasi.'],
  ['.contact-info>div:nth-child(1) span', 'Head Office', 'Kantor pusat'],
  ['.contact-info>div:nth-child(2) span', 'Workshop', 'Workshop'],
  ['.contact-info>div:nth-child(3) span', 'Email', 'Email'],
  ['#contact-form > label:nth-of-type(1) span', 'Project location', 'Lokasi proyek'],
  ['#contact-form > label:nth-of-type(2) span', 'Project brief', 'Ringkasan proyek'],
  ['#contact-form input[name="location"]', 'Example: Java Sea, East Kalimantan, nearshore jetty area', 'Contoh: Laut Jawa, Kalimantan Timur, area jetty nearshore', 'placeholder'],
  ['#contact-form textarea[name="message"]', 'Tell us the scope, target depth, water depth, schedule, access constraints, and expected deliverables.', 'Ceritakan lingkup pekerjaan, target kedalaman, kedalaman air, jadwal, kendala akses, dan deliverable yang dibutuhkan.', 'placeholder'],
  ['.form-row:nth-child(1) label:nth-child(1) span', 'Name', 'Nama'],
  ['.form-row:nth-child(1) label:nth-child(2) span', 'Email', 'Email'],
  ['.form-row:nth-child(2) label:nth-child(1) span', 'Company', 'Perusahaan'],
  ['.form-row:nth-child(2) label:nth-child(2) span', 'Service', 'Layanan'],
  ['.form-submit p', 'Your email client will open with a prepared enquiry.', 'Aplikasi email Anda akan terbuka dengan pesan yang sudah disiapkan.'],
  ['.form-submit button', 'Send enquiry <span>→</span>', 'Kirim enquiry <span>→</span>', 'html'],
  ['.vessel-modal-category', 'Marine asset', 'Aset kapal'],
  ['.footer-brand-block>p', 'Integrated geophysical, geotechnical, drilling, laboratory, and field support capability for marine and land projects.', 'Kapabilitas geofisika, geoteknik, pengeboran, laboratorium, dan dukungan lapangan untuk proyek marine dan darat.'],
  ['.footer-pages-title', 'Pages', 'Halaman'],
  ['.footer-office-title', 'Head Office', 'Kantor pusat'],
  ['.footer-workshop-title', 'Workshop', 'Workshop'],
  ['.footer-copyright', '© Copyright PT Taka Hydrocore Indonesia 2026. All Rights Reserved.', '© Copyright PT Taka Hydrocore Indonesia 2026. Seluruh Hak Dilindungi.']
];

const serviceOptionTranslations = {
  en: ['Marine geophysical survey', 'Offshore geotechnical survey', 'Seabed geotechnical drilling', 'Nearshore geotechnical drilling', 'Exploratory drilling', 'Onshore geotechnical survey'],
  id: ['Survei geofisika marine', 'Survei geoteknik offshore', 'Pengeboran geoteknik seabed', 'Pengeboran geoteknik nearshore', 'Pengeboran eksplorasi', 'Survei geoteknik onshore']
};

const setElementContent = (selector, content, mode = 'text') => {
  if (selector === 'title') {
    document.title = content;
    return;
  }
  if (selector.startsWith('meta[')) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.setAttribute('content', content);
    return;
  }
  document.querySelectorAll(selector).forEach((element) => {
    if (mode === 'html') element.innerHTML = content;
    else if (mode === 'placeholder') element.setAttribute('placeholder', content);
    else if (mode === 'title') element.setAttribute('title', content);
    else element.textContent = content;
  });
};

const boardPageTranslations = {
  en: [
    ['title', 'Board of Commissioners & Directors | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Board of Commissioners and Board of Directors of PT Taka Hydrocore Indonesia.'],
    ['.board-page .preloader-inner p', 'Preparing leadership profile'],
    ['.board-hero-copy .kicker', 'Corporate governance'],
    ['.board-hero-copy h1', 'Board of Commissioners & Board of Directors'],
    ['.board-hero-copy>p:last-child', 'Governance and management profiles representing the operational experience and business stewardship behind PT Taka Hydrocore Indonesia.'],
    ['.board-section>.section-label', '<span>01</span> Company Leadership', 'html'],
    ['.board-section-head .kicker', 'Board Profile'],
    ['.board-section-head h2', 'Leadership with clear operational discipline.'],
    ['.board-card:nth-child(1) .board-group', 'Board of Commissioners'],
    ['.board-card:nth-child(1) .board-role', 'President Commissioner'],
    ['.board-card:nth-child(1) .board-bio', 'Rahmad Indrawan was born in Padang in 1971 and graduated from Andalas University Padang. His professional experience covers onshore and offshore work.'],
    ['.board-card:nth-child(2) .board-group', 'Board of Directors'],
    ['.board-card:nth-child(2) .board-role', 'President Director'],
    ['.board-card:nth-child(2) .board-bio', 'M. Syukri Fitrialdi was born in Padang in 1968 and completed bachelor and master studies at Institut Teknologi Bandung (ITB).'],
    ['.board-card:nth-child(3) .board-group', 'Board of Directors'],
    ['.board-card:nth-child(3) .board-role', 'Finance & Operational Director'],
    ['.board-card:nth-child(3) .board-bio', 'Denni Andri was born in Padang, West Sumatera in 1971 and graduated from Bandung Institute of Technology (ITB).'],
    ['.board-card:nth-child(4) .board-group', 'Board of Commissioners'],
    ['.board-card:nth-child(4) .board-role', 'Commissioner'],
    ['.board-card:nth-child(4) .board-bio', 'Heri Sudradjat was born in Bandung, West Java in 1961 and has experience in HR leadership within multinational company environments.'],
    ['.board-card:nth-child(5) .board-group', 'Board of Commissioners'],
    ['.board-card:nth-child(5) .board-role', 'Commissioner'],
    ['.board-card:nth-child(5) .board-bio', 'Triana Yuda Agung Wibawa was born in Jayapura, Papua in 1981 and graduated from Maranatha University, majoring in electrical engineering.'],
    ['.board-card a', 'Original profile'],,,,,,,
  ],
  id: [
    ['title', 'Dewan Komisaris & Direksi | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Dewan Komisaris dan Direksi PT Taka Hydrocore Indonesia.'],
    ['.board-page .preloader-inner p', 'Menyiapkan profil pimpinan'],
    ['.board-hero-copy .kicker', 'Tata kelola perusahaan'],
    ['.board-hero-copy h1', 'Dewan Komisaris & Direksi'],
    ['.board-hero-copy>p:last-child', 'Profil tata kelola dan manajemen yang mewakili pengalaman operasional serta kepemimpinan bisnis PT Taka Hydrocore Indonesia.'],
    ['.board-section>.section-label', '<span>01</span> Pimpinan Perusahaan', 'html'],
    ['.board-section-head .kicker', 'Profil Pimpinan'],
    ['.board-section-head h2', 'Kepemimpinan dengan disiplin operasional yang jelas.'],
    ['.board-card:nth-child(1) .board-group', 'Dewan Komisaris'],
    ['.board-card:nth-child(1) .board-role', 'Presiden Komisaris'],
    ['.board-card:nth-child(1) .board-bio', 'Rahmad Indrawan lahir di Padang pada 1971 dan lulus dari Universitas Andalas Padang. Pengalaman profesionalnya mencakup pekerjaan onshore dan offshore.'],
    ['.board-card:nth-child(2) .board-group', 'Direksi'],
    ['.board-card:nth-child(2) .board-role', 'Presiden Direktur'],
    ['.board-card:nth-child(2) .board-bio', 'M. Syukri Fitrialdi lahir di Padang pada 1968 dan menyelesaikan pendidikan sarjana serta magister di Institut Teknologi Bandung (ITB).'],
    ['.board-card:nth-child(3) .board-group', 'Direksi'],
    ['.board-card:nth-child(3) .board-role', 'Direktur Keuangan & Operasional'],
    ['.board-card:nth-child(3) .board-bio', 'Denni Andri lahir di Padang, Sumatera Barat pada 1971 dan lulus dari Bandung Institute of Technology (ITB).'],
    ['.board-card:nth-child(4) .board-group', 'Dewan Komisaris'],
    ['.board-card:nth-child(4) .board-role', 'Komisaris'],
    ['.board-card:nth-child(4) .board-bio', 'Heri Sudradjat lahir di Bandung, Jawa Barat pada 1961 dan memiliki pengalaman kepemimpinan HR di lingkungan perusahaan multinasional.'],
    ['.board-card:nth-child(5) .board-group', 'Dewan Komisaris'],
    ['.board-card:nth-child(5) .board-role', 'Komisaris'],
    ['.board-card:nth-child(5) .board-bio', 'Triana Yuda Agung Wibawa lahir di Jayapura, Papua pada 1981 dan lulus dari Universitas Maranatha, jurusan teknik elektro.'],
    ['.board-card a', 'Profil asli']
  ]
};

const applyBoardLanguage = (language) => {
  if (!document.body.classList.contains('board-page')) return;
  const boardPageTranslationsV2 = {
    en: [
      ['title', 'Board of Commissioners & Directors | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Board of Commissioners and Board of Directors of PT Taka Hydrocore Indonesia.'],
      ['.board-page .preloader-inner p', 'Preparing leadership profile'],
      ['.board-hero-copy .kicker', 'Corporate governance'],
      ['.board-hero-copy h1', 'Board of Commissioners & Board of Directors'],
      ['.board-hero-copy>p:last-child', 'Governance and management profiles representing the operational experience and business stewardship behind PT Taka Hydrocore Indonesia.'],
      ['.board-section>.section-label', '<span>01</span> Company Leadership', 'html'],
      ['.board-section-head .kicker', 'Board Profile'],
      ['.board-section-head h2', 'Leadership with clear operational discipline.'],
      ['.board-section-head>p:not(.kicker)', 'Board members are presented with their governance role, management responsibility, and professional background for the company profile.'],
      ['.board-profile-group:nth-of-type(1) .board-group-title', 'Board of Directors'],
      ['.board-profile-group:nth-of-type(2) .board-group-title', 'Board of Commissioners'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name p', 'President Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name h3', 'M. Syukri Fitrialdi'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-bio', 'M. Syukri Fitrialdi was born in Padang in 1968. He earned both his bachelor\'s and master\'s degrees from Institut Teknologi Bandung (ITB). Known for his intelligence, professionalism, and sense of humor, he has built more than two decades of experience in geotechnical and geohydrological work, deep water well drilling, deep exploratory drilling, water well drilling and pumping, and onshore, offshore, and nearshore geotechnical investigation.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-profile-name p', 'Finance & Administration Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-bio', 'Denni Andri was born in Padang, West Sumatera, in 1971 and graduated from Bandung Institute of Technology (ITB). His entrepreneurial strength has been evident since the founding of the company and its business group. In 2012, he was selected as a finalist for Ernst & Young Entrepreneur of the Year. His clear vision and passion for developing national industries continue to guide the company\'s long-term growth.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-profile-name p', 'Commercial Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-bio', 'Frans Eduard Zandstra was born in Jakarta in 1985 and graduated from Bandung Institute of Technology (ITB), majoring in Ocean Engineering. He began his professional career in 2007. With his experience in technical and commercial project work, he was appointed Commercial Director of PT Taka Hydrocore Indonesia.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-profile-name p', 'Operational Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-bio', 'Novandi Kusuma Prasetya was born in Mataram in 1988 and graduated from Diponegoro University, majoring in Geological Engineering. He has a strong background in engineering and project execution across offshore and onshore environments at PT Taka Hydrocore Indonesia. He is committed to continuous learning and professional growth, and maintains a collaborative approach across engineering and project teams.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-profile-name p', 'President Commissioner'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-bio', 'Rahmad Indrawan was born in Padang in 1971 and graduated from Andalas University, Padang. Known as a humble and charismatic professional, he has developed his expertise through onshore and offshore geotechnical projects and continues to support the company through practical field insight and leadership.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name p', 'Commissioner'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name h3', 'Triana Yuda Agung W.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-bio', 'Triana Yuda Agung Wibawa was born in Jayapura, Papua, in 1981. A graduate of Maranatha University with a major in electrical engineering, he brings years of professional banking experience to the Taka Group. His financial discipline supports cash flow supervision, financial control, and healthy company management.']
    ],
    id: [
      ['title', 'Dewan Komisaris & Direksi | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Dewan Komisaris dan Direksi PT Taka Hydrocore Indonesia.'],
      ['.board-page .preloader-inner p', 'Menyiapkan profil pimpinan'],
      ['.board-hero-copy .kicker', 'Tata kelola perusahaan'],
      ['.board-hero-copy h1', 'Dewan Komisaris & Direksi'],
      ['.board-hero-copy>p:last-child', 'Profil tata kelola dan manajemen yang mewakili pengalaman operasional serta kepemimpinan bisnis PT Taka Hydrocore Indonesia.'],
      ['.board-section>.section-label', '<span>01</span> Pimpinan Perusahaan', 'html'],
      ['.board-section-head .kicker', 'Profil Pimpinan'],
      ['.board-section-head h2', 'Kepemimpinan dengan disiplin operasional yang jelas.'],
      ['.board-section-head>p:not(.kicker)', 'Setiap anggota pimpinan ditampilkan dengan peran tata kelola, tanggung jawab manajemen, dan biografi ringkas untuk profil perusahaan resmi.'],
      ['.board-profile-group:nth-of-type(1) .board-group-title', 'Direksi'],
      ['.board-profile-group:nth-of-type(2) .board-group-title', 'Komisaris'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name p', 'Direktur Utama'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name h3', 'M. Syukri Fitrialdi'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-bio', 'M. Syukri Fitrialdi lahir di Padang pada 1968. Ia menyelesaikan pendidikan sarjana dan magister di Institut Teknologi Bandung (ITB). Dikenal cerdas, profesional, dan humoris, ia memiliki pengalaman lebih dari dua dekade dalam bidang geotechnical dan geohydrological, deep water well drilling, deep exploratory drilling, water well drilling and pumping, serta investigasi geoteknik onshore, offshore, dan nearshore.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-profile-name p', 'Direktur Keuangan & Administrasi'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-bio', 'Denni Andri lahir di Padang, Sumatera Barat, pada 1971 dan lulus dari Bandung Institute of Technology (ITB). Jiwa entrepreneurship-nya terlihat sejak mendirikan perusahaan dan business group. Pada 2012, ia terpilih sebagai finalis Ernst & Young Entrepreneur of the Year. Visi yang jelas dan semangatnya dalam mengembangkan industri nasional terus menjadi arah pertumbuhan perusahaan.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-profile-name p', 'Direktur Komersial'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-bio', 'Frans Eduard Zandstra lahir di Jakarta pada 1985 dan lulus dari Bandung Institute of Technology (ITB), jurusan Ocean Engineering. Ia memulai karier profesionalnya pada 2007. Dengan pengalamannya dalam pekerjaan teknis dan komersial proyek, ia dipercaya sebagai Direktur Komersial PT Taka Hydrocore Indonesia.'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-profile-name p', 'Direktur Operasional'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-bio', 'Novandi Kusuma Prasetya lahir di Mataram pada 1988 dan lulus dari Universitas Diponegoro, jurusan Geological Engineering. Ia memiliki latar belakang yang kuat dalam engineering dan project execution di lingkungan offshore maupun onshore di PT Taka Hydrocore Indonesia. Ia berkomitmen pada pembelajaran berkelanjutan, pertumbuhan profesional, dan kerja kolaboratif lintas tim engineering dan proyek.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-profile-name p', 'Komisaris Utama'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-bio', 'Rahmad Indrawan lahir di Padang pada 1971 dan lulus dari Universitas Andalas, Padang. Dikenal rendah hati dan karismatik, ia mengembangkan keahlian profesionalnya melalui proyek geoteknik onshore dan offshore, serta mendukung perusahaan melalui pemahaman lapangan dan kepemimpinan yang praktis.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name p', 'Komisaris'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name h3', 'Triana Yuda Agung W.'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-bio', 'Triana Yuda Agung Wibawa lahir di Jayapura, Papua, pada 1981. Lulusan Universitas Maranatha jurusan teknik elektro ini memiliki pengalaman profesional di sektor perbankan. Disiplin finansialnya mendukung pengawasan cash flow, kontrol keuangan, dan pengelolaan perusahaan yang sehat.']
    ]
  };
  const translations = boardPageTranslationsV2[language] || boardPageTranslationsV2.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const companyProfilePageTranslations = {
  en: [
    ['title', 'Profil Perusahaan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia company profile for geotechnical and geophysical survey services.'],
    ['.company-profile-page .preloader-inner p', 'Preparing company profile'],
    ['.profile-hero-copy .kicker', 'Company Profile'],
    ['.profile-hero h1', 'Geotechnical and geophysical survey services.'],
    ['.profile-hero-copy>p:not(.kicker)', 'PT Taka Hydrocore Indonesia integrates offshore, nearshore, onshore, laboratory, and vessel-based capability for subsurface survey and engineering support.'],
    ['.profile-hero-footprint span', 'Operational footprint'],
    ['.profile-hero-footprint strong', 'Survey execution across Indonesian waters and selected international assignments.'],
    ['.profile-overview>.section-label', '<span>01</span> About The Group', 'html'],
    ['.profile-group-summary-brand span', 'Indonesian technical services group'],
    ['.profile-group-summary-copy .kicker', 'About Us'],
    ['.profile-group-summary-copy h2', 'Part of a focused Indonesian technical services group.'],
    ['.profile-group-summary-copy p:nth-of-type(2)', 'Taka Group was founded in 1999, starting with Taka Turbomachinery Indonesia. The group has grown into four subsidiary companies and one sister company with different service focus and capabilities.'],
    ['.profile-group-summary-copy p:nth-of-type(3)', 'THI supports offshore and onshore geophysical and geotechnical survey work, strengthened by soil laboratory, engineering service, vessel operation, and related technical service capability.'],
    ['.profile-overview-stat:nth-child(1) span', 'Taka Group established'],
    ['.profile-overview-stat:nth-child(2) span', 'Subsidiary companies'],
    ['.profile-group-panel-head span', 'Group structure'],
    ['.profile-group-panel-head p', 'Taka Group connects four operating companies and one sister company across machinery, precision, survey execution, laboratory, and vessel management capability.'],
    ['.group-structure-parent span', 'Parent company'],
    ['.group-structure-node:nth-child(1) p', 'Turbomachinery service'],
    ['.group-structure-node:nth-child(2) p', 'Rotating equipment service & turbomachinery parts manufacture'],
    ['.group-structure-node:nth-child(3) p', 'Offshore/onshore geophysical & geotechnical survey'],
    ['.group-sister-node span', 'Soil laboratory & engineering service'],
    ['.group-structure-node:nth-child(4) p', 'Ship owner, vessel operator & management'],
    ['.group-structure-note', 'Ready to collaborate with partners for service enhancement.'],
    ['.profile-vision>.section-label', '<span>02</span> Vision & Mission', 'html'],
    ['.profile-vision-copy .kicker', 'Taka Hydrocore Indonesia'],
    ['.profile-vision-copy h2', 'Local survey capability with safe field execution.'],
    ['.profile-vision-intro', 'Established in 2010, THI supports geophysical, geotechnical, hydrogeological, environmental, and water-well drilling scopes for energy, mining, infrastructure, contractor, and consulting clients.'],
    ['.profile-vision-badges span:nth-child(1)', '<strong>2010</strong><em>Established in Indonesia</em>', 'html'],
    ['.profile-vision-badges span:nth-child(2)', '<strong>PDN</strong><em>Local Indonesian company</em>', 'html'],
    ['.profile-vision-badges span:nth-child(3)', '<strong>CIVD</strong><em>SKK Migas vendor database</em>', 'html'],
    ['.profile-vision-badges span:nth-child(4)', '<strong>SKUP</strong><em>MIGAS supporting capability</em>', 'html'],
    ['.profile-vision-card-main span', 'Vision'],
    ['.profile-vision-card-main h3', 'To become a well-known drilling services, surveys, and data acquisition company in Indonesia as well as abroad.'],
    ['.profile-mission-grid article:nth-child(1) span', 'Quality & innovation'],
    ['.profile-mission-grid article:nth-child(1) p', 'Deliver better services by improving key resources and field performance.'],
    ['.profile-mission-grid article:nth-child(2) span', 'Safe workplace'],
    ['.profile-mission-grid article:nth-child(2) p', 'Maintain a safe, healthy, and productive working environment.'],
    ['.profile-mission-grid article:nth-child(3) span', 'Regulatory discipline'],
    ['.profile-mission-grid article:nth-child(3) p', 'Comply with relevant regulations, standards, and project requirements.'],
    ['.profile-mission-grid article:nth-child(4) span', 'Shared value'],
    ['.profile-mission-grid article:nth-child(4) p', 'Create consistent value for clients, people, partners, and stakeholders.'],
    ['.profile-compliance-note span', 'Registered capability'],
    ['.profile-compliance-note p', "CIVD and SKUP credentials support THI's oil and gas exploration consulting and contractor capability."],
    ['.profile-culture>.section-label', '<span>03</span> Corporate Culture', 'html'],
    ['.profile-culture .profile-section-head .kicker', 'Our Corporate Culture'],
    ['.profile-culture .profile-section-head h2', 'Simple values for dependable field execution.'],
    ['.sigap-service h3', 'Service Excellence'],
    ['.sigap-service p', 'Doing a great job every time and everywhere.'],
    ['.sigap-integrity h3', 'Integrity'],
    ['.sigap-integrity p', 'The confidence to do the right thing and make the right decision.'],
    ['.sigap-grow h3', 'Grow'],
    ['.sigap-grow p', 'Consistently maximize competence for better results.'],
    ['.sigap-awareness h3', 'Awareness'],
    ['.sigap-awareness p', 'Respect, trust, and care for each other and the community.'],
    ['.sigap-professionalism h3', 'Professionalism'],
    ['.sigap-professionalism p', 'Professional delivery of work and service.'],
    ['.sigap-notes article:nth-child(1)', '<span>S / Service Excellence</span><ul><li>Proactive</li><li>Exceed customer expectations</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(2)', '<span>I / Integrity</span><ul><li>Trustworthy</li><li>Committed</li><li>Responsible</li><li>Keep your word</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(3)', '<span>G / Grow</span><ul><li>Continual learning</li><li>Adaptive</li><li>Innovative</li><li>Deliver better output</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(4)', '<span>A / Awareness</span><ul><li>Respect diversity</li><li>Protect company reputation</li><li>Give recognition</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(5)', '<span>P / Professionalism</span><ul><li>Work ethic compliance</li><li>Do the best</li><li>Teamwork</li><li>Lead by example</li></ul>', 'html'],
    ['.profile-services>.section-label', '<span>04</span> Services', 'html'],
    ['.profile-services-head .kicker', 'Offshore, Nearshore & Onshore'],
    ['.profile-services-head h2', 'Survey services built around real field conditions.'],
    ['.profile-services-head>p', 'THI combines marine geophysical acquisition, offshore geotechnical drilling, seabed investigation, nearshore platforms, land-based crews, and technical reporting into practical survey scopes.'],
    ['.profile-service-card:nth-child(1) span', '01 / Offshore'],
    ['.profile-service-card:nth-child(1) h3', 'Marine geophysical & offshore geotechnical execution'],
    ['.profile-service-card:nth-child(1) p', 'High-resolution seismic, geophysical acquisition, drilling, CPT, sampling, and seabed investigation support.'],
    ['.profile-service-card:nth-child(2) span', '02 / Nearshore'],
    ['.profile-service-card:nth-child(2) h3', 'Barge-supported shallow water investigation'],
    ['.profile-service-card:nth-child(2) p', 'Nearshore platforms for coastal, jetty, reclamation, and infrastructure preparation works.'],
    ['.profile-service-card:nth-child(3) span', '03 / Onshore'],
    ['.profile-service-card:nth-child(3) h3', 'Land-based field survey and site support'],
    ['.profile-service-card:nth-child(3) p', 'Ground investigation, environmental field activity, and project site preparation support.'],
    ['.profile-service-explainer-copy .kicker', 'Project support'],
    ['.profile-service-explainer-copy h3', 'Practical survey planning, shaped by the condition of each site.'],
    ['.profile-service-explainer-copy p:not(.kicker)', 'Before mobilization, THI reviews the water depth, soil target, site access, equipment spread, crew requirement, and reporting format. From there, the team connects the right survey method with a field plan that is realistic to execute and clear for the client to follow.'],
    ['.profile-service-scope p:nth-child(1)', '<strong>Marine</strong><span>Downhole investigation, seabed work, and geophysical acquisition for offshore decisions.</span>', 'html'],
    ['.profile-service-scope p:nth-child(2)', '<strong>Nearshore</strong><span>Shallow-water investigation arranged around access, draft, tides, and working platform needs.</span>', 'html'],
    ['.profile-service-scope p:nth-child(3)', '<strong>Onshore</strong><span>Land-based geotechnical and environmental field work prepared around ground condition and site logistics.</span>', 'html'],
    ['.profile-service-scope p:nth-child(4)', '<strong>Support</strong><span>Equipment readiness, field crew, data handling, and reporting workflow tied into one execution plan.</span>', 'html'],
    ['.profile-experience>.section-label', '<span>05</span> Experience', 'html'],
    ['.profile-experience-head .kicker', 'Extensive Experience'],
    ['.profile-experience-head h2', 'Field-proven across geophysical, geotechnical, metocean, hydro-oceanography, and environmental survey work.'],
    ['.profile-fleet>.section-label', '<span>05</span> Operational Support', 'html'],
    ['.profile-fleet .profile-section-head .kicker', 'Assets & Equipment'],
    ['.profile-fleet .profile-section-head h2', 'Operational support selected around each survey method.'],
    ['.profile-fleet .profile-section-head>p:not(.kicker)', 'Vessels, nearshore platforms, drilling systems, geophysical equipment, and field crews are prepared around the site condition and technical requirement of each project.'],
    ['.profile-fleet-card:nth-child(1) span', 'Marine support'],
    ['.profile-fleet-card:nth-child(1) h3', 'AG Geodrill, SS Barakuda & Voyager Explorer'],
    ['.profile-fleet-card:nth-child(1) p', 'Indonesian flag platforms supporting marine geophysical, offshore geotechnical, and nearshore survey scopes.'],
    ['.profile-fleet-collaboration span', 'Collaboration with'],
    ['.profile-vessel-card .profile-card-link', 'View vessels <span aria-hidden="true">→</span>', 'html'],
    ['.profile-fleet-card:nth-child(2) .profile-fleet-copy>span', 'Nearshore access'],
    ['.profile-fleet-card:nth-child(2) h3', 'Elevated Barge & Amphibious Platform'],
    ['.profile-fleet-card:nth-child(2) p', 'Platforms suited for nearshore, inshore, environmental, and infrastructure preparation study requirements.'],
    ['.profile-fleet-card:nth-child(2) .profile-card-link', 'View nearshore service <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(1) .profile-card-link', 'View seismic service <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(2) .profile-card-link', 'View drill rig <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(3) .profile-card-link', 'View onshore service <span aria-hidden="true">→</span>', 'html'],
    ['.profile-lab-equipment>.section-label', '<span>06</span> Laboratory', 'html'],
    ['.profile-lab-copy .kicker', 'Soil & Geotechnical Laboratory'],
    ['.profile-lab-copy h2', 'Laboratory capability supporting reliable engineering interpretation.'],
    ['.profile-lab-copy>p:last-child', 'THI references a soil and geotechnical laboratory in Ciputat, Tangerang Selatan, supporting index, strength, consolidation, shear, and supporting geotechnical testing workflows.'],
    ['.profile-customers>.section-label', '<span>07</span> Value Customers', 'html'],
    ['.profile-customers .profile-section-head .kicker', 'Some of Our Value Customers'],
    ['.profile-customers .profile-section-head h2', 'Trusted by energy, infrastructure, engineering, and survey partners.']
  ],
  id: [
    ['title', 'Company Profile | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Profil perusahaan PT Taka Hydrocore Indonesia untuk layanan survei geoteknik dan geofisika.'],
    ['.company-profile-page .preloader-inner p', 'Menyiapkan profil perusahaan'],
    ['.profile-hero-copy .kicker', 'Profil Perusahaan'],
    ['.profile-hero h1', 'Layanan survei geoteknik dan geofisika.'],
    ['.profile-hero-copy>p:not(.kicker)', 'PT Taka Hydrocore Indonesia mengintegrasikan kapabilitas offshore, nearshore, onshore, laboratorium, dan kapal survei untuk dukungan survei bawah permukaan dan engineering.'],
    ['.profile-hero-footprint span', 'Jejak operasional'],
    ['.profile-hero-footprint strong', 'Eksekusi survei di perairan Indonesia dan beberapa penugasan internasional.'],
    ['.profile-overview>.section-label', '<span>01</span> Tentang Grup', 'html'],
    ['.profile-group-summary-brand span', 'Grup layanan teknis Indonesia'],
    ['.profile-group-summary-copy .kicker', 'Tentang Kami'],
    ['.profile-group-summary-copy h2', 'Bagian dari grup layanan teknis Indonesia yang fokus.'],
    ['.profile-group-summary-copy p:nth-of-type(2)', 'Taka Group berdiri pada 1999, dimulai dari Taka Turbomachinery Indonesia. Grup berkembang menjadi empat anak perusahaan dan satu sister company dengan fokus layanan dan kapabilitas berbeda.'],
    ['.profile-group-summary-copy p:nth-of-type(3)', 'THI mendukung pekerjaan survei geofisika dan geoteknik offshore maupun onshore, diperkuat oleh laboratorium tanah, layanan engineering, operasi kapal, dan kapabilitas teknis terkait.'],
    ['.profile-overview-stat:nth-child(1) span', 'Taka Group berdiri'],
    ['.profile-overview-stat:nth-child(2) span', 'Anak perusahaan'],
    ['.profile-group-panel-head span', 'Struktur grup'],
    ['.profile-group-panel-head p', 'Taka Group menghubungkan empat perusahaan operasional dan satu sister company di bidang machinery, precision, eksekusi survei, laboratorium, dan pengelolaan kapal.'],
    ['.group-structure-parent span', 'Perusahaan induk'],
    ['.group-structure-node:nth-child(1) p', 'Layanan turbomachinery'],
    ['.group-structure-node:nth-child(2) p', 'Layanan rotating equipment & manufaktur parts turbomachinery'],
    ['.group-structure-node:nth-child(3) p', 'Survei geofisika & geoteknik offshore/onshore'],
    ['.group-sister-node span', 'Laboratorium tanah & layanan engineering'],
    ['.group-structure-node:nth-child(4) p', 'Pemilik kapal, operator kapal & manajemen'],
    ['.group-structure-note', 'Siap berkolaborasi dengan partner untuk peningkatan layanan.'],
    ['.profile-vision>.section-label', '<span>02</span> Visi & Misi', 'html'],
    ['.profile-vision-copy .kicker', 'Taka Hydrocore Indonesia'],
    ['.profile-vision-copy h2', 'Kapabilitas survei lokal dengan eksekusi lapangan aman.'],
    ['.profile-vision-intro', 'Berdiri pada 2010, THI mendukung scope geofisika, geoteknik, hidrogeologi, lingkungan, dan pengeboran sumur air untuk klien energi, pertambangan, infrastruktur, kontraktor, dan konsultan.'],
    ['.profile-vision-badges span:nth-child(1)', '<strong>2010</strong><em>Berdiri di Indonesia</em>', 'html'],
    ['.profile-vision-badges span:nth-child(2)', '<strong>PDN</strong><em>Perusahaan lokal Indonesia</em>', 'html'],
    ['.profile-vision-badges span:nth-child(3)', '<strong>CIVD</strong><em>Database vendor SKK Migas</em>', 'html'],
    ['.profile-vision-badges span:nth-child(4)', '<strong>SKUP</strong><em>Kemampuan usaha penunjang MIGAS</em>', 'html'],
    ['.profile-vision-card-main span', 'Visi'],
    ['.profile-vision-card-main h3', 'Menjadi perusahaan jasa pengeboran, survei, dan akuisisi data yang dikenal di Indonesia maupun luar negeri.'],
    ['.profile-mission-grid article:nth-child(1) span', 'Kualitas & inovasi'],
    ['.profile-mission-grid article:nth-child(1) p', 'Memberikan layanan lebih baik melalui peningkatan sumber daya dan performa lapangan.'],
    ['.profile-mission-grid article:nth-child(2) span', 'Lingkungan kerja aman'],
    ['.profile-mission-grid article:nth-child(2) p', 'Menjaga lingkungan kerja yang aman, sehat, dan produktif.'],
    ['.profile-mission-grid article:nth-child(3) span', 'Disiplin regulasi'],
    ['.profile-mission-grid article:nth-child(3) p', 'Mematuhi regulasi, standar, dan kebutuhan proyek yang relevan.'],
    ['.profile-mission-grid article:nth-child(4) span', 'Nilai bersama'],
    ['.profile-mission-grid article:nth-child(4) p', 'Menciptakan nilai konsisten untuk klien, tim, partner, dan pemangku kepentingan.'],
    ['.profile-compliance-note span', 'Kapabilitas terdaftar'],
    ['.profile-compliance-note p', 'Kredensial CIVD dan SKUP mendukung kapabilitas THI sebagai konsultan serta kontraktor eksplorasi minyak dan gas.'],
    ['.profile-culture>.section-label', '<span>03</span> Budaya Perusahaan', 'html'],
    ['.profile-culture .profile-section-head .kicker', 'Budaya Perusahaan Kami'],
    ['.profile-culture .profile-section-head h2', 'Nilai sederhana untuk eksekusi lapangan yang dapat diandalkan.'],
    ['.sigap-service h3', 'Service Excellence'],
    ['.sigap-service p', 'Melakukan pekerjaan terbaik setiap saat dan di mana pun.'],
    ['.sigap-integrity h3', 'Integrity'],
    ['.sigap-integrity p', 'Keberanian untuk melakukan hal yang benar dan mengambil keputusan yang tepat.'],
    ['.sigap-grow h3', 'Grow'],
    ['.sigap-grow p', 'Terus meningkatkan kompetensi untuk hasil yang lebih baik.'],
    ['.sigap-awareness h3', 'Awareness'],
    ['.sigap-awareness p', 'Menghargai, percaya, dan peduli pada sesama serta komunitas.'],
    ['.sigap-professionalism h3', 'Professionalism'],
    ['.sigap-professionalism p', 'Bekerja dan memberikan layanan secara profesional.'],
    ['.sigap-notes article:nth-child(1)', '<span>S / Service Excellence</span><ul><li>Proaktif</li><li>Melebihi ekspektasi pelanggan</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(2)', '<span>I / Integrity</span><ul><li>Dapat dipercaya</li><li>Berkomitmen</li><li>Bertanggung jawab</li><li>Menepati janji</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(3)', '<span>G / Grow</span><ul><li>Terus belajar</li><li>Adaptif</li><li>Inovatif</li><li>Memberikan output yang lebih baik</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(4)', '<span>A / Awareness</span><ul><li>Menghargai keberagaman</li><li>Menjaga reputasi perusahaan</li><li>Memberi apresiasi</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(5)', '<span>P / Professionalism</span><ul><li>Patuh pada etika kerja</li><li>Melakukan yang terbaik</li><li>Kerja sama tim</li><li>Memimpin dengan teladan</li></ul>', 'html'],
    ['.profile-services>.section-label', '<span>04</span> Layanan', 'html'],
    ['.profile-services-head .kicker', 'Offshore, Nearshore & Onshore'],
    ['.profile-services-head h2', 'Layanan survei untuk kondisi lapangan nyata.'],
    ['.profile-services-head>p', 'THI menggabungkan akuisisi geofisika marine, pengeboran geoteknik offshore, investigasi seabed, platform nearshore, tim darat, dan pelaporan teknis ke dalam scope survei yang praktis.'],
    ['.profile-service-card:nth-child(1) span', '01 / Offshore'],
    ['.profile-service-card:nth-child(1) h3', 'Eksekusi geofisika marine & geoteknik offshore'],
    ['.profile-service-card:nth-child(1) p', 'Dukungan seismik resolusi tinggi, akuisisi geofisika, pengeboran, CPT, sampling, dan investigasi seabed.'],
    ['.profile-service-card:nth-child(2) span', '02 / Nearshore'],
    ['.profile-service-card:nth-child(2) h3', 'Investigasi perairan dangkal berbasis barge'],
    ['.profile-service-card:nth-child(2) p', 'Platform nearshore untuk pekerjaan pesisir, jetty, reklamasi, dan persiapan infrastruktur.'],
    ['.profile-service-card:nth-child(3) span', '03 / Onshore'],
    ['.profile-service-card:nth-child(3) h3', 'Survei lapangan darat dan dukungan site'],
    ['.profile-service-card:nth-child(3) p', 'Investigasi tanah, aktivitas lapangan lingkungan, dan dukungan persiapan lokasi proyek.'],
    ['.profile-service-explainer-copy .kicker', 'Dukungan proyek'],
    ['.profile-service-explainer-copy h3', 'Perencanaan survei yang disesuaikan dengan kondisi tiap site.'],
    ['.profile-service-explainer-copy p:not(.kicker)', 'Sebelum mobilisasi, THI meninjau kedalaman air, target tanah, akses lokasi, kebutuhan peralatan, kebutuhan kru, dan format pelaporan. Dari situ, tim menyusun metode survei dan rencana kerja lapangan yang realistis untuk dijalankan serta mudah dipahami klien.'],
    ['.profile-service-scope p:nth-child(1)', '<strong>Marine</strong><span>Investigasi downhole, pekerjaan seabed, dan akuisisi geofisika untuk keputusan offshore.</span>', 'html'],
    ['.profile-service-scope p:nth-child(2)', '<strong>Nearshore</strong><span>Investigasi perairan dangkal yang disusun berdasarkan akses, draft, pasang surut, dan kebutuhan platform kerja.</span>', 'html'],
    ['.profile-service-scope p:nth-child(3)', '<strong>Onshore</strong><span>Pekerjaan geoteknik dan lingkungan berbasis darat yang mengikuti kondisi tanah dan logistik site.</span>', 'html'],
    ['.profile-service-scope p:nth-child(4)', '<strong>Support</strong><span>Kesiapan peralatan, kru lapangan, pengelolaan data, dan alur pelaporan dalam satu rencana eksekusi.</span>', 'html'],
    ['.profile-experience>.section-label', '<span>05</span> Pengalaman', 'html'],
    ['.profile-experience-head .kicker', 'Pengalaman Luas'],
    ['.profile-experience-head h2', 'Terbukti di pekerjaan geofisika, geoteknik, metocean, hidro-oseanografi, dan survei lingkungan.'],
    ['.profile-fleet>.section-label', '<span>05</span> Dukungan Operasional', 'html'],
    ['.profile-fleet .profile-section-head .kicker', 'Aset & Peralatan'],
    ['.profile-fleet .profile-section-head h2', 'Dukungan operasional dipilih berdasarkan metode survei.'],
    ['.profile-fleet .profile-section-head>p:not(.kicker)', 'Vessel, platform nearshore, sistem drilling, peralatan geofisika, dan kru lapangan disiapkan berdasarkan kondisi site dan kebutuhan teknis tiap proyek.'],
    ['.profile-fleet-card:nth-child(1) span', 'Dukungan marine'],
    ['.profile-fleet-card:nth-child(1) h3', 'AG Geodrill, SS Barakuda & Voyager Explorer'],
    ['.profile-fleet-card:nth-child(1) p', 'Platform berbendera Indonesia untuk dukungan geofisika marine, geoteknik offshore, dan survei nearshore.'],
    ['.profile-fleet-collaboration span', 'Kolaborasi dengan'],
    ['.profile-vessel-card .profile-card-link', 'Lihat vessel <span aria-hidden="true">→</span>', 'html'],
    ['.profile-fleet-card:nth-child(2) .profile-fleet-copy>span', 'Akses nearshore'],
    ['.profile-fleet-card:nth-child(2) h3', 'Elevated Barge & Amphibious Platform'],
    ['.profile-fleet-card:nth-child(2) p', 'Platform untuk kebutuhan nearshore, inshore, lingkungan, dan persiapan studi infrastruktur.'],
    ['.profile-fleet-card:nth-child(2) .profile-card-link', 'Lihat layanan nearshore <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(1) .profile-card-link', 'Lihat layanan seismik <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(2) .profile-card-link', 'Lihat drill rig <span aria-hidden="true">→</span>', 'html'],
    ['.equipment-grid article:nth-child(3) .profile-card-link', 'Lihat layanan onshore <span aria-hidden="true">→</span>', 'html'],
    ['.profile-lab-equipment>.section-label', '<span>06</span> Laboratorium', 'html'],
    ['.profile-lab-copy .kicker', 'Laboratorium Tanah & Geoteknik'],
    ['.profile-lab-copy h2', 'Kapabilitas laboratorium untuk mendukung interpretasi engineering yang andal.'],
    ['.profile-lab-copy>p:last-child', 'THI merujuk laboratorium tanah dan geoteknik di Ciputat, Tangerang Selatan, yang mendukung workflow pengujian indeks, kekuatan, konsolidasi, shear, dan pengujian geoteknik terkait.'],
    ['.profile-customers>.section-label', '<span>07</span> Klien Utama', 'html'],
    ['.profile-customers .profile-section-head .kicker', 'Sebagian Klien Kami'],
    ['.profile-customers .profile-section-head h2', 'Dipercaya oleh mitra energi, infrastruktur, engineering, dan survei.']
  ]
};

const applyCompanyProfileLanguage = (language) => {
  if (!document.body.classList.contains('company-profile-page')) return;
  const translations = companyProfilePageTranslations[language] || companyProfilePageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const servicesPageTranslations = {
  en: [
    ['title', 'Services | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia services for marine geophysical survey, offshore geotechnical survey, seabed geotechnical survey, nearshore drilling, exploratory drilling, and onshore geotechnical survey.'],
    ['.services-page .preloader-inner p', 'Preparing services'],
    ['.services-hero-copy .kicker', 'Services'],
    ['.services-hero h1', 'Geophysical and geotechnical services for marine and land environments.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI delivers high-resolution marine geophysical survey, offshore and seabed geotechnical investigation, nearshore drilling, exploratory drilling, and onshore geotechnical survey support.'],
    ['.services-directory>.section-label', '<span>01</span> Service Directory', 'html'],
    ['.services-directory-head .kicker', 'Core capabilities'],
    ['.services-directory-head h2', 'Six service lines configured around site condition, water depth, soil target, and project objective.'],
    ['#marine-seismic span', 'Marine Geophysical'],
    ['#marine-seismic h3', '2D/3D High Resolution Marine Seismic'],
    ['#marine-seismic p', 'High-resolution marine seismic and geophysical survey services for geohazard studies, exploration programs, and subsea planning.'],
    ['#marine-seismic li:nth-child(1)', '2D/3D HR and UHR seismic survey'],
    ['#marine-seismic li:nth-child(2)', 'Data acquisition, processing, and interpretation'],
    ['#marine-seismic li:nth-child(3)', 'Geohazard, exploration, and seabed mapping support'],
    ['#offshore-geotechnical span', 'Offshore Geotechnical'],
    ['#offshore-geotechnical h3', 'Offshore Geotechnical Survey'],
    ['#offshore-geotechnical p', 'Offshore soil investigation using drilling rigs with heave compensation, supported by sampling, coring, CPT, and downhole logging workflows.'],
    ['#offshore-geotechnical li:nth-child(1)', 'Heave compensated offshore drilling systems'],
    ['#offshore-geotechnical li:nth-child(2)', 'Undisturbed sampling, coring, CPT, and field testing'],
    ['#offshore-geotechnical li:nth-child(3)', 'Deployable on suitable marine platforms'],
    ['#seabed-drilling span', 'Seabed Geotechnical'],
    ['#seabed-drilling h3', 'Seabed Geotechnical'],
    ['#seabed-drilling p', 'Direct seabed investigation for shallow subsurface conditions using seabed CPT and vibrocore systems.'],
    ['#seabed-drilling li:nth-child(1)', 'Seabed CPT system support'],
    ['#seabed-drilling li:nth-child(2)', 'Vibrocore sampling for shallow seabed layers'],
    ['#seabed-drilling li:nth-child(3)', 'Geotechnical data for marine infrastructure planning'],
    ['#nearshore-drilling span', 'Nearshore Geotechnical'],
    ['#nearshore-drilling h3', 'Nearshore Geotechnical Drilling'],
    ['#nearshore-drilling p', 'Nearshore drilling and soil investigation using staging, pontoon, or shallow-water platform setups selected around water depth and access.'],
    ['#nearshore-drilling li:nth-child(1)', 'Wooden staging for shallow nearshore sites'],
    ['#nearshore-drilling li:nth-child(2)', 'Modular pontoon or barge-based drilling setup'],
    ['#nearshore-drilling li:nth-child(3)', 'Downhole CPT and sampling support'],
    ['#exploratory-drilling span', 'Exploratory Drilling'],
    ['#exploratory-drilling h3', 'Exploratory Drilling'],
    ['#exploratory-drilling p', 'Exploratory drilling for mining and resource programs with quality coring, suitable drilling diameter, and qualified field supervision.'],
    ['#exploratory-drilling li:nth-child(1)', 'NQ, HQ, and PQ coring options'],
    ['#exploratory-drilling li:nth-child(2)', 'Field geologist and drilling supervisor support'],
    ['#exploratory-drilling li:nth-child(3)', 'Depth range configured to project requirement'],
    ['#onshore-geotechnical span', 'Onshore Geotechnical'],
    ['#onshore-geotechnical h3', 'Onshore Geotechnical Survey'],
    ['#onshore-geotechnical p', 'Land-based geotechnical investigation with drilling, in-situ testing, sampling, and laboratory-backed engineering interpretation.'],
    ['#onshore-geotechnical li:nth-child(1)', 'SPT, pressuremeter, field vane shear, and CPT'],
    ['#onshore-geotechnical li:nth-child(2)', 'Disturbed and undisturbed soil sampling'],
    ['#onshore-geotechnical li:nth-child(3)', 'Laboratory analysis and technical reporting support']
  ],
  id: [
    ['title', 'Layanan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Layanan PT Taka Hydrocore Indonesia untuk survei geofisika marine, survei geoteknik offshore, investigasi geoteknik seabed, pengeboran nearshore, pengeboran eksplorasi, dan survei geoteknik onshore.'],
    ['.services-page .preloader-inner p', 'Menyiapkan layanan'],
    ['.services-hero-copy .kicker', 'Layanan'],
    ['.services-hero h1', 'Layanan geofisika dan geoteknik untuk lingkungan marine dan darat.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI menyediakan survei geofisika marine resolusi tinggi, investigasi geoteknik offshore dan seabed, pengeboran nearshore, pengeboran eksplorasi, dan dukungan survei geoteknik onshore.'],
    ['.services-directory>.section-label', '<span>01</span> Direktori Layanan', 'html'],
    ['.services-directory-head .kicker', 'Kapabilitas utama'],
    ['.services-directory-head h2', 'Enam service line yang dikonfigurasi berdasarkan kondisi site, kedalaman air, target tanah, dan tujuan proyek.'],
    ['#marine-seismic span', 'Geofisika Marine'],
    ['#marine-seismic h3', 'Seismik Laut Resolusi Tinggi 2D/3D'],
    ['#marine-seismic p', 'Layanan seismik marine dan survei geofisika resolusi tinggi untuk studi geohazard, program eksplorasi, dan perencanaan bawah laut.'],
    ['#marine-seismic li:nth-child(1)', 'Survei seismik HR dan UHR 2D/3D'],
    ['#marine-seismic li:nth-child(2)', 'Akuisisi, pemrosesan, dan interpretasi data'],
    ['#marine-seismic li:nth-child(3)', 'Dukungan geohazard, eksplorasi, dan pemetaan seabed'],
    ['#offshore-geotechnical span', 'Geoteknik Offshore'],
    ['#offshore-geotechnical h3', 'Survei Geoteknik Offshore'],
    ['#offshore-geotechnical p', 'Investigasi tanah offshore menggunakan rig pengeboran dengan heave compensation, didukung workflow sampling, coring, CPT, dan downhole logging.'],
    ['#offshore-geotechnical li:nth-child(1)', 'Sistem pengeboran offshore heave compensated'],
    ['#offshore-geotechnical li:nth-child(2)', 'Undisturbed sampling, coring, CPT, dan pengujian lapangan'],
    ['#offshore-geotechnical li:nth-child(3)', 'Dapat diterapkan pada platform marine yang sesuai'],
    ['#seabed-drilling span', 'Geoteknik Seabed'],
    ['#seabed-drilling h3', 'Geoteknik Seabed'],
    ['#seabed-drilling p', 'Investigasi seabed langsung untuk kondisi bawah permukaan dangkal menggunakan sistem seabed CPT dan vibrocore.'],
    ['#seabed-drilling li:nth-child(1)', 'Dukungan sistem Seabed CPT'],
    ['#seabed-drilling li:nth-child(2)', 'Sampling vibrocore untuk lapisan seabed dangkal'],
    ['#seabed-drilling li:nth-child(3)', 'Data geoteknik untuk perencanaan infrastruktur marine'],
    ['#nearshore-drilling span', 'Geoteknik Nearshore'],
    ['#nearshore-drilling h3', 'Pengeboran Geoteknik Nearshore'],
    ['#nearshore-drilling p', 'Pengeboran nearshore dan investigasi tanah menggunakan staging, pontoon, atau platform perairan dangkal yang dipilih berdasarkan kedalaman air dan akses.'],
    ['#nearshore-drilling li:nth-child(1)', 'Wooden staging untuk site nearshore dangkal'],
    ['#nearshore-drilling li:nth-child(2)', 'Setup pengeboran modular pontoon atau barge'],
    ['#nearshore-drilling li:nth-child(3)', 'Dukungan downhole CPT dan sampling'],
    ['#exploratory-drilling span', 'Pengeboran Eksplorasi'],
    ['#exploratory-drilling h3', 'Pengeboran Eksplorasi'],
    ['#exploratory-drilling p', 'Pengeboran eksplorasi untuk program tambang dan sumber daya dengan coring berkualitas, diameter pengeboran sesuai, dan supervisi lapangan berkualifikasi.'],
    ['#exploratory-drilling li:nth-child(1)', 'Opsi coring NQ, HQ, dan PQ'],
    ['#exploratory-drilling li:nth-child(2)', 'Dukungan field geologist dan drilling supervisor'],
    ['#exploratory-drilling li:nth-child(3)', 'Kedalaman dikonfigurasi sesuai kebutuhan proyek'],
    ['#onshore-geotechnical span', 'Geoteknik Onshore'],
    ['#onshore-geotechnical h3', 'Survei Geoteknik Onshore'],
    ['#onshore-geotechnical p', 'Investigasi geoteknik darat dengan pengeboran, pengujian in-situ, sampling, dan interpretasi engineering berbasis laboratorium.'],
    ['#onshore-geotechnical li:nth-child(1)', 'SPT, pressuremeter, field vane shear, dan CPT'],
    ['#onshore-geotechnical li:nth-child(2)', 'Disturbed dan undisturbed soil sampling'],
    ['#onshore-geotechnical li:nth-child(3)', 'Dukungan analisis laboratorium dan pelaporan teknis']
  ]
};

const servicesPageTranslationsV2 = {
  en: [
    ['title', 'Services | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia services for marine seismic, offshore and onshore geotechnical survey, exploratory drilling, nearshore drilling, hydrogeology drilling, marine support, and seabed investigation.'],
    ['.services-page .preloader-inner p', 'Preparing services'],
    ['.services-hero-copy .kicker', 'Services'],
    ['.services-hero h1', 'Geophysical and geotechnical services for marine and land environments.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI delivers marine seismic, offshore and onshore geotechnical survey, exploratory drilling, nearshore drilling, hydrogeology drilling, seabed investigation, and supporting technical services.'],
    ['.services-directory>.section-label', '<span>01</span> Service Lines', 'html'],
    ['.services-directory-head .kicker', 'Technical services'],
    ['.services-directory-head h2', 'Survey, drilling, sampling, testing, and interpretation services configured around each project environment.'],
    ['.service-anchor-list a:nth-child(1)', '<span>01</span>2D/3D HR Marine Seismic', 'html'],
    ['.service-anchor-list a:nth-child(2)', '<span>02</span>Offshore Geotechnical Survey', 'html'],
    ['.service-anchor-list a:nth-child(3)', '<span>03</span>Onshore Geotechnical Survey', 'html'],
    ['.service-anchor-list a:nth-child(4)', '<span>04</span>Exploratory Drilling', 'html'],
    ['.service-anchor-list a:nth-child(5)', '<span>05</span>Nearshore Geotechnical Drilling', 'html'],
    ['.service-anchor-list a:nth-child(6)', '<span>06</span>Hydrogeology Drilling', 'html'],
    ['.service-anchor-list a:nth-child(7)', '<span>07</span>Marine Geophysical & Other Services', 'html'],
    ['.service-anchor-list a:nth-child(8)', '<span>08</span>Seabed Geotechnical', 'html'],
    ['#marine-seismic .kicker', 'Marine Geophysical'],
    ['#marine-seismic .service-detail-index', '01 / Geohazard and exploration seismic'],
    ['#marine-seismic h2', '2D/3D High Resolution Marine Seismic'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(2)', 'THI provides 2D/3D High Resolution Marine Seismic services for geohazard surveys and oil and gas exploration. The work combines high-technology acquisition systems, experienced personnel, efficient offshore operation, and integrated processing and interpretation.'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(3)', 'Final processed HR 3D seismic volumes are prepared for high-quality, high-resolution interpretation so project teams can review shallow hazards, subsurface continuity, and exploration targets with greater confidence.'],
    ['#marine-seismic .service-detail-points p:nth-child(1)', '<strong>Configuration</strong><span>High Resolution and Ultra High Resolution seismic configurations are available.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(2)', '<strong>Performance</strong><span>Penetration may reach 2,000 m depending on geology, with 3D data resolution up to 6.25 m x 6.25 m.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(3)', '<strong>Deliverables</strong><span>Acquisition, sophisticated processing, analysis, and interpretation aligned to client objectives.</span>', 'html'],
    ['#offshore-geotechnical .kicker', 'Offshore Geotechnical'],
    ['#offshore-geotechnical .service-detail-index', '02 / Wireline CPT, sampling, coring, and downhole logging'],
    ['#offshore-geotechnical h2', 'Offshore Geotechnical Survey'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'Taka Hydrocore owns and operates geotechnical drilling rigs complete with heave compensated systems that can be installed on suitable vessels of opportunity. The rigs use standard 5.5-inch API drill pipe and can be configured for drilling, CPT, undisturbed sampling, coring, and downhole geophysical logging.'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'Wireline CPTu operations are performed with pore pressure measurement and field control aligned with ASTM D-5778, ISSMGE, British Standard, and ASTM practice. Real-time data acquisition allows the CPT engineer to monitor tip resistance, sleeve friction, pore pressure, inclination, and estimated soil properties during testing.'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(4)', 'Downhole sampling is selected around soil condition, using hydraulic piston samplers for very soft to soft cohesive materials, push samplers for medium stiff to very stiff clay, thick-walled samplers for sand and hard clay, and triple core barrel systems for rock recovery. Samples are logged, photographed, protected, sealed, and prepared for laboratory transfer.'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>Drilling system</strong><span>Heave compensated offshore drilling with API drill pipe and configurable drill string.</span>', 'html'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Wireline testing</strong><span>CPTu, BHA deployment, seabed frame reaction, and real-time acquisition workflow.</span>', 'html'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(3)', '<strong>Sample control</strong><span>Undisturbed sampling, coring, onboard description, sample protection, and laboratory handover.</span>', 'html'],
    ['#onshore-geotechnical .kicker', 'Onshore Geotechnical'],
    ['#onshore-geotechnical .service-detail-index', '03 / Drilling, in-situ tests, and sampling'],
    ['#onshore-geotechnical h2', 'Onshore Geotechnical Survey'],
    ['#onshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'Onshore geotechnical drilling is commonly supported by in-situ tests such as Standard Penetration Test, Pressuremeter Test, Field Vane Shear Test, and Cone Penetration Test with or without pore pressure measurement.'],
    ['#onshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'THI selects sampling tools according to soil behavior and consistency. Osterberg fixed piston samplers are used for high-quality undisturbed samples in very soft to soft soils, Mazier core barrel systems support soft to hard soils with alternating layers, and triple core barrel systems are used for rock formations.'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>In-situ testing</strong><span>SPT, pressuremeter, field vane shear, CPT, and CPTu capability.</span>', 'html'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Sampling</strong><span>Disturbed and undisturbed sampling using tools selected around soil consistency.</span>', 'html'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(3)', '<strong>CPT rigs</strong><span>Developed CPT rigs with driving capacity from 2.5 tons to 20 tons.</span>', 'html'],
    ['#exploratory-drilling .kicker', 'Exploratory Drilling'],
    ['#exploratory-drilling .service-detail-index', '04 / Mining and resource drilling'],
    ['#exploratory-drilling h2', 'Exploratory Drilling'],
    ['#exploratory-drilling .service-detail-copy>p:nth-of-type(2)', 'THI provides mining exploratory drilling services focused on high-quality coring, suitable equipment selection, and qualified field geologist or supervisor support. Drilling can be performed using conventional or wireline methods in NQ, HQ, or PQ size.'],
    ['#exploratory-drilling .service-detail-copy>p:nth-of-type(3)', 'Depth is configured around the project requirement, typically from 20 m to 700 m, and can be extended depending on rig selection and site condition. Sampling standards can be aligned with client requirements, including resource reporting programs such as JORC-oriented workflows.'],
    ['#exploratory-drilling .service-detail-points p:nth-child(1)', '<strong>Methods</strong><span>Conventional and wireline drilling using NQ, HQ, or PQ coring size.</span>', 'html'],
    ['#exploratory-drilling .service-detail-points p:nth-child(2)', '<strong>Rig options</strong><span>Skid rigs for shallow to deep programs, including capacity down to 1,000 m.</span>', 'html'],
    ['#exploratory-drilling .service-detail-points p:nth-child(3)', '<strong>Mobility</strong><span>Wheel, tractor-mounted, and crawler-mounted drilling rigs for different site access conditions.</span>', 'html'],
    ['#nearshore-drilling .kicker', 'Nearshore Geotechnical'],
    ['#nearshore-drilling .service-detail-index', '05 / Shallow water drilling and CPT'],
    ['#nearshore-drilling h2', 'Nearshore Geotechnical Drilling'],
    ['#nearshore-drilling .service-detail-copy>p:nth-of-type(2)', 'To extend exploratory and geotechnical drilling capability over water, THI builds wooden staging or wooden platforms for shallow water environments down to approximately 3 m to 4 m water depth.'],
    ['#nearshore-drilling .service-detail-copy>p:nth-of-type(3)', 'For deeper nearshore work, THI has developed modular pontoon systems that allow drilling and geotechnical survey execution down to approximately 25 m water depth. CPTu on pontoon can be conducted using downhole CPT systems, with future development toward jack-up rig applications for deeper and more reliable operation.'],
    ['#nearshore-drilling .service-detail-points p:nth-child(1)', '<strong>Shallow water</strong><span>Wooden staging and platform setup for nearshore drilling in very shallow water.</span>', 'html'],
    ['#nearshore-drilling .service-detail-points p:nth-child(2)', '<strong>Pontoon system</strong><span>Modular pontoon support for drilling and geotechnical survey up to approximately 25 m water depth.</span>', 'html'],
    ['#nearshore-drilling .service-detail-points p:nth-child(3)', '<strong>CPTu support</strong><span>Downhole CPT system capability for pontoon-based nearshore investigation.</span>', 'html'],
    ['#hydrogeology-drilling .kicker', 'Hydrogeology'],
    ['#hydrogeology-drilling .service-detail-index', '06 / Groundwater monitoring and water supply'],
    ['#hydrogeology-drilling h2', 'Hydrogeology Drilling'],
    ['#hydrogeology-drilling .service-detail-copy>p:nth-of-type(2)', 'Hydrogeology drilling is intended to study groundwater behavior for environmental purposes, including landfill monitoring and pollution detection programs, as well as groundwater supply development.'],
    ['#hydrogeology-drilling .service-detail-copy>p:nth-of-type(3)', 'THI has experience drilling and installing groundwater monitoring wells and water supply wells using PVC or stainless material. Installation diameter commonly ranges from 4-inch to 8-inch pipe, with depths from 20 m to 350 m and flow capacity that may exceed 55 m3/hour depending on aquifer condition.'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(1)', '<strong>Environmental</strong><span>Groundwater monitoring wells for landfill monitoring and pollution detection studies.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(2)', '<strong>Water supply</strong><span>Well installation with suitable casing material, diameter, and depth configuration.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(3)', '<strong>Mining drainage</strong><span>Inclined drilling can be applied so the drilled hole intersects the water-bearing layer.</span>', 'html'],
    ['#marine-geophysical-other .kicker', 'Supporting Services'],
    ['#marine-geophysical-other .service-detail-index', '07 / Survey, testing, engineering, and laboratory support'],
    ['#marine-geophysical-other h2', 'Marine Geophysical and Other Services'],
    ['#marine-geophysical-other .service-detail-copy>p:nth-of-type(2)', 'To complete exploratory, geotechnical, and hydrogeological drilling works, THI provides supporting services that connect field acquisition, positioning, testing, engineering, and laboratory workflows into one execution package.'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(1)', '<strong>Survey</strong><span>Positioning, topographic survey, bathymetry, metocean, and meteorology support.</span>', 'html'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(2)', '<strong>Testing</strong><span>Geophysical logging, pumping test, slug test, and field data support.</span>', 'html'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(3)', '<strong>Engineering</strong><span>Basic geotechnical engineering and soil laboratory testing through association with PT Hydrocore.</span>', 'html'],
    ['#seabed-drilling .kicker', 'Seabed Geotechnical'],
    ['#seabed-drilling .service-detail-index', '08 / Seabed CPT and vibrocore investigation'],
    ['#seabed-drilling h2', 'Seabed Geotechnical'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(2)', 'THI provides seabed geotechnical survey capability through the development and operation of Seabed CPT and Vibrocore systems. This service supports shallow subsurface investigation where direct seabed data and recovered sediment samples are required before design or construction decisions.'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(3)', 'The seabed scope can support marine infrastructure planning, route and site assessment, geohazard screening, near-surface soil interpretation, and laboratory follow-up after sample recovery.'],
    ['#seabed-drilling .service-detail-points p:nth-child(1)', '<strong>Seabed CPT</strong><span>Direct cone penetration testing for near-seabed soil behavior and strength profiling.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(2)', '<strong>Vibrocore</strong><span>Physical sediment recovery for shallow subsurface description and laboratory testing.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(3)', '<strong>Application</strong><span>Useful for pipeline routes, cable routes, marine facilities, and seabed infrastructure planning.</span>', 'html']
  ],
  id: [
    ['title', 'Layanan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Layanan PT Taka Hydrocore Indonesia untuk marine seismic, survei geoteknik offshore dan onshore, exploratory drilling, nearshore drilling, hydrogeology drilling, marine support, dan investigasi seabed.'],
    ['.services-page .preloader-inner p', 'Menyiapkan layanan'],
    ['.services-hero-copy .kicker', 'Layanan'],
    ['.services-hero h1', 'Layanan geofisika dan geoteknik untuk lingkungan marine dan darat.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI menyediakan marine seismic, survei geoteknik offshore dan onshore, exploratory drilling, nearshore drilling, hydrogeology drilling, investigasi seabed, dan layanan teknis pendukung.'],
    ['.services-directory>.section-label', '<span>01</span> Lini Layanan', 'html'],
    ['.services-directory-head .kicker', 'Layanan teknis'],
    ['.services-directory-head h2', 'Layanan survei, pengeboran, sampling, pengujian, dan interpretasi yang disesuaikan dengan lingkungan tiap proyek.'],
    ['.service-anchor-list a:nth-child(1)', '<span>01</span>Marine Seismic HR 2D/3D', 'html'],
    ['.service-anchor-list a:nth-child(2)', '<span>02</span>Survei Geoteknik Offshore', 'html'],
    ['.service-anchor-list a:nth-child(3)', '<span>03</span>Survei Geoteknik Onshore', 'html'],
    ['.service-anchor-list a:nth-child(4)', '<span>04</span>Exploratory Drilling', 'html'],
    ['.service-anchor-list a:nth-child(5)', '<span>05</span>Pengeboran Geoteknik Nearshore', 'html'],
    ['.service-anchor-list a:nth-child(6)', '<span>06</span>Hydrogeology Drilling', 'html'],
    ['.service-anchor-list a:nth-child(7)', '<span>07</span>Marine Geophysical & Layanan Lainnya', 'html'],
    ['.service-anchor-list a:nth-child(8)', '<span>08</span>Geoteknik Seabed', 'html'],
    ['#marine-seismic .kicker', 'Geofisika Marine'],
    ['#marine-seismic .service-detail-index', '01 / Seismik geohazard dan eksplorasi'],
    ['#marine-seismic h2', 'Marine Seismic Resolusi Tinggi 2D/3D'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(2)', 'THI menyediakan layanan Marine Seismic Resolusi Tinggi 2D/3D untuk survei geohazard dan eksplorasi minyak dan gas. Pekerjaan ini menggabungkan sistem akuisisi berteknologi tinggi, personel berpengalaman, operasi offshore yang efisien, serta pemrosesan dan interpretasi terintegrasi.'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(3)', 'Volume seismik HR 3D final diproses untuk interpretasi berkualitas dan beresolusi tinggi, sehingga tim proyek dapat meninjau hazard dangkal, kontinuitas bawah permukaan, dan target eksplorasi dengan lebih percaya diri.'],
    ['#marine-seismic .service-detail-points p:nth-child(1)', '<strong>Konfigurasi</strong><span>Konfigurasi High Resolution dan Ultra High Resolution seismic tersedia.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(2)', '<strong>Performa</strong><span>Penetrasi dapat mencapai 2.000 m tergantung geologi, dengan resolusi data 3D hingga 6,25 m x 6,25 m.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(3)', '<strong>Deliverable</strong><span>Akuisisi, pemrosesan, analisis, dan interpretasi yang diselaraskan dengan tujuan klien.</span>', 'html'],
    ['#offshore-geotechnical .kicker', 'Geoteknik Offshore'],
    ['#offshore-geotechnical .service-detail-index', '02 / Wireline CPT, sampling, coring, dan downhole logging'],
    ['#offshore-geotechnical h2', 'Survei Geoteknik Offshore'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'Taka Hydrocore memiliki dan mengoperasikan rig pengeboran geoteknik dengan sistem heave compensated yang dapat dipasang pada vessel of opportunity yang sesuai. Rig menggunakan drill pipe API 5,5 inci dan dapat dikonfigurasi untuk pengeboran, CPT, undisturbed sampling, coring, serta downhole geophysical logging.'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'Operasi wireline CPTu dilakukan dengan pengukuran tekanan pori dan kontrol lapangan yang mengacu pada ASTM D-5778, ISSMGE, British Standard, dan praktik ASTM. Akuisisi data real-time membantu CPT engineer memantau tip resistance, sleeve friction, pore pressure, inclination, dan estimasi properti tanah selama pengujian.'],
    ['#offshore-geotechnical .service-detail-copy>p:nth-of-type(4)', 'Metode downhole sampling dipilih sesuai kondisi tanah, mulai dari hydraulic piston sampler untuk material kohesif sangat lunak hingga lunak, push sampler untuk clay medium stiff hingga very stiff, thick-walled sampler untuk sand dan hard clay, sampai triple core barrel untuk rock recovery. Sampel dicatat, difoto, dilindungi, disegel, dan disiapkan untuk pengiriman laboratorium.'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>Sistem pengeboran</strong><span>Pengeboran offshore heave compensated dengan API drill pipe dan drill string yang dapat dikonfigurasi.</span>', 'html'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Wireline testing</strong><span>CPTu, deployment BHA, reaksi seabed frame, dan workflow akuisisi real-time.</span>', 'html'],
    ['#offshore-geotechnical .service-detail-points p:nth-child(3)', '<strong>Kontrol sampel</strong><span>Undisturbed sampling, coring, deskripsi onboard, proteksi sampel, dan handover laboratorium.</span>', 'html'],
    ['#onshore-geotechnical .kicker', 'Geoteknik Onshore'],
    ['#onshore-geotechnical .service-detail-index', '03 / Pengeboran, uji in-situ, dan sampling'],
    ['#onshore-geotechnical h2', 'Survei Geoteknik Onshore'],
    ['#onshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'Pengeboran geoteknik onshore umumnya didukung uji in-situ seperti Standard Penetration Test, Pressuremeter Test, Field Vane Shear Test, serta Cone Penetration Test dengan atau tanpa pengukuran pore pressure.'],
    ['#onshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'THI memilih alat sampling berdasarkan perilaku dan konsistensi tanah. Osterberg fixed piston sampler digunakan untuk sampel undisturbed berkualitas tinggi pada tanah sangat lunak hingga lunak, Mazier core barrel mendukung lapisan tanah lunak hingga keras yang berganti-ganti, dan triple core barrel digunakan untuk formasi batuan.'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>Uji in-situ</strong><span>Kapabilitas SPT, pressuremeter, field vane shear, CPT, dan CPTu.</span>', 'html'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Sampling</strong><span>Disturbed dan undisturbed sampling dengan alat yang dipilih sesuai konsistensi tanah.</span>', 'html'],
    ['#onshore-geotechnical .service-detail-points p:nth-child(3)', '<strong>CPT rigs</strong><span>CPT rig yang dikembangkan dengan kapasitas tekan 2,5 ton hingga 20 ton.</span>', 'html'],
    ['#exploratory-drilling .kicker', 'Exploratory Drilling'],
    ['#exploratory-drilling .service-detail-index', '04 / Pengeboran tambang dan sumber daya'],
    ['#exploratory-drilling h2', 'Exploratory Drilling'],
    ['#exploratory-drilling .service-detail-copy>p:nth-of-type(2)', 'THI menyediakan layanan exploratory drilling untuk pertambangan dengan fokus pada coring berkualitas, pemilihan peralatan yang sesuai, serta dukungan field geologist atau supervisor yang berpengalaman. Pengeboran dapat dilakukan dengan metode conventional maupun wireline dalam ukuran NQ, HQ, atau PQ.'],
    ['#exploratory-drilling .service-detail-copy>p:nth-of-type(3)', 'Kedalaman disesuaikan dengan kebutuhan proyek, umumnya 20 m hingga 700 m, dan dapat diperpanjang sesuai pemilihan rig serta kondisi lokasi. Standar sampling dapat mengikuti kebutuhan klien, termasuk workflow untuk program pelaporan sumber daya seperti JORC.'],
    ['#exploratory-drilling .service-detail-points p:nth-child(1)', '<strong>Metode</strong><span>Pengeboran conventional dan wireline menggunakan ukuran coring NQ, HQ, atau PQ.</span>', 'html'],
    ['#exploratory-drilling .service-detail-points p:nth-child(2)', '<strong>Opsi rig</strong><span>Skid rig untuk program dangkal hingga dalam, termasuk kapasitas sampai 1.000 m.</span>', 'html'],
    ['#exploratory-drilling .service-detail-points p:nth-child(3)', '<strong>Mobilitas</strong><span>Rig wheel, tractor-mounted, dan crawler-mounted untuk berbagai kondisi akses lokasi.</span>', 'html'],
    ['#nearshore-drilling .kicker', 'Geoteknik Nearshore'],
    ['#nearshore-drilling .service-detail-index', '05 / Pengeboran perairan dangkal dan CPT'],
    ['#nearshore-drilling h2', 'Pengeboran Geoteknik Nearshore'],
    ['#nearshore-drilling .service-detail-copy>p:nth-of-type(2)', 'Untuk memperluas kapabilitas exploratory dan geotechnical drilling di atas air, THI membangun wooden staging atau wooden platform untuk lingkungan perairan dangkal hingga sekitar 3 m sampai 4 m kedalaman air.'],
    ['#nearshore-drilling .service-detail-copy>p:nth-of-type(3)', 'Untuk pekerjaan nearshore yang lebih dalam, THI mengembangkan modular pontoon system yang memungkinkan pengeboran dan survei geoteknik hingga sekitar 25 m kedalaman air. CPTu di atas pontoon dapat dilakukan menggunakan downhole CPT system, dengan pengembangan menuju penggunaan jack-up rig untuk operasi yang lebih dalam dan andal.'],
    ['#nearshore-drilling .service-detail-points p:nth-child(1)', '<strong>Perairan dangkal</strong><span>Wooden staging dan platform setup untuk nearshore drilling di perairan sangat dangkal.</span>', 'html'],
    ['#nearshore-drilling .service-detail-points p:nth-child(2)', '<strong>Sistem pontoon</strong><span>Dukungan modular pontoon untuk pengeboran dan survei geoteknik hingga sekitar 25 m kedalaman air.</span>', 'html'],
    ['#nearshore-drilling .service-detail-points p:nth-child(3)', '<strong>Dukungan CPTu</strong><span>Kapabilitas downhole CPT system untuk investigasi nearshore berbasis pontoon.</span>', 'html'],
    ['#hydrogeology-drilling .kicker', 'Hidrogeologi'],
    ['#hydrogeology-drilling .service-detail-index', '06 / Monitoring air tanah dan suplai air'],
    ['#hydrogeology-drilling h2', 'Hydrogeology Drilling'],
    ['#hydrogeology-drilling .service-detail-copy>p:nth-of-type(2)', 'Hydrogeology drilling ditujukan untuk mempelajari perilaku air tanah untuk kebutuhan lingkungan, termasuk program monitoring landfill dan deteksi polusi, serta pengembangan suplai air tanah.'],
    ['#hydrogeology-drilling .service-detail-copy>p:nth-of-type(3)', 'THI berpengalaman melakukan pengeboran dan instalasi sumur monitoring air tanah serta sumur suplai air dengan material PVC atau stainless. Diameter instalasi umumnya 4 inci hingga 8 inci, dengan kedalaman 20 m hingga 350 m dan kapasitas aliran yang dapat melebihi 55 m3/jam bergantung kondisi akuifer.'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(1)', '<strong>Lingkungan</strong><span>Sumur monitoring air tanah untuk landfill monitoring dan studi deteksi polusi.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(2)', '<strong>Suplai air</strong><span>Instalasi sumur dengan material casing, diameter, dan kedalaman sesuai kebutuhan.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-points p:nth-child(3)', '<strong>Drainase tambang</strong><span>Inclined drilling dapat diterapkan agar lubang bor memotong lapisan pembawa air.</span>', 'html'],
    ['#marine-geophysical-other .kicker', 'Layanan Pendukung'],
    ['#marine-geophysical-other .service-detail-index', '07 / Dukungan survei, pengujian, engineering, dan laboratorium'],
    ['#marine-geophysical-other h2', 'Marine Geophysical dan Layanan Lainnya'],
    ['#marine-geophysical-other .service-detail-copy>p:nth-of-type(2)', 'Untuk melengkapi pekerjaan exploratory, geotechnical, dan hydrogeological drilling, THI menyediakan layanan pendukung yang menghubungkan akuisisi lapangan, positioning, pengujian, engineering, dan workflow laboratorium dalam satu paket eksekusi.'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(1)', '<strong>Survei</strong><span>Dukungan positioning, topographic survey, bathymetry, metocean, dan meteorology.</span>', 'html'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(2)', '<strong>Pengujian</strong><span>Geophysical logging, pumping test, slug test, dan dukungan data lapangan.</span>', 'html'],
    ['#marine-geophysical-other .service-detail-points p:nth-child(3)', '<strong>Engineering</strong><span>Basic geotechnical engineering dan soil laboratory testing melalui kerja sama dengan PT Hydrocore.</span>', 'html'],
    ['#seabed-drilling .kicker', 'Geoteknik Seabed'],
    ['#seabed-drilling .service-detail-index', '08 / Investigasi Seabed CPT dan vibrocore'],
    ['#seabed-drilling h2', 'Geoteknik Seabed'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(2)', 'THI menyediakan kapabilitas survei geoteknik seabed melalui pengembangan dan pengoperasian sistem Seabed CPT dan Vibrocore. Layanan ini mendukung investigasi bawah permukaan dangkal ketika data seabed langsung dan sampel sedimen diperlukan sebelum keputusan desain atau konstruksi.'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(3)', 'Lingkup seabed dapat mendukung perencanaan infrastruktur marine, penilaian rute dan lokasi, screening geohazard, interpretasi tanah dekat permukaan, serta tindak lanjut laboratorium setelah sampel diperoleh.'],
    ['#seabed-drilling .service-detail-points p:nth-child(1)', '<strong>Seabed CPT</strong><span>Cone penetration testing langsung untuk profil perilaku dan kekuatan tanah dekat seabed.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(2)', '<strong>Vibrocore</strong><span>Recovery sedimen fisik untuk deskripsi bawah permukaan dangkal dan pengujian laboratorium.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(3)', '<strong>Aplikasi</strong><span>Berguna untuk rute pipa, rute kabel, fasilitas marine, dan perencanaan infrastruktur seabed.</span>', 'html']
  ]
};

const servicesPageTranslationsV3 = {
  en: [
    ['title', 'Services | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia services for marine geophysical survey, 2D/3D high resolution marine seismic, offshore geotechnical survey, nearshore and onshore geotechnical survey, exploratory drilling, hydrogeology drilling, and seabed geotechnical survey.'],
    ['.services-page .preloader-inner p', 'Preparing services'],
    ['.services-hero-copy .kicker', 'Services'],
    ['.services-hero h1', 'Geophysical and geotechnical services for marine and land environments.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI delivers marine geophysical survey, offshore geotechnical investigation, nearshore and onshore geotechnical work, exploratory drilling, hydrogeology drilling, and seabed investigation.'],
    ['.services-directory>.section-label', '<span>01</span> Service Lines', 'html'],
    ['.services-directory-head .kicker', 'Technical services'],
    ['.services-directory-head h2', 'Survey, drilling, sampling, testing, and interpretation services configured around each project environment.'],
    ['.service-anchor-list a:nth-child(1)', '<span>01</span>Marine Geophysical Survey', 'html'],
    ['.service-anchor-list a:nth-child(2)', '<span>02</span>Offshore Geotechnical Survey', 'html'],
    ['.service-anchor-list a:nth-child(3)', '<span>03</span>Nearshore & Onshore Geotechnical', 'html'],
    ['.service-anchor-list a:nth-child(4)', '<span>04</span>Exploratory Drilling', 'html'],
    ['.service-anchor-list a:nth-child(5)', '<span>05</span>Hydrogeology Drilling', 'html'],
    ['.service-anchor-list a:nth-child(6)', '<span>06</span>Seabed Geotechnical', 'html'],
    ['#marine-seismic .service-detail-index', '01 / Seismic, bathymetry, positioning, and survey support'],
    ['#marine-seismic h2', 'Marine Geophysical Survey'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(2)', 'Marine geophysical work at THI covers 2D/3D High Resolution Marine Seismic, bathymetry, positioning, seabed imaging, geophysical logging, metocean support, and supporting field data services. The scope is selected around the survey objective, water depth, route or site condition, and required deliverables.'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(3)', 'THI provides 2D/3D High Resolution Marine Seismic services for geohazard surveys and oil and gas exploration. The work combines high-technology acquisition systems, experienced personnel, efficient offshore operation, and integrated processing and interpretation.'],
    ['#marine-seismic .service-detail-points p:nth-child(1)', '<strong>Seismic</strong><span>High Resolution and Ultra High Resolution seismic configurations are available.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(3)', '<strong>Support</strong><span>Positioning, topographic survey, bathymetry, metocean, geophysical logging, pumping test, slug test, and field data support.</span>', 'html'],
    ['#nearshore-onshore-geotechnical .kicker', 'Nearshore & Onshore Geotechnical'],
    ['#nearshore-onshore-geotechnical .service-detail-index', '03 / Shallow-water and land-based soil investigation'],
    ['#nearshore-onshore-geotechnical h2', 'Nearshore & Onshore Geotechnical Survey'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'THI combines nearshore and onshore geotechnical capability for projects that move between land, coastal, intertidal, jetty, reclamation, river, and shallow-water environments. The method is selected around site access, water depth, tide, soil condition, platform requirement, and the level of investigation needed.'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'Nearshore work can use wooden staging or wooden platforms in very shallow water, and modular pontoon systems for deeper shallow-water investigation down to approximately 25 m. CPTu on pontoon can be conducted using downhole CPT systems, with development toward jack-up rig applications for deeper and more reliable operation.'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(4)', 'Onshore geotechnical drilling is commonly supported by SPT, Pressuremeter Test, Field Vane Shear Test, and CPT or CPTu. Sampling tools are selected around soil behavior, including Osterberg fixed piston samplers for very soft to soft soils, Mazier core barrel systems for alternating layers, and triple core barrel systems for rock formations.'],
    ['#nearshore-onshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>Nearshore</strong><span>Wooden staging, platform, and modular pontoon systems for shallow water drilling and CPTu investigation.</span>', 'html'],
    ['#nearshore-onshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Onshore</strong><span>Land-based drilling, SPT, pressuremeter, field vane, CPT, CPTu, and sampling for infrastructure and site investigation.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-index', '05 / Groundwater monitoring and water supply'],
    ['#seabed-drilling h2', 'Seabed Geotechnical'],
    ['#seabed-drilling .service-detail-index', '06 / Seabed CPT and vibrocore investigation']
  ],
  id: [
    ['title', 'Layanan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Layanan PT Taka Hydrocore Indonesia untuk survei geofisika marine, seismik marine resolusi tinggi 2D/3D, survei geoteknik offshore, survei geoteknik nearshore dan onshore, exploratory drilling, hydrogeology drilling, dan investigasi geoteknik seabed.'],
    ['.services-page .preloader-inner p', 'Menyiapkan layanan'],
    ['.services-hero-copy .kicker', 'Layanan'],
    ['.services-hero h1', 'Layanan geofisika dan geoteknik untuk lingkungan marine dan darat.'],
    ['.services-hero-copy>p:not(.kicker)', 'THI menyediakan survei geofisika marine, investigasi geoteknik offshore, pekerjaan geoteknik nearshore dan onshore, exploratory drilling, hydrogeology drilling, dan investigasi seabed.'],
    ['.services-directory>.section-label', '<span>01</span> Lini Layanan', 'html'],
    ['.services-directory-head .kicker', 'Layanan teknis'],
    ['.services-directory-head h2', 'Layanan survei, pengeboran, sampling, pengujian, dan interpretasi yang dikonfigurasi sesuai lingkungan tiap proyek.'],
    ['.service-anchor-list a:nth-child(1)', '<span>01</span>Survei Geofisika Marine', 'html'],
    ['.service-anchor-list a:nth-child(2)', '<span>02</span>Survei Geoteknik Offshore', 'html'],
    ['.service-anchor-list a:nth-child(3)', '<span>03</span>Geoteknik Nearshore & Onshore', 'html'],
    ['.service-anchor-list a:nth-child(4)', '<span>04</span>Exploratory Drilling', 'html'],
    ['.service-anchor-list a:nth-child(5)', '<span>05</span>Hydrogeology Drilling', 'html'],
    ['.service-anchor-list a:nth-child(6)', '<span>06</span>Geoteknik Seabed', 'html'],
    ['#marine-seismic .service-detail-index', '01 / Seismik, bathymetry, positioning, dan dukungan survei'],
    ['#marine-seismic h2', 'Survei Geofisika Marine'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(2)', 'Pekerjaan geofisika marine THI mencakup Seismik Marine Resolusi Tinggi 2D/3D, bathymetry, positioning, seabed imaging, geophysical logging, dukungan metocean, dan layanan data lapangan pendukung. Lingkup dipilih berdasarkan tujuan survei, kedalaman air, kondisi rute atau lokasi, dan deliverable yang dibutuhkan.'],
    ['#marine-seismic .service-detail-copy>p:nth-of-type(3)', 'THI menyediakan layanan Seismik Marine Resolusi Tinggi 2D/3D untuk survei geohazard dan eksplorasi minyak dan gas. Pekerjaan ini menggabungkan sistem akuisisi berteknologi tinggi, personel berpengalaman, operasi offshore yang efisien, serta pemrosesan dan interpretasi terintegrasi.'],
    ['#marine-seismic .service-detail-points p:nth-child(1)', '<strong>Seismik</strong><span>Konfigurasi High Resolution dan Ultra High Resolution seismic tersedia.</span>', 'html'],
    ['#marine-seismic .service-detail-points p:nth-child(3)', '<strong>Dukungan</strong><span>Positioning, topographic survey, bathymetry, metocean, geophysical logging, pumping test, slug test, dan dukungan data lapangan.</span>', 'html'],
    ['#nearshore-onshore-geotechnical .kicker', 'Geoteknik Nearshore & Onshore'],
    ['#nearshore-onshore-geotechnical .service-detail-index', '03 / Investigasi tanah perairan dangkal dan darat'],
    ['#nearshore-onshore-geotechnical h2', 'Survei Geoteknik Nearshore & Onshore'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(2)', 'THI menggabungkan kapabilitas geoteknik nearshore dan onshore untuk proyek yang bergerak antara darat, pesisir, intertidal, jetty, reklamasi, sungai, dan lingkungan perairan dangkal. Metode dipilih berdasarkan akses lokasi, kedalaman air, pasang surut, kondisi tanah, kebutuhan platform, dan tingkat investigasi.'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(3)', 'Pekerjaan nearshore dapat menggunakan wooden staging atau wooden platform pada perairan sangat dangkal, serta modular pontoon system untuk investigasi perairan dangkal yang lebih dalam hingga sekitar 25 m. CPTu di atas pontoon dapat dilakukan menggunakan downhole CPT system, dengan pengembangan menuju jack-up rig untuk operasi yang lebih dalam dan andal.'],
    ['#nearshore-onshore-geotechnical .service-detail-copy>p:nth-of-type(4)', 'Pengeboran geoteknik onshore umumnya didukung SPT, Pressuremeter Test, Field Vane Shear Test, dan CPT atau CPTu. Alat sampling dipilih berdasarkan perilaku tanah, termasuk Osterberg fixed piston sampler untuk tanah sangat lunak hingga lunak, Mazier core barrel untuk lapisan bergantian, dan triple core barrel untuk formasi batuan.'],
    ['#nearshore-onshore-geotechnical .service-detail-points p:nth-child(1)', '<strong>Nearshore</strong><span>Wooden staging, platform, dan modular pontoon system untuk pengeboran perairan dangkal dan investigasi CPTu.</span>', 'html'],
    ['#nearshore-onshore-geotechnical .service-detail-points p:nth-child(2)', '<strong>Onshore</strong><span>Pengeboran darat, SPT, pressuremeter, field vane, CPT, CPTu, dan sampling untuk investigasi infrastruktur dan site.</span>', 'html'],
    ['#hydrogeology-drilling .service-detail-index', '05 / Monitoring air tanah dan suplai air'],
    ['#seabed-drilling h2', 'Geoteknik Seabed'],
    ['#seabed-drilling .service-detail-index', '06 / Investigasi Seabed CPT dan vibrocore']
  ]
};

const applyServicesLanguage = (language) => {
  if (!document.body.classList.contains('services-page')) return;
  const translations = servicesPageTranslationsV3[language] || servicesPageTranslationsV3.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const equipmentPageTranslations = {
  en: [
    ['title', 'Equipment | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia equipment page covering seabed CPT, vibrocore, piston core, box core, grab sampler, MBES, Sercel 428, drill rig, A-frame, and laboratory support.'],
    ['.equipment-page .preloader-inner p', 'Preparing equipment portfolio'],
    ['.equipment-hero .kicker', 'Equipment'],
    ['.equipment-hero h1', 'Equipment prepared for survey, drilling, sampling, and data delivery.'],
    ['.equipment-hero-copy>p:not(.kicker)', 'THI equipment is presented by field function, so clients can understand how each system supports offshore, nearshore, onshore, and laboratory work.'],
    ['.equipment-overview>.section-label', '<span>01</span> Equipment Approach', 'html'],
    ['.equipment-overview-copy .kicker', 'Built around the scope'],
    ['.equipment-overview-copy h2', 'Each equipment spread is selected around the job, not displayed as a generic catalogue.'],
    ['.equipment-overview-copy>p:not(.kicker)', 'Before mobilization, the team reviews the survey objective, water depth, access, lifting arrangement, sampling target, data requirement, and reporting workflow. The equipment is then prepared as part of one field execution plan.'],
    ['.equipment-jump a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
    ['.equipment-jump a:nth-child(2)', '<span>02</span>Vibrocore System', 'html'],
    ['.equipment-jump a:nth-child(3)', '<span>03</span>Piston Core', 'html'],
    ['.equipment-jump a:nth-child(4)', '<span>04</span>Box Core with T-Bar', 'html'],
    ['.equipment-jump a:nth-child(5)', '<span>05</span>Grab Sampler', 'html'],
    ['.equipment-jump a:nth-child(6)', '<span>06</span>MBES EM304', 'html'],
    ['.equipment-jump a:nth-child(7)', '<span>07</span>Sercel 428', 'html'],
    ['.equipment-jump a:nth-child(8)', '<span>08</span>Drill Rig TH-25M', 'html'],
    ['.equipment-jump a:nth-child(9)', '<span>09</span>THI A-Frame 24T', 'html'],
    ['.equipment-jump a:nth-child(10)', '<span>10</span>Soil & Geotechnical Laboratory', 'html'],
    ['.equipment-directory>.section-label', '<span>02</span> Equipment Sections', 'html'],
    ['.equipment-directory-head .kicker', 'Field systems'],
    ['.equipment-directory-head h2', 'Key equipment explained by how it supports the work in the field.'],
    ['#cpt-manta-200 .kicker', 'Seabed CPT'],
    ['#cpt-manta-200 .equipment-detail-index', '01 / Cone penetration testing'],
    ['#cpt-manta-200 h3', 'CPT Manta 200'],
    ['#cpt-manta-200 .equipment-detail-copy>p:not(.kicker)', 'Used for seabed cone penetration testing where the project needs direct in-situ soil profiling before engineering decisions are made.'],
    ['#cpt-manta-200 .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Supports offshore soil investigation and strength profiling.</span>', 'html'],
    ['#cpt-manta-200 .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Deployment, deck handling, calibration check, and maintenance readiness.</span>', 'html'],
    ['#vibrocore-system .kicker', 'Soil Sampling'],
    ['#vibrocore-system .equipment-detail-index', '02 / Near-surface sediment recovery'],
    ['#vibrocore-system h3', 'Vibrocore System'],
    ['#vibrocore-system .equipment-detail-copy>p:not(.kicker)', 'A seabed sampling system used to recover near-surface sediment where physical soil samples are required for geotechnical and environmental review.'],
    ['#vibrocore-system .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Recovers seabed sediment for shallow subsurface interpretation.</span>', 'html'],
    ['#vibrocore-system .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Marine deployment, sample recovery, deck handling, and sample documentation.</span>', 'html'],
    ['#piston-core .kicker', 'Core Sampling'],
    ['#piston-core .equipment-detail-index', '03 / Soft sediment core'],
    ['#piston-core h3', 'Piston Core'],
    ['#piston-core .equipment-detail-copy>p:not(.kicker)', 'Selected when the work requires a longer soft-sediment core and a clearer look at seabed stratigraphy beyond surface sampling.'],
    ['#piston-core .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Supports deeper soft-sediment recovery for seabed investigation.</span>', 'html'],
    ['#piston-core .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Core recovery, handling sequence, sample protection, and survey documentation.</span>', 'html'],
    ['#box-core-tbar .kicker', 'Seabed Sampling'],
    ['#box-core-tbar .equipment-detail-index', '04 / Surface sample and T-Bar support'],
    ['#box-core-tbar h3', 'Box Core with T-Bar'],
    ['#box-core-tbar .equipment-detail-copy>p:not(.kicker)', 'Combines seabed surface sampling with T-Bar testing support for projects that need a better read of near-seabed material behavior.'],
    ['#box-core-tbar .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Collects representative surface samples and supports seabed strength assessment.</span>', 'html'],
    ['#box-core-tbar .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Controlled lowering, recovery, sample preservation, and field logging.</span>', 'html'],
    ['#grab-sampler .kicker', 'Surface Sampling'],
    ['#grab-sampler .equipment-detail-index', '05 / Seabed material collection'],
    ['#grab-sampler h3', 'Grab Sampler'],
    ['#grab-sampler .equipment-detail-copy>p:not(.kicker)', 'Used for seabed surface material collection where a quick, practical sample is needed for environmental or preliminary geotechnical review.'],
    ['#grab-sampler .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Collects surface material for visual logging and sample handling.</span>', 'html'],
    ['#grab-sampler .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Deployment control, recovery workflow, container handling, and sample traceability.</span>', 'html'],
    ['#mbes-em304 .kicker', 'Marine Geophysical'],
    ['#mbes-em304 .equipment-detail-index', '06 / Bathymetry and seabed mapping'],
    ['#mbes-em304 h3', 'MBES EM304'],
    ['#mbes-em304 .equipment-detail-copy>p:not(.kicker)', 'Multibeam bathymetry capability for seabed mapping, route survey support, and marine geophysical interpretation.'],
    ['#mbes-em304 .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Builds seabed morphology data for planning, hazard review, and route decisions.</span>', 'html'],
    ['#mbes-em304 .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Sensor setup, acquisition monitoring, QC review, and data delivery workflow.</span>', 'html'],
    ['#sercel-428 .kicker', 'Seismic Acquisition'],
    ['#sercel-428 .equipment-detail-index', '07 / Geophysical acquisition workflow'],
    ['#sercel-428 h3', 'Sercel 428'],
    ['#sercel-428 .equipment-detail-copy>p:not(.kicker)', 'Supports seismic acquisition workflow, spread monitoring, QC, and onboard data handling during marine geophysical campaigns.'],
    ['#sercel-428 .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Keeps acquisition activity visible to the survey team during operation.</span>', 'html'],
    ['#sercel-428 .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Instrument check, acquisition monitoring, data control, and reporting handover.</span>', 'html'],
    ['#drill-rig-th25m .kicker', 'Drilling'],
    ['#drill-rig-th25m .equipment-detail-index', '08 / Geotechnical and exploratory support'],
    ['#drill-rig-th25m h3', 'Drill Rig TH-25M'],
    ['#drill-rig-th25m .equipment-detail-copy>p:not(.kicker)', 'A compact drilling rig used to support geotechnical and exploratory drilling where reliable coring, sampling, and field handling matter.'],
    ['#drill-rig-th25m .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Supports drilling, sampling, and coring for site investigation programs.</span>', 'html'],
    ['#drill-rig-th25m .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Rig-up sequence, drilling floor control, maintenance readiness, and safe operation.</span>', 'html'],
    ['#a-frame-24t .kicker', 'Deck Handling'],
    ['#a-frame-24t .equipment-detail-index', '11 / Deployment and recovery support'],
    ['#a-frame-24t h3', 'THI A-Frame 24T'],
    ['#a-frame-24t .equipment-detail-copy>p:not(.kicker)', 'Deck handling and lifting support for controlled deployment and recovery of seabed equipment during marine operations.'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Supports safe overboarding, lifting, and recovery sequence on deck.</span>', 'html'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Load check, lifting arrangement, deck coordination, and equipment recovery.</span>', 'html'],
    ['#soil-geotechnical-lab .kicker', 'Laboratory'],
    ['#soil-geotechnical-lab .equipment-detail-index', '12 / Soil testing and documentation'],
    ['#soil-geotechnical-lab h3', 'Soil & Geotechnical Laboratory'],
    ['#soil-geotechnical-lab .equipment-detail-copy>p:not(.kicker)', 'Laboratory support for soil handling, testing workflow, and technical documentation after samples are recovered from field operations.'],
    ['#soil-geotechnical-lab .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Connects recovered samples with laboratory review and engineering deliverables.</span>', 'html'],
    ['#soil-geotechnical-lab .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Sample intake, testing workflow, documentation control, and reporting support.</span>', 'html']
  ],
  id: [
    ['title', 'Peralatan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Halaman peralatan PT Taka Hydrocore Indonesia mencakup seabed CPT, vibrocore, piston core, box core, grab sampler, MBES, Sercel 428, drill rig, A-frame, dan dukungan laboratorium.'],
    ['.equipment-page .preloader-inner p', 'Menyiapkan portofolio peralatan'],
    ['.equipment-hero .kicker', 'Peralatan'],
    ['.equipment-hero h1', 'Peralatan untuk survei, pengeboran, sampling, dan penyerahan data.'],
    ['.equipment-hero-copy>p:not(.kicker)', 'Peralatan THI ditampilkan berdasarkan fungsi lapangan agar klien memahami bagaimana setiap sistem mendukung pekerjaan offshore, nearshore, onshore, dan laboratorium.'],
    ['.equipment-overview>.section-label', '<span>01</span> Pendekatan Peralatan', 'html'],
    ['.equipment-overview-copy .kicker', 'Disusun berdasarkan scope'],
    ['.equipment-overview-copy h2', 'Setiap equipment spread dipilih berdasarkan pekerjaan, bukan ditampilkan sebagai katalog umum.'],
    ['.equipment-overview-copy>p:not(.kicker)', 'Sebelum mobilisasi, tim meninjau tujuan survei, kedalaman air, akses, rencana lifting, target sampling, kebutuhan data, dan alur pelaporan. Peralatan kemudian disiapkan sebagai bagian dari satu rencana eksekusi lapangan.'],
    ['.equipment-jump a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
    ['.equipment-jump a:nth-child(2)', '<span>02</span>Vibrocore System', 'html'],
    ['.equipment-jump a:nth-child(3)', '<span>03</span>Piston Core', 'html'],
    ['.equipment-jump a:nth-child(4)', '<span>04</span>Box Core with T-Bar', 'html'],
    ['.equipment-jump a:nth-child(5)', '<span>05</span>Grab Sampler', 'html'],
    ['.equipment-jump a:nth-child(6)', '<span>06</span>MBES EM304', 'html'],
    ['.equipment-jump a:nth-child(7)', '<span>07</span>Sercel 428', 'html'],
    ['.equipment-jump a:nth-child(8)', '<span>08</span>Drill Rig TH-25M', 'html'],
    ['.equipment-jump a:nth-child(9)', '<span>09</span>THI A-Frame 24T', 'html'],
    ['.equipment-jump a:nth-child(10)', '<span>10</span>Soil & Geotechnical Laboratory', 'html'],
    ['.equipment-directory>.section-label', '<span>02</span> Section Peralatan', 'html'],
    ['.equipment-directory-head .kicker', 'Sistem lapangan'],
    ['.equipment-directory-head h2', 'Peralatan utama dijelaskan berdasarkan perannya dalam pekerjaan lapangan.'],
    ['#cpt-manta-200 .kicker', 'Seabed CPT'],
    ['#cpt-manta-200 .equipment-detail-index', '01 / Cone penetration testing'],
    ['#cpt-manta-200 h3', 'CPT Manta 200'],
    ['#cpt-manta-200 .equipment-detail-copy>p:not(.kicker)', 'Digunakan untuk cone penetration testing seabed ketika proyek membutuhkan profil tanah in-situ sebelum keputusan engineering dibuat.'],
    ['#cpt-manta-200 .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung investigasi tanah offshore dan profil kekuatan tanah.</span>', 'html'],
    ['#cpt-manta-200 .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Deployment, deck handling, pengecekan kalibrasi, dan kesiapan maintenance.</span>', 'html'],
    ['#vibrocore-system .kicker', 'Soil Sampling'],
    ['#vibrocore-system .equipment-detail-index', '02 / Recovery sedimen dekat permukaan'],
    ['#vibrocore-system h3', 'Vibrocore System'],
    ['#vibrocore-system .equipment-detail-copy>p:not(.kicker)', 'Sistem sampling seabed untuk mengambil sedimen dekat permukaan saat sampel fisik dibutuhkan untuk kajian geoteknik dan lingkungan.'],
    ['#vibrocore-system .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mengambil sedimen seabed untuk interpretasi lapisan dangkal.</span>', 'html'],
    ['#vibrocore-system .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Deployment marine, recovery sampel, deck handling, dan dokumentasi sampel.</span>', 'html'],
    ['#piston-core .kicker', 'Core Sampling'],
    ['#piston-core .equipment-detail-index', '03 / Core sedimen lunak'],
    ['#piston-core h3', 'Piston Core'],
    ['#piston-core .equipment-detail-copy>p:not(.kicker)', 'Dipilih ketika pekerjaan membutuhkan core sedimen lunak yang lebih panjang dan gambaran stratigrafi seabed yang lebih jelas dari sampling permukaan.'],
    ['#piston-core .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung recovery sedimen lunak yang lebih dalam untuk investigasi seabed.</span>', 'html'],
    ['#piston-core .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Recovery core, urutan handling, perlindungan sampel, dan dokumentasi survei.</span>', 'html'],
    ['#box-core-tbar .kicker', 'Seabed Sampling'],
    ['#box-core-tbar .equipment-detail-index', '04 / Sampel permukaan dan dukungan T-Bar'],
    ['#box-core-tbar h3', 'Box Core with T-Bar'],
    ['#box-core-tbar .equipment-detail-copy>p:not(.kicker)', 'Menggabungkan sampling permukaan seabed dengan dukungan uji T-Bar untuk proyek yang membutuhkan pembacaan perilaku material dekat seabed.'],
    ['#box-core-tbar .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mengambil sampel permukaan representatif dan mendukung asesmen kekuatan seabed.</span>', 'html'],
    ['#box-core-tbar .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Lowering terkontrol, recovery, preservasi sampel, dan logging lapangan.</span>', 'html'],
    ['#grab-sampler .kicker', 'Surface Sampling'],
    ['#grab-sampler .equipment-detail-index', '05 / Pengambilan material seabed'],
    ['#grab-sampler h3', 'Grab Sampler'],
    ['#grab-sampler .equipment-detail-copy>p:not(.kicker)', 'Digunakan untuk mengambil material permukaan seabed ketika dibutuhkan sampel cepat dan praktis untuk kajian lingkungan atau geoteknik awal.'],
    ['#grab-sampler .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mengambil material permukaan untuk visual logging dan penanganan sampel.</span>', 'html'],
    ['#grab-sampler .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Kontrol deployment, workflow recovery, container handling, dan traceability sampel.</span>', 'html'],
    ['#mbes-em304 .kicker', 'Geofisika Marine'],
    ['#mbes-em304 .equipment-detail-index', '06 / Bathymetry dan pemetaan seabed'],
    ['#mbes-em304 h3', 'MBES EM304'],
    ['#mbes-em304 .equipment-detail-copy>p:not(.kicker)', 'Kapabilitas multibeam bathymetry untuk pemetaan seabed, dukungan route survey, dan interpretasi geofisika marine.'],
    ['#mbes-em304 .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Membangun data morfologi seabed untuk planning, hazard review, dan keputusan rute.</span>', 'html'],
    ['#mbes-em304 .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Setup sensor, monitoring akuisisi, review QC, dan workflow delivery data.</span>', 'html'],
    ['#sercel-428 .kicker', 'Akuisisi Seismik'],
    ['#sercel-428 .equipment-detail-index', '07 / Workflow akuisisi geofisika'],
    ['#sercel-428 h3', 'Sercel 428'],
    ['#sercel-428 .equipment-detail-copy>p:not(.kicker)', 'Mendukung workflow akuisisi seismik, monitoring spread, QC, dan penanganan data onboard selama campaign geofisika marine.'],
    ['#sercel-428 .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Menjaga aktivitas akuisisi tetap terlihat oleh tim survei selama operasi.</span>', 'html'],
    ['#sercel-428 .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Pengecekan instrumen, monitoring akuisisi, kontrol data, dan handover pelaporan.</span>', 'html'],
    ['#drill-rig-th25m .kicker', 'Pengeboran'],
    ['#drill-rig-th25m .equipment-detail-index', '08 / Dukungan geoteknik dan eksplorasi'],
    ['#drill-rig-th25m h3', 'Drill Rig TH-25M'],
    ['#drill-rig-th25m .equipment-detail-copy>p:not(.kicker)', 'Rig pengeboran compact untuk mendukung pengeboran geoteknik dan eksplorasi ketika coring, sampling, dan handling lapangan harus konsisten.'],
    ['#drill-rig-th25m .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung drilling, sampling, dan coring untuk program investigasi site.</span>', 'html'],
    ['#drill-rig-th25m .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Urutan rig-up, kontrol drilling floor, kesiapan maintenance, dan operasi aman.</span>', 'html'],
    ['#a-frame-24t .kicker', 'Deck Handling'],
    ['#a-frame-24t .equipment-detail-index', '11 / Dukungan deployment dan recovery'],
    ['#a-frame-24t h3', 'THI A-Frame 24T'],
    ['#a-frame-24t .equipment-detail-copy>p:not(.kicker)', 'Dukungan deck handling dan lifting untuk deployment serta recovery peralatan seabed secara terkontrol dalam operasi marine.'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung overboarding, lifting, dan urutan recovery yang aman di deck.</span>', 'html'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Load check, pengaturan lifting, koordinasi deck, dan recovery peralatan.</span>', 'html'],
    ['#soil-geotechnical-lab .kicker', 'Laboratorium'],
    ['#soil-geotechnical-lab .equipment-detail-index', '12 / Pengujian tanah dan dokumentasi'],
    ['#soil-geotechnical-lab h3', 'Soil & Geotechnical Laboratory'],
    ['#soil-geotechnical-lab .equipment-detail-copy>p:not(.kicker)', 'Dukungan laboratorium untuk penanganan tanah, workflow pengujian, dan dokumentasi teknis setelah sampel diperoleh dari operasi lapangan.'],
    ['#soil-geotechnical-lab .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Menghubungkan sampel lapangan dengan review laboratorium dan deliverable engineering.</span>', 'html'],
    ['#soil-geotechnical-lab .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Penerimaan sampel, workflow pengujian, kontrol dokumentasi, dan dukungan pelaporan.</span>', 'html']
  ]
};

const equipmentPageTranslationOverrides = {
  en: [
    ['.equipment-jump a:nth-child(3)', '<span>03</span>FT520 Piston Corer', 'html'],
    ['.equipment-jump a:nth-child(6)', '<span>06</span>MBES Kongsberg EM2040P', 'html'],
    ['.equipment-jump a:nth-child(7)', '<span>07</span>MBES EM304', 'html'],
    ['.equipment-jump a:nth-child(8)', '<span>08</span>Sercel 428', 'html'],
    ['.equipment-jump a:nth-child(9)', '<span>09</span>Drill Rig TH-25M', 'html'],
    ['.equipment-jump a:nth-child(10)', '<span>10</span>THI A-Frame 24T', 'html'],
    ['.equipment-jump a:nth-child(11)', '<span>11</span>Soil & Geotechnical Laboratory', 'html'],
    ['#piston-core h3', 'FT520 Piston Corer'],
    ['#mbes-em2040p .kicker', 'Marine Geophysical'],
    ['#mbes-em2040p .equipment-detail-index', '06 / Ultra-high resolution multibeam'],
    ['#mbes-em2040p h3', 'MBES Kongsberg EM2040P S/N 50038'],
    ['#mbes-em2040p .equipment-detail-copy>p:not(.kicker)', 'Portable multibeam echosounder capability for high-resolution bathymetric survey, seabed imaging, and shallow-water marine geophysical acquisition.'],
    ['#mbes-em2040p .equipment-detail-lines p:nth-child(1)', '<strong>Key features</strong><span>Ultra-high resolution, wide frequency range, short pulse lengths, and seabed image capability.</span>', 'html'],
    ['#mbes-em2040p .equipment-detail-lines p:nth-child(2)', '<strong>Field control</strong><span>Roll, pitch, and yaw stabilization with dual swath, water column display, and practical installation workflow.</span>', 'html'],
    ['#mbes-em304 .equipment-detail-index', '07 / Bathymetry and seabed mapping'],
    ['#sercel-428 .equipment-detail-index', '08 / Geophysical acquisition workflow'],
    ['#drill-rig-th25m .equipment-detail-index', '09 / Geotechnical and exploratory support'],
    ['#a-frame-24t .equipment-detail-index', '11 / Deployment and recovery support'],
    ['#soil-geotechnical-lab .equipment-detail-index', '12 / Soil testing and documentation'],
    ['#soil-geotechnical-lab .equipment-lab-head>div>p:not(.kicker)', 'The soil and geotechnical laboratory capability is presented in collaboration with PT Hydrocore. It supports sample handling, basic and advanced soil testing, rock testing, controlled storage, and ISO/IEC 17025 accredited laboratory workflow.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) h4', 'Basic Lab Test'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(1)', 'Soil classification: moisture content, Atterberg limits, sieve and hydrometer, linear shrinkage, specific gravity, and organic content.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(2)', 'Soil chemical and corrosivity: pH, electrical resistivity, carbonate, sulfate, chloride, and salinity on extracted pore water.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(3)', 'Oedometer, permeability, mini lab vane, unconfined compression, UU/CD direct shear, UU triaxial, CiU/CiD triaxial, and rock strength testing.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) h4', 'Advanced Lab Test'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(1)', 'X-Ray CT Scan, CRS consolidation, thixotropy, static simple shear, and cyclic simple shear.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(2)', 'Bender element and resonant column testing for advanced soil behavior assessment.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(3)', 'Humidity and temperature controlled storage room with capacity for 300 samples.'],
    ['#soil-geotechnical-lab .equipment-lab-statement', 'The most advanced and complete soil laboratory, ISO/IEC 17025 accredited.']
  ],
  id: [
    ['.equipment-jump a:nth-child(3)', '<span>03</span>FT520 Piston Corer', 'html'],
    ['.equipment-jump a:nth-child(6)', '<span>06</span>MBES Kongsberg EM2040P', 'html'],
    ['.equipment-jump a:nth-child(7)', '<span>07</span>MBES EM304', 'html'],
    ['.equipment-jump a:nth-child(8)', '<span>08</span>Sercel 428', 'html'],
    ['.equipment-jump a:nth-child(9)', '<span>09</span>Drill Rig TH-25M', 'html'],
    ['.equipment-jump a:nth-child(10)', '<span>10</span>THI A-Frame 24T', 'html'],
    ['.equipment-jump a:nth-child(11)', '<span>11</span>Soil & Geotechnical Laboratory', 'html'],
    ['#piston-core h3', 'FT520 Piston Corer'],
    ['#mbes-em2040p .kicker', 'Geofisika Marine'],
    ['#mbes-em2040p .equipment-detail-index', '06 / Multibeam resolusi sangat tinggi'],
    ['#mbes-em2040p h3', 'MBES Kongsberg EM2040P S/N 50038'],
    ['#mbes-em2040p .equipment-detail-copy>p:not(.kicker)', 'Kapabilitas portable multibeam echosounder untuk survei bathymetry resolusi tinggi, pencitraan seabed, dan akuisisi geofisika marine perairan dangkal.'],
    ['#mbes-em2040p .equipment-detail-lines p:nth-child(1)', '<strong>Fitur utama</strong><span>Resolusi sangat tinggi, rentang frekuensi luas, short pulse lengths, dan kapabilitas seabed image.</span>', 'html'],
    ['#mbes-em2040p .equipment-detail-lines p:nth-child(2)', '<strong>Kontrol lapangan</strong><span>Stabilisasi roll, pitch, yaw dengan dual swath, tampilan water column, dan workflow instalasi praktis.</span>', 'html'],
    ['#mbes-em304 .equipment-detail-index', '07 / Bathymetry dan pemetaan seabed'],
    ['#sercel-428 .equipment-detail-index', '08 / Workflow akuisisi geofisika'],
    ['#drill-rig-th25m .equipment-detail-index', '09 / Dukungan geoteknik dan eksplorasi'],
    ['#a-frame-24t .equipment-detail-index', '11 / Dukungan deployment dan recovery'],
    ['#soil-geotechnical-lab .equipment-detail-index', '12 / Pengujian tanah dan dokumentasi'],
    ['#soil-geotechnical-lab .equipment-lab-head>div>p:not(.kicker)', 'Kapabilitas laboratorium tanah dan geoteknik ditampilkan melalui kolaborasi dengan PT Hydrocore. Laboratorium ini mendukung penanganan sampel, pengujian dasar dan lanjutan, pengujian batuan, penyimpanan terkendali, serta workflow terakreditasi ISO/IEC 17025.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) h4', 'Basic Lab Test'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(1)', 'Klasifikasi tanah: moisture content, Atterberg limits, sieve dan hydrometer, linear shrinkage, specific gravity, serta organic content.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(2)', 'Kimia tanah dan korosivitas: pH, electrical resistivity, carbonate, sulfate, chloride, dan salinity pada extracted pore water.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(1) li:nth-child(3)', 'Oedometer, permeability, mini lab vane, unconfined compression, UU/CD direct shear, UU triaxial, CiU/CiD triaxial, dan rock strength testing.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) h4', 'Advanced Lab Test'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(1)', 'X-Ray CT Scan, CRS consolidation, thixotropy, static simple shear, dan cyclic simple shear.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(2)', 'Bender element dan resonant column testing untuk penilaian perilaku tanah lanjutan.'],
    ['#soil-geotechnical-lab .equipment-lab-tests article:nth-child(2) li:nth-child(3)', 'Ruang penyimpanan dengan kontrol humidity dan temperature berkapasitas 300 sampel.'],
    ['#soil-geotechnical-lab .equipment-lab-statement', 'Laboratorium tanah yang lengkap dan advanced, terakreditasi ISO/IEC 17025.']
  ]
};

const equipmentPageTranslationOverridesV2 = {
  en: [
    ['.equipment-family-card:nth-child(1)>p', 'Geotechnical Equipment'],
    ['.equipment-family-card:nth-child(2)>p', 'Hydrographic / Geophysical Equipment'],
    ['.equipment-family-card:nth-child(1) a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(2)', '<span>02</span>Vibrocore System', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(3)', '<span>03</span>FT520 Piston Corer', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(4)', '<span>04</span>Box Core with T-Bar', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(5)', '<span>05</span>Grab Sampler', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(6)', '<span>09</span>Drill Rig TH-25M', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(7)', '<span>10</span>THI A-Frame 24T', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(8)', '<span>11</span>Soil & Geotechnical Laboratory', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(1)', '<span>06</span>MBES Kongsberg EM2040P', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(2)', '<span>07</span>MBES EM304', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(3)', '<span>08</span>Sercel 428', 'html'],
    ['#geotechnical-equipment .kicker', 'Geotechnical Equipment'],
    ['#geotechnical-equipment h3', 'CPT, coring, seabed sampling, and soil recovery systems for investigation work.'],
    ['.equipment-family-divider-geophysical .kicker', 'Hydrographic / Geophysical Equipment'],
    ['.equipment-family-divider-geophysical h3', 'Acquisition systems for bathymetry, seabed mapping, seismic, and survey data control.'],
    ['.equipment-family-divider:not(#geotechnical-equipment):not(#geophysical-equipment) .kicker', 'Geotechnical Support Equipment'],
    ['.equipment-family-divider:not(#geotechnical-equipment):not(#geophysical-equipment) h3', 'Drilling, deck handling, and laboratory support for sample recovery and testing.']
  ],
  id: [
    ['.equipment-family-card:nth-child(1)>p', 'Peralatan Geoteknik'],
    ['.equipment-family-card:nth-child(2)>p', 'Peralatan Hidrografi / Geofisika'],
    ['.equipment-family-card:nth-child(1) a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(2)', '<span>02</span>Vibrocore System', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(3)', '<span>03</span>FT520 Piston Corer', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(4)', '<span>04</span>Box Core with T-Bar', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(5)', '<span>05</span>Grab Sampler', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(6)', '<span>09</span>Drill Rig TH-25M', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(7)', '<span>10</span>THI A-Frame 24T', 'html'],
    ['.equipment-family-card:nth-child(1) a:nth-child(8)', '<span>11</span>Laboratorium Tanah & Geoteknik', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(1)', '<span>06</span>MBES Kongsberg EM2040P', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(2)', '<span>07</span>MBES EM304', 'html'],
    ['.equipment-family-card:nth-child(2) a:nth-child(3)', '<span>08</span>Sercel 428', 'html'],
    ['#geotechnical-equipment .kicker', 'Peralatan Geoteknik'],
    ['#geotechnical-equipment h3', 'Sistem CPT, coring, sampling seabed, dan recovery tanah untuk pekerjaan investigasi.'],
    ['.equipment-family-divider-geophysical .kicker', 'Peralatan Hidrografi / Geofisika'],
    ['.equipment-family-divider-geophysical h3', 'Sistem akuisisi untuk bathymetry, pemetaan seabed, seismik, dan kontrol data survei.'],
    ['.equipment-family-divider:not(#geotechnical-equipment):not(#geophysical-equipment) .kicker', 'Peralatan Pendukung Geoteknik'],
    ['.equipment-family-divider:not(#geotechnical-equipment):not(#geophysical-equipment) h3', 'Dukungan pengeboran, deck handling, dan laboratorium untuk recovery sampel dan pengujian.']
  ]
};

const equipmentSplitPageTranslationOverrides = {
  en: {
    geotechnical: [
      ['title', 'Geotechnical Equipment | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'PT Taka Hydrocore Indonesia geotechnical equipment page covering seabed CPT, vibrocore, piston corer, box core, grab sampler, drilling rigs, crawler CPT systems, A-frame, and soil laboratory support.'],
      ['.equipment-page .preloader-inner p', 'Preparing geotechnical equipment'],
      ['.equipment-hero .kicker', 'Geotechnical Equipment'],
      ['.equipment-hero h1', 'Geotechnical equipment prepared for soil investigation work.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Systems for seabed CPT, sampling, coring, drilling support, deck handling, and laboratory testing are prepared around each site condition and investigation scope.'],
      ['.equipment-overview-copy h2', 'Equipment selected around soil target, access, sampling method, and handling workflow.'],
      ['.equipment-overview-copy>p:not(.kicker)', 'Before mobilization, the team reviews water depth, soil target, sampling requirement, rig-up method, lifting arrangement, sample handling, laboratory plan, and reporting workflow.'],
      ['.equipment-family-card>p', 'Geotechnical Equipment'],
      ['.equipment-family-card a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
      ['.equipment-family-card a:nth-child(2)', '<span>02</span>THI A-Frame 24T', 'html'],
      ['.equipment-family-card a:nth-child(3)', '<span>03</span>CPT Wison APB', 'html'],
      ['.equipment-family-card a:nth-child(4)', '<span>04</span>Vibrocore System', 'html'],
      ['.equipment-family-card a:nth-child(5)', '<span>05</span>FT520 Piston Corer', 'html'],
      ['.equipment-family-card a:nth-child(6)', '<span>06</span>Box Core with T-Bar', 'html'],
      ['.equipment-family-card a:nth-child(7)', '<span>07</span>Grab Sampler', 'html'],
      ['.equipment-family-card a:nth-child(8)', '<span>08</span>THCP3 Eijkelkamp Crawler CPT', 'html'],
      ['.equipment-family-card a:nth-child(9)', '<span>09</span>Drill Rig TH-25M', 'html'],
      ['.equipment-family-card a:nth-child(10)', '<span>10</span>TH3 Drilling Rig Series', 'html'],
      ['.equipment-family-card a:nth-child(11)', '<span>11</span>Dando Mintec Crawler Rig', 'html'],
      ['.equipment-family-card a:nth-child(12)', '<span>12</span>Soil & Geotechnical Laboratory', 'html'],
      ['.equipment-directory-head h2', 'Geotechnical systems explained by field role and preparation workflow.'],
      ['#a-frame-24t .equipment-detail-index', '02 / Deployment and recovery support'],
      ['#cpt-wison-apb .equipment-detail-index', '03 / CPT system support'],
      ['#vibrocore-system .equipment-detail-index', '04 / Near-surface sediment recovery'],
      ['#piston-core .equipment-detail-index', '05 / Soft sediment core'],
      ['#box-core-tbar .equipment-detail-index', '06 / Surface sample and T-Bar support'],
      ['#grab-sampler .equipment-detail-index', '07 / Seabed material collection'],
      ['#thcp3-eijkelkamp-crawler-cpt .equipment-detail-index', '08 / Eijkelkamp crawler CPT support'],
      ['#drill-rig-th25m .equipment-detail-index', '09 / Geotechnical and exploratory support'],
      ['#th3-drilling-rig-series .equipment-detail-index', '10 / TH3 drilling rig series'],
      ['#dando-mintec-crawler-rig .equipment-detail-index', '11 / Crawler drilling support'],
      ['#soil-geotechnical-lab .equipment-detail-index', '12 / Soil testing and documentation']
    ],
    geophysical: [
      ['title', 'Hydrographic / Geophysical Equipment | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'PT Taka Hydrocore Indonesia hydrographic and geophysical equipment showcase for bathymetry, seabed mapping, positioning, oceanographic measurement, and survey data control systems.'],
      ['.equipment-page .preloader-inner p', 'Preparing hydrographic and geophysical equipment'],
      ['.equipment-hero .kicker', 'Hydrographic / Geophysical Equipment'],
      ['.equipment-hero h1', 'Hydrographic and geophysical equipment prepared for acquisition and data control.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Bathymetry, seabed mapping, positioning, oceanographic measurement, and onboard QC systems support reliable marine survey delivery.'],
      ['.equipment-overview-copy .kicker', 'Hydrographic and geophysical systems'],
      ['.equipment-overview-copy h2', 'Survey instruments selected around acquisition method, water depth, positioning, and data control.'],
      ['.equipment-overview-copy>p:not(.kicker)', 'A compact overview of equipment used to support bathymetry, seabed mapping, positioning, oceanographic measurement, visual inspection, and onboard QC.'],
      ['.geophys-showcase-section>.section-label', '<span>02</span> Equipment Showcase', 'html'],
      ['.geophys-showcase-head .kicker', 'Hydrographic / Geophysical Equipment']
    ],
    seismic: [
      ['title', '2D/3D HR Seismic Equipment | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', '2D HR seismic equipment overview for PT Taka Hydrocore Indonesia marine geophysical acquisition, source control, streamer, QC, and processing support.'],
      ['.equipment-page .preloader-inner p', 'Preparing 2D HR seismic equipment'],
      ['.equipment-hero .kicker', '2D/3D HR Seismic Equipment'],
      ['.equipment-hero h1', '2D HR seismic equipment for marine acquisition.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Equipment spread for high-resolution seismic recording, streamer operation, source control, field QC, processing, and interpretation support.'],
      ['.seismic-equipment-intro>.section-label', '<span>01</span> Acquisition Equipment', 'html'],
      ['.seismic-equipment-intro-copy .kicker', '2D HR seismic spread'],
      ['.seismic-equipment-intro-copy h2', 'Three equipment groups support recording, source control, and seismic data workflow.'],
      ['.seismic-equipment-intro-copy>p:not(.kicker)', "Based on the 2D HR seismic brochure, THI's marine seismic spread is arranged around recording hardware, source equipment, and processing software so acquisition, QC, and interpretation can move as one controlled workflow."],
      ['.seismic-equipment-section>.section-label', '<span>02</span> Equipment Directory', 'html'],
      ['.seismic-directory-head .kicker', 'System grouping'],
      ['.seismic-directory-head h2', 'Equipment organised by the way the seismic work is executed offshore.'],
      ['.seismic-metric-strip span:nth-child(1)', '<strong>Seal 428</strong>Recording system', 'html'],
      ['.seismic-metric-strip span:nth-child(2)', '<strong>1,200 m</strong>Active streamer', 'html'],
      ['.seismic-metric-strip span:nth-child(3)', '<strong>282.52 cfm</strong>Compressor capacity', 'html'],
      ['.seismic-metric-strip span:nth-child(4)', '<strong>QC</strong>Processing and interpretation', 'html'],
      ['#seismic-recording .seismic-family-head .kicker', 'Seismic Recording'],
      ['#seismic-recording .seismic-family-head h3', 'Recording backbone for controlled 2D HR marine acquisition.'],
      ['#seismic-recording .seismic-family-head p:not(.kicker)', 'The recording spread is arranged to receive streamer data, synchronize acquisition timing, digitize auxiliary channels, and secure field data during offshore operation.'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Recording System'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'Sercel Seal - 428'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Shipboard recording and acquisition control system used as the main interface between streamer data, navigation timing, auxiliary channels, and data storage.'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>DXCU-428 Seismic Controller</strong><span>Streamer interface with built-in high-voltage power supply, local or remote operation, deck safety connection, and GPS reference propagation.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>LCI-428 Acquisition Unit</strong><span>Interface between navigation and Seal 428, supporting physical T0 input, auxiliary trace management, and synchronization through GPS time reference.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(3)', '<strong>AXCU-428 Auxiliary Channel Unit</strong><span>Digitizes analog auxiliary channels for source, vessel, and acquisition support signals, with expandable channel capacity.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(4)', '<strong>GPS Time Server</strong><span>Provides acquisition timing so streamers, navigation, and source operation stay synchronized during continuous acquisition.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(5)', '<strong>NAS Storage</strong><span>Dedicated field storage for acquired records, QC transfer, backup handling, and data delivery preparation.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Streamer Control'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Bird Controller'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Streamer control equipment supports cable depth control, heading monitoring, and streamer behavior checks while the spread is towed behind the vessel.'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>LIU II Dual Channel Bird Controller</strong><span>Line interface and control unit for streamer-mounted devices, supporting communication between the operator system and bird control lines.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>Compass Bird Model 5011-2</strong><span>Externally mounted streamer device for adjustable depth control, depth measurement, ballast information, and compass heading data.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy .kicker', 'Streamer Spread'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy h4', 'Streamer'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy>p:not(.kicker)', 'The active streamer section receives reflected acoustic energy through hydrophone groups, supporting high-resolution seismic acquisition in a compact marine spread.'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(1)', '<strong>GEL ALS section</strong><span>150 m active line section per module with distributed acquisition electronics for marine streamer operation.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(2)', '<strong>12.5 m group spacing</strong><span>Hydrophone group interval used to support dense 2D HR seismic sampling along the survey line.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(3)', '<strong>1,200 m active streamer</strong><span>Active streamer length configured from multiple 150 m sections for marine acquisition coverage.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(4)', '<strong>96 channel configuration</strong><span>Channel setup aligned with the 1,200 m active streamer spread and 12.5 m group spacing.</span>', 'html'],
      ['#seismic-source .seismic-family-head .kicker', 'Seismic Source'],
      ['#seismic-source .seismic-family-head h3', 'Source control and compressed-air support for stable signal generation.'],
      ['#seismic-source .seismic-family-head p:not(.kicker)', 'The source system is prepared to control firing sequence, monitor near-field output, and maintain compressed-air supply for consistent seismic source operation.'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Source Control'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'Source Controller'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Control package used to trigger and monitor the seismic source during acquisition, keeping source timing aligned with recording and navigation.'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>HotShot Sources Controller</strong><span>Controls source firing command and supports repeatable source timing during marine seismic production.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>Near Field Hydrophone</strong><span>Monitors source output close to the array for field QC and source signature review.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Compressed-Air Source'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Compressors and Source Units'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Compressed-air and source equipment support controlled acoustic energy generation for high-resolution marine seismic acquisition.'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>Denair DG-2/400 Compressors</strong><span>Four compressor units at 70.63 cfm each, providing a combined capacity of 282.52 cfm.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>Teledyne Bolt Source</strong><span>Marine seismic source option prepared for controlled source output during acquisition.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(3)', '<strong>Sercel G-Source</strong><span>Seismic source unit suitable for high-resolution marine survey configuration and compact source operation.</span>', 'html'],
      ['#seismic-processing .seismic-family-head .kicker', 'Seismic Processing'],
      ['#seismic-processing .seismic-family-head h3', 'Software workflow for QC, processing, and interpretation.'],
      ['#seismic-processing .seismic-family-head p:not(.kicker)', 'Processing support helps field records move from acquisition QC into seismic processing and interpretation deliverables for geohazard, route, and site assessment.'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Field QC'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'QC Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Field QC software is used to review acquired records and support quality checks before data moves further into processing.'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>Radex Pro Seismic Software</strong><span>Supports seismic data review and field QC workflow.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>Coverpoint</strong><span>Used for QC support and practical inspection of seismic acquisition coverage.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Processing'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Processing Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Processing software supports seismic data conditioning, workflow control, and preparation of high-resolution deliverables.'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>Radex Pro Seismic Software</strong><span>Supports seismic processing workflow from recorded field data.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>GLOBE Claritas</strong><span>Processing platform used for seismic data preparation and technical output generation.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy .kicker', 'Interpretation'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy h4', 'Interpretation Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy>p:not(.kicker)', 'Interpretation tools support subsurface review, horizon and feature interpretation, and reporting for client decision-making.'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(1)', '<strong>IHS Kingdom Software</strong><span>Interpretation platform for seismic review, mapping, and subsurface interpretation.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(2)', '<strong>DUG Software</strong><span>Used to support seismic interpretation, visualization, and technical analysis workflow.</span>', 'html']
    ]
  },
  id: {
    geotechnical: [
      ['title', 'Peralatan Geoteknik | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Halaman peralatan geoteknik PT Taka Hydrocore Indonesia mencakup seabed CPT, vibrocore, piston corer, box core, grab sampler, drilling rig, crawler CPT, A-frame, dan dukungan laboratorium tanah.'],
      ['.equipment-page .preloader-inner p', 'Menyiapkan peralatan geoteknik'],
      ['.equipment-hero .kicker', 'Peralatan Geoteknik'],
      ['.equipment-hero h1', 'Peralatan geoteknik untuk pekerjaan investigasi tanah.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Sistem seabed CPT, sampling, coring, dukungan pengeboran, deck handling, dan pengujian laboratorium disiapkan sesuai kondisi site dan scope investigasi.'],
      ['.equipment-overview-copy h2', 'Peralatan dipilih berdasarkan target tanah, akses, metode sampling, dan workflow handling.'],
      ['.equipment-overview-copy>p:not(.kicker)', 'Sebelum mobilisasi, tim meninjau kedalaman air, target tanah, kebutuhan sampling, metode rig-up, rencana lifting, handling sampel, rencana laboratorium, dan workflow pelaporan.'],
      ['.equipment-family-card>p', 'Peralatan Geoteknik'],
      ['.equipment-family-card a:nth-child(1)', '<span>01</span>CPT Manta 200', 'html'],
      ['.equipment-family-card a:nth-child(2)', '<span>02</span>THI A-Frame 24T', 'html'],
      ['.equipment-family-card a:nth-child(3)', '<span>03</span>CPT Wison APB', 'html'],
      ['.equipment-family-card a:nth-child(4)', '<span>04</span>Vibrocore System', 'html'],
      ['.equipment-family-card a:nth-child(5)', '<span>05</span>FT520 Piston Corer', 'html'],
      ['.equipment-family-card a:nth-child(6)', '<span>06</span>Box Core with T-Bar', 'html'],
      ['.equipment-family-card a:nth-child(7)', '<span>07</span>Grab Sampler', 'html'],
      ['.equipment-family-card a:nth-child(8)', '<span>08</span>THCP3 Eijkelkamp Crawler CPT', 'html'],
      ['.equipment-family-card a:nth-child(9)', '<span>09</span>Drill Rig TH-25M', 'html'],
      ['.equipment-family-card a:nth-child(10)', '<span>10</span>Seri Drill Rig TH3', 'html'],
      ['.equipment-family-card a:nth-child(11)', '<span>11</span>Dando Mintec Crawler Rig', 'html'],
      ['.equipment-family-card a:nth-child(12)', '<span>12</span>Laboratorium Tanah & Geoteknik', 'html'],
      ['.equipment-directory-head h2', 'Sistem geoteknik dijelaskan berdasarkan peran lapangan dan workflow persiapan.'],
      ['#a-frame-24t .equipment-detail-index', '02 / Dukungan deployment dan recovery'],
      ['#cpt-wison-apb .equipment-detail-index', '03 / Dukungan sistem CPT'],
      ['#vibrocore-system .equipment-detail-index', '04 / Recovery sedimen near-surface'],
      ['#piston-core .equipment-detail-index', '05 / Core sedimen lunak'],
      ['#box-core-tbar .equipment-detail-index', '06 / Dukungan sample permukaan dan T-Bar'],
      ['#grab-sampler .equipment-detail-index', '07 / Pengambilan material seabed'],
      ['#thcp3-eijkelkamp-crawler-cpt .equipment-detail-index', '08 / Dukungan crawler CPT Eijkelkamp'],
      ['#drill-rig-th25m .equipment-detail-index', '09 / Dukungan geoteknik dan eksplorasi'],
      ['#dando-mintec-crawler-rig .kicker', 'Crawler Drilling'],
      ['#dando-mintec-crawler-rig .equipment-detail-index', '11 / Dukungan crawler drilling'],
      ['#dando-mintec-crawler-rig h3', 'Dando Mintec Crawler Drilling Rig'],
      ['#dando-mintec-crawler-rig .equipment-detail-copy>p:not(.kicker)', 'Rig pengeboran crawler untuk pekerjaan investigasi darat yang membutuhkan akses mobile, setup stabil, dan kesiapan operasi lapangan.', 'text'],
      ['#dando-mintec-crawler-rig .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung drilling dan sampling untuk scope geoteknik onshore dan eksplorasi.</span>', 'html'],
      ['#dando-mintec-crawler-rig .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Akses site, positioning rig, urutan drilling, dan kesiapan maintenance lapangan.</span>', 'html'],
      ['#th3-drilling-rig-series .kicker', 'Seri Drilling'],
      ['#th3-drilling-rig-series .equipment-detail-index', '10 / Seri drilling rig TH3'],
      ['#th3-drilling-rig-series h3', 'Seri Drill Rig TH3'],
      ['#th3-drilling-rig-series .equipment-detail-copy>p:not(.kicker)', 'TH3#1, TH3#4, dan TH3#5 digabung sebagai platform drilling compact untuk scope investigasi yang membutuhkan rig-up praktis dan recovery sampel yang andal.', 'text'],
      ['#th3-drilling-rig-series .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung drilling, coring, dan sampling untuk program investigasi darat.</span>', 'html'],
      ['#th3-drilling-rig-series .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Beberapa konfigurasi TH3, setup site, kontrol drilling, dan dukungan rutin lapangan.</span>', 'html'],
      ['#thcp3-eijkelkamp-crawler-cpt .kicker', 'Crawler CPT'],
      ['#thcp3-eijkelkamp-crawler-cpt h3', 'THCP3 Eijkelkamp Crawler CPT'],
      ['#thcp3-eijkelkamp-crawler-cpt .equipment-detail-copy>p:not(.kicker)', 'Sistem crawler CPT untuk cone penetration testing onshore, dengan mobilitas praktis untuk area investigasi yang membutuhkan banyak titik pengujian.', 'text'],
      ['#thcp3-eijkelkamp-crawler-cpt .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung CPT testing, profiling tanah, dan kontrol data lapangan.</span>', 'html'],
      ['#thcp3-eijkelkamp-crawler-cpt .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Kalibrasi alat, perpindahan lapangan, setup titik uji, dan dokumentasi akuisisi.</span>', 'html'],
      ['#cpt-wison-apb .kicker', 'Sistem CPT'],
      ['#cpt-wison-apb h3', 'CPT Wison APB'],
      ['#cpt-wison-apb .equipment-detail-copy>p:not(.kicker)', 'Sistem cone penetration testing untuk mendukung investigasi geoteknik yang membutuhkan pembacaan lapangan konsisten dan setup terkontrol.', 'text'],
      ['#cpt-wison-apb .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung pengumpulan data CPT untuk penilaian soil behavior dan engineering.</span>', 'html'],
      ['#cpt-wison-apb .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Pengecekan sistem, urutan pengujian, kontrol operator, dan workflow laporan lapangan.</span>', 'html'],
      ['#soil-geotechnical-lab .equipment-detail-index', '12 / Pengujian tanah dan dokumentasi']
    ],
    geophysical: [
      ['title', 'Peralatan Hidrografi / Geofisika | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Showcase peralatan hidrografi dan geofisika PT Taka Hydrocore Indonesia untuk bathymetry, pemetaan seabed, positioning, oceanographic, dan kontrol data survei.'],
      ['.equipment-page .preloader-inner p', 'Menyiapkan peralatan hidrografi dan geofisika'],
      ['.equipment-hero .kicker', 'Peralatan Hidrografi / Geofisika'],
      ['.equipment-hero h1', 'Peralatan hidrografi dan geofisika untuk akuisisi dan kontrol data.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Bathymetry, pemetaan seabed, positioning, pengukuran oceanographic, dan sistem QC onboard mendukung delivery survei marine yang andal.'],
      ['.equipment-overview-copy .kicker', 'Sistem hidrografi dan geofisika'],
      ['.equipment-overview-copy h2', 'Instrumen survei dipilih berdasarkan metode akuisisi, kedalaman air, positioning, dan kontrol data.'],
      ['.equipment-overview-copy>p:not(.kicker)', 'Ringkasan compact peralatan untuk bathymetry, pemetaan seabed, positioning, pengukuran oceanographic, inspeksi visual, dan QC onboard.'],
      ['.geophys-showcase-section>.section-label', '<span>02</span> Showcase Peralatan', 'html'],
      ['.geophys-showcase-head .kicker', 'Peralatan Hidrografi / Geofisika']
    ],
    seismic: [
      ['title', 'Peralatan 2D/3D HR Seismic | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Ringkasan peralatan 2D HR seismic PT Taka Hydrocore Indonesia untuk akuisisi geofisika marine, source control, streamer, QC, dan dukungan processing.'],
      ['.equipment-page .preloader-inner p', 'Menyiapkan peralatan 2D HR seismic'],
      ['.equipment-hero .kicker', 'Peralatan 2D/3D HR Seismic'],
      ['.equipment-hero h1', 'Peralatan 2D HR seismic untuk akuisisi marine.'],
      ['.equipment-hero-copy>p:not(.kicker)', 'Equipment spread untuk high-resolution seismic recording, operasi streamer, source control, field QC, processing, dan dukungan interpretasi.'],
      ['.seismic-equipment-intro>.section-label', '<span>01</span> Peralatan Akuisisi', 'html'],
      ['.seismic-equipment-intro-copy .kicker', '2D HR seismic spread'],
      ['.seismic-equipment-intro-copy h2', 'Tiga kelompok peralatan mendukung recording, source control, dan workflow data seismic.'],
      ['.seismic-equipment-intro-copy>p:not(.kicker)', 'Berdasarkan brosur 2D HR seismic, marine seismic spread THI disusun melalui recording hardware, source equipment, dan software processing agar akuisisi, QC, dan interpretasi berjalan sebagai satu workflow terkontrol.'],
      ['.seismic-equipment-section>.section-label', '<span>02</span> Direktori Peralatan', 'html'],
      ['.seismic-directory-head .kicker', 'Pengelompokan sistem'],
      ['.seismic-directory-head h2', 'Peralatan disusun berdasarkan cara pekerjaan seismic dijalankan offshore.'],
      ['.seismic-metric-strip span:nth-child(1)', '<strong>Seal 428</strong>Recording system', 'html'],
      ['.seismic-metric-strip span:nth-child(2)', '<strong>1,200 m</strong>Active streamer', 'html'],
      ['.seismic-metric-strip span:nth-child(3)', '<strong>282.52 cfm</strong>Kapasitas compressor', 'html'],
      ['.seismic-metric-strip span:nth-child(4)', '<strong>QC</strong>Processing dan interpretation', 'html'],
      ['#seismic-recording .seismic-family-head .kicker', 'Seismic Recording'],
      ['#seismic-recording .seismic-family-head h3', 'Backbone recording untuk akuisisi 2D HR marine yang terkontrol.'],
      ['#seismic-recording .seismic-family-head p:not(.kicker)', 'Recording spread disusun untuk menerima data streamer, menyinkronkan timing akuisisi, mendigitalkan auxiliary channel, dan mengamankan data lapangan selama operasi offshore.'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Recording System'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'Sercel Seal - 428'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Sistem recording dan acquisition control di kapal yang menjadi interface utama antara data streamer, navigation timing, auxiliary channel, dan penyimpanan data.'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>DXCU-428 Seismic Controller</strong><span>Interface streamer dengan built-in high-voltage power supply, operasi lokal atau remote, koneksi deck safety, dan propagasi referensi GPS.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>LCI-428 Acquisition Unit</strong><span>Interface antara navigation dan Seal 428, mendukung input T0 fisik, pengelolaan auxiliary trace, dan sinkronisasi melalui referensi waktu GPS.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(3)', '<strong>AXCU-428 Auxiliary Channel Unit</strong><span>Mendigitalkan channel analog auxiliary untuk sinyal source, vessel, dan dukungan akuisisi, dengan kapasitas channel yang dapat diperluas.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(4)', '<strong>GPS Time Server</strong><span>Menyediakan timing akuisisi agar streamer, navigation, dan operasi source tetap tersinkron selama akuisisi kontinu.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(5)', '<strong>NAS Storage</strong><span>Penyimpanan lapangan khusus untuk acquired record, transfer QC, backup handling, dan persiapan data delivery.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Streamer Control'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Bird Controller'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Peralatan streamer control mendukung depth control, heading monitoring, dan pengecekan perilaku streamer saat spread ditarik di belakang vessel.'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>LIU II Dual Channel Bird Controller</strong><span>Line interface dan control unit untuk perangkat streamer-mounted, mendukung komunikasi antara operator system dan bird control lines.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>Compass Bird Model 5011-2</strong><span>Perangkat streamer eksternal untuk adjustable depth control, depth measurement, informasi ballast, dan data compass heading.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy .kicker', 'Streamer Spread'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy h4', 'Streamer'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-detail-copy>p:not(.kicker)', 'Active streamer section menerima energi akustik pantulan melalui hydrophone group untuk mendukung akuisisi seismic high-resolution dalam marine spread yang compact.'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(1)', '<strong>GEL ALS section</strong><span>Active line section 150 m per module dengan distributed acquisition electronics untuk operasi marine streamer.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(2)', '<strong>12.5 m group spacing</strong><span>Interval hydrophone group untuk mendukung sampling 2D HR seismic yang rapat sepanjang survey line.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(3)', '<strong>1,200 m active streamer</strong><span>Panjang active streamer yang dikonfigurasi dari beberapa section 150 m untuk cakupan akuisisi marine.</span>', 'html'],
      ['#seismic-recording .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(4)', '<strong>96 channel configuration</strong><span>Konfigurasi channel yang selaras dengan active streamer 1,200 m dan group spacing 12.5 m.</span>', 'html'],
      ['#seismic-source .seismic-family-head .kicker', 'Seismic Source'],
      ['#seismic-source .seismic-family-head h3', 'Source control dan dukungan compressed-air untuk signal generation yang stabil.'],
      ['#seismic-source .seismic-family-head p:not(.kicker)', 'Source system disiapkan untuk mengontrol firing sequence, memantau near-field output, dan menjaga pasokan compressed-air untuk operasi seismic source yang konsisten.'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Source Control'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'Source Controller'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Control package untuk trigger dan monitoring seismic source selama akuisisi, menjaga timing source tetap selaras dengan recording dan navigation.'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>HotShot Sources Controller</strong><span>Mengontrol perintah source firing dan mendukung source timing yang repeatable selama produksi marine seismic.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>Near Field Hydrophone</strong><span>Memantau output source dari jarak dekat untuk field QC dan source signature review.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Compressed-Air Source'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Compressors and Source Units'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Compressed-air dan source equipment mendukung acoustic energy generation yang terkontrol untuk akuisisi high-resolution marine seismic.'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>Denair DG-2/400 Compressors</strong><span>Empat unit compressor dengan kapasitas 70.63 cfm per unit, menghasilkan total kapasitas 282.52 cfm.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>Teledyne Bolt Source</strong><span>Opsi marine seismic source untuk source output yang terkontrol selama akuisisi.</span>', 'html'],
      ['#seismic-source .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(3)', '<strong>Sercel G-Source</strong><span>Unit seismic source untuk konfigurasi high-resolution marine survey dan operasi source yang compact.</span>', 'html'],
      ['#seismic-processing .seismic-family-head .kicker', 'Seismic Processing'],
      ['#seismic-processing .seismic-family-head h3', 'Workflow software untuk QC, processing, dan interpretation.'],
      ['#seismic-processing .seismic-family-head p:not(.kicker)', 'Dukungan processing membantu field record bergerak dari acquisition QC ke seismic processing dan interpretation deliverables untuk geohazard, route, dan site assessment.'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy .kicker', 'Field QC'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy h4', 'QC Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-detail-copy>p:not(.kicker)', 'Field QC software digunakan untuk meninjau acquired record dan mendukung quality check sebelum data masuk ke tahap processing.'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(1)', '<strong>Radex Pro Seismic Software</strong><span>Mendukung seismic data review dan field QC workflow.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(1) .seismic-component-stack p:nth-child(2)', '<strong>Coverpoint</strong><span>Digunakan untuk dukungan QC dan inspeksi praktis terhadap seismic acquisition coverage.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy .kicker', 'Processing'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy h4', 'Processing Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-detail-copy>p:not(.kicker)', 'Processing software mendukung data conditioning, kontrol workflow, dan persiapan high-resolution deliverables.'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(1)', '<strong>Radex Pro Seismic Software</strong><span>Mendukung seismic processing workflow dari recorded field data.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(2) .seismic-component-stack p:nth-child(2)', '<strong>GLOBE Claritas</strong><span>Platform processing untuk persiapan seismic data dan technical output generation.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy .kicker', 'Interpretation'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy h4', 'Interpretation Software'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-detail-copy>p:not(.kicker)', 'Interpretation tools mendukung subsurface review, interpretasi horizon dan feature, serta reporting untuk kebutuhan keputusan klien.'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(1)', '<strong>IHS Kingdom Software</strong><span>Platform interpretation untuk seismic review, mapping, dan subsurface interpretation.</span>', 'html'],
      ['#seismic-processing .seismic-detail:nth-of-type(3) .seismic-component-stack p:nth-child(2)', '<strong>DUG Software</strong><span>Digunakan untuk mendukung seismic interpretation, visualization, dan technical analysis workflow.</span>', 'html']
    ]
  }
};

const applyEquipmentPageLanguage = (language) => {
  if (!document.body.classList.contains('equipment-page')) return;
  const translations = equipmentPageTranslations[language] || equipmentPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  const overrides = equipmentPageTranslationOverrides[language] || equipmentPageTranslationOverrides.en;
  overrides.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  const groupOverrides = equipmentPageTranslationOverridesV2[language] || equipmentPageTranslationOverridesV2.en;
  groupOverrides.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  const splitType = document.body.classList.contains('equipment-geotechnical-page')
    ? 'geotechnical'
    : document.body.classList.contains('equipment-geophysical-page')
      ? 'geophysical'
      : document.body.classList.contains('equipment-seismic-page')
        ? 'seismic'
        : '';
  if (splitType) {
    const splitOverrides = equipmentSplitPageTranslationOverrides[language]?.[splitType] || equipmentSplitPageTranslationOverrides.en[splitType];
    splitOverrides.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  }
};

const vesselPageTranslations = {
  en: [
    ['title', 'Operational Platforms | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Operational platforms supporting PT Taka Hydrocore Indonesia marine geophysical, offshore geotechnical, seismic, and seabed investigation services.'],
    ['.vessel-page .preloader-inner p', 'Preparing operational platforms'],
    ['.vessel-hero-copy .kicker', 'Service Support Assets'],
    ['.vessel-hero h1', 'Operational platforms supporting marine survey services.'],
    ['.vessel-hero-copy>p:not(.kicker)', 'THI uses suitable marine platforms to support offshore geotechnical drilling, marine geophysical acquisition, seismic survey, seabed investigation, and onboard field execution.'],
    ['.vessel-overview>.section-label', '<span>01</span> Support Platform Directory', 'html'],
    ['.vessel-overview-head .kicker', 'Service support platforms'],
    ['.vessel-overview-head h2', 'Platforms selected around survey objective, water depth, and equipment spread.'],
    ['.vessel-collaboration span', 'Operational collaboration'],
    ['.vessel-collaboration p', 'THI works with Taka Geodrill to align marine platforms, drilling systems, survey equipment, and field crews with the technical requirements of each service scope.'],
    ['.vessel-platform-list a:nth-child(1) small', 'Offshore geotechnical support'],
    ['.vessel-platform-list a:nth-child(1) p', 'Offshore soil investigation platform with moonpool drilling, station keeping, and onboard soil handling.'],
    ['.vessel-platform-list a:nth-child(2) small', 'Marine geophysical support'],
    ['.vessel-platform-list a:nth-child(2) p', 'Marine survey vessel for geophysical acquisition, high-resolution seismic, and seabed mapping work.'],
    ['.vessel-platform-list a:nth-child(3) small', 'Seismic and geophysical support'],
    ['.vessel-platform-list a:nth-child(3) p', 'Seismic and geophysical platform for subsea mapping, onboard processing, and offshore support.'],
    ['.vessel-platform-list a:nth-child(4) small', 'Coming soon'],
    ['.vessel-platform-list a:nth-child(4) p', 'New-generation geotechnical platform prepared for offshore drilling, deployment support, and marine site investigation work.'],
    ['#ag-geodrill>.section-label', '<span>01</span> AG Geodrill', 'html'],
    ['#ag-geodrill .vessel-detail-copy h2', 'Geotechnical vessel for offshore soil investigation.'],
    ['#ag-geodrill .vessel-detail-copy>p:not(.kicker)', 'AG Geodrill is presented by THI as a dedicated offshore geotechnical vessel. Its configuration is centered on station keeping, heave compensated drilling, moonpool deployment, seabed frame handling, and onboard soil handling for survey campaigns.'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['#ss-barakuda>.section-label', '<span>02</span> SS Barakuda', 'html'],
    ['#ss-barakuda .vessel-detail-copy h2', 'Marine survey vessel for seismic and geophysical campaigns.'],
    ['#ss-barakuda .vessel-detail-copy>p:not(.kicker)', 'SS Barakuda is listed by THI as a research ship for geophysical and high resolution seismic survey work. Its operating profile suits survey lines, geohazard investigation, and exploration-support acquisition using marine geophysical sensors.'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['#voyager-explorer>.section-label', '<span>03</span> Voyager Explorer', 'html'],
    ['#voyager-explorer .vessel-detail-copy h2', 'Seismic and geophysical vessel for subsea mapping.'],
    ['#voyager-explorer .vessel-detail-copy>p:not(.kicker)', 'Voyager Explorer is positioned as a seismic and geophysical survey vessel for subsea mapping, high-quality acquisition, onboard processing, and field support for oil and gas, marine, and subsea infrastructure work.'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['#oceanic-geodrill>.section-label', '<span>04</span> Oceanic Geodrill', 'html'],
    ['#oceanic-geodrill .vessel-status-pill', 'Coming soon'],
    ['#oceanic-geodrill .vessel-detail-copy h2', 'Offshore geotechnical platform for future field campaigns.'],
    ['#oceanic-geodrill .vessel-detail-copy>p:not(.kicker)', 'Oceanic Geodrill is prepared as an offshore geotechnical platform to support drilling, seabed equipment deployment, and marine site investigation scopes with larger accommodation and vessel power capacity.'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['.vessel-gallery-section>.section-label', '<span>05</span> Vessel Gallery', 'html'],
    ['.vessel-gallery-section .vessel-overview-head .kicker', 'Selected documentation'],
    ['.vessel-gallery-section .vessel-overview-head h2', 'Each photograph is assigned to a vessel context.'],
    ['.vessel-gallery figure:nth-child(1) figcaption', 'AG Geodrill operational deck'],
    ['.vessel-gallery figure:nth-child(2) figcaption', 'AG Geodrill side profile'],
    ['.vessel-gallery figure:nth-child(3) figcaption', 'SS Barakuda survey operation'],
    ['.vessel-gallery figure:nth-child(4) figcaption', 'SS Barakuda aerial documentation'],
    ['.vessel-gallery figure:nth-child(5) figcaption', 'Deck activity'],
  ],
  id: [
    ['title', 'Platform Operasional | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Platform operasional yang mendukung layanan geofisika marine, geoteknik offshore, seismik, dan investigasi seabed PT Taka Hydrocore Indonesia.'],
    ['.vessel-page .preloader-inner p', 'Menyiapkan platform operasional'],
    ['.vessel-hero-copy .kicker', 'Aset Pendukung Layanan'],
    ['.vessel-hero h1', 'Platform operasional pendukung layanan survei marine.'],
    ['.vessel-hero-copy>p:not(.kicker)', 'THI menggunakan platform marine yang sesuai untuk mendukung pengeboran geoteknik offshore, akuisisi geofisika marine, survei seismik, investigasi seabed, dan eksekusi lapangan onboard.'],
    ['.vessel-overview>.section-label', '<span>01</span> Direktori Platform Pendukung', 'html'],
    ['.vessel-overview-head .kicker', 'Platform pendukung layanan'],
    ['.vessel-overview-head h2', 'Platform dipilih berdasarkan tujuan survei, kedalaman air, dan kebutuhan peralatan.'],
    ['.vessel-collaboration span', 'Kolaborasi operasional'],
    ['.vessel-collaboration p', 'THI bekerja bersama Taka Geodrill untuk menyelaraskan platform marine, sistem pengeboran, peralatan survei, dan kru lapangan dengan kebutuhan teknis setiap lingkup layanan.'],
    ['.vessel-platform-list a:nth-child(1) small', 'Dukungan geoteknik offshore'],
    ['.vessel-platform-list a:nth-child(1) p', 'Platform investigasi tanah offshore dengan pengeboran moonpool, station keeping, dan penanganan soil onboard.'],
    ['.vessel-platform-list a:nth-child(2) small', 'Dukungan geofisika marine'],
    ['.vessel-platform-list a:nth-child(2) p', 'Kapal survei marine untuk akuisisi geofisika, seismik resolusi tinggi, dan pemetaan seabed.'],
    ['.vessel-platform-list a:nth-child(3) small', 'Dukungan seismik dan geofisika'],
    ['.vessel-platform-list a:nth-child(3) p', 'Platform seismik dan geofisika untuk pemetaan bawah laut, pemrosesan onboard, dan dukungan offshore.'],
    ['.vessel-platform-list a:nth-child(4) small', 'Segera hadir'],
    ['.vessel-platform-list a:nth-child(4) p', 'Platform geoteknik generasi baru yang disiapkan untuk pengeboran offshore, dukungan deployment, dan investigasi site marine.'],
    ['#ag-geodrill>.section-label', '<span>01</span> AG Geodrill', 'html'],
    ['#ag-geodrill .vessel-detail-copy h2', 'Kapal geoteknik untuk investigasi tanah offshore.'],
    ['#ag-geodrill .vessel-detail-copy>p:not(.kicker)', 'AG Geodrill dipresentasikan THI sebagai kapal geoteknik offshore khusus. Konfigurasinya berfokus pada station keeping, heave compensated drilling, deployment melalui moonpool, penanganan seabed frame, dan dukungan soil handling onboard.'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['#ss-barakuda>.section-label', '<span>02</span> SS Barakuda', 'html'],
    ['#ss-barakuda .vessel-detail-copy h2', 'Kapal survei marine untuk kampanye seismik dan geofisika.'],
    ['#ss-barakuda .vessel-detail-copy>p:not(.kicker)', 'SS Barakuda dicantumkan THI sebagai research ship untuk survei geofisika dan seismik resolusi tinggi. Profil operasinya cocok untuk lintasan survei, investigasi geohazard, dan akuisisi pendukung eksplorasi dengan sensor geofisika marine.'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['#voyager-explorer>.section-label', '<span>03</span> Voyager Explorer', 'html'],
    ['#voyager-explorer .vessel-detail-copy h2', 'Kapal seismik dan geofisika untuk pemetaan bawah laut.'],
    ['#voyager-explorer .vessel-detail-copy>p:not(.kicker)', 'Voyager Explorer diposisikan sebagai kapal survei seismik dan geofisika untuk pemetaan bawah laut, akuisisi berkualitas tinggi, pemrosesan onboard, dan dukungan lapangan bagi minyak dan gas, kelautan, serta infrastruktur bawah laut.'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['#oceanic-geodrill>.section-label', '<span>04</span> Oceanic Geodrill', 'html'],
    ['#oceanic-geodrill .vessel-status-pill', 'Segera hadir'],
    ['#oceanic-geodrill .vessel-detail-copy h2', 'Platform geoteknik offshore untuk kampanye lapangan berikutnya.'],
    ['#oceanic-geodrill .vessel-detail-copy>p:not(.kicker)', 'Oceanic Geodrill disiapkan sebagai platform geoteknik offshore untuk mendukung pengeboran, deployment peralatan seabed, dan lingkup investigasi site marine dengan kapasitas akomodasi dan daya kapal yang lebih besar.'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#oceanic-geodrill .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['.vessel-gallery-section>.section-label', '<span>05</span> Galeri Kapal', 'html'],
    ['.vessel-gallery-section .vessel-overview-head .kicker', 'Dokumentasi terpilih'],
    ['.vessel-gallery-section .vessel-overview-head h2', 'Setiap foto ditempatkan sesuai konteks kapalnya.'],
    ['.vessel-gallery figure:nth-child(1) figcaption', 'Deck operasional AG Geodrill'],
    ['.vessel-gallery figure:nth-child(2) figcaption', 'Side profile AG Geodrill'],
    ['.vessel-gallery figure:nth-child(3) figcaption', 'Operasi survei SS Barakuda'],
    ['.vessel-gallery figure:nth-child(4) figcaption', 'Dokumentasi aerial SS Barakuda'],
    ['.vessel-gallery figure:nth-child(5) figcaption', 'Aktivitas deck'],
  ]
};

const applyVesselPageLanguage = (language) => {
  if (!document.body.classList.contains('vessel-page')) return;
  const translations = vesselPageTranslations[language] || vesselPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const qualityPageTranslations = {
  en: [
    ['title', 'Quality & Management System | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia quality management system references covering policy, business process, ISO certificates, SMK3, and document control.'],
    ['.quality-page .preloader-inner p', 'Preparing management system'],
    ['.quality-page .qhse-page-hero .kicker', 'Quality'],
    ['.quality-page .qhse-page-hero h1', 'Quality management references for dependable project delivery.'],
    ['.quality-page .qhse-page-hero-copy>p:not(.kicker)', "THI keeps policy, certification, process, and quality control records clear so project requirements can be reviewed with proper traceability."],
    ['.management-system-section>.section-label', '<span>01</span> Management System', 'html'],
    ['.management-system-head .kicker', 'Compliance structure'],
    ['.management-system-head h2', 'Policy, certification, and documented controls in one place.'],
    ['.management-system-head>p', "Quality references are arranged around the documents most often needed during tender, audit, project kick-off, and management review activities."],
    ['.management-access-card:nth-child(1) span', 'Policy'],
    ['.management-access-card:nth-child(1) strong', 'Policy / Kebijakan'],
    ['.management-access-card:nth-child(1) p', 'QHSE Policy 2026, management commitments, and the policy points used as company guidance.'],
    ['.management-access-card:nth-child(2) span', 'Process'],
    ['.management-access-card:nth-child(2) strong', 'Business Process Value Chain'],
    ['.management-access-card:nth-child(2) p', 'Organisation-level process map showing how inputs, core operation, support functions, and outputs connect.'],
    ['.management-access-card:nth-child(3) span', 'Certificate'],
    ['.management-access-card:nth-child(3) strong', 'Certification Management System'],
    ['.management-access-card:nth-child(3) p', 'ISO and local certificate references supporting quality, safety, environment, and Indonesian compliance.'],
    ['.quality-policy-section>.section-label', '<span>02</span> Policy / Kebijakan', 'html'],
    ['.quality-policy-section .qhse-document-copy .kicker', 'QHSE Policy 2026'],
    ['.quality-policy-section .qhse-document-copy h2', 'Eight commitments that guide the way THI manages work.'],
    ['.quality-policy-section .qhse-document-copy>p:not(.kicker)', 'The policy connects quality, occupational health and safety, environmental control, compliance, continuous improvement, CSR, employee participation, and policy communication into one operating commitment.'],
    ['.quality-policy-section .button b', 'Open policy document'],
    ['.quality-policy-section figcaption a', 'Open full policy <span>↗</span>', 'html'],
    ['.qhse-policy-points article:nth-child(1) h3', 'Management systems'],
    ['.qhse-policy-points article:nth-child(1) p', 'Implement quality, occupational health and safety, and environmental systems aligned with ISO 9001, ISO 45001, and ISO 14001.'],
    ['.qhse-policy-points article:nth-child(2) h3', 'Customer service'],
    ['.qhse-policy-points article:nth-child(2) p', 'Respond quickly and accurately, pursue quality and reliability, and aim to meet or exceed customer expectations.'],
    ['.qhse-policy-points article:nth-child(3) h3', 'Compliance'],
    ['.qhse-policy-points article:nth-child(3) p', 'Comply with legislation and other requirements related to quality and occupational health and safety management.'],
    ['.qhse-policy-points article:nth-child(4) h3', 'Continuous improvement'],
    ['.qhse-policy-points article:nth-child(4) p', 'Improve through planning, implementation, reporting, and evaluation across company activities.'],
    ['.qhse-policy-points article:nth-child(5) h3', 'Prevention'],
    ['.qhse-policy-points article:nth-child(5) p', 'Prevent environmental pollution, climate impact, occupational accidents, work-related illness, and disease transmission risk.'],
    ['.qhse-policy-points article:nth-child(6) h3', 'CSR participation'],
    ['.qhse-policy-points article:nth-child(6) p', 'Support social responsibility through practical work opportunities, scholarships, sponsorship, and social activities.'],
    ['.qhse-policy-points article:nth-child(7) h3', 'Participation'],
    ['.qhse-policy-points article:nth-child(7) p', 'Encourage employee participation and consultation to create a safe, comfortable, and healthy workplace.'],
    ['.qhse-policy-points article:nth-child(8) h3', 'Communication'],
    ['.qhse-policy-points article:nth-child(8) p', 'Communicate company policy to employees and relevant external parties, with annual review by top management.'],
    ['.quality-value-chain-section>.section-label', '<span>03</span> Business Process', 'html'],
    ['.quality-value-chain-head .kicker', 'Value chain organisation'],
    ['.quality-value-chain-head h2', 'How THI connects management, operation, and support processes.'],
    ['.quality-value-chain-head p:not(.kicker)', 'The value chain gives clients a clear overview of how customer requirements move through tender, contract management, project planning, operation, monitoring, customer relationship, and internal support functions.'],
    ['.qhse-certification-section>.section-label', '<span>04</span> Certification Management System', 'html'],
    ['.qhse-certification-copy .kicker', 'Formal references'],
    ['.qhse-certification-copy h2', 'Certificate records for quality, safety, environment, and local compliance.'],
    ['.qhse-certification-copy>p', 'Certificate documents are maintained as formal references for prequalification, project preparation, and audit support.'],
    ['.quality-page .qhse-iso-list article:nth-child(1) h3', 'Quality Management System'],
    ['.quality-page .qhse-iso-list article:nth-child(1) p', 'Supports consistent service delivery, document control, quality assurance, and traceable project records.'],
    ['.quality-page .qhse-iso-list article:nth-child(2) h3', 'Occupational Health & Safety Management System'],
    ['.quality-page .qhse-iso-list article:nth-child(2) p', 'Supports personnel readiness, worksite discipline, incident prevention, and safer field execution.'],
    ['.quality-page .qhse-iso-list article:nth-child(3) h3', 'Environmental Management System'],
    ['.quality-page .qhse-iso-list article:nth-child(3) p', 'Supports environmental management practices, impact prevention, and site-level environmental control.'],
    ['.quality-page .qhse-iso-list article:nth-child(4) h3', 'Indonesian Occupational Safety and Health Certificate'],
    ['.quality-page .qhse-iso-list article:nth-child(4) p', 'Local SMK3 recognition for occupational safety and health management implementation in Indonesia.'],
    ['.quality-page .qhse-iso-list a', 'Open certificate <span>↗</span>', 'html']
  ],
  id: [
    ['title', 'Sistem Manajemen Mutu | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Referensi sistem manajemen mutu PT Taka Hydrocore Indonesia yang mencakup kebijakan, business process, sertifikat ISO, SMK3, dan kontrol dokumen.'],
    ['.quality-page .preloader-inner p', 'Menyiapkan sistem manajemen'],
    ['.quality-page .qhse-page-hero .kicker', 'Mutu'],
    ['.quality-page .qhse-page-hero h1', 'Referensi manajemen mutu untuk delivery proyek yang andal.'],
    ['.quality-page .qhse-page-hero-copy>p:not(.kicker)', 'THI menjaga catatan kebijakan, sertifikasi, proses, dan kontrol mutu tetap jelas agar kebutuhan proyek dapat ditinjau dengan traceability yang baik.'],
    ['.management-system-section>.section-label', '<span>01</span> Sistem Manajemen', 'html'],
    ['.management-system-head .kicker', 'Struktur kepatuhan'],
    ['.management-system-head h2', 'Kebijakan, sertifikasi, dan kontrol terdokumentasi dalam satu tempat.'],
    ['.management-system-head>p', 'Referensi mutu disusun berdasarkan dokumen yang paling sering dibutuhkan saat tender, audit, project kick-off, dan management review.'],
    ['.management-access-card:nth-child(1) span', 'Policy'],
    ['.management-access-card:nth-child(1) strong', 'Policy / Kebijakan'],
    ['.management-access-card:nth-child(1) p', 'QHSE Policy 2026, komitmen manajemen, dan poin kebijakan yang menjadi panduan perusahaan.'],
    ['.management-access-card:nth-child(2) span', 'Process'],
    ['.management-access-card:nth-child(2) strong', 'Business Process Value Chain'],
    ['.management-access-card:nth-child(2) p', 'Peta proses organisasi yang menunjukkan hubungan input, operasi inti, fungsi pendukung, dan output.'],
    ['.management-access-card:nth-child(3) span', 'Certificate'],
    ['.management-access-card:nth-child(3) strong', 'Certification Management System'],
    ['.management-access-card:nth-child(3) p', 'Referensi sertifikat ISO dan sertifikat lokal yang mendukung mutu, keselamatan, lingkungan, dan kepatuhan Indonesia.'],
    ['.quality-policy-section>.section-label', '<span>02</span> Policy / Kebijakan', 'html'],
    ['.quality-policy-section .qhse-document-copy .kicker', 'QHSE Policy 2026'],
    ['.quality-policy-section .qhse-document-copy h2', 'Delapan komitmen yang memandu cara kerja THI.'],
    ['.quality-policy-section .qhse-document-copy>p:not(.kicker)', 'Kebijakan ini menghubungkan mutu, kesehatan dan keselamatan kerja, kontrol lingkungan, kepatuhan, perbaikan berkelanjutan, CSR, partisipasi karyawan, dan komunikasi kebijakan dalam satu komitmen operasional.'],
    ['.quality-policy-section .button b', 'Buka dokumen kebijakan'],
    ['.quality-policy-section figcaption a', 'Buka kebijakan lengkap <span>↗</span>', 'html'],
    ['.qhse-policy-points article:nth-child(1) h3', 'Sistem manajemen'],
    ['.qhse-policy-points article:nth-child(1) p', 'Menerapkan sistem mutu, kesehatan dan keselamatan kerja, serta lingkungan yang selaras dengan ISO 9001, ISO 45001, dan ISO 14001.'],
    ['.qhse-policy-points article:nth-child(2) h3', 'Layanan pelanggan'],
    ['.qhse-policy-points article:nth-child(2) p', 'Merespons dengan cepat dan akurat, menjaga mutu serta keandalan, dan berupaya memenuhi atau melampaui ekspektasi pelanggan.'],
    ['.qhse-policy-points article:nth-child(3) h3', 'Kepatuhan'],
    ['.qhse-policy-points article:nth-child(3) p', 'Mematuhi peraturan dan persyaratan lain yang terkait dengan mutu serta manajemen kesehatan dan keselamatan kerja.'],
    ['.qhse-policy-points article:nth-child(4) h3', 'Perbaikan berkelanjutan'],
    ['.qhse-policy-points article:nth-child(4) p', 'Melakukan peningkatan melalui perencanaan, pelaksanaan, pelaporan, dan evaluasi di seluruh aktivitas perusahaan.'],
    ['.qhse-policy-points article:nth-child(5) h3', 'Pencegahan'],
    ['.qhse-policy-points article:nth-child(5) p', 'Mencegah pencemaran lingkungan, dampak iklim, kecelakaan kerja, penyakit akibat kerja, dan risiko penularan penyakit.'],
    ['.qhse-policy-points article:nth-child(6) h3', 'Partisipasi CSR'],
    ['.qhse-policy-points article:nth-child(6) p', 'Mendukung tanggung jawab sosial melalui kesempatan kerja praktik, beasiswa, sponsorship, dan kegiatan sosial.'],
    ['.qhse-policy-points article:nth-child(7) h3', 'Partisipasi karyawan'],
    ['.qhse-policy-points article:nth-child(7) p', 'Mendorong partisipasi dan konsultasi karyawan untuk menciptakan tempat kerja yang aman, nyaman, dan sehat.'],
    ['.qhse-policy-points article:nth-child(8) h3', 'Komunikasi'],
    ['.qhse-policy-points article:nth-child(8) p', 'Mengomunikasikan kebijakan perusahaan kepada karyawan dan pihak eksternal terkait, dengan tinjauan tahunan oleh manajemen puncak.'],
    ['.quality-value-chain-section>.section-label', '<span>03</span> Business Process', 'html'],
    ['.quality-value-chain-head .kicker', 'Value chain organisasi'],
    ['.quality-value-chain-head h2', 'Cara THI menghubungkan proses manajemen, operasional, dan pendukung.'],
    ['.quality-value-chain-head p:not(.kicker)', 'Value chain memberi gambaran bagaimana kebutuhan pelanggan berjalan melalui tender, manajemen kontrak, perencanaan proyek, operasi, monitoring, hubungan pelanggan, dan fungsi pendukung internal.'],
    ['.qhse-certification-section>.section-label', '<span>04</span> Certification Management System', 'html'],
    ['.qhse-certification-copy .kicker', 'Referensi formal'],
    ['.qhse-certification-copy h2', 'Catatan sertifikat untuk mutu, keselamatan, lingkungan, dan kepatuhan lokal.'],
    ['.qhse-certification-copy>p', 'Dokumen sertifikat dikelola sebagai referensi formal untuk prequalification, persiapan proyek, dan dukungan audit.'],
    ['.quality-page .qhse-iso-list article:nth-child(1) h3', 'Sistem Manajemen Mutu'],
    ['.quality-page .qhse-iso-list article:nth-child(1) p', 'Mendukung konsistensi layanan, kontrol dokumen, jaminan mutu, dan catatan proyek yang tertelusur.'],
    ['.quality-page .qhse-iso-list article:nth-child(2) h3', 'Sistem Manajemen Kesehatan & Keselamatan Kerja'],
    ['.quality-page .qhse-iso-list article:nth-child(2) p', 'Mendukung kesiapan personel, disiplin area kerja, pencegahan insiden, dan eksekusi lapangan yang lebih aman.'],
    ['.quality-page .qhse-iso-list article:nth-child(3) h3', 'Sistem Manajemen Lingkungan'],
    ['.quality-page .qhse-iso-list article:nth-child(3) p', 'Mendukung praktik pengelolaan lingkungan, pencegahan dampak, dan kontrol lingkungan di tingkat site.'],
    ['.quality-page .qhse-iso-list article:nth-child(4) h3', 'Sertifikat Sistem Manajemen K3 Indonesia'],
    ['.quality-page .qhse-iso-list article:nth-child(4) p', 'Pengakuan SMK3 lokal untuk implementasi sistem manajemen keselamatan dan kesehatan kerja di Indonesia.'],
    ['.quality-page .qhse-iso-list a', 'Buka sertifikat <span>↗</span>', 'html']
  ]
};

const applyQualityPageLanguage = (language) => {
  if (!document.body.classList.contains('quality-page')) return;
  const translations = qualityPageTranslations[language] || qualityPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const hsePageTranslations = {
  en: [
    ['title', 'HSE | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia HSE performance, yearly indicators, field readiness controls, site programs, and practical documentation.'],
    ['.hse-page .preloader-inner p', 'Preparing HSE performance'],
    ['.hse-page .qhse-page-hero .kicker', 'Health, Safety & Environmental'],
    ['.hse-page .qhse-page-hero h1', 'HSE performance and field programs, reviewed year by year.'],
    ['.hse-page .qhse-page-hero-copy>p:not(.kicker)', 'HSE performance reflects how THI maintains safe field execution, environmental responsibility, and disciplined operational control across office and project activities.'],
    ['.hse-kpi-section>.section-label', '<span>01</span> HSE Performance', 'html'],
    ['.hse-kpi-head .kicker', 'January - June 2026'],
    ['.hse-kpi-head h2', 'Zero LTI and zero environmental damage.'],
    ['.hse-kpi-head>p', 'January to June 2026 closed with 384,561 safety hours across controlled office and project man-hours.'],
    ['.hse-metric-card:nth-child(1) span', 'Safety hours'],
    ['.hse-metric-card:nth-child(1) p', 'Recorded across office and project man-hours up to June 2026.'],
    ['.hse-metric-card:nth-child(2) span', 'LTI'],
    ['.hse-metric-card:nth-child(2) p', 'No lost-time incident recorded during the reporting period.'],
    ['.hse-metric-card:nth-child(3) span', 'Environmental damage'],
    ['.hse-metric-card:nth-child(3) p', 'No environmental damage case recorded during the reporting period.'],
    ['.hse-hour-panel>div span', 'Monthly man-hours'],
    ['.hse-report-context>span', 'Report context'],
    ['.hse-report-context p', 'Office man-hours: <strong>86,688</strong>. Project man-hours: <strong>297,874</strong>. Performance: <strong>100%</strong>.', 'html'],
    ['.hse-report-context a', 'Open HSE Performance Report 2026 <span>↗</span>', 'html'],
    ['.hse-kpi-note', 'Source: HSE Performance Report 2026, period January - June, approved in Bandung on 1 June 2026.'],
    ['.hse-controls-section>.section-label', '<span>02</span> HSE Programs', 'html'],
    ['.hse-controls-section figcaption span', 'Field program'],
    ['.hse-controls-section figcaption strong', 'HSE programs are designed to be simple enough for crews to follow and clear enough for clients to audit.'],
    ['.hse-controls-section .qhse-readiness-head .kicker', 'Program control'],
    ['.hse-controls-section .qhse-readiness-head h2', 'Practical HSE routines before, during, and after field execution.'],
    ['.hse-program-list article:nth-child(1) h3', 'Induction & toolbox talk'],
    ['.hse-program-list article:nth-child(1) p', 'Brief personnel on site rules, work method, emergency response, and day-to-day activity risks.'],
    ['.hse-program-list article:nth-child(2) h3', 'JSA and permit control'],
    ['.hse-program-list article:nth-child(2) p', 'Review hazards, define controls, and align permits before critical work begins.'],
    ['.hse-program-list article:nth-child(3) h3', 'PPE and worksite inspection'],
    ['.hse-program-list article:nth-child(3) p', 'Check PPE compliance, housekeeping, access control, and safe work conditions on site.'],
    ['.hse-program-list article:nth-child(4) h3', 'Emergency drill'],
    ['.hse-program-list article:nth-child(4) p', 'Prepare crews for evacuation, medical response, fire response, man-overboard, and communication drills.'],
    ['.hse-program-list article:nth-child(5) h3', 'Lifting and equipment assurance'],
    ['.hse-program-list article:nth-child(5) p', 'Verify lifting gear, certificates, load testing, critical equipment condition, and operator readiness.'],
    ['.hse-program-list article:nth-child(6) h3', 'Environmental control'],
    ['.hse-program-list article:nth-child(6) p', 'Manage waste, spill prevention, deck cleanliness, fuel handling, and environmental protection actions.'],
    ['.hse-documentation-section>.section-label', '<span>03</span> HSE Documentation', 'html'],
    ['.hse-documentation-head .kicker', 'Field evidence'],
    ['.hse-documentation-head h2', 'Documentation from briefing, deck activity, inspection, and vessel operation.'],
    ['.hse-documentation-section figure:nth-child(1) figcaption', 'Field supervision'],
    ['.hse-documentation-section figure:nth-child(2) figcaption', 'Operational preparation'],
    ['.hse-documentation-section figure:nth-child(3) figcaption', 'Deck safety coordination'],
    ['.hse-documentation-section figure:nth-child(4) figcaption', 'Crew readiness briefing']
  ],
  id: [
    ['title', 'HSE | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Performa HSE PT Taka Hydrocore Indonesia mencakup KPI tahunan, kontrol kesiapan lapangan, program HSE, dan dokumentasi site.'],
    ['.hse-page .preloader-inner p', 'Menyiapkan performa HSE'],
    ['.hse-page .qhse-page-hero .kicker', 'Health, Safety & Environmental'],
    ['.hse-page .qhse-page-hero h1', 'Performa HSE dan program lapangan yang ditinjau setiap tahun.'],
    ['.hse-page .qhse-page-hero-copy>p:not(.kicker)', 'Performa HSE menunjukkan bagaimana THI menjaga eksekusi lapangan yang aman, tanggung jawab lingkungan, dan kontrol operasional yang disiplin di aktivitas kantor maupun proyek.'],
    ['.hse-kpi-section>.section-label', '<span>01</span> Performa HSE', 'html'],
    ['.hse-kpi-head .kicker', 'Januari - Juni 2026'],
    ['.hse-kpi-head h2', 'Zero LTI dan zero environmental damage.'],
    ['.hse-kpi-head>p', 'Periode Januari sampai Juni 2026 ditutup dengan 384,561 safety hours dari man-hours kantor dan proyek yang terkontrol.'],
    ['.hse-metric-card:nth-child(1) span', 'Safety hours'],
    ['.hse-metric-card:nth-child(1) p', 'Tercatat dari man-hours kantor dan proyek sampai Juni 2026.'],
    ['.hse-metric-card:nth-child(2) span', 'LTI'],
    ['.hse-metric-card:nth-child(2) p', 'Tidak ada lost-time incident selama periode laporan.'],
    ['.hse-metric-card:nth-child(3) span', 'Environmental damage'],
    ['.hse-metric-card:nth-child(3) p', 'Tidak ada kasus environmental damage selama periode laporan.'],
    ['.hse-hour-panel>div span', 'Man-hours bulanan'],
    ['.hse-report-context>span', 'Konteks laporan'],
    ['.hse-report-context p', 'Office man-hours: <strong>86,688</strong>. Project man-hours: <strong>297,874</strong>. Performance: <strong>100%</strong>.', 'html'],
    ['.hse-report-context a', 'Buka HSE Performance Report 2026 <span>↗</span>', 'html'],
    ['.hse-kpi-note', 'Sumber: HSE Performance Report 2026, periode Januari - Juni, disetujui di Bandung pada 1 Juni 2026.'],
    ['.hse-controls-section>.section-label', '<span>02</span> Program HSE', 'html'],
    ['.hse-controls-section figcaption span', 'Program lapangan'],
    ['.hse-controls-section figcaption strong', 'Program HSE dibuat sederhana untuk dijalankan kru dan jelas untuk diaudit klien.'],
    ['.hse-controls-section .qhse-readiness-head .kicker', 'Kontrol program'],
    ['.hse-controls-section .qhse-readiness-head h2', 'Rutinitas HSE praktis sebelum, selama, dan setelah eksekusi lapangan.'],
    ['.hse-program-list article:nth-child(1) h3', 'Induction & toolbox talk'],
    ['.hse-program-list article:nth-child(1) p', 'Memberi arahan tentang aturan site, metode kerja, respons darurat, dan risiko aktivitas harian.'],
    ['.hse-program-list article:nth-child(2) h3', 'Kontrol JSA dan permit'],
    ['.hse-program-list article:nth-child(2) p', 'Meninjau bahaya, menetapkan kontrol, dan menyelaraskan permit sebelum pekerjaan kritis dimulai.'],
    ['.hse-program-list article:nth-child(3) h3', 'PPE dan inspeksi area kerja'],
    ['.hse-program-list article:nth-child(3) p', 'Memeriksa kepatuhan PPE, housekeeping, kontrol akses, dan kondisi kerja aman di site.'],
    ['.hse-program-list article:nth-child(4) h3', 'Emergency drill'],
    ['.hse-program-list article:nth-child(4) p', 'Menyiapkan kru untuk evakuasi, respons medis, respons kebakaran, man-overboard, dan latihan komunikasi.'],
    ['.hse-program-list article:nth-child(5) h3', 'Assurance lifting dan peralatan'],
    ['.hse-program-list article:nth-child(5) p', 'Memverifikasi lifting gear, sertifikat, load testing, kondisi peralatan kritis, dan kesiapan operator.'],
    ['.hse-program-list article:nth-child(6) h3', 'Kontrol lingkungan'],
    ['.hse-program-list article:nth-child(6) p', 'Mengelola limbah, pencegahan tumpahan, kebersihan deck, penanganan bahan bakar, dan tindakan perlindungan lingkungan.'],
    ['.hse-documentation-section>.section-label', '<span>03</span> Dokumentasi HSE', 'html'],
    ['.hse-documentation-head .kicker', 'Bukti lapangan'],
    ['.hse-documentation-head h2', 'Dokumentasi briefing, aktivitas deck, inspeksi, dan operasi vessel.'],
    ['.hse-documentation-section figure:nth-child(1) figcaption', 'Supervisi lapangan'],
    ['.hse-documentation-section figure:nth-child(2) figcaption', 'Persiapan operasional'],
    ['.hse-documentation-section figure:nth-child(3) figcaption', 'Koordinasi keselamatan deck'],
    ['.hse-documentation-section figure:nth-child(4) figcaption', 'Briefing kesiapan kru']
  ]
};

const applyHsePageLanguage = (language) => {
  if (!document.body.classList.contains('hse-page')) return;
  const translations = hsePageTranslations[language] || hsePageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const qhsePageTranslations = {
  en: [
    ['title', 'QHSE | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia QHSE profile covering health, safety, environment, equipment readiness, load testing, personnel training, and no-harm operating goals.'],
    ['.qhse-page .preloader-inner p', 'Preparing QHSE profile'],
    ['.qhse-page-hero .kicker', 'QHSE'],
    ['.qhse-page-hero h1', 'Health, safety, and environment as field discipline.'],
    ['.qhse-page-hero-copy>p:not(.kicker)', 'For THI, QHSE is field discipline: crews plan the work, check the equipment, brief the risks, control the worksite, and close out records before the result is handed over.'],
    ['.qhse-policy-section>.section-label', '<span>01</span> Health Safety and Environment', 'html'],
    ['.qhse-policy-copy .kicker', 'Operating commitment'],
    ['.qhse-policy-copy h2', 'Planned controls before people, equipment, and vessels move.'],
    ['.qhse-policy-copy>p:not(.kicker)', 'Each scope is prepared with practical controls: competent crews, maintained equipment, valid certificates, load-tested lifting gear, job-risk review, emergency readiness, and clear field records.'],
    ['.qhse-iso-strip a:nth-child(1)', '<span>ISO 45001</span><strong>Occupational Health & Safety</strong>', 'html'],
    ['.qhse-iso-strip a:nth-child(2)', '<span>ISO 14001</span><strong>Environmental Management</strong>', 'html'],
    ['.qhse-iso-strip a:nth-child(3)', '<span>ISO 9001</span><strong>Quality Management</strong>', 'html'],
    ['.qhse-readiness-section>.section-label', '<span>02</span> Readiness Controls', 'html'],
    ['.qhse-readiness-visual figcaption span', 'Readiness control'],
    ['.qhse-readiness-visual figcaption strong', 'People, equipment, method, and documentation are aligned before the field team starts work.'],
    ['.qhse-readiness-head .kicker', 'Field preparation'],
    ['.qhse-readiness-head h2', 'Controls built around what crews actually do on site.'],
    ['.qhse-certification-section>.section-label', '<span>03</span> General Certificates', 'html'],
    ['.qhse-certification-copy .kicker', 'Certificates and formal references'],
    ['.qhse-certification-copy h2', 'Management system certificates and local compliance documents.'],
    ['.qhse-certification-copy>p:not(.kicker)', 'These documents support how THI manages quality, occupational safety, environmental control, and Indonesian local HSE requirements across office preparation and field execution.'],
    ['.qhse-iso-list article:nth-child(1) h3', 'Occupational Health & Safety Management System'],
    ['.qhse-iso-list article:nth-child(1) p', 'Supports occupational health and safety controls for personnel readiness, worksite discipline, and safer field execution.'],
    ['.qhse-iso-list article:nth-child(1) a', 'Open certificate <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(2) h3', 'Environmental Management System'],
    ['.qhse-iso-list article:nth-child(2) p', "Supports environmental management practices aligned with THI's commitment to prevent damage to the environment."],
    ['.qhse-iso-list article:nth-child(2) a', 'Open certificate <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(3) h3', 'Quality Management System'],
    ['.qhse-iso-list article:nth-child(3) p', 'Supports consistent service delivery, documentation control, and quality assurance across survey and drilling work.'],
    ['.qhse-iso-list article:nth-child(3) a', 'Open certificate <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(4) h3', 'Indonesian Occupational Safety and Health Certificate'],
    ['.qhse-iso-list article:nth-child(4) p', 'Local SMK3 recognition for occupational safety and health management implementation in Indonesia.'],
    ['.qhse-iso-list article:nth-child(4) a', 'Open certificate <span>↗</span>', 'html'],
    ['.qhse-policy-document>.section-label', '<span>04</span> QHSE Policy 2026', 'html'],
    ['.qhse-document-copy h2', "Eight commitments that guide THI's QHSE practice."],
    ['.qhse-document-copy>p:not(.kicker)', 'The 2026 policy sets out practical commitments for management systems, customer service, compliance, improvement, environmental and accident prevention, CSR, employee participation, and policy communication.'],
    ['.qhse-gallery-section>.section-label', '<span>05</span> HSE Documentation', 'html']
  ],
  id: [
    ['title', 'QHSE | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Halaman QHSE PT Taka Hydrocore Indonesia mencakup kesehatan, keselamatan, lingkungan, kesiapan peralatan, uji beban, pelatihan personel, dan tujuan operasi tanpa dampak buruk.'],
    ['.qhse-page .preloader-inner p', 'Menyiapkan profil QHSE'],
    ['.qhse-page-hero .kicker', 'QHSE'],
    ['.qhse-page-hero h1', 'Kesehatan, keselamatan, dan lingkungan sebagai disiplin lapangan.'],
    ['.qhse-page-hero-copy>p:not(.kicker)', 'Bagi THI, QHSE adalah disiplin lapangan: kru merencanakan pekerjaan, memeriksa peralatan, membahas risiko, mengendalikan area kerja, dan menutup catatan sebelum hasil pekerjaan diserahkan.'],
    ['.qhse-policy-section>.section-label', '<span>01</span> Kesehatan, Keselamatan, dan Lingkungan', 'html'],
    ['.qhse-policy-copy .kicker', 'Komitmen operasional'],
    ['.qhse-policy-copy h2', 'Kontrol disiapkan sebelum personel, peralatan, dan vessel bergerak.'],
    ['.qhse-policy-copy>p:not(.kicker)', 'Setiap scope disiapkan dengan kontrol praktis: kru kompeten, peralatan terawat, sertifikat valid, lifting gear yang telah diuji beban, telaah risiko pekerjaan, kesiapan darurat, dan catatan lapangan yang jelas.'],
    ['.qhse-iso-strip a:nth-child(1)', '<span>ISO 45001</span><strong>Kesehatan & Keselamatan Kerja</strong>', 'html'],
    ['.qhse-iso-strip a:nth-child(2)', '<span>ISO 14001</span><strong>Manajemen Lingkungan</strong>', 'html'],
    ['.qhse-iso-strip a:nth-child(3)', '<span>ISO 9001</span><strong>Manajemen Mutu</strong>', 'html'],
    ['.qhse-readiness-section>.section-label', '<span>02</span> Kontrol Kesiapan', 'html'],
    ['.qhse-readiness-visual figcaption span', 'Kontrol kesiapan'],
    ['.qhse-readiness-visual figcaption strong', 'Personel, peralatan, metode, dan dokumentasi diselaraskan sebelum tim lapangan mulai bekerja.'],
    ['.qhse-readiness-head .kicker', 'Persiapan lapangan'],
    ['.qhse-readiness-head h2', 'Kontrol yang mengikuti aktivitas nyata kru di site.'],
    ['.qhse-certification-section>.section-label', '<span>03</span> Sertifikat Umum', 'html'],
    ['.qhse-certification-copy .kicker', 'Sertifikat dan referensi formal'],
    ['.qhse-certification-copy h2', 'Sertifikat sistem manajemen dan dokumen kepatuhan lokal.'],
    ['.qhse-certification-copy>p:not(.kicker)', 'Dokumen ini mendukung cara THI mengelola mutu, keselamatan kerja, kontrol lingkungan, dan persyaratan HSE lokal Indonesia dari persiapan kantor sampai eksekusi lapangan.'],
    ['.qhse-iso-list article:nth-child(1) h3', 'Sistem Manajemen Kesehatan & Keselamatan Kerja'],
    ['.qhse-iso-list article:nth-child(1) p', 'Mendukung kontrol kesehatan dan keselamatan kerja untuk kesiapan personel, disiplin area kerja, dan eksekusi lapangan yang lebih aman.'],
    ['.qhse-iso-list article:nth-child(1) a', 'Buka sertifikat <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(2) h3', 'Sistem Manajemen Lingkungan'],
    ['.qhse-iso-list article:nth-child(2) p', 'Mendukung praktik pengelolaan lingkungan yang selaras dengan komitmen THI untuk mencegah kerusakan lingkungan.'],
    ['.qhse-iso-list article:nth-child(2) a', 'Buka sertifikat <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(3) h3', 'Sistem Manajemen Mutu'],
    ['.qhse-iso-list article:nth-child(3) p', 'Mendukung konsistensi layanan, kontrol dokumentasi, dan jaminan mutu di pekerjaan survei dan pengeboran.'],
    ['.qhse-iso-list article:nth-child(3) a', 'Buka sertifikat <span>↗</span>', 'html'],
    ['.qhse-iso-list article:nth-child(4) h3', 'Sertifikat Sistem Manajemen K3 Indonesia'],
    ['.qhse-iso-list article:nth-child(4) p', 'Pengakuan SMK3 lokal untuk implementasi sistem manajemen keselamatan dan kesehatan kerja di Indonesia.'],
    ['.qhse-iso-list article:nth-child(4) a', 'Buka sertifikat <span>↗</span>', 'html'],
    ['.qhse-policy-document>.section-label', '<span>04</span> Kebijakan QHSE 2026', 'html'],
    ['.qhse-document-copy h2', 'Delapan komitmen yang memandu praktik QHSE THI.'],
    ['.qhse-document-copy>p:not(.kicker)', 'Kebijakan 2026 memuat komitmen praktis untuk sistem manajemen, layanan pelanggan, kepatuhan, perbaikan, pencegahan lingkungan dan kecelakaan, CSR, partisipasi karyawan, dan komunikasi kebijakan.'],
    ['.qhse-gallery-section>.section-label', '<span>05</span> Dokumentasi HSE', 'html']
  ]
};

const applyQhsePageLanguage = (language) => {
  if (!document.body.classList.contains('qhse-page')) return;
  const translations = qhsePageTranslations[language] || qhsePageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const projectPageTranslations = {
  en: [
    ['title', 'Project Experience | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia project experience organized around marine seismic, offshore and onshore geotechnical, exploratory, nearshore, hydrogeology, marine support, and seabed services.'],
    ['.project-page .preloader-inner p', 'Preparing project experience'],
    ['.project-page-hero .kicker', 'Project Experience'],
    ['.project-page-hero h1', 'Field references across marine, offshore, nearshore, and onshore work.'],
    ['.project-page-hero-copy>p:not(.kicker)', "THI's public project references cover marine geophysical services, offshore geotechnical survey with MV AG Geodrill, other marine spreads, nearshore and onshore work, engineering study, and water well drilling."],
    ['.project-map-section>.section-label', '<span>01</span> Project Footprint', 'html'],
    ['.project-map-copy h2', 'Project list by service line.'],
    ['.project-map-copy>p:not(.kicker)', "The list below condenses THI's public project page into curated categories, while keeping client, location, and year signals where available."],
    ['.project-map-card figcaption', 'THI project experience in Indonesia, covering marine, nearshore, and onshore assignments.'],
    ['.project-page-metrics div:nth-child(2) span', 'Service-aligned groups'],
    ['.project-list-section>.section-label', '<span>02</span> Project List', 'html'],
    ['.project-list-head .kicker', 'Project list'],
    ['.project-list-head h2', "Project references grouped by THI service line."],
    ['#marine-seismic-projects .project-service-index', '01 / Marine Geophysical'],
    ['#marine-seismic-projects h3', '2D/3D High Resolution Marine Seismic'],
    ['#marine-seismic-projects .project-service-body>p', 'References covering high-resolution seismic acquisition, geohazard survey, processing, and interpretation for exploration and development planning.'],
    ['#marine-seismic-projects li:nth-child(1)', 'High Resolution Marine Seismic Survey Services - East Seram PSC, Maluku, 2020'],
    ['#marine-seismic-projects li:nth-child(2)', 'Geohazard Survey 2D/3D UHR Seismic Survey - Seascape Survey Indonesia for PHKT, 2024'],
    ['#marine-seismic-projects li:nth-child(3)', 'Geophysical Survey and Associated Services - Medco E&P Natuna and Medco Energi Madura Offshore, 2024'],
    ['#marine-seismic-projects li:nth-child(4)', 'High-resolution seismic acquisition and processing support for offshore development planning.'],
    ['#marine-seismic-projects li:nth-child(5)', 'Marine geophysical data interpretation for geohazard and exploration screening.'],
    ['#marine-seismic-projects a', 'View service <span>→</span>', 'html'],
    ['#offshore-geotechnical-projects .project-service-index', '02 / Offshore Geotechnical'],
    ['#offshore-geotechnical-projects h3', 'Offshore Geotechnical Survey'],
    ['#offshore-geotechnical-projects .project-service-body>p', 'Marine soil investigation scopes delivered with offshore drilling, CPT, sampling, coring, and downhole support for engineering decisions.'],
    ['#offshore-geotechnical-projects li:nth-child(1)', 'Marine Geotechnical Site Survey for Jackup Drilling Unit Installation in Block 3/05 - RINA Consulting SpA, Angola, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(2)', 'North Ketapang Exploration Field site survey and soil investigation - PETRONAS North Ketapang, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(3)', 'Geotechnical Survey Congo LNG Development Project - RINA Consulting SpA, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(4)', 'Pipeline pre-engineering geotechnical survey - Saipem Indonesia and Meindo Elang Indah, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(5)', 'Offshore borehole, CPTu, sampling, coring, and laboratory handover support for energy infrastructure.'],
    ['#offshore-geotechnical-projects li:nth-child(6)', 'Marine geotechnical investigation for vessel-based and jack-up installation planning.'],
    ['#offshore-geotechnical-projects a', 'View service <span>→</span>', 'html'],
    ['#onshore-geotechnical-projects .project-service-index', '03 / Onshore Geotechnical'],
    ['#onshore-geotechnical-projects h3', 'Onshore Geotechnical Survey'],
    ['#onshore-geotechnical-projects .project-service-body>p', 'Land-based drilling, in-situ testing, sampling, and laboratory-backed investigation for infrastructure, energy, and industrial facilities.'],
    ['#onshore-geotechnical-projects li:nth-child(1)', 'Onshore geotechnical survey for UCC Project - BP Berau Ltd, 2024'],
    ['#onshore-geotechnical-projects li:nth-child(2)', 'Pipeline route soil investigation for Pertamina TBBM Pengapon and Maumere, 2017'],
    ['#onshore-geotechnical-projects li:nth-child(3)', 'Tangguh LNG Expansion Project geotechnical survey, Papua'],
    ['#onshore-geotechnical-projects li:nth-child(4)', 'Soil investigation and laboratory-backed reporting for industrial facility development.'],
    ['#onshore-geotechnical-projects li:nth-child(5)', 'CPT, SPT, sampling, and field vane testing support for land-based engineering design.'],
    ['#onshore-geotechnical-projects a', 'View service <span>→</span>', 'html'],
    ['#exploratory-drilling-projects .project-service-index', '04 / Exploratory Drilling'],
    ['#exploratory-drilling-projects h3', 'Exploratory Drilling'],
    ['#exploratory-drilling-projects .project-service-body>p', 'Coring and drilling support for resource evaluation, mining exploration, and subsurface confirmation programs using fit-for-purpose rigs.'],
    ['#exploratory-drilling-projects li:nth-child(1)', 'Mining exploratory drilling support with conventional and wireline coring methods.'],
    ['#exploratory-drilling-projects li:nth-child(2)', 'Skid, mobile, tractor-mounted, and crawler-mounted drilling rig deployment according to site access.'],
    ['#exploratory-drilling-projects li:nth-child(3)', 'Qualified field supervision and sample handling for client exploration standards.'],
    ['#exploratory-drilling-projects li:nth-child(4)', 'Resource drilling programs using NQ, HQ, and PQ coring configuration.'],
    ['#exploratory-drilling-projects li:nth-child(5)', 'Exploration drilling support for shallow to deep mineral and mining investigation.'],
    ['#exploratory-drilling-projects a', 'View service <span>→</span>', 'html'],
    ['#nearshore-drilling-projects .project-service-index', '05 / Nearshore Geotechnical'],
    ['#nearshore-drilling-projects h3', 'Nearshore Geotechnical Drilling'],
    ['#nearshore-drilling-projects .project-service-body>p', 'Shallow-water investigation using staging, modular pontoon, and platform-based drilling methods for coastal and marine infrastructure.'],
    ['#nearshore-drilling-projects li:nth-child(1)', 'Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017'],
    ['#nearshore-drilling-projects li:nth-child(2)', 'Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017'],
    ['#nearshore-drilling-projects li:nth-child(3)', 'Additional intertidal geotechnical investigation survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017'],
    ['#nearshore-drilling-projects li:nth-child(4)', 'Nearshore CPTu and borehole investigation for coastal infrastructure design.'],
    ['#nearshore-drilling-projects a', 'View service <span>→</span>', 'html'],
    ['#hydrogeology-drilling-projects .project-service-index', '06 / Hydrogeology'],
    ['#hydrogeology-drilling-projects h3', 'Hydrogeology Drilling'],
    ['#hydrogeology-drilling-projects .project-service-body>p', 'Groundwater monitoring, water supply, landfill monitoring, and mining drainage support with drilling and well installation capability.'],
    ['#hydrogeology-drilling-projects li:nth-child(1)', 'Water well drilling for BP Tangguh Development, Papua, 2018'],
    ['#hydrogeology-drilling-projects li:nth-child(2)', 'Ground water deep water well work for Alur Siwah Central Processing Plant Block A, Aceh, 2016'],
    ['#hydrogeology-drilling-projects li:nth-child(3)', 'Water well drilling for Donggi Senoro LNG Project, Luwuk, Central Sulawesi, 2011-2012'],
    ['#hydrogeology-drilling-projects li:nth-child(4)', 'Groundwater monitoring well installation for environmental and landfill monitoring programs.'],
    ['#hydrogeology-drilling-projects li:nth-child(5)', 'Mining drainage and water supply drilling with project-specific well configuration.'],
    ['#hydrogeology-drilling-projects a', 'View service <span>→</span>', 'html'],
    ['#marine-geophysical-other-projects .project-service-index', '07 / Survey Support'],
    ['#marine-geophysical-other-projects h3', 'Marine Geophysical and Other Services'],
    ['#marine-geophysical-other-projects .project-service-body>p', 'Supporting survey, positioning, bathymetry, geophysical logging, metocean, engineering study, and laboratory coordination for field programs.'],
    ['#marine-geophysical-other-projects li:nth-child(1)', 'Provision of Bathymetry Survey and Vessel Charter Services - PT Sumbawa Timur Mining, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(2)', 'Submarine HVAC Cable Route Survey, Crescent Project Indonesia - Keppel Energy Pte Ltd, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(3)', 'Provision of Debris Survey Services - Saka Indonesia Pangkah Limited, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(4)', 'Engineering conceptual study for Phase-1 Ground Water Project Tangguh Expansion Project - BP Tangguh Area, 2018'],
    ['#marine-geophysical-other-projects li:nth-child(5)', 'Positioning, topographic survey, bathymetry, metocean, and meteorology support for field scopes.'],
    ['#marine-geophysical-other-projects li:nth-child(6)', 'Geophysical logging, pumping test, slug test, and basic geotechnical engineering support.'],
    ['#marine-geophysical-other-projects a', 'View service <span>→</span>', 'html'],
    ['#seabed-drilling-projects .project-service-index', '08 / Seabed Geotechnical'],
    ['#seabed-drilling-projects h3', 'Seabed Geotechnical'],
    ['#seabed-drilling-projects .project-service-body>p', 'Direct seabed investigation using Seabed CPT and Vibrocore systems where recovered sediment and near-seabed soil behavior are required.'],
    ['#seabed-drilling-projects li:nth-child(1)', '<button class="project-list-trigger" data-modal="karimun-modal">Geophysical and Vibrocore Survey Works at Karimun Besar Island, Riau Islands - 2025</button>', 'html'],
    ['#seabed-drilling-projects li:nth-child(2)', 'Sand sources investigation in Banten - PT Hydrocore for Boskalis International Indonesia, 2025'],
    ['#seabed-drilling-projects li:nth-child(3)', 'Mooring system design and geotechnical data for floating storage tanker at Bangka Strait, 2015'],
    ['#seabed-drilling-projects li:nth-child(4)', 'Seabed CPT and vibrocore investigation for near-surface soil profiling.'],
    ['#seabed-drilling-projects li:nth-child(5)', 'Sediment sampling and laboratory follow-up for marine infrastructure planning.'],
    ['#seabed-drilling-projects a', 'View service <span>→</span>', 'html']
,
    ['#marine-seismic-projects ul', "<li>Provision of Bathymetry Survey and Vessel Charter Services - PT Sumbawa Timur Mining, 2025</li>\n              <li>Research and development services for submarine HVAC cable route survey in Indonesia - Keppel Energy Pte Ltd, 2025</li>\n              <li>Provision of Debris Survey Services - Saka Indonesia Pangkah Limited, 2025</li>\n              <li>Provision of Geophysical Survey and Associated Services - Medco E&amp;P Natuna Ltd and Medco Energi Madura Offshore Pty. Ltd., 2024</li>\n              <li>Geohazard Survey 2D/3D UHR Seismic Survey - PT Seascape Survey Indonesia for Pertamina Hulu Kalimantan Timur, 2024</li>\n              <li>Pipeline Side Scan Survey and WHP Subsidence Analysis - Husky-CNOOC Madura Limited, 2023</li>\n              <li>Geohazard Survey Services Call 6 - PHE ONWJ, 2023</li>\n              <li>Provision of Geophysical and Shallow Geotechnical Site Investigation Services, 2023</li>\n              <li>Geohazard Survey Services Call 5 - PHE ONWJ, 2023</li>\n              <li>Geohazard Survey Services Call 4 - PHE ONWJ, 2022</li>\n              <li>Geohazard Survey Services Call 3 - PHE ONWJ, 2022</li>\n              <li>Geophysical, geotechnical, and other related services, 2022</li>\n              <li>Geohazard Survey Services Call 2 - PHE ONWJ, 2022</li>\n              <li>Geophysical, geotechnical, and other related services, 2021</li>\n              <li>Change order bathymetric, geophysical, and offshore geotechnical survey services at Cirata 145MW Floating Solar Power Project - PLTU Cirata, 2021</li>\n              <li>Geohazard Survey Services Call 1 - PHE ONWJ, 2021</li>\n              <li>Geotechnical, bathymetric, and geophysical survey services at Cirata 145MW Floating Solar Power Project - PLTU Cirata, 2021</li>\n              <li>High Resolution Marine Seismic Survey Services, East Seram PSC, Offshore Kobi and Bula, Maluku - Balam Energy Pte Ltd, 2020</li>\n              <li>Bathymetry Acquisition Services, East Seram PSC, Offshore Kobi and Bula, Maluku - Balam Energy Pte Ltd, 2020</li>\n              <li>UHR/HR Seismic Survey for Mahoni, Sepinggan Sierra, Sepinggan Rajah, Sejadi, and Serang Baru, East Kalimantan - PHKT, 2020</li>\n              <li>Geophysical, geotechnical, and other related services, Natuna Sea, Riau Islands - Medco E&amp;P Natuna Ltd, 2020</li>\n              <li>Marine site survey for intake, outfall, jetty wharf, bathymetry, manual sounding, SBP Hi-Res, and seabed sampling at Central Java Power Plant Project, Batang - PT Hydrocore for Mitsui Engineering and Shipbuilding Co. Ltd, 2020</li>\n              <li>Marine survey for bathymetric, seabed Hi-Res sub-bottom profiling, magnetometer, and geotechnical investigation at Central Java Power Plant Project, Batang - PT Hydrocore for Wakachiku Construction Co. Ltd, 2019</li>\n              <li>Geotechnical, bathymetrical, geophysical, and hydrometeorological survey, offshore and onshore Penajam, East Kalimantan - PT Kereta Api Borneo, 2017</li>\n              <li>Bathymetric survey for Chipmill Jetty at Kariangau Balikpapan River, East Kalimantan - PT Fajar Surya Swadaya, PT Djarum Group, 2010</li>\n              <li>Vibrocoring work, 230 points up to 500 m water depth, for Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>", 'html'],
    ['#offshore-geotechnical-projects ul', "<li class=\"project-list-subtitle\">Offshore geotechnical survey using MV AG Geodrill</li>\n              <li>Provision of Site Survey and Soil Investigation Survey for North Ketapang Exploration Field, East Java - PETRONAS North Ketapang Sdn. Bhd., 2025</li>\n              <li>Geotechnic Services - PT Pertamina Hulu Energi Offshore South East Sumatra, 2025</li>\n              <li>Provision of Pipeline Pre-Engineering Geotechnical Survey Services - Consortium PT Saipem Indonesia and PT Meindo Elang Indah, 2025</li>\n              <li>Nearshore geotechnical scope for Offshore Shallow Water Geotechnical Survey, Abadi OLNG Project, Masela Block - PT Fugro Indonesia, 2025</li>\n              <li>Provision of Geotechnical Survey Services for OML 83 FEED - Enviros Survey &amp; Consultancy Limited, 2025</li>\n              <li>Onshore and intertidal geophysical and geotechnical survey - Inpex Masela Ltd., 2025</li>\n              <li>Shallow Water Geotechnical Survey, LNG PP - PT Freeport Indonesia, 2025</li>\n              <li>Geotechnical Survey Congo LNG Development Project - RINA Consulting SpA, 2025</li>\n              <li>Offshore Geotechnical for Pre-Engineering Survey - PT Elnusa Tbk for PT Pertamina Hulu Mahakam, 2025</li>\n              <li>Provision of Service for Onshore Geotechnical Survey for Ubadari, EGR/CCUS, Onshore Compression Project - BP Berau Ltd., 2024</li>\n              <li>Provision of Shallow Hazard Survey Services in Pertamina Hulu Kalimantan Timur working area - PT Elnusa Tbk for PHKT, 2023</li>\n              <li>Geotechnical Survey Service for SUISEN-1 Prop Exploration Well and Tambakboyo Field Development - Saka Energy Muriah Ltd and Saka Indonesia Pangkah Limited, 2022</li>\n              <li>Offshore Geotechnical Survey Service - PT Seascape Surveys Indonesia, 2022</li>\n              <li>Geotechnical Survey Service for Malong, Belida NE, Forel, and Bronang Field - Medco E&amp;P Natuna, 2022</li>\n              <li>Offshore Geotechnical Survey for Marine Terminal and Offshore Facilities, PRPP Great Project, Tuban - PT Haskoning Indonesia for Pertamina Rosneft, 2021</li>\n              <li>Geotechnical Survey Service for proposed GQX-1 Exploration Well Project - PHE ONWJ, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Jawa 9 &amp; 10 Coal Fired Steam Power Plant - PT Hutama Karya, 2021</li>\n              <li>Onshore Geotechnical Survey Services at Cirata 145MW Floating Solar Power Project - PowerChina Huadong Engineering Corporation, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Fanny Site, PHE OSES Area - PT Elnusa Tbk, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Suratmi Site, PHE OSES Area - PT Elnusa Tbk, 2020</li>\n              <li>Offshore Geotechnical Survey at Serang Baru, PHKT Area, East Kalimantan - Seascape Survey for PHKT, 2020</li>\n              <li>Offshore Geotechnical Survey at SPS Mahoni, PHKT Area, East Kalimantan - Seascape Survey for PHKT, 2020</li>\n              <li>Drilling support services for geotechnical soil boring, 2020 OPL YY Relief Well - PHE ONWJ, 2020</li>\n              <li>Geotechnical survey for jack-up rig location at Kerindingan Platform - Seascape Survey for PHKT, 2020</li>\n              <li>Offshore Geotechnical Survey Work for FEED Project Bromo, East Java - Worley Pte Limited, 2020</li>\n              <li>Offshore Geotechnical Survey Work for Natuna Sea geophysical, geotechnical, and related services - Medco E&amp;P Natuna Ltd, 2020</li>\n              <li>Offshore Geotechnical Survey Services for Offshore Lawe-Lawe Facilities Project, RDMP RU V Pertamina Balikpapan - PT LAPI ITB, 2020</li>\n              <li>Geotechnical Survey Services for jack-up rig locations near Kerindingan Platform and additional PHKT locations - PT Seascape Surveys Indonesia, 2020</li>\n              <li>Offshore Geotechnical Survey Services for Parang-2 Bunyu, PHE Nunukan - PT Java Offshore and PHE Nunukan, 2020</li>\n              <li>Geotechnical Survey Services for Seguni-A, Santan STA, and Victor jack-up rig locations - PT Seascape Surveys Indonesia and PHKT, 2019-2020</li>\n              <li>Offshore Geotechnical Survey for MOPU Location at MBH Field, Madura Strait - HCML, 2019</li>\n              <li>Offshore soil investigation for Toll Sea Bridge, Balikpapan Bay, Penajam - PT Waskita Karya, 2019</li>\n              <li>Geotechnical survey for Seturian 10 jack-up rig location - PT Seascape Surveys Indonesia and PHKT, 2019</li>\n              <li>Geotechnical Soil Boring for YYA-1 Relief Well, Java Sea - PHE ONWJ, 2019</li>\n              <li>Survey soil investigation for new SPM at Pertamina Pengapon Project, Semarang - PT Surveyor Indonesia and Pertamina, 2019</li>\n              <li>Geotechnical soil boring for NWY-1 Exploration Well, Java Sea - PHE ONWJ, 2019</li>\n              <li>Offshore Geotechnical Survey for Central Java Power Plant intake and outfall line, Batang - Mitsui Engineering &amp; Shipbuilding Co. Ltd, 2018-2019</li>\n              <li>Offshore Geotechnical Survey for PHE WMO near PHE-12 Platform, Madura Block - PT Elnusa Tbk, 2018</li>\n              <li>Offshore Geotechnical Survey for WHP-C and WHP-D worksites, Pangkah PSC Block, East Java - Saka group companies, 2018</li>\n              <li>Offshore Geotechnical Survey for PLTGU Jawa 1 CCPP IPP Project, Cilamaya Subang - PT Meindo Elang Indah, 2018</li>\n              <li>Offshore Geotechnical Survey for FEED of Multi Column Tension Leg Platform, L-Parigi Field, Subang - Technip FMC, 2018</li>\n              <li>Nearshore and Offshore Geotechnical Survey for SPL and SPM Pertamina Refinery Unit VI Balongan - PT ITS Tekno Sains, 2018</li>\n              <li>Marine geotechnical investigation for New 2nd Jetty, BP Tangguh Expansion Project - CSTS Joint Operation, 2017-2018</li>\n              <li>Survey soil investigation for SPM at Pertamina Pengapon Project, Semarang - PT Surveyor Indonesia and Pertamina, 2017</li>\n              <li>Offshore Geotechnical Survey for Jack-up Rig of PHE ABAR - PT Alamjaya Makmur Sejahtera and PHE Abar, 2017</li>\n              <li>Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore and Offshore Geotechnical Survey for SPL/SPM Pertamina UP VI Balongan - PT Pageo Utama and Pertamina UP VI, 2017</li>\n              <li class=\"project-list-subtitle\">Offshore geotechnical survey using other marine spread</li>\n              <li>Offshore geotechnical survey works for mooring system design and geotechnical data for floating storage tanker at Bangka Strait - ConocoPhillips Indonesia Inc. Ltd, 2015</li>\n              <li>Offshore soil boring for CNOOC Widuri and Lisa at Malaka Strait - PT Geoservices, 2014</li>", 'html'],
    ['#onshore-geotechnical-projects ul', "<li>Provision of Geotechnical Survey and Services for Jetty D North West Cilegon City, CAP2 Expansion Project - PT Chandra Asri Perkasa, 2018</li>\n              <li>Soil investigation survey for pipeline route at TBBM Pengapon Semarang and TBBM Maumere - PT Surveyor Indonesia for Pertamina, 2017</li>\n              <li>Onshore Geotechnical Investigation Survey for Regasification Facilities at KITe LNG Receiving Makassar FSRU - PT Patra Drilling Contractor, 2017</li>\n              <li>Geotechnical, bathymetrical, geophysical, and hydrometeorological survey, offshore and onshore Penajam, East Kalimantan - PT Kereta Api Borneo, 2017</li>\n              <li>Additional Soil Investigation, Intertidal Geotechnical Investigation Survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Soil Investigation Survey at Liquid Jetty Project Oleochemical Plant, Lubuk Gaung Dumai - PT Witteveen Bos Indonesia, 2016</li>\n              <li>Nearshore Site Investigation Work for Dredging International Asia Pacific, Tanjung Benoa Bali - PT Hydrocore, 2016</li>\n              <li>Offshore Soil Investigation and Bathymetric Survey for Bojonegara LNG Receiving Terminal - PT BAM Decorient Indonesia, 2016</li>\n              <li>Offshore Geotechnical Survey Works for Condensate Splitter PRE-FEED Project, Ciwandan Cilegon - BP Singapore Pte Ltd, 2014</li>\n              <li>Geotechnical Survey for Tangguh LNG Expansion Project, Papua - PT Fugro Indonesia</li>\n              <li>Onshore and Offshore Geotechnical Investigations for WBN, Halmahera Tengah, North Maluku - Eramet, 2013-2014</li>\n              <li>Geotechnical and hydrogeological investigation for Block M pit, Alfara Delta Persada Coal Mining, Anggana, East Kalimantan - PT Alfara Delta Persada, 2010</li>\n              <li>Onshore and nearshore geotechnical investigation for Pertamina West Java LNG Floating Terminal, Muara Karang Jakarta - Pageo/WorleyParsons, 2010</li>\n              <li>Onshore and nearshore geotechnical investigation for PGN Medan LNG Floating Terminal, Muara Karang Jakarta - Pageo, 2010</li>\n              <li>West Levee Geotechnical Investigation at Freeport Timika, Papua - PT Nakawa, 2011</li>", 'html'],
    ['#exploratory-drilling-projects ul', "<li>Deep Coal Exploration Drilling at Musi Banyu Asin and Musi Banyu Rawas, South Sumatera - Adani Global, 2010</li>\n              <li>Coal Bed Methane coring for Arrow Energy at Tanjung Enim, South Sumatera - PT Tridiantara Alvindo, 2010</li>\n              <li>Coal Exploratory Drilling for BISM at Melak, East Kalimantan - BISM, 2011</li>\n              <li>Mining exploratory drilling support with conventional and wireline coring methods.</li>\n              <li>Skid, mobile, tractor-mounted, and crawler-mounted drilling rig deployment according to site access.</li>\n              <li>Qualified field supervision and sample handling for client exploration standards.</li>\n              <li>Resource drilling programs using NQ, HQ, and PQ coring configuration.</li>", 'html'],
    ['#nearshore-drilling-projects ul', "<li>Submarine Cable Route Survey from Pulau Bulan to Jurong Island Borderline - PT Medco Power Indonesia</li>\n              <li>Crescent Project, Indonesian Submarine Cable Route Survey at Rempang Island - Keppel</li>\n              <li>Nearshore Geotechnical Survey at West Saumlaki, Tanimbar Island - PT Fugro Indonesia</li>\n              <li>Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Additional intertidal geotechnical investigation survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Nearshore CPTu and borehole investigation for coastal infrastructure design.</li>", 'html'],
    ['#hydrogeology-drilling-projects ul', "<li>Water Well Drilling for BP Tangguh Development, Papua - BP Berau Ltd, 2018</li>\n              <li>Ground Water Deep Water Well Work for Alur Siwah Central Processing Plant Block A, Aceh - JGC Indonesia and Encona Consortium JEC, 2016</li>\n              <li>Water Well Drilling for Donggi Senoro LNG Project, Luwuk Central Sulawesi - JGC Corporation, 2011-2012</li>\n              <li>Groundwater monitoring well installation for environmental and landfill monitoring programs.</li>\n              <li>Mining drainage and water supply drilling with project-specific well configuration.</li>", 'html'],
    ['#marine-geophysical-other-projects ul', "<li>Engineering conceptual study for Phase-1 Ground Water Project, Tangguh Expansion Project, West Papua - PT Singgar Mulia, 2018</li>\n              <li>Desk study soil-pipe interaction analysis, Pipeline Foxtrot Platform to Karunia WHP, ABAR Block, Offshore West Java - PT Alamjaya Makmur Sejahtera, 2018</li>\n              <li>Positioning, topographic survey, bathymetry, metocean, and meteorology support for field scopes.</li>\n              <li>Geophysical logging, pumping test, slug test, and basic geotechnical engineering support.</li>\n              <li>Soil laboratory test coordination with PT Hydrocore as sister company.</li>", 'html'],
    ['#seabed-drilling-projects ul', "<li><button class=\"project-list-trigger\" data-modal=\"karimun-modal\">Geophysical and Vibrocore Survey Works at Karimun Besar Island, Riau Islands - 2025</button></li>\n              <li>Onshore Geotechnical Survey for Ubadari, EGR/CCUS and Onshore Compression (UCC) Project - BP Berau Ltd.</li>\n              <li>Pipeline Pre-Engineering Geotechnical Survey at Tangguh Site, Papua - BP Berau Ltd. / Saipem-Meindo Consortium</li>\n              <li>Sand sources investigation in Banten, vibrocore - PT Hydrocore for Boskalis International Indonesia, 2025</li>\n              <li>Provision of Gravity Coring for Pertamina Avtur SPM at Balongan, West Java - Geotindo, 2010</li>\n              <li>Vibrocoring work, 230 points up to 500 m water depth, Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>\n              <li>Seabed CPT and vibrocore investigation for near-surface soil profiling.</li>\n              <li>Sediment sampling and laboratory follow-up for marine infrastructure planning.</li>", 'html']
  ],
  id: [
    ['title', 'Pengalaman Proyek | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Pengalaman proyek PT Taka Hydrocore Indonesia disusun berdasarkan layanan marine seismic, geoteknik offshore dan onshore, eksplorasi, nearshore, hidrogeologi, marine support, dan seabed.'],
    ['.project-page .preloader-inner p', 'Menyiapkan pengalaman proyek'],
    ['.project-page-hero .kicker', 'Pengalaman Proyek'],
    ['.project-page-hero h1', 'Referensi lapangan di pekerjaan marine, offshore, nearshore, dan onshore.'],
    ['.project-page-hero-copy>p:not(.kicker)', 'Referensi proyek publik THI mencakup layanan geofisika marine, survei geoteknik offshore dengan MV AG Geodrill, marine spread lain, pekerjaan nearshore dan onshore, engineering study, serta water well drilling.'],
    ['.project-map-section>.section-label', '<span>01</span> Jejak Proyek', 'html'],
    ['.project-map-copy h2', 'Daftar proyek berdasarkan lini layanan.'],
    ['.project-map-copy>p:not(.kicker)', 'Daftar di bawah ini merangkum referensi proyek publik THI ke dalam kategori yang lebih rapi, sambil tetap menampilkan sinyal klien, lokasi, dan tahun jika tersedia.'],
    ['.project-map-card figcaption', 'Pengalaman proyek THI di Indonesia, mencakup pekerjaan marine, nearshore, dan onshore.'],
    ['.project-page-metrics div:nth-child(2) span', 'Kelompok sesuai layanan'],
    ['.project-list-section>.section-label', '<span>02</span> Daftar Proyek', 'html'],
    ['.project-list-head .kicker', 'Daftar proyek'],
    ['.project-list-head h2', 'Referensi proyek dikelompokkan berdasarkan lini layanan THI.'],
    ['#marine-seismic-projects .project-service-index', '01 / Geofisika Marine'],
    ['#marine-seismic-projects h3', 'Marine Seismic Resolusi Tinggi 2D/3D'],
    ['#marine-seismic-projects .project-service-body>p', 'Referensi pekerjaan akuisisi seismik resolusi tinggi, survei geohazard, pemrosesan, dan interpretasi untuk perencanaan eksplorasi dan pengembangan.'],
    ['#marine-seismic-projects li:nth-child(1)', 'Layanan High Resolution Marine Seismic Survey - East Seram PSC, Maluku, 2020'],
    ['#marine-seismic-projects li:nth-child(2)', 'Geohazard Survey 2D/3D UHR Seismic Survey - Seascape Survey Indonesia untuk PHKT, 2024'],
    ['#marine-seismic-projects li:nth-child(3)', 'Geophysical Survey and Associated Services - Medco E&P Natuna dan Medco Energi Madura Offshore, 2024'],
    ['#marine-seismic-projects li:nth-child(4)', 'Dukungan akuisisi dan pemrosesan seismik resolusi tinggi untuk perencanaan pengembangan offshore.'],
    ['#marine-seismic-projects li:nth-child(5)', 'Interpretasi data geofisika marine untuk screening geohazard dan eksplorasi.'],
    ['#marine-seismic-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#offshore-geotechnical-projects .project-service-index', '02 / Geoteknik Offshore'],
    ['#offshore-geotechnical-projects h3', 'Survei Geoteknik Offshore'],
    ['#offshore-geotechnical-projects .project-service-body>p', 'Lingkup investigasi tanah marine dengan offshore drilling, CPT, sampling, coring, dan dukungan downhole untuk keputusan engineering.'],
    ['#offshore-geotechnical-projects li:nth-child(1)', 'Marine Geotechnical Site Survey untuk instalasi Jackup Drilling Unit di Block 3/05 - RINA Consulting SpA, Angola, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(2)', 'Site survey dan soil investigation North Ketapang Exploration Field - PETRONAS North Ketapang, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(3)', 'Geotechnical Survey Congo LNG Development Project - RINA Consulting SpA, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(4)', 'Pipeline pre-engineering geotechnical survey - Saipem Indonesia dan Meindo Elang Indah, 2025'],
    ['#offshore-geotechnical-projects li:nth-child(5)', 'Dukungan offshore borehole, CPTu, sampling, coring, dan handover laboratorium untuk infrastruktur energi.'],
    ['#offshore-geotechnical-projects li:nth-child(6)', 'Investigasi geoteknik marine untuk perencanaan vessel-based dan instalasi jack-up.'],
    ['#offshore-geotechnical-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#onshore-geotechnical-projects .project-service-index', '03 / Geoteknik Onshore'],
    ['#onshore-geotechnical-projects h3', 'Survei Geoteknik Onshore'],
    ['#onshore-geotechnical-projects .project-service-body>p', 'Pengeboran darat, uji in-situ, sampling, dan investigasi tanah berbasis laboratorium untuk fasilitas infrastruktur, energi, dan industri.'],
    ['#onshore-geotechnical-projects li:nth-child(1)', 'Onshore geotechnical survey untuk UCC Project - BP Berau Ltd, 2024'],
    ['#onshore-geotechnical-projects li:nth-child(2)', 'Pipeline route soil investigation untuk Pertamina TBBM Pengapon dan Maumere, 2017'],
    ['#onshore-geotechnical-projects li:nth-child(3)', 'Tangguh LNG Expansion Project geotechnical survey, Papua'],
    ['#onshore-geotechnical-projects li:nth-child(4)', 'Soil investigation dan pelaporan berbasis laboratorium untuk pengembangan fasilitas industri.'],
    ['#onshore-geotechnical-projects li:nth-child(5)', 'Dukungan CPT, SPT, sampling, dan field vane testing untuk desain engineering darat.'],
    ['#onshore-geotechnical-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#exploratory-drilling-projects .project-service-index', '04 / Exploratory Drilling'],
    ['#exploratory-drilling-projects h3', 'Exploratory Drilling'],
    ['#exploratory-drilling-projects .project-service-body>p', 'Dukungan coring dan drilling untuk evaluasi sumber daya, eksplorasi pertambangan, dan konfirmasi bawah permukaan dengan rig yang disesuaikan kebutuhan.'],
    ['#exploratory-drilling-projects li:nth-child(1)', 'Dukungan exploratory drilling pertambangan dengan metode conventional dan wireline coring.'],
    ['#exploratory-drilling-projects li:nth-child(2)', 'Deployment skid, mobile, tractor-mounted, dan crawler-mounted drilling rig sesuai akses lokasi.'],
    ['#exploratory-drilling-projects li:nth-child(3)', 'Supervisi lapangan dan penanganan sampel untuk standar eksplorasi klien.'],
    ['#exploratory-drilling-projects li:nth-child(4)', 'Program resource drilling menggunakan konfigurasi coring NQ, HQ, dan PQ.'],
    ['#exploratory-drilling-projects li:nth-child(5)', 'Dukungan eksplorasi pengeboran untuk investigasi mineral dan tambang dari dangkal hingga dalam.'],
    ['#exploratory-drilling-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#nearshore-drilling-projects .project-service-index', '05 / Geoteknik Nearshore'],
    ['#nearshore-drilling-projects h3', 'Pengeboran Geoteknik Nearshore'],
    ['#nearshore-drilling-projects .project-service-body>p', 'Investigasi perairan dangkal menggunakan staging, modular pontoon, dan metode pengeboran berbasis platform untuk infrastruktur pesisir dan marine.'],
    ['#nearshore-drilling-projects li:nth-child(1)', 'Nearshore Geotechnical Survey untuk LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017'],
    ['#nearshore-drilling-projects li:nth-child(2)', 'Nearshore Geotechnical Survey untuk FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017'],
    ['#nearshore-drilling-projects li:nth-child(3)', 'Additional intertidal geotechnical investigation survey untuk Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017'],
    ['#nearshore-drilling-projects li:nth-child(4)', 'Investigasi CPTu dan borehole nearshore untuk desain infrastruktur pesisir.'],
    ['#nearshore-drilling-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#hydrogeology-drilling-projects .project-service-index', '06 / Hidrogeologi'],
    ['#hydrogeology-drilling-projects h3', 'Hydrogeology Drilling'],
    ['#hydrogeology-drilling-projects .project-service-body>p', 'Dukungan monitoring air tanah, suplai air, landfill monitoring, dan drainase tambang dengan kapabilitas pengeboran serta instalasi sumur.'],
    ['#hydrogeology-drilling-projects li:nth-child(1)', 'Water well drilling untuk BP Tangguh Development, Papua, 2018'],
    ['#hydrogeology-drilling-projects li:nth-child(2)', 'Ground water deep water well work untuk Alur Siwah Central Processing Plant Block A, Aceh, 2016'],
    ['#hydrogeology-drilling-projects li:nth-child(3)', 'Water well drilling untuk Donggi Senoro LNG Project, Luwuk, Sulawesi Tengah, 2011-2012'],
    ['#hydrogeology-drilling-projects li:nth-child(4)', 'Instalasi sumur monitoring air tanah untuk program lingkungan dan landfill monitoring.'],
    ['#hydrogeology-drilling-projects li:nth-child(5)', 'Pengeboran drainase tambang dan suplai air dengan konfigurasi sumur sesuai kebutuhan proyek.'],
    ['#hydrogeology-drilling-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#marine-geophysical-other-projects .project-service-index', '07 / Dukungan Survei'],
    ['#marine-geophysical-other-projects h3', 'Marine Geophysical dan Layanan Lainnya'],
    ['#marine-geophysical-other-projects .project-service-body>p', 'Dukungan survei, positioning, bathymetry, geophysical logging, metocean, engineering study, dan koordinasi laboratorium untuk program lapangan.'],
    ['#marine-geophysical-other-projects li:nth-child(1)', 'Provision of Bathymetry Survey and Vessel Charter Services - PT Sumbawa Timur Mining, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(2)', 'Submarine HVAC Cable Route Survey, Crescent Project Indonesia - Keppel Energy Pte Ltd, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(3)', 'Provision of Debris Survey Services - Saka Indonesia Pangkah Limited, 2025'],
    ['#marine-geophysical-other-projects li:nth-child(4)', 'Engineering conceptual study untuk Phase-1 Ground Water Project Tangguh Expansion Project - BP Tangguh Area, 2018'],
    ['#marine-geophysical-other-projects li:nth-child(5)', 'Dukungan positioning, topographic survey, bathymetry, metocean, dan meteorology untuk lingkup lapangan.'],
    ['#marine-geophysical-other-projects li:nth-child(6)', 'Dukungan geophysical logging, pumping test, slug test, dan basic geotechnical engineering.'],
    ['#marine-geophysical-other-projects a', 'Lihat layanan <span>→</span>', 'html'],
    ['#seabed-drilling-projects .project-service-index', '08 / Geoteknik Seabed'],
    ['#seabed-drilling-projects h3', 'Geoteknik Seabed'],
    ['#seabed-drilling-projects .project-service-body>p', 'Investigasi seabed langsung menggunakan sistem Seabed CPT dan Vibrocore ketika recovered sediment dan perilaku tanah dekat seabed diperlukan.'],
    ['#seabed-drilling-projects li:nth-child(1)', '<button class="project-list-trigger" data-modal="karimun-modal">Geophysical and Vibrocore Survey Works di Pulau Karimun Besar, Kepulauan Riau - 2025</button>', 'html'],
    ['#seabed-drilling-projects li:nth-child(2)', 'Sand sources investigation di Banten - PT Hydrocore untuk Boskalis International Indonesia, 2025'],
    ['#seabed-drilling-projects li:nth-child(3)', 'Mooring system design dan data geoteknik untuk floating storage tanker di Selat Bangka, 2015'],
    ['#seabed-drilling-projects li:nth-child(4)', 'Investigasi Seabed CPT dan vibrocore untuk profil tanah dekat permukaan.'],
    ['#seabed-drilling-projects li:nth-child(5)', 'Sampling sedimen dan tindak lanjut laboratorium untuk perencanaan infrastruktur marine.'],
    ['#seabed-drilling-projects a', 'Lihat layanan <span>→</span>', 'html']
,
    ['#marine-seismic-projects ul', "<li>Provision of Bathymetry Survey and Vessel Charter Services - PT Sumbawa Timur Mining, 2025</li>\n              <li>Research and development services for submarine HVAC cable route survey in Indonesia - Keppel Energy Pte Ltd, 2025</li>\n              <li>Provision of Debris Survey Services - Saka Indonesia Pangkah Limited, 2025</li>\n              <li>Provision of Geophysical Survey and Associated Services - Medco E&amp;P Natuna Ltd and Medco Energi Madura Offshore Pty. Ltd., 2024</li>\n              <li>Geohazard Survey 2D/3D UHR Seismic Survey - PT Seascape Survey Indonesia for Pertamina Hulu Kalimantan Timur, 2024</li>\n              <li>Pipeline Side Scan Survey and WHP Subsidence Analysis - Husky-CNOOC Madura Limited, 2023</li>\n              <li>Geohazard Survey Services Call 6 - PHE ONWJ, 2023</li>\n              <li>Provision of Geophysical and Shallow Geotechnical Site Investigation Services, 2023</li>\n              <li>Geohazard Survey Services Call 5 - PHE ONWJ, 2023</li>\n              <li>Geohazard Survey Services Call 4 - PHE ONWJ, 2022</li>\n              <li>Geohazard Survey Services Call 3 - PHE ONWJ, 2022</li>\n              <li>Geophysical, geotechnical, and other related services, 2022</li>\n              <li>Geohazard Survey Services Call 2 - PHE ONWJ, 2022</li>\n              <li>Geophysical, geotechnical, and other related services, 2021</li>\n              <li>Change order bathymetric, geophysical, and offshore geotechnical survey services at Cirata 145MW Floating Solar Power Project - PLTU Cirata, 2021</li>\n              <li>Geohazard Survey Services Call 1 - PHE ONWJ, 2021</li>\n              <li>Geotechnical, bathymetric, and geophysical survey services at Cirata 145MW Floating Solar Power Project - PLTU Cirata, 2021</li>\n              <li>High Resolution Marine Seismic Survey Services, East Seram PSC, Offshore Kobi and Bula, Maluku - Balam Energy Pte Ltd, 2020</li>\n              <li>Bathymetry Acquisition Services, East Seram PSC, Offshore Kobi and Bula, Maluku - Balam Energy Pte Ltd, 2020</li>\n              <li>UHR/HR Seismic Survey for Mahoni, Sepinggan Sierra, Sepinggan Rajah, Sejadi, and Serang Baru, East Kalimantan - PHKT, 2020</li>\n              <li>Geophysical, geotechnical, and other related services, Natuna Sea, Riau Islands - Medco E&amp;P Natuna Ltd, 2020</li>\n              <li>Marine site survey for intake, outfall, jetty wharf, bathymetry, manual sounding, SBP Hi-Res, and seabed sampling at Central Java Power Plant Project, Batang - PT Hydrocore for Mitsui Engineering and Shipbuilding Co. Ltd, 2020</li>\n              <li>Marine survey for bathymetric, seabed Hi-Res sub-bottom profiling, magnetometer, and geotechnical investigation at Central Java Power Plant Project, Batang - PT Hydrocore for Wakachiku Construction Co. Ltd, 2019</li>\n              <li>Geotechnical, bathymetrical, geophysical, and hydrometeorological survey, offshore and onshore Penajam, East Kalimantan - PT Kereta Api Borneo, 2017</li>\n              <li>Bathymetric survey for Chipmill Jetty at Kariangau Balikpapan River, East Kalimantan - PT Fajar Surya Swadaya, PT Djarum Group, 2010</li>\n              <li>Vibrocoring work, 230 points up to 500 m water depth, for Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>", 'html'],
    ['#offshore-geotechnical-projects ul', "<li class=\"project-list-subtitle\">Offshore geotechnical survey using MV AG Geodrill</li>\n              <li>Provision of Site Survey and Soil Investigation Survey for North Ketapang Exploration Field, East Java - PETRONAS North Ketapang Sdn. Bhd., 2025</li>\n              <li>Geotechnic Services - PT Pertamina Hulu Energi Offshore South East Sumatra, 2025</li>\n              <li>Provision of Pipeline Pre-Engineering Geotechnical Survey Services - Consortium PT Saipem Indonesia and PT Meindo Elang Indah, 2025</li>\n              <li>Nearshore geotechnical scope for Offshore Shallow Water Geotechnical Survey, Abadi OLNG Project, Masela Block - PT Fugro Indonesia, 2025</li>\n              <li>Provision of Geotechnical Survey Services for OML 83 FEED - Enviros Survey &amp; Consultancy Limited, 2025</li>\n              <li>Onshore and intertidal geophysical and geotechnical survey - Inpex Masela Ltd., 2025</li>\n              <li>Shallow Water Geotechnical Survey, LNG PP - PT Freeport Indonesia, 2025</li>\n              <li>Geotechnical Survey Congo LNG Development Project - RINA Consulting SpA, 2025</li>\n              <li>Offshore Geotechnical for Pre-Engineering Survey - PT Elnusa Tbk for PT Pertamina Hulu Mahakam, 2025</li>\n              <li>Provision of Service for Onshore Geotechnical Survey for Ubadari, EGR/CCUS, Onshore Compression Project - BP Berau Ltd., 2024</li>\n              <li>Provision of Shallow Hazard Survey Services in Pertamina Hulu Kalimantan Timur working area - PT Elnusa Tbk for PHKT, 2023</li>\n              <li>Geotechnical Survey Service for SUISEN-1 Prop Exploration Well and Tambakboyo Field Development - Saka Energy Muriah Ltd and Saka Indonesia Pangkah Limited, 2022</li>\n              <li>Offshore Geotechnical Survey Service - PT Seascape Surveys Indonesia, 2022</li>\n              <li>Geotechnical Survey Service for Malong, Belida NE, Forel, and Bronang Field - Medco E&amp;P Natuna, 2022</li>\n              <li>Offshore Geotechnical Survey for Marine Terminal and Offshore Facilities, PRPP Great Project, Tuban - PT Haskoning Indonesia for Pertamina Rosneft, 2021</li>\n              <li>Geotechnical Survey Service for proposed GQX-1 Exploration Well Project - PHE ONWJ, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Jawa 9 &amp; 10 Coal Fired Steam Power Plant - PT Hutama Karya, 2021</li>\n              <li>Onshore Geotechnical Survey Services at Cirata 145MW Floating Solar Power Project - PowerChina Huadong Engineering Corporation, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Fanny Site, PHE OSES Area - PT Elnusa Tbk, 2021</li>\n              <li>Offshore Geotechnical Survey Services for Suratmi Site, PHE OSES Area - PT Elnusa Tbk, 2020</li>\n              <li>Offshore Geotechnical Survey at Serang Baru, PHKT Area, East Kalimantan - Seascape Survey for PHKT, 2020</li>\n              <li>Offshore Geotechnical Survey at SPS Mahoni, PHKT Area, East Kalimantan - Seascape Survey for PHKT, 2020</li>\n              <li>Drilling support services for geotechnical soil boring, 2020 OPL YY Relief Well - PHE ONWJ, 2020</li>\n              <li>Geotechnical survey for jack-up rig location at Kerindingan Platform - Seascape Survey for PHKT, 2020</li>\n              <li>Offshore Geotechnical Survey Work for FEED Project Bromo, East Java - Worley Pte Limited, 2020</li>\n              <li>Offshore Geotechnical Survey Work for Natuna Sea geophysical, geotechnical, and related services - Medco E&amp;P Natuna Ltd, 2020</li>\n              <li>Offshore Geotechnical Survey Services for Offshore Lawe-Lawe Facilities Project, RDMP RU V Pertamina Balikpapan - PT LAPI ITB, 2020</li>\n              <li>Geotechnical Survey Services for jack-up rig locations near Kerindingan Platform and additional PHKT locations - PT Seascape Surveys Indonesia, 2020</li>\n              <li>Offshore Geotechnical Survey Services for Parang-2 Bunyu, PHE Nunukan - PT Java Offshore and PHE Nunukan, 2020</li>\n              <li>Geotechnical Survey Services for Seguni-A, Santan STA, and Victor jack-up rig locations - PT Seascape Surveys Indonesia and PHKT, 2019-2020</li>\n              <li>Offshore Geotechnical Survey for MOPU Location at MBH Field, Madura Strait - HCML, 2019</li>\n              <li>Offshore soil investigation for Toll Sea Bridge, Balikpapan Bay, Penajam - PT Waskita Karya, 2019</li>\n              <li>Geotechnical survey for Seturian 10 jack-up rig location - PT Seascape Surveys Indonesia and PHKT, 2019</li>\n              <li>Geotechnical Soil Boring for YYA-1 Relief Well, Java Sea - PHE ONWJ, 2019</li>\n              <li>Survey soil investigation for new SPM at Pertamina Pengapon Project, Semarang - PT Surveyor Indonesia and Pertamina, 2019</li>\n              <li>Geotechnical soil boring for NWY-1 Exploration Well, Java Sea - PHE ONWJ, 2019</li>\n              <li>Offshore Geotechnical Survey for Central Java Power Plant intake and outfall line, Batang - Mitsui Engineering &amp; Shipbuilding Co. Ltd, 2018-2019</li>\n              <li>Offshore Geotechnical Survey for PHE WMO near PHE-12 Platform, Madura Block - PT Elnusa Tbk, 2018</li>\n              <li>Offshore Geotechnical Survey for WHP-C and WHP-D worksites, Pangkah PSC Block, East Java - Saka group companies, 2018</li>\n              <li>Offshore Geotechnical Survey for PLTGU Jawa 1 CCPP IPP Project, Cilamaya Subang - PT Meindo Elang Indah, 2018</li>\n              <li>Offshore Geotechnical Survey for FEED of Multi Column Tension Leg Platform, L-Parigi Field, Subang - Technip FMC, 2018</li>\n              <li>Nearshore and Offshore Geotechnical Survey for SPL and SPM Pertamina Refinery Unit VI Balongan - PT ITS Tekno Sains, 2018</li>\n              <li>Marine geotechnical investigation for New 2nd Jetty, BP Tangguh Expansion Project - CSTS Joint Operation, 2017-2018</li>\n              <li>Survey soil investigation for SPM at Pertamina Pengapon Project, Semarang - PT Surveyor Indonesia and Pertamina, 2017</li>\n              <li>Offshore Geotechnical Survey for Jack-up Rig of PHE ABAR - PT Alamjaya Makmur Sejahtera and PHE Abar, 2017</li>\n              <li>Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore and Offshore Geotechnical Survey for SPL/SPM Pertamina UP VI Balongan - PT Pageo Utama and Pertamina UP VI, 2017</li>\n              <li class=\"project-list-subtitle\">Offshore geotechnical survey using other marine spread</li>\n              <li>Offshore geotechnical survey works for mooring system design and geotechnical data for floating storage tanker at Bangka Strait - ConocoPhillips Indonesia Inc. Ltd, 2015</li>\n              <li>Offshore soil boring for CNOOC Widuri and Lisa at Malaka Strait - PT Geoservices, 2014</li>", 'html'],
    ['#onshore-geotechnical-projects ul', "<li>Provision of Geotechnical Survey and Services for Jetty D North West Cilegon City, CAP2 Expansion Project - PT Chandra Asri Perkasa, 2018</li>\n              <li>Soil investigation survey for pipeline route at TBBM Pengapon Semarang and TBBM Maumere - PT Surveyor Indonesia for Pertamina, 2017</li>\n              <li>Onshore Geotechnical Investigation Survey for Regasification Facilities at KITe LNG Receiving Makassar FSRU - PT Patra Drilling Contractor, 2017</li>\n              <li>Geotechnical, bathymetrical, geophysical, and hydrometeorological survey, offshore and onshore Penajam, East Kalimantan - PT Kereta Api Borneo, 2017</li>\n              <li>Additional Soil Investigation, Intertidal Geotechnical Investigation Survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Soil Investigation Survey at Liquid Jetty Project Oleochemical Plant, Lubuk Gaung Dumai - PT Witteveen Bos Indonesia, 2016</li>\n              <li>Nearshore Site Investigation Work for Dredging International Asia Pacific, Tanjung Benoa Bali - PT Hydrocore, 2016</li>\n              <li>Offshore Soil Investigation and Bathymetric Survey for Bojonegara LNG Receiving Terminal - PT BAM Decorient Indonesia, 2016</li>\n              <li>Offshore Geotechnical Survey Works for Condensate Splitter PRE-FEED Project, Ciwandan Cilegon - BP Singapore Pte Ltd, 2014</li>\n              <li>Geotechnical Survey for Tangguh LNG Expansion Project, Papua - PT Fugro Indonesia</li>\n              <li>Onshore and Offshore Geotechnical Investigations for WBN, Halmahera Tengah, North Maluku - Eramet, 2013-2014</li>\n              <li>Geotechnical and hydrogeological investigation for Block M pit, Alfara Delta Persada Coal Mining, Anggana, East Kalimantan - PT Alfara Delta Persada, 2010</li>\n              <li>Onshore and nearshore geotechnical investigation for Pertamina West Java LNG Floating Terminal, Muara Karang Jakarta - Pageo/WorleyParsons, 2010</li>\n              <li>Onshore and nearshore geotechnical investigation for PGN Medan LNG Floating Terminal, Muara Karang Jakarta - Pageo, 2010</li>\n              <li>West Levee Geotechnical Investigation at Freeport Timika, Papua - PT Nakawa, 2011</li>", 'html'],
    ['#exploratory-drilling-projects ul', "<li>Deep Coal Exploration Drilling at Musi Banyu Asin and Musi Banyu Rawas, South Sumatera - Adani Global, 2010</li>\n              <li>Coal Bed Methane coring for Arrow Energy at Tanjung Enim, South Sumatera - PT Tridiantara Alvindo, 2010</li>\n              <li>Coal Exploratory Drilling for BISM at Melak, East Kalimantan - BISM, 2011</li>\n              <li>Mining exploratory drilling support with conventional and wireline coring methods.</li>\n              <li>Skid, mobile, tractor-mounted, and crawler-mounted drilling rig deployment according to site access.</li>\n              <li>Qualified field supervision and sample handling for client exploration standards.</li>\n              <li>Resource drilling programs using NQ, HQ, and PQ coring configuration.</li>", 'html'],
    ['#nearshore-drilling-projects ul', "<li>Submarine Cable Route Survey dari Pulau Bulan ke Jurong Island Borderline - PT Medco Power Indonesia</li>\n              <li>Crescent Project, Indonesian Submarine Cable Route Survey di Rempang Island - Keppel</li>\n              <li>Nearshore Geotechnical Survey di West Saumlaki, Tanimbar Island - PT Fugro Indonesia</li>\n              <li>Nearshore Geotechnical Survey untuk LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey untuk FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Additional intertidal geotechnical investigation survey untuk Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Investigasi CPTu dan borehole nearshore untuk desain infrastruktur pesisir.</li>", 'html'],
    ['#hydrogeology-drilling-projects ul', "<li>Water Well Drilling untuk BP Tangguh Development, Papua - BP Berau Ltd, 2018</li>\n              <li>Ground Water Deep Water Well Work untuk Alur Siwah Central Processing Plant Block A, Aceh - JGC Indonesia dan Encona Consortium JEC, 2016</li>\n              <li>Water Well Drilling untuk Donggi Senoro LNG Project, Luwuk Sulawesi Tengah - JGC Corporation, 2011-2012</li>\n              <li>Instalasi sumur monitoring air tanah untuk program lingkungan dan landfill monitoring.</li>\n              <li>Pengeboran drainase tambang dan suplai air dengan konfigurasi sumur sesuai kebutuhan proyek.</li>", 'html'],
    ['#marine-geophysical-other-projects ul', "<li>Engineering conceptual study for Phase-1 Ground Water Project, Tangguh Expansion Project, West Papua - PT Singgar Mulia, 2018</li>\n              <li>Desk study soil-pipe interaction analysis, Pipeline Foxtrot Platform to Karunia WHP, ABAR Block, Offshore West Java - PT Alamjaya Makmur Sejahtera, 2018</li>\n              <li>Positioning, topographic survey, bathymetry, metocean, and meteorology support for field scopes.</li>\n              <li>Geophysical logging, pumping test, slug test, and basic geotechnical engineering support.</li>\n              <li>Soil laboratory test coordination with PT Hydrocore as sister company.</li>", 'html'],
    ['#seabed-drilling-projects ul', "<li><button class=\"project-list-trigger\" data-modal=\"karimun-modal\">Geophysical and Vibrocore Survey Works di Karimun Besar Island, Riau Islands - 2025</button></li>\n              <li>Onshore Geotechnical Survey untuk Ubadari, EGR/CCUS dan Onshore Compression (UCC) Project - BP Berau Ltd.</li>\n              <li>Pipeline Pre-Engineering Geotechnical Survey di Tangguh Site, Papua - BP Berau Ltd. / Saipem-Meindo Consortium</li>\n              <li>Sand sources investigation di Banten, vibrocore - PT Hydrocore untuk Boskalis International Indonesia, 2025</li>\n              <li>Provision of Gravity Coring untuk Pertamina Avtur SPM di Balongan, Jawa Barat - Geotindo, 2010</li>\n              <li>Vibrocoring work, 230 titik hingga kedalaman air 500 m, Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>\n              <li>Investigasi Seabed CPT dan vibrocore untuk profil tanah dekat permukaan seabed.</li>\n              <li>Pengambilan sampel sedimen dan tindak lanjut laboratorium untuk perencanaan infrastruktur laut.</li>", 'html']
  ]
};

const applyProjectPageLanguage = (language) => {
  if (!document.body.classList.contains('project-page')) return;
  const translations = projectPageTranslations[language] || projectPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

// Project detail modal logic
(function () {
  if (!document.body.classList.contains('project-page')) return;

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.pdm-close')?.focus();
  };

  const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    // Open modal via trigger button
    const trigger = e.target.closest('[data-modal]');
    if (trigger) {
      openModal(trigger.dataset.modal);
      return;
    }
    // Close modal via backdrop or close button
    if (e.target.closest('[data-close-modal]')) {
      const modal = e.target.closest('.project-detail-modal');
      if (modal) closeModal(modal.id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.project-detail-modal:not([hidden])').forEach((m) => closeModal(m.id));
    }
  });
})();

// Photo lightbox logic
(function () {
  if (!document.body.classList.contains('project-page')) return;

  const lb       = document.getElementById('pdm-lightbox');
  const lbImg    = document.getElementById('pdm-lightbox-img');
  const lbClose  = document.getElementById('pdm-lightbox-close');
  const lbPrev   = document.getElementById('pdm-lightbox-prev');
  const lbNext   = document.getElementById('pdm-lightbox-next');
  const lbBack   = document.getElementById('pdm-lightbox-backdrop');
  if (!lb) return;

  let gallery = [];
  let current = 0;

  const show = (idx) => {
    current = (idx + gallery.length) % gallery.length;
    lbImg.src = gallery[current].src;
    lbImg.alt = gallery[current].alt;
  };

  const open = (imgs, idx) => {
    gallery = Array.from(imgs);
    show(idx);
    lb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lb.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  // Click on gallery image
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.pdm-grid img');
    if (img) {
      const allImgs = img.closest('.pdm-grid').querySelectorAll('img');
      const idx = Array.from(allImgs).indexOf(img);
      open(allImgs, idx);
    }
  });

  lbClose.addEventListener('click', close);
  lbBack.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(current - 1));
  lbNext.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    if (lb.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });
})();

const contactPageTranslations = {
  en: [
    ['title', 'Contact | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Contact PT Taka Hydrocore Indonesia for survey, drilling, geotechnical, geophysical, QHSE, and vessel-based project enquiries.'],
    ['.contact-page .preloader-inner p', 'Preparing contact desk'],
    ['.contact-page-hero-copy .kicker', 'Project enquiry'],
    ['.contact-page-hero h1', 'Let us align the right field method before mobilization.'],
    ['.contact-page-hero-copy>p:not(.kicker)', 'Share the project location, service scope, schedule, site constraints, and expected deliverables. THI can help shape a practical survey, drilling, or data acquisition approach.'],
    ['.contact-desk>.section-label', '<span>01</span> Contact Desk', 'html'],
    ['.contact-channel-primary span', 'Email'],
    ['.contact-channel-primary p', 'Use this address for project enquiries, survey discussions, and technical service coordination.'],
    ['.contact-channel-primary a', 'Send email <span>→</span>', 'html'],
    ['.contact-channel-stack article:nth-child(2) span', 'Head Office'],
    ['.contact-channel-stack article:nth-child(3) span', 'Workshop'],
    ['.contact-office-map figcaption span', 'Office location'],
    ['.contact-office-map figcaption a', 'Open in Google Maps <span>→</span>', 'html']
  ],
  id: [
    ['title', 'Kontak | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Hubungi PT Taka Hydrocore Indonesia untuk enquiry proyek survei, pengeboran, geoteknik, geofisika, QHSE, dan pekerjaan berbasis kapal.'],
    ['.contact-page .preloader-inner p', 'Menyiapkan kontak'],
    ['.contact-page-hero-copy .kicker', 'Diskusi proyek'],
    ['.contact-page-hero h1', 'Mari selaraskan metode lapangan yang tepat sebelum mobilisasi.'],
    ['.contact-page-hero-copy>p:not(.kicker)', 'Bagikan lokasi proyek, lingkup layanan, jadwal, batasan site, dan deliverable yang dibutuhkan. THI dapat membantu menyusun pendekatan survei, pengeboran, atau akuisisi data yang praktis.'],
    ['.contact-desk>.section-label', '<span>01</span> Kontak', 'html'],
    ['.contact-channel-primary span', 'Email'],
    ['.contact-channel-primary p', 'Gunakan alamat ini untuk enquiry proyek, diskusi survei, dan koordinasi layanan teknis.'],
    ['.contact-channel-primary a', 'Kirim email <span>→</span>', 'html'],
    ['.contact-channel-stack article:nth-child(2) span', 'Kantor Pusat'],
    ['.contact-channel-stack article:nth-child(3) span', 'Workshop'],
    ['.contact-office-map figcaption span', 'Lokasi kantor'],
    ['.contact-office-map figcaption a', 'Buka di Google Maps <span>→</span>', 'html']
  ]
};

const applyContactPageLanguage = (language) => {
  if (!document.body.classList.contains('contact-page')) return;
  const translations = contactPageTranslations[language] || contactPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const newsPageTranslations = {
  en: [
    ['title', 'News & Updates | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia CSR news and company updates.'],
    ['.news-page .preloader-inner p', 'Preparing news'],
    ['.news-page-hero-copy .kicker', 'Newsroom'],
    ['.news-page-hero h1', 'Find company news faster.'],
    ['.news-page-hero-copy>p:not(.kicker)', 'Browse project updates, company visits, CSR activity, and internal stories from PT Taka Hydrocore Indonesia.'],
    ['.news-feature-section>.section-label', '<span>01</span> Newsroom', 'html'],
    ['.newsroom-head .kicker', 'Latest News'],
    ['.newsroom-head h2', 'Highlighted company update.'],
    ['.newsroom-head>p:not(.kicker)', 'The most recent story is featured first so visitors can catch the latest update before browsing the full news list.'],
    ['.news-list-head .kicker', 'All Updates'],
    ['.news-list-head h2', 'Explore stories from Taka Hydrocore.'],
    ['.news-list-head>p', 'Filter by topic, year, or keyword to find project notes, company activities, and selected announcements.'],
    ['[data-news-search-label]', 'Search news'],
    ['[data-news-topic-label]', 'Topic'],
    ['[data-news-year-label]', 'Year'],
    ['[data-news-reset]', 'Clear filters'],
    ['.news-empty-state span', 'No published news'],
    ['.news-empty-state p', 'Company news and updates will appear here after content is published.']
  ],
  id: [
    ['title', 'Berita & Pembaruan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Berita CSR dan pembaruan perusahaan PT Taka Hydrocore Indonesia.'],
    ['.news-page .preloader-inner p', 'Menyiapkan berita'],
    ['.news-page-hero-copy .kicker', 'Ruang Berita'],
    ['.news-page-hero h1', 'Temukan berita perusahaan lebih cepat.'],
    ['.news-page-hero-copy>p:not(.kicker)', 'Telusuri pembaruan proyek, kunjungan perusahaan, kegiatan CSR, dan cerita internal dari PT Taka Hydrocore Indonesia.'],
    ['.news-feature-section>.section-label', '<span>01</span> Ruang Berita', 'html'],
    ['.newsroom-head .kicker', 'Berita Terbaru'],
    ['.newsroom-head h2', 'Sorotan pembaruan perusahaan.'],
    ['.newsroom-head>p:not(.kicker)', 'Berita terbaru ditampilkan lebih dulu agar pengunjung bisa langsung melihat pembaruan utama sebelum menelusuri daftar berita.'],
    ['.news-list-head .kicker', 'Semua Pembaruan'],
    ['.news-list-head h2', 'Telusuri cerita dari Taka Hydrocore.'],
    ['.news-list-head>p', 'Saring berdasarkan topik, tahun, atau kata kunci untuk menemukan catatan proyek, kegiatan perusahaan, dan pengumuman pilihan.'],
    ['[data-news-search-label]', 'Cari berita'],
    ['[data-news-topic-label]', 'Topik'],
    ['[data-news-year-label]', 'Tahun'],
    ['[data-news-reset]', 'Hapus filter'],
    ['.news-empty-state span', 'Belum ada berita terbit'],
    ['.news-empty-state p', 'Berita dan pembaruan perusahaan akan tampil di sini setelah dipublikasikan.']
  ]
};

const applyNewsPageLanguage = (language) => {
  if (!document.body.classList.contains('news-page')) return;
  const translations = newsPageTranslations[language] || newsPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  const search = document.querySelector('[data-news-search]');
  if (search) {
    search.placeholder = language === 'id'
      ? 'Cari project, CSR, SIGAP, geophysical...'
      : 'Search project, CSR, SIGAP, geophysical...';
  }
};

let cmsNewsItems = [];
const newsFilterState = {
  query: '',
  category: 'all',
  year: 'all'
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const markdownInlineToHtml = (value = '') => escapeHtml(value)
  .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
  .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
  .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');

const getSafeCmsAssetPath = (value = '') => {
  const path = String(value || '').trim();
  if (!path) return '';
  if (/[\u0000-\u001f"'<>\\]/.test(path)) return '';
  if (/^(?:https?:|data:|javascript:|vbscript:|file:)/i.test(path)) return '';
  if (path.includes('..') || path.startsWith('/') || path.startsWith('#')) return '';
  if (!/\.(?:png|jpe?g|webp|gif)$/i.test(path)) return '';
  return path.startsWith('assets/') ? path : '';
};

const normalizeCmsNewsItems = (data) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .filter((item) => item && item.published !== false && item.title && item.slug && !String(item.type || '').toLowerCase().includes('talent'))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};

const formatNewsDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat(activeLanguage === 'id' ? 'id-ID' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const newsDetailHref = (item) => `news-detail.html?slug=${encodeURIComponent(item.slug)}`;

const getNewsYear = (item) => {
  const date = new Date(item.date || 0);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
};

const hasActiveNewsFilters = () => Boolean(
  newsFilterState.query ||
  newsFilterState.category !== 'all' ||
  newsFilterState.year !== 'all'
);

const matchesNewsFilters = (item) => {
  const query = newsFilterState.query.trim().toLowerCase();
  const category = String(item.category || 'Company Update');
  const year = getNewsYear(item);
  const searchable = [
    item.title,
    item.summary,
    item.category,
    item.body
  ].join(' ').toLowerCase();

  return (!query || searchable.includes(query)) &&
    (newsFilterState.category === 'all' || category === newsFilterState.category) &&
    (newsFilterState.year === 'all' || year === newsFilterState.year);
};

const getNewsCategoryCounts = (items = cmsNewsItems) => items.reduce((map, item) => {
  const category = String(item.category || 'Company Update').trim() || 'Company Update';
  map.set(category, (map.get(category) || 0) + 1);
  return map;
}, new Map());

const getNewsCountLabel = (count) => {
  if (activeLanguage === 'id') return `${count} berita`;
  return `${count} ${count === 1 ? 'update' : 'updates'}`;
};

const renderNewsSearchTools = (items = cmsNewsItems, visibleItems = items) => {
  if (!document.body.classList.contains('news-page')) return;

  const categoryWrap = document.querySelector('[data-news-categories]');
  const yearSelect = document.querySelector('[data-news-year]');
  const resultCount = document.querySelector('[data-news-result-count]');
  const resetButton = document.querySelector('[data-news-reset]');
  const overview = document.querySelector('[data-news-overview]');
  const featured = document.querySelector('[data-news-featured]');

  if (categoryWrap) {
    const categories = Array.from(getNewsCategoryCounts(items).keys()).sort((a, b) => a.localeCompare(b));
    const allLabel = activeLanguage === 'id' ? 'Semua berita' : 'All updates';
    categoryWrap.innerHTML = [
      `<button type="button" class="${newsFilterState.category === 'all' ? 'active' : ''}" data-news-category="all">${allLabel}</button>`,
      ...categories.map((category) => `<button type="button" class="${newsFilterState.category === category ? 'active' : ''}" data-news-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    ].join('');
  }

  if (yearSelect) {
    const current = newsFilterState.year;
    const years = Array.from(new Set(items.map(getNewsYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
    const allYears = activeLanguage === 'id' ? 'Semua tahun' : 'All years';
    yearSelect.innerHTML = [
      `<option value="all">${allYears}</option>`,
      ...years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`)
    ].join('');
    yearSelect.value = years.includes(current) ? current : 'all';
    newsFilterState.year = yearSelect.value;
  }

  if (resultCount) {
    resultCount.textContent = activeLanguage === 'id'
      ? `${getNewsCountLabel(visibleItems.length)} ditemukan`
      : `${getNewsCountLabel(visibleItems.length)} found`;
  }

  if (resetButton) {
    resetButton.disabled = !hasActiveNewsFilters();
  }

  if (overview && featured) {
    const item = visibleItems[0];
    if (!item) {
      overview.hidden = true;
    } else {
      const category = escapeHtml(item.category || 'Company Update');
      const date = escapeHtml(formatNewsDate(item.date));
      const title = escapeHtml(item.title);
      const summary = markdownInlineToHtml(item.summary || '');
      const image = getSafeCmsAssetPath(item.image);
      const imageAlt = escapeHtml(item.imageAlt || item.title);
      const label = activeLanguage === 'id' ? 'Sorotan terbaru' : 'Latest highlight';
      const read = activeLanguage === 'id' ? 'Baca berita' : 'Read story';
      overview.hidden = false;
      featured.innerHTML = `<a class="newsroom-featured-card" href="${newsDetailHref(item)}">
        <figure>${image ? `<img src="${escapeHtml(image)}" alt="${imageAlt}" loading="lazy">` : ''}</figure>
        <div>
          <span>${label}</span>
          <small>${category} · ${date}</small>
          <h3>${title}</h3>
          <p>${summary}</p>
          <strong>${read} →</strong>
        </div>
      </a>`;
    }
  }

};

const initNewsFilterEvents = () => {
  const page = document.querySelector('.news-page');
  if (!page || page.dataset.newsFiltersReady) return;
  page.dataset.newsFiltersReady = 'true';

  const search = page.querySelector('[data-news-search]');
  const yearSelect = page.querySelector('[data-news-year]');

  search?.addEventListener('input', (event) => {
    newsFilterState.query = event.target.value || '';
    renderCmsNewsCards(cmsNewsItems);
  });

  yearSelect?.addEventListener('change', (event) => {
    newsFilterState.year = event.target.value || 'all';
    renderCmsNewsCards(cmsNewsItems);
  });

  page.addEventListener('click', (event) => {
    const categoryButton = event.target.closest('[data-news-category]');
    const resetButton = event.target.closest('[data-news-reset]');

    if (categoryButton) {
      newsFilterState.category = categoryButton.dataset.newsCategory || 'all';
      renderCmsNewsCards(cmsNewsItems);
    }

    if (resetButton) {
      newsFilterState.query = '';
      newsFilterState.category = 'all';
      newsFilterState.year = 'all';
      if (search) search.value = '';
      renderCmsNewsCards(cmsNewsItems);
    }
  });
};

const renderNewsEmpty = (container, scope) => {
  container.classList.add('is-empty');
  const noMatch = scope === 'archive' && document.body.classList.contains('news-page') && hasActiveNewsFilters();
  const title = activeLanguage === 'id'
    ? (noMatch ? 'Tidak ada berita yang cocok' : 'Belum ada berita terbit')
    : (noMatch ? 'No matching updates' : 'No published news');
  const copy = activeLanguage === 'id'
    ? (noMatch ? 'Coba kata kunci, topik, atau tahun yang berbeda.' : 'Berita akan tampil di sini setelah dipublikasikan.')
    : (noMatch ? 'Try another keyword, topic, or year.' : 'News will appear here after content is published.');
  container.innerHTML = `<article class="news-empty-state ${scope === 'home' ? 'news-empty-state-inline' : ''}"><span>${title}</span><p>${copy}</p></article>`;
};

const renderCmsNewsCards = (items = cmsNewsItems) => {
  const filteredNewsItems = items.filter(matchesNewsFilters);
  renderNewsSearchTools(items, filteredNewsItems);

  document.querySelectorAll('[data-news-list]').forEach((container) => {
    const scope = container.dataset.newsList;
    const newsPageArchiveItems = document.body.classList.contains('news-page') && !hasActiveNewsFilters()
      ? filteredNewsItems.slice(1)
      : filteredNewsItems;
    const sourceItems = scope === 'home'
      ? (items.filter((item) => item.featured).length ? items.filter((item) => item.featured) : items)
      : (document.body.classList.contains('news-page') ? newsPageArchiveItems : items);
    const limit = scope === 'home' ? 3 : sourceItems.length;
    const visibleItems = sourceItems.slice(0, limit);
    if (!visibleItems.length) {
      renderNewsEmpty(container, scope);
      return;
    }

    container.classList.remove('is-empty');
    container.innerHTML = visibleItems.map((item) => {
      const category = escapeHtml(item.category || 'Company Update');
      const date = escapeHtml(formatNewsDate(item.date));
      const title = escapeHtml(item.title);
      const summary = markdownInlineToHtml(item.summary || '');
      const image = getSafeCmsAssetPath(item.image);
      const imageAlt = escapeHtml(item.imageAlt || item.title);

      if (scope === 'home') {
        return `<a class="news-card news-cms-card" href="${newsDetailHref(item)}">
          <figure class="news-image">${image ? `<img src="${escapeHtml(image)}" alt="${imageAlt}" loading="lazy">` : ''}</figure>
          <div class="news-content">
            <div class="news-meta"><span>${category}</span><small>${date}</small></div>
            <h3>${title}</h3>
            <p>${summary}</p>
          </div>
        </a>`;
      }

      return `<a class="newsroom-story news-cms-story news-directory-card" href="${newsDetailHref(item)}">
        <figure class="newsroom-story-media">${image ? `<img src="${escapeHtml(image)}" alt="${imageAlt}" loading="lazy">` : ''}</figure>
        <div class="newsroom-story-copy">
          <div class="newsroom-story-meta"><span>${category}</span><small>${date}</small></div>
          <div><h2>${title}</h2><p>${summary}</p></div>
          <div class="newsroom-story-footer"><span>${activeLanguage === 'id' ? 'Berita THI' : 'THI News'}</span><span>${activeLanguage === 'id' ? 'Baca berita' : 'Read story'} →</span></div>
        </div>
      </a>`;
    }).join('');
  });
};

const markdownToHtml = (markdown = '') => {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${markdownInlineToHtml(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${markdownInlineToHtml(item)}</li>`).join('')}</ul>`);
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h3>${markdownInlineToHtml(trimmed.slice(4))}</h3>`);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${markdownInlineToHtml(trimmed.slice(3))}</h2>`);
      return;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return blocks.join('') || '<p>Full article content is being prepared.</p>';
};

const renderCmsNewsDetail = (items = cmsNewsItems) => {
  if (!document.body.classList.contains('news-detail-page')) return;
  const slug = new URLSearchParams(window.location.search).get('slug');
  const item = items.find((entry) => entry.slug === slug);
  const hero = document.querySelector('[data-news-detail]');
  const header = hero?.querySelector('.news-article-header');
  const body = document.querySelector('[data-news-detail-body]');
  if (!header || !body) return;

  if (!item) {
    header.querySelector('.kicker').textContent = activeLanguage === 'id' ? 'Berita' : 'News';
    header.querySelector('h1').textContent = activeLanguage === 'id' ? 'Berita tidak ditemukan.' : 'News item not found.';
    header.querySelector('p:not(.kicker)').textContent = activeLanguage === 'id'
      ? 'Pilih berita yang sudah dipublikasikan dari halaman News.'
      : 'Select a published item from the News page.';
    body.innerHTML = `<p class="lead">${activeLanguage === 'id' ? 'Belum ada konten yang bisa ditampilkan.' : 'No content is available for this news item.'}</p>`;
    return;
  }

  document.title = `${item.title} | Taka Hydrocore Indonesia`;
  const meta = document.querySelector('meta[name="description"]');
  meta?.setAttribute('content', item.summary || item.title);
  header.querySelector('.kicker').textContent = item.category || 'News';
  header.querySelector('h1').textContent = item.title;
  header.querySelector('p:not(.kicker)').innerHTML = markdownInlineToHtml(item.summary || '');
  document.querySelector('[data-news-detail-category]').textContent = item.category || 'News';
  document.querySelector('[data-news-detail-date]').textContent = formatNewsDate(item.date) || '-';
  const safeImage = getSafeCmsAssetPath(item.image);
  if (safeImage) {
    hero.style.setProperty('--news-detail-image', `url("${safeImage.replace(/"/g, '%22')}")`);
    hero.classList.add('has-image');
  }
  const imageMarkup = safeImage
    ? `<figure class="news-detail-main-image" data-news-detail-image>
        <img src="${escapeHtml(safeImage)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="eager">
        <figcaption>${escapeHtml(item.imageAlt || item.category || 'THI documentation')}</figcaption>
      </figure>`
    : '';
  body.innerHTML = `${imageMarkup}<p class="lead">${markdownInlineToHtml(item.summary || '')}</p>${markdownToHtml(item.body || '')}`;
};

const initCmsNews = () => {
  if (!document.querySelector('[data-news-list]') && !document.body.classList.contains('news-detail-page')) return;
  initNewsFilterEvents();
  fetch('data/news.json', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : { items: [] }))
    .then((data) => {
      cmsNewsItems = normalizeCmsNewsItems(data);
      renderCmsNewsCards(cmsNewsItems);
      renderCmsNewsDetail(cmsNewsItems);
    })
    .catch(() => {
      cmsNewsItems = [];
      renderCmsNewsCards(cmsNewsItems);
      renderCmsNewsDetail(cmsNewsItems);
    });
};

let cmsJobItems = [];
const jobFilterState = {
  quick: 'all',
  query: '',
  department: 'all',
  level: 'all',
  type: 'all',
  group: 'all'
};

const normalizeListField = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.tag || item.responsibility || item.requirement || item.document || '';
      return '';
    })
    .filter(Boolean);
};

const normalizeJobPill = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const isDuplicateJobTag = (tag, facts = []) => {
  const normalizedTag = normalizeJobPill(tag);
  if (!normalizedTag) return true;
  return facts.some((fact) => {
    const normalizedFact = normalizeJobPill(fact);
    return normalizedFact
      && (normalizedTag === normalizedFact
        || normalizedFact.includes(normalizedTag)
        || normalizedTag.includes(normalizedFact));
  });
};

const filterJobTags = (tags = [], facts = []) => {
  const seen = new Set();
  return normalizeListField(tags).filter((tag) => {
    const normalizedTag = normalizeJobPill(tag);
    if (!normalizedTag || seen.has(normalizedTag) || isDuplicateJobTag(tag, facts)) {
      return false;
    }
    seen.add(normalizedTag);
    return true;
  });
};

const normalizeCmsJobItems = (data) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .filter((item) => item && item.published !== false && item.title && item.slug)
    .map((item) => ({
      ...item,
      tags: normalizeListField(item.tags),
      responsibilities: normalizeListField(item.responsibilities),
      requirements: normalizeListField(item.requirements),
      documents: normalizeListField(item.documents)
    }));
};

const slugifyJobValue = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const jobSearchText = (item) => [
  item.title,
  item.type,
  item.status,
  item.level,
  item.group,
  item.area,
  item.department,
  item.location,
  item.summary,
  item.overview,
  ...(item.tags || []),
  ...(item.responsibilities || []),
  ...(item.requirements || [])
].join(' ').toLowerCase();

const matchesQuickJobFilter = (item, filter) => {
  if (filter === 'all') return true;
  const type = String(item.type || '').toLowerCase();
  const group = String(item.group || '').toLowerCase();
  const level = String(item.level || '').toLowerCase();
  const text = jobSearchText(item);
  if (filter === 'full-time') return type.includes('full');
  if (filter === 'freelance') return type.includes('freelance');
  if (filter === 'internship') return type.includes('internship') || group === 'internship';
  if (filter === 'fresh-graduate') return level.includes('fresh') || text.includes('fresh graduate');
  if (filter === 'entry-level') return level.includes('entry') || text.includes('junior');
  if (filter === 'field') return group === 'field' || text.includes('field') || text.includes('offshore') || text.includes('site');
  if (filter === 'office') return group === 'office' || group === 'support' || text.includes('office') || text.includes('corporate');
  return true;
};

const matchesJobSelect = (item, key, value) => {
  if (!value || value === 'all') return true;
  const text = jobSearchText(item);
  if (key === 'level') {
    if (value === 'fresh-graduate') return text.includes('fresh graduate') || text.includes('fresh');
    if (value === 'entry-level') return text.includes('entry level') || text.includes('junior');
    if (value === 'experienced') return text.includes('experienced') || text.includes('senior');
    if (value === 'internship') return text.includes('internship') || text.includes('active student');
  }
  const candidate = slugifyJobValue(item[key] || '');
  return candidate === value || candidate.includes(value);
};

const matchesJobFilter = (item) => {
  const searchText = jobSearchText(item);
  const queryTerms = jobFilterState.query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const queryMatches = !queryTerms.length || queryTerms.every((term) => searchText.includes(term));
  return queryMatches
    && matchesQuickJobFilter(item, jobFilterState.quick)
    && matchesJobSelect(item, 'department', jobFilterState.department)
    && matchesJobSelect(item, 'level', jobFilterState.level)
    && matchesJobSelect(item, 'type', jobFilterState.type)
    && matchesJobSelect(item, 'group', jobFilterState.group);
};

const renderJobList = (items = []) => {
  if (!items.length) return '';
  return `<ul>${items.map((item) => `<li>${markdownInlineToHtml(item)}</li>`).join('')}</ul>`;
};

const getJobApplyUrl = (item = {}) => String(item.apply_url || item.applyUrl || item.apply_link || '').trim();
const isSafeJobApplyUrl = (url = '') => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && (
        (parsed.hostname === 'docs.google.com' && parsed.pathname.startsWith('/forms/'))
        || parsed.hostname === 'forms.gle'
      );
  } catch {
    return false;
  }
};
const setJobDetailHeight = (detail) => {
  if (!detail) return;
  detail.style.setProperty('--job-detail-height', `${detail.scrollHeight + 88}px`);
};
const getDefaultJobApplyUrl = () => {
  const featuredJob = cmsJobItems.find((item) => item.featured && isSafeJobApplyUrl(getJobApplyUrl(item)));
  const firstJob = cmsJobItems.find((item) => isSafeJobApplyUrl(getJobApplyUrl(item)));
  return getJobApplyUrl(featuredJob || firstJob || {});
};
const renderJobApplyAction = (item) => {
  const applyUrl = getJobApplyUrl(item);
  if (!isSafeJobApplyUrl(applyUrl)) {
    return '<span class="career-job-apply-disabled">Apply link not available yet</span>';
  }
  return `<a href="${escapeHtml(applyUrl)}" target="_blank" rel="noopener">Apply Now <span aria-hidden="true">&rarr;</span></a>`;
};

const renderJobsEmpty = (container) => {
  const defaultApplyUrl = getDefaultJobApplyUrl();
  const applyLine = isSafeJobApplyUrl(defaultApplyUrl)
    ? `<p class="career-job-empty-action">You can still <a class="career-job-empty-apply" href="${escapeHtml(defaultApplyUrl)}" target="_blank" rel="noopener">Apply</a> through the available recruitment form.</p>`
    : '<p class="career-job-empty-action">Please check back later for an available apply form.</p>';
  container.classList.add('is-empty');
  container.innerHTML = `<article class="career-job-empty">
    <span>No available job found</span>
    <p>There is currently no available job for this search or filter selection.</p>
    ${applyLine}
  </article>`;
};

const renderCmsJobs = (items = cmsJobItems) => {
  const container = document.querySelector('[data-jobs-list]');
  if (!container) return;
  const countLabel = document.querySelector('[data-jobs-count]');
  const visibleItems = items.filter(matchesJobFilter);
  if (countLabel) {
    const countText = visibleItems.length === 0
      ? 'No openings available'
      : visibleItems.length === 1
        ? '1 opening available'
        : `${visibleItems.length} openings available`;
    countLabel.textContent = countText;
  }
  document.querySelectorAll('[data-job-filter]').forEach((button) => {
    const active = button.dataset.jobFilter === jobFilterState.quick;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-job-select]').forEach((select) => {
    const key = select.dataset.jobSelect;
    if (key && Object.prototype.hasOwnProperty.call(jobFilterState, key)) {
      select.value = jobFilterState[key];
    }
  });
  const searchInput = document.querySelector('[data-job-search]');
  if (searchInput && searchInput.value !== jobFilterState.query) {
    searchInput.value = jobFilterState.query;
  }
  if (!visibleItems.length) {
    renderJobsEmpty(container);
    return;
  }
  container.classList.remove('is-empty');
  container.innerHTML = visibleItems.map((item, index) => {
    const title = escapeHtml(item.title);
    const type = escapeHtml(item.type || 'Full Time');
    const status = escapeHtml(item.status || 'Open');
    const level = escapeHtml(item.level || '');
    const area = escapeHtml(item.area || '');
    const department = escapeHtml(item.department || '');
    const location = escapeHtml(item.location || '');
    const summary = markdownInlineToHtml(item.summary || '');
    const overview = markdownInlineToHtml(item.overview || item.summary || '');
    const factItems = [item.area, item.level, item.location].filter(Boolean);
    const tags = filterJobTags(item.tags, factItems).slice(0, 4);
    const tagsMarkup = tags.length
      ? `<div class="career-opportunity-tags">${tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join('')}</div>`
      : '';
    const cardId = `career-job-detail-${index}`;

    return `<article class="career-opportunity-card" data-job-card>
      <div class="career-opportunity-copy">
        <div class="career-opportunity-meta"><span>${type}</span><small>${status}</small></div>
        <h3>${title}</h3>
        <p>${summary}</p>
        <div class="career-opportunity-facts">
          ${area ? `<span>${area}</span>` : ''}
          ${level ? `<span>${level}</span>` : ''}
          ${location ? `<span>${location}</span>` : ''}
        </div>
        ${tagsMarkup}
        <div class="career-opportunity-actions">
          <button type="button" aria-expanded="false" aria-controls="${cardId}" data-job-toggle>View job detail</button>
          ${renderJobApplyAction(item)}
        </div>
        <div class="career-opportunity-detail" id="${cardId}" aria-hidden="true">
          <div>
            <strong>Overview</strong>
            <p>${overview}</p>
          </div>
          ${department ? `<div><strong>Department</strong><p>${department}</p></div>` : ''}
          <div class="career-opportunity-detail-grid">
            <section>
              <strong>What you may support</strong>
              ${renderJobList(item.responsibilities)}
            </section>
            <section>
              <strong>Suitable background</strong>
              ${renderJobList(item.requirements)}
            </section>
            <section>
              <strong>Prepare documents</strong>
              ${renderJobList(item.documents)}
            </section>
          </div>
        </div>
      </div>
    </article>`;
  }).join('');
};

const initCmsJobs = () => {
  const container = document.querySelector('[data-jobs-list]');
  if (!container) return;

  document.querySelectorAll('[data-job-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      jobFilterState.quick = button.dataset.jobFilter || 'all';
      renderCmsJobs(cmsJobItems);
    });
  });

  const searchInput = document.querySelector('[data-job-search]');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      jobFilterState.query = searchInput.value;
      renderCmsJobs(cmsJobItems);
    });
  }

  document.querySelectorAll('[data-job-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const key = select.dataset.jobSelect;
      if (key && Object.prototype.hasOwnProperty.call(jobFilterState, key)) {
        jobFilterState[key] = select.value || 'all';
        renderCmsJobs(cmsJobItems);
      }
    });
  });

  const clearButton = document.querySelector('[data-job-clear]');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      Object.assign(jobFilterState, {
        quick: 'all',
        query: '',
        department: 'all',
        level: 'all',
        type: 'all',
        group: 'all'
      });
      renderCmsJobs(cmsJobItems);
      searchInput?.focus();
    });
  }

  container.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-job-toggle]');
    if (!toggle) return;
    const card = toggle.closest('[data-job-card]');
    const detail = card?.querySelector('.career-opportunity-detail');
    if (!detail) return;
    const isOpen = card.classList.contains('is-open');
    setJobDetailHeight(detail);

    if (isOpen) {
      requestAnimationFrame(() => {
        card.classList.remove('is-open');
        detail.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'View job detail';
      });
      return;
    }

    card.classList.add('is-open');
    detail.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Hide job detail';
    requestAnimationFrame(() => {
      setJobDetailHeight(detail);
    });
  });

  window.addEventListener('resize', () => {
    document
      .querySelectorAll('.career-opportunity-card.is-open .career-opportunity-detail')
      .forEach(setJobDetailHeight);
  });

  fetch('data/jobs.json', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : { items: [] }))
    .then((data) => {
      cmsJobItems = normalizeCmsJobItems(data);
      renderCmsJobs(cmsJobItems);
    })
    .catch(() => {
      cmsJobItems = [];
      renderCmsJobs(cmsJobItems);
    });
};

const initCareerApplyContext = () => {
  const input = document.querySelector('[data-career-role-input]');
  if (!input) return;
  const role = new URLSearchParams(window.location.search).get('role');
  if (!role) return;
  const fallbackTitle = role
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  input.value = fallbackTitle;

  fetch('data/jobs.json', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : { items: [] }))
    .then((data) => {
      const job = normalizeCmsJobItems(data).find((item) => item.slug === role);
      if (job?.title) input.value = job.title;
    })
    .catch(() => {});
};

const careerDepartments = {
  geotechnical: {
    count: '01',
    kicker: 'Field execution',
    title: 'Geotechnical Operations',
    description: 'This department handles geotechnical field execution, including drilling, CPT, sampling, coring, offshore and onshore soil investigation, and coordination with site crews.',
    focus: [
      'Drilling, CPT, sampling, and coring activity',
      'Field crew coordination and site execution',
      'Offshore, nearshore, and onshore investigation support'
    ],
    background: [
      'Civil or geotechnical engineering',
      'Geology or earth science',
      'Field operation and drilling exposure'
    ]
  },
  geophysical: {
    count: '02',
    kicker: 'Survey and data',
    title: 'Geophysical Operations',
    description: 'This department supports marine and land geophysical survey work, including bathymetry, seismic acquisition, positioning, survey equipment operation, and field data workflow.',
    focus: [
      'Bathymetry, seismic, and positioning support',
      'Survey equipment operation and data acquisition',
      'Onboard monitoring and geophysical data workflow'
    ],
    background: [
      'Geophysics, oceanography, or marine science',
      'Surveying, hydrography, or positioning',
      'Data acquisition and processing interest'
    ]
  },
  engineering: {
    count: '03',
    kicker: 'Technical delivery',
    title: 'Engineering',
    description: 'This department supports technical planning, method preparation, engineering review, data interpretation, reporting, and deliverable quality for project execution.',
    focus: [
      'Method statement and technical planning',
      'Engineering review and interpretation support',
      'Report preparation and deliverable control'
    ],
    background: [
      'Civil, geotechnical, or ocean engineering',
      'Technical reporting and data interpretation',
      'Project engineering or design coordination'
    ]
  },
  qhse: {
    count: '04',
    kicker: 'Compliance and site control',
    title: 'QHSE',
    description: 'This department maintains quality, health, safety, and environmental control through risk assessment, inspection, compliance documentation, HSE programs, and worksite readiness.',
    focus: [
      'Risk assessment, permits, and inspection',
      'HSE program, induction, and emergency drill',
      'Compliance documentation and audit support'
    ],
    background: [
      'Occupational safety and health',
      'Environmental engineering or compliance',
      'Field HSE, audit, or safety program exposure'
    ]
  },
  facility: {
    count: '05',
    kicker: 'Asset readiness',
    title: 'Facility & Equipment Support',
    description: 'This department keeps equipment and facilities ready for field work through workshop preparation, maintenance, asset control, spare parts, logistics, and field support.',
    focus: [
      'Workshop readiness and equipment preparation',
      'Maintenance, inspection, and certification support',
      'Spare parts, logistics, and field asset availability'
    ],
    background: [
      'Mechanical, electrical, or industrial engineering',
      'Workshop, maintenance, or equipment support',
      'Logistics and asset readiness experience'
    ]
  },
  commercial: {
    count: '06',
    kicker: 'Project and client control',
    title: 'Project Control & Commercial',
    description: 'This department connects client requirements with execution through tender support, project administration, schedule tracking, cost control, contract support, and commercial coordination.',
    focus: [
      'Tender, proposal, and commercial documentation',
      'Project schedule, cost, and administration tracking',
      'Client requirement and contract coordination'
    ],
    background: [
      'Project management or industrial engineering',
      'Business administration, finance, or management',
      'Commercial, tender, or contract administration'
    ]
  },
  procurement: {
    count: '07',
    kicker: 'Supply and purchasing',
    title: 'Procurement',
    description: 'This department supports project and office needs through vendor coordination, purchasing administration, quotation comparison, material follow-up, and delivery readiness.',
    focus: [
      'Purchase request and supplier coordination',
      'Quotation comparison and purchasing records',
      'Material follow-up and delivery readiness'
    ],
    background: [
      'Procurement or supply chain',
      'Business administration or logistics',
      'Vendor management and purchasing support'
    ]
  },
  marketing: {
    count: '08',
    kicker: 'Market visibility',
    title: 'Marketing & Client Relations',
    description: 'This department builds THI visibility through company profiles, client communication, proposal support, project references, and business presentation material.',
    focus: [
      'Company profile and project reference material',
      'Client communication and market visibility',
      'Proposal support and business communication'
    ],
    background: [
      'Marketing, communication, or business',
      'Proposal writing or client relation support',
      'Visual documentation and company presentation'
    ]
  },
  finance: {
    count: '09',
    kicker: 'Financial discipline',
    title: 'Finance & Accounting',
    description: 'This department manages financial control, accounting records, project cost administration, invoicing support, payment tracking, and financial reporting.',
    focus: [
      'Accounting records and financial reporting',
      'Project cost administration and invoicing',
      'Payment tracking and budget support'
    ],
    background: [
      'Accounting, finance, or tax',
      'Project finance administration',
      'Financial reporting and data discipline'
    ]
  },
  hr: {
    count: '10',
    kicker: 'People operations',
    title: 'Human Resources',
    description: 'This department supports recruitment, employee administration, personnel development, training coordination, and people-related needs across office and field teams.',
    focus: [
      'Recruitment and employee data coordination',
      'Employee administration and personnel data',
      'Training, development, and people support'
    ],
    background: [
      'Human resources or psychology',
      'Recruitment and people administration',
      'Training coordination or HR operations'
    ]
  },
  ga: {
    count: '11',
    kicker: 'Company support',
    title: 'General Affairs',
    description: 'This department supports daily company operations through office administration, facility needs, internal services, document support, and general office coordination.',
    focus: [
      'Office operations and administration',
      'Facility support and internal services',
      'Daily company needs and document support'
    ],
    background: [
      'Business administration or management',
      'Office operations and facility support',
      'General administration and internal services'
    ]
  }
};

const careerDepartmentPanel = document.querySelector('.career-department-panel');
const careerDepartmentTabs = [...document.querySelectorAll('[data-career-department]')];

const renderCareerList = (target, items = []) => {
  if (!target) return;
  target.replaceChildren(...items.map((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    return listItem;
  }));
};

const updateCareerDepartment = (key) => {
  const department = careerDepartments[key];
  if (!department || !careerDepartmentPanel) return;

  careerDepartmentPanel.classList.add('is-changing');
  window.setTimeout(() => {
    careerDepartmentPanel.querySelector('[data-career-count]').textContent = department.count;
    careerDepartmentPanel.querySelector('[data-career-kicker]').textContent = department.kicker;
    careerDepartmentPanel.querySelector('[data-career-title]').textContent = department.title;
    careerDepartmentPanel.querySelector('[data-career-description]').textContent = department.description;
    renderCareerList(careerDepartmentPanel.querySelector('[data-career-focus]'), department.focus);
    renderCareerList(careerDepartmentPanel.querySelector('[data-career-background]'), department.background);
    careerDepartmentTabs.forEach((tab) => {
      const active = tab.dataset.careerDepartment === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    careerDepartmentPanel.classList.remove('is-changing');
  }, 140);
};

careerDepartmentTabs.forEach((tab) => {
  tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
  tab.addEventListener('click', () => updateCareerDepartment(tab.dataset.careerDepartment));
});

const heroSlides = [...document.querySelectorAll('.hero-slide')];
const heroDots = [...document.querySelectorAll('.hero-pagination button')];
const heroCount = document.querySelector('.hero-slide-count strong');
const heroContent = document.querySelector('.hero-content');
const heroEyebrow = heroContent?.querySelector('.eyebrow b');
const heroTitle = heroContent?.querySelector('h1');
const heroCopy = heroContent?.querySelector('.hero-copy');
const heroPrimaryLink = heroContent?.querySelector('.button.primary');
const heroPrimaryLabel = heroPrimaryLink?.querySelector('b');
const heroSecondaryLink = heroContent?.querySelector('.text-link');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeHeroSlide = 0;
let heroTimer;
let heroTextTimer;

const heroContentData = {
  en: [
    {
      eyebrow: 'Geotechnical',
      title: 'Offshore and onshore.<br><em>Ground certainty.</em>',
      copy: 'Taka Hydrocore delivers drilling, CPT, sampling, coring, and soil investigation services configured around site condition, access, and project objectives.',
      cta: 'View geotechnical service',
      href: 'services.html#offshore-geotechnical',
      secondary: 'Discuss a project <span>→</span>',
      secondaryHref: 'contact.html'
    },
    {
      eyebrow: 'Geophysical',
      title: 'Marine acquisition.<br><em>Clearer seabed decisions.</em>',
      copy: 'Voyager Explorer supports marine geophysical survey, seabed mapping, seismic acquisition, and offshore data workflows for better technical decisions.',
      cta: 'View geophysical service',
      href: 'services.html#marine-seismic',
      secondary: 'Discuss a project <span>→</span>',
      secondaryHref: 'contact.html'
    },
    {
      eyebrow: 'HSE',
      title: 'Safety discipline.<br><em>Reliable field execution.</em>',
      copy: 'THI prepares people, equipment, and work methods around HSE controls so technical delivery is supported by safer operational behavior.',
      cta: 'View HSE',
      href: 'hse.html',
      secondary: '',
      secondaryHref: ''
    }
  ],
  id: [
    {
      eyebrow: 'Geoteknik',
      title: 'Offshore dan onshore.<br><em>Kepastian kondisi tanah.</em>',
      copy: 'Taka Hydrocore menyediakan drilling, CPT, sampling, coring, dan investigasi tanah yang dikonfigurasi berdasarkan kondisi site, akses, dan tujuan proyek.',
      cta: 'Lihat layanan geoteknik',
      href: 'services.html#offshore-geotechnical',
      secondary: 'Diskusikan proyek <span>→</span>',
      secondaryHref: 'contact.html'
    },
    {
      eyebrow: 'Geofisika',
      title: 'Akuisisi marine.<br><em>Keputusan seabed lebih jelas.</em>',
      copy: 'Voyager Explorer mendukung survei geofisika marine, pemetaan seabed, akuisisi seismik, dan workflow data offshore untuk keputusan teknis yang lebih baik.',
      cta: 'Lihat layanan geofisika',
      href: 'services.html#marine-seismic',
      secondary: 'Diskusikan proyek <span>→</span>',
      secondaryHref: 'contact.html'
    },
    {
      eyebrow: 'HSE',
      title: 'Disiplin keselamatan.<br><em>Eksekusi lapangan andal.</em>',
      copy: 'THI menyiapkan personel, peralatan, dan metode kerja berdasarkan kontrol HSE agar delivery teknis didukung perilaku operasi yang lebih aman.',
      cta: 'Lihat HSE',
      href: 'hse.html',
      secondary: '',
      secondaryHref: ''
    }
  ]
};

const updateHeroContent = (index, immediate = false) => {
  if (!heroContent || !heroEyebrow || !heroTitle || !heroCopy || !heroPrimaryLabel || !heroPrimaryLink) return;
  const content = (heroContentData[activeLanguage] || heroContentData.en)[index];
  window.clearTimeout(heroTextTimer);
  heroContent.classList.add('is-changing');
  heroTextTimer = window.setTimeout(() => {
    heroEyebrow.textContent = content.eyebrow;
    heroTitle.innerHTML = content.title;
    heroCopy.textContent = content.copy;
    heroPrimaryLabel.textContent = content.cta;
    heroPrimaryLink.href = content.href;
    if (heroSecondaryLink) {
      heroSecondaryLink.innerHTML = content.secondary || '';
      heroSecondaryLink.href = content.secondaryHref || '#';
      heroSecondaryLink.hidden = !content.secondary;
    }
    heroContent.classList.remove('is-changing');
  }, immediate || reduceMotion.matches ? 0 : 360);
};

const startHeroSlideshow = () => {
  window.clearInterval(heroTimer);
  if (!heroSlides.length || reduceMotion.matches || document.hidden) return;
  heroTimer = window.setInterval(() => showHeroSlide(activeHeroSlide + 1, false), 7000);
};

const showHeroSlide = (index, restart = true) => {
  if (!heroSlides.length) return;
  activeHeroSlide = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeHeroSlide;
    slide.classList.toggle('active', isActive);
    const video = slide.querySelector('video');
    if (!video) return;
    if (isActive && !reduceMotion.matches && shouldLoadVideo(video)) {
      scheduleHeroVideoLoad(video);
      if (video.getAttribute('src')) video.play().catch(() => {});
      else video.addEventListener('loadeddata', () => video.play().catch(() => {}), { once: true });
    }
    else video.pause();
  });
  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeHeroSlide;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
  if (heroCount) heroCount.textContent = String(activeHeroSlide + 1).padStart(2, '0');
  updateHeroContent(activeHeroSlide);
  if (restart) startHeroSlideshow();
};

document.querySelector('.hero-prev')?.addEventListener('click', () => showHeroSlide(activeHeroSlide - 1));
document.querySelector('.hero-next')?.addEventListener('click', () => showHeroSlide(activeHeroSlide + 1));
heroDots.forEach((dot, index) => dot.addEventListener('click', () => showHeroSlide(index)));
document.addEventListener('visibilitychange', startHeroSlideshow);
reduceMotion.addEventListener('change', startHeroSlideshow);
startHeroSlideshow();

const careerIndexSlides = [...document.querySelectorAll('.career-index-slide')];
const careerIndexDots = [...document.querySelectorAll('.career-index-pagination button')];
const careerIndexCount = document.querySelector('.career-index-slide-count strong');
let activeCareerIndexSlide = 0;
let careerIndexTimer;

const startCareerIndexHero = () => {
  window.clearInterval(careerIndexTimer);
  if (!careerIndexSlides.length || reduceMotion.matches || document.hidden) return;
  careerIndexTimer = window.setInterval(() => showCareerIndexSlide(activeCareerIndexSlide + 1, false), 7000);
};

const showCareerIndexSlide = (index, restart = true) => {
  if (!careerIndexSlides.length) return;
  activeCareerIndexSlide = (index + careerIndexSlides.length) % careerIndexSlides.length;
  careerIndexSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeCareerIndexSlide;
    slide.classList.toggle('active', isActive);
    const video = slide.querySelector('video');
    if (!video) return;
    if (isActive && !reduceMotion.matches && shouldLoadVideo(video)) {
      scheduleHeroVideoLoad(video);
      if (video.getAttribute('src')) video.play().catch(() => {});
      else video.addEventListener('loadeddata', () => video.play().catch(() => {}), { once: true });
    }
    else video.pause();
  });
  careerIndexDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeCareerIndexSlide;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
  if (careerIndexCount) careerIndexCount.textContent = String(activeCareerIndexSlide + 1).padStart(2, '0');
  if (restart) startCareerIndexHero();
};

document.querySelector('.career-index-prev')?.addEventListener('click', () => showCareerIndexSlide(activeCareerIndexSlide - 1));
document.querySelector('.career-index-next')?.addEventListener('click', () => showCareerIndexSlide(activeCareerIndexSlide + 1));
careerIndexDots.forEach((dot, index) => dot.addEventListener('click', () => showCareerIndexSlide(index)));
document.addEventListener('visibilitychange', startCareerIndexHero);
reduceMotion.addEventListener('change', startCareerIndexHero);
careerIndexSlides.forEach((slide, index) => {
  slide.querySelector('video')?.addEventListener('ended', () => {
    if (index === activeCareerIndexSlide) showCareerIndexSlide(activeCareerIndexSlide + 1);
  });
});
showCareerIndexSlide(0, false);
startCareerIndexHero();

const initQhseSlideshow = () => {
  const qhseSlides = [...document.querySelectorAll('.qhse-slide')];
  const qhseDots = [...document.querySelectorAll('.qhse-slide-controls button')];
  if (!qhseSlides.length) return;

  let activeQhseSlide = qhseSlides.findIndex((slide) => slide.classList.contains('active'));
  let qhseTimer;
  if (activeQhseSlide < 0) activeQhseSlide = 0;

  const showQhseSlide = (index, restart = true) => {
    activeQhseSlide = (index + qhseSlides.length) % qhseSlides.length;
    qhseSlides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === activeQhseSlide));
    qhseDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeQhseSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
    if (restart) startQhseSlideshow();
  };

  const startQhseSlideshow = () => {
    window.clearInterval(qhseTimer);
    if (reduceMotion.matches || document.hidden) return;
    qhseTimer = window.setInterval(() => showQhseSlide(activeQhseSlide + 1, false), 5200);
  };

  qhseDots.forEach((dot, index) => dot.addEventListener('click', () => showQhseSlide(index)));
  document.querySelector('.qhse-slide-controls')?.addEventListener('click', (event) => {
    const dot = event.target.closest('button');
    if (!dot) return;
    const index = qhseDots.indexOf(dot);
    if (index >= 0) showQhseSlide(index);
  });
  document.addEventListener('visibilitychange', startQhseSlideshow);
  reduceMotion.addEventListener('change', startQhseSlideshow);
  showQhseSlide(activeQhseSlide, false);
  startQhseSlideshow();
};

initQhseSlideshow();

let refreshAboutSlideshowLanguage = () => {};

const initAboutSlideshow = () => {
  const slideshow = document.querySelector('[data-about-slideshow]');
  if (!slideshow) return;

  const slides = [...slideshow.querySelectorAll('.intro-slide')];
  const dots = [...slideshow.querySelectorAll('.intro-slide-controls button')];
  const caption = slideshow.querySelector('.intro-slide-caption');
  const captionLabel = caption?.querySelector('span');
  const captionCopy = caption?.querySelector('strong');
  if (slides.length < 2) return;

  let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let timer;
  let captionTimer;

  const getLocalized = (slide, key) => slide.dataset[`${key}${activeLanguage === 'id' ? 'Id' : ''}`] || slide.dataset[key] || '';

  const updateCaption = (animate = true) => {
    const slide = slides[activeSlide];
    if (!slide || !caption || !captionLabel || !captionCopy) return;

    window.clearTimeout(captionTimer);
    caption.classList.toggle('is-changing', animate && !reduceMotion.matches);
    captionTimer = window.setTimeout(() => {
      captionLabel.textContent = getLocalized(slide, 'caption');
      captionCopy.textContent = getLocalized(slide, 'copy');
      caption.classList.remove('is-changing');
    }, animate && !reduceMotion.matches ? 260 : 0);
  };

  const showSlide = (nextIndex, restart = true) => {
    activeSlide = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeSlide;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    updateCaption();
    if (restart) startSlideshow();
  };

  const startSlideshow = () => {
    window.clearInterval(timer);
    if (reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(() => showSlide(activeSlide + 1, false), 5200);
  };

  refreshAboutSlideshowLanguage = () => updateCaption(false);
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  document.addEventListener('visibilitychange', startSlideshow);
  reduceMotion.addEventListener('change', startSlideshow);
  showSlide(activeSlide, false);
  startSlideshow();
};

initAboutSlideshow();

const initVesselDetailSlideshows = () => {
  const slideshows = [...document.querySelectorAll('[data-vessel-slideshow]')];
  if (!slideshows.length) return;

  slideshows.forEach((slideshow, slideshowIndex) => {
    const slides = [...slideshow.querySelectorAll('.vessel-slide')];
    const dots = [...slideshow.querySelectorAll('.vessel-slide-controls button')];
    if (slides.length < 2) return;

    let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer;

    const showSlide = (nextIndex, restart = true) => {
      activeSlide = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const isActive = index === activeSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach((dot, index) => {
        const isActive = index === activeSlide;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
      if (restart) startSlideshow();
    };

    const startSlideshow = () => {
      window.clearInterval(timer);
      if (reduceMotion.matches || document.hidden) return;
      timer = window.setInterval(() => showSlide(activeSlide + 1, false), 5600 + (slideshowIndex * 350));
    };

    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    document.addEventListener('visibilitychange', startSlideshow);
    reduceMotion.addEventListener('change', startSlideshow);
    showSlide(activeSlide, false);
    startSlideshow();
  });
};

initVesselDetailSlideshows();

const initEquipmentDetailSlideshows = () => {
  const slideshows = [...document.querySelectorAll('[data-equipment-slideshow]')];
  if (!slideshows.length) return;

  slideshows.forEach((slideshow, slideshowIndex) => {
    const slides = [...slideshow.querySelectorAll('.equipment-detail-slide')];
    const dots = [...slideshow.querySelectorAll('.equipment-slide-controls button')];
    if (slides.length < 2) return;

    let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer;

    const showSlide = (nextIndex, restart = true) => {
      activeSlide = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const isActive = index === activeSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach((dot, index) => {
        const isActive = index === activeSlide;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
      if (restart) startSlideshow();
    };

    const startSlideshow = () => {
      window.clearInterval(timer);
      if (reduceMotion.matches || document.hidden) return;
      timer = window.setInterval(() => showSlide(activeSlide + 1, false), 5000 + (slideshowIndex * 280));
    };

    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    document.addEventListener('visibilitychange', startSlideshow);
    reduceMotion.addEventListener('change', startSlideshow);
    showSlide(activeSlide, false);
    startSlideshow();
  });
};

initEquipmentDetailSlideshows();

let refreshEquipmentCarouselLanguage = () => {};

const vesselImagesByKey = {
  geodrill: 'assets/optimized/images/assets-vessels-source-kapal-geodrill-dari-atas-0eecda32-1400.webp',
  barakuda: 'assets/optimized/images/assets-ss-barakuda-dji-0131-286e8b27-1400.webp',
  voyager: 'assets/optimized/images/assets-vessels-source-pemandangan-dari-dalam-kapal-53539df7-1400.webp'
};

const vesselDetails = {
  geodrill: {
    imageIndex: 0,
    title: 'AG Geodrill',
    description: 'A purpose-built geotechnical survey vessel supporting offshore soil investigation and drilling operations with stable, integrated field systems.',
    details: [['Platform', 'Geotechnical Survey Vessel'], ['Core capability', 'Offshore Soil Investigation'], ['System', 'Heave Compensated Drilling']],
    facts: [['Vessel type', 'Geotechnical Survey'], ['Primary scope', 'Soil Investigation'], ['Drilling', 'Heave Compensated'], ['Environment', 'Offshore'], ['Data', 'Geotechnical'], ['Operator', 'Taka Hydrocore']]
  },
  barakuda: {
    imageIndex: 1,
    title: 'SS Barakuda',
    description: 'A versatile marine survey vessel configured for high-resolution seismic and geophysical data acquisition across offshore survey campaigns.',
    details: [['Platform', 'Marine Survey Vessel'], ['Core capability', '2D/3D HR Marine Seismic'], ['Operation', 'Geophysical Data Acquisition']],
    facts: [['Vessel type', 'Marine Survey'], ['Primary scope', '2D/3D HR Seismic'], ['Operation', 'Data Acquisition'], ['Environment', 'Offshore'], ['Data', 'Geophysical'], ['Operator', 'Taka Hydrocore']]
  },
  voyager: {
    imageIndex: 2,
    title: 'Voyager Explorer',
    description: 'Voyager Explorer is a seismic and geophysical survey vessel equipped with modern technology for seabed mapping, high-quality data acquisition, onboard data processing, and field support facilities for oil and gas, marine, and subsea infrastructure projects.',
    details: [['Platform', 'Seismic and Geophysical Vessel'], ['Core capability', 'Subsea Mapping'], ['System', 'Onboard Data Acquisition & Processing']],
    facts: [['Vessel type', 'Seismic & Geophysical'], ['Primary scope', 'Subsea Mapping'], ['Acquisition', 'High-quality Data System'], ['Processing', 'Onboard Data Processing'], ['Support', 'Field Facilities'], ['Industries', 'Oil & Gas / Marine / Subsea Infrastructure']]
  }
};

const vesselDetailsId = {
  geodrill: {
    imageIndex: 0,
    title: 'AG Geodrill',
    description: 'Kapal survei geoteknik yang mendukung investigasi tanah offshore dan operasi pengeboran dengan sistem lapangan yang stabil dan terintegrasi.',
    details: [['Platform', 'Kapal Survei Geoteknik'], ['Kapabilitas utama', 'Investigasi Tanah Offshore'], ['Sistem', 'Pengeboran Heave Compensated']],
    facts: [['Tipe kapal', 'Survei Geoteknik'], ['Lingkup utama', 'Investigasi Tanah'], ['Pengeboran', 'Heave Compensated'], ['Lingkungan', 'Offshore'], ['Data', 'Geoteknik'], ['Operator', 'Taka Hydrocore']]
  },
  barakuda: {
    imageIndex: 1,
    title: 'SS Barakuda',
    description: 'Kapal survei laut serbaguna yang dikonfigurasi untuk akuisisi data seismik resolusi tinggi dan geofisika pada kampanye survei offshore.',
    details: [['Platform', 'Kapal Survei Laut'], ['Kapabilitas utama', 'Seismik Laut HR 2D/3D'], ['Operasi', 'Akuisisi Data Geofisika']],
    facts: [['Tipe kapal', 'Survei Laut'], ['Lingkup utama', 'Seismik HR 2D/3D'], ['Operasi', 'Akuisisi Data'], ['Lingkungan', 'Offshore'], ['Data', 'Geofisika'], ['Operator', 'Taka Hydrocore']]
  },
  voyager: {
    imageIndex: 2,
    title: 'Voyager Explorer',
    description: 'Voyager Explorer adalah kapal survei seismik dan geofisika yang dilengkapi teknologi modern untuk pemetaan bawah laut, akuisisi data berkualitas tinggi, pemrosesan data di atas kapal, serta fasilitas pendukung pekerjaan lapangan untuk proyek minyak dan gas, kelautan, dan infrastruktur bawah laut.',
    details: [['Platform', 'Kapal Seismik dan Geofisika'], ['Kapabilitas utama', 'Pemetaan Bawah Laut'], ['Sistem', 'Akuisisi & Pemrosesan Data di Atas Kapal']],
    facts: [['Tipe kapal', 'Seismik & Geofisika'], ['Lingkup utama', 'Pemetaan Bawah Laut'], ['Akuisisi', 'Sistem Data Berkualitas Tinggi'], ['Pemrosesan', 'Pemrosesan Data di Atas Kapal'], ['Dukungan', 'Fasilitas Lapangan'], ['Industri', 'Migas / Kelautan / Infrastruktur Bawah Laut']]
  }
};

const getVesselDetails = (key) => (activeLanguage === 'id' ? vesselDetailsId : vesselDetails)[key];

const vesselData = document.querySelector('#vessel-data');
const vesselDetailButton = document.querySelector('.vessel-detail-button');
const vesselLiveTitle = document.querySelector('.vessel-live-title');
const vesselImages = [...document.querySelectorAll('.fleet-image-layer')];
const marineSection = document.querySelector('.marine-assets');
const vesselPageLinksByKey = {
  geodrill: 'vessel.html#ag-geodrill',
  barakuda: 'vessel.html#ss-barakuda',
  voyager: 'vessel.html#voyager-explorer'
};
let vesselTransitionTimer;

const renderVesselSummary = (key, animate = true) => {
  const vessel = getVesselDetails(key);
  if (!vessel) return;
  if (vesselLiveTitle) vesselLiveTitle.textContent = vessel.title;
  vesselImages.forEach((image, index) => image.classList.toggle('active', index === vessel.imageIndex));
  if (animate) {
    vesselData?.classList.add('is-changing');
    vesselDetailButton?.classList.add('is-changing');
  }
  window.clearTimeout(vesselTransitionTimer);
  const delay = animate ? 260 : 0;
  vesselTransitionTimer = window.setTimeout(() => {
    if (vesselData) {
      vesselData.innerHTML = vessel.details
        .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
      vesselData.classList.remove('is-changing');
    }
    if (vesselDetailButton) {
      vesselDetailButton.dataset.vesselDetail = key;
      if (vesselDetailButton instanceof HTMLAnchorElement) {
        vesselDetailButton.href = vesselPageLinksByKey[key] || vesselDetailButton.href;
      }
      vesselDetailButton.querySelector('b').textContent = activeLanguage === 'id'
        ? `Detail ${vessel.title}`
        : `${vessel.title} details`;
      vesselDetailButton.classList.remove('is-changing');
    }
    window.setTimeout(() => marineSection?.classList.remove('is-switching'), animate ? 420 : 0);
  }, delay);
};

document.querySelectorAll('.vessel-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.classList.contains('active')) return;
    const vessel = getVesselDetails(button.dataset.vessel);
    if (!vessel) return;
    marineSection?.classList.add('is-switching');
    document.querySelectorAll('.vessel-tabs button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderVesselSummary(button.dataset.vessel);
  });
});

const vesselModal = document.querySelector('#vessel-modal');
const closeVesselModal = () => {
  if (!vesselModal) return;
  vesselModal.hidden = true;
  document.body.classList.remove('modal-open');
};

const openVesselModal = (key) => {
  if (!vesselModal) return;
  const vessel = getVesselDetails(key);
  if (!vessel) return;
  const modalImage = vesselModal.querySelector('.vessel-modal-image');
  modalImage.style.backgroundImage = `url('${vesselImagesByKey[key]}')`;
  modalImage.setAttribute('aria-label', `${vessel.title} at sea`);
  vesselModal.querySelector('#vessel-modal-title').textContent = vessel.title;
  vesselModal.querySelector('.vessel-modal-description').textContent = vessel.description;
  vesselModal.querySelector('.vessel-modal-facts').innerHTML = vessel.facts
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  vesselModal.hidden = false;
  document.body.classList.add('modal-open');
  vesselModal.querySelector('.vessel-modal-close').focus();
};

vesselDetailButton?.addEventListener('click', (event) => {
  if (event.currentTarget instanceof HTMLAnchorElement && event.currentTarget.getAttribute('href')) return;
  openVesselModal(event.currentTarget.dataset.vesselDetail);
});
vesselModal?.querySelectorAll('.vessel-modal-close, .vessel-modal-backdrop')
  .forEach((button) => button.addEventListener('click', closeVesselModal));

const revealElements = [...document.querySelectorAll('.reveal')];
const revealElement = (element) => {
  element.classList.add('visible');
  observer?.unobserve(element);
};
const shouldRevealNow = (element) => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * -0.18;
};
const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && entry.intersectionRatio <= 0) return;
      revealElement(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 })
  : null;

const updateRevealElements = () => {
  revealElements.forEach((element) => {
    if (element.classList.contains('visible')) return;
    if (shouldRevealNow(element)) revealElement(element);
  });
};

revealElements.forEach((element) => {
  if (observer) observer.observe(element);
});
updateRevealElements();
window.addEventListener('scroll', updateRevealElements, { passive: true });
window.addEventListener('resize', updateRevealElements);

const projectData = {
  angola: {
    category: 'Marine Geotechnical / Angola',
    client: 'RINA Consulting SpA',
    title: 'Marine Geotech Site Survey – Jackup Installation, Block 3/05',
    description: 'Provision of marine geotechnical site survey for jackup drilling unit installation in Block 3/05, Angola.',
    facts: [['Year', '2025'], ['Location', 'Block 3/05, Angola'], ['Scope', 'Marine Geotechnical Site Survey']]
  },
  keppel: {
    category: 'Submarine Cable Route Survey',
    client: 'Keppel Energy Pte Ltd',
    title: 'Crescent Project – Indonesia Cable Route Survey',
    description: 'Submarine HVAC cable route survey in Indonesia for the Keppel Crescent Project, supporting cable installation planning and seabed assessment.',
    facts: [['Year', '2025'], ['Client', 'Keppel Energy Pte Ltd'], ['Scope', 'Cable Route Survey']]
  },
  karimun: {
    category: 'Geophysical & Vibrocore Survey',
    client: 'Karimun Besar Project',
    title: 'Geophysical & Vibrocore Survey – Karimun Besar',
    description: 'Execution of geophysical and vibrocore survey works at Karimun Besar Island, Riau Islands, Indonesia.',
    facts: [['Year', '2025'], ['Location', 'Karimun Besar, Riau Islands'], ['Scope', 'Geophysical & Vibrocore Survey']]
  }
};

const projectDataId = {
  angola: {
    category: 'Geoteknik Laut / Angola',
    client: 'RINA Consulting SpA',
    title: 'Survei Geoteknik Laut – Instalasi Jackup, Blok 3/05',
    description: 'Penyediaan survei geoteknik laut untuk instalasi unit pengeboran jackup di Blok 3/05, Angola.',
    facts: [['Tahun', '2025'], ['Lokasi', 'Blok 3/05, Angola'], ['Lingkup', 'Survei Geoteknik Laut']]
  },
  keppel: {
    category: 'Survei Rute Kabel Bawah Laut',
    client: 'Keppel Energy Pte Ltd',
    title: 'Proyek Crescent – Survei Rute Kabel Indonesia',
    description: 'Survei rute kabel HVAC bawah laut di Indonesia untuk Proyek Keppel Crescent, mendukung perencanaan instalasi kabel dan penilaian dasar laut.',
    facts: [['Tahun', '2025'], ['Klien', 'Keppel Energy Pte Ltd'], ['Lingkup', 'Survei Rute Kabel']]
  },
  karimun: {
    category: 'Survei Geofisika & Vibrocore',
    client: 'Proyek Karimun Besar',
    title: 'Survei Geofisika & Vibrocore – Karimun Besar',
    description: 'Pelaksanaan pekerjaan survei geofisika dan vibrocore di Pulau Karimun Besar, Kepulauan Riau, Indonesia.',
    facts: [['Tahun', '2025'], ['Lokasi', 'Karimun Besar, Kepulauan Riau'], ['Lingkup', 'Survei Geofisika & Vibrocore']]
  }
};

const getProjectData = (key) => (activeLanguage === 'id' ? projectDataId : projectData)[key];

const projectModal = document.querySelector('#project-modal');
const closeProjectModal = () => {
  if (!projectModal) return;
  projectModal.hidden = true;
  delete projectModal.dataset.projectKey;
  document.body.classList.remove('modal-open');
};

const openProjectModal = (key) => {
  if (!projectModal) return;
  const project = getProjectData(key);
  if (!project) return;
  projectModal.dataset.projectKey = key;
  projectModal.querySelector('.project-modal-category').textContent = project.category;
  projectModal.querySelector('.project-modal-client').textContent = `${activeLanguage === 'id' ? 'Klien' : 'Client'} · ${project.client}`;
  projectModal.querySelector('#project-modal-title').textContent = project.title;
  projectModal.querySelector('.project-modal-description').textContent = project.description;
  projectModal.querySelector('.project-modal-facts').innerHTML = project.facts
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  projectModal.hidden = false;
  document.body.classList.add('modal-open');
  projectModal.querySelector('.project-modal-close').focus();
};

document.querySelectorAll('[data-project]').forEach((card) => {
  card.addEventListener('click', () => {
    if (card instanceof HTMLAnchorElement && card.getAttribute('href')) return;
    openProjectModal(card.dataset.project);
  });
  card.addEventListener('keydown', (event) => {
    if (card instanceof HTMLAnchorElement && card.getAttribute('href')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectModal(card.dataset.project);
    }
  });
});

projectModal?.querySelectorAll('.project-modal-close, .project-modal-backdrop')
  .forEach((button) => button.addEventListener('click', closeProjectModal));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (vesselModal && !vesselModal.hidden) closeVesselModal();
  else if (projectModal && !projectModal.hidden) closeProjectModal();
});

const getActiveVesselKey = () => document.querySelector('.vessel-tabs button.active')?.dataset.vessel || 'geodrill';
const getOpenProjectKey = () => document.querySelector('[data-project].is-open')?.dataset.project;

const setMenuLabels = () => {
  if (!menuButton) return;
  const open = nav?.classList.contains('open');
  menuButton.setAttribute('aria-label', activeLanguage === 'id'
    ? (open ? 'Tutup menu' : 'Buka menu')
    : (open ? 'Close menu' : 'Open menu'));
};

const applyLanguage = (language, persist = true) => {
  activeLanguage = supportedLanguages.includes(language) ? language : 'en';
  document.documentElement.lang = activeLanguage === 'id' ? 'id' : 'en';
  if (persist) localStorage.setItem('taka-language', activeLanguage);

  languageButtons.forEach((button) => {
    const isActive = button.dataset.langSwitch === activeLanguage;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  staticTranslations.forEach(([selector, en, id, mode]) => {
    setElementContent(selector, activeLanguage === 'id' ? id : en, mode);
  });
  applyBoardLanguage(activeLanguage);
  applyCompanyProfileLanguage(activeLanguage);
  applyServicesLanguage(activeLanguage);
  applyEquipmentPageLanguage(activeLanguage);
  refreshEquipmentCarouselLanguage();
  applyVesselPageLanguage(activeLanguage);
  applyQualityPageLanguage(activeLanguage);
  applyHsePageLanguage(activeLanguage);
  applyQhsePageLanguage(activeLanguage);
  applyProjectPageLanguage(activeLanguage);
  applyContactPageLanguage(activeLanguage);
  applyNewsPageLanguage(activeLanguage);
  refreshAboutSlideshowLanguage();
  renderCmsNewsCards(cmsNewsItems);
  renderCmsNewsDetail(cmsNewsItems);

  document.querySelectorAll('select[name="service"] option').forEach((option, index) => {
    option.textContent = serviceOptionTranslations[activeLanguage][index] || option.textContent;
  });

  updateHeroContent(activeHeroSlide, true);
  renderVesselSummary(getActiveVesselKey(), false);

  if (vesselModal && !vesselModal.hidden) {
    openVesselModal(vesselDetailButton?.dataset.vesselDetail || getActiveVesselKey());
  }

  if (projectModal && !projectModal.hidden) {
    const activeProject = projectModal.dataset.projectKey;
    if (activeProject) openProjectModal(activeProject);
  }

  setMenuLabels();
};

languageButtons.forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.langSwitch));
});

const contactFormCooldownMs = 15000;

document.querySelectorAll('.contact-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const honeypotValue = String(data.get('website') || '').trim();
    const submitButton = form.querySelector('button[type="submit"]');
    const helper = form.querySelector('.form-submit p');
    const now = Date.now();
    const lastSubmit = Number(form.dataset.lastSubmit || 0);
    const remaining = contactFormCooldownMs - (now - lastSubmit);

    if (honeypotValue) {
      return;
    }

    if (remaining > 0) {
      if (helper) {
        helper.textContent = activeLanguage === 'id'
          ? `Mohon tunggu ${Math.ceil(remaining / 1000)} detik sebelum mengirim enquiry lagi.`
          : `Please wait ${Math.ceil(remaining / 1000)} seconds before sending another enquiry.`;
      }
      return;
    }

    form.dataset.lastSubmit = String(now);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-cooling-down');
    }

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-cooling-down');
      }
      if (helper) {
        helper.textContent = activeLanguage === 'id'
          ? 'Email client Anda akan terbuka dengan enquiry yang sudah disiapkan.'
          : 'Your email client will open with a prepared enquiry.';
      }
    }, contactFormCooldownMs);

    const subject = encodeURIComponent(`${activeLanguage === 'id' ? 'Enquiry Proyek' : 'Project Enquiry'} - ${data.get('company') || data.get('name')}`);
    const body = encodeURIComponent(
      activeLanguage === 'id'
        ? `Nama: ${data.get('name')}\nEmail: ${data.get('email')}\nPerusahaan: ${data.get('company') || '-'}\nLayanan: ${data.get('service')}\nLokasi: ${data.get('location') || '-'}\n\nRingkasan Proyek:\n${data.get('message')}`
        : `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company') || '-'}\nService: ${data.get('service')}\nLocation: ${data.get('location') || '-'}\n\nProject Message:\n${data.get('message')}`
    );
    window.location.href = `mailto:marketing@thi.co.id?subject=${subject}&body=${body}`;
  });
});

document.querySelectorAll('.career-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim() || '-';
    const fullName = value('Full Name');
    const careerArea = value('Career Area');
    const subject = encodeURIComponent(`Career Application - ${fullName} - ${careerArea}`);
    const body = encodeURIComponent([
      'Dear Taka Hydrocore Recruitment Team,',
      '',
      'I would like to submit my profile for career consideration at PT Taka Hydrocore Indonesia.',
      '',
      'Applicant Details',
      '-----------------',
      `Full Name: ${fullName}`,
      `Email: ${value('Email')}`,
      `Phone: ${value('Phone')}`,
      `Career Area: ${careerArea}`,
      `Experience Level: ${value('Experience Level')}`,
      `Current Location: ${value('Current Location')}`,
      `Opportunity Interest: ${value('Opportunity Interest')}`,
      `LinkedIn Link: ${value('LinkedIn Link')}`,
      `CV Link: ${value('CV Link')}`,
      '',
      'Message',
      '-------',
      value('Message'),
      '',
      'Thank you.',
    ].join('\n'));

    window.location.href = `mailto:marketing@thi.co.id?subject=${subject}&body=${body}`;
  });
});

document.querySelectorAll('[data-feature-gallery]').forEach((gallery) => {
  const feature = gallery.querySelector('.service-gallery-feature');
  const featureImage = gallery.querySelector('[data-gallery-feature-image]');
  const featureCaption = gallery.querySelector('[data-gallery-feature-caption]');
  const items = [...gallery.querySelectorAll('.service-gallery-grid figure')];
  let activeServiceSlide = Math.max(0, items.findIndex((item) => item.classList.contains('is-selected')));

  const syncFeatureImage = (selectedImage) => {
    if (!featureImage || !selectedImage) return;

    const source = selectedImage.currentSrc || selectedImage.getAttribute('src') || selectedImage.src;
    const sourceSet = selectedImage.getAttribute('srcset');
    const sizes = selectedImage.getAttribute('sizes');

    if (sourceSet) featureImage.setAttribute('srcset', sourceSet);
    else featureImage.removeAttribute('srcset');

    if (sizes) featureImage.setAttribute('sizes', sizes);
    else featureImage.removeAttribute('sizes');

    if (source) featureImage.src = source;
    featureImage.alt = selectedImage.alt || '';
    feature.classList.toggle('is-contain', selectedImage.classList.contains('service-gallery-contain'));
  };

  const selectItem = (selectedItem, animate = true) => {
    const selectedImage = selectedItem.querySelector('img');
    const selectedCaption = selectedItem.querySelector('figcaption');
    activeServiceSlide = Math.max(0, items.indexOf(selectedItem));
    if (feature && featureImage && selectedImage) {
      if (animate) feature.classList.add('is-switching');
      syncFeatureImage(selectedImage);
      window.setTimeout(() => feature.classList.remove('is-switching'), 420);
    }
    if (featureCaption && selectedCaption) {
      featureCaption.textContent = selectedCaption.textContent;
    }
    items.forEach((item) => {
      const isSelected = item === selectedItem;
      item.classList.toggle('is-selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
  };

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      selectItem(item);
    });
    item.addEventListener('pointerup', (event) => {
      if (event.pointerType !== 'touch') return;
      event.preventDefault();
      selectItem(item);
    });
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectItem(item);
    });
  });

  if (items.length > 0 && feature) {
    selectItem(items[activeServiceSlide] || items[0], false);
  }
});

document.querySelectorAll('[data-career-activity-board]').forEach((board) => {
  const main = board.querySelector('.career-activity-main');
  const mainImage = board.querySelector('[data-career-activity-image]');
  const mainLabel = board.querySelector('[data-career-activity-label]');
  const mainTitle = board.querySelector('[data-career-activity-title]');
  const items = [...board.querySelectorAll('[data-activity-src]')];

  const selectActivity = (item) => {
    if (!main || !mainImage || !mainLabel || !mainTitle || item.classList.contains('is-active')) return;

    items.forEach((activity) => {
      const isActive = activity === item;
      activity.classList.toggle('is-active', isActive);
      activity.setAttribute('aria-pressed', String(isActive));
    });

    main.classList.remove('is-revealing');
    main.classList.add('is-switching');
    window.setTimeout(() => {
      mainImage.src = item.dataset.activitySrc || mainImage.src;
      mainImage.alt = item.dataset.activityAlt || '';
      mainLabel.textContent = item.dataset.activityLabel || '';
      mainTitle.textContent = item.dataset.activityTitle || '';
      main.classList.remove('is-switching');
      main.classList.add('is-revealing');
      window.setTimeout(() => main.classList.remove('is-revealing'), reduceMotion.matches ? 0 : 620);
    }, reduceMotion.matches ? 0 : 280);
  };

  items.forEach((item) => {
    item.addEventListener('click', () => selectActivity(item));
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectActivity(item);
    });
  });
});

document.querySelectorAll('[data-intern-voice-slider]').forEach((slider) => {
  const panels = [...slider.querySelectorAll('[data-intern-voice-panel]')];
  const triggers = [...slider.querySelectorAll('[data-intern-voice-trigger]')];
  if (!panels.length || !triggers.length) return;

  let activeIndex = Math.max(0, panels.findIndex((panel) => panel.classList.contains('is-active')));
  let timer;

  const selectVoice = (index) => {
    activeIndex = (index + panels.length) % panels.length;
    panels.forEach((panel, panelIndex) => {
      panel.classList.toggle('is-active', panelIndex === activeIndex);
    });
    triggers.forEach((trigger, triggerIndex) => {
      const isActive = triggerIndex === activeIndex;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-pressed', String(isActive));
    });
  };

  const startAuto = () => {
    if (reduceMotion.matches) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => selectVoice(activeIndex + 1), 5200);
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      selectVoice(index);
      startAuto();
    });
  });

  slider.addEventListener('mouseenter', () => window.clearInterval(timer));
  slider.addEventListener('mouseleave', startAuto);
  selectVoice(activeIndex);
  startAuto();
});

document.querySelectorAll('[data-employee-voice-slider]').forEach((slider) => {
  const panels = [...slider.querySelectorAll('[data-employee-voice-panel]')];
  const triggers = [...slider.querySelectorAll('[data-employee-voice-trigger]')];
  const prev = slider.querySelector('[data-employee-voice-prev]');
  const next = slider.querySelector('[data-employee-voice-next]');
  if (!panels.length || !triggers.length) return;

  let activeIndex = Math.max(0, panels.findIndex((panel) => panel.classList.contains('is-active')));
  let timer;
  let isSwitching = false;
  let hasInitialized = false;

  const warmImage = (panel) => {
    const image = panel?.querySelector('img');
    if (!image) return;
    if (image.dataset.src && !image.getAttribute('src')) {
      image.setAttribute('src', image.dataset.src);
    }
    image.loading = 'eager';
    image.decoding = 'async';
  };

  const selectVoice = (index) => {
    const nextIndex = (index + panels.length) % panels.length;
    if (hasInitialized && (isSwitching || nextIndex === activeIndex)) return;

    warmImage(panels[nextIndex]);
    warmImage(panels[(nextIndex + 1) % panels.length]);
    isSwitching = true;
    activeIndex = nextIndex;
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });
    triggers.forEach((trigger, triggerIndex) => {
      const isActive = triggerIndex === activeIndex;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-pressed', String(isActive));
    });
    hasInitialized = true;
    window.setTimeout(() => {
      isSwitching = false;
    }, reduceMotion.matches ? 0 : 420);
  };

  const startAuto = () => {
    if (reduceMotion.matches || document.hidden) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => selectVoice(activeIndex + 1), 6400);
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      selectVoice(index);
      startAuto();
    });
  });

  prev?.addEventListener('click', (event) => {
    event.preventDefault();
    selectVoice(activeIndex - 1);
    startAuto();
  });

  next?.addEventListener('click', (event) => {
    event.preventDefault();
    selectVoice(activeIndex + 1);
    startAuto();
  });

  slider.addEventListener('mouseenter', () => window.clearInterval(timer));
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('focusin', () => window.clearInterval(timer));
  slider.addEventListener('focusout', startAuto);
  document.addEventListener('visibilitychange', () => (document.hidden ? window.clearInterval(timer) : startAuto()));
  reduceMotion.addEventListener('change', startAuto);

  selectVoice(activeIndex);
  startAuto();
});

applyLanguage(activeLanguage, false);
initCmsNews();
initCmsJobs();
initCareerApplyContext();
