const preloader = document.querySelector('#site-preloader');
const preloadStartedAt = performance.now();
const preloadMinimumMs = 850;
const preloadMaximumMs = 4200;

const extractImageUrl = (value) => {
  const match = value && value.match(/url\((['"]?)(.*?)\1\)/);
  return match ? match[2] : '';
};

const mediaUrls = new Set([
  ...[...document.images].map((image) => image.dataset.fallbackSrc || image.currentSrc || image.src),
  ...[...document.querySelectorAll('.hero-slide')].map((slide) => extractImageUrl(slide.style.getPropertyValue('--hero-image'))),
  ...[...document.querySelectorAll('.fleet-image-layer')].map((layer) => extractImageUrl(layer.style.backgroundImage))
].filter(Boolean));

const preloadImage = (url) => new Promise((resolve) => {
  const image = new Image();
  image.onload = resolve;
  image.onerror = resolve;
  image.src = url;
  if (image.decode) image.decode().then(resolve).catch(resolve);
});

const finishPreload = () => {
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
  Promise.race([
    Promise.allSettled([...mediaUrls].map(preloadImage)),
    new Promise((resolve) => window.setTimeout(resolve, preloadMaximumMs))
  ]).then(() => {
    if (document.readyState === 'complete') finishPreload();
    else window.addEventListener('load', finishPreload, { once: true });
  });
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
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    setMenuLabels();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      setMenuLabels();
    });
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
  ['.trusted-row:nth-of-type(1) .trusted-section-label', 'Local partners', 'Partner lokal'],
  ['.trusted-row:nth-of-type(2) .trusted-section-label', 'International partners', 'Partner internasional'],
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
  ['.service-seabed h3', 'Seabed Geotechnical Drilling', 'Pengeboran Geoteknik Seabed'],
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
  ['.qhse-dossier-head .kicker', 'Health, Safety and Environment', 'Kesehatan, Keselamatan, dan Lingkungan'],
  ['.qhse-dossier-head h2', 'Prepared, checked, and controlled before work starts.', 'Disiapkan, diperiksa, dan dikendalikan sebelum pekerjaan dimulai.'],
  ['.qhse-dossier-head>p', 'QHSE at THI is handled as field discipline: people are briefed, equipment is checked, critical gear is verified, and every scope is documented before execution.', 'QHSE di THI dijalankan sebagai disiplin lapangan: personel di-briefing, peralatan diperiksa, alat kritis diverifikasi, dan setiap scope didokumentasikan sebelum eksekusi.'],
  ['.qhse-visual figcaption span', 'Field readiness', 'Kesiapan lapangan'],
  ['.qhse-visual figcaption strong', 'Safe execution starts with practical controls that crews can follow on site.', 'Eksekusi aman dimulai dari kontrol praktis yang bisa dijalankan kru di lapangan.'],
  ['.qhse-register-title span', 'QHSE controls', 'Kontrol QHSE'],
  ['.qhse-register-title strong', 'Simple checks, clear responsibility', 'Pemeriksaan sederhana, tanggung jawab jelas'],
  ['.qhse-checklist article:nth-child(1) strong', 'People readiness', 'Kesiapan personel'],
  ['.qhse-checklist article:nth-child(1) p', 'Crews are briefed, fit to work, and aligned on the work method before activity begins.', 'Kru di-briefing, fit to work, dan memahami metode kerja sebelum aktivitas dimulai.'],
  ['.qhse-checklist article:nth-child(2) strong', 'Equipment assurance', 'Jaminan peralatan'],
  ['.qhse-checklist article:nth-child(2) p', 'Critical equipment is inspected, maintained, and load tested before mobilization.', 'Peralatan kritis diperiksa, dirawat, dan diuji beban sebelum mobilisasi.'],
  ['.qhse-checklist article:nth-child(3) strong', 'Worksite control', 'Kontrol area kerja'],
  ['.qhse-checklist article:nth-child(3) p', 'Hazards, access, lifting, marine activity, and emergency response are reviewed with the site team.', 'Bahaya, akses, lifting, aktivitas marine, dan respons darurat ditinjau bersama tim site.'],
  ['.qhse-checklist article:nth-child(4) strong', 'Documented execution', 'Eksekusi terdokumentasi'],
  ['.qhse-checklist article:nth-child(4) p', 'Records, certificates, toolbox talks, and reporting are kept visible throughout the job.', 'Catatan, sertifikat, toolbox talk, dan pelaporan dijaga tetap tersedia sepanjang pekerjaan.'],
  ['.qhse-control-points>div:nth-child(1) strong', 'Plan the work', 'Rencanakan pekerjaan'],
  ['.qhse-control-points>div:nth-child(1) p', 'Define the scope, method, crew, equipment, and HSE requirements before mobilization.', 'Tentukan scope, metode, kru, peralatan, dan kebutuhan HSE sebelum mobilisasi.'],
  ['.qhse-control-points>div:nth-child(2) strong', 'Brief the crew', 'Briefing kru'],
  ['.qhse-control-points>div:nth-child(2) p', 'Align field personnel through toolbox talks, risk review, and role clarity.', 'Selaraskan personel lapangan melalui toolbox talk, review risiko, dan kejelasan peran.'],
  ['.qhse-control-points>div:nth-child(3) strong', 'Verify controls', 'Verifikasi kontrol'],
  ['.qhse-control-points>div:nth-child(3) p', 'Check equipment, permits, lifting gear, emergency setup, and worksite readiness.', 'Periksa peralatan, izin, lifting gear, kesiapan darurat, dan area kerja.'],
  ['.qhse-control-points>div:nth-child(4) strong', 'Record the result', 'Catat hasilnya'],
  ['.qhse-control-points>div:nth-child(4) p', 'Keep reports, observations, and close-out notes ready for project review.', 'Siapkan laporan, observasi, dan catatan close-out untuk review proyek.'],
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
  ['.footer-bottom span:last-child', 'Ground knowledge. Better decisions.', 'Pengetahuan tanah. Keputusan lebih baik.']
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
    ['.board-section-head .kicker', 'Profil Board'],
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
      ['.board-section-head>p:not(.kicker)', 'Board members are presented with their governance role, management responsibility, and a concise biography placeholder for the approved company profile.'],
      ['.board-profile-group:nth-of-type(1) .board-group-title', 'Board of Directors'],
      ['.board-profile-group:nth-of-type(2) .board-group-title', 'Board of Commissioners'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name p', 'President Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-profile-name p', 'Finance Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-profile-name p', 'Commercial Director'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-profile-name p', 'Operational Director'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-profile-name p', 'President Commissioner'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name p', 'Commissioner']
    ],
    id: [
      ['title', 'Dewan Komisaris & Direksi | Taka Hydrocore Indonesia'],
      ['meta[name="description"]', 'Dewan Komisaris dan Direksi PT Taka Hydrocore Indonesia.'],
      ['.board-page .preloader-inner p', 'Menyiapkan profil pimpinan'],
      ['.board-hero-copy .kicker', 'Tata kelola perusahaan'],
      ['.board-hero-copy h1', 'Dewan Komisaris & Direksi'],
      ['.board-hero-copy>p:last-child', 'Profil tata kelola dan manajemen yang mewakili pengalaman operasional serta kepemimpinan bisnis PT Taka Hydrocore Indonesia.'],
      ['.board-section>.section-label', '<span>01</span> Pimpinan Perusahaan', 'html'],
      ['.board-section-head .kicker', 'Profil Board'],
      ['.board-section-head h2', 'Kepemimpinan dengan disiplin operasional yang jelas.'],
      ['.board-section-head>p:not(.kicker)', 'Setiap anggota board ditampilkan dengan peran tata kelola, tanggung jawab manajemen, dan placeholder biografi ringkas untuk profil perusahaan resmi.'],
      ['.board-profile-group:nth-of-type(1) .board-group-title', 'Direksi'],
      ['.board-profile-group:nth-of-type(2) .board-group-title', 'Komisaris'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(1) .board-profile-name p', 'Direktur Utama'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(2) .board-profile-name p', 'Direktur Finance'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(3) .board-profile-name p', 'Direktur Commercial'],
      ['.board-profile-group:nth-of-type(1) .board-profile:nth-of-type(4) .board-profile-name p', 'Direktur Operational'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(1) .board-profile-name p', 'Komisaris Utama'],
      ['.board-profile-group:nth-of-type(2) .board-profile:nth-of-type(2) .board-profile-name p', 'Komisaris']
    ]
  };
  const translations = boardPageTranslationsV2[language] || boardPageTranslationsV2.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

const companyProfilePageTranslations = {
  en: [
    ['title', 'Company Profile | Taka Hydrocore Indonesia'],
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
    ['.profile-group-summary-copy p:nth-of-type(2)', 'Taka Group was founded in 1998, starting with Taka Turbomachinery Indonesia. The group has grown into four subsidiary companies and one sister company with different service focus and capabilities.'],
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
    ['.sigap-notes article:nth-child(1)', '<span>S / Service Excellence</span><ul><li>Act ahead of client needs</li><li>Deliver beyond expectations</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(2)', '<span>I / Integrity</span><ul><li>Be dependable and accountable</li><li>Honor every commitment</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(3)', '<span>G / Grow</span><ul><li>Keep learning and adapting</li><li>Improve the quality of every output</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(4)', '<span>A / Awareness</span><ul><li>Respect people and diversity</li><li>Protect reputation and recognize contribution</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(5)', '<span>P / Professionalism</span><ul><li>Work ethically and collaboratively</li><li>Lead by example in every assignment</li></ul>', 'html'],
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
    ['.company-profile-page .preloader-inner p', 'Menyiapkan company profile'],
    ['.profile-hero-copy .kicker', 'Company Profile'],
    ['.profile-hero h1', 'Layanan survei geoteknik dan geofisika.'],
    ['.profile-hero-copy>p:not(.kicker)', 'PT Taka Hydrocore Indonesia mengintegrasikan kapabilitas offshore, nearshore, onshore, laboratorium, dan kapal survei untuk dukungan survei bawah permukaan dan engineering.'],
    ['.profile-hero-footprint span', 'Jejak operasional'],
    ['.profile-hero-footprint strong', 'Eksekusi survei di perairan Indonesia dan beberapa penugasan internasional.'],
    ['.profile-overview>.section-label', '<span>01</span> Tentang Grup', 'html'],
    ['.profile-group-summary-brand span', 'Grup layanan teknis Indonesia'],
    ['.profile-group-summary-copy .kicker', 'Tentang Kami'],
    ['.profile-group-summary-copy h2', 'Bagian dari grup layanan teknis Indonesia yang fokus.'],
    ['.profile-group-summary-copy p:nth-of-type(2)', 'Taka Group berdiri pada 1998, dimulai dari Taka Turbomachinery Indonesia. Grup berkembang menjadi empat anak perusahaan dan satu sister company dengan fokus layanan dan kapabilitas berbeda.'],
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
    ['.profile-culture .profile-section-head .kicker', 'Our Corporate Culture'],
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
    ['.sigap-notes article:nth-child(1)', '<span>S / Service Excellence</span><ul><li>Sigap membaca kebutuhan klien</li><li>Memberikan hasil di atas ekspektasi</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(2)', '<span>I / Integrity</span><ul><li>Dapat dipercaya dan bertanggung jawab</li><li>Menjaga setiap komitmen</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(3)', '<span>G / Grow</span><ul><li>Terus belajar dan beradaptasi</li><li>Meningkatkan kualitas setiap output</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(4)', '<span>A / Awareness</span><ul><li>Menghargai manusia dan keberagaman</li><li>Menjaga reputasi dan mengapresiasi kontribusi</li></ul>', 'html'],
    ['.sigap-notes article:nth-child(5)', '<span>P / Professionalism</span><ul><li>Bekerja etis dan kolaboratif</li><li>Memberi teladan dalam setiap pekerjaan</li></ul>', 'html'],
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
    ['.profile-experience-head .kicker', 'Extensive Experience'],
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
    ['.profile-customers>.section-label', '<span>07</span> Value Customers', 'html'],
    ['.profile-customers .profile-section-head .kicker', 'Some of Our Value Customers'],
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
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia services for marine geophysical survey, offshore geotechnical survey, seabed geotechnical drilling, nearshore drilling, exploratory drilling, and onshore geotechnical survey.'],
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
    ['#seabed-drilling h3', 'Seabed Geotechnical Drilling'],
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
    ['meta[name="description"]', 'Layanan PT Taka Hydrocore Indonesia untuk survei geofisika marine, survei geoteknik offshore, pengeboran geoteknik seabed, pengeboran nearshore, pengeboran eksplorasi, dan survei geoteknik onshore.'],
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
    ['#seabed-drilling h3', 'Pengeboran Geoteknik Seabed'],
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
    ['.service-anchor-list a:nth-child(8)', '<span>08</span>Seabed Geotechnical Drilling', 'html'],
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
    ['#seabed-drilling h2', 'Seabed Geotechnical Drilling'],
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
    ['.service-anchor-list a:nth-child(8)', '<span>08</span>Pengeboran Geoteknik Seabed', 'html'],
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
    ['#seabed-drilling h2', 'Pengeboran Geoteknik Seabed'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(2)', 'THI menyediakan kapabilitas survei geoteknik seabed melalui pengembangan dan pengoperasian sistem Seabed CPT dan Vibrocore. Layanan ini mendukung investigasi bawah permukaan dangkal ketika data seabed langsung dan sampel sedimen diperlukan sebelum keputusan desain atau konstruksi.'],
    ['#seabed-drilling .service-detail-copy>p:nth-of-type(3)', 'Lingkup seabed dapat mendukung perencanaan infrastruktur marine, penilaian rute dan lokasi, screening geohazard, interpretasi tanah dekat permukaan, serta tindak lanjut laboratorium setelah sampel diperoleh.'],
    ['#seabed-drilling .service-detail-points p:nth-child(1)', '<strong>Seabed CPT</strong><span>Cone penetration testing langsung untuk profil perilaku dan kekuatan tanah dekat seabed.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(2)', '<strong>Vibrocore</strong><span>Recovery sedimen fisik untuk deskripsi bawah permukaan dangkal dan pengujian laboratorium.</span>', 'html'],
    ['#seabed-drilling .service-detail-points p:nth-child(3)', '<strong>Aplikasi</strong><span>Berguna untuk rute pipa, rute kabel, fasilitas marine, dan perencanaan infrastruktur seabed.</span>', 'html']
  ]
};

const applyServicesLanguage = (language) => {
  if (!document.body.classList.contains('services-page')) return;
  const translations = servicesPageTranslationsV2[language] || servicesPageTranslationsV2.en;
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
    ['#a-frame-24t .equipment-detail-index', '09 / Deployment and recovery support'],
    ['#a-frame-24t h3', 'THI A-Frame 24T'],
    ['#a-frame-24t .equipment-detail-copy>p:not(.kicker)', 'Deck handling and lifting support for controlled deployment and recovery of seabed equipment during marine operations.'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(1)', '<strong>Field role</strong><span>Supports safe overboarding, lifting, and recovery sequence on deck.</span>', 'html'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(2)', '<strong>Prepared for</strong><span>Load check, lifting arrangement, deck coordination, and equipment recovery.</span>', 'html'],
    ['#soil-geotechnical-lab .kicker', 'Laboratory'],
    ['#soil-geotechnical-lab .equipment-detail-index', '10 / Soil testing and documentation'],
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
    ['#a-frame-24t .equipment-detail-index', '09 / Dukungan deployment dan recovery'],
    ['#a-frame-24t h3', 'THI A-Frame 24T'],
    ['#a-frame-24t .equipment-detail-copy>p:not(.kicker)', 'Dukungan deck handling dan lifting untuk deployment serta recovery peralatan seabed secara terkontrol dalam operasi marine.'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(1)', '<strong>Peran lapangan</strong><span>Mendukung overboarding, lifting, dan urutan recovery yang aman di deck.</span>', 'html'],
    ['#a-frame-24t .equipment-detail-lines p:nth-child(2)', '<strong>Disiapkan untuk</strong><span>Load check, pengaturan lifting, koordinasi deck, dan recovery peralatan.</span>', 'html'],
    ['#soil-geotechnical-lab .kicker', 'Laboratorium'],
    ['#soil-geotechnical-lab .equipment-detail-index', '10 / Pengujian tanah dan dokumentasi'],
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
    ['#a-frame-24t .equipment-detail-index', '10 / Deployment and recovery support'],
    ['#soil-geotechnical-lab .equipment-detail-index', '11 / Soil testing and documentation'],
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
    ['#a-frame-24t .equipment-detail-index', '10 / Dukungan deployment dan recovery'],
    ['#soil-geotechnical-lab .equipment-detail-index', '11 / Pengujian tanah dan dokumentasi'],
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

const applyEquipmentPageLanguage = (language) => {
  if (!document.body.classList.contains('equipment-page')) return;
  const translations = equipmentPageTranslations[language] || equipmentPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
  const overrides = equipmentPageTranslationOverrides[language] || equipmentPageTranslationOverrides.en;
  overrides.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
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
    ['#ag-geodrill>.section-label', '<span>02</span> AG Geodrill', 'html'],
    ['#ag-geodrill .vessel-detail-copy h2', 'Geotechnical vessel for offshore soil investigation.'],
    ['#ag-geodrill .vessel-detail-copy>p:not(.kicker)', 'AG Geodrill is presented by THI as a dedicated offshore geotechnical vessel. Its configuration is centered on station keeping, heave compensated drilling, moonpool deployment, seabed frame handling, and onboard soil handling for survey campaigns.'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['#ss-barakuda>.section-label', '<span>03</span> SS Barakuda', 'html'],
    ['#ss-barakuda .vessel-detail-copy h2', 'Marine survey vessel for seismic and geophysical campaigns.'],
    ['#ss-barakuda .vessel-detail-copy>p:not(.kicker)', 'SS Barakuda is listed by THI as a research ship for geophysical and high resolution seismic survey work. Its operating profile suits survey lines, geohazard investigation, and exploration-support acquisition using marine geophysical sensors.'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
    ['#voyager-explorer>.section-label', '<span>04</span> Voyager Explorer', 'html'],
    ['#voyager-explorer .vessel-detail-copy h2', 'Seismic and geophysical vessel for subsea mapping.'],
    ['#voyager-explorer .vessel-detail-copy>p:not(.kicker)', 'Voyager Explorer is positioned as a seismic and geophysical survey vessel for subsea mapping, high-quality acquisition, onboard processing, and field support for oil and gas, marine, and subsea infrastructure work.'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(1) strong', 'Year'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(2) strong', 'Engine Power'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(3) strong', 'Accommodation'],
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
    ['#ag-geodrill>.section-label', '<span>02</span> AG Geodrill', 'html'],
    ['#ag-geodrill .vessel-detail-copy h2', 'Kapal geoteknik untuk investigasi tanah offshore.'],
    ['#ag-geodrill .vessel-detail-copy>p:not(.kicker)', 'AG Geodrill dipresentasikan THI sebagai kapal geoteknik offshore khusus. Konfigurasinya berfokus pada station keeping, heave compensated drilling, deployment melalui moonpool, penanganan seabed frame, dan dukungan soil handling onboard.'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#ag-geodrill .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['#ss-barakuda>.section-label', '<span>03</span> SS Barakuda', 'html'],
    ['#ss-barakuda .vessel-detail-copy h2', 'Kapal survei marine untuk kampanye seismik dan geofisika.'],
    ['#ss-barakuda .vessel-detail-copy>p:not(.kicker)', 'SS Barakuda dicantumkan THI sebagai research ship untuk survei geofisika dan seismik resolusi tinggi. Profil operasinya cocok untuk lintasan survei, investigasi geohazard, dan akuisisi pendukung eksplorasi dengan sensor geofisika marine.'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#ss-barakuda .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
    ['#voyager-explorer>.section-label', '<span>04</span> Voyager Explorer', 'html'],
    ['#voyager-explorer .vessel-detail-copy h2', 'Kapal seismik dan geofisika untuk pemetaan bawah laut.'],
    ['#voyager-explorer .vessel-detail-copy>p:not(.kicker)', 'Voyager Explorer diposisikan sebagai kapal survei seismik dan geofisika untuk pemetaan bawah laut, akuisisi berkualitas tinggi, pemrosesan onboard, dan dukungan lapangan bagi minyak dan gas, kelautan, serta infrastruktur bawah laut.'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(1) strong', 'Tahun'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(2) strong', 'Daya Mesin'],
    ['#voyager-explorer .vessel-spec-list span:nth-child(3) strong', 'Akomodasi'],
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

const qhsePageTranslations = {
  en: [
    ['title', 'QHSE | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'PT Taka Hydrocore Indonesia QHSE page covering health, safety, environment, equipment readiness, load testing, personnel training, and no-harm operating goals.'],
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
    ['#nearshore-drilling-projects li:nth-child(1)', 'Geotechnical survey and services for Jetty D North West Cilegon City - CAP2 Expansion Project, 2018'],
    ['#nearshore-drilling-projects li:nth-child(2)', 'KITe LNG Receiving Makassar FSRU geotechnical investigation, 2017'],
    ['#nearshore-drilling-projects li:nth-child(3)', 'Tibar Bay Port intertidal geotechnical investigation, Timor-Leste, 2017'],
    ['#nearshore-drilling-projects li:nth-child(4)', 'Shallow-water drilling from wooden staging, working platform, and modular pontoon setups.'],
    ['#nearshore-drilling-projects li:nth-child(5)', 'Nearshore CPTu and borehole investigation for coastal infrastructure design.'],
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
    ['#seabed-drilling-projects h3', 'Seabed Geotechnical Drilling'],
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
    ['#nearshore-drilling-projects ul', "<li>Nearshore Geotechnical Survey for East and Central Java LNG Floating Storage and Regasification Terminal - PT Geotindo, 2011</li>\n              <li>Onshore and nearshore geotechnical surveys for Premier Oil SSTI-B to WNTS pipeline, Pemping Island Batam - PT Pageo Utama, 2011</li>\n              <li>Nearshore drilling for HESS Pangkah semi-walkaway reverse VSP, Ujung Pangkah East Java - PT Halliburton Indonesia, 2011</li>\n              <li>Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Additional intertidal geotechnical investigation survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Nearshore CPTu and borehole investigation for coastal infrastructure design.</li>\n              <li>Shallow-water drilling from wooden staging, working platform, and modular pontoon setups.</li>", 'html'],
    ['#hydrogeology-drilling-projects ul', "<li>Water Well Drilling for BP Tangguh Development, Papua - BP Berau Ltd, 2018</li>\n              <li>Ground Water Deep Water Well Work for Alur Siwah Central Processing Plant Block A, Aceh - JGC Indonesia and Encona Consortium JEC, 2016</li>\n              <li>Water Well Drilling for Donggi Senoro LNG Project, Luwuk Central Sulawesi - JGC Corporation, 2011-2012</li>\n              <li>Geotechnical and hydrogeological investigation for Block M pit, Alfara Delta Persada Coal Mining, East Kalimantan - PT Alfara Delta Persada, 2010</li>\n              <li>Groundwater monitoring well installation for environmental and landfill monitoring programs.</li>\n              <li>Mining drainage and water supply drilling with project-specific well configuration.</li>", 'html'],
    ['#marine-geophysical-other-projects ul', "<li>Engineering conceptual study for Phase-1 Ground Water Project, Tangguh Expansion Project, West Papua - PT Singgar Mulia, 2018</li>\n              <li>Desk study soil-pipe interaction analysis, Pipeline Foxtrot Platform to Karunia WHP, ABAR Block, Offshore West Java - PT Alamjaya Makmur Sejahtera, 2018</li>\n              <li>Positioning, topographic survey, bathymetry, metocean, and meteorology support for field scopes.</li>\n              <li>Geophysical logging, pumping test, slug test, and basic geotechnical engineering support.</li>\n              <li>Soil laboratory test coordination with PT Hydrocore as sister company.</li>", 'html'],
    ['#seabed-drilling-projects ul', "<li><button class=\"project-list-trigger\" data-modal=\"karimun-modal\">Geophysical and Vibrocore Survey Works at Karimun Besar Island, Riau Islands - 2025</button></li>\n              <li>Sand sources investigation in Banten, vibrocore - PT Hydrocore for Boskalis International Indonesia, 2025</li>\n              <li>Provision of Gravity Coring for Pertamina Avtur SPM at Balongan, West Java - Geotindo, 2010</li>\n              <li>Vibrocoring work, 230 points up to 500 m water depth, Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>\n              <li>Seabed CPT and vibrocore investigation for near-surface soil profiling.</li>\n              <li>Sediment sampling and laboratory follow-up for marine infrastructure planning.</li>", 'html']
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
    ['#nearshore-drilling-projects li:nth-child(1)', 'Geotechnical survey and services untuk Jetty D North West Cilegon City - CAP2 Expansion Project, 2018'],
    ['#nearshore-drilling-projects li:nth-child(2)', 'KITe LNG Receiving Makassar FSRU geotechnical investigation, 2017'],
    ['#nearshore-drilling-projects li:nth-child(3)', 'Tibar Bay Port intertidal geotechnical investigation, Timor-Leste, 2017'],
    ['#nearshore-drilling-projects li:nth-child(4)', 'Pengeboran perairan dangkal dari wooden staging, working platform, dan modular pontoon.'],
    ['#nearshore-drilling-projects li:nth-child(5)', 'Investigasi CPTu dan borehole nearshore untuk desain infrastruktur pesisir.'],
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
    ['#seabed-drilling-projects h3', 'Pengeboran Geoteknik Seabed'],
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
    ['#nearshore-drilling-projects ul', "<li>Nearshore Geotechnical Survey for East and Central Java LNG Floating Storage and Regasification Terminal - PT Geotindo, 2011</li>\n              <li>Onshore and nearshore geotechnical surveys for Premier Oil SSTI-B to WNTS pipeline, Pemping Island Batam - PT Pageo Utama, 2011</li>\n              <li>Nearshore drilling for HESS Pangkah semi-walkaway reverse VSP, Ujung Pangkah East Java - PT Halliburton Indonesia, 2011</li>\n              <li>Nearshore Geotechnical Survey for LNG Carrier Jetty Project, KITe Lombok - PT Patra Drilling Contractor, 2017</li>\n              <li>Nearshore Geotechnical Survey for FSRU Project, KITe Makassar - PT Patra Drilling Contractor, 2017</li>\n              <li>Additional intertidal geotechnical investigation survey for Tibar Bay Port, Timor-Leste - PT Hydrocore, 2017</li>\n              <li>Nearshore CPTu and borehole investigation for coastal infrastructure design.</li>\n              <li>Shallow-water drilling from wooden staging, working platform, and modular pontoon setups.</li>", 'html'],
    ['#hydrogeology-drilling-projects ul', "<li>Water Well Drilling for BP Tangguh Development, Papua - BP Berau Ltd, 2018</li>\n              <li>Ground Water Deep Water Well Work for Alur Siwah Central Processing Plant Block A, Aceh - JGC Indonesia and Encona Consortium JEC, 2016</li>\n              <li>Water Well Drilling for Donggi Senoro LNG Project, Luwuk Central Sulawesi - JGC Corporation, 2011-2012</li>\n              <li>Geotechnical and hydrogeological investigation for Block M pit, Alfara Delta Persada Coal Mining, East Kalimantan - PT Alfara Delta Persada, 2010</li>\n              <li>Groundwater monitoring well installation for environmental and landfill monitoring programs.</li>\n              <li>Mining drainage and water supply drilling with project-specific well configuration.</li>", 'html'],
    ['#marine-geophysical-other-projects ul', "<li>Engineering conceptual study for Phase-1 Ground Water Project, Tangguh Expansion Project, West Papua - PT Singgar Mulia, 2018</li>\n              <li>Desk study soil-pipe interaction analysis, Pipeline Foxtrot Platform to Karunia WHP, ABAR Block, Offshore West Java - PT Alamjaya Makmur Sejahtera, 2018</li>\n              <li>Positioning, topographic survey, bathymetry, metocean, and meteorology support for field scopes.</li>\n              <li>Geophysical logging, pumping test, slug test, and basic geotechnical engineering support.</li>\n              <li>Soil laboratory test coordination with PT Hydrocore as sister company.</li>", 'html'],
    ['#seabed-drilling-projects ul', "<li><button class=\"project-list-trigger\" data-modal=\"karimun-modal\">Geophysical and Vibrocore Survey Works at Karimun Besar Island, Riau Islands - 2025</button></li>\n              <li>Sand sources investigation in Banten, vibrocore - PT Hydrocore for Boskalis International Indonesia, 2025</li>\n              <li>Provision of Gravity Coring for Pertamina Avtur SPM at Balongan, West Java - Geotindo, 2010</li>\n              <li>Vibrocoring work, 230 points up to 500 m water depth, Pertamina Matindok Geochemistry Study - PT MGS, 2011</li>\n              <li>Seabed CPT and vibrocore investigation for near-surface soil profiling.</li>\n              <li>Sediment sampling and laboratory follow-up for marine infrastructure planning.</li>", 'html']
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
    ['.contact-channel-stack article:nth-child(3) span', 'Workshop']
  ],
  id: [
    ['title', 'Kontak | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Hubungi PT Taka Hydrocore Indonesia untuk enquiry proyek survei, pengeboran, geoteknik, geofisika, QHSE, dan pekerjaan berbasis kapal.'],
    ['.contact-page .preloader-inner p', 'Menyiapkan kontak'],
    ['.contact-page-hero-copy .kicker', 'Enquiry proyek'],
    ['.contact-page-hero h1', 'Mari selaraskan metode lapangan yang tepat sebelum mobilisasi.'],
    ['.contact-page-hero-copy>p:not(.kicker)', 'Bagikan lokasi proyek, lingkup layanan, jadwal, batasan site, dan deliverable yang dibutuhkan. THI dapat membantu menyusun pendekatan survei, pengeboran, atau akuisisi data yang praktis.'],
    ['.contact-desk>.section-label', '<span>01</span> Kontak', 'html'],
    ['.contact-channel-primary span', 'Email'],
    ['.contact-channel-primary p', 'Gunakan alamat ini untuk enquiry proyek, diskusi survei, dan koordinasi layanan teknis.'],
    ['.contact-channel-primary a', 'Kirim email <span>→</span>', 'html'],
    ['.contact-channel-stack article:nth-child(2) span', 'Kantor Pusat'],
    ['.contact-channel-stack article:nth-child(3) span', 'Workshop']
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
    ['.news-page-hero h1', 'Company updates, written with context.'],
    ['.news-page-hero-copy>p:not(.kicker)', 'Selected stories from PT Taka Hydrocore Indonesia, including corporate responsibility, field activity, and company milestones.'],
    ['.news-feature-section>.section-label', '<span>01</span> News Archive', 'html'],
    ['.newsroom-head .kicker', 'Company updates'],
    ['.newsroom-head h2', 'Published news from THI.'],
    ['.news-empty-state span', 'No published news'],
    ['.news-empty-state p', 'Company news and updates will appear here after content is published from Decap CMS.']
  ],
  id: [
    ['title', 'Berita & Pembaruan | Taka Hydrocore Indonesia'],
    ['meta[name="description"]', 'Berita CSR dan pembaruan perusahaan PT Taka Hydrocore Indonesia.'],
    ['.news-page .preloader-inner p', 'Menyiapkan berita'],
    ['.news-page-hero-copy .kicker', 'Ruang Berita'],
    ['.news-page-hero h1', 'Pembaruan perusahaan dengan konteks yang jelas.'],
    ['.news-page-hero-copy>p:not(.kicker)', 'Cerita pilihan dari PT Taka Hydrocore Indonesia, mencakup tanggung jawab sosial, aktivitas lapangan, dan milestone perusahaan.'],
    ['.news-feature-section>.section-label', '<span>01</span> Arsip Berita', 'html'],
    ['.newsroom-head .kicker', 'Pembaruan perusahaan'],
    ['.newsroom-head h2', 'Berita terbit dari THI.'],
    ['.news-empty-state span', 'Belum ada berita terbit'],
    ['.news-empty-state p', 'Berita dan pembaruan perusahaan akan tampil di sini setelah dipublikasikan dari Decap CMS.']
  ]
};

const applyNewsPageLanguage = (language) => {
  if (!document.body.classList.contains('news-page')) return;
  const translations = newsPageTranslations[language] || newsPageTranslations.en;
  translations.forEach(([selector, content, mode]) => setElementContent(selector, content, mode));
};

let cmsNewsItems = [];

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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

const renderNewsEmpty = (container, scope) => {
  container.classList.add('is-empty');
  const title = activeLanguage === 'id' ? 'Belum ada berita terbit' : 'No published news';
  const copy = activeLanguage === 'id'
    ? 'Berita dari Decap CMS akan tampil di sini setelah dipublikasikan.'
    : 'News from Decap CMS will appear here after content is published.';
  container.innerHTML = `<article class="news-empty-state ${scope === 'home' ? 'news-empty-state-inline' : ''}"><span>${title}</span><p>${copy}</p></article>`;
};

const renderCmsNewsCards = (items = cmsNewsItems) => {
  document.querySelectorAll('[data-news-list]').forEach((container) => {
    const scope = container.dataset.newsList;
    const sourceItems = scope === 'home'
      ? (items.filter((item) => item.featured).length ? items.filter((item) => item.featured) : items)
      : items;
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
      const summary = escapeHtml(item.summary || '');
      const image = item.image ? escapeHtml(item.image) : '';
      const imageAlt = escapeHtml(item.imageAlt || item.title);

      if (scope === 'home') {
        return `<a class="news-card news-cms-card" href="${newsDetailHref(item)}">
          <figure class="news-image">${image ? `<img src="${image}" alt="${imageAlt}" loading="lazy">` : ''}</figure>
          <div class="news-content">
            <div class="news-meta"><span>${category}</span><small>${date}</small></div>
            <h3>${title}</h3>
            <p>${summary}</p>
          </div>
        </a>`;
      }

      return `<a class="newsroom-story news-cms-story" href="${newsDetailHref(item)}">
        <figure class="newsroom-story-media">${image ? `<img src="${image}" alt="${imageAlt}" loading="lazy">` : ''}</figure>
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
    blocks.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
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
      blocks.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
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
  header.querySelector('p:not(.kicker)').textContent = item.summary || '';
  document.querySelector('[data-news-detail-category]').textContent = item.category || 'News';
  document.querySelector('[data-news-detail-date]').textContent = formatNewsDate(item.date) || '-';
  if (item.image) {
    hero.style.setProperty('--news-detail-image', `url('${item.image}')`);
    hero.classList.add('has-image');
  }
  const imageMarkup = item.image
    ? `<figure class="news-detail-main-image" data-news-detail-image>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="eager">
        <figcaption>${escapeHtml(item.imageAlt || item.category || 'THI documentation')}</figcaption>
      </figure>`
    : '';
  body.innerHTML = `${imageMarkup}<p class="lead">${escapeHtml(item.summary || '')}</p>${markdownToHtml(item.body || '')}`;
};

const initCmsNews = () => {
  if (!document.querySelector('[data-news-list]') && !document.body.classList.contains('news-detail-page')) return;
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
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
};

const getJobApplyUrl = (item = {}) => String(item.apply_url || item.applyUrl || item.apply_link || '').trim();
const isSafeJobApplyUrl = (url = '') => /^https?:\/\//i.test(url);
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
    const summary = escapeHtml(item.summary || '');
    const overview = escapeHtml(item.overview || item.summary || '');
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
    if (isActive && !reduceMotion.matches) video.play().catch(() => {});
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
    if (isActive && !reduceMotion.matches) video.play().catch(() => {});
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
  geodrill: 'assets/vessels/source/kapal geodrill dari atas.jpeg',
  barakuda: 'assets/SS Barakuda/DJI_0131.JPG',
  voyager: 'assets/vessels/source/pemandangan dari dalam kapal.jpeg'
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

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

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`${activeLanguage === 'id' ? 'Enquiry Proyek' : 'Project Enquiry'} - ${data.get('company') || data.get('name')}`);
  const body = encodeURIComponent(
    activeLanguage === 'id'
      ? `Nama: ${data.get('name')}\nEmail: ${data.get('email')}\nPerusahaan: ${data.get('company') || '-'}\nLayanan: ${data.get('service')}\nLokasi: ${data.get('location') || '-'}\n\nRingkasan Proyek:\n${data.get('message')}`
      : `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company') || '-'}\nService: ${data.get('service')}\nLocation: ${data.get('location') || '-'}\n\nProject Message:\n${data.get('message')}`
  );
  window.location.href = `mailto:frans@thi.co.id?subject=${subject}&body=${body}`;
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

    window.location.href = `mailto:frans@thi.co.id?subject=${subject}&body=${body}`;
  });
});

document.querySelectorAll('[data-feature-gallery]').forEach((gallery) => {
  const feature = gallery.querySelector('.service-gallery-feature');
  const featureImage = gallery.querySelector('[data-gallery-feature-image]');
  const featureCaption = gallery.querySelector('[data-gallery-feature-caption]');
  const items = [...gallery.querySelectorAll('.service-gallery-grid figure')];

  const selectItem = (selectedItem) => {
    const selectedImage = selectedItem.querySelector('img');
    const selectedCaption = selectedItem.querySelector('figcaption');
    if (feature && featureImage && selectedImage) {
      featureImage.src = selectedImage.currentSrc || selectedImage.src;
      featureImage.alt = selectedImage.alt;
      feature.classList.toggle('is-contain', selectedImage.classList.contains('service-gallery-contain'));
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
    item.addEventListener('click', () => selectItem(item));
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectItem(item);
    });
  });
});

applyLanguage(activeLanguage, false);
initCmsNews();
initCmsJobs();
initCareerApplyContext();
