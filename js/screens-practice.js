// 5.x AI Practice & Feedback Engine

const PE_TOTAL = 10;
const LEVELS = {
  easy: { label: 'Easy', sub: 'Build your foundation', icon: 'zap', stars: 2, cls: 'ti-soft' },
  medium: { label: 'Medium', sub: 'Recommended for you', icon: 'trend', stars: 4, cls: 'ti-soft' },
  hard: { label: 'Hard', sub: 'Challenge yourself', icon: 'trophy', stars: 5, cls: 'ti-soft' }
};

const pe = () => App.session.pe;
const topicOf = id => DATA.practiceTopics.find(t => t.id === id);
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function daysAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 864e5);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}

function startPractice(topicId, level, mode = 'practice') {
  App.session.pe = { topicId, level, mode, idx: 0, results: [], streak: 0, best: 0, attempts: 0, answer: null, q: null, started: Date.now(), qStart: Date.now() };
  newQuestion();
  Store.set(s => { s.practice.recent[topicId] = Date.now(); });
}
function newQuestion() {
  const P = pe();
  P.q = makePracticeQuestion(P.topicId, P.level, P.idx);
  P.attempts = 0; P.answer = null; P.correction = null; P.qStart = Date.now();
}

function progressHead(back = true) {
  const P = pe();
  const lvl = LEVELS[P.level].label;
  return `<div class="progress-head">
    <div class="meta"><span class="row" style="gap:8px">${back ? `<button id="pe-exit" aria-label="Exit practice">${icon('x')}</button>` : ''}Question ${P.idx + 1} of ${PE_TOTAL}</span><span>${lvl}</span></div>
    <div class="bar"><span style="width:${(P.idx + 1) / PE_TOTAL * 100}%"></span></div>
  </div>`;
}
function wireExit(root) {
  const b = $('#pe-exit', root);
  if (b) b.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'End practice?', text: 'Your answers so far still count towards today’s progress.', yes: 'End Session', no: 'Keep Practising', iconName: 'flag' });
    if (ok) { finishSession(false); App.stack = ['/home']; replace('/pe'); }
  });
}

function recordAttempt(correct) {
  const P = pe();
  const secs = Math.round((Date.now() - P.qStart) / 1000);
  P.qStart = Date.now();
  Store.set(s => {
    s.practice.questions++;
    if (correct) s.practice.correct++;
    s.practice.seconds += Math.min(secs, 300);
  });
}

function finishSession(complete) {
  const P = pe();
  if (!P || P.finished) return;
  P.finished = true;
  if (P.results.length) {
    Store.set(s => {
      s.practice.last = { correct: P.results.filter(Boolean).length, total: P.results.length };
      s.practice.sessions++;
    });
    markStudied();
  }
  if (!complete) App.session.pe = null;
}

/* ---------- 5.0 Landing ---------- */

route('/pe', {
  title: 'Practice & Feedback',
  render: () => {
    const p = Store.state.practice;
    const acc = p.questions ? Math.round(p.correct / p.questions * 100) : 0;
    return `<div class="screen">
      <div class="tealbar"><div class="row"><button class="icon-btn" data-back="/home" aria-label="Back">${icon('arrow-left')}</button><div><h1>Practice & Feedback</h1><p>Choose your learning mode</p></div></div></div>
      <div class="content flush">
        <div style="background:var(--surface);padding:16px 24px;border-bottom:1px solid var(--border)">
          <div class="between small muted">Today's Progress <span class="teal-text">${icon('trend')}</span></div>
          <div class="row mt-8" style="gap:28px">
            <div><div style="font-size:24px">${p.questions}</div><small class="muted">Questions</small></div>
            <div><div style="font-size:24px">${acc}%</div><small class="muted">Accuracy</small></div>
            <div><div style="font-size:24px">${Math.round(p.seconds / 60)}m</div><small class="muted">Time</small></div>
          </div>
        </div>
        <div style="padding:22px 24px">
          <button class="list-btn filled" data-go="/pe/topics"><span class="tile-icon round ti-white">${icon('play')}</span><span class="grow"><strong>Start Practice</strong><small>Test your knowledge</small></span></button>
          <button class="list-btn" data-go="/pe/topics?mode=tutor" style="border:2px solid var(--primary);padding:17px"><span class="tile-icon round ti-soft">${icon('book')}</span><span class="grow"><strong class="teal-text">Guided Tutor</strong><small class="teal-text">Learn with step-by-step help</small></span></button>
          <button class="list-btn" data-go="/pe/topics?mode=mis" style="border-width:2px;padding:17px"><span class="tile-icon round ti-gray">${icon('alert-circle')}</span><span class="grow"><strong>Misconception Detector</strong><small>Fix common mistakes</small></span></button>
        </div>
      </div>
      ${tabbar('home')}
    </div>`;
  }
});

/* ---------- 5.1 Topic selector ---------- */

route('/pe/topics', {
  title: 'Practice Setup',
  render: q => {
    const modeTitle = q.mode === 'tutor' ? 'Guided Tutor' : q.mode === 'mis' ? 'Misconception Detector' : 'Practice Setup';
    return `<div class="screen">
      <div class="tealbar"><div class="row"><button class="icon-btn" data-back="/pe" aria-label="Back">${icon('chevron-left')}</button><h1>${modeTitle}</h1></div></div>
      <div class="content">
        <p class="muted small" style="margin-top:0">Select a topic or goal to practice</p>
        <div class="search">${icon('search')}<input class="input" id="tq" type="search" placeholder="Search topics..." aria-label="Search topics"></div>
        <div id="tlist"></div>
      </div>
    </div>`;
  },
  mount(root, q) {
    const recent = Store.state.practice.recent;
    const draw = () => {
      const term = $('#tq', root).value.trim().toLowerCase();
      const match = t => !term || t.name.toLowerCase().includes(term) || t.about.toLowerCase().includes(term);
      const rec = DATA.practiceTopics.filter(t => recent[t.id] && match(t)).sort((a, b) => recent[b.id] - recent[a.id]).slice(0, 3);
      const rest = DATA.practiceTopics.filter(t => !rec.includes(t) && match(t));
      const card = (t, sub) => `<button class="list-btn" data-topic="${t.id}" style="padding:16px 18px"><span class="grow"><strong>${t.name}</strong><small>${sub}</small></span></button>`;
      $('#tlist', root).innerHTML = (rec.length ? `<p class="section-label">Recent Topics</p>${rec.map(t => card(t, 'Last practiced ' + daysAgo(recent[t.id]))).join('')}` : '')
        + (rest.length ? `<p class="section-label">All Topics</p>${rest.map(t => card(t, `${t.count} questions available`)).join('')}` : '')
        + (!rec.length && !rest.length ? `<div class="empty">${icon('search')}<div>No topics match "${esc(term)}"</div></div>` : '');
    };
    $('#tq', root).addEventListener('input', draw);
    on(root, 'click', '[data-topic]', async (e, el) => {
      $$('[data-topic]', root).forEach(b => b.classList.toggle('selected', b === el));
      await wait(220);
      const id = el.dataset.topic;
      if (q.mode === 'tutor') { startPractice(id, 'medium', 'tutor'); go('/pe/tutor'); }
      else if (q.mode === 'mis') {
        startPractice(id, 'medium', 'mis');
        const P = pe(), wrong = Object.keys(P.q.misconceptions)[0];
        P.answer = wrong;
        go('/pe/misconception');
      } else go('/pe/difficulty?topic=' + id);
    });
    draw();
  }
});

/* ---------- 5.2 Difficulty ---------- */

route('/pe/difficulty', {
  title: 'Select Difficulty', guard: q => !!topicOf(q.topic), fallback: '/pe/topics',
  render: q => {
    const t = topicOf(q.topic);
    App.session.peLevel = App.session.peLevel || 'medium';
    return `<div class="screen">
      <div class="tealbar"><div class="row"><button class="icon-btn" data-back="/pe/topics" aria-label="Back">${icon('chevron-left')}</button><div><h1>Select Difficulty</h1><p>${t.name}</p></div></div></div>
      <div class="content">
        <p class="center-text muted small mt-16 mb-16">Choose your challenge level</p>
        <div id="lv">${Object.entries(LEVELS).map(([k, l]) => `<button class="list-btn ${App.session.peLevel === k ? 'filled' : ''}" data-lv="${k}" aria-pressed="${App.session.peLevel === k}">
          <span class="tile-icon round ${App.session.peLevel === k ? 'ti-white' : k === 'easy' ? 'ti-soft' : k === 'hard' ? 'ti-gray' : 'ti-soft'}" style="${k === 'hard' && App.session.peLevel !== k ? 'color:var(--danger);background:var(--danger-soft)' : k === 'easy' && App.session.peLevel !== k ? 'color:var(--success);background:var(--success-soft)' : ''}">${icon(l.icon)}</span>
          <span class="grow"><strong>${l.label}</strong><small>${l.sub}</small></span><span class="xs" aria-label="${l.stars} of 5 stars" style="letter-spacing:1px">${stars(l.stars)}</span></button>`).join('')}</div>
      </div>
      <div class="footer"><button class="btn btn-primary" id="go">Continue</button></div>
    </div>`;
  },
  mount(root, q) {
    on(root, 'click', '[data-lv]', (e, el) => { App.session.peLevel = el.dataset.lv; render(); });
    $('#go', root).addEventListener('click', () => { startPractice(q.topic, App.session.peLevel); go('/pe/generating'); });
  }
});

/* ---------- 5.3 Generating ---------- */

route('/pe/generating', {
  title: 'Generating Question', guard: () => !!pe(), fallback: '/pe',
  render: () => `<div class="screen">${progressHead()}
    <div class="content center"><div class="loader"><div class="spinner" aria-hidden="true"></div><h2>Generating your question…</h2><p>Personalising to your level</p></div></div></div>`,
  mount(root) { wireExit(root); wait(1100).then(() => { if (root.isConnected) replace('/pe/question'); }); }
});

/* ---------- 5.4 Multiple choice / 5.9 Open ended ---------- */

route('/pe/question', {
  title: 'Practice', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe(), q = P.q, t = topicOf(P.topicId);
    const body = q.type === 'mcq'
      ? `<div class="opt-list mt-16">${q.options.map((o, i) => `<button class="opt ${P.answer === o ? 'picked' : ''}" data-o="${esc(o)}" aria-pressed="${P.answer === o}"><b>${'ABCD'[i]}.</b> ${esc(o)}</button>`).join('')}</div>`
      : `<label class="label mt-24" for="open">Your answer</label><input class="input" id="open" inputmode="decimal" autocomplete="off" placeholder="Type your answer" value="${esc(P.answer || '')}">
         <p class="hint">Type just the number${q.answer.includes('cm') ? ' (units are optional)' : ''}.</p>`;
    return `<div class="screen">${progressHead()}
      <div class="content">
        <div class="topic-tag"><button id="about" aria-label="About this topic" aria-expanded="false">${icon('help')}</button>${t.short}${P.attempts ? ' · <span class="badge b-amber">Attempt ' + (P.attempts + 1) + '</span>' : ''}</div>
        <p style="font-size:17px;margin:12px 0 4px">${esc(q.prompt)}</p>
        <div class="expr">${esc(q.expr)}</div>
        ${body}
      </div>
      <div class="footer" style="border-top:1px solid var(--border)">
        <button class="btn btn-primary" id="submit" ${P.answer ? '' : 'disabled'}>Submit Answer</button>
        <button class="btn-link" data-go="/pe/hints" style="align-self:flex-start">${icon('bulb')} Need a hint?</button>
      </div>
    </div>`;
  },
  mount(root) {
    wireExit(root);
    const P = pe();
    on(root, 'click', '[data-o]', (e, el) => {
      P.answer = el.dataset.o;
      $$('[data-o]', root).forEach(b => { b.classList.toggle('picked', b === el); b.setAttribute('aria-pressed', b === el); });
      $('#submit', root).disabled = false;
    });
    const open = $('#open', root);
    if (open) {
      open.addEventListener('input', () => { P.answer = open.value; $('#submit', root).disabled = !open.value.trim(); });
      open.addEventListener('keydown', e => { if (e.key === 'Enter' && open.value.trim()) $('#submit', root).click(); });
    }
    $('#about', root).addEventListener('click', e => {
      const tag = e.currentTarget.parentNode;
      const tip = $('.tooltip', tag);
      if (tip) { tip.remove(); e.currentTarget.setAttribute('aria-expanded', 'false'); return; }
      tag.insertAdjacentHTML('beforeend', `<div class="tooltip" role="tooltip">${topicOf(P.topicId).about}</div>`);
      e.currentTarget.setAttribute('aria-expanded', 'true');
    });
    $('#submit', root).addEventListener('click', () => go('/pe/checking'));
  }
});

/* ---------- 5.5 Hints ---------- */

route('/pe/hints', {
  title: 'Hints', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe();
    P.hintsSeen = P.hintsSeen || {};
    return `<div class="screen">
      ${topbar({ back: '/pe/question' })}
      <div class="content">
        <h1 class="page-title">Hints</h1>
        <p class="page-sub">Reveal one hint at a time — try the question again after each one.</p>
        <div class="expr mb-16">${esc(P.q.expr)}</div>
        ${P.q.hints.map((h, i) => {
          const seen = P.hintsSeen[P.idx + ':' + i];
          return `<div class="hint-card"><div class="grow"><strong>Hint ${i + 1}</strong><p class="${seen ? '' : 'blur'}" aria-hidden="${!seen}">${seen ? esc(h) : 'Tap the eye to reveal this hint.'}</p></div>
          <button class="icon-btn teal" data-h="${i}" aria-label="${seen ? 'Hint shown' : 'Show hint ' + (i + 1)}" ${seen ? 'disabled' : ''}>${icon(seen ? 'eye' : 'eye-off')}</button></div>`;
        }).join('')}
      </div>
      <div class="footer"><button class="btn btn-primary" data-back="/pe/question">Back to Question</button></div>
    </div>`;
  },
  mount(root) {
    on(root, 'click', '[data-h]', (e, el) => { pe().hintsSeen[pe().idx + ':' + el.dataset.h] = true; render(); });
  }
});

/* ---------- 5.10 Checking ---------- */

function checkAnswer(q, ans) {
  if (q.type === 'open') {
    const n = parseFloat(String(ans).replace(/[^\d.\-]/g, ''));
    return !isNaN(n) && Math.abs(n - q.numeric) < 0.011;
  }
  return ans === q.answer;
}

route('/pe/checking', {
  title: 'Checking Answer', guard: () => !!pe()?.answer, fallback: '/pe',
  render: () => `<div class="screen">${progressHead(false)}
    <div class="content center"><div class="loader"><div class="spinner" aria-hidden="true"></div><h2>Checking your answer…</h2><p>Comparing with the worked solution</p></div></div></div>`,
  mount(root) {
    wait(900).then(() => {
      if (!root.isConnected) return;
      const P = pe(), q = P.correction || P.q;
      const ok = checkAnswer(q, P.answer);
      if (!P.correction) {
        if (P.attempts === 0) {
          P.results[P.idx] = ok;
          recordAttempt(ok);
        }
        P.attempts++;
      } else recordAttempt(ok);
      if (ok) {
        P.streak++; P.best = Math.max(P.best, P.streak);
        replace('/pe/correct');
      } else {
        P.streak = 0;
        replace(q.misconceptions[P.answer] ? '/pe/misconception?detected=1' : '/pe/wrong');
      }
    });
  }
});

/* ---------- 5.6 Wrong answer ---------- */

route('/pe/wrong', {
  title: 'Not Quite', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe(), q = P.correction || P.q;
    return `<div class="screen">${progressHead()}
      <div class="content"><div class="feedback">
        <div class="halo red">${icon('x-circle')}</div>
        <h2 class="red">Not Quite ✗</h2>
        <p>Don't worry, let's work through this together.</p>
        <div class="answer-box red"><small>Your answer:</small>${esc(P.answer)}</div>
        <div class="answer-box gray"><small>Correct answer:</small>${esc(q.answer)}</div>
      </div></div>
      <div class="footer">
        <button class="btn btn-primary" data-go="/pe/steps">See Full Explanation</button>
        <button class="btn btn-outline" id="retry">Try Again</button>
      </div>
    </div>`;
  },
  mount(root) {
    wireExit(root);
    $('#retry', root).addEventListener('click', retryQuestion);
  }
});

// Goes back to whichever question was just answered wrongly
function retryQuestion() {
  const P = pe();
  P.answer = null;
  if (P.correction) replace('/pe/correction');
  else replace('/pe/question');
}

/* ---------- 5.7 Step-by-step guide ---------- */

route('/pe/steps', {
  title: 'Step-by-Step Guide', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe(), q = P.correction || P.q;
    return `<div class="screen">
      ${topbar({ back: '/pe/wrong' })}
      <div class="content">
        <h1 class="page-title">Step-by-Step Guide</h1>
        <p class="page-sub">${esc(q.prompt)} <b>${esc(q.expr)}</b></p>
        <div id="steps"></div>
        <button class="btn btn-outline mt-16" id="next-step">Continue to Next Step</button>
        <div id="after" class="hidden mt-16"><div class="notice green">${icon('check-circle')} That's the full solution!</div></div>
      </div>
      <div class="footer">
        <button class="btn btn-primary" id="back-q">Back to Question</button>
        <button class="btn btn-ghost hidden" id="moveon" data-go="/pe/post">Continue</button>
      </div>
    </div>`;
  },
  mount(root) {
    const P = pe(), q = P.correction || P.q;
    let shown = 0;
    const show = () => {
      shown++;
      $('#steps', root).innerHTML = q.steps.slice(0, shown).map((s, i) => `<div class="step"><span class="n">${i + 1}</span><p>${esc(s)}</p></div>`).join('');
      if (shown >= q.steps.length) {
        $('#next-step', root).remove();
        $('#after', root).classList.remove('hidden');
        $('#moveon', root).classList.remove('hidden');
      }
    };
    show();
    $('#next-step', root).addEventListener('click', show);
    $('#back-q', root).addEventListener('click', retryQuestion);
  }
});

/* ---------- 5.8 Post-question ---------- */

route('/pe/post', {
  title: 'Next Steps', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe();
    return `<div class="screen">${progressHead()}
      <div class="content">
        <div class="card soft center-text mt-8"><div class="muted small">Progress</div><div style="font-size:24px;font-weight:600">${P.idx + 1} of ${PE_TOTAL}</div><div class="muted xs">questions completed</div></div>
        <h2 class="mt-24" style="font-size:18px">What would you like to do next?</h2>
        <button class="list-btn mt-12" id="again"><span class="tile-icon ti-soft">${icon('redo')}</span><span class="grow"><strong>Try Question Again</strong><small>Have another go at the same problem</small></span></button>
        <button class="list-btn" id="next"><span class="tile-icon ti-teal">${icon('arrow-right')}</span><span class="grow"><strong>Move to Next Question</strong><small>Keep the practice going</small></span></button>
        <button class="list-btn" data-go="/pe/tutor"><span class="tile-icon ti-soft">${icon('book')}</span><span class="grow"><strong>Review Topic</strong><small>Open the guided walkthrough tutor</small></span></button>
      </div>
    </div>`;
  },
  mount(root) {
    wireExit(root);
    $('#again', root).addEventListener('click', () => { const P = pe(); P.answer = null; P.correction = null; replace('/pe/question'); });
    $('#next', root).addEventListener('click', nextQuestion);
  }
});

function nextQuestion() {
  const P = pe();
  P.correction = null;
  // Tutor and detector shortcuts turn into a normal session from here
  if (P.mode !== 'practice') {
    P.mode = 'practice'; P.results = []; P.idx = 0;
    newQuestion();
    replace('/pe/generating');
    return;
  }
  if (P.results[P.idx] === undefined) P.results[P.idx] = false;
  if (P.idx + 1 >= PE_TOTAL) { finishSession(true); replace('/pe/summary'); return; }
  P.idx++;
  newQuestion();
  replace('/pe/generating');
}

/* ---------- 5.11 Correct ---------- */

route('/pe/correct', {
  title: 'Correct', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe();
    const msg = P.correction ? 'You fixed the mistake — nicely done.' : P.attempts > 1 ? 'You got there! Practice makes perfect.' : "Great job! You've mastered this concept.";
    return `<div class="screen">${progressHead()}
      <div class="content"><div class="feedback">
        <div class="halo green">${icon('check-circle')}</div>
        <h2 class="green">Correct! ✓</h2>
        <p>${msg}</p>
        <div class="answer-box green"><small>Your answer:</small>${esc(P.answer)}</div>
        <div class="streak-line">${icon('trend')} Streak: ${plural(P.streak, 'correct answer')} in a row!</div>
      </div></div>
      <div class="footer">
        <button class="btn btn-primary" id="next">${P.idx + 1 >= PE_TOTAL ? 'See Results' : 'Next Question'} ${icon('arrow-right')}</button>
        <button class="btn btn-ghost" data-go="/pe/tutor">See Explanation</button>
      </div>
    </div>`;
  },
  mount(root) { wireExit(root); $('#next', root).addEventListener('click', nextQuestion); }
});

/* ---------- 5.12 Guided walkthrough tutor ---------- */

route('/pe/tutor', {
  title: 'Guided Tutor', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe(), q = P.q, t = topicOf(P.topicId);
    return `<div class="screen">
      ${topbar({ back: P.mode === 'tutor' ? '/pe/topics?mode=tutor' : '/pe/correct' })}
      <div class="content">
        <h1 class="page-title">Guided Walkthrough</h1>
        <p class="page-sub">${t.name}</p>
        <div class="card info"><h3 class="row" style="gap:8px;color:var(--info)">${icon('bulb')} Key idea</h3><p style="color:var(--text-2)">${esc(q.tutor)}</p></div>
        <p class="section-label">Worked example</p>
        <p class="small" style="margin:0 0 8px">${esc(q.prompt)}</p>
        <div class="expr mb-12">${esc(q.expr)}</div>
        ${q.steps.map((s, i) => `<div class="step"><span class="n">${i + 1}</span><p>${esc(s)}</p></div>`).join('')}
        <div class="card soft mt-16"><h3>Try it yourself</h3><p>Answer: <b>${esc(q.answer)}</b>. Cover the steps above and see if you can reach it on your own.</p></div>
      </div>
      <div class="footer">
        <button class="btn btn-primary" data-go="/pe/misconception">Got It</button>
        ${P.mode === 'tutor' ? '<button class="btn btn-outline" id="practise">Practise this topic</button>' : ''}
      </div>
    </div>`;
  },
  mount(root) {
    const p = $('#practise', root);
    if (p) p.addEventListener('click', () => { App.stack = ['/home', '/pe']; replace('/pe/difficulty?topic=' + pe().topicId); });
  }
});

/* ---------- 5.13 Misconception detector ---------- */

route('/pe/misconception', {
  title: 'Common Mistake', guard: () => !!pe()?.q, fallback: '/pe',
  render: q => {
    const P = pe(), Q = P.correction || P.q;
    const detected = q.detected === '1';
    const text = (detected && Q.misconceptions[P.answer]) || Object.values(Q.misconceptions)[0];
    const showProgress = P.mode === 'practice';
    return `<div class="screen gray">${showProgress ? progressHead(false) : ''}
      <div class="content">
        <div class="modal-card mt-8">
          <button class="icon-btn close" id="close" aria-label="Close">${icon('x')}</button>
          <div class="feedback">
            <div class="halo amber" style="width:90px;height:90px">${icon('alert')}</div>
            <h2 class="amber" style="font-size:21px">${detected ? 'Common Mistake Detected!' : 'Watch Out For This'}</h2>
            <p>${detected ? 'We noticed you might be making a common error that many students make.' : `Here's a mistake many students make with ${topicOf(P.topicId).short.toLowerCase()}.`}</p>
          </div>
          ${!detected && P.mode === 'mis' ? `<div class="answer-box gray mb-12"><small>Example: ${esc(Q.expr)}</small>A typical wrong answer is <b class="red-text">${esc(P.answer)}</b></div>` : ''}
          ${detected ? `<div class="answer-box red mb-12" style="font-size:15px"><small>Your answer</small>${esc(P.answer)}</div>` : ''}
          <div class="misconception"><strong>Common Misconception:</strong>${esc(text)}</div>
          <button class="btn btn-primary mt-16" data-go="/pe/correction">Learn the Right Way</button>
          <button class="btn btn-ghost mt-12" id="retry">Try Again</button>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    $('#close', root).addEventListener('click', () => {
      const P = pe();
      if (P.mode !== 'practice') { App.session.pe = null; App.stack = ['/home']; replace('/pe'); return; }
      confirmDialog({ title: 'Exit practice?', text: 'You’ll return to the Practice & Feedback home.', yes: 'Exit', no: 'Stay', iconName: 'x' })
        .then(ok => { if (ok) { finishSession(false); App.stack = ['/home']; replace('/pe'); } });
    });
    $('#retry', root).addEventListener('click', () => {
      const P = pe();
      if (P.mode !== 'practice') { P.mode = 'practice'; P.correction = null; }
      retryQuestion();
    });
  }
});

/* ---------- 5.14 Correction & practice ---------- */

route('/pe/correction', {
  title: 'Correction & Practice', guard: () => !!pe()?.q, fallback: '/pe',
  render: () => {
    const P = pe(), q = P.q;
    if (!P.correction || P.correctionFor !== P.q) {
      P.correction = makePracticeQuestion(P.topicId, P.level, 0);
      P.correctionFor = P.q;
      P.answer = null;
    }
    const c = P.correction;
    return `<div class="screen">
      ${topbar({ back: '/pe/misconception' })}
      <div class="content">
        <h1 class="page-title">Correction & Practice</h1>
        <p class="page-sub">Learn the right way, then try a similar question</p>
        <div class="card danger"><h3 class="row red-text" style="gap:8px">${icon('x-circle')} The mistake</h3><p style="color:var(--text-2)">${esc(Object.values(q.misconceptions)[0])}</p></div>
        <div class="card success"><h3 class="row green-text" style="gap:8px">${icon('check-circle')} The right way</h3>
          ${q.steps.map((s, i) => `<div class="small" style="margin-top:6px"><b>${i + 1}.</b> ${esc(s)}</div>`).join('')}</div>
        <p class="section-label">Your turn</p>
        <p style="margin:0 0 4px">${esc(c.prompt)}</p>
        <div class="expr">${esc(c.expr)}</div>
        <div class="opt-list mt-12">${c.options.map((o, i) => `<button class="opt" data-o="${esc(o)}"><b>${'ABCD'[i]}.</b> ${esc(o)}</button>`).join('')}</div>
      </div>
      <div class="footer"><button class="btn btn-primary" id="check" disabled>Check Answer</button></div>
    </div>`;
  },
  mount(root) {
    const P = pe();
    on(root, 'click', '[data-o]', (e, el) => {
      P.answer = el.dataset.o;
      $$('[data-o]', root).forEach(b => b.classList.toggle('picked', b === el));
      $('#check', root).disabled = false;
    });
    $('#check', root).addEventListener('click', () => go('/pe/checking'));
  }
});

/* ---------- Session summary ---------- */

route('/pe/summary', {
  title: 'Session Complete', guard: () => pe()?.finished, fallback: '/pe',
  render: () => {
    const P = pe(), correct = P.results.filter(Boolean).length, n = P.results.length;
    const pct = Math.round(correct / n * 100), mins = Math.max(1, Math.round((Date.now() - P.started) / 60000));
    return `<div class="screen">
      <div class="content">
        <div class="feedback mt-8">
          <div class="halo teal">${icon('trophy')}</div>
          <h2>Session Complete!</h2>
          <p>${topicOf(P.topicId).name} · ${LEVELS[P.level].label}</p>
        </div>
        <div class="stats-grid">
          <div class="card"><b>${correct}/${n}</b><small>First-try correct</small></div>
          <div class="card"><b>${pct}%</b><small>Accuracy</small></div>
          <div class="card"><b>${P.best}</b><small>Best streak</small></div>
          <div class="card"><b>${mins}m</b><small>Time spent</small></div>
        </div>
        <p class="section-label">Question by question</p>
        <div class="row" style="flex-wrap:wrap;gap:8px">${P.results.map((r, i) => `<span class="badge ${r ? 'b-green' : 'b-red'}" style="padding:6px 10px">Q${i + 1} ${r ? '✓' : '✗'}</span>`).join('')}</div>
        <div class="card ${pct >= 70 ? 'success' : 'warn'} mt-16"><p style="color:var(--text-2)">${pct >= 80 ? 'Excellent! Try the next difficulty level to keep challenging yourself.' : pct >= 50 ? 'Solid effort. Use Guided Tutor on the questions you missed.' : 'This topic needs more work. Start with Easy and use the hints.'}</p></div>
      </div>
      <div class="footer">
        <button class="btn btn-primary" id="again">Practice Again</button>
        <button class="btn btn-ghost" id="home">Back to Practice Home</button>
      </div>
    </div>`;
  },
  mount(root) {
    $('#again', root).addEventListener('click', () => { const P = pe(); App.stack = ['/home', '/pe']; replace('/pe/difficulty?topic=' + P.topicId); });
    $('#home', root).addEventListener('click', () => { App.session.pe = null; App.stack = ['/home']; replace('/pe'); });
  }
});
