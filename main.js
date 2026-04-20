/* ═══════════════════════════════════════════════════════════════
   LearnSpark Student App — main.js
   Fetches content.json, builds all 4 screens dynamically,
   handles navigation, animations, AI chat, and interactions.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── State ── */
//let DATA = null;
let activeTab = 'home';
let progressAnimated = false;
let marksAnimated = false;

/* ────────────────────────────────────────
   BOOTSTRAP
──────────────────────────────────────── */
async function init() {
 // try {
  //  const res = await fetch('content.json');
  //  if (!res.ok) throw new Error('content.json not found');
 //   DATA = await res.json();
  //} 
  
    try {
    if (!DATA) throw new Error('Data object is missing');
  }
  catch (e) {
    document.getElementById('screen-content').innerHTML =
      `<p style="color:#fb7185;padding:2rem;text-align:center">⚠️ Could not load content.json.<br/>Serve files from a local server.</p>`;
    hideLoader();
    return;
  }

  buildHeader();
  buildBottomNav();
  buildAllScreens();
  setupNavigation();
  showScreen('home');
  hideLoader();
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) { loader.classList.add('hide'); setTimeout(() => loader.remove(), 600); }
}

/* ────────────────────────────────────────
   HEADER
──────────────────────────────────────── */
function buildHeader() {
  const hdr = document.getElementById('top-header');
  const unread = DATA.records.notifications.filter(n => n.unread).length;
  hdr.innerHTML = `
    <div class="header-logo">⚡ ${DATA.app.name}</div>
    <div style="display:flex;align-items:center;gap:8px">
      <div style="text-align:right">
        <div style="font-size:.72rem;color:var(--text-muted);font-weight:600">${DATA.student.grade}</div>
        <div style="font-size:.78rem;font-weight:800">${DATA.student.name.split(' ')[0]}</div>
      </div>
      <div class="header-notif-btn" onclick="switchTab('records')">
        <i class="fa-solid fa-bell"></i>
        ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}
      </div>
    </div>`;
}

/* ────────────────────────────────────────
   BOTTOM NAV
──────────────────────────────────────── */
function buildBottomNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = DATA.navigation.tabs.map(tab => `
    <button class="nav-tab ${tab.id === 'home' ? 'active' : ''}" data-tab="${tab.id}" onclick="switchTab('${tab.id}')">
      <i class="fa-solid ${tab.icon}"></i>
      <span>${tab.label}</span>
    </button>`).join('');
}

/* ────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────── */
function setupNavigation() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  showScreen(tabId);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) {
    screen.classList.add('active');
    if (id === 'home' && !progressAnimated) { setTimeout(animateProgressBars, 300); progressAnimated = true; }
    if (id === 'records' && !marksAnimated) { setTimeout(() => { animateAttendanceRing(); animateMarksBars(); }, 300); marksAnimated = true; }
  }
}

/* ────────────────────────────────────────
   BUILD ALL SCREENS
──────────────────────────────────────── */
function buildAllScreens() {
  const container = document.getElementById('screen-content');
  container.innerHTML = '';
  ['home','learn','records','profile'].forEach(id => {
    const div = document.createElement('div');
    div.id = 'screen-' + id;
    div.className = 'screen';
    container.appendChild(div);
  });
  buildHomeScreen();
  buildLearnScreen();
  buildRecordsScreen();
  buildProfileScreen();
}

/* ════════════════════════════════════════
   HOME SCREEN
════════════════════════════════════════ */
function buildHomeScreen() {
  const s = document.getElementById('screen-home');
  const h = DATA.home;
  const student = DATA.student;

  /* Quick stats */
  const statsHtml = h.quick_stats.map(st => `
    <div class="quick-stat-card">
      <div class="quick-stat-icon text-${st.color}"><i class="fa-solid ${st.icon}"></i></div>
      <div class="quick-stat-value">${st.value}</div>
      <div class="quick-stat-label">${st.label}</div>
    </div>`).join('');

  /* Schedule */
  const scheduleHtml = h.today_schedule.map(cls => `
    <div class="schedule-item">
      <span class="schedule-time">${cls.time}</span>
      <div class="schedule-icon-wrap bg-${cls.color}">
        <i class="fa-solid ${cls.icon} text-${cls.color}"></i>
      </div>
      <div>
        <div class="schedule-subject">${cls.subject}</div>
        <div class="schedule-topic">${cls.topic}</div>
      </div>
      <span class="schedule-status-badge status-${cls.status}">
        ${cls.status === 'done' ? '✓ Done' : cls.status === 'live' ? '🔴 Live' : 'Soon'}
      </span>
    </div>`).join('');

  /* Subject cards */
  const subjectsHtml = h.subjects.map(sub => buildSubjectCard(sub)).join('');

  s.innerHTML = `
    <!-- Greeting -->
    <div class="greeting-card" data-aos="fade-down">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="greeting-name">${h.greeting_prefix}, ${student.name.split(' ')[0]}${h.greeting_suffix}</div>
          <div class="greeting-sub">${h.subtitle}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
            <span style="font-size:.7rem;background:rgba(251,191,36,0.2);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);border-radius:6px;padding:2px 8px;font-weight:700">
              🏆 ${student.rank}
            </span>
            <span style="font-size:.7rem;background:rgba(239,68,68,0.2);color:#fb7185;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:2px 8px;font-weight:700">
              🔥 ${student.streak}-day streak
            </span>
          </div>
        </div>
        <div class="greeting-avatar">${student.avatar_initials}</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats-grid" data-aos="fade-up" data-aos-delay="50">${statsHtml}</div>

    <!-- Today's Schedule -->
    <div data-aos="fade-up" data-aos-delay="80">
      <div class="section-hdr">
        <h2>📅 Today's Classes</h2>
        <button class="see-all-btn">View All</button>
      </div>
      ${scheduleHtml}
    </div>

    <!-- Subjects -->
    <div style="margin-top:20px" data-aos="fade-up" data-aos-delay="100">
      <div class="section-hdr">
        <h2>📚 My Subjects</h2>
        <button class="see-all-btn">All Subjects</button>
      </div>
      ${subjectsHtml}
    </div>`;
}

function buildSubjectCard(sub) {
  const actions = sub.actions.map(a => `
    <button class="subject-action-btn ripple-container" onclick="handleSubjectAction('${sub.id}','${a.label}',event)">
      <i class="fa-solid ${a.icon}"></i>
      <span>${a.label}</span>
    </button>`).join('');

  return `
    <div class="subject-card grad-${sub.color}" data-subject="${sub.id}" onclick="openSubject('${sub.id}')">
      <div class="subject-card-glow" style="background:radial-gradient(circle,rgba(255,255,255,0.4),transparent 70%)"></div>
      <div class="subject-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="subject-icon-wrap"><span style="font-size:1.3rem">${sub.emoji}</span></div>
          <div>
            <div class="subject-name">${sub.name}</div>
            <div class="subject-chapter">${sub.chapter}</div>
          </div>
        </div>
        <div class="subject-progress-label">${sub.progress}%</div>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" data-progress="${sub.progress}"></div>
      </div>
      <div style="font-size:.7rem;color:rgba(255,255,255,.7);margin-bottom:12px;display:flex;justify-content:space-between">
        <span>${sub.done_chapters} / ${sub.total_chapters} chapters done</span>
        <span onclick="openLearnForSubject('${sub.id}',event)" style="text-decoration:underline;cursor:pointer">▶ Continue</span>
      </div>
      <div class="subject-actions">${actions}</div>
    </div>`;
}

/* ════════════════════════════════════════
   LEARN SCREEN
════════════════════════════════════════ */
function buildLearnScreen() {
  const s = document.getElementById('screen-learn');
  const l = DATA.learn;
  const ai = l.ai_assistant;

  /* Chapter list */
  const chaptersHtml = l.chapter_list.map(ch => {
    const cls = ch.done ? 'done' : ch.current ? 'current' : 'locked';
    return `
      <div class="chapter-item ${ch.current ? 'current' : ''}" onclick="selectChapter(${ch.no})">
        <div class="chapter-num ${cls}">${ch.done ? '<i class="fa-solid fa-check" style="font-size:.65rem"></i>' : ch.no}</div>
        <div style="flex:1">
          <div class="chapter-title ${ch.current ? 'text-blue' : ''}">${ch.title}</div>
          <div class="chapter-duration">${ch.duration}</div>
        </div>
        ${ch.done ? '<i class="fa-solid fa-check chapter-check"></i>' : ''}
        ${ch.current ? '<span style="font-size:.65rem;color:#60a5fa;font-weight:700;background:rgba(96,165,250,0.15);padding:2px 7px;border-radius:5px">Playing</span>' : ''}
      </div>`;
  }).join('');

  /* AI quick questions */
  const quickQHtml = ai.quick_questions.map(q => `
    <button class="quick-q-btn" onclick="sendQuickQuestion('${q}')">${q}</button>`).join('');

  s.innerHTML = `
    <!-- Subject breadcrumb -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:.75rem;color:var(--text-secondary)">
      <i class="fa-solid fa-square-root-variable text-blue"></i>
      <span>${l.current_subject}</span> <span style="color:var(--text-muted)">›</span>
      <span>${l.current_chapter}</span>
    </div>

    <!-- Video Player -->
    <div class="video-player-card" data-aos="zoom-in">
      <div class="video-thumbnail">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(30,20,80,.9),rgba(12,31,63,.9));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
          <div style="font-size:2.5rem">📐</div>
          <div style="font-size:.82rem;color:rgba(255,255,255,.7);text-align:center;padding:0 20px">${l.current_topic}</div>
          <div class="video-play-btn" onclick="toggleVideo(this)">
            <i class="fa-solid fa-play" style="margin-left:3px"></i>
          </div>
        </div>
        <div class="video-duration">${l.video.duration}</div>
      </div>
    </div>

    <!-- Video info -->
    <div class="video-title-bar" data-aos="fade-up">
      <div style="font-size:.9rem;font-weight:800;margin-bottom:6px">${l.video.title}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#4f8ef7,#a855f7);display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:900">${l.video.teacher_avatar_initials}</div>
        <span style="font-size:.75rem;color:var(--text-secondary)">${l.video.teacher}</span>
        <span style="margin-left:auto;font-size:.72rem;color:#fbbf24"><i class="fa-solid fa-star"></i> 4.9</span>
      </div>
    </div>

    <!-- Chapter list -->
    <div data-aos="fade-up" data-aos-delay="60">
      <div class="section-hdr">
        <h2>📋 Chapters</h2>
        <span style="font-size:.72rem;color:var(--text-muted)">${l.chapter_list.filter(c=>c.done).length}/${l.chapter_list.length} done</span>
      </div>
      <div class="glass" style="padding:8px 4px">${chaptersHtml}</div>
    </div>

    <!-- AI Assistant -->
    <div style="margin-top:20px" data-aos="fade-up" data-aos-delay="100">
      <div class="section-hdr">
        <h2>🤖 ${ai.name}</h2>
        <span style="font-size:.7rem;color:#4ade80;font-weight:700">● Online</span>
      </div>
      <div class="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-avatar"><i class="fa-solid ${ai.avatar_icon}"></i></div>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:800">${ai.name}</div>
            <div style="font-size:.68rem;color:var(--text-secondary)">${ai.tagline}</div>
          </div>
          <div class="ai-dot"></div>
        </div>

        <div id="chat-messages">
          <div class="msg-bubble msg-ai">${formatAIText(ai.welcome_message)}</div>
        </div>

        <div class="quick-q-scroll">${quickQHtml}</div>

        <div class="chat-input-row">
          <input id="chat-input" class="chat-input" type="text" placeholder="Ask anything about this topic…" onkeydown="handleChatKey(event)" />
          <button class="chat-send-btn" onclick="sendChatMessage()">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   RECORDS SCREEN
════════════════════════════════════════ */
function buildRecordsScreen() {
  const s = document.getElementById('screen-records');
  const r = DATA.records;

  /* Marks bars */
  const marksHtml = r.marks.map(m => `
    <div class="marks-row">
      <span class="marks-subject-name">${m.subject}</span>
      <div class="marks-bar-bg">
        <div class="marks-bar-fill bar-${m.color}" data-marks-pct="${m.marks}" style="width:0%"></div>
      </div>
      <span class="marks-value text-${m.color}">${m.marks}</span>
      <span class="marks-grade text-${m.color}">${m.grade}</span>
    </div>`).join('');

  /* Leaves pips */
  const leavesPips = Array.from({length: r.leaves.total}, (_,i) =>
    `<div class="leaf-pip ${i < r.leaves.used ? 'leaf-used' : 'leaf-free'}"></div>`).join('');

  /* Notifications */
  const notifsHtml = r.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <div class="notif-icon-wrap bg-${n.color}">
        <i class="fa-solid ${n.icon} text-${n.color}"></i>
      </div>
      <div style="flex:1">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${n.unread ? '<div style="width:8px;height:8px;border-radius:50%;background:#60a5fa;flex-shrink:0;margin-top:4px"></div>' : ''}
    </div>`).join('');

  /* Next class */
  const nc = r.next_class;

  s.innerHTML = `
    <!-- Performance Summary -->
    <div data-aos="fade-up">
      <div class="section-hdr"><h2>📊 Performance</h2></div>
      <div class="perf-grid" style="margin-bottom:16px">
        <div class="perf-card">
          <div class="perf-val text-blue">${r.performance_summary.overall_percentage}%</div>
          <div class="perf-lbl">Overall Score</div>
        </div>
        <div class="perf-card">
          <div class="perf-val text-yellow">#${r.performance_summary.class_rank}</div>
          <div class="perf-lbl">Class Rank (of ${r.performance_summary.total_students})</div>
        </div>
        <div class="perf-card" style="grid-column:span 2">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px">
            <div class="perf-val text-green">${r.performance_summary.improvement}</div>
            <div style="font-size:.75rem;color:var(--text-secondary)">vs last term</div>
          </div>
          <div class="perf-lbl">Improvement</div>
        </div>
      </div>
    </div>

    <!-- Attendance + Leaves -->
    <div data-aos="fade-up" data-aos-delay="50">
      <div class="section-hdr"><h2>📅 Attendance</h2></div>
      <div class="glass" style="padding:18px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:18px">
          <div class="attendance-ring-wrap">
            <div class="attendance-ring" id="attendance-ring">
              <span class="attendance-pct" id="attendance-pct">0%</span>
            </div>
          </div>
          <div style="flex:1">
            <div style="margin-bottom:10px">
              <div style="font-size:.72rem;color:var(--text-muted);font-weight:600">Present</div>
              <div style="font-size:1.1rem;font-weight:900;color:#4ade80">${r.attendance.present_days} days</div>
            </div>
            <div style="margin-bottom:10px">
              <div style="font-size:.72rem;color:var(--text-muted);font-weight:600">Absent</div>
              <div style="font-size:1.1rem;font-weight:900;color:#fb7185">${r.attendance.absent_days} days</div>
            </div>
            <div>
              <div style="font-size:.72rem;color:var(--text-muted);font-weight:600">Working Days</div>
              <div style="font-size:1.1rem;font-weight:900">${r.attendance.total_days} days</div>
            </div>
          </div>
        </div>
        <div style="margin-top:14px">
          <div style="font-size:.72rem;color:var(--text-muted);font-weight:700;margin-bottom:6px">
            Leaves: ${r.leaves.used} used / ${r.leaves.remaining} remaining
          </div>
          <div class="leaves-pips">${leavesPips}</div>
        </div>
      </div>
    </div>

    <!-- Marks -->
    <div data-aos="fade-up" data-aos-delay="80">
      <div class="section-hdr"><h2>📝 Subject Marks</h2></div>
      <div class="glass" style="padding:16px;margin-bottom:16px">
        <div class="marks-bar-wrap">${marksHtml}</div>
      </div>
    </div>

    <!-- Next Class -->
    <div data-aos="fade-up" data-aos-delay="100">
      <div class="section-hdr"><h2>⏰ Next Class</h2></div>
      <div class="next-class-card">
        <div class="next-class-icon bg-${nc.color}">
          <i class="fa-solid ${nc.icon} text-${nc.color}" style="font-size:1.3rem"></i>
        </div>
        <div style="flex:1">
          <div style="font-size:.95rem;font-weight:800">${nc.subject}</div>
          <div style="font-size:.75rem;color:var(--text-secondary);margin-top:2px">${nc.topic}</div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:6px;display:flex;gap:12px">
            <span><i class="fa-solid fa-clock" style="margin-right:4px"></i>${nc.time}</span>
            <span><i class="fa-solid fa-door-open" style="margin-right:4px"></i>${nc.room}</span>
          </div>
        </div>
        <button style="background:rgba(34,211,238,0.15);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;border-radius:10px;padding:8px 12px;font-size:.72rem;font-weight:700;cursor:pointer" onclick="joinClass()">
          Join ▶
        </button>
      </div>
    </div>

    <!-- Notifications -->
    <div data-aos="fade-up" data-aos-delay="120">
      <div class="section-hdr">
        <h2>🔔 Notifications</h2>
        <button class="see-all-btn">Mark all read</button>
      </div>
      ${notifsHtml}
    </div>`;
}

/* ════════════════════════════════════════
   PROFILE SCREEN
════════════════════════════════════════ */
function buildProfileScreen() {
  const s = document.getElementById('screen-profile');
  const p = DATA.profile;
  const st = DATA.student;

  /* Badges */
  const badgesHtml = st.badges.map(b => `
    <div class="badge-chip">
      <i class="fa-solid ${b.icon} text-${b.color}"></i>
      <span>${b.label}</span>
    </div>`).join('');

  /* Detail rows */
  const detailsHtml = p.details.map(d => `
    <div class="detail-row">
      <div class="detail-icon"><i class="fa-solid ${d.icon}"></i></div>
      <div>
        <div class="detail-label">${d.label}</div>
        <div class="detail-value">${d.value}</div>
      </div>
    </div>`).join('');

  /* Settings */
  const settingsHtml = p.settings.map(item => {
    const right = item.toggle
      ? `<label class="toggle-switch">
           <input type="checkbox" ${item.on ? 'checked' : ''} onchange="toggleSetting('${item.label}',this)">
           <span class="toggle-slider"></span>
         </label>`
      : `<span style="font-size:.75rem;color:var(--text-muted);font-weight:700">${item.value} <i class="fa-solid fa-chevron-right" style="font-size:.6rem"></i></span>`;
    return `
      <div class="setting-row">
        <div class="setting-icon"><i class="fa-solid ${item.icon}"></i></div>
        <span class="setting-label">${item.label}</span>
        ${right}
      </div>`;
  }).join('');

  s.innerHTML = `
    <!-- Profile hero -->
    <div class="profile-hero" data-aos="zoom-in">
      <button class="edit-profile-btn" onclick="editProfile()">✏️ Edit</button>
      <div class="profile-avatar-big">${st.avatar_initials}</div>
      <div style="font-size:1.2rem;font-weight:900;font-family:'Nunito',sans-serif">${st.name}</div>
      <div style="font-size:.78rem;color:var(--text-secondary);margin-top:2px">${st.grade}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-top:14px">
        <div style="text-align:center">
          <div style="font-size:1.1rem;font-weight:900;color:#fbbf24">${st.streak}</div>
          <div style="font-size:.65rem;color:var(--text-muted);font-weight:600">Day Streak</div>
        </div>
        <div style="width:1px;height:30px;background:rgba(255,255,255,.15)"></div>
        <div style="text-align:center">
          <div style="font-size:1.1rem;font-weight:900;color:#a78bfa">${st.xp.toLocaleString()}</div>
          <div style="font-size:.65rem;color:var(--text-muted);font-weight:600">XP Points</div>
        </div>
        <div style="width:1px;height:30px;background:rgba(255,255,255,.15)"></div>
        <div style="text-align:center">
          <div style="font-size:1.1rem;font-weight:900;color:#4ade80">${st.rank}</div>
          <div style="font-size:.65rem;color:var(--text-muted);font-weight:600">Rank</div>
        </div>
      </div>
    </div>

    <!-- Badges -->
    <div data-aos="fade-up" style="margin-bottom:16px">
      <div class="section-hdr"><h2>🏅 Badges</h2></div>
      <div class="badges-row">${badgesHtml}</div>
    </div>

    <!-- Profile details -->
    <div data-aos="fade-up" data-aos-delay="50">
      <div class="section-hdr"><h2>👤 Profile Details</h2></div>
      ${detailsHtml}
    </div>

    <!-- Settings -->
    <div data-aos="fade-up" data-aos-delay="80" style="margin-top:16px">
      <div class="section-hdr"><h2>⚙️ Settings</h2></div>
      ${settingsHtml}
    </div>

    <!-- Logout -->
    <div data-aos="fade-up" data-aos-delay="100" style="margin-top:16px;margin-bottom:8px">
      <button onclick="confirmLogout()" style="width:100%;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#fb7185;border-radius:14px;padding:14px;font-size:.88rem;font-weight:800;cursor:pointer;transition:background .2s;font-family:'Nunito',sans-serif"
        onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
        <i class="fa-solid fa-right-from-bracket" style="margin-right:8px"></i>Log Out
      </button>
    </div>`;
}

/* ════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════ */
function animateProgressBars() {
  document.querySelectorAll('.progress-bar-fill[data-progress]').forEach(bar => {
    const pct = bar.dataset.progress;
    requestAnimationFrame(() => { bar.style.width = pct + '%'; });
  });
}

function animateAttendanceRing() {
  const pct = DATA.records.attendance.percentage;
  const deg = Math.round((pct / 100) * 360);
  const ring = document.getElementById('attendance-ring');
  const pctEl = document.getElementById('attendance-pct');
  if (!ring) return;

  let current = 0;
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * pct);
    const currentDeg = Math.round(eased * deg);
    ring.style.setProperty('--ring-deg', currentDeg + 'deg');
    ring.style.background = `conic-gradient(#4ade80 0deg, #4ade80 ${currentDeg}deg, rgba(255,255,255,0.1) ${currentDeg}deg)`;
    if (pctEl) pctEl.textContent = current + '%';
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animateMarksBars() {
  document.querySelectorAll('.marks-bar-fill[data-marks-pct]').forEach((bar, i) => {
    const pct = bar.dataset.marksPct;
    setTimeout(() => {
      requestAnimationFrame(() => { bar.style.width = pct + '%'; });
    }, i * 120);
  });
}

/* ════════════════════════════════════════
   AI CHAT
════════════════════════════════════════ */
function handleChatKey(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMessage(msg, 'user');
  showTypingIndicator();
  const response = DATA.learn.ai_assistant.sample_responses[msg] ||
    "Great question! 🤔 I'm analyzing your query...\n\nThis topic connects to several important concepts in your syllabus. Let me break it down step by step so it's easy to understand. Keep asking — that's how champions learn! 🏆";
  setTimeout(() => {
    hideTypingIndicator();
    appendMessage(response, 'ai');
  }, 1200 + Math.random() * 600);
}

function sendQuickQuestion(q) {
  const input = document.getElementById('chat-input');
  if (input) input.value = q;
  sendChatMessage();
}

function appendMessage(text, role) {
  const chat = document.getElementById('chat-messages');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = `msg-bubble msg-${role}`;
  div.innerHTML = formatAIText(text);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showTypingIndicator() {
  const chat = document.getElementById('chat-messages');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

/* ════════════════════════════════════════
   INTERACTION HANDLERS
════════════════════════════════════════ */
function openSubject(id) {
  /* Navigate to learn tab for this subject */
  switchTab('learn');
}

function openLearnForSubject(id, event) {
  event.stopPropagation();
  switchTab('learn');
}

function handleSubjectAction(subjectId, action, event) {
  event.stopPropagation();
  createRipple(event);
  showToast(`Opening ${action} for ${subjectId.charAt(0).toUpperCase() + subjectId.slice(1)}`);
}

function createRipple(event) {
  const btn = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  const rect = btn.getBoundingClientRect();
  circle.style.cssText = `
    width:${diameter}px; height:${diameter}px;
    left:${event.clientX - rect.left - radius}px;
    top:${event.clientY - rect.top - radius}px;`;
  circle.classList.add('ripple');
  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  btn.appendChild(circle);
}

function toggleVideo(btn) {
  const icon = btn.querySelector('i');
  const isPlaying = icon.classList.contains('fa-pause');
  icon.className = isPlaying ? 'fa-solid fa-play' : 'fa-solid fa-pause';
  if (isPlaying) icon.style.marginLeft = '3px';
  else icon.style.marginLeft = '0';
  showToast(isPlaying ? 'Video paused' : '▶ Video playing...');
}

function selectChapter(no) {
  showToast(`Loading Chapter ${no}…`);
  /* Update current chapter visually */
  document.querySelectorAll('.chapter-item').forEach((item, i) => {
    item.classList.toggle('current', i + 1 === no);
    const numEl = item.querySelector('.chapter-num');
    const data = DATA.learn.chapter_list[i];
    if (i + 1 === no) {
      numEl.className = 'chapter-num current';
      numEl.textContent = no;
    }
  });
}

function joinClass() {
  showToast('🔴 Joining live class... Opening video call');
}

function editProfile() {
  showToast('✏️ Edit profile coming soon!');
}

function toggleSetting(label, checkbox) {
  showToast(`${label}: ${checkbox.checked ? 'ON ✓' : 'OFF ✗'}`);
}

function confirmLogout() {
  if (confirm('Are you sure you want to log out?')) {
    showToast('👋 Logging out...');
    setTimeout(() => { document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f0c29;color:white;font-family:'Nunito',sans-serif;flex-direction:column;gap:12px"><div style="font-size:2rem">⚡ LearnSpark</div><div style="color:#7a8fb5">You've been logged out. See you soon!</div></div>`; }, 1200);
  }
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
let toastTimeout;
function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
      background:rgba(30,25,60,0.95);border:1px solid rgba(255,255,255,0.15);
      color:white;font-size:.78rem;font-weight:700;
      padding:10px 18px;border-radius:20px;
      box-shadow:0 8px 24px rgba(0,0,0,.4);
      z-index:9999;transition:all .3s ease;opacity:0;
      white-space:nowrap;max-width:300px;text-align:center;
      font-family:'Nunito',sans-serif;backdrop-filter:blur(12px);`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  clearTimeout(toastTimeout);
  setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2600);
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', init);


const DATA = {
  "app": {
    "name": "LearnSpark",
    "tagline": "Your Smart Study Companion",
    "version": "2.0"
  },

  "student": {
    "name": "Arjun Sharma",
    "grade": "Class 10 – Section A",
    "rollNo": "2024-10-042",
    "school": "Delhi Public School, Hyderabad",
    "avatar": "assets/images/avatar.png",
    "avatar_initials": "AS",
    "streak": 12,
    "xp": 3840,
    "rank": "Gold Scholar",
    "joined": "June 2023",
    "phone": "+91 98765 43210",
    "email": "arjun.sharma@student.dps.edu",
    "dob": "15 March 2009",
    "hobbies": ["Cricket", "Coding", "Reading"],
    "badges": [
      { "icon": "fa-fire",       "label": "12-Day Streak",  "color": "orange" },
      { "icon": "fa-star",       "label": "Top Scorer",     "color": "yellow" },
      { "icon": "fa-brain",      "label": "Quick Learner",  "color": "purple" },
      { "icon": "fa-medal",      "label": "Consistent",     "color": "teal"   }
    ]
  },

  "navigation": {
    "tabs": [
      { "id": "home",    "icon": "fa-house",      "label": "Home"    },
      { "id": "learn",   "icon": "fa-play-circle", "label": "Learn"   },
      { "id": "records", "icon": "fa-chart-bar",   "label": "Records" },
      { "id": "profile", "icon": "fa-user",        "label": "Profile" }
    ]
  },

  "home": {
    "greeting_prefix": "Good Morning",
    "greeting_suffix": "! 👋",
    "subtitle": "Ready to level up today?",
    "quick_stats": [
      { "icon": "fa-fire",        "value": "12",   "label": "Day Streak",    "color": "orange" },
      { "icon": "fa-bolt",        "value": "3840", "label": "XP Points",     "color": "yellow" },
      { "icon": "fa-trophy",      "value": "#4",   "label": "Class Rank",    "color": "green"  },
      { "icon": "fa-clock",       "value": "2.4h", "label": "Today's Study", "color": "blue"   }
    ],
    "subjects": [
      {
        "id": "math",
        "name": "Mathematics",
        "icon": "fa-square-root-variable",
        "emoji": "📐",
        "gradient": "from-blue-500 to-cyan-400",
        "progress": 72,
        "chapter": "Quadratic Equations",
        "total_chapters": 15,
        "done_chapters": 10,
        "color": "blue",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      },
      {
        "id": "science",
        "name": "Science",
        "icon": "fa-flask",
        "emoji": "🔬",
        "gradient": "from-emerald-500 to-teal-400",
        "progress": 60,
        "chapter": "Chemical Reactions",
        "total_chapters": 15,
        "done_chapters": 9,
        "color": "emerald",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      },
      {
        "id": "english",
        "name": "English",
        "icon": "fa-book",
        "emoji": "📚",
        "gradient": "from-purple-500 to-pink-400",
        "progress": 85,
        "chapter": "The Letter Writer",
        "total_chapters": 12,
        "done_chapters": 10,
        "color": "purple",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      },
      {
        "id": "social",
        "name": "Social Studies",
        "icon": "fa-globe",
        "emoji": "🌍",
        "gradient": "from-amber-500 to-orange-400",
        "progress": 45,
        "chapter": "The Rise of Nationalism",
        "total_chapters": 14,
        "done_chapters": 6,
        "color": "amber",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      },
      {
        "id": "hindi",
        "name": "Hindi",
        "icon": "fa-language",
        "emoji": "🗣️",
        "gradient": "from-rose-500 to-red-400",
        "progress": 90,
        "chapter": "Surdas ke Pad",
        "total_chapters": 11,
        "done_chapters": 10,
        "color": "rose",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      },
      {
        "id": "computer",
        "name": "Computer Science",
        "icon": "fa-laptop-code",
        "emoji": "💻",
        "gradient": "from-violet-500 to-indigo-400",
        "progress": 55,
        "chapter": "Python Programming",
        "total_chapters": 10,
        "done_chapters": 5,
        "color": "violet",
        "actions": [
          { "icon": "fa-file-alt",    "label": "Mock Test"        },
          { "icon": "fa-book-open",   "label": "Prev Papers"      },
          { "icon": "fa-question-circle", "label": "Question Bank" },
          { "icon": "fa-folder",      "label": "Study Material"   }
        ]
      }
    ],
    "today_schedule": [
      { "time": "9:00 AM",  "subject": "Mathematics",    "topic": "Quadratic Equations", "icon": "fa-square-root-variable", "color": "blue",    "status": "done"    },
      { "time": "11:00 AM", "subject": "Science",        "topic": "Chemical Reactions",  "icon": "fa-flask",                "color": "emerald", "status": "live"    },
      { "time": "2:00 PM",  "subject": "English",        "topic": "The Letter Writer",   "icon": "fa-book",                 "color": "purple",  "status": "upcoming"},
      { "time": "4:00 PM",  "subject": "Social Studies", "topic": "Rise of Nationalism", "icon": "fa-globe",                "color": "amber",   "status": "upcoming"}
    ]
  },

  "learn": {
    "current_subject": "Mathematics",
    "current_chapter": "Quadratic Equations",
    "current_topic": "Solving by Factorization",
    "video": {
      "title": "Quadratic Equations – Factorization Method",
      "duration": "24:35",
      "thumbnail": "assets/images/video-thumb.jpg",
      "teacher": "Mr. Rajesh Kumar",
      "teacher_avatar_initials": "RK"
    },
    "chapter_list": [
      { "no": 1,  "title": "Introduction to Quadratic Equations",  "duration": "18:20", "done": true  },
      { "no": 2,  "title": "Standard Form & Discriminant",          "duration": "22:10", "done": true  },
      { "no": 3,  "title": "Factorization Method",                  "duration": "24:35", "done": false, "current": true },
      { "no": 4,  "title": "Completing the Square",                 "duration": "19:45", "done": false },
      { "no": 5,  "title": "Quadratic Formula",                     "duration": "28:00", "done": false }
    ],
    "ai_assistant": {
      "name": "Spark AI",
      "tagline": "Your 24/7 Study Buddy",
      "avatar_icon": "fa-robot",
      "welcome_message": "Hi Arjun! 👋 I'm Spark, your AI study assistant. I'm here to help you understand any concept instantly. What would you like to learn today?",
      "quick_questions": [
        "What is discriminant?",
        "Explain factorization",
        "Give me a practice problem",
        "What are roots of equation?"
      ],
      "sample_responses": {
        "What is discriminant?": "The **discriminant** (D = b² – 4ac) tells you about the nature of roots:\n\n• D > 0 → Two distinct real roots\n• D = 0 → Two equal roots\n• D < 0 → No real roots (complex roots)\n\nFor example, in x² – 5x + 6 = 0, D = 25 – 24 = 1 > 0, so it has two distinct roots! 🎯",
        "Explain factorization": "**Factorization** means writing the quadratic as a product of two linear expressions!\n\nSteps:\n1. Find two numbers that multiply to give 'ac' and add to give 'b'\n2. Split the middle term\n3. Group and factor\n\nExample: x² – 5x + 6 = (x–2)(x–3), so x = 2 or x = 3 ✅",
        "Give me a practice problem": "Here's a problem for you! 🎯\n\n**Solve:** 2x² – 7x + 3 = 0\n\nHint: Find two numbers that multiply to 2×3=6 and add to –7.\n\nThey are –6 and –1!\n\n2x² – 6x – x + 3 = 2x(x–3) – 1(x–3) = (2x–1)(x–3)\n\n∴ x = ½ or x = 3 🏆",
        "What are roots of equation?": "**Roots** (or solutions) are the values of x that satisfy the equation, making it equal to zero!\n\nFor ax² + bx + c = 0, roots are:\n\nx = (–b ± √D) / 2a\n\nThink of roots as the x-intercepts where the parabola crosses the x-axis! 📈"
      }
    }
  },

  "records": {
    "attendance": {
      "percentage": 91,
      "present_days": 145,
      "total_days": 159,
      "absent_days": 14
    },
    "marks": [
      { "subject": "Math",    "marks": 88, "max": 100, "grade": "A",  "color": "blue"   },
      { "subject": "Science", "marks": 76, "max": 100, "grade": "B+", "color": "emerald"},
      { "subject": "English", "marks": 92, "max": 100, "grade": "A+", "color": "purple" },
      { "subject": "Social",  "marks": 68, "max": 100, "grade": "B",  "color": "amber"  },
      { "subject": "Hindi",   "marks": 95, "max": 100, "grade": "A+", "color": "rose"   },
      { "subject": "CS",      "marks": 82, "max": 100, "grade": "A",  "color": "violet" }
    ],
    "leaves": {
      "total": 20,
      "used": 14,
      "remaining": 6
    },
    "notifications": [
      { "icon": "fa-bell",         "title": "Math Test Tomorrow",           "desc": "Chapter 5 – Quadratic Equations at 9 AM", "time": "2h ago",      "color": "blue",   "unread": true  },
      { "icon": "fa-file-alt",     "title": "Assignment Submitted",         "desc": "Science lab report accepted by teacher",   "time": "Yesterday",   "color": "green",  "unread": false },
      { "icon": "fa-trophy",       "title": "New Achievement Unlocked!",    "desc": "You earned the 'Quick Learner' badge",      "time": "2 days ago",  "color": "yellow", "unread": true  },
      { "icon": "fa-video",        "title": "Live Class Starting Soon",     "desc": "English – The Letter Writer at 2 PM",      "time": "3 days ago",  "color": "purple", "unread": false }
    ],
    "next_class": {
      "subject": "Science",
      "topic": "Chemical Reactions & Equations",
      "teacher": "Mrs. Priya Mehta",
      "time": "Today, 11:00 AM",
      "room": "Room 204",
      "icon": "fa-flask",
      "color": "emerald"
    },
    "performance_summary": {
      "overall_percentage": 83.5,
      "class_rank": 4,
      "total_students": 42,
      "improvement": "+5.2%"
    }
  },

  "profile": {
    "details": [
      { "icon": "fa-id-card",          "label": "Roll Number",  "value": "2024-10-042"             },
      { "icon": "fa-school",           "label": "School",       "value": "Delhi Public School, Hyd"},
      { "icon": "fa-graduation-cap",   "label": "Class",        "value": "Class 10 – Section A"    },
      { "icon": "fa-phone",            "label": "Phone",        "value": "+91 98765 43210"         },
      { "icon": "fa-envelope",         "label": "Email",        "value": "arjun.sharma@dps.edu"    },
      { "icon": "fa-cake-candles",     "label": "Date of Birth","value": "15 March 2009"           },
      { "icon": "fa-calendar-plus",    "label": "Joined",       "value": "June 2023"               }
    ],
    "settings": [
      { "icon": "fa-bell",          "label": "Notifications",    "toggle": true,  "on": true  },
      { "icon": "fa-moon",          "label": "Dark Mode",        "toggle": true,  "on": false },
      { "icon": "fa-volume-high",   "label": "Sound Effects",    "toggle": true,  "on": true  },
      { "icon": "fa-language",      "label": "Language",         "toggle": false, "value": "English" },
      { "icon": "fa-shield-halved", "label": "Privacy",          "toggle": false, "value": "Manage" },
      { "icon": "fa-circle-info",   "label": "App Version",      "toggle": false, "value": "v2.0.1" }
    ]
  }
}

