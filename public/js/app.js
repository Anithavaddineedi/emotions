/* ═══════════════════════════════════════════════
   EmoLearn — Frontend Application Logic
   ═══════════════════════════════════════════════ */

// ── State ───────────────────────────────────────
const state = {
  userId: null,
  currentEmotion: null,
  currentTheme: null,
  lastResult: null,
  currentLesson: null,
};

const API = 'http://localhost:3000/api';

const EMOJI_MAP = { happy:'😊', sad:'😢', neutral:'😐', angry:'😠' };
const COLOR_MAP  = { happy:'#f9c74f', sad:'#4fc3f7', neutral:'#a8d8a8', angry:'#ff6b6b' };

// ── Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initUser();
  spawnParticles();
  initCharCounter();
  loadStats();
});

function initUser() {
  let id = localStorage.getItem('emolearn_uid');
  if (!id) { id = 'user_' + Math.random().toString(36).slice(2, 9); localStorage.setItem('emolearn_uid', id); }
  state.userId = id;
  const short = id.slice(-6);
  document.getElementById('userAvatarNav').textContent = short[0].toUpperCase();
  document.getElementById('userIdLabel').textContent = id.slice(0, 12) + '…';
}

function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      background:hsl(${Math.random()*60+240},70%,65%);
      animation-duration:${Math.random()*12+8}s;
      animation-delay:${Math.random()*8}s;
    `;
    container.appendChild(p);
  }
}

function initCharCounter() {
  const ta = document.getElementById('emotionTextInput');
  const cc = document.getElementById('charCount');
  ta.addEventListener('input', () => { cc.textContent = ta.value.length; });
}

// ── Section Navigation ───────────────────────────
function showSection(name) {
  ['dashboard','results','history','stats'].forEach(s => {
    const el = document.getElementById('section' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById('section' + name.charAt(0).toUpperCase() + name.slice(1));
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navMap = { dashboard:'navDashboard', history:'navHistory', stats:'navStats' };
  if (navMap[name]) document.getElementById(navMap[name])?.classList.add('active');

  if (name === 'history') loadHistory();
  if (name === 'stats') loadStats();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Emotion Selection (button) ───────────────────
function selectEmotion(emotion) {
  document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('btn' + emotion.charAt(0).toUpperCase() + emotion.slice(1))?.classList.add('selected');
  state.currentEmotion = emotion;
  submitEmotion(emotion, 'button');
}

// ── Text Analysis ────────────────────────────────
function analyzeText() {
  const text = document.getElementById('emotionTextInput').value.trim();
  if (!text) { showToast('⚠️ Please describe how you feel first.', 'error'); return; }
  submitEmotion(text, 'text');
}

// ── API Call ─────────────────────────────────────
async function submitEmotion(input, inputType) {
  showLoader(true);
  try {
    const res = await fetch(`${API}/emotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId, emotionInput: input, inputType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    state.lastResult = data;
    state.currentTheme = data.content.theme;
    renderResults(data);
    showSection('results');
    showToast(`${EMOJI_MAP[data.detectedEmotion]} Emotion detected: ${data.detectedEmotion}`, 'success');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    showLoader(false);
  }
}

// ── Render Results ───────────────────────────────
function renderResults(data) {
  const { content, score, detectedEmotion } = data;

  // Remove old theme classes
  document.getElementById('emotionStatusBar').className = `emotion-status-bar theme-${content.theme}`;

  document.getElementById('detectedEmoji').textContent = EMOJI_MAP[detectedEmotion] || '🤔';
  document.getElementById('statusHeadline').textContent = content.headline;
  document.getElementById('statusTagline').textContent = content.tagline;

  // Animate score ring
  animateScore(score);

  // Lessons
  document.getElementById('lessonsCount').textContent = `${content.lessons.length} lessons`;
  const grid = document.getElementById('lessonsGrid');
  grid.innerHTML = '';
  content.lessons.forEach((lesson, i) => {
    const card = buildLessonCard(lesson, content.theme);
    card.style.animationDelay = `${i * 0.1}s`;
    grid.appendChild(card);
  });
}

function animateScore(target) {
  const valueEl = document.getElementById('scoreValue');
  const fill = document.getElementById('ringFill');
  const circumference = 213.6;
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    valueEl.textContent = Math.round(current);
    const offset = circumference - (current / 100) * circumference;
    fill.style.strokeDashoffset = offset;
    if (current >= target) clearInterval(timer);
  }, 16);
}

function buildLessonCard(lesson, theme) {
  const div = document.createElement('div');
  div.className = 'lesson-card';
  div.onclick = () => openLesson(lesson);
  const color = COLOR_MAP[theme] || '#6c63ff';
  div.querySelector?.('::before') ;
  div.style.setProperty('--card-accent', color);
  div.innerHTML = `
    <style>.lesson-card::before{background:${color}!important}</style>
    <div class="card-top">
      <span class="card-icon">${lesson.icon}</span>
      <span class="card-difficulty">${lesson.difficulty}</span>
    </div>
    <div class="card-title">${lesson.title}</div>
    <div class="card-tags">${lesson.tags.map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
    <div class="card-desc">${lesson.description}</div>
    <div class="card-footer">
      <span class="card-duration">⏱ ${lesson.duration}</span>
      <span class="card-cta">Open →</span>
    </div>
  `;
  return div;
}

// ── Lesson Modal ─────────────────────────────────
function openLesson(lesson) {
  state.currentLesson = lesson;
  document.getElementById('modalIcon').textContent = lesson.icon;
  document.getElementById('modalBadge').textContent = lesson.difficulty;
  document.getElementById('modalTitle').textContent = lesson.title;
  document.getElementById('modalDesc').textContent = lesson.description;
  document.getElementById('modalDuration').textContent = `⏱ ${lesson.duration}`;
  document.getElementById('modalTags').innerHTML = lesson.tags.map(t=>`<span class="modal-tag">${t}</span>`).join('');
  document.getElementById('modalSteps').innerHTML = lesson.steps.map(s=>`<li>${s}</li>`).join('');
  document.getElementById('lessonModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLessonModal() {
  document.getElementById('lessonModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target.id === 'lessonModal') closeLessonModal();
}

function startLesson() {
  const lesson = state.currentLesson;
  if (!lesson) return;
  showToast(`🚀 Starting: ${lesson.title}`, 'info');
  closeLessonModal();
}

// ── History ──────────────────────────────────────
async function loadHistory() {
  const grid = document.getElementById('historyGrid');
  grid.innerHTML = '<div class="empty-state"><div class="loader-spinner"></div></div>';
  try {
    const res = await fetch(`${API}/history/${state.userId}`);
    if (res.status === 404) {
      grid.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🕊️</div>
        <p>No sessions yet. Start by checking your mood!</p>
        <button class="action-btn primary-btn" onclick="showSection('dashboard')">Get Started</button>
      </div>`;
      return;
    }
    const data = await res.json();
    const { user } = data;
    const sorted = [...user.history].reverse();
    grid.innerHTML = '';
    sorted.forEach(h => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const date = new Date(h.timestamp);
      const dateStr = date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const timeStr = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
      item.innerHTML = `
        <div class="history-left">
          <div class="history-emoji">${EMOJI_MAP[h.emotion]||'🤔'}</div>
          <div>
            <div class="history-emotion">${h.emotion}</div>
            <div class="history-time">${dateStr} at ${timeStr}</div>
          </div>
        </div>
        <div class="history-right">
          <div>
            <div class="history-score">${h.score}</div>
            <div class="history-score-label">Score</div>
          </div>
          <span class="history-badge">${h.inputType === 'button' ? '🔘 Button' : '✍️ Text'}</span>
        </div>
      `;
      grid.appendChild(item);
    });
  } catch {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load history.</p></div>`;
  }
}

// ── Stats ─────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    document.getElementById('statUsers').textContent = data.totalUsers;
    document.getElementById('statSessions').textContent = data.totalSessions;
    document.getElementById('statAvgScore').textContent = data.averagePlatformScore;

    const dist = data.emotionDistribution;
    const total = Object.values(dist).reduce((a,b)=>a+b,0)||1;
    const bars = [
      { key:'happy', label:'😊 Happy', color:'#f9c74f' },
      { key:'sad',   label:'😢 Sad',   color:'#4fc3f7' },
      { key:'neutral',label:'😐 Neutral',color:'#a8d8a8' },
      { key:'angry', label:'😠 Angry', color:'#ff6b6b' },
    ];
    document.getElementById('distBars').innerHTML = bars.map(b=>`
      <div class="dist-row">
        <div class="dist-label">${b.label}</div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width:${Math.round((dist[b.key]||0)/total*100)}%;background:${b.color}"></div>
        </div>
        <div class="dist-count">${dist[b.key]||0}</div>
      </div>
    `).join('');
  } catch { /* silently fail on stats */ }
}

// ── Reset / Back ──────────────────────────────────
function resetToHome() {
  document.querySelectorAll('.emotion-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('emotionTextInput').value='';
  document.getElementById('charCount').textContent='0';
  state.currentEmotion = null;
  showSection('dashboard');
}

// ── Toast ─────────────────────────────────────────
function showToast(msg, type='info') {
  const container = document.getElementById('toastContainer');
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(()=>{ toast.style.opacity='0'; toast.style.transition='opacity .4s'; setTimeout(()=>toast.remove(),400); }, 3500);
}

// ── Loader ────────────────────────────────────────
function showLoader(show) {
  document.getElementById('pageLoader').classList.toggle('hidden', !show);
}
