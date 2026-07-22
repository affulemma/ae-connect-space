(() => {
  const modal = document.getElementById('ctvetProgrammeModal');
  if (!modal) return;
  const title = document.getElementById('ctvetModalTitle');
  const description = document.getElementById('ctvetModalDescription');
  const skills = document.getElementById('ctvetModalSkills');
  const careers = document.getElementById('ctvetModalCareers');
  let opener = null;

  function renderList(host, values) {
    host.replaceChildren(...values.split('|').filter(Boolean).map(value => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  }

  function openProgramme(card, button) {
    opener = button;
    title.textContent = card.dataset.title || 'CTVET Programme';
    description.textContent = card.dataset.description || '';
    renderList(skills, card.dataset.skills || 'Practical training');
    renderList(careers, card.dataset.careers || 'Career and enterprise pathways');
    modal.hidden = false;
    document.body.classList.add('ctvet-modal-open');
    modal.querySelector('.ctvet-modal-close').focus();
  }

  function closeProgramme() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('ctvet-modal-open');
    opener?.focus();
  }

  document.querySelectorAll('[data-ctvet-explore]').forEach(button => {
    button.addEventListener('click', () => openProgramme(button.closest('.ctvet-programme-card'), button));
  });
  modal.querySelectorAll('[data-ctvet-close]').forEach(button => button.addEventListener('click', closeProgramme));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeProgramme();
  });
})();
