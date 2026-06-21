import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("HTML");
const slug = (value) => value.toLowerCase().replace(/&/g, "and").replace(/\+/g, "plus").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (value) => value.replace(/&/g, "&amp;");

const programs = [
  { dept: "ECONOMICS", file: "economics-roadmap.html", intro: "Economics students need analytical tools, statistical software, economic modelling, forecasting, research, and data communication skills for policy, banking, research, consulting, and development work.", field: "economic analysis, policy, finance, research, development, and consulting", skills: ["EXCEL", "POWER BI", "SPSS", "STATA", "R PROGRAMMING", "PYTHON FOR ECONOMICS", "DATA VISUALIZATION", "ECONOMIC FORECASTING", "RESEARCH METHODS", "ECONOMETRICS"] },
  { dept: "GEOGRAPHY / GIS", file: "geography-roadmap.html", intro: "Geography students need spatial technology, field data skills, map design, environmental analysis, and geospatial problem-solving abilities.", field: "GIS, planning, environmental management, surveying, logistics, research, and geospatial intelligence", skills: ["ARCGIS PRO", "QGIS", "REMOTE SENSING", "GPS & FIELD SURVEYING", "AUTOCAD", "GOOGLE EARTH ENGINE", "SPATIAL DATA ANALYSIS", "CARTOGRAPHY & MAP DESIGN", "DRONE MAPPING", "GIS PROGRAMMING (PYTHON FOR GIS)"] },
  { dept: "POLITICAL SCIENCE", file: "political-science-roadmap.html", intro: "Political Science students need policy analysis, research, public communication, stakeholder engagement, monitoring, evaluation, and political risk thinking.", field: "public policy, governance, diplomacy, advocacy, research, elections, and public administration", skills: ["PUBLIC POLICY ANALYSIS", "RESEARCH METHODS", "DATA ANALYSIS", "POLICY WRITING", "PUBLIC SPEAKING", "STAKEHOLDER ENGAGEMENT", "MONITORING & EVALUATION", "SPSS", "REPORT WRITING", "POLITICAL RISK ANALYSIS"] },
  { dept: "LAW", file: "law-roadmap.html", intro: "Law students need legal research, writing, reasoning, advocacy, negotiation, citation, technology, and professional communication skills.", field: "legal practice, advocacy, corporate advisory, compliance, dispute resolution, policy, and justice systems", skills: ["LEGAL RESEARCH", "LEGAL WRITING", "CASE ANALYSIS", "CONTRACT DRAFTING", "LEGAL TECHNOLOGY", "PUBLIC SPEAKING", "NEGOTIATION", "ADVOCACY", "ALTERNATIVE DISPUTE RESOLUTION", "LEGAL CITATION"] },
  { dept: "SOCIOLOGY", file: "sociology-roadmap.html", intro: "Sociology students need social research, survey design, qualitative analysis, community development, monitoring, evaluation, reporting, and project skills.", field: "social research, NGOs, community development, monitoring and evaluation, policy, HR, and social programs", skills: ["SPSS", "QUALITATIVE RESEARCH", "SURVEY DESIGN", "NVIVO", "DATA ANALYSIS", "MONITORING & EVALUATION", "COMMUNITY DEVELOPMENT", "REPORT WRITING", "RESEARCH METHODS", "PROJECT MANAGEMENT"] },
  { dept: "STATISTICS", file: "statistics-roadmap.html", intro: "Statistics students need programming, databases, modelling, machine learning, visualization, data science, and big data skills for modern analytical careers.", field: "data science, analytics, research, finance, health, technology, surveys, and decision science", skills: ["R PROGRAMMING", "PYTHON", "SQL", "MACHINE LEARNING", "DATA SCIENCE", "POWER BI", "TABLEAU", "STATISTICAL MODELLING", "DATA VISUALIZATION", "BIG DATA ANALYTICS"] },
  { dept: "ACCOUNTING", file: "accounting-roadmap.html", intro: "Accounting students need strong financial reporting, accounting software, audit tools, taxation knowledge, analytics, and professional judgement.", field: "accounting, audit, tax, finance, banking, corporate reporting, and consulting", skills: ["MICROSOFT EXCEL", "QUICKBOOKS", "TALLY", "SAP", "FINANCIAL MODELLING", "POWER BI", "TAXATION SOFTWARE", "AUDITING TOOLS", "DATA ANALYTICS", "FINANCIAL REPORTING"] },
  { dept: "BANKING & FINANCE", file: "banking-and-finance-roadmap.html", intro: "Banking and Finance students need modelling, analytics, markets knowledge, risk thinking, portfolio skills, forecasting, and professional finance tools.", field: "banking, investment, risk, corporate finance, insurance, treasury, and financial analysis", skills: ["FINANCIAL MODELLING", "EXCEL", "POWER BI", "BLOOMBERG TERMINAL", "PYTHON FOR FINANCE", "RISK ANALYSIS", "INVESTMENT ANALYSIS", "FINANCIAL FORECASTING", "PORTFOLIO MANAGEMENT", "DATA VISUALIZATION"] },
  { dept: "COMPUTER SCIENCE", file: "computer-science-roadmap.html", intro: "Computer Science students need programming, databases, software development, security, cloud, machine learning, and professional version control skills.", field: "software engineering, data, cybersecurity, cloud computing, AI, product development, and technical support", skills: ["PYTHON", "JAVA", "JAVASCRIPT", "SQL", "WEB DEVELOPMENT", "MOBILE APP DEVELOPMENT", "CYBERSECURITY", "CLOUD COMPUTING", "MACHINE LEARNING", "GIT & GITHUB"] },
  { dept: "NURSING", file: "nursing-roadmap.html", intro: "Nursing students need clinical communication, accurate documentation, digital health systems, research awareness, medical statistics, and patient-centered practice skills.", field: "clinical care, hospitals, public health, community health, health records, patient safety, and nursing leadership", skills: ["ELECTRONIC HEALTH RECORDS", "MEDICAL RESEARCH", "PUBLIC HEALTH DATA ANALYSIS", "PATIENT DOCUMENTATION", "HEALTHCARE INFORMATICS", "CLINICAL COMMUNICATION", "FIRST AID CERTIFICATION", "HEALTH INFORMATION SYSTEMS", "COMMUNITY HEALTH ASSESSMENT", "MEDICAL STATISTICS"] },
  { dept: "PUBLIC HEALTH", file: "public-health-roadmap.html", intro: "Public Health students need epidemiology, research, health data, GIS, monitoring, evaluation, informatics, survey design, and policy analysis skills.", field: "population health, disease prevention, NGOs, health policy, surveillance, research, and health programs", skills: ["EPIDEMIOLOGY", "SPSS", "R PROGRAMMING", "GIS FOR HEALTH", "DATA VISUALIZATION", "MONITORING & EVALUATION", "RESEARCH METHODS", "PUBLIC HEALTH INFORMATICS", "SURVEY DESIGN", "HEALTH POLICY ANALYSIS"] },
  { dept: "MARKETING", file: "marketing-roadmap.html", intro: "Marketing students need digital marketing, analytics, content, branding, copywriting, SEO, email marketing, design tools, and research skills.", field: "digital marketing, branding, advertising, sales, market research, content, social media, and customer growth", skills: ["DIGITAL MARKETING", "SOCIAL MEDIA MARKETING", "SEO", "GOOGLE ANALYTICS", "CONTENT MARKETING", "CANVA", "COPYWRITING", "EMAIL MARKETING", "BRANDING", "MARKETING RESEARCH"] },
  { dept: "BUSINESS ADMINISTRATION", file: "business-administration-roadmap.html", intro: "Business Administration students need management tools, leadership ability, business analysis, financial awareness, strategy, people management, and communication skills.", field: "management, entrepreneurship, operations, HR, strategy, consulting, sales, and organizational leadership", skills: ["EXCEL", "PROJECT MANAGEMENT", "POWER BI", "ENTREPRENEURSHIP", "LEADERSHIP", "BUSINESS ANALYSIS", "FINANCIAL LITERACY", "BUSINESS COMMUNICATION", "STRATEGIC PLANNING", "HUMAN RESOURCE MANAGEMENT"] },
];

const keep = new Set(["beyond-the-lecture-room.html", ...programs.map((program) => program.file)]);
for (const program of programs) {
  for (const skill of program.skills) keep.add(`${slug(program.dept)}-${slug(skill)}.html`);
}

const platformLinks = (skill) => {
  const query = encodeURIComponent(skill.toLowerCase().replace(/\([^)]*\)/g, "").trim());
  return [
    ["COURSERA", `https://www.coursera.org/search?query=${query}`],
    ["EDX", `https://www.edx.org/search?q=${query}`],
    ["UDEMY", `https://www.udemy.com/courses/search/?q=${query}`],
    ["YOUTUBE", `https://www.youtube.com/results?search_query=${query}+full+course`],
  ];
};

const skillPage = (program, skill) => {
  const safeDept = esc(program.dept);
  const safeSkill = esc(skill);
  const safeField = esc(program.field);
  const platforms = platformLinks(skill).map(([name, url]) => `<h3>${name}</h3>
<p>${name} can help you learn ${safeSkill} through structured lessons, practical examples, and certificates you can add to your CV or LinkedIn profile.</p>
<p><a href="${url}" target="_blank">VISIT ${name} ${safeSkill} RESOURCES</a></p>`).join("\n");
  const videos = [
    [`${safeSkill} FULL COURSE FOR BEGINNERS`, `${skill} full course for beginners`],
    [`${safeSkill} TUTORIAL FOR STUDENTS`, `${skill} tutorial for students`],
    [`${safeSkill} PRACTICAL PROJECTS`, `${skill} practical project`],
  ].map(([text, query]) => `<p><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(query)}" target="_blank">${text}</a></p>`).join("\n");
  const projects = [
    `${skill.replace(/\([^)]*\)/g, "").trim()} BEGINNER PORTFOLIO PROJECT`,
    `${program.dept} PRACTICAL CASE STUDY`,
    `${skill.replace(/\([^)]*\)/g, "").trim()} REPORT OR DASHBOARD`,
    `${skill.replace(/\([^)]*\)/g, "").trim()} FIELD OR WORKPLACE SIMULATION`,
    `${skill.replace(/\([^)]*\)/g, "").trim()} PRESENTATION PROJECT`,
  ].map((project) => `<h3>${esc(project)}</h3>
<p>Create a simple but practical project that proves you can apply ${safeSkill} in a real ${safeDept} or workplace situation.</p>`).join("\n");
  const next = program.skills.filter((item) => item !== skill).slice(0, 5).map((item) => `<li>${esc(item)}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeSkill} | A.E CONNECT SPACE</title>
<link rel="stylesheet" href="../STYLE/style.css">
</head>
<body>
<nav class="navbar"><div class="logo"><span>A.E CONNECT SPACE</span></div><ul class="nav-links"><li><a href="index.html">HOME</a></li><li><a href="${program.file}">BACK TO ${safeDept} ROADMAP</a></li></ul></nav>
<section class="about-section">
<h1 style="text-align:center; color:#0a2342; margin-bottom:20px;">${safeSkill}</h1>
<p class="about-intro">${safeSkill} is an important professional skill for ${safeDept} students because it helps them move beyond classroom theory into practical work, career preparation, and real industry problem-solving.</p>
<h2>${safeSkill} OVERVIEW</h2>
<p>${safeSkill} gives students the ability to understand professional tasks, use relevant tools, and produce work that employers, clients, communities, and organizations can actually use. In ${safeField}, this skill helps students connect academic knowledge with practical results.</p>
<h2>WHY ${safeSkill} MATTERS TODAY</h2>
<p>Today, employers want graduates who can solve problems, use modern tools, communicate clearly, and show evidence of what they can do. ${safeSkill} matters because it turns knowledge into practical value and helps students compete for internships, projects, and entry-level opportunities.</p>
<h2>WHY ${safeDept} STUDENTS SHOULD LEARN ${safeSkill}</h2>
<p>${safeDept} students should learn ${safeSkill} because it directly supports the kind of work done in ${safeField}. It helps students build confidence, understand professional expectations, and prepare for real workplace responsibilities.</p>
<ul><li>It strengthens your CV and portfolio.</li><li>It helps you complete better academic and professional projects.</li><li>It prepares you for internships and entry-level roles.</li><li>It improves your ability to communicate professional results.</li><li>It helps you stand out from students who only depend on the degree.</li></ul>
<h2>WHAT CAN YOU DO WITH ${safeSkill}?</h2>
<p>With ${safeSkill}, you can complete practical tasks, support decision-making, improve project quality, and contribute meaningfully in professional environments.</p>
<ul><li>Build practical projects related to ${safeDept}.</li><li>Prepare professional reports and presentations.</li><li>Analyze real problems and propose solutions.</li><li>Support research, planning, operations, or service delivery.</li><li>Create evidence of your skill for your CV, LinkedIn, and interviews.</li></ul>
<h2>CAREER OPPORTUNITIES THAT USE ${safeSkill}</h2>
<p>${safeSkill} can support career paths in ${safeField}. The exact job title may differ by organization, but the skill improves your readiness for practical professional work.</p>
<ul><li>ENTRY-LEVEL ${safeDept} PROFESSIONAL</li><li>RESEARCH ASSISTANT</li><li>PROJECT OFFICER</li><li>ANALYST</li><li>CONSULTANT</li><li>TECHNICAL ASSISTANT</li><li>PROGRAM OFFICER</li><li>PROFESSIONAL INTERN</li></ul>
<h2>IS ${safeSkill} WORTH LEARNING?</h2>
<p>Yes. ${safeSkill} is worth learning because it gives you practical evidence of ability. A degree may help you qualify, but skills like ${safeSkill} help you perform, explain your value, and compete with confidence.</p>
<h2>RECOMMENDED PLATFORMS TO LEARN ${safeSkill} &amp; EARN CERTIFICATES</h2>
${platforms}
<h2>FREE YOUTUBE RESOURCES</h2>
<p>If you are not ready to pay for a course, YouTube is a good place to begin. Use the resources below to find beginner lessons, full courses, and practical demonstrations.</p>
${videos}
<h2>PROJECTS YOU CAN BUILD</h2>
${projects}
<h2>WHAT NEXT?</h2>
<p>After learning ${safeSkill}, continue with related skills that make you stronger in ${safeDept}.</p>
<ul>${next}</ul>
<h2>A.E CONNECT TIP</h2>
<p>Do not only read about ${safeSkill}. Learn it, practice it, build a small project, and save proof of your work. The students who stand out are the ones who can show what they have built, not only what they have studied.</p>
</section>
<footer><p>&copy; A.E CONNECT SPACE</p></footer>
</body>
</html>
`;
};

const roadmapPage = (program) => {
  const cards = program.skills.map((skill) => `<a href="${slug(program.dept)}-${slug(skill)}.html" class="program-card"><h3>${esc(skill)}</h3><p>${esc(skill)} is a practical skill that helps ${esc(program.dept)} students prepare for real professional work.</p></a>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(program.dept)} Roadmap | A.E CONNECT SPACE</title>
<link rel="stylesheet" href="../STYLE/style.css">
</head>
<body>
<nav class="navbar"><div class="logo"><span>A.E CONNECT SPACE</span></div><ul class="nav-links"><li><a href="index.html">HOME</a></li><li><a href="programs.html">PROGRAMS</a></li><li><a href="beyond-the-lecture-room.html">BACK</a></li></ul></nav>
<section class="programs">
<h1>${esc(program.dept)} ROADMAP</h1>
<p class="about-intro">${program.intro}</p>
<div class="about-grid">
${cards}
</div>
</section>
<section class="about-section"><h2>WHY THESE SKILLS MATTER</h2><div class="about-grid"><div class="about-card"><h3>PROFESSIONAL READINESS</h3><p>These skills help students move from theory to practical work.</p></div><div class="about-card"><h3>EMPLOYER DEMAND</h3><p>Employers value graduates who can use tools, solve problems, and communicate results.</p></div><div class="about-card"><h3>CAREER GROWTH</h3><p>Building these skills early creates stronger opportunities for internships, projects, and jobs.</p></div></div></section>
<footer><p>&copy; A.E CONNECT SPACE</p></footer>
</body>
</html>
`;
};

const beyondPage = () => {
  const cards = programs.map((program) => `<a href="${program.file}" class="program-card"><h3>${esc(program.dept)}</h3><p>Explore practical skills, learning resources, projects, and career preparation for ${esc(program.dept)} students.</p></a>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Beyond The Lecture Room | A.E CONNECT SPACE</title>
<link rel="stylesheet" href="../STYLE/style.css">
</head>
<body>
<nav class="navbar"><div class="logo"><span>A.E CONNECT SPACE</span></div><ul class="nav-links"><li><a href="index.html">HOME</a></li><li><a href="programs.html">PROGRAMS</a></li></ul></nav>
<section class="programs">
<h1>BEYOND THE LECTURE ROOM</h1>
<p class="about-intro">Your degree alone is not enough. Choose your department and explore the practical skills, tools, professional knowledge, and career-building abilities that matter in that field.</p>
<div class="program-grid">
${cards}
</div>
</section>
<footer><p>&copy; A.E CONNECT SPACE</p></footer>
</body>
</html>
`;
};

await fs.writeFile(path.join(root, "beyond-the-lecture-room.html"), beyondPage());
let written = 1;

for (const program of programs) {
  await fs.writeFile(path.join(root, program.file), roadmapPage(program));
  written += 1;

  for (const skill of program.skills) {
    await fs.writeFile(path.join(root, `${slug(program.dept)}-${slug(skill)}.html`), skillPage(program, skill));
    written += 1;
  }
}

let removed = 0;
for (const file of await fs.readdir(root)) {
  if (!file.endsWith(".html") || keep.has(file)) continue;
  const full = path.join(root, file);
  const html = await fs.readFile(full, "utf8").catch(() => "");
  if (file.endsWith("-roadmap.html") || html.includes("INTERNSHIP OPPORTUNITIES THAT USE") || html.includes("RECOMMENDED CERTIFICATIONS FOR")) {
    await fs.unlink(full);
    removed += 1;
  }
}

console.log(`Restored ${written} pages and removed ${removed} expansion pages.`);
