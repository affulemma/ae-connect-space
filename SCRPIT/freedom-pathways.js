(() => {
  const pathways = {
    tertiary: {
      eyebrow: "Pathway 01 · Tertiary education",
      title: "Going to Tertiary School?",
      introduction: "Prepare for admission, campus life and long-term success with a practical journey you can complete at your own pace.",
      programmes: [
        {
          id: "admission-planning", icon: "🧭", title: "Admission & Institution Planning", category: "Preparation", stage: "Foundation", time: "45 min",
          description: "Choose the right institution and programme, understand admission requirements and avoid costly application mistakes.",
          lessons: ["Match your strengths to a programme", "Compare institutions and entry requirements", "Build an application timeline", "Prepare your admission documents"],
          checklist: ["Shortlist three suitable programmes", "Confirm entry requirements", "Create an application deadline calendar", "Organise certificates and identification"],
          resources: [["Explore programme roadmaps", "program-roadmaps.html"], ["Browse scholarships", "scholarships.html"]],
          next: "Shortlist three institutions and write down the application deadline for each one."
        },
        {
          id: "funding-budgeting", icon: "₵", title: "Funding, Scholarships & Budgeting", category: "Finance", stage: "Foundation", time: "60 min",
          description: "Plan the real cost of tertiary education and build a funding strategy using scholarships, family support and smart budgeting.",
          lessons: ["Calculate your full cost of study", "Find credible scholarships and bursaries", "Create a student budget", "Plan for financial emergencies"],
          checklist: ["Estimate tuition and living costs", "Identify five funding opportunities", "Prepare a monthly budget", "Discuss your funding plan with a trusted adult"],
          resources: [["Scholarship opportunities", "scholarships.html"], ["Student opportunities", "opportunities.html"]],
          next: "Create a one-page first-year budget with essential and optional expenses separated."
        },
        {
          id: "academic-readiness", icon: "📚", title: "Academic Readiness & Study Systems", category: "Academics", stage: "Beginner", time: "75 min",
          description: "Move from SHS study habits to independent learning, effective note-taking, research and exam preparation.",
          lessons: ["Understand independent learning", "Build a weekly study system", "Take useful lecture notes", "Prepare for assignments and exams"],
          checklist: ["Create a realistic weekly timetable", "Choose a note-taking method", "Set up folders for every course", "Schedule a weekly review session"],
          resources: [["Learning resources", "resources.html"], ["Explore useful skills", "skills.html"]],
          next: "Design your ideal weekly timetable before orientation begins."
        },
        {
          id: "campus-life", icon: "🛡️", title: "Campus Life, Wellbeing & Safety", category: "Student Life", stage: "Foundation", time: "50 min",
          description: "Set healthy boundaries, find support and make confident decisions about friendships, accommodation and personal safety.",
          lessons: ["Adjust to campus independence", "Build healthy friendships and boundaries", "Protect your physical and digital safety", "Know when and where to ask for help"],
          checklist: ["Save emergency contacts", "Locate student support services", "Write down your personal boundaries", "Create a simple wellbeing routine"],
          resources: [["Explore A.E CONNECT", "index.html"], ["Student dashboard", "dashboard.html"]],
          next: "Save the contact details for your institution’s student support and emergency services."
        },
        {
          id: "digital-success", icon: "💻", title: "Digital Skills for Tertiary Success", category: "Skills", stage: "Beginner", time: "90 min",
          description: "Use productivity, research and collaboration tools confidently for assignments, presentations and group work.",
          lessons: ["Organise files and cloud storage", "Research and evaluate online sources", "Create professional documents and slides", "Collaborate safely online"],
          checklist: ["Create a clear file system", "Set up cloud backup", "Practise a five-slide presentation", "Review your digital security settings"],
          resources: [["Skills library", "skills.html"], ["AI tools", "ai-tools.html"]],
          next: "Create a cloud folder structure for your first semester courses."
        },
        {
          id: "career-foundations", icon: "🤝", title: "Networking, Internships & Career Foundations", category: "Career", stage: "Growth", time: "60 min",
          description: "Start building relationships, experience and evidence of your abilities from your first year—not only after graduation.",
          lessons: ["Build a professional student profile", "Network with purpose", "Find early experience opportunities", "Start a skills portfolio"],
          checklist: ["Write a short professional introduction", "Create or update your CV", "Identify two student associations", "Save one internship opportunity"],
          resources: [["Internships and opportunities", "opportunities.html"], ["Career roadmaps", "program-roadmaps.html"]],
          next: "Write a three-sentence introduction that explains who you are, what you study and what you hope to learn."
        }
      ]
    },
    alternative: {
      eyebrow: "Pathway 02 · Build your next opportunity",
      title: "Not Going to Tertiary School Yet?",
      introduction: "Turn this season into progress. Build useful skills, practical experience, income options and a clear route toward your future goals.",
      programmes: [
        {
          id: "marketable-skill", icon: "🛠️", title: "Choose a Marketable Skill", category: "Skills", stage: "Foundation", time: "60 min",
          description: "Identify a skill that fits your interests, resources and local or online demand—and choose it with confidence.",
          lessons: ["Understand marketable skills", "Assess your interests and strengths", "Research real demand", "Choose one skill to begin"],
          checklist: ["List five things you do well", "Research three possible skills", "Speak to one person working in the field", "Select one primary skill"],
          resources: [["Explore the skills library", "skills.html"], ["Browse programme roadmaps", "program-roadmaps.html"]],
          next: "Choose one skill and write down why it fits your strengths and current resources."
        },
        {
          id: "ninety-day-plan", icon: "🗓️", title: "Build a 90-Day Learning Plan", category: "Skills", stage: "Beginner", time: "45 min",
          description: "Turn your chosen skill into a realistic three-month plan with weekly practice, milestones and proof of progress.",
          lessons: ["Set a clear 90-day outcome", "Break learning into weekly goals", "Create a repeatable practice routine", "Measure and share your progress"],
          checklist: ["Write one measurable outcome", "Choose a daily practice time", "Create 12 weekly milestones", "Select an accountability partner"],
          resources: [["Learning resources", "resources.html"], ["Useful AI tools", "ai-tools.html"]],
          next: "Schedule your first seven days of learning and complete the first practice session today."
        },
        {
          id: "freelance-portfolio", icon: "💼", title: "Freelancing & Portfolio Building", category: "Work", stage: "Beginner", time: "90 min",
          description: "Create proof of your ability, find your first client and deliver small projects professionally and safely.",
          lessons: ["Choose a clear service", "Create portfolio samples", "Find and approach potential clients", "Price, deliver and request feedback"],
          checklist: ["Define one service and customer", "Create two sample projects", "Write a simple service message", "Contact three potential clients"],
          resources: [["Find opportunities", "opportunities.html"], ["Build professional skills", "skills.html"]],
          next: "Create one small sample project that shows the exact service you want to sell."
        },
        {
          id: "small-business", icon: "🏪", title: "Start a Small Business With What You Have", category: "Business", stage: "Beginner", time: "75 min",
          description: "Test a practical business idea without waiting for perfect conditions or risking money you cannot afford to lose.",
          lessons: ["Find a problem worth solving", "Define a simple offer", "Test demand before spending", "Track money and improve"],
          checklist: ["List three customer problems", "Choose one simple offer", "Ask five people for feedback", "Record every cost and sale"],
          resources: [["Entrepreneurship hub", "entrepreneurship.html"], ["Business opportunities", "opportunities.html"]],
          next: "Speak to five potential customers before buying stock or building anything."
        },
        {
          id: "experience", icon: "🌱", title: "Apprenticeships, Internships & Volunteering", category: "Experience", stage: "Foundation", time: "60 min",
          description: "Gain credible experience, references and professional habits even before you have a degree or formal job.",
          lessons: ["Choose the right experience route", "Prepare a simple application", "Approach organisations professionally", "Turn experience into evidence"],
          checklist: ["Update your CV", "Identify ten organisations", "Prepare a short request message", "Apply or enquire at three places"],
          resources: [["Current opportunities", "opportunities.html"], ["Explore A.E CONNECT", "index.html"]],
          next: "Contact one organisation today with a clear, polite request to learn or volunteer."
        },
        {
          id: "future-admission", icon: "🎓", title: "Prepare for Future Tertiary Admission", category: "Future Study", stage: "Foundation", time: "50 min",
          description: "Keep tertiary education possible while you work, learn or resolve the barriers delaying your next step.",
          lessons: ["Clarify the barrier and your goal", "Review entry and resit options", "Build a savings and application plan", "Keep documents and deadlines ready"],
          checklist: ["Write your preferred study goal", "Confirm the entry requirements", "Create a monthly savings target", "Set a date to review your progress"],
          resources: [["Programme roadmaps", "program-roadmaps.html"], ["Scholarships and funding", "scholarships.html"]],
          next: "Choose a realistic application year and calculate how much you need to save each month."
        }
      ]
    }
  };

  const storeKey = "aeFreedomPathwayProgressV1";
  const pathwayPanel = document.getElementById("freedomPathway");
  if (!pathwayPanel) return;
  const standalonePathway = document.body.dataset.freedomPathway || "";

  const elements = {
    eyebrow: document.getElementById("freedomPathwayEyebrow"), title: document.getElementById("freedomPathwayTitle"), intro: document.getElementById("freedomPathwayIntroduction"),
    progressText: document.getElementById("freedomProgressText"), progressPercent: document.getElementById("freedomProgressPercent"), progressBar: document.getElementById("freedomProgressBar"),
    search: document.getElementById("freedomSearch"), filters: document.getElementById("freedomFilters"), grid: document.getElementById("freedomProgrammeGrid"), empty: document.getElementById("freedomEmptyState"),
    detail: document.getElementById("freedomLearningDetail"), detailContent: document.getElementById("freedomDetailContent")
  };
  let state = loadState();
  let activePathway = null;
  let activeFilter = "All";

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey));
      return { completed: saved?.completed || [], saved: saved?.saved || [], visited: saved?.visited || [], checks: saved?.checks || {} };
    } catch (_) {
      return { completed: [], saved: [], visited: [], checks: {} };
    }
  }

  function persist() { localStorage.setItem(storeKey, JSON.stringify(state)); }
  function keyFor(id) { return `${activePathway}:${id}`; }
  function isIn(list, id) { return state[list].includes(keyFor(id)); }
  function toggleList(list, id) {
    const key = keyFor(id);
    state[list] = state[list].includes(key) ? state[list].filter(item => item !== key) : [...state[list], key];
    persist();
  }
  function programmeById(id) { return pathways[activePathway].programmes.find(item => item.id === id); }

  function openPathway(id) {
    activePathway = id;
    activeFilter = "All";
    elements.search.value = "";
    const pathway = pathways[id];
    elements.eyebrow.textContent = pathway.eyebrow;
    elements.title.textContent = pathway.title;
    elements.intro.textContent = pathway.introduction;
    renderFilters();
    renderCards();
    updateProgress();
    elements.detail.hidden = true;
    pathwayPanel.hidden = false;
    if (!standalonePathway) document.body.classList.add("freedom-pathway-open");
    pathwayPanel.scrollTop = 0;
    history.replaceState(null, "", `#${id}-pathway`);
    setTimeout(() => document.getElementById("freedomPathwayBack").focus(), 0);
  }

  function closePathway() {
    if (standalonePathway) {
      window.location.href = "from-high-school-to-freedom.html#choose-your-path";
      return;
    }
    pathwayPanel.hidden = true;
    document.body.classList.remove("freedom-pathway-open");
    history.replaceState(null, "", location.pathname + location.search);
    document.querySelector(`[data-open-freedom-pathway="${activePathway}"]`)?.focus();
    activePathway = null;
  }

  function renderFilters() {
    const categories = ["All", ...new Set(pathways[activePathway].programmes.map(item => item.category)), "Saved"];
    elements.filters.innerHTML = categories.map(category => `<button type="button" class="${category === activeFilter ? "is-active" : ""}" data-filter="${category}" aria-pressed="${category === activeFilter}">${category}</button>`).join("");
  }

  function renderCards() {
    const query = elements.search.value.trim().toLowerCase();
    const programmes = pathways[activePathway].programmes.filter(item => {
      const matchesFilter = activeFilter === "All" || (activeFilter === "Saved" ? isIn("saved", item.id) : item.category === activeFilter);
      const searchable = [item.title, item.description, item.category, item.stage, ...item.lessons].join(" ").toLowerCase();
      return matchesFilter && (!query || searchable.includes(query));
    });

    elements.grid.innerHTML = programmes.map(item => {
      const completed = isIn("completed", item.id);
      const visited = isIn("visited", item.id);
      const saved = isIn("saved", item.id);
      const status = completed ? "Completed" : visited ? "In progress" : "Not started";
      const percent = completed ? 100 : visited ? 35 : 0;
      return `<article class="freedom-programme-card">
        <div class="freedom-card-top"><span class="freedom-card-icon" aria-hidden="true">${item.icon}</span><button class="freedom-save-icon ${saved ? "is-saved" : ""}" type="button" data-save="${item.id}" aria-label="${saved ? "Remove from saved" : "Save for later"}" aria-pressed="${saved}">${saved ? "★" : "☆"}</button></div>
        <div class="freedom-card-labels"><span>${item.category}</span><span>${item.stage}</span></div>
        <h3>${item.title}</h3><p>${item.description}</p>
        <div class="freedom-card-meta"><span>◷ ${item.time}</span><strong class="status-${status.toLowerCase().replace(" ", "-")}">${status}</strong></div>
        <div class="freedom-card-progress" aria-label="${percent}% complete"><span style="width:${percent}%"></span></div>
        <div class="freedom-card-actions"><button class="freedom-primary-button" type="button" data-explore="${item.id}">${visited ? "Continue Learning" : "Start Learning"}</button><button class="freedom-secondary-button" type="button" data-save="${item.id}">${saved ? "Saved" : "Save for Later"}</button></div>
      </article>`;
    }).join("");
    elements.empty.hidden = programmes.length > 0;
  }

  function updateProgress() {
    const programmes = pathways[activePathway].programmes;
    const completed = programmes.filter(item => isIn("completed", item.id)).length;
    const percent = Math.round((completed / programmes.length) * 100);
    elements.progressText.textContent = `${completed} of ${programmes.length} programmes completed`;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressBar.style.width = `${percent}%`;
  }

  function openDetail(id) {
    const item = programmeById(id);
    if (!isIn("visited", id)) state.visited.push(keyFor(id));
    persist();
    const completed = isIn("completed", id);
    const checked = state.checks[keyFor(id)] || [];
    elements.detailContent.innerHTML = `<div class="freedom-detail-hero">
      <span class="freedom-detail-icon" aria-hidden="true">${item.icon}</span><div><div class="freedom-card-labels"><span>${item.category}</span><span>${item.stage}</span><span>${item.time}</span></div><h2 id="freedomDetailTitle">${item.title}</h2><p>${item.description}</p></div>
    </div>
    <div class="freedom-detail-layout"><main>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Learning journey</p><h3>Lessons</h3><ol class="freedom-lessons">${item.lessons.map((lesson, index) => `<li><span>${index + 1}</span><div><strong>${lesson}</strong><small>Practical guidance and a useful action to complete.</small></div></li>`).join("")}</ol></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Put it into practice</p><h3>Your checklist</h3><div class="freedom-checklist">${item.checklist.map((check, index) => `<label><input type="checkbox" data-check="${id}" data-index="${index}" ${checked.includes(index) ? "checked" : ""}><span>${check}</span></label>`).join("")}</div></section>
    </main><aside>
      <section class="freedom-detail-section freedom-next-action"><p class="freedom-section-kicker">Do this next</p><h3>Next action</h3><p>${item.next}</p></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Keep learning</p><h3>Useful resources</h3><div class="freedom-resource-list">${item.resources.map(([label, href]) => `<a href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join("")}</div></section>
      <button class="freedom-complete-button ${completed ? "is-complete" : ""}" type="button" data-complete="${id}">${completed ? "✓ Programme Completed" : "Mark Programme Complete"}</button>
    </aside></div>`;
    elements.detail.hidden = false;
    elements.detail.scrollTop = 0;
    renderCards();
    setTimeout(() => document.getElementById("freedomDetailBack").focus(), 0);
  }

  function closeDetail() {
    elements.detail.hidden = true;
    renderCards();
    updateProgress();
  }

  document.querySelectorAll("[data-open-freedom-pathway]").forEach(card => card.addEventListener("click", event => {
    event.preventDefault();
    openPathway(card.dataset.openFreedomPathway);
  }));
  document.getElementById("freedomPathwayBack").addEventListener("click", closePathway);
  document.getElementById("freedomDetailBack").addEventListener("click", closeDetail);
  elements.search.addEventListener("input", renderCards);
  elements.filters.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    renderFilters();
    renderCards();
  });
  elements.grid.addEventListener("click", event => {
    const explore = event.target.closest("[data-explore]");
    const save = event.target.closest("[data-save]");
    if (explore) openDetail(explore.dataset.explore);
    if (save) { toggleList("saved", save.dataset.save); renderFilters(); renderCards(); }
  });
  elements.detail.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-check]");
    if (!checkbox) return;
    const key = keyFor(checkbox.dataset.check);
    const index = Number(checkbox.dataset.index);
    const current = state.checks[key] || [];
    state.checks[key] = checkbox.checked ? [...new Set([...current, index])] : current.filter(item => item !== index);
    persist();
  });
  elements.detail.addEventListener("click", event => {
    const button = event.target.closest("[data-complete]");
    if (!button) return;
    toggleList("completed", button.dataset.complete);
    openDetail(button.dataset.complete);
    updateProgress();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || pathwayPanel.hidden) return;
    elements.detail.hidden ? closePathway() : closeDetail();
  });

  const initial = standalonePathway || location.hash.match(/^#(tertiary|alternative)-pathway$/)?.[1];
  if (initial) openPathway(initial);
})();
