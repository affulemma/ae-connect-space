import fs from 'node:fs';
import path from 'node:path';

const htmlDir = path.resolve('HTML');
const beyondPath = path.join(htmlDir, 'beyond-the-lecture-room.html');
const beyondHtml = fs.readFileSync(beyondPath, 'utf8');

const customPages = new Map([
  ['economics-roadmap.html', 'economics-student-roadmap.html'],
  ['geography-gis-roadmap.html', 'geography-gis-student-roadmap.html'],
  ['business-administration-roadmap.html', 'business-administration-student-roadmap.html'],
  ['computer-science-roadmap.html', 'computer-science-student-roadmap.html'],
  ['nursing-roadmap.html', 'nursing-student-roadmap.html'],
  ['mechanical-engineering-roadmap.html', 'engineering-student-roadmap.html'],
]);

const heroColors = [
  '#ff664f',
  '#2f7757',
  '#f2a722',
  '#17182d',
  '#ec6b75',
  '#4e94dd',
  '#7c5cff',
  '#0f766e',
  '#b45309',
  '#334155',
];

const cards = [...beyondHtml.matchAll(/<a href="([^"]+-roadmap\.html)" class="program-card"><h3>([^<]+)<\/h3>/g)]
  .map(match => ({ href: match[1], title: decodeEntities(match[2].trim()) }));

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleCase(value) {
  return value
    .toLowerCase()
    .split(/(\s+|\/|-)/)
    .map(part => /^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join('')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bGis\b/g, 'GIS')
    .replace(/\bIt\b/g, 'IT')
    .replace(/\bHr\b/g, 'HR');
}

function pageNameFromRoadmap(href) {
  return href.replace(/-roadmap\.html$/, '-student-roadmap.html');
}

function readSkills(href) {
  const roadmapPath = path.join(htmlDir, href);
  if (!fs.existsSync(roadmapPath)) return [];
  const html = fs.readFileSync(roadmapPath, 'utf8');
  const skills = [...html.matchAll(/<a href="[^"]+" class="program-card"><h3>([^<]+)<\/h3>/g)]
    .map(match => decodeEntities(match[1].trim()))
    .filter(skill => !/^(professional readiness|employer demand|career growth)$/i.test(skill));
  return [...new Set(skills)];
}

function splitSkills(skills) {
  const clean = skills.length ? skills : [
    'Research Skills',
    'Data Analysis',
    'Report Writing',
    'Communication',
    'Project Work',
    'Professional Networking',
  ];
  return {
    technical: clean.slice(0, Math.ceil(clean.length / 3) || 2),
    career: clean.slice(Math.ceil(clean.length / 3), Math.ceil((clean.length / 3) * 2)) || [],
    industry: clean.slice(Math.ceil((clean.length / 3) * 2)) || [],
  };
}

function opportunityNames(title) {
  const base = titleCase(title);
  return [
    `${base} Internships`,
    'Research Assistant Roles',
    'NGO & Community Projects',
    'Industry Pathways',
  ];
}

function levelSteps(groups) {
  const all = [...groups.technical, ...groups.career, ...groups.industry].filter(Boolean);
  const pick = (index, fallback) => all[index] || fallback;
  return [
    ['Build Your Foundation', [`Learn ${pick(0, 'Core Concepts')}`, 'Improve Communication', 'Join Communities']],
    ['Develop Core Skills', [`Practice ${pick(1, 'Data Analysis')}`, 'Build LinkedIn', 'Start Small Projects']],
    ['Gain Experience', [`Apply ${pick(2, 'Practical Tools')}`, 'Get Internship', 'Build Portfolio']],
    ['Launch Your Career', ['Network Professionally', 'Apply for Opportunities', 'Prepare CV & Career Path']],
  ];
}

function tags(values) {
  return values.length
    ? values.map(value => `<span>${escapeHtml(titleCase(value))}</span>`).join('\n')
    : '<span>Practical Skills</span>';
}

const studentTargets = cards.map(card => ({
  href: customPages.get(card.href) || pageNameFromRoadmap(card.href),
  title: titleCase(card.title),
}));

function roadmapDots(index) {
  const groupStart = Math.floor(index / 10) * 10;
  const group = studentTargets.slice(groupStart, groupStart + 10);
  return `<div class="roadmap-dots" aria-label="Program roadmap navigation">${group.map((target, groupIndex) => {
    const targetIndex = groupStart + groupIndex;
    const active = targetIndex === index;
    return `<a href="${target.href}"${active ? ' class="active" aria-current="page"' : ''} aria-label="Open ${escapeHtml(target.title)} roadmap"></a>`;
  }).join('')}</div>`;
}

function renderPage({ title, href, index }) {
  const pageTitle = titleCase(title);
  const groups = splitSkills(readSkills(href));
  const opportunities = opportunityNames(title);
  const steps = levelSteps(groups);
  const color = heroColors[index % heroColors.length];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)} Student Roadmap | A.E CONNECT SPACE</title>
<link rel="stylesheet" href="../STYLE/style.css?v=student-roadmap-auto-20260619">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>.auto-roadmap-page .student-roadmap-hero{background:${color};}</style>
</head>
<body class="home-page student-roadmap-page auto-roadmap-page">
<main>
<header class="student-roadmap-hero" id="top">
<div class="home-container">
<nav class="roadmap-breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>&rsaquo;</span><a href="programs.html">Programs</a><span>&rsaquo;</span><strong>${escapeHtml(pageTitle)}</strong></nav>
<div class="student-roadmap-title"><span class="student-roadmap-icon">&#9635;</span><div><h1>${escapeHtml(pageTitle)} Student Roadmap</h1><p>As a ${escapeHtml(pageTitle)} student, these are the skills that can help you stand out beyond the classroom. Follow this roadmap from Level 100 through Level 400.</p></div></div>
</div>
</header>
<section class="roadmap-skills-section"><div class="home-container"><div class="section-heading centered"><span class="eyebrow">Recommended Skills</span><h2>Skills That Make You Competitive</h2></div><div class="skill-cluster-grid">
<article class="skill-cluster-card"><span class="cluster-icon coral">&#9635;</span><h3>Technical Skills</h3><div class="skill-tags">${tags(groups.technical)}</div></article>
<article class="skill-cluster-card"><span class="cluster-icon amber">&#9636;</span><h3>Career Skills</h3><div class="skill-tags">${tags(groups.career)}</div></article>
<article class="skill-cluster-card"><span class="cluster-icon green">&#9638;</span><h3>Industry Knowledge</h3><div class="skill-tags">${tags(groups.industry)}</div></article>
</div></div></section>
<section class="roadmap-opportunities-section"><div class="home-container"><div class="section-heading centered"><span class="eyebrow">Opportunities</span><h2>Where These Skills Can Take You</h2></div><div class="opportunity-grid">
${opportunities.map((name, i) => `<article class="opportunity-card"><span>${String(i + 1).padStart(2, '0')}</span><h3>${escapeHtml(name)}</h3><p>Start exploring ${escapeHtml(name.toLowerCase())} to build real-world experience early.</p></article>`).join('\n')}
</div></div></section>
<section class="level-roadmap-section"><div class="home-container"><div class="section-heading centered"><span class="eyebrow">Learning Roadmap</span><h2>Your Path From Level 100 to Level 400</h2><p>Follow this structured roadmap to build your skills progressively and stay ahead of your peers.</p></div><div class="level-roadmap-list">
${steps.map((row, i) => {
  const classes = ['level-green', 'level-amber', 'level-orange', 'level-rose'];
  return `<article class="level-row ${classes[i]}"><div class="level-label"><span class="level-icon">${['&#9872;', '&#9813;', '&#9828;', '&#9824;'][i]}</span><h3>Level ${100 + (i * 100)}</h3><p>${row[0]}</p></div><div class="level-steps">${row[1].map((step, stepIndex) => `<span><b>${stepIndex + 1}</b>${escapeHtml(step)}</span>`).join('')}</div></article>`;
}).join('\n')}
</div></div></section>
<section class="roadmap-return-band"><div class="home-container roadmap-return-row"><a class="all-programs-link" href="beyond-the-lecture-room.html">&larr; All Programs</a>${roadmapDots(index)}</div></section>
</main>
${sharedNavAndFooter(pageTitle)}
</body>
</html>
`;
}

function sharedNavAndFooter(pageTitle) {
  const id = pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `<nav class="home-footer-nav" aria-label="Main navigation"><a class="mini-brand" href="index.html"><img src="../ASSETS/logo/logo.png" alt="A.E CONNECT SPACE logo"><span>A.E CONNECT SPACE</span></a><button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button><ul class="home-nav-links"><li><a href="index.html">Home</a></li><li><a class="active" href="programs.html">Programs</a></li><li><a href="skills.html">Skills Hub</a></li><li><a href="opportunities.html">Opportunities</a></li>
<li><a href="scholarships.html">Scholarships</a></li><li><a href="networking.html">Community</a></li><li><a href="events.html">Events</a></li><li><a href="stories.html">Stories</a></li><li><a href="about.html">About</a></li><li><a class="nav-cta" href="auth.html">Get Started</a></li></ul></nav>
<footer class="home-footer"><div class="home-container"><section class="newsletter"><div><h2>Stay in the Loop</h2><p>Get weekly updates on new programs, skill roadmaps, events, and opportunities delivered straight to your inbox.</p></div><form><label class="sr-only" for="${id}-newsletter-email">Email address</label><input id="${id}-newsletter-email" type="email" placeholder="your@email.com"><button type="submit">Subscribe</button></form></section><div class="footer-columns"><div><h3>Platform</h3><a href="programs.html">Programs Roadmap</a><a href="skills.html">Skills Hub</a><a href="opportunities.html">Opportunities</a><a href="scholarships.html">Scholarships</a><a href="stories.html">Success Stories</a></div><div><h3>Resources</h3><a href="events.html">Events</a><a href="resources.html">Resources Library</a><a href="skills.html">Skill Exchange</a><a href="resources.html">Blog & Guides</a></div><div><h3>Company</h3><a href="about.html">About Us</a><a href="auth.html">Contact</a><a href="auth.html">Careers</a><a href="networking.html">Partnerships</a></div><div><h3>Legal</h3><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Cookie Policy</a></div></div><div class="footer-bottom"><a class="mini-brand" href="index.html"><img src="../ASSETS/logo/logo.png" alt="A.E CONNECT SPACE logo"><span>A.E CONNECT SPACE</span></a><p>&copy; 2026 A.E CONNECT SPACE. All rights reserved.</p><div class="socials" aria-label="Social links"><a href="#" aria-label="X">X</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="Instagram">ig</a><a href="#top" aria-label="Back to top">&uarr;</a></div></div></div></footer>
<script>const menuToggle=document.querySelector('.menu-toggle');const homeNavLinks=document.querySelector('.home-nav-links');if(menuToggle&&homeNavLinks){menuToggle.addEventListener('click',()=>{const expanded=menuToggle.getAttribute('aria-expanded')==='true';menuToggle.setAttribute('aria-expanded',String(!expanded));homeNavLinks.classList.toggle('is-open');});}</script>`;
}

let updatedBeyond = beyondHtml;
let generated = 0;
let preserved = 0;
const updateBeyondLinks = false;

cards.forEach((card, index) => {
  const studentPage = customPages.get(card.href) || pageNameFromRoadmap(card.href);
  if (updateBeyondLinks) {
    updatedBeyond = updatedBeyond.replaceAll(`href="${card.href}"`, `href="${studentPage}"`);
  }

  if (customPages.has(card.href)) {
    preserved += 1;
    return;
  }

  fs.writeFileSync(path.join(htmlDir, studentPage), renderPage({ ...card, index }), 'utf8');
  generated += 1;
});

if (updateBeyondLinks) {
  fs.writeFileSync(beyondPath, updatedBeyond, 'utf8');
}

console.log(JSON.stringify({
  cards: cards.length,
  generated,
  preserved,
  uniqueTargets: new Set(cards.map(card => customPages.get(card.href) || pageNameFromRoadmap(card.href))).size,
}, null, 2));
