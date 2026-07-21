(() => {
  const search = document.getElementById('pickCourseSearch');
  const grid = document.getElementById('pickCourseGrid');
  const results = document.getElementById('pickCourseResults');
  const empty = document.getElementById('pickCourseEmpty');
  const clear = document.getElementById('pickCourseClear');
  if (!search || !grid) return;

  const cards = [...grid.querySelectorAll('.pick-course-card')];

  function filterProgrammes() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card, index) => {
      const matches = !query || card.dataset.search.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) {
        card.style.setProperty('--pick-order', visible);
        card.classList.remove('pick-card-filtered-in');
        requestAnimationFrame(() => card.classList.add('pick-card-filtered-in'));
        visible += 1;
      }
    });
    results.textContent = query ? `${visible} programme${visible === 1 ? '' : 's'} found` : `Showing all ${cards.length} programmes`;
    empty.hidden = visible !== 0;
    grid.hidden = visible === 0;
  }

  function addRipple(event) {
    const action = event.target.closest('.pick-course-card-action');
    if (!action) return;
    const rect = action.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'pick-course-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    action.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 350);
  }

  search.addEventListener('input', filterProgrammes);
  grid.addEventListener('pointerdown', addRipple);
  clear.addEventListener('click', () => {
    search.value = '';
    filterProgrammes();
    search.focus();
  });
})();
