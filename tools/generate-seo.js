const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = (process.env.SITE_URL || 'https://www.takahydrocore.com').replace(/\/$/, '');
const lastmod = '2026-08-05';

const pages = [
  {
    file: 'index.html',
    url: '/',
    title: 'PT Taka Hydrocore Indonesia | Geophysical & Geotechnical Survey Services',
    description: 'PT Taka Hydrocore Indonesia provides marine geophysical, offshore geotechnical, nearshore, onshore, drilling, laboratory, and field support services for subsurface project decisions.',
    priority: '1.0',
    changefreq: 'weekly',
  },
  {
    file: 'company-profile.html',
    url: '/company-profile.html',
    title: 'Company Profile | PT Taka Hydrocore Indonesia',
    description: 'Company profile of PT Taka Hydrocore Indonesia, an Indonesian technical services company supporting geophysical, geotechnical, hydrogeological, drilling, laboratory, vessel, and field execution work.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  {
    file: 'services.html',
    url: '/services.html',
    title: 'Services | PT Taka Hydrocore Indonesia',
    description: 'Explore THI services including marine geophysical survey, offshore geotechnical survey, seabed geotechnical, nearshore and onshore geotechnical survey, exploratory drilling, and hydrogeology drilling.',
    priority: '0.95',
    changefreq: 'monthly',
  },
  {
    file: 'equipment-geotechnical.html',
    url: '/equipment-geotechnical.html',
    title: 'Geotechnical Equipment | PT Taka Hydrocore Indonesia',
    description: 'Geotechnical equipment operated by THI, including CPT Manta 200, CPT Wison APB, vibrocore, piston corer, box core, grab sampler, drilling rigs, A-frame, and soil laboratory support.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    file: 'equipment-geophysical.html',
    url: '/equipment-geophysical.html',
    title: 'Geophysical Equipment | PT Taka Hydrocore Indonesia',
    description: 'Geophysical equipment showcase for bathymetry, seabed mapping, seismic acquisition, positioning, oceanographic support, and survey data control systems.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    file: 'vessel.html',
    url: '/vessel.html',
    title: 'Vessel & Operational Platforms | PT Taka Hydrocore Indonesia',
    description: 'Marine operational platforms supporting THI geophysical, offshore geotechnical, and nearshore survey scopes in collaboration with Taka Geodrill.',
    priority: '0.75',
    changefreq: 'monthly',
  },
  {
    file: 'quality.html',
    url: '/quality.html',
    title: 'Quality Management System | PT Taka Hydrocore Indonesia',
    description: 'Quality management system access for THI policy, certification management system, ISO certificates, SMK3, document control, and client compliance review.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    file: 'hse.html',
    url: '/hse.html',
    title: 'Health, Safety & Environment | PT Taka Hydrocore Indonesia',
    description: 'HSE page for PT Taka Hydrocore Indonesia covering annual HSE indicators, readiness controls, field programs, and site documentation.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    file: 'project.html',
    url: '/project.html',
    title: 'Project Experience | PT Taka Hydrocore Indonesia',
    description: 'Selected THI project references across marine geophysical survey, offshore geotechnical survey, nearshore and onshore geotechnical investigation, engineering study, and water well drilling.',
    priority: '0.85',
    changefreq: 'monthly',
  },
  {
    file: 'news.html',
    url: '/news.html',
    title: 'News & Updates | PT Taka Hydrocore Indonesia',
    description: 'Company news, CSR updates, and selected announcements from PT Taka Hydrocore Indonesia.',
    priority: '0.65',
    changefreq: 'weekly',
  },
  {
    file: 'board.html',
    url: '/board.html',
    title: 'Board of Commissioners & Directors | PT Taka Hydrocore Indonesia',
    description: 'Board profile of PT Taka Hydrocore Indonesia, including commissioners and directors supporting technical, operational, commercial, and financial discipline.',
    priority: '0.55',
    changefreq: 'monthly',
  },
  {
    file: 'career.html',
    url: '/career.html',
    title: 'Careers | PT Taka Hydrocore Indonesia',
    description: 'Career information at PT Taka Hydrocore Indonesia for people interested in field operations, survey data, equipment readiness, technical documentation, and office support roles.',
    priority: '0.75',
    changefreq: 'weekly',
  },
  {
    file: 'career-why.html',
    url: '/career-why.html',
    title: 'Life at THI | Careers at PT Taka Hydrocore Indonesia',
    description: 'Life at THI, including work culture, SIGAP values, employee voices, team activities, and how people support field and office execution.',
    priority: '0.65',
    changefreq: 'monthly',
  },
  {
    file: 'career-job-fields.html',
    url: '/career-job-fields.html',
    title: 'Job Fields | Careers at PT Taka Hydrocore Indonesia',
    description: 'Browse career opportunities and job fields at PT Taka Hydrocore Indonesia by keyword, work area, job type, level, and department.',
    priority: '0.7',
    changefreq: 'weekly',
  },
  {
    file: 'career-internship.html',
    url: '/career-internship.html',
    title: 'Internship | Careers at PT Taka Hydrocore Indonesia',
    description: 'Internship information at PT Taka Hydrocore Indonesia for students who want practical exposure to technical projects, documentation, and real working conditions.',
    priority: '0.7',
    changefreq: 'weekly',
  },
  {
    file: 'contact.html',
    url: '/contact.html',
    title: 'Contact | PT Taka Hydrocore Indonesia',
    description: 'Contact PT Taka Hydrocore Indonesia for geophysical, geotechnical, drilling, QHSE, vessel, laboratory, and project enquiries.',
    priority: '0.8',
    changefreq: 'monthly',
  },
];

const noindexPages = [
  'admin/index.html',
  'career-apply.html',
  'career-departments.html',
  'career-talent-pool.html',
  'equipment.html',
  'news-detail.html',
  'qhse.html',
];

const navItems = pages
  .filter((page) => page.file !== 'index.html')
  .map((page) => ({
    '@type': 'SiteNavigationElement',
    name: page.title.split('|')[0].trim(),
    url: `${siteUrl}${page.url}`,
  }));

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toJsonLd(data) {
  return JSON.stringify(data, null, 2).replace(/<\/script/gi, '<\\/script');
}

function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PT Taka Hydrocore Indonesia',
    alternateName: 'Taka Hydrocore Indonesia',
    url: siteUrl,
    logo: `${siteUrl}/assets/taka-navbar-logo.png`,
    sameAs: [
      'https://www.instagram.com/takahydrocore.id/',
      'https://x.com/TakaGroupID',
      'https://www.linkedin.com/company/taka-hydrocore/posts/?feedView=all',
      'https://www.youtube.com/@takagroupid4652/videos',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Komplek Pilar Mas, Building No. 12 - 14, Jl. K.H. Ahmad Dahlan No.77, Cireundeu',
      addressLocality: 'Ciputat Timur',
      addressRegion: 'South Tangerang City, Banten',
      postalCode: '15419',
      addressCountry: 'ID',
    },
  };
}

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PT Taka Hydrocore Indonesia',
    url: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'PT Taka Hydrocore Indonesia',
    },
  };
}

function buildBreadcrumbJsonLd(page) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
  ];
  if (page.file !== 'index.html') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: page.title.split('|')[0].trim(),
      item: `${siteUrl}${page.url}`,
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function seoBlock(page) {
  const canonical = `${siteUrl}${page.url}`;
  const jsonLd = [
    buildBreadcrumbJsonLd(page),
  ];
  if (page.file === 'index.html') {
    jsonLd.unshift(buildOrganizationJsonLd(), buildWebsiteJsonLd(), {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Main website navigation',
      itemListElement: navItems,
    });
  }
  return [
    '  <!-- SEO -->',
    `  <link rel="canonical" href="${escapeHtml(canonical)}">`,
    '  <meta name="robots" content="index, follow">',
    `  <meta property="og:title" content="${escapeHtml(page.title)}">`,
    `  <meta property="og:description" content="${escapeHtml(page.description)}">`,
    `  <meta property="og:url" content="${escapeHtml(canonical)}">`,
    '  <meta property="og:type" content="website">',
    '  <meta property="og:site_name" content="PT Taka Hydrocore Indonesia">',
    `  <meta property="og:image" content="${escapeHtml(`${siteUrl}/assets/taka-navbar-logo.png`)}">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${escapeHtml(page.title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(page.description)}">`,
    ...jsonLd.map((data) => `  <script type="application/ld+json">\n${toJsonLd(data)}\n  </script>`),
    '  <!-- /SEO -->',
  ].join('\n');
}

function noindexBlock() {
  return [
    '  <!-- SEO -->',
    '  <meta name="robots" content="noindex, follow">',
    '  <!-- /SEO -->',
  ].join('\n');
}

function updateHead(file, page) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, 'utf8');
  html = html.replace(/\n\s*<!-- SEO -->[\s\S]*?<!-- \/SEO -->\n?/g, '\n');
  if (page) {
    html = html.replace(/<meta name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(page.description)}">`);
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
    html = html.replace(/(<title>[\s\S]*?<\/title>)/i, `$1\n${seoBlock(page)}`);
  } else {
    html = html.replace(/<meta name="robots"\s+content="[^"]*"\s*\/?>\n?/ig, '');
    html = html.replace(/(<title>[\s\S]*?<\/title>)/i, `$1\n${noindexBlock()}`);
  }
  fs.writeFileSync(full, html);
}

for (const page of pages) {
  updateHead(page.file, page);
}

for (const file of noindexPages) {
  updateHead(file, null);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${page.url}`)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin/',
  'Disallow: /tmp/',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'robots.txt'), robots);

console.log(`SEO generated for ${pages.length} indexable pages using ${siteUrl}`);
