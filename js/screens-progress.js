// 6.x AI Progress & Confidence System

const QUIZ_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'heic'];
const QUIZ_ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,image/*,application/pdf';

function latestTest() { const h = Store.state.history; return h[h.length - 1]; }
const quizzes = n => n === 1 ? '1 quiz' : `${n} quizzes`;
const sheetName = s => s.name || s.title;

function detectTopics(files) {
  const found = new Set();
  files.forEach(f => {
    const n = f.name.toLowerCase();
    Object.entries(DATA.topicKeywords).forEach(([t, keys]) => { if (keys.some(k => n.includes(k))) found.add(t); });
  });
  return [...found];
}

// Shared generating screen used by several flows
function loadingScreen(title, sub) {
  return `<div class="screen"><div class="content center"><div class="loader">
    <div class="spinner" aria-hidden="true"></div><h2>${title}</h2><p>${sub}</p>
    <div class="bar soft" style="max-width:240px;margin:0 auto"><span id="load-bar" style="width:5%"></span></div>
  </div></div></div>`;
}
async function runLoading(root, ms, next) {
  const bar = $('#load-bar', root);
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await wait(ms / steps);
    if (!root.isConnected) return;
    bar.style.width = Math.round(i / steps * 100) + '%';
  }
  if (root.isConnected) next();
}

/* ---------- Hub ---------- */

route('/pc', {
  title: 'Progress & Plan',
  render: () => `<div class="screen">
    <div class="topbar"><span></span><button class="icon-btn teal" data-go="/home" aria-label="Home">${icon('home')}</button></div>
    <div class="content">
      <h1 class="page-title" style="margin-top:0">Progress & Plan</h1>
      <p class="page-sub">Track your learning journey</p>
      <div class="mt-24">
        ${[['/pc/weekly', 'Weekly Test', 'file-check'], ['/pc/plan', 'Study Plan Generator', 'calendar'], ['/pc/sheets', 'Smart Revision Sheet', 'file'], ['/pc/dashboard', 'Performance Dashboard', 'chart']]
          .map(([p, t, ic]) => `<button class="list-btn" data-go="${p}"><span class="tile-icon ti-soft" style="width:40px;height:40px">${icon(ic)}</span><span class="grow"><strong>${t}</strong></span><span class="chev">${icon('arrow-right')}</span></button>`).join('')}
      </div>
    </div>
    ${tabbar('home')}
  </div>`
});

/* ---------- Weekly Test ---------- */

route('/pc/weekly', {
  title: 'Weekly Test',
  render: () => {
    const t = latestTest();
    return `<div class="screen">
      ${topbar({ back: '/pc', home: true })}
      <div class="content">
        <h1 class="page-title">Weekly Test</h1>
        <p class="page-sub">Upload notes to generate quizzes</p>
        <div class="card center-text mt-24" style="padding:30px 18px">
          <div style="font-size:52px;font-weight:300;line-height:1.1">${t.score}/100</div>
          <div class="muted small mt-8">Last test score · ${t.date}</div>
        </div>
        <div class="row mt-16" style="align-items:stretch">
          <button class="card grow center-text" id="start-new" style="border-color:var(--primary);color:var(--primary);cursor:pointer;padding:14px">${icon('plus')}<div class="small" style="font-weight:600">Start new test</div></button>
          <button class="card grow center-text" data-go="/pc/dashboard" style="cursor:pointer;padding:14px">${icon('history')}<div class="small" style="font-weight:600">View past scores</div></button>
        </div>
        <button class="btn btn-primary mt-16" data-go="/pc/upload">${icon('upload')} Upload Notes</button>
        ${App.session.files?.length ? `<p class="hint center-text">Start new test reuses your ${plural(App.session.files.length, 'uploaded file')}.</p>` : ''}
      </div>
    </div>`;
  },
  mount(root) {
    $('#start-new', root).addEventListener('click', () => {
      if (!App.session.files?.length) App.session.files = DATA.sampleFiles.map(f => ({ ...f, id: uid() }));
      go('/pc/quiz-settings');
    });
  }
});

route('/pc/upload', {
  title: 'Upload Notes',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc/weekly' })}
    <div class="content">
      <h1 class="page-title">Upload Notes</h1>
      <p class="page-sub">Upload your study materials to generate a quiz</p>
      <div class="notice mb-12">${icon('info')} Supported formats: PDF, JPG, PNG, HEIC</div>
      <div class="dropzone teal" id="dz" role="button" tabindex="0" aria-label="Upload files">
        ${icon('upload')}<strong>Drag and drop files here</strong><small>or click to browse</small>
      </div>
      <button class="btn btn-outline mt-12" id="scan">${icon('camera')} Scan with Camera</button>
      <div id="files" class="mt-16"></div>
      <p class="center-text small mt-12" id="sample-wrap"><button class="btn-link" id="sample">No notes handy? Use sample notes</button></p>
    </div>
    <div class="footer"><button class="btn btn-primary" id="cont" disabled>Continue</button></div>
  </div>`,
  mount(root) {
    App.session.files = App.session.files || [];
    const draw = () => {
      const f = App.session.files;
      $('#files', root).innerHTML = f.map(x => `<div class="file-row">${icon('file')}<div class="grow"><span class="name">${esc(x.name)}</span></div><small>${x.size} MB</small>
        <button class="icon-btn red" data-remove="${x.id}" aria-label="Remove ${esc(x.name)}">${icon('x')}</button></div>`).join('');
      $('#cont', root).disabled = !f.length;
      $('#sample-wrap', root).classList.toggle('hidden', f.length > 0);
    };
    const add = recs => { App.session.files = App.session.files.concat(recs); draw(); toast(`${plural(recs.length, 'file')} uploaded`); };
    wireDropzone($('#dz', root), { accept: QUIZ_ACCEPT, exts: QUIZ_EXTS, onFiles: fs => add(toRecords(fs)), onReject: n => toast(`${plural(n, 'file')} skipped — use PDF, JPG, PNG or HEIC`) });
    $('#scan', root).addEventListener('click', async () => {
      const fs = await pickFiles({ accept: 'image/*', multiple: false, capture: true });
      if (fs.length) add(toRecords(fs).map(r => ({ ...r, name: r.name.startsWith('image') ? `Scan_${fmtDate().replace(/ /g, '_')}.jpg` : r.name })));
    });
    $('#sample', root).addEventListener('click', () => add(DATA.sampleFiles.map(f => ({ ...f, id: uid() }))));
    on(root, 'click', '[data-remove]', (e, el) => { App.session.files = App.session.files.filter(f => f.id !== el.dataset.remove); draw(); });
    $('#cont', root).addEventListener('click', () => go('/pc/files'));
    draw();
  }
});

route('/pc/files', {
  title: 'Uploaded Notes',
  guard: () => App.session.files?.length > 0, fallback: '/pc/upload',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc/upload' })}
    <div class="content">
      <h1 class="page-title">Uploaded Notes</h1>
      <p class="page-sub" style="margin-bottom:12px">Manage your uploaded files</p>
      <div class="notice green mb-12" id="count"></div>
      <div id="list"></div>
      <p class="center-text xs muted mt-8">Drag ${icon('grip')} to reorder files</p>
    </div>
    <div class="footer">
      <button class="btn btn-ghost" id="more">${icon('plus')} Add More Files</button>
      <button class="btn btn-primary" data-go="/pc/quiz-settings">Continue to Quiz Settings</button>
    </div>
  </div>`,
  mount(root) {
    const draw = () => {
      const f = App.session.files;
      if (!f.length) return replace('/pc/upload');
      const pages = f.reduce((a, x) => a + x.pages, 0);
      $('#count', root).innerHTML = `${icon('file-check')} ${plural(f.length, 'file')} uploaded · ${plural(pages, 'page')} detected`;
      $('#list', root).innerHTML = f.map(x => fileRow(x, { manage: true, showPages: true })).join('');
    };
    draw();
    on(root, 'click', '[data-remove]', async (e, el) => {
      const f = App.session.files.find(x => x.id === el.dataset.remove);
      const ok = await confirmDialog({ title: 'Delete file?', text: `"${esc(f.name)}" will be removed from this quiz.`, yes: 'Delete', danger: true, iconName: 'trash' });
      if (!ok) return;
      App.session.files = App.session.files.filter(x => x.id !== f.id);
      draw();
    });
    on(root, 'click', '[data-rename]', async (e, el) => {
      const f = App.session.files.find(x => x.id === el.dataset.rename);
      const ext = f.name.includes('.') ? '.' + f.name.split('.').pop() : '';
      const base = ext ? f.name.slice(0, -ext.length) : f.name;
      const name = await promptDialog({ title: 'Rename file', label: 'File name', value: base });
      if (!name) return;
      f.name = name.endsWith(ext) ? name : name + ext;
      draw();
      toast('File renamed');
    });
    $('#more', root).addEventListener('click', async () => {
      const fs = (await pickFiles({ accept: QUIZ_ACCEPT })).filter(x => extOk(x.name, QUIZ_EXTS));
      if (fs.length) { App.session.files = App.session.files.concat(toRecords(fs)); draw(); }
    });
    // Pointer-based reordering (works for mouse and touch)
    let dragId = null;
    root.addEventListener('pointerdown', e => {
      const grip = e.target.closest('.grip');
      if (!grip) return;
      e.preventDefault();
      dragId = grip.closest('.file-row').dataset.id;
      grip.closest('.file-row').classList.add('dragging');
    });
    root.addEventListener('pointermove', e => {
      if (!dragId) return;
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.file-row');
      if (!over || over.dataset.id === dragId) return;
      const f = App.session.files;
      const from = f.findIndex(x => x.id === dragId), to = f.findIndex(x => x.id === over.dataset.id);
      f.splice(to, 0, f.splice(from, 1)[0]);
      draw();
      $(`.file-row[data-id="${dragId}"]`, root)?.classList.add('dragging');
    });
    const end = () => { if (dragId) { dragId = null; $$('.dragging', root).forEach(r => r.classList.remove('dragging')); } };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    $$('.grip', root).forEach(g => { g.style.touchAction = 'none'; });
    new MutationObserver(() => $$('.grip', root).forEach(g => { g.style.touchAction = 'none'; })).observe($('#list', root), { childList: true });
  }
});

route('/pc/quiz-settings', {
  title: 'Quiz Settings',
  guard: () => App.session.files?.length > 0, fallback: '/pc/upload',
  render: () => {
    const s = App.session.quizSettings || (App.session.quizSettings = { level: 'medium', count: 12, types: ['mcq', 'tf'] });
    return `<div class="screen">
      ${topbar({ back: '/pc/files' })}
      <div class="content">
        <h1 class="page-title">Quiz Settings</h1>
        <p class="page-sub">Customize your quiz before generating</p>
        <p class="label">Difficulty Level</p>
        <div class="seg mb-16" id="lvl">${['easy', 'medium', 'hard'].map(l => `<button class="${s.level === l ? 'on' : ''}" data-l="${l}" aria-pressed="${s.level === l}">${l[0].toUpperCase() + l.slice(1)}</button>`).join('')}</div>
        <label class="label" for="count">Number of Questions: <span class="teal-text" id="count-v">${s.count}</span></label>
        <input type="range" id="count" min="5" max="30" value="${s.count}">
        <div class="between xs muted mb-16"><span>5</span><span>30</span></div>
        <p class="label">Question Types</p>
        ${[['mcq', 'Multiple Choice'], ['tf', 'True/False'], ['short', 'Short Answer']].map(([v, l]) => `<label class="check-card"><input type="checkbox" value="${v}" ${s.types.includes(v) ? 'checked' : ''}>${l}</label>`).join('')}
        <div class="error hidden" id="type-err">Choose at least one question type.</div>
        <div class="card soft mt-16"><small class="muted">Estimated time</small><div style="font-weight:600;font-size:17px" id="est"></div></div>
      </div>
      <div class="footer"><button class="btn btn-primary" id="gen">Generate Quiz</button></div>
    </div>`;
  },
  mount(root) {
    const s = App.session.quizSettings;
    const est = () => { $('#est', root).textContent = `~${Math.ceil(s.count * 0.75)} minutes`; };
    est();
    on(root, 'click', '[data-l]', (e, el) => { s.level = el.dataset.l; $$('[data-l]', root).forEach(b => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); }); });
    $('#count', root).addEventListener('input', e => { s.count = +e.target.value; $('#count-v', root).textContent = s.count; est(); });
    on(root, 'change', '.check-card input', () => {
      s.types = $$('.check-card input:checked', root).map(i => i.value);
      $('#type-err', root).classList.toggle('hidden', s.types.length > 0);
    });
    $('#gen', root).addEventListener('click', async () => {
      if (!s.types.length) { $('#type-err', root).classList.remove('hidden'); return; }
      const files = App.session.files, pages = files.reduce((a, f) => a + f.pages, 0);
      const ok = await confirmDialog({
        title: 'Confirm Quiz Generation', text: 'Please confirm that you have uploaded the correct notes and are ready to generate your quiz.',
        rows: `<div class="info-row">${icon('file')}<div><strong>Uploaded Notes</strong><span>${plural(files.length, 'file')} · ${plural(pages, 'page')} uploaded successfully</span></div></div>
          <div class="info-row">${icon('sliders')}<div><strong>Quiz Settings</strong><span>${s.count} questions · ${s.level[0].toUpperCase() + s.level.slice(1)}</span></div></div>`,
        yes: 'Yes, Generate Quiz', no: 'No, Change Notes', iconName: 'sparkles'
      });
      if (ok) { startWeeklyQuiz(); go('/pc/generating'); }
    });
  }
});

function startWeeklyQuiz(fromQuestions) {
  const s = App.session.quizSettings || { level: 'medium', count: 12, types: ['mcq', 'tf'] };
  let qs;
  if (fromQuestions) qs = fromQuestions;
  else {
    const topics = detectTopics(App.session.files || []);
    const bank = DATA.weeklyBank.filter(q => s.types.includes(q.type));
    const score = q => (topics.length && !topics.includes(q.topic) ? 2 : 0) + (q.level === s.level ? 0 : 1) + Math.random();
    qs = bank.map(q => [score(q), q]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, s.count);
    qs = shuffle(qs);
  }
  App.session.quiz = {
    questions: qs.map(q => ({ ...q, options: q.type === 'mcq' ? shuffle(q.options) : q.options })),
    idx: 0, answers: qs.map(() => ({ value: null, correct: false, skipped: false, flagged: false, changes: 0, time: 0, revealed: false })),
    instant: App.session.quiz?.instant ?? true, limit: Math.ceil(qs.length * 0.75) * 60, started: null, saved: false, redo: !!fromQuestions
  };
}

route('/pc/generating', {
  title: 'Generating Quiz', guard: () => !!App.session.quiz, fallback: '/pc/weekly',
  render: () => loadingScreen('Generating your quiz…', 'Reading your notes and writing questions'),
  mount(root) { runLoading(root, 1800, () => replace('/pc/quiz')); }
});

function isCorrect(q, value) {
  if (value === null || value === undefined) return false;
  if (q.type === 'short') return q.accept.includes(String(value).trim().toLowerCase());
  return value === q.answer;
}

// Estimated confidence (0-100) from behaviour: speed, answer changes and skips
function estimateConfidence(a) {
  if (a.skipped) return 15;
  const c = 92 - a.changes * 18 - Math.max(0, a.time - 12) * 1.4;
  return Math.max(10, Math.min(95, Math.round(c)));
}

route('/pc/quiz', {
  title: 'Weekly Test', guard: () => !!App.session.quiz && !App.session.quiz.done, fallback: '/pc/weekly',
  render: () => `<div class="screen">
    <div class="topbar">
      <button class="back" id="leave">${icon('arrow-left')} Back</button>
      <label class="check small" style="font-weight:500"><input type="checkbox" id="instant" ${App.session.quiz.instant ? 'checked' : ''}> Instant feedback</label>
    </div>
    <div class="content" id="qz"></div>
  </div>`,
  mount(root) {
    const Q = App.session.quiz;
    if (!Q.started) Q.started = Date.now();
    let shownAt = Date.now();
    const timer = setInterval(() => { const m = $('#left', root); if (m) m.textContent = minsLeft(); }, 5000);
    App.cleanups.push(() => clearInterval(timer));
    const minsLeft = () => `~${Math.max(0, Math.ceil((Q.limit - (Date.now() - Q.started) / 1000) / 60))} min left`;

    const draw = () => {
      const q = Q.questions[Q.idx], a = Q.answers[Q.idx];
      const last = Q.idx === Q.questions.length - 1;
      const locked = Q.instant && a.revealed;
      const optCls = o => {
        if (locked) return o === q.answer ? 'right' : (o === a.value ? 'wrong' : '');
        return o === a.value ? 'picked' : '';
      };
      const answerUI = q.type === 'short'
        ? `<input class="input" id="short" placeholder="Type your answer" value="${esc(a.value || '')}" ${locked ? 'readonly' : ''} autocomplete="off">
           ${locked ? `<div class="stat-row ${a.correct ? 'green' : 'red'} mt-8">${icon(a.correct ? 'check-circle' : 'x-circle')} ${a.correct ? 'Correct!' : `Answer: ${esc(q.answer)}`}</div>` : ''}`
        : `<div class="opt-grid">${q.options.map(o => `<button class="opt ${optCls(o)}" data-opt="${esc(o)}" ${locked ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
      const ready = a.value !== null && String(a.value).trim() !== '';
      const primary = locked || !Q.instant
        ? `<button class="btn btn-primary mt-16" id="next" ${ready ? '' : 'disabled'}>${last ? 'Finish Quiz' : (Q.instant ? 'Continue' : 'Next')}</button>`
        : `<button class="btn btn-primary mt-16" id="check" ${ready ? '' : 'disabled'}>Check Answer</button>`;
      $('#qz', root).innerHTML = `
        <h1 class="page-title">Weekly Test</h1>
        <div class="qmeta mb-8">Q${Q.idx + 1}/${Q.questions.length} • ${icon('clock')} <span id="left">${minsLeft()}</span>${Q.redo ? ' • <span class="badge b-amber">Redo</span>' : ''}</div>
        <div class="bar soft mb-16" style="height:4px"><span style="width:${(Q.idx) / Q.questions.length * 100}%"></span></div>
        <div style="min-height:90px"></div>
        <div class="xs muted mb-8">${esc(q.topic)} · ${q.type === 'mcq' ? 'Multiple choice' : q.type === 'tf' ? 'True or false' : 'Short answer'}</div>
        <div class="qtext"><span>${esc(q.q)}</span><button class="flag-btn ${a.flagged ? 'on' : ''}" id="flag" aria-pressed="${a.flagged}" aria-label="${a.flagged ? 'Unflag question' : 'Flag question for review'}">${icon('flag')}</button></div>
        ${answerUI}
        ${locked ? `<button class="btn btn-ghost mt-12" id="explain">${icon('bulb')} Explain</button><div id="exp"></div>` : ''}
        ${primary}
        ${locked ? '' : `<button class="btn btn-ghost mt-12" id="skip">${icon('skip')} Skip Question</button>`}`;
      shownAt = Date.now();
      const sh = $('#short', root);
      if (sh && !locked) {
        sh.focus();
        sh.addEventListener('input', () => {
          a.value = sh.value;
          const btn = $('#next', root) || $('#check', root);
          btn.disabled = !sh.value.trim();
        });
        sh.addEventListener('keydown', e => { if (e.key === 'Enter' && sh.value.trim()) ($('#check', root) || $('#next', root)).click(); });
      }
    };

    const record = () => { const a = Q.answers[Q.idx]; a.time += (Date.now() - shownAt) / 1000; shownAt = Date.now(); };
    const advance = () => {
      record();
      const a = Q.answers[Q.idx];
      a.correct = isCorrect(Q.questions[Q.idx], a.value);
      if (Q.idx < Q.questions.length - 1) { Q.idx++; draw(); $('.content', root).scrollTop = 0; }
      else finish();
    };
    const finish = () => {
      const skippedBlank = Q.answers.filter(a => a.value === null).length;
      const done = () => { Q.done = true; replace('/pc/results'); };
      if (skippedBlank) {
        confirmDialog({ title: 'Finish quiz?', text: `You skipped ${plural(skippedBlank, 'question')}. Skipped questions are marked incorrect.`, yes: 'Finish Quiz', no: 'Keep Going', iconName: 'flag' })
          .then(ok => { if (ok) done(); });
      } else done();
    };

    on(root, 'click', '[data-opt]', (e, el) => {
      const a = Q.answers[Q.idx];
      if (a.value !== null && a.value !== el.dataset.opt) a.changes++;
      a.value = el.dataset.opt;
      a.skipped = false;
      if (Q.instant) { record(); a.revealed = true; a.correct = isCorrect(Q.questions[Q.idx], a.value); }
      draw();
    });
    on(root, 'click', '#check', () => {
      const a = Q.answers[Q.idx];
      record(); a.revealed = true; a.correct = isCorrect(Q.questions[Q.idx], a.value);
      draw();
    });
    on(root, 'click', '#next', advance);
    on(root, 'click', '#skip', () => {
      const a = Q.answers[Q.idx];
      a.skipped = true; a.value = null;
      if (Q.idx < Q.questions.length - 1) { record(); Q.idx++; draw(); toast('Question skipped'); }
      else { record(); finish(); }
    });
    on(root, 'click', '#flag', () => {
      const a = Q.answers[Q.idx]; a.flagged = !a.flagged; draw();
      toast(a.flagged ? 'Flagged for review' : 'Flag removed');
    });
    on(root, 'click', '#explain', (e, el) => {
      const box = $('#exp', root);
      const open = !box.innerHTML;
      box.innerHTML = open ? `<div class="explain"><header>Explanation</header>${esc(Q.questions[Q.idx].explain)}</div>` : '';
      el.setAttribute('aria-expanded', open);
    });
    $('#instant', root).addEventListener('change', e => { Q.instant = e.target.checked; draw(); });
    $('#leave', root).addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Leave quiz?', text: 'Your answers for this quiz will not be saved.', yes: 'Leave Quiz', no: 'Stay', danger: true, iconName: 'alert' });
      if (ok) { App.session.quiz = null; back('/pc/weekly'); }
    });
    draw();
  }
});

function quizSummary(Q) {
  const n = Q.questions.length;
  const correct = Q.answers.filter(a => a.correct).length;
  const skipped = Q.answers.filter(a => a.value === null).length;
  const topics = {};
  Q.questions.forEach((q, i) => {
    topics[q.topic] = topics[q.topic] || { c: 0, n: 0 };
    topics[q.topic].n++;
    if (Q.answers[i].correct) topics[q.topic].c++;
  });
  const conf = Q.answers.map(estimateConfidence);
  const calib = { over: 0, under: 0, ok: 0 };
  conf.forEach((c, i) => {
    const right = Q.answers[i].correct;
    if (c >= 60 && !right) calib.over++;
    else if (c < 50 && right) calib.under++;
    else calib.ok++;
  });
  return { n, correct, skipped, wrong: n - correct - skipped, pct: Math.round(correct / n * 100), topics, conf, avgConf: Math.round(conf.reduce((a, b) => a + b, 0) / n), calib };
}

route('/pc/results', {
  title: 'Quiz Complete', guard: () => App.session.quiz?.done, fallback: '/pc/weekly',
  render: () => {
    const Q = App.session.quiz, S = quizSummary(Q);
    if (!Q.saved && !Q.redo) {
      Q.saved = true;
      const d = new Date();
      Store.set(s => {
        s.history.push({ id: uid(), label: `${d.getDate()}/${d.getMonth() + 1}`, date: fmtDate(d), score: S.pct, confidence: S.avgConf,
          topics: Object.fromEntries(Object.entries(S.topics).map(([t, v]) => [t, Math.round(v.c / v.n * 100)])) });
      });
      markStudied();
    }
    const weak = Object.entries(S.topics).filter(([, v]) => v.c / v.n < 0.7).map(([t]) => t);
    const pc = v => Math.round(v.c / v.n * 100);
    const cls = p => p < 50 ? 'pct-bad' : p < 80 ? 'pct-ok' : 'pct-good';
    const verdict = S.calib.over > S.calib.under && S.calib.over > 0 ? ['Slightly overconfident', 'You answered some questions quickly and confidently but got them wrong. Slow down on these topics.', 'amber']
      : S.calib.under > 0 ? ['Underconfident', 'You hesitated on questions you actually got right. Trust your knowledge more!', 'info']
      : ['Well calibrated', 'Your confidence matched your results closely. Great self-awareness!', 'success'];
    return `<div class="screen">
      <div class="content">
        <h1 class="page-title mt-8">${Q.redo ? 'Redo Complete!' : 'Quiz Complete!'}</h1>
        <p class="page-sub">Here's how you did</p>
        <div class="result-big"><div class="num">${S.pct}%</div><small>${S.correct} out of ${S.n} correct</small></div>
        <div class="stat-row green">${icon('check-circle')} Correct: ${plural(S.correct, 'question')}</div>
        <div class="stat-row red">${icon('x-circle')} Incorrect: ${plural(S.wrong, 'question')}</div>
        ${S.skipped ? `<div class="stat-row amber">${icon('skip')} Skipped: ${plural(S.skipped, 'question')}</div>` : ''}
        <div class="card mt-16">
          <h3 class="row" style="gap:8px">${icon('trend-down')} Topic Breakdown</h3>
          ${Object.entries(S.topics).map(([t, v]) => `<div class="kv"><span>${esc(t)}</span><span><span class="muted">${v.c}/${v.n}</span><span class="${cls(pc(v))}">${pc(v)}%</span></span></div>`).join('')}
        </div>
        ${weak.length ? `<div class="card danger mt-12"><h3 class="row red-text" style="gap:8px">${icon('alert')} Areas to Improve</h3><div class="chips mt-8">${weak.map(t => `<span class="badge b-red" style="padding:4px 10px">${esc(t)}</span>`).join('')}</div></div>` : ''}
        <div class="card ${verdict[2] === 'success' ? 'success' : verdict[2] === 'info' ? 'info' : 'warn'} mt-12">
          <h3 class="row" style="gap:8px">${icon('sparkles')} Confidence Accuracy</h3>
          <p><b>${verdict[0]}.</b> ${verdict[1]}</p>
          <div class="kv mt-8"><span>Estimated confidence</span><span><b>${S.avgConf}%</b></span></div>
          <div class="kv"><span>Accurate · Over · Under</span><span><b>${S.calib.ok} · ${S.calib.over} · ${S.calib.under}</b></span></div>
          <p class="xs mt-8">Estimated automatically from answer speed, answer changes and skips.</p>
        </div>
      </div>
      <div class="footer">
        <button class="btn btn-primary" data-go="/pc/review">View Answers</button>
        <button class="btn btn-outline" data-go="/pc/dashboard">View Dashboard</button>
        <button class="btn btn-ghost" id="to-weekly">Back to Weekly Test</button>
      </div>
    </div>`;
  },
  mount(root) { $('#to-weekly', root).addEventListener('click', () => { App.stack = ['/home', '/pc']; replace('/pc/weekly'); }); }
});

route('/pc/review', {
  title: 'Answer Review', guard: () => App.session.quiz?.done, fallback: '/pc/weekly',
  render: q => {
    const Q = App.session.quiz;
    const filter = q.f || 'all';
    const wrongIdx = Q.answers.map((a, i) => a.correct ? -1 : i).filter(i => i >= 0);
    const show = Q.questions.map((qq, i) => i).filter(i => filter === 'all' || (filter === 'wrong' && !Q.answers[i].correct) || (filter === 'flagged' && Q.answers[i].flagged));
    const bm = Store.state.bookmarks;
    return `<div class="screen">
      ${topbar({ back: '/pc/results', label: 'Back to Results' })}
      <div class="content">
        <h1 class="page-title">Answer Review</h1>
        <p class="page-sub" style="margin-bottom:12px">Review your answers and explanations</p>
        <div class="chips mb-16">${[['all', 'All'], ['wrong', `Wrong (${wrongIdx.length})`], ['flagged', `Flagged (${Q.answers.filter(a => a.flagged).length})`]]
          .map(([v, l]) => `<button class="chip ${filter === v ? 'on' : ''}" data-f="${v}">${l}</button>`).join('')}</div>
        ${show.length ? show.map(i => {
          const qq = Q.questions[i], a = Q.answers[i], skip = a.value === null;
          return `<div class="review ${a.correct ? 'ok' : skip ? 'skip' : 'bad'}">
            <h4>${icon(a.correct ? 'check-circle' : skip ? 'skip' : 'x-circle')}<span class="grow">Q${i + 1}. ${esc(qq.q)}</span>${a.flagged ? `<span class="flag-btn on" title="Flagged">${icon('flag')}</span>` : ''}</h4>
            <div class="lbl">Your answer:</div><div class="${a.correct ? 'ans-ok' : 'ans-bad'}">${skip ? '<i>Skipped</i>' : esc(a.value)}</div>
            ${a.correct ? '' : `<div class="lbl">Correct answer:</div><div class="ans-ok">${esc(qq.answer)}</div>`}
            <div class="explain"><header>Explanation: <button data-bm="${qq.id}" class="${bm.includes(qq.id) ? 'on' : ''}" aria-label="Bookmark explanation">${icon('bookmark')}</button></header>${esc(qq.explain)}</div>
          </div>`;
        }).join('') : `<div class="empty">${icon('check-circle')}<div>Nothing to show here.</div></div>`}
      </div>
      <div class="footer">
        ${wrongIdx.length ? `<button class="btn btn-primary" id="redo">${icon('redo')} Redo Wrong Questions Only (${wrongIdx.length})</button>` : ''}
        <button class="btn btn-ghost" id="to-weekly">Back to Weekly Test</button>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'click', '[data-f]', (e, el) => replace('/pc/review?f=' + el.dataset.f));
    on(root, 'click', '[data-bm]', (e, el) => {
      const id = el.dataset.bm;
      Store.set(s => { s.bookmarks = s.bookmarks.includes(id) ? s.bookmarks.filter(x => x !== id) : s.bookmarks.concat(id); });
      el.classList.toggle('on');
      toast(el.classList.contains('on') ? 'Explanation bookmarked' : 'Bookmark removed');
    });
    const r = $('#redo', root);
    if (r) r.addEventListener('click', () => {
      const Q = App.session.quiz;
      startWeeklyQuiz(Q.questions.filter((q, i) => !Q.answers[i].correct));
      replace('/pc/quiz');
    });
    $('#to-weekly', root).addEventListener('click', () => { App.stack = ['/home', '/pc']; replace('/pc/weekly'); });
  }
});

/* ---------- Study Plan Generator ---------- */

route('/pc/plan', {
  title: 'Study Plan Generator',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc', home: true })}
    <div class="content">
      <h1 class="page-title">Study Plan Generator</h1>
      <p class="page-sub">Create personalized study plans based on your quiz history</p>
      <div class="card mt-24"><h3 class="row teal-text" style="gap:10px">${icon('calendar')}<span style="color:var(--text)">Select Quiz Dates</span></h3><p style="padding-left:30px">Choose which quizzes you've completed and when</p></div>
      <div class="card"><h3 class="row teal-text" style="gap:10px">${icon('trend')}<span style="color:var(--text)">AI-Generated Plan</span></h3><p style="padding-left:30px">Get a customized study plan based on your performance</p></div>
      ${Store.state.plan ? `<div class="card info mt-16"><div class="between"><div><strong class="small">Current plan</strong><div class="xs muted">${Store.state.plan.tasks.filter(t => t.done).length}/${Store.state.plan.tasks.length} tasks done · ${Store.state.plan.hours} hours</div></div><button class="btn btn-sm btn-outline" data-go="/pc/plan/view">Open</button></div></div>` : ''}
    </div>
    <div class="footer"><button class="btn btn-primary" data-go="/pc/plan/new">Create Study Plan</button></div>
  </div>`
});

route('/pc/plan/new', {
  title: 'Study Plan Generator',
  render: () => {
    const hist = Store.state.history;
    const sel = App.session.planSel || (App.session.planSel = { hours: 5, ids: hist.slice(0, 3).map(h => h.id) });
    return `<div class="screen">
      ${topbar({ back: '/pc/plan' })}
      <div class="content">
        <h1 class="page-title">Study Plan Generator</h1>
        <p class="page-sub">Select quiz history to generate your plan</p>
        <div class="field"><label for="hours">Total study time (hours)</label>
          <input id="hours" class="input" type="number" min="1" max="40" step="1" value="${sel.hours}" inputmode="numeric">
          <div class="error hidden" id="h-err">Enter between 1 and 40 hours.</div></div>
        <p class="label">Select quiz</p>
        <div class="date-grid">${hist.map(h => `<button class="${sel.ids.includes(h.id) ? 'on' : ''}" data-q="${h.id}" aria-pressed="${sel.ids.includes(h.id)}">${h.label}<small>${h.score}%</small></button>`).join('')}</div>
        <div class="error hidden" id="q-err">Select at least one quiz.</div>
        <p class="hint">Tap to select the quizzes your plan should be based on.</p>
      </div>
      <div class="footer"><button class="btn btn-primary" id="gen">Generate Plan</button></div>
    </div>`;
  },
  mount(root) {
    const sel = App.session.planSel;
    on(root, 'click', '[data-q]', (e, el) => {
      const id = el.dataset.q;
      sel.ids = sel.ids.includes(id) ? sel.ids.filter(x => x !== id) : sel.ids.concat(id);
      el.classList.toggle('on'); el.setAttribute('aria-pressed', sel.ids.includes(id));
      $('#q-err', root).classList.add('hidden');
    });
    $('#hours', root).addEventListener('input', e => { sel.hours = +e.target.value; });
    $('#gen', root).addEventListener('click', async () => {
      const okH = sel.hours >= 1 && sel.hours <= 40, okQ = sel.ids.length > 0;
      $('#h-err', root).classList.toggle('hidden', okH);
      $('#hours', root).classList.toggle('invalid', !okH);
      $('#q-err', root).classList.toggle('hidden', okQ);
      if (!okH || !okQ) return;
      const ok = await confirmDialog({
        title: 'Confirm Study Plan', text: 'Please confirm your quiz selection and study hours are correct before generating your personalized study plan.',
        rows: `<div class="info-row">${icon('calendar')}<div><strong>Selected Quizzes</strong><span>${quizzes(sel.ids.length)} selected</span></div></div>
          <div class="info-row">${icon('clock')}<div><strong>Study Hours</strong><span>${plural(sel.hours, 'hour')} in total</span></div></div>`,
        yes: 'Yes, Generate Plan', no: 'No, Modify Selection', iconName: 'sparkles'
      });
      if (!ok) return;
      buildPlan(sel);
      go('/pc/plan/generating');
    });
  }
});

function buildPlan(sel) {
  const quizzes = Store.state.history.filter(h => sel.ids.includes(h.id));
  const agg = {};
  quizzes.forEach(q => Object.entries(q.topics).forEach(([t, v]) => { agg[t] = agg[t] || []; agg[t].push(v); }));
  const ranked = Object.entries(agg).map(([t, v]) => [t, v.reduce((a, b) => a + b, 0) / v.length]).sort((a, b) => a[1] - b[1]).slice(0, 4);
  const weights = ranked.map(([, avg]) => 100 - avg + 10);
  const total = weights.reduce((a, b) => a + b, 0);
  const times = ['9:00 AM', '2:00 PM', '7:00 PM', '10:00 AM'];
  Store.set(s => {
    s.plan = {
      hours: sel.hours, quizCount: quizzes.length, created: fmtDate(), checkin: '20:00',
      tasks: ranked.map(([t, avg], i) => ({
        id: uid(), text: DATA.planTasks[t] || `Revise on ${t}`, topic: t, avg: Math.round(avg),
        mins: Math.max(15, Math.round(sel.hours * 60 * weights[i] / total / 5) * 5),
        done: false, remind: i < 2, when: `${i < 2 ? 'Tomorrow' : 'In 2 days'} ${times[i]}`
      }))
    };
  });
}

route('/pc/plan/generating', {
  title: 'Generating Plan', guard: () => !!Store.state.plan, fallback: '/pc/plan',
  render: () => loadingScreen('Building your study plan…', 'Finding your weakest topics'),
  mount(root) { runLoading(root, 1500, () => replace('/pc/plan/view')); }
});

function hm(mins) { const h = Math.floor(mins / 60), m = mins % 60; return h ? `${h}h${m ? ' ' + m + 'm' : ''}` : `${m}m`; }
function to12h(t) { const [h, m] = t.split(':').map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; }
function snooze(when) {
  const m = when.match(/(\d+):(\d+) (AM|PM)$/);
  if (!m) return when;
  let h = +m[1] % 12 + (m[3] === 'PM' ? 12 : 0) + 1;
  const prefix = when.slice(0, m.index);
  return prefix + to12h(`${h % 24}:${m[2]}`);
}

route('/pc/plan/view', {
  title: 'Your Study Plan', guard: () => !!Store.state.plan, fallback: '/pc/plan',
  render: () => {
    const p = Store.state.plan, done = p.tasks.filter(t => t.done).length;
    return `<div class="screen">
      ${topbar({ back: '/pc/plan' })}
      <div class="content">
        <h1 class="page-title">Your Study Plan</h1>
        <p class="page-sub">Based on ${quizzes(p.quizCount)} · created ${p.created}</p>
        <div class="card soft"><small class="muted">Total study time</small><div style="font-size:22px">${plural(p.hours, 'hour')}</div></div>
        <div class="card info mt-12" style="padding:14px">
          <div class="between small" style="color:var(--info)"><span>Progress</span><span>${done}/${p.tasks.length} completed</span></div>
          <div class="bar blue mt-8"><span style="width:${done / p.tasks.length * 100}%"></span></div>
        </div>
        <div class="card mt-12">
          <h3>TO-DO</h3>
          ${p.tasks.map(t => `<div class="todo ${t.done ? 'done' : ''}">
            <input type="checkbox" id="t-${t.id}" data-done="${t.id}" ${t.done ? 'checked' : ''}>
            <div class="grow"><label for="t-${t.id}">${esc(t.text)}</label>
              <div class="xs muted">${hm(t.mins)} · current score ${t.avg}%</div>
              ${t.remind && !t.done ? `<div class="when">${icon('clock')} ${t.when} <button data-snooze="${t.id}">Snooze</button></div>` : ''}</div>
            <button class="bell ${t.remind ? 'on' : ''}" data-bell="${t.id}" aria-pressed="${t.remind}" aria-label="${t.remind ? 'Turn off reminder' : 'Turn on reminder'}">${icon('bell')}</button>
          </div>`).join('')}
        </div>
        <div class="card success mt-12">
          <h3 class="row green-text" style="gap:8px">${icon('bell-ring')} Daily Check-in</h3>
          <p style="color:var(--success)">We'll remind you daily at ${to12h(p.checkin)} to review your progress</p>
          <button class="btn-link mt-8" id="checkin" style="color:var(--success)">Change check-in time</button>
        </div>
      </div>
      <div class="footer row">
        <button class="btn btn-ghost" id="done">Done</button>
        <button class="btn btn-primary" data-go="/pc/plan/new">Create New Plan</button>
      </div>
    </div>`;
  },
  mount(root) {
    const task = id => Store.state.plan.tasks.find(t => t.id === id);
    on(root, 'change', '[data-done]', (e, el) => {
      Store.set(() => { task(el.dataset.done).done = el.checked; });
      if (el.checked) markStudied();
      const p = Store.state.plan;
      render();
      if (p.tasks.every(t => t.done)) toast('🎉 Plan complete! Great work.');
    });
    on(root, 'click', '[data-bell]', (e, el) => {
      Store.set(() => { const t = task(el.dataset.bell); t.remind = !t.remind; });
      render();
      toast(task(el.dataset.bell).remind ? 'Reminder on' : 'Reminder off');
    });
    on(root, 'click', '[data-snooze]', (e, el) => {
      Store.set(() => { const t = task(el.dataset.snooze); t.when = snooze(t.when); });
      render();
      toast('Snoozed for 1 hour');
    });
    $('#checkin', root).addEventListener('click', () => {
      overlay(`<form class="sheet" role="dialog" aria-modal="true" aria-label="Change check-in time">
        <header><h2>Daily check-in time</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        <div class="field"><label for="ci">Remind me at</label><input id="ci" class="input" type="time" value="${Store.state.plan.checkin}" required></div>
        <button class="btn btn-primary" type="submit">Save</button>
      </form>`, {
        kind: 'bottom',
        onMount(o, close) {
          $('form', o).addEventListener('submit', e => {
            e.preventDefault();
            const v = $('#ci', o).value;
            if (!v) return;
            Store.set(s => { s.plan.checkin = v; });
            close(); render(); toast(`Check-in set for ${to12h(v)}`);
          });
        }
      });
    });
    $('#done', root).addEventListener('click', () => { App.stack = ['/home']; replace('/pc'); });
  }
});

/* ---------- Smart Revision Sheets ---------- */

const SHEET_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'heic', 'txt', 'doc', 'docx'];

route('/pc/sheets', {
  title: 'Smart Revision Sheet',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc', home: true })}
    <div class="content">
      <h1 class="page-title">Smart Revision Sheet</h1>
      <p class="page-sub">Upload notes to generate smart revision sheets</p>
      <div class="card mt-24"><h3 class="row teal-text" style="gap:10px">${icon('upload')}<span style="color:var(--text)">Upload Your Notes</span></h3><p style="padding-left:30px">Supports PDF, images, and text files</p></div>
      <div class="card"><h3 class="row teal-text" style="gap:10px">${icon('file')}<span style="color:var(--text)">AI Analysis</span></h3><p style="padding-left:30px">Extracts key points and creates summaries</p></div>
    </div>
    <div class="footer">
      <button class="btn btn-primary" data-go="/pc/sheets/upload">Create New Sheet</button>
      <button class="btn btn-outline" data-go="/pc/sheets/saved">View Saved Sheets (${Store.state.sheets.length})</button>
    </div>
  </div>`
});

route('/pc/sheets/upload', {
  title: 'Upload Notes',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc/sheets' })}
    <div class="content">
      <h1 class="page-title">Upload Notes</h1>
      <p class="page-sub">Upload your study materials</p>
      <div class="notice mb-12">${icon('info')} Supported formats: PDF, JPG, PNG, HEIC, TXT, DOC</div>
      <div class="dropzone" id="dz" role="button" tabindex="0" aria-label="Upload files">${icon('upload')}<strong>Drag and drop files here</strong><small>or click to browse</small></div>
      <button class="btn btn-outline mt-12" id="scan">${icon('camera')} Scan with Camera</button>
      <div id="files" class="mt-16"></div>
      <p class="center-text small mt-12" id="sample-wrap"><button class="btn-link" id="sample">Use sample notes</button></p>
    </div>
    <div class="footer"><button class="btn btn-primary" id="gen" disabled>Generate Revision Sheet</button></div>
  </div>`,
  mount(root) {
    let files = [];
    const draw = () => {
      $('#files', root).innerHTML = files.map(x => `<div class="file-row">${icon('file')}<div class="grow"><span class="name">${esc(x.name)}</span></div><small>${x.size} MB</small><button class="icon-btn red" data-remove="${x.id}" aria-label="Remove ${esc(x.name)}">${icon('x')}</button></div>`).join('');
      $('#gen', root).disabled = !files.length;
      $('#sample-wrap', root).classList.toggle('hidden', files.length > 0);
    };
    wireDropzone($('#dz', root), { accept: SHEET_EXTS.map(e => '.' + e).join(','), exts: SHEET_EXTS, onFiles: fs => { files = files.concat(toRecords(fs)); draw(); }, onReject: n => toast(`${plural(n, 'file')} skipped — unsupported format`) });
    $('#scan', root).addEventListener('click', async () => { const fs = await pickFiles({ accept: 'image/*', multiple: false, capture: true }); if (fs.length) { files = files.concat(toRecords(fs)); draw(); } });
    $('#sample', root).addEventListener('click', () => { files = [{ id: uid(), name: 'Journal_Entry_Notes.pdf', size: 3.2, pages: 14 }]; draw(); });
    on(root, 'click', '[data-remove]', (e, el) => { files = files.filter(f => f.id !== el.dataset.remove); draw(); });
    $('#gen', root).addEventListener('click', () => {
      const topics = detectTopics(files);
      const key = topics.includes('Assets') || topics.includes('Liabilities') ? 'Assets & Liabilities'
        : topics.find(t => DATA.revisionContent[t]) || 'Journal Entry';
      App.session.draftSheet = { id: 'draft', title: key, date: fmtDate(), topics: DATA.revisionContent[key].points.length, from: files.map(f => f.name) };
      go('/pc/sheets/generating');
    });
    draw();
  }
});

route('/pc/sheets/generating', {
  title: 'Generating Sheet', guard: () => !!App.session.draftSheet, fallback: '/pc/sheets',
  render: () => loadingScreen('Creating revision sheet…', 'Extracting key points and writing a summary'),
  mount(root) { runLoading(root, 1500, () => replace('/pc/sheets/view?id=draft')); }
});

route('/pc/sheets/saved', {
  title: 'Saved Revision Sheets',
  render: () => `<div class="screen">
    ${topbar({ back: '/pc/sheets' })}
    <div class="content">
      <h1 class="page-title">Saved Revision Sheets</h1>
      <p class="page-sub" style="margin-bottom:12px">${plural(Store.state.sheets.length, 'sheet')} saved</p>
      <div class="search mb-16">${icon('search')}<input class="input" id="sq" type="search" placeholder="Search sheets..." aria-label="Search sheets"></div>
      <div id="list"></div>
    </div>
    <div class="footer"><button class="btn btn-primary" data-go="/pc/sheets/upload">Create New Sheet</button></div>
  </div>`,
  mount(root) {
    const draw = () => {
      const q = $('#sq', root).value.trim().toLowerCase();
      const list = Store.state.sheets.filter(s => sheetName(s).toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
      $('#list', root).innerHTML = list.length ? list.map(s => `<button class="list-btn" data-go="/pc/sheets/view?id=${s.id}" style="padding:14px 16px">
        <span class="teal-text">${icon('file')}</span><span class="grow"><strong>${esc(sheetName(s))}</strong>
        <small class="row meta" style="gap:6px">${icon('calendar')} ${s.date} · ${plural(s.topics, 'topic')}</small></span></button>`).join('')
        : `<div class="empty">${icon('file')}<div>${q ? `No sheets match "${esc(q)}"` : 'No saved sheets yet'}</div></div>`;
    };
    $('#sq', root).addEventListener('input', draw);
    draw();
  }
});

route('/pc/sheets/view', {
  title: 'Smart Revision Sheet',
  guard: q => q.id === 'draft' ? !!App.session.draftSheet : Store.state.sheets.some(s => s.id === q.id), fallback: '/pc/sheets/saved',
  render: q => {
    const draft = q.id === 'draft';
    const s = draft ? App.session.draftSheet : Store.state.sheets.find(x => x.id === q.id);
    const c = DATA.revisionContent[s.title] || DATA.revisionContent['Journal Entry'];
    return `<div class="screen">
      ${topbar({ back: draft ? '/pc/sheets/upload' : '/pc/sheets/saved', right: draft ? '' : `<button class="icon-btn red" id="del" aria-label="Delete sheet">${icon('trash')}</button>` })}
      <div class="content">
        <h1 class="page-title">Smart Revision Sheet</h1>
        <p class="page-sub">${esc(sheetName(s))}${draft ? ' · <span class="badge b-amber">Not saved</span>' : ''}</p>
        <div class="sheet-doc">
          <h3>Topic: ${esc(s.title)}</h3>
          <h4>Important points</h4><ul class="bul">${c.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
          <h4>Summary</h4><ul class="bul">${c.summary.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
          ${s.from ? `<p class="xs muted mt-16">Generated from ${s.from.map(esc).join(', ')}</p>` : ''}
        </div>
        <button class="btn btn-ghost mt-12" data-go="/pc/upload">${icon('file-check')} Quiz me on this topic</button>
      </div>
      <div class="footer row">
        <button class="btn btn-ghost" data-go="/pc/sheets/upload">${icon('upload')} Create New Sheet</button>
        <button class="btn btn-primary" id="save" ${draft ? '' : 'disabled'}>${icon(draft ? 'save' : 'check')} ${draft ? 'Save' : 'Saved'}</button>
      </div>
    </div>`;
  },
  mount(root, q) {
    const sv = $('#save', root);
    if (q.id === 'draft') sv.addEventListener('click', async () => {
      const d = App.session.draftSheet;
      const title = await promptDialog({ title: 'Save revision sheet', label: 'Sheet name', value: d.title });
      if (!title) return;
      const id = uid();
      // title keys the generated content; name is what the student called it
      Store.set(s => { s.sheets.unshift({ id, title: d.title, name: title, date: d.date, topics: d.topics }); });
      App.session.draftSheet = null;
      toast('Revision sheet saved');
      replace('/pc/sheets/view?id=' + id);
    });
    const del = $('#del', root);
    if (del) del.addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Delete sheet?', text: 'This revision sheet will be removed from your saved sheets.', yes: 'Delete', danger: true, iconName: 'trash' });
      if (!ok) return;
      Store.set(s => { s.sheets = s.sheets.filter(x => x.id !== q.id); });
      toast('Sheet deleted');
      back('/pc/sheets/saved');
    });
  }
});

/* ---------- Performance Dashboard & Heatmap ---------- */

function trendChart(history) {
  const W = 300, H = 150, pad = { l: 22, r: 10, t: 10, b: 24 };
  const n = history.length;
  const x = i => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1));
  const y = v => pad.t + (100 - v) / 100 * (H - pad.t - pad.b);
  const line = key => history.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(h[key]).toFixed(1)}`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Score and confidence over time">
    <g class="grid">${[0, 50, 100].map(v => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="0" y="${y(v) + 3}">${v}</text>`).join('')}</g>
    <path class="score-line" d="${line('score')}"/><path class="conf-line" d="${line('confidence')}"/>
    ${history.map((h, i) => `<circle class="conf pt" cx="${x(i)}" cy="${y(h.confidence)}" r="4" data-tip="${h.label}: confidence ${h.confidence}%"/>
      <circle class="score pt" cx="${x(i)}" cy="${y(h.score)}" r="5" data-tip="${h.label}: score ${h.score}%"/>
      <text x="${x(i)}" y="${H - 6}" text-anchor="middle">${h.label}</text>`).join('')}
  </svg>`;
}

route('/pc/dashboard', {
  title: 'Performance Dashboard',
  render: () => {
    const s = Store.state, hist = s.history.slice(-6), t = latestTest();
    const first = hist[0].confidence, lastC = hist[hist.length - 1].confidence;
    const change = Math.round((lastC - first) / Math.max(1, first) * 100);
    return `<div class="screen">
      ${topbar({ back: '/pc', home: true })}
      <div class="content">
        <h1 class="page-title">Performance Dashboard</h1>
        <p class="page-sub">Track your progress over time</p>
        <div class="streaks">
          <div class="card orange"><div class="lbl">${icon('flame')} Current Streak</div><b>${s.streak.current}</b><small>days</small></div>
          <div class="card purple"><div class="lbl">${icon('award')} Best Streak</div><b>${s.streak.best}</b><small>days</small></div>
        </div>
        <div class="card mt-12 between" style="padding:22px">
          <div><div style="font-size:16px">This Week's Test</div><div class="xs muted">${t.date}</div></div>${ring(t.score)}
        </div>
        <div class="card mt-12 chart">
          <h3>Performance Trend</h3>
          <hr class="divider" style="margin:8px 0 12px">
          ${trendChart(hist)}
          <div class="legend"><span><i style="background:var(--primary)"></i>Score</span><span><i style="background:var(--warn-strong)"></i>Confidence</span></div>
          <div class="chart-tip" id="tip">Tap a point to see its value</div>
        </div>
        <div class="card info mt-12">
          <h3 class="row" style="gap:8px;color:var(--info)">${icon('trend')} Confidence Trend</h3>
          <p style="color:var(--info)">${change >= 0 ? `Your confidence has improved by ${change}% over the last ${plural(hist.length, 'test')}. Keep up the great work!` : `Your confidence dipped ${Math.abs(change)}% recently. Try a Guided Tutor session to rebuild it.`}</p>
        </div>
        <button class="list-btn mt-12" data-go="/pc/heatmap"><span class="tile-icon ti-soft" style="width:40px;height:40px">${icon('grid')}</span><span class="grow"><strong>Topic Strength Heatmap</strong><small>See your strong and weak topics</small></span><span class="chev">${icon('chevron-right')}</span></button>
        <p class="section-label">Past scores</p>
        <div class="card" style="padding:8px 16px">${s.history.slice().reverse().map(h => `<div class="kv" style="padding:8px 0"><span>${h.date}</span><span><span class="muted xs">conf. ${h.confidence}%</span><b>${h.score}%</b></span></div>`).join('')}</div>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'click', '.pt', (e, el) => { $('#tip', root).textContent = el.dataset.tip; });
  }
});

function topicStrengths() {
  const agg = {};
  Store.state.history.forEach(h => Object.entries(h.topics).forEach(([t, v]) => { agg[t] = agg[t] || []; agg[t].push(v); }));
  DATA.weeklyTopics.forEach(t => { if (!agg[t]) agg[t] = [50]; });
  // weight recent results more by using the last three scores
  return Object.entries(agg).map(([t, v]) => { const r = v.slice(-3); return { topic: t, pct: Math.round(r.reduce((a, b) => a + b, 0) / r.length) }; })
    .sort((a, b) => b.pct - a.pct);
}

route('/pc/heatmap', {
  title: 'Topic Strength Heatmap',
  render: () => {
    const list = topicStrengths();
    const band = p => p >= 80 ? 'strong' : p >= 70 ? 'moderate' : 'weak';
    const weak = list.filter(x => x.pct < 70);
    const strong = list.filter(x => x.pct >= 80);
    return `<div class="screen">
      ${topbar({ back: '/pc/dashboard', home: true })}
      <div class="content">
        <h1 class="page-title">Topic Strength Heatmap</h1>
        <p class="page-sub">Based on your recent weekly tests</p>
        <div class="heat">${list.map(x => `<button class="${band(x.pct)}" data-t="${esc(x.topic)}" data-p="${x.pct}"><small>${esc(x.topic)}</small><b>${x.pct}%</b></button>`).join('')}</div>
        <div class="legend-boxes"><span><i style="background:#16a34a"></i>Strong (80–100%)</span><span><i style="background:#facc15"></i>Moderate (70–79%)</span><span><i style="background:#ef4444"></i>Weak (&lt;70%)</span></div>
        <div class="card soft mt-12 small" id="detail">Tap a topic to see details.</div>
        ${strong.length ? `<p class="section-label">Mastered Topics</p>${strong.map(x => `<div class="stat-row green">${icon('check-circle')}<span class="grow">${esc(x.topic)}</span><b>${x.pct}%</b></div>`).join('')}` : ''}
        <div class="card mt-16" style="background:linear-gradient(135deg,#0d9488,#0891b2);color:#fff;border:0">
          <h3>📚 Study Recommendation</h3>
          <p style="color:rgba(255,255,255,.9)">${weak.length ? `Focus on your weak topics first. We recommend spending ${Math.min(6, weak.length + 2)}–${Math.min(8, weak.length + 3)} hours this week on:` : 'Great work — no weak topics right now. Keep your streak going with a weekly test.'}</p>
          ${weak.length ? `<ul class="bul" style="color:#fff">${weak.map(x => `<li>${esc(x.topic)}</li>`).join('')}</ul>` : ''}
          <button class="btn mt-12" style="background:#fff;color:#0f766e" data-go="/pc/plan/new">Create a study plan</button>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'click', '[data-t]', (e, el) => {
      $$('[data-t]', root).forEach(b => b.classList.toggle('on', b === el));
      const p = +el.dataset.p;
      $('#detail', root).innerHTML = `<b>${esc(el.dataset.t)}</b> — ${p}% average. ${p >= 80 ? 'Mastered. Review occasionally to keep it fresh.' : p >= 70 ? 'Getting there. A short revision sheet should push this over 80%.' : 'Needs work. Add it to your study plan and redo wrong questions.'}`;
    });
  }
});
