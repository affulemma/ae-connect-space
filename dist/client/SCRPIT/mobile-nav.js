(function(){
  const NAV_SELECTOR = '.home-footer-nav, .navbar, .about-bottom-nav, .dashboard-sidebar';
  const LINK_SELECTOR = '.home-nav-links, .nav-links, .dashboard-sidebar nav, ul';
  const OPEN_CLASS = 'ae-mobile-nav-open';
  const READY_CLASS = 'ae-mobile-nav-ready';
  const ACTIVE_CLASS = 'ae-mobile-nav-active';
  const LINKS_OPEN_CLASS = 'is-open';
  const MOBILE_QUERY = '(max-width: 768px)';
  const media = window.matchMedia(MOBILE_QUERY);
  let activeMenu = null;
  let lastHandledAt = 0;
  let lastHandledToggle = null;
  let overlay = null;
  let authNavReady = false;

  function isMobile(){
    return media.matches;
  }

  function getOverlay(){
    if(overlay) return overlay;
    overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'ae-mobile-nav-overlay';
    overlay.setAttribute('aria-label', 'Close navigation');
    overlay.hidden = true;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMenu);
    overlay.addEventListener('touchend', closeMenu, { passive: true });
    return overlay;
  }

  function getLinks(nav){
    return nav.querySelector(LINK_SELECTOR);
  }

  function ensureToggle(nav){
    let toggle = nav.querySelector('.menu-toggle');
    if(toggle) return toggle;
    toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '&#9776;';
    const brand = nav.querySelector('.mini-brand, .logo, .about-brand, .dashboard-brand');
    if(brand && brand.nextSibling){
      nav.insertBefore(toggle, brand.nextSibling);
    }else{
      nav.insertBefore(toggle, nav.firstChild);
    }
    return toggle;
  }

  function lockScroll(){
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.dataset.aeScrollY = String(scrollY);
    document.body.dataset.aePosition = document.body.style.position || '';
    document.body.dataset.aeTop = document.body.style.top || '';
    document.body.dataset.aeWidth = document.body.style.width || '';
    document.body.dataset.aeOverflow = document.body.style.overflow || '';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add(OPEN_CLASS);
    document.body.classList.add(OPEN_CLASS);
  }

  function unlockScroll(){
    const scrollY = Number(document.body.dataset.aeScrollY || 0);
    document.body.style.position = document.body.dataset.aePosition || '';
    document.body.style.top = document.body.dataset.aeTop || '';
    document.body.style.width = document.body.dataset.aeWidth || '';
    document.body.style.overflow = document.body.dataset.aeOverflow || '';
    delete document.body.dataset.aeScrollY;
    delete document.body.dataset.aePosition;
    delete document.body.dataset.aeTop;
    delete document.body.dataset.aeWidth;
    delete document.body.dataset.aeOverflow;
    document.documentElement.classList.remove(OPEN_CLASS);
    document.body.classList.remove(OPEN_CLASS);
    window.scrollTo(0, scrollY);
  }

  function openMenu(nav, links, toggle){
    if(activeMenu && activeMenu.nav !== nav) closeMenu();
    activeMenu = { nav, links, toggle };
    nav.classList.add(ACTIVE_CLASS);
    links.classList.add(LINKS_OPEN_CLASS);
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    toggle.innerHTML = '&times;';
    const panel = getOverlay();
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add(ACTIVE_CLASS));
    lockScroll();
  }

  function closeMenu(){
    if(!activeMenu) return;
    const { nav, links, toggle } = activeMenu;
    nav.classList.remove(ACTIVE_CLASS);
    links.classList.remove(LINKS_OPEN_CLASS);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.innerHTML = '&#9776;';
    if(overlay){
      overlay.classList.remove(ACTIVE_CLASS);
      window.setTimeout(() => {
        if(!activeMenu) overlay.hidden = true;
      }, 240);
    }
    activeMenu = null;
    unlockScroll();
  }

  function toggleMenu(event, nav, links, toggle){
    if(event){
      if(event.cancelable) event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    if(!isMobile()) return;
    const now = Date.now();
    if(lastHandledToggle === toggle && now - lastHandledAt < 420) return;
    lastHandledAt = now;
    lastHandledToggle = toggle;
    if(activeMenu && activeMenu.nav === nav){
      closeMenu();
    }else{
      openMenu(nav, links, toggle);
    }
  }

  function prepareNav(nav, index){
    const links = getLinks(nav);
    if(!links || nav.classList.contains(READY_CLASS)) return;
    const toggle = ensureToggle(nav);
    const id = links.id || `ae-mobile-nav-links-${index}`;
    links.id = id;
    nav.classList.add(READY_CLASS);
    links.classList.add('ae-mobile-nav-links');
    toggle.classList.add('ae-mobile-menu-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');

    ['pointerup','touchend','click'].forEach(type => {
      toggle.addEventListener(type, event => toggleMenu(event, nav, links, toggle), { capture: true, passive: false });
    });

    links.addEventListener('click', event => {
      if(isMobile() && event.target.closest('a')) closeMenu();
    });
  }

  function closeIfDesktop(){
    if(!isMobile()) closeMenu();
  }

  function initMobileNav(){
    document.querySelectorAll(NAV_SELECTOR).forEach(prepareNav);
    getOverlay();
    enhanceAuthNavigation();
  }

  function pagePrefix(){
    return window.location.pathname.includes('/HTML/') ? '' : 'HTML/';
  }

  function dashboardHref(){
    return `${pagePrefix()}dashboard.html`;
  }

  function authHref(){
    return `${pagePrefix()}auth.html`;
  }

  function setDashboardNavLink(isSignedIn){
    document.querySelectorAll('.home-nav-links, .nav-links').forEach(list => {
      let item = list.querySelector('[data-student-dashboard-nav]');
      const cta = list.querySelector('a.nav-cta');

      if(isSignedIn){
        if(!item){
          item = document.createElement('li');
          const link = document.createElement('a');
          link.dataset.studentDashboardNav = 'true';
          link.href = dashboardHref();
          link.textContent = 'Student Dashboard';
          item.appendChild(link);
          if(cta && cta.closest('li')){
            list.insertBefore(item, cta.closest('li'));
          }else{
            list.appendChild(item);
          }
        }
        const link = item.querySelector('a');
        link.href = dashboardHref();
        link.classList.toggle('active', window.location.pathname.endsWith('/dashboard.html'));
        if(cta && cta.getAttribute('href') && cta.getAttribute('href').includes('auth.html')){
          cta.textContent = 'Profile';
          cta.href = `${dashboardHref()}#profile`;
        }
        return;
      }

      if(item) item.remove();
      if(cta && cta.textContent.trim() === 'Profile'){
        cta.textContent = 'Get Started';
        cta.href = authHref();
      }
    });
  }

  function enhanceAuthNavigation(){
    if(authNavReady) return;
    authNavReady = true;
    import('../BACKEND/firebase-config.js')
      .then(({ auth }) => import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js')
        .then(({ onAuthStateChanged }) => {
          onAuthStateChanged(auth, user => setDashboardNavLink(Boolean(user)));
        }))
      .catch(error => {
        console.warn('A.E CONNECT auth navigation could not load:', error);
      });
  }

  const visualCardSelector = [
    '.program-card', '.roadmap-card', '.universal-skill-card',
    '.resource-path-card', '.opportunity-card', '.scholarship-card',
    '.ai-tool-card', '.material-book-card', '.enterprise-card'
  ].join(',');

  const exactSkillImages = [
    { words: /^econometrics$/i, url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80', label: 'Economic calculations and quantitative analysis' },
    { words: /^economic forecasting$/i, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80', label: 'Economic forecasting charts' },
    { words: /^stata$/i, url: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=900&q=80', label: 'Statistical analysis and charts' },
    { words: /^spss$/i, url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=900&q=80', label: 'Statistical data analysis' },
    { words: /^r programming$/i, url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80', label: 'Programming code for data analysis' },
    { words: /python for economics|python for gis/i, url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80', label: 'Python programming workspace' },
    { words: /^financial modelling$/i, url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80', label: 'Financial markets and modelling' },
    { words: /^economic research$/i, url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80', label: 'Research books and academic study' },
    { words: /^policy analysis$/i, url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80', label: 'Government and economic policy' },
    { words: /^data visualization$/i, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80', label: 'Interactive data visualization dashboard' },
    { words: /^power bi$/i, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80', label: 'Business intelligence dashboard' },
    { words: /public policy|policy writing|policy analysis/i, url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80', label: 'Government policy and public institutions' },
    { words: /marketing|digital marketing|campaign/i, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80', label: 'Digital marketing campaign dashboard' },
    { words: /^arcgis pro$/i, url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80', label: 'Digital geographic map' },
    { words: /^qgis$/i, url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80', label: 'Urban geography viewed from above' },
    { words: /^remote sensing$/i, url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80', label: 'Earth observation from space' },
    { words: /gps.*field surveying/i, url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80', label: 'Aerial field surveying' },
    { words: /^autocad$/i, url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80', label: 'Technical design and construction planning' },
    { words: /^google earth engine$/i, url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=900&q=80', label: 'Earth imagery and satellite technology' },
    { words: /^spatial data analysis$/i, url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=80', label: 'Spatial data analysis workspace' },
    { words: /cartography.*map design/i, url: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=900&q=80', label: 'Cartography and map design' },
    { words: /^drone mapping$/i, url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80', label: 'Drone used for aerial mapping' },
    { words: /gis programming/i, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80', label: 'Technology and geospatial programming' }
  ];

  const usedVisualUrls = new Set();

  const subjectImages = [
    { words: /gis|geograph|map|cartograph|remote sensing|satellite|gps|earth engine|spatial|survey|drone/i, url: '../ASSETS/images/geography.jpg', label: 'Map and geospatial planning', symbol: '⌖' },
    { words: /data|analytic|statistics|spss|stata|excel|power bi|tableau|sql|python|machine learning|artificial intelligence|cloud|cyber|software|programming/i, url: '../ASSETS/images/business-ict.jpg', label: 'Data and digital technology', symbol: '▥' },
    { words: /nurs|medical|health|clinical|pharmacy|physio|biomedical|public health|nutrition|dent|medicine/i, url: '../ASSETS/images/biology.jpg', label: 'Health and clinical practice', symbol: '✚' },
    { words: /agric|farm|crop|soil|irrigation|animal|food|agribusiness|forestry/i, url: '../ASSETS/images/general-agriculture.jpg', label: 'Agriculture and field work', symbol: '♧' },
    { words: /account|finance|bank|economic|business|commerce|tax|audit|investment|entrepreneur|marketing|sales/i, url: '../ASSETS/images/economics.jpg', label: 'Business strategy and finance', symbol: '↗' },
    { words: /engineer|construction|architecture|autocad|mechanic|electrical|civil|building|quantity|manufactur/i, url: '../ASSETS/images/engineering-science.jpg', label: 'Engineering and construction', symbol: '⌁' },
    { words: /law|legal|crimin|justice|govern|politic|policy|public administration/i, url: '../ASSETS/images/government.jpg', label: 'Law and public policy', symbol: '⚖' },
    { words: /design|art|fashion|animation|film|photo|music|theatre|creative|ux|ui|media/i, url: '../ASSETS/images/graphic-design.jpg', label: 'Creative design practice', symbol: '✦' },
    { words: /education|teach|academic|research|study|student|learning|course|book|resource|certif/i, url: '../ASSETS/images/beyond-lecture-room.jpg', label: 'Research and learning', symbol: '◎' },
    { words: /environment|climate|sustainab|ecology|water|renewable|natural resource/i, url: '../ASSETS/images/science-geography.jpg', label: 'Environment and sustainability', symbol: '◌' },
    { words: /communication|language|journal|social|human resource|psychology|sociology|community|network/i, url: '../ASSETS/images/ae-connect-network-hero.png', label: 'Communication and collaboration', symbol: '◫' },
    { words: /tourism|travel|hospitality|aviation|transport|event/i, url: '../ASSETS/images/beyond-lecture-room.jpg', label: 'Travel and hospitality', symbol: '✈' }
  ];

  const fallbackVisual = {
    url: '../ASSETS/images/beyond-lecture-room.jpg',
    label: 'Practical professional learning',
    symbol: '◇'
  };

  const skillSymbols = [
    { words: /research|method|literature|survey/i, symbol: '⌕' },
    { words: /writing|document|report|transcription/i, symbol: '✎' },
    { words: /interview|speaking|presentation|communication/i, symbol: '◖' },
    { words: /risk|forecast|predict|model/i, symbol: '△' },
    { words: /policy|governance|election|public administration/i, symbol: '⚑' },
    { words: /legal|law|court|contract|case file|ethics|paralegal/i, symbol: '⚖' },
    { words: /data|analytic|statistics|spss|stata|excel|power bi|tableau/i, symbol: '▥' },
    { words: /code|program|python|javascript|sql|software|technology|e-discovery/i, symbol: '</>' },
    { words: /finance|account|economic|audit|tax|investment/i, symbol: '↗' },
    { words: /map|gis|spatial|survey|remote sensing|gps|drone/i, symbol: '⌖' },
    { words: /design|creative|visual|media|art|fashion/i, symbol: '✦' },
    { words: /health|clinical|medical|nursing|care|pharmacy/i, symbol: '✚' }
  ];

  function titleHash(value){
    return [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  }

  function addCardVisual(card){
    if(card.dataset.aeVisualReady === 'true' || card.querySelector(':scope > .ae-card-visual')) return;
    const title = (card.querySelector('h2,h3,h4')?.textContent || '').trim();
    const subject = `${card.textContent || ''} ${card.getAttribute('href') || ''}`;
    const exactImage = exactSkillImages.find(item => item.words.test(title));
    const categoryImage = subjectImages.find(item => item.words.test(title)) || subjectImages.find(item => item.words.test(subject)) || fallbackVisual;
    const image = exactImage || categoryImage;
    usedVisualUrls.add(image.url);
    const visual = document.createElement('span');
    visual.className = 'ae-card-visual';
    visual.setAttribute('role', 'img');
    visual.setAttribute('aria-label', `${title || image.label}: ${image.label}`);
    const hash = titleHash(title || subject);
    const hue = hash % 360;
    const symbol = skillSymbols.find(item => item.words.test(title))?.symbol || image.symbol || '◇';
    visual.style.setProperty('--visual-accent', `hsl(${hue} 68% 52%)`);
    visual.style.setProperty('--visual-shift', `${35 + (hash % 31)}%`);
    visual.style.backgroundImage = `linear-gradient(135deg,rgba(8,32,56,.18),rgba(8,32,56,.68)),url("${image.url}")`;
    const caption = document.createElement('span');
    const icon = document.createElement('b');
    const captionText = document.createElement('small');
    caption.className = 'ae-card-visual-caption';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = symbol;
    captionText.textContent = title || image.label;
    caption.append(icon, captionText);
    visual.appendChild(caption);
    card.prepend(visual);
    card.dataset.aeVisualReady = 'true';
  }

  function enhanceVisualCards(root = document){
    if(root.matches?.(visualCardSelector)) addCardVisual(root);
    root.querySelectorAll?.(visualCardSelector).forEach(addCardVisual);
  }

  function initCardVisuals(){
    enhanceVisualCards();
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if(node.nodeType === Node.ELEMENT_NODE) enhanceVisualCards(node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function roadmapSkillLevel(title){
    if(/advanced|machine learning|deep learning|econometric|forecast|forensic|cyber|structural|simulation/i.test(title)) return 'Advanced';
    if(/analysis|programming|research|policy|design|management|account|marketing|survey|gis|power bi|spss|stata|sql|autocad|drone|clinical/i.test(title)) return 'Intermediate';
    return 'Beginner';
  }

  function addCuratedSkillVisual(card, title){
    const approved = window.AE_SKILL_IMAGE_MAP?.[title.toUpperCase()] || window.AE_SKILL_IMAGE_FALLBACK;
    const visual = document.createElement('span');
    visual.className = `ae-card-visual ae-curated-skill-visual visual-${approved.theme || approved.type}`;
    visual.setAttribute('role', 'img');
    visual.setAttribute('aria-label', approved.type === 'image' ? approved.label : `${title}: ${approved.label}`);
    if(approved.type === 'image'){
      visual.style.backgroundImage = `linear-gradient(180deg,rgba(8,32,56,.04),rgba(8,32,56,.18)),url("${approved.url}")`;
    }else{
      const mark = document.createElement('b');
      const label = document.createElement('small');
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = approved.icon || 'AE';
      label.textContent = title;
      visual.append(mark, label);
    }
    card.prepend(visual);
    card.dataset.aeVisualReady = 'true';
    return visual;
  }

  function enhanceRoadmapSkillCard(card, index){
    if(card.dataset.aeLearningCard === 'true') return;
    const titleNode = card.querySelector(':scope > h2,:scope > h3,:scope > h4');
    if(!titleNode) return;
    const title = titleNode.textContent.trim();
    const description = card.querySelector(':scope > p');
    const visual = addCuratedSkillVisual(card, title);
    const content = document.createElement('div');
    content.className = 'ae-skill-card-content';
    [titleNode, description].filter(Boolean).forEach(node => content.appendChild(node));
    if(description){
      description.textContent = `Build practical ${title.toLowerCase()} skills for projects, opportunities, and professional work.`;
    }
    const level = roadmapSkillLevel(title);
    const duration = 4 + (titleHash(title) % 7);
    const meta = document.createElement('div');
    meta.className = 'ae-skill-meta';
    meta.innerHTML = `<span class="ae-skill-level level-${level.toLowerCase()}">${level}</span><span class="ae-skill-duration" aria-label="Estimated learning duration">${duration} weeks</span>`;
    const action = document.createElement('span');
    action.className = 'ae-skill-start';
    action.innerHTML = 'Start Learning <b aria-hidden="true">&rarr;</b>';
    content.append(meta, action);
    if(visual?.nextSibling) card.insertBefore(content, visual.nextSibling);
    else card.appendChild(content);
    card.classList.add('ae-learning-skill-card');
    card.dataset.aeLearningCard = 'true';
    card.style.setProperty('--ae-card-order', String(index));
    card.setAttribute('aria-label', `${title}, ${level}, estimated ${duration} weeks. Start learning.`);
  }

  let skillMapPromise = null;
  function loadSkillImageMap(){
    if(window.AE_SKILL_IMAGE_MAP) return Promise.resolve();
    if(skillMapPromise) return skillMapPromise;
    skillMapPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../SCRPIT/skill-image-map.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return skillMapPromise;
  }

  async function initRoadmapLearningCards(){
    const file = location.pathname.split('/').pop() || '';
    const isSkillRoadmap = /-roadmap\.html$/i.test(file) && file !== 'program-roadmaps.html' && !document.body.classList.contains('student-roadmap-page');
    if(!isSkillRoadmap) return;
    try{
      await loadSkillImageMap();
    }catch(error){
      console.warn('A.E CONNECT curated skill image map could not load:', error);
      window.AE_SKILL_IMAGE_MAP = Object.freeze({});
      window.AE_SKILL_IMAGE_FALLBACK = Object.freeze({ type:'illustration', label:'Professional skill learning module', icon:'AE', theme:'neutral' });
    }
    document.body.classList.add('ae-premium-roadmap');
    document.querySelectorAll('.programs .about-grid .program-card').forEach(enhanceRoadmapSkillCard);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelector = [
    'main > section', 'main > header', '.dashboard-panel', '.admin-section',
    '.program-card', '.roadmap-card', '.skill-card', '.opportunity-card',
    '.scholarship-card', '.resource-card', '.story-card', '.enterprise-card',
    '.academic-community-card', '.discussion-card', '.community-post-card',
    '.about-card', '.book-card', '.journey-card', '.quick-actions > a'
  ].join(',');

  function revealElements(root = document){
    if(reducedMotion.matches) return;
    const candidates = [];
    if(root.matches?.(revealSelector)) candidates.push(root);
    root.querySelectorAll?.(revealSelector).forEach(element => candidates.push(element));
    candidates.forEach(element => {
      if(element.classList.contains('ae-reveal') || element.closest('[hidden]')) return;
      element.classList.add('ae-reveal');
      const siblings = element.parentElement ? [...element.parentElement.children].filter(item => item.matches?.(revealSelector)) : [];
      const index = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--ae-stagger', `${Math.min(index, 6) * 45}ms`);
      // A percentage-based IntersectionObserver threshold can never be reached
      // for sections that are much taller than the viewport (for example, the
      // Skills Hub grid). Reveal those sections immediately so their content
      // cannot remain permanently transparent.
      if(element.matches('main > section') && element.getBoundingClientRect().height > window.innerHeight * 1.25){
        element.classList.add('ae-in-view');
        return;
      }
      motionObserver?.observe(element);
    });
  }

  let motionObserver = null;
  function initMotion(){
    document.documentElement.classList.add('ae-motion-ready');
    document.body.classList.add('ae-page-enter');
    if(!reducedMotion.matches && 'IntersectionObserver' in window){
      motionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(!entry.isIntersecting) return;
          entry.target.classList.add('ae-in-view');
          motionObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -28px' });
      revealElements();
    }else{
      document.querySelectorAll(revealSelector).forEach(element => element.classList.add('ae-in-view'));
    }

    const dynamicObserver = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if(node.nodeType !== Node.ELEMENT_NODE) return;
      revealElements(node);
      const messages = node.matches?.('.chat-bubble,.message-item,.community-message') ? [node] : [...(node.querySelectorAll?.('.chat-bubble,.message-item,.community-message') || [])];
      messages.forEach(message => message.classList.add('ae-message-enter'));
      const notices = node.matches?.('.toast,.notification,[data-notification]') ? [node] : [...(node.querySelectorAll?.('.toast,.notification,[data-notification]') || [])];
      notices.forEach(notice => {
        notice.classList.add('ae-notification-enter');
        const timeout = Number(notice.dataset.timeout || 0);
        if(timeout > 0) window.setTimeout(() => dismissNotification(notice), timeout);
      });
    })));
    dynamicObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if(!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      if(link.target === '_blank' || link.hasAttribute('download') || url.origin !== location.origin || url.protocol === 'mailto:' || url.protocol === 'tel:' || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      document.body.classList.add('ae-page-leaving');
      window.setTimeout(() => { location.href = url.href; }, reducedMotion.matches ? 0 : 180);
    });
  }

  function dismissNotification(element){
    if(!element || !element.isConnected) return;
    element.classList.add('ae-notification-leave');
    window.setTimeout(() => element.remove(), reducedMotion.matches ? 0 : 220);
  }
  window.aeDismissNotification = dismissNotification;

  function initApp(){
    initMobileNav();
    initRoadmapLearningCards();
    initMotion();
    import('../BACKEND/newsletter.js').catch(error => {
      console.error('Newsletter signup could not be initialized:', error);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  }else{
    initApp();
  }

  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if(!isMobile() || !activeMenu) return;
    if(!activeMenu.nav.contains(event.target)) closeMenu();
  }, true);
  if(media.addEventListener){
    media.addEventListener('change', closeIfDesktop);
  }else if(media.addListener){
    media.addListener(closeIfDesktop);
  }
})();
