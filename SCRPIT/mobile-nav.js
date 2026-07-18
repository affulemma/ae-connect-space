(function(){
  const NAV_SELECTOR = '.home-footer-nav, .navbar, .about-bottom-nav';
  const LINK_SELECTOR = '.home-nav-links, .nav-links, ul';
  const OPEN_CLASS = 'ae-mobile-nav-open';
  const READY_CLASS = 'ae-mobile-nav-ready';
  const ACTIVE_CLASS = 'ae-mobile-nav-active';
  const LINKS_OPEN_CLASS = 'is-open';
  const MOBILE_QUERY = '(max-width: 768px)';
  const media = window.matchMedia(MOBILE_QUERY);
  let activeMenu = null;
  let lastHandledAt = 0;
  let overlay = null;

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
      overlay.hidden = true;
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
    if(event && event.type === 'click' && now - lastHandledAt < 450) return;
    lastHandledAt = now;
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

  document.querySelectorAll(NAV_SELECTOR).forEach(prepareNav);
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
