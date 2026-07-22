(() => {
  const pathways = {
    tertiary: {
      eyebrow: "Pathway 01 · Tertiary education",
      title: "Tertiary Education Roadmap",
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
      title: "Opportunity Pathway Roadmap",
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

  const programmeImages = {
    "admission-planning": "../ASSETS/images/freedom-courses/admission-planning.jpg", "funding-budgeting": "../ASSETS/images/freedom-courses/funding-budgeting.jpg",
    "academic-readiness": "../ASSETS/images/freedom-courses/academic-readiness.jpg", "campus-life": "../ASSETS/images/freedom-courses/campus-life.jpg",
    "digital-success": "../ASSETS/images/freedom-courses/digital-success.jpg", "career-foundations": "../ASSETS/images/freedom-courses/career-foundations.jpg",
    "marketable-skill": "../ASSETS/images/freedom-courses/marketable-skill.jpg", "ninety-day-plan": "../ASSETS/images/freedom-courses/ninety-day-plan.jpg",
    "freelance-portfolio": "../ASSETS/images/freedom-courses/freelance-portfolio.jpg", "small-business": "../ASSETS/images/freedom-courses/small-business.jpg",
    "experience": "../ASSETS/images/freedom-courses/experience.jpg", "future-admission": "../ASSETS/images/freedom-courses/future-admission.jpg"
  };

  const bookGuides = {
    "admission-planning": { overview: "Admission is more than obtaining a form. It is the first major decision in a season where responsibility becomes personal. Compare programmes against your strengths, confirm the official entry requirements, calculate the full cost, and organise every document before deadlines begin to create pressure.", insight: "From High School to Freedom explains that tertiary life does not chase or supervise you. The preparation habits you establish before admission - asking questions, keeping records, planning time, and accepting responsibility - become the same habits that protect you after enrolment.", reflection: "Which institution fits your goal, finances, learning needs, and support system - not merely its popularity?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "funding-budgeting": { overview: "A realistic education plan includes tuition, accommodation, transport, food, learning materials, data, emergency costs, and the smaller daily expenses students often ignore. Separate essential costs from optional ones and build a funding plan from several possible sources rather than depending on one promise.", insight: "Financial discipline is part of personal responsibility. A student who understands the real cost early can compare schools honestly, discuss support with family, search broadly for legitimate funding, and avoid spending money simply to appear successful on campus.", reflection: "If one expected source of funding fails, what combination of savings, family support, scholarships, work, or a delayed timeline could keep the goal alive?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "academic-readiness": { overview: "Tertiary learning requires independence. Build a weekly timetable, attend consistently, review notes early, practise active recall, space your study sessions, and learn which visual, listening, reading, or practical methods help you understand best.", insight: "The book warns that time moves quickly on campus and that studying long is not the same as studying well. Focused blocks, serious study groups, regular revision, useful lecture notes, and disciplined phone use turn freedom into academic progress.", reflection: "What study system will continue working when nobody reminds you to attend class, revise, or prepare for an assessment?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "campus-life": { overview: "Campus freedom should be managed, not feared. Decide your values before pressure arrives, choose friends carefully, create boundaries around relationships and spending, know where to seek help, and protect your health, safety, faith, and academic purpose.", insight: "From High School to Freedom treats friendships as a silent curriculum: your circle influences your habits, standards, opportunities, and confidence. Popularity, comparison, harmful relationships, careless spending, and ignoring rules can quietly move a student away from the reason they came.", reflection: "Which values, boundaries, and support contacts will help you remain yourself when campus pressure becomes strong?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "digital-success": { overview: "Digital readiness means organising files, researching credible sources, communicating professionally, collaborating online, protecting accounts, and using technology to produce better assignments and projects - not only consuming entertainment.", insight: "The book’s 'More Than a Degree' lesson encourages students to build abilities beyond lectures. Your phone can weaken your attention or become a learning laboratory. The difference is whether you use it intentionally to research, practise, create, document, and share useful work.", reflection: "What can you create with your phone or laptop this month that proves you can use technology productively?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "career-foundations": { overview: "Career preparation begins during school, not after graduation. Join purposeful groups, volunteer, attend workshops, build communication and leadership skills, meet people beyond your immediate circle, and keep evidence of every useful contribution.", insight: "A degree may open a door, but skills, relationships, experience, and character influence what happens next. Students who go beyond lectures graduate with stories, references, projects, and people who can speak about how they work.", reflection: "If an opportunity appeared today, what evidence would show that you are dependable, skilled, curious, and ready to contribute?", title: "FROM HIGH SCHOOL TO FREEDOM: WHAT NO ONE TOLD YOU ABOUT TERTIARY LIFE", href: "book-from-high-school-to-freedom.html" },
    "marketable-skill": { overview: "Choose a skill by connecting three things: a problem people genuinely need solved, an ability you can practise with your present resources, and a path to visible proof. Research the work before paying for training and test your interest through a small beginner task.", insight: "It's Not the End teaches 'learn before you earn.' Alternative routes are not consolation prizes. Online learning, technical education, apprenticeships, self-study, and recognition of prior learning can all become serious pathways when approached with discipline and evidence.", reflection: "Which practical problem can you learn to solve, and who would value that solution?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" },
    "ninety-day-plan": { overview: "A useful learning plan turns hope into scheduled action. Define one result for the next 90 days, divide it into monthly milestones and weekly practice, protect a regular quiet hour, and review your progress using work you can actually show.", insight: "The book follows young people who rebuild direction through small, repeated actions rather than one dramatic breakthrough. A changed route requires structure because there may be no institution creating deadlines, reminders, or accountability for you.", reflection: "What should you be able to demonstrate after 90 days, and what must happen during the first seven?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" },
    "freelance-portfolio": { overview: "Freelancing begins with a clear service and proof, not with creating an account and waiting. Choose a small problem, make two or three samples, explain the result you provide, approach realistic local or online clients, and deliver professionally.", insight: "It's Not the End identifies freelance digital work as one route for earning while preparing. Income matters, but so do the transferable habits it builds: communication, reliability, pricing, revision, time management, and learning from feedback.", reflection: "What sample can you create before asking anyone to pay you, and what result will it demonstrate?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" },
    "small-business": { overview: "Start with a problem, not stock. Speak to potential customers, test a simple offer, calculate every cost, begin at a scale you can afford, record sales and expenses, and improve from real feedback before expanding.", insight: "The book’s practical message is that income grows from useful problem-solving. Traditional trade, tutoring, digital services, and small community businesses can provide both income and valuable experience when they are honest, flexible, and connected to a larger plan.", reflection: "What can you test with five customers before risking money on equipment, rent, branding, or inventory?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" },
    "experience": { overview: "Experience can begin before formal employment. Apprenticeships, assistance work, volunteering, tutoring, and community projects teach professional habits while helping you discover whether a field truly fits you.", insight: "It's Not the End presents work while preparing as a bridge rather than a defeat. The strongest option is not always the highest immediate income; it may be the role that also protects learning time, develops a relevant skill, builds references, and moves you closer to your destination.", reflection: "Which nearby person or organisation could teach you, supervise a small contribution, or give you credible evidence of experience?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" },
    "future-admission": { overview: "A delayed admission is not a destroyed future. Clarify the destination beneath the original timeline, investigate evening, distance, technical, apprenticeship, re-entry, and later-admission routes, then prepare the finances and documents each option requires.", insight: "The central lesson of It's Not the End is that a wall in one road may reveal another route. The book moves from honest disappointment to practical rebuilding through skills, income, financing, mentorship, and alternative education - without pretending the setback was easy.", reflection: "If the original date or institution changes, what destination are you still trying to reach, and which new route deserves investigation now?", title: "IT'S NOT THE END: YOUR DREAM DIDN'T DIE, IT TOOK ANOTHER ROUTE", href: "materials.html" }
  };

  const lessonNotes = {
    "admission-planning": [
      ["Start With the Destination", "Do not choose a programme only because the name sounds impressive. Ask what students actually study, which abilities the programme develops, what graduates commonly do, and whether the work matches your interests and strengths. A good choice connects the programme, the institution, and the future you are trying to build."],
      ["Compare Institutions Properly", "Create a comparison table for at least three institutions. Include accreditation, entry subjects and grades, fees, location, accommodation, learning facilities, student support, internship exposure, and application deadlines. Use official institutional sources and contact the admissions office when information is unclear."],
      ["Avoid Costly Application Mistakes", "Never wait until the final day to purchase a form, upload documents, or request help. Check names, dates, examination details, programme order, email address, and telephone number before submitting. Keep screenshots, receipts, applicant numbers, and copies of every document in one clearly labelled folder."]
    ],
    "funding-budgeting": [
      ["Calculate the Full Cost", "Tuition is only one part of tertiary education. Estimate accommodation, transport, food, data, books, printing, clothing, medical needs, association dues, and emergency expenses. Multiply recurring weekly costs across the semester so that small expenses do not become a large surprise."],
      ["Build a Funding Mix", "Avoid depending on one scholarship or one relative. A stronger plan may combine family support, personal savings, legitimate scholarships, bursaries, part-time work, community support, and approved student financing. Record each possible source, the amount expected, the deadline, and the evidence required."],
      ["Protect Yourself From Scams", "Verify funding through official websites, offices, and published contacts. Be cautious when someone promises guaranteed funding, asks for payment before an award, requests passwords, or pressures you to act secretly. A legitimate opportunity should have clear eligibility rules, documentation, and an accountable organisation."]
    ],
    "academic-readiness": [
      ["Move From Remembering to Understanding", "Tertiary assessments often require explanation, comparison, application, analysis, and evidence. After reading, close the material and explain the idea in your own words. Create questions, solve examples, and connect the concept to a real situation instead of repeatedly highlighting the same page."],
      ["Build a Weekly Study System", "Place lectures, travel, meals, rest, personal responsibilities, and study blocks into one realistic timetable. Review each lecture within twenty-four hours, schedule difficult courses when your mind is strongest, and leave buffer time for unexpected work. Consistency is more reliable than last-minute panic."],
      ["Use Study Groups Wisely", "A study group should have a purpose, a time limit, and prepared members. Rotate who explains a topic, compare answers, correct misunderstandings, and end with individual tasks. If the group becomes mainly gossip or copying, it is no longer supporting learning."]
    ],
    "campus-life": [
      ["Freedom Needs Personal Rules", "Before campus pressure arrives, decide what you will protect: attendance, study time, sleep, safety, faith, health, money, and respectful relationships. Personal rules reduce the number of important decisions you make while tired, lonely, excited, or influenced by others."],
      ["Choose Your Circle Carefully", "Friends affect what feels normal. Spend time with people who respect your goals, tell you the truth, share useful information, and encourage responsible choices. You can be friendly with many people without giving everyone influence over your time, money, relationships, or identity."],
      ["Ask for Help Early", "Difficulty becomes more dangerous when hidden. Learn where to find academic advisers, counselling, health services, security, disability support, financial aid, and trusted mentors. Seeking help early is a mature response, not proof that you are weak or incapable."]
    ],
    "digital-success": [
      ["Organise Your Digital Life", "Create a folder for every course and use consistent filenames that include the topic and date. Back up important work, keep your student email professional, and maintain a calendar for deadlines. Good organisation saves time and reduces the risk of losing evidence of your work."],
      ["Research With Judgment", "Do not treat the first search result as truth. Check the author, date, institution, evidence, and purpose of a source. Compare information across credible references, keep citation details as you research, and distinguish academic evidence from opinion, advertising, and generated content."],
      ["Use AI and Online Tools Responsibly", "Technology should support your thinking rather than replace it. Use tools to explore questions, practise, organise, and improve drafts, but verify important claims and follow your institution's rules. Never submit work you cannot explain or defend in your own words."]
    ],
    "career-foundations": [
      ["Build Evidence Before Graduation", "Keep a simple portfolio containing projects, presentations, leadership roles, volunteer work, reports, certificates, and feedback. For each item, explain the problem, your contribution, the tools used, and the result. Evidence makes your abilities easier for another person to trust."],
      ["Network Through Contribution", "Networking is not collecting contacts or asking strangers for jobs. Begin by learning about people, asking thoughtful questions, sharing useful information, volunteering, and following up respectfully. Strong professional relationships grow when people repeatedly see your character and contribution."],
      ["Treat Every Experience as Training", "Student groups, church activities, community service, class projects, and small jobs can develop communication, teamwork, planning, and problem-solving. Reflect after each experience and record what changed because you participated. This turns activity into career evidence."]
    ],
    "marketable-skill": [
      ["Choose a Problem, Not a Trend", "A skill becomes marketable when it helps someone save time, earn money, communicate, decide, repair, create, or solve a recurring problem. Interview potential users and observe what they struggle with. Popularity online does not automatically mean demand in your location or circumstances."],
      ["Test Before Paying", "Complete a free beginner lesson and one small task before buying a course or equipment. Notice whether you enjoy the actual practice, not only videos about the lifestyle. Speak with someone doing the work and ask about beginner costs, challenges, client expectations, and the time required to become useful."],
      ["Build Proof in Public", "Create small samples that demonstrate progress: a design, repaired item, spreadsheet, photograph, written piece, haircut, lesson plan, or customer solution. Ask for specific feedback and improve the work. A portfolio of evidence is more convincing than saying you are passionate."]
    ],
    "ninety-day-plan": [
      ["Define One Clear Outcome", "Avoid goals such as 'learn coding' or 'become good at business.' State what you will produce by day ninety, such as three portfolio websites, a complete bookkeeping workbook, or ten tested product sales. A visible outcome makes it easier to choose lessons and measure progress."],
      ["Turn the Goal Into Weeks", "Divide the outcome into twelve weekly milestones. Early weeks can cover foundations, middle weeks guided practice, and later weeks independent projects and feedback. Give every week one main result and schedule small daily sessions that fit your real responsibilities."],
      ["Review and Adjust Without Quitting", "At the end of each week, record what you completed, what blocked you, and what needs to change. Missing one session is not failure; repeatedly ignoring the plan is information. Reduce unrealistic tasks, protect a consistent learning hour, and continue from the next useful action."]
    ],
    "freelance-portfolio": [
      ["Define a Specific Service", "Clients understand clear outcomes better than broad skill labels. Instead of saying 'I do graphics,' offer a defined service such as three social media posters for a local shop. State who the service helps, what is delivered, how long it takes, and what information you need from the client."],
      ["Create Samples Without Fake Claims", "You can build demonstration projects for imagined or volunteer clients, but label them honestly. Show before-and-after work, explain your decisions, and include the final result. Two strong, relevant samples are more useful than many unfinished pieces copied from tutorials."],
      ["Deliver Professionally", "Confirm the scope, price, deadline, revision limit, payment method, and file format before starting. Communicate early when a problem appears, protect client information, and request feedback after delivery. Reliability often brings repeat work even while your technical skill is still growing."]
    ],
    "small-business": [
      ["Validate the Problem", "Talk to real potential customers before buying stock. Ask what they currently use, what frustrates them, how often the problem occurs, and what they already pay. Listen for repeated behaviour rather than polite encouragement, because compliments do not always become purchases."],
      ["Know Your Numbers", "Record the cost of stock, transport, packaging, data, delivery, damaged items, and your time. Revenue is not profit. Set a price that covers the full cost and leaves a margin, then separate business money from personal spending so you can see whether the idea is actually improving."],
      ["Start Small and Improve", "Test the simplest version of the offer with a few customers. Observe questions, complaints, repeat purchases, and referrals. Improve one thing at a time before expanding. Borrowing heavily for an untested idea can turn a learning opportunity into avoidable pressure."]
    ],
    "experience": [
      ["Choose Experience With a Purpose", "Decide what you want to observe, practise, or prove. An apprenticeship may develop technical ability; volunteering may build service and teamwork; an internship may expose you to professional systems. The title matters less than the quality of supervision and the work you are allowed to attempt."],
      ["Approach Organisations Professionally", "Prepare a short introduction explaining who you are, what you hope to learn, when you are available, and how you can help. Research the organisation first, attach a simple CV when appropriate, and follow up politely. Do not send the same careless message to everyone."],
      ["Turn Activity Into Evidence", "Keep a weekly record of tasks, tools, challenges, lessons, and results. Ask a supervisor for feedback and permission before photographing work. At the end, request a reference or confirmation letter and convert the strongest experience into a portfolio story."]
    ],
    "future-admission": [
      ["Separate the Goal From the Original Timeline", "Write the deeper destination beneath the admission plan: the field you want to serve, the problem you want to solve, or the life you want to build. This helps you recognise routes that differ in institution, schedule, or timing without abandoning the purpose itself."],
      ["Research Alternative Routes", "Compare accredited technical programmes, apprenticeships, distance and evening study, mature or re-entry pathways, resits, online foundations, and later applications. Confirm requirements directly with the responsible institution or regulator. An alternative route still requires careful verification and discipline."],
      ["Use the Waiting Season Deliberately", "Create a plan for learning, income, documents, savings, and applications. Build a relevant skill, gain experience, prepare references, and review deadlines monthly. Progress during a delay can strengthen both your future application and your confidence when the next opportunity arrives."]
    ]
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
        <div class="freedom-card-image"><img src="${programmeImages[item.id]}" alt="${item.title}" loading="lazy"><span>${item.category}</span></div>
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

  function openReadingDetail(id) {
    const item = programmeById(id);
    const guide = bookGuides[id];
    const notes = lessonNotes[id];
    const bookHref = guide.title.startsWith("IT'S NOT THE END") ? "book-its-not-the-end.html" : guide.href;
    if (!isIn("visited", id)) state.visited.push(keyFor(id));
    persist();
    const opportunities = activePathway === "tertiary"
      ? ["Campus leadership and student organisations", "Internships and industry attachments", "Research, volunteering and project experience", "Entry-level work connected to your programme"]
      : ["Apprenticeships and practical training", "Freelance and client-based work", "Small business and income opportunities", "Internships, volunteering and entry-level roles"];
    const projects = item.lessons.map((lesson, index) => [lesson + " action project", item.checklist[index] || item.next]);
    const youtubeSearches = [[`${item.title} for beginners`, "Beginner video lessons"], [`${item.title} step by step tutorial`, "Step-by-step practical tutorial"], [`${item.title} student projects`, "Projects and real examples"]];
    const articleBridges = [
      "This opening lesson creates the foundation for everything that follows. Read it as an invitation to examine your present situation honestly: what you already know, what is still uncertain, which voices are influencing you, and what evidence you need before choosing your next step. Good decisions become easier when facts are separated from assumptions and pressure.",
      "This lesson moves from awareness to investigation. Do not depend only on what friends, social media, or advertising say. Ask direct questions, compare several options, confirm important information with responsible institutions or experienced people, and record what you discover. Careful research may feel slow, but it is usually cheaper than correcting an avoidable mistake later.",
      "This lesson turns understanding into a personal system. Progress rarely comes from one emotional decision; it comes from small actions repeated with discipline. Choose a realistic next step, give it a date, keep evidence of what you complete, and review the result. When circumstances change, adjust the method without abandoning the deeper purpose."
    ];
    elements.detailContent.innerHTML = `<article class="freedom-reading-guide">
      <header class="freedom-reading-hero"><p>${item.category} learning guide</p><h2 id="freedomDetailTitle">${item.title}</h2><span>${item.description}</span></header>
      <section class="freedom-article-opening"><h3>Understanding ${item.title}</h3><p>${guide.overview}</p><p>${guide.insight}</p><p>This guide is not meant to be rushed. The aim is to help you understand the subject well enough to explain your decision, recognise risk, compare alternatives, and take responsibility for what happens next. As you read, connect every idea to your real circumstances rather than treating the notes as general motivation.</p><blockquote><strong>Question to carry through the article:</strong> ${guide.reflection}</blockquote></section>
      <section class="freedom-expanded-lessons"><h3>A Deeper Reading</h3><p>The following lessons develop the topic like a short article. Read one lesson at a time, pause between paragraphs, and think about the facts or experiences in your own life that connect with the guidance.</p>${notes.map(([title, body], index) => `<article><span>Part ${String(index + 1).padStart(2, "0")}</span><h4>${title}</h4><p>${body}</p><p>${articleBridges[index]}</p><p>In this course, the practical meaning is to <strong>${item.lessons[index].toLowerCase()}</strong>. Begin by considering this concrete step: ${item.checklist[index]}. The purpose is not to complete a sentence on a checklist, but to produce clearer judgment, stronger preparation, and evidence that you are moving forward intentionally.</p></article>`).join("")}</section>
      <section><h3>Who Should Learn This?</h3><p>This guide is for students and young people who want a clear next step, need to understand their options, or want confidence before making an educational, career, or financial commitment.</p><ul>${item.checklist.map(check => `<li>${check}</li>`).join("")}</ul></section>
      <section><h3>What Can You Do With This?</h3><p>After reading and practising this topic, you should be able to:</p><ul>${item.lessons.map(lesson => `<li>${lesson}</li>`).join("")}</ul></section>
      <section><h3>Opportunities This Learning Supports</h3><p>The knowledge can help you prepare for practical opportunities and make stronger applications.</p><ul>${opportunities.map(opportunity => `<li>${opportunity}</li>`).join("")}</ul></section>
      <section><h3>How to Learn It Step by Step</h3>${item.lessons.map((lesson, index) => `<div class="freedom-reading-step"><strong>${index + 1}. ${lesson}</strong><p>Read about this area, watch a beginner explanation, practise it yourself, and save evidence showing what you completed.</p></div>`).join("")}</section>
      <section><h3>Common Mistakes to Avoid</h3><ul><li>Making an important decision because of pressure, popularity, or fear without checking evidence.</li><li>Paying for a form, course, tool, or opportunity before verifying the provider and the full cost.</li><li>Watching many lessons without practising, requesting feedback, or producing visible work.</li><li>Keeping no records of deadlines, applications, expenses, contacts, progress, or completed projects.</li></ul></section>
      <section><h3>Free YouTube Resources</h3><p>You do not need to pay before you begin. Use these YouTube searches to find current beginner lessons, full tutorials, and practical demonstrations.</p><div class="freedom-youtube-links">${youtubeSearches.map(([query, label]) => `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer"><strong>${label}</strong><span>Search YouTube for ${query} ↗</span></a>`).join("")}</div></section>
      <section><h3>Projects You Can Build</h3>${projects.map(([project, proof]) => `<div class="freedom-reading-project"><strong>${project}</strong><p>${proof}. Keep a document, screenshot, plan, or sample as proof of your work.</p></div>`).join("")}</section>
      <section><h3>What Next?</h3><p>${item.next} After completing that action, return to the pathway and choose the next guide that supports your goal.</p></section>
      <section class="freedom-reading-tip"><h3>A.E CONNECT Tip</h3><p>Do not only read about ${item.title}. Learn it, practise it, complete one small project, and save proof of your work. The students who stand out are the ones who can show what they have built, learned, or carefully investigated.</p></section>
    </article>`;
    elements.detailContent.querySelector(".freedom-reading-guide").insertAdjacentHTML("beforeend", `<a class="freedom-book-prompt freedom-book-prompt-final" href="${bookHref}"><span>Want to learn more?</span><strong>Get ${guide.title} from A.E CONNECT Publishing</strong></a>`);
    elements.detail.hidden = false;
    elements.detail.scrollTop = 0;
    renderCards();
    setTimeout(() => document.getElementById("freedomDetailBack").focus(), 0);
  }

  function openDetail(id) {
    const item = programmeById(id);
    if (!isIn("visited", id)) state.visited.push(keyFor(id));
    persist();
    const completed = isIn("completed", id);
    const checked = state.checks[keyFor(id)] || [];
    const opportunities = activePathway === "tertiary"
      ? ["Campus leadership and student organisations", "Internships and industry attachments", "Research, volunteering and project experience", "Entry-level work connected to your programme"]
      : ["Apprenticeships and practical training", "Freelance and client-based work", "Small business and income opportunities", "Internships, volunteering and entry-level roles"];
    const projects = item.lessons.map((lesson, index) => [lesson + " action project", item.checklist[index] || item.next]);
    elements.detailContent.innerHTML = `<div class="freedom-detail-hero freedom-detail-hero-image">
      <img src="${programmeImages[item.id]}" alt="${item.title}" loading="lazy">
      <span class="freedom-detail-icon" aria-hidden="true">${item.icon}</span><div><div class="freedom-card-labels"><span>${item.category}</span><span>${item.stage}</span><span>${item.time}</span></div><h2 id="freedomDetailTitle">${item.title}</h2><p>${item.description}</p></div>
    </div>
    <div class="freedom-detail-layout"><main>
      <section class="freedom-detail-section freedom-guide-section"><p class="freedom-section-kicker">Course overview</p><h3>${item.title} Overview</h3><p>${item.description} Use this guide to understand the decisions, practical actions, and evidence you need before paying for forms, training, stock, or equipment.</p></section>
      <section class="freedom-detail-section freedom-guide-section"><p class="freedom-section-kicker">Why it matters</p><h3>Why This Matters Today</h3><p>Good preparation reduces avoidable mistakes, protects your time and money, and helps you make choices based on real requirements and opportunities instead of pressure or guesswork.</p></section>
      <section class="freedom-detail-section freedom-guide-section"><p class="freedom-section-kicker">Practical value</p><h3>What Can You Do With This?</h3><ul class="freedom-guide-list">${item.lessons.map(lesson => `<li>${lesson}</li>`).join("")}</ul></section>
      <section class="freedom-detail-section freedom-guide-section"><p class="freedom-section-kicker">Future possibilities</p><h3>Opportunities This Course Supports</h3><ul class="freedom-guide-list">${opportunities.map(opportunity => `<li>${opportunity}</li>`).join("")}</ul></section>
      <section class="freedom-detail-section freedom-guide-section"><p class="freedom-section-kicker">Build evidence</p><h3>Projects You Can Complete</h3><ul class="freedom-guide-projects">${projects.map(([project, proof]) => `<li><strong>${project}</strong><span>${proof}</span></li>`).join("")}</ul></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Learning journey</p><h3>Lessons</h3><ol class="freedom-lessons">${item.lessons.map((lesson, index) => `<li><span>${index + 1}</span><div><strong>${lesson}</strong><small>Practical guidance and a useful action to complete.</small></div></li>`).join("")}</ol></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Put it into practice</p><h3>Your checklist</h3><div class="freedom-checklist">${item.checklist.map((check, index) => `<label><input type="checkbox" data-check="${id}" data-index="${index}" ${checked.includes(index) ? "checked" : ""}><span>${check}</span></label>`).join("")}</div></section>
      <section class="freedom-detail-section freedom-guide-tip"><p class="freedom-section-kicker">A.E CONNECT tip</p><h3>Decide With Evidence, Not Pressure</h3><p>Do not pay for a form, course, tool, or opportunity simply because other people are doing it. Confirm the requirements, compare your options, estimate the full cost, and take one small practical step before committing your money.</p></section>
    </main><aside>
      <section class="freedom-detail-section freedom-next-action"><p class="freedom-section-kicker">Do this next</p><h3>Next action</h3><p>${item.next}</p></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Keep learning</p><h3>Useful resources</h3><div class="freedom-resource-list">${item.resources.map(([label, href]) => `<a href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join("")}</div></section>
      <section class="freedom-detail-section"><p class="freedom-section-kicker">Continue your journey</p><h3>What Next?</h3><p>Complete the checklist, save proof of what you have done, then return to the course cards and choose the next topic that supports your goal.</p></section>
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
    if (explore) openReadingDetail(explore.dataset.explore);
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
