// 3.x AI Lesson Companion and 4.x AI Understanding Booster

/* ================= Lesson Companion ================= */

const LESSON_EXTS = ['pdf', 'doc', 'docx', 'txt'];
const SLIDE_EXTS = ['pdf', 'pptx', 'ppt'];

function lesson() {
  const id = App.session.lessonId || 'ionic';
  return DATA.lessons.find(l => l.id === id) || DATA.lessons[0];
}
function lessonFromFiles(files) {
  const n = files.map(f => f.name.toLowerCase()).join(' ');
  if (n.includes('covalent')) return 'covalent';
  if (n.includes('reaction') || n.includes('equation')) return 'reactions';
  if (n.includes('atom')) return 'atomic';
  if (n.includes('ionic') || n.includes('salt')) return 'ionic';
  return null;
}

function lcBar(title) {
  return `<div class="appbar"><button class="icon-btn" id="menu" aria-label="Open menu">${icon('menu')}</button><h1>${title}</h1></div>`;
}
function wireMenu(root) {
  $('#menu', root).addEventListener('click', () => {
    overlay(`<nav class="drawer" aria-label="Lesson menu">
      <button class="icon-btn close" data-close aria-label="Close menu">${icon('x')}</button>
      <button class="nav-item" data-close data-back="/lc">${icon('arrow-left')} Back</button>
      <button class="nav-item" data-close data-go="/home">${icon('home')} Home</button>
      <hr><div class="sec">Previous Work</div>
      ${DATA.lessons.map(l => `<button class="work" data-lesson="${l.id}" data-close><strong>${l.title}</strong><small>${l.date}</small></button>`).join('')}
    </nav>`, {
      kind: 'left',
      onMount(o) {
        on(o, 'click', '[data-lesson]', (e, el) => { App.session.lessonId = el.dataset.lesson; App.session.lcDone = {}; render(); toast(`Opened ${lesson().title}`); });
        on(o, 'click', '[data-go]', (e, el) => go(el.dataset.go));
        on(o, 'click', '[data-back]', (e, el) => back(el.dataset.back));
      }
    });
  });
}

// Upload box used on every lesson tool; resolves the lesson from the file name when it can
function lessonUpload(root, exts, label = 'PDF, DOC, or TXT files') {
  const zone = $('#lz', root);
  wireDropzone(zone, {
    accept: exts.map(e => '.' + e).join(','), exts,
    onFiles: files => {
      const id = lessonFromFiles(files);
      if (id) App.session.lessonId = id;
      App.session.lcFiles = toRecords(files);
      App.session.lcDone = {};
      render();
      toast(id ? `Detected topic: ${lesson().title}` : `${plural(files.length, 'file')} added to ${lesson().title}`);
    },
    onReject: () => toast(`Please upload ${label}`)
  });
}
function uploadBox(text, label) {
  const files = App.session.lcFiles || [];
  return `<div class="dropzone" id="lz" role="button" tabindex="0" aria-label="Upload materials">
    ${icon('upload')}<strong>${text}</strong><small>${label}</small>
    <span class="btn btn-ghost btn-sm" style="margin-top:12px">Browse Files</span>
  </div>${files.length ? `<div class="mt-8">${files.map(f => fileRow(f)).join('')}</div>` : ''}`;
}

route('/lc', {
  title: 'AI Lesson Companion',
  render: () => `<div class="screen gray">
    <div class="appbar"><button class="icon-btn" data-back="/home" aria-label="Back">${icon('arrow-left')}</button><h1>AI Lesson Companion</h1></div>
    <div class="content">
      <div class="card soft mb-16 between" style="background:var(--bg)"><div><small class="muted">Current lesson</small><div style="font-weight:600">${lesson().title}</div></div><button class="btn btn-sm btn-ghost" id="switch">Change</button></div>
      ${[['/lc/preview', 'ti-teal', 'file', 'Lesson Preview', 'Preview upcoming lessons with AI summaries'],
         ['/lc/keypoints', 'ti-amber', 'highlighter', 'Key Points Highlighter', 'Extract key points from any lesson'],
         ['/lc/slides', 'ti-purple', 'slides', 'Simplified Slide Mode', 'Break down complex slides'],
         ['/lc/video', 'ti-red', 'video', 'Video Generator', 'Generate video explanations']]
        .map(([p, c, ic, t, d]) => `<button class="module" data-go="${p}"><span class="tile-icon ${c}">${icon(ic)}</span><span class="grow"><strong>${t}</strong><small>${d}</small></span></button>`).join('')}
    </div>
    ${tabbar('home')}
  </div>`,
  mount(root) {
    $('#switch', root).addEventListener('click', () => {
      overlay(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Choose lesson">
        <header><h2>Choose a lesson</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        ${DATA.lessons.map(l => `<button class="list-btn ${l.id === lesson().id ? 'selected' : ''}" data-l="${l.id}"><span class="grow"><strong>${l.title}</strong><small>${l.date}</small></span></button>`).join('')}
      </div>`, { kind: 'bottom', onMount(o, close) { on(o, 'click', '[data-l]', (e, el) => { App.session.lessonId = el.dataset.l; App.session.lcDone = {}; close(); render(); }); } });
    });
  }
});

route('/lc/preview', {
  title: 'Lesson Preview',
  render: () => {
    const l = lesson(), done = App.session.lcDone?.preview;
    return `<div class="screen gray">
      ${lcBar('Lesson Preview')}
      <div class="content">
        <div class="card">
          <h3 style="font-size:15px">Preview Today's Topic</h3>
          <h2 style="font-size:20px;margin:14px 0 6px">${l.title}</h2>
          <p style="font-size:15px;color:var(--text-2);line-height:1.6">${l.summary}</p>
          <h3 style="font-size:17px;margin:16px 0 6px">Learning Objectives</h3>
          <ul class="bul">${l.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
          <div class="mt-16">${uploadBox('Upload Materials', 'PDF, DOC, or TXT files')}</div>
          ${done ? '' : '<button class="btn btn-primary mt-16" id="start">Start Preview</button>'}
        </div>
        ${done ? `<div class="card mt-12" id="pv">
          <div class="between"><h3>AI Preview</h3><span class="badge b-teal">~3 min read</span></div>
          <p class="small mb-12">Here's what to focus on before class:</p>
          ${l.keyPoints.slice(0, 3).map((k, i) => `<div class="step"><span class="n">${i + 1}</span><p>${k}</p></div>`).join('')}
          <p class="section-label">Quick check</p>
          <p class="small" style="margin:0 0 8px;color:var(--text)">Which statement best describes ${l.title.toLowerCase()}?</p>
          <div class="opt-list" id="qc">${shuffle([l.keyPoints[0], 'Atoms are destroyed in the process', 'It only happens in liquids']).map((o, i) => `<button class="opt" data-qc="${esc(o)}"><b>${'ABC'[i]}.</b> ${esc(o)}</button>`).join('')}</div>
          <div id="qc-res" class="mt-8"></div>
        </div>` : ''}
      </div>
    </div>`;
  },
  mount(root) {
    wireMenu(root);
    lessonUpload(root, LESSON_EXTS);
    const s = $('#start', root);
    if (s) s.addEventListener('click', async () => {
      s.disabled = true; s.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:3px;margin:0"></span> Generating preview…';
      await wait(1200);
      App.session.lcDone = { ...(App.session.lcDone || {}), preview: true };
      render();
      $('#pv', $('#app'))?.scrollIntoView({ behavior: 'smooth' });
    });
    on(root, 'click', '[data-qc]', (e, el) => {
      const right = el.dataset.qc === lesson().keyPoints[0];
      $$('[data-qc]', root).forEach(b => {
        b.disabled = true;
        if (b.dataset.qc === lesson().keyPoints[0]) b.classList.add('right');
        else if (b === el) b.classList.add('wrong');
      });
      $('#qc-res', root).innerHTML = `<div class="stat-row ${right ? 'green' : 'red'}">${icon(right ? 'check-circle' : 'x-circle')} ${right ? 'Correct — you’re ready for class!' : 'Not quite. Review the key points above.'}</div>`;
    });
  }
});

route('/lc/keypoints', {
  title: 'Key Points Highlighter',
  render: () => {
    const l = lesson(), done = App.session.lcDone?.points;
    return `<div class="screen gray">
      ${lcBar('Key Points Highlighter')}
      <div class="content">
        <div class="card">
          ${uploadBox('Upload Material and let AI extract important ideas', 'PDF, DOC, or TXT files')}
          <div class="between mt-24 mb-12"><h3 style="margin:0;font-size:17px">Highlighted Points</h3>${done ? '<button class="btn-link small" id="regen">' + icon('redo') + ' Regenerate</button>' : ''}</div>
          <div id="pts">${done ? done.map((p, i) => `<div class="kp" style="animation-delay:${i * 0.12}s"><span class="n">${i + 1}</span>${esc(p)}</div>`).join('')
            : `<div class="empty" style="padding:16px">${icon('highlighter')}<div>Tap Start Highlight to extract the key ideas from ${esc(l.title)}.</div></div>`}</div>
          ${done ? `<button class="btn btn-ghost mt-16" id="copy">${icon('file')} Copy Points</button>` : `<button class="btn btn-primary mt-16" id="start">Start Highlight</button>`}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    wireMenu(root);
    lessonUpload(root, LESSON_EXTS);
    const gen = async btn => {
      if (btn) { btn.disabled = true; btn.textContent = 'Highlighting…'; }
      await wait(1000);
      const pts = lesson().keyPoints;
      App.session.lcDone = { ...(App.session.lcDone || {}), points: btn?.id === 'regen' ? shuffle(pts).slice(0, 3) : pts.slice(0, 3) };
      render();
    };
    $('#start', root)?.addEventListener('click', e => gen(e.currentTarget));
    $('#regen', root)?.addEventListener('click', e => gen(e.currentTarget));
    $('#copy', root)?.addEventListener('click', async () => {
      const text = App.session.lcDone.points.map((p, i) => `${i + 1}. ${p}`).join('\n');
      try { await navigator.clipboard.writeText(text); toast('Key points copied'); } catch (e) { toast('Copy not available in this browser'); }
    });
  }
});

function downloadText(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

route('/lc/slides', {
  title: 'Simplified Slide Mode',
  render: () => {
    const l = lesson(), sel = App.session.slideIdx || 0, done = App.session.lcDone?.slides;
    const sl = l.slides[Math.min(sel, l.slides.length - 1)];
    return `<div class="screen gray">
      ${lcBar('Simplified Slide Mode')}
      <div class="content">
        <div class="card">
          <h3 style="font-size:15px">Drag & Drop here to upload</h3>
          <div class="mt-12">${uploadBox('Upload slides to simplify', 'PDF or PPTX files')}</div>
          <p class="small muted mt-16 mb-8">Slide list:</p>
          <div class="slide-list">${l.slides.map((s, i) => `<button class="${i === sel ? 'on' : ''}" data-s="${i}">${s.title}</button>`).join('')}</div>
          <button class="btn btn-primary mt-16" id="gen">${done ? 'Regenerate Slides' : 'Generate Slides'}</button>
        </div>
        <div class="card mt-12">
          <div class="between mb-12"><h3 style="margin:0;font-size:15px">Slide Viewer</h3><button class="btn-link small" id="big" style="color:var(--text)" ${done ? '' : 'disabled'}>${icon('maximize')} Enlarge</button></div>
          ${done ? `<div class="slide-viewer"><h3>${sl.title}</h3><p>${esc(sl.simple)}</p><ul>${sl.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
            <div class="between mt-12"><button class="btn btn-ghost btn-sm" id="prev" ${sel === 0 ? 'disabled' : ''}>${icon('chevron-left')} Prev</button><span class="small muted">${sel + 1} / ${l.slides.length}</span><button class="btn btn-ghost btn-sm" id="next" ${sel === l.slides.length - 1 ? 'disabled' : ''}>Next ${icon('chevron-right')}</button></div>
            <button class="btn btn-outline mt-12" id="dl">${icon('download')} Download Slides</button>`
          : `<div class="slide-viewer"><p>Generate slides to see the simplified version here.</p></div>`}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    wireMenu(root);
    lessonUpload(root, SLIDE_EXTS, 'PDF or PPTX files');
    const l = lesson();
    on(root, 'click', '[data-s]', (e, el) => { App.session.slideIdx = +el.dataset.s; render(); });
    $('#gen', root).addEventListener('click', async e => {
      e.currentTarget.disabled = true; e.currentTarget.textContent = 'Simplifying slides…';
      await wait(1100);
      App.session.lcDone = { ...(App.session.lcDone || {}), slides: true };
      render();
      toast(`${plural(l.slides.length, 'slide')} simplified`);
    });
    const step = d => { App.session.slideIdx = Math.max(0, Math.min(l.slides.length - 1, (App.session.slideIdx || 0) + d)); render(); };
    $('#prev', root)?.addEventListener('click', () => step(-1));
    $('#next', root)?.addEventListener('click', () => step(1));
    $('#dl', root)?.addEventListener('click', () => {
      downloadText(`${l.title.replace(/\s+/g, '_')}_simplified_slides.txt`, `${l.title} — simplified slides\n\n` + l.slides.map(s => `${s.title}: ${s.simple}\n${s.bullets.map(b => '  • ' + b).join('\n')}`).join('\n\n'));
      toast('Slides downloaded');
    });
    $('#big', root).addEventListener('click', () => {
      if (!App.session.lcDone?.slides) return;
      let i = App.session.slideIdx || 0;
      const draw = o => {
        const s = l.slides[i];
        $('.slide-viewer', o).innerHTML = `<h3 style="font-size:24px">${s.title}</h3><p style="font-size:18px">${esc(s.simple)}</p><ul style="font-size:16px">${s.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
        $('#cnt', o).textContent = `${i + 1} / ${l.slides.length}`;
      };
      overlay(`<div class="dialog" style="max-width:none;height:100%;display:flex;flex-direction:column" role="dialog" aria-modal="true" aria-label="Enlarged slide">
        <button class="icon-btn close" data-close aria-label="Close">${icon('x')}</button>
        <div class="slide-viewer big" style="flex:1;margin-top:30px"></div>
        <div class="between mt-12"><button class="btn btn-ghost btn-sm" id="bp">${icon('chevron-left')}</button><span id="cnt" class="small muted"></span><button class="btn btn-ghost btn-sm" id="bn">${icon('chevron-right')}</button></div>
      </div>`, {
        onMount(o) {
          draw(o);
          $('#bp', o).addEventListener('click', () => { i = Math.max(0, i - 1); draw(o); });
          $('#bn', o).addEventListener('click', () => { i = Math.min(l.slides.length - 1, i + 1); draw(o); });
        }
      });
    });
  }
});

route('/lc/video', {
  title: 'Video Generator',
  render: () => {
    const f = App.session.videoOpts || (App.session.videoOpts = { voice: true, anim: true, captions: true });
    const done = App.session.lcDone?.video;
    return `<div class="screen gray">
      ${lcBar('Video Generator')}
      <div class="content">
        <div class="card">
          <div class="between mb-12"><h3 style="margin:0;font-size:15px">Video Preview</h3><button class="btn-link small" id="big" style="color:var(--text)" ${done ? '' : 'disabled'}>${icon('maximize')} Enlarge</button></div>
          <div class="video" id="vid">${done ? `<div class="scene" id="scene"><div class="emoji">🎬</div><b>${lesson().title}</b><small style="opacity:.7">Tap play to watch</small></div>
            <div class="caption hidden" id="cap"></div><button class="ctrl" id="pp" aria-label="Play">${icon('play')}</button><div class="vbar"><span id="vbar" style="width:0"></span></div>`
            : `<div class="play">${icon('play')}</div>`}</div>
          <button class="btn btn-ghost mt-12" id="dl" ${done ? '' : 'disabled'}>${icon('download')} Download Video</button>
        </div>
        <div class="card mt-12"><h3 style="font-size:15px">Upload Materials</h3><div class="mt-12">${uploadBox('Drag & Drop here to upload', 'PDF, DOC, or TXT files')}</div></div>
        <div class="card mt-12">
          <h3 style="font-size:15px">Video Features</h3>
          ${[['voice', 'AI Voice'], ['anim', 'Animations'], ['captions', 'Captions']].map(([k, l]) => `<label class="check mt-12" style="font-weight:600"><input type="checkbox" data-opt="${k}" ${f[k] ? 'checked' : ''}> ${l}</label>`).join('')}
          <button class="btn btn-primary mt-16" id="gen">${done ? 'Regenerate Video' : 'Generate Video'}</button>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    wireMenu(root);
    lessonUpload(root, LESSON_EXTS);
    const f = App.session.videoOpts, l = lesson();
    on(root, 'change', '[data-opt]', (e, el) => { f[el.dataset.opt] = el.checked; });
    $('#gen', root).addEventListener('click', async e => {
      const b = e.currentTarget;
      b.disabled = true;
      for (const p of [20, 45, 70, 95]) { b.textContent = `Generating video… ${p}%`; await wait(400); if (!root.isConnected) return; }
      App.session.lcDone = { ...(App.session.lcDone || {}), video: true };
      render();
      toast('Video ready');
    });
    $('#dl', root).addEventListener('click', () => toast('Video saved to your Previous Work'));
    const pp = $('#pp', root);
    if (!pp) return;
    let playing = false, i = 0, t = null;
    const synth = window.speechSynthesis;
    const stop = () => { playing = false; clearTimeout(t); if (synth) synth.cancel(); pp.innerHTML = icon('play'); pp.setAttribute('aria-label', 'Play'); };
    App.cleanups.push(stop);
    const show = () => {
      const sc = l.scenes[i];
      $('#scene', root).innerHTML = `<div class="emoji" ${f.anim ? '' : 'style="animation:none"'}>${sc.emoji}</div><b>${esc(sc.text)}</b>`;
      $('#cap', root).classList.toggle('hidden', !f.captions);
      $('#cap', root).textContent = sc.caption;
      $('#vbar', root).style.width = ((i + 1) / l.scenes.length * 100) + '%';
      if (f.voice && synth) { synth.cancel(); synth.speak(new SpeechSynthesisUtterance(sc.caption)); }
      t = setTimeout(() => {
        if (!playing) return;
        if (++i < l.scenes.length) show();
        else { stop(); i = 0; $('#scene', root).innerHTML = `<div class="emoji">✅</div><b>End of video</b><small style="opacity:.7">Tap play to watch again</small>`; }
      }, 3200);
    };
    pp.addEventListener('click', () => {
      if (playing) return stop();
      playing = true; pp.innerHTML = icon('pause'); pp.setAttribute('aria-label', 'Pause');
      show();
    });
    $('#big', root).addEventListener('click', () => {
      const v = $('#vid', root);
      if (v.requestFullscreen) v.requestFullscreen().catch(() => toast('Fullscreen is not available here'));
    });
  }
});

/* ================= Understanding Booster ================= */

const ubTopic = () => DATA.booster.topics.find(t => t.id === App.session.ubTopic) || DATA.booster.topics[0];

const UB_DIAGRAMS = {
  photosynthesis: { inputs: [['H₂O', 'Water'], ['CO₂', 'Carbon Dioxide']], main: ['☀️', 'Light Energy', '+ Chlorophyll'], outputs: [['🍬', 'Glucose', 'C₆H₁₂O₆', '#fdf2f8', '#fbcfe8'], ['🫧', 'Oxygen', 'O₂', '#f0fdf4', '#bbf7d0']] },
  'water-cycle': { inputs: [['🌊', 'Oceans'], ['🌿', 'Plants']], main: ['☀️', 'Evaporation', '+ Heat from the sun'], outputs: [['☁️', 'Clouds', 'Condensation', '#f8fafc', '#e2e8f0'], ['🌧️', 'Rain', 'Precipitation', '#eff6ff', '#bfdbfe']] }
};

function ubShell(active, title, code, body, { back: fb = '/ub', footer = '' } = {}) {
  const tab = (id, ic, l, p) => `<button class="${active === id ? 'on' : ''}" data-go="${p}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${l}</span></button>`;
  return `<div class="screen">
    <div class="appbar"><button class="icon-btn" data-back="${fb}" aria-label="Back">${icon('arrow-left')}</button><h1 style="font-size:17px">${title}</h1><span class="code">${code}</span></div>
    <div class="content">${body}</div>
    ${footer}
    <nav class="tabbar ub-tabs" aria-label="Booster">${tab('home', 'home', 'Home', '/ub')}${tab('learn', 'book', 'Learn', '/ub/explainer')}${tab('diagrams', 'network', 'Diagrams', '/ub/diagrams')}${tab('examples', 'file', 'Examples', '/ub/examples')}</nav>
  </div>`;
}
function topicChips() {
  return `<div class="chips mb-16" id="ubt">${DATA.booster.topics.map(t => `<button class="chip ${t.id === ubTopic().id ? 'on' : ''}" data-ubt="${t.id}" style="${t.id === ubTopic().id ? 'background:#059669;border-color:#059669' : ''}">${t.name}</button>`).join('')}
    <button class="chip" id="ub-up">${icon('upload')} Upload notes</button></div>`;
}
function wireTopicChips(root) {
  on(root, 'click', '[data-ubt]', (e, el) => { App.session.ubTopic = el.dataset.ubt; render(); });
  $('#ub-up', root)?.addEventListener('click', async () => {
    const fs = (await pickFiles({ accept: '.pdf,.doc,.docx,.txt,image/*' }));
    if (!fs.length) return;
    const n = fs.map(f => f.name.toLowerCase()).join(' ');
    App.session.ubTopic = /water|rain|cycle|evapor/.test(n) ? 'water-cycle' : 'photosynthesis';
    render();
    toast(`Notes uploaded · topic: ${ubTopic().name}`);
  });
}

route('/ub', {
  title: 'AI Understanding Booster',
  render: () => {
    const sel = App.session.ubSel;
    const feats = [
      ['explainer', 'Step-by-Step Explainer', 'Break down complex concepts', 'Learn complex topics step by step with clear explanations and visual aids.', '/ub/explainer'],
      ['map', 'Concept Link Map', 'See visual connections', 'Explore how ideas link together. Tap any concept to see how it relates to the topic.', '/ub/map'],
      ['diagrams', 'Visual Diagrams', 'Generated diagrams', 'Turn a topic into a clear labelled diagram you can zoom into.', '/ub/diagrams'],
      ['examples', 'Example Library', 'Real-world examples', 'Browse real-world and lab examples, filtered by level and type.', '/ub/examples']
    ];
    const f = feats.find(x => x[0] === sel);
    return ubShell('home', sel ? 'Feature Selected' : 'AI Understanding Booster', sel ? '0.2' : '0.1', `
      <p class="muted" style="margin-top:0">Understand concepts better with guided steps, visual links, diagrams, and examples.</p>
      ${topicChips()}
      ${feats.map(([id, t, d]) => `<button class="list-btn ${sel === id ? 'filled green-btn' : ''}" data-f="${id}" style="${sel === id ? 'border-color:#059669' : ''}"><span class="grow"><strong>${t}</strong><small>${d}</small></span><span class="chev">${icon('chevron-right')}</span></button>`).join('')}
      ${f ? `<div class="card soft mt-16"><p class="small" style="color:var(--text-2)">${f[3]}</p><button class="btn btn-primary green-btn mt-12" data-go="${f[4]}">Start Learning</button></div>`
        : `<p class="center-text xs muted mt-12">Tap a feature to see what it does · <button class="btn-link xs" data-go="/ub/how">How it works</button></p>`}
    `, { back: '/home' });
  },
  mount(root) {
    wireTopicChips(root);
    on(root, 'click', '[data-f]', (e, el) => { App.session.ubSel = App.session.ubSel === el.dataset.f ? null : el.dataset.f; render(); });
  }
});

route('/ub/how', {
  title: 'How It Works',
  render: () => ubShell('home', '', '0.3', `
    <h1 class="page-title">How It Works</h1>
    <p class="page-sub">Three simple steps to master any topic</p>
    ${[['book', 'Learn step by step', 'Break down complex topics into manageable chunks'], ['network', 'See visual connections', 'Understand how concepts relate to each other'], ['file', 'Apply with examples', 'Practice with real-world scenarios']]
      .map(([ic, t, d], i) => `<div class="row mb-16" style="align-items:flex-start;gap:14px"><span class="tile-icon round green-btn" style="color:#fff">${i + 1}</span><div><strong class="row" style="gap:6px">${icon(ic)} ${t}</strong><div class="small muted">${d}</div></div></div>`).join('')}
    <button class="btn btn-primary green-btn mt-8" data-back="/ub">Continue</button>`)
});

route('/ub/explainer', {
  title: 'Step-by-Step Explainer',
  render: () => {
    const t = ubTopic();
    return ubShell('learn', 'Step-by-Step Explainer', '1.1', `
      ${topicChips()}
      <h1 class="page-title">${t.name}</h1>
      <p style="color:var(--text-2);line-height:1.6;margin-top:0">${t.intro}</p>
      <details class="acc" open><summary>Learning Steps ${icon('chevron-down')}</summary>
        ${t.steps.map((s, i) => `<button class="set-item small" data-go="/ub/step?i=${i}" style="padding:10px 14px">${i + 1}. ${s.title}</button>`).join('')}
      </details>
    `, { footer: `<div class="footer"><button class="btn btn-primary green-btn" data-go="/ub/step?i=0">Start Learning</button></div>` });
  },
  mount: wireTopicChips
});

route('/ub/step', {
  title: 'Step Expanded',
  render: q => {
    const t = ubTopic(), i = Math.max(0, Math.min(t.steps.length - 1, +q.i || 0)), s = t.steps[i], last = i === t.steps.length - 1;
    return ubShell('learn', 'Step Expanded', '1.2', `
      <div class="row small muted mb-16">Step ${i + 1} of ${t.steps.length}<div class="bar soft grow" style="height:6px"><span style="width:${(i + 1) / t.steps.length * 100}%;background:#059669"></span></div></div>
      <h1 class="page-title">${s.title}</h1>
      <div class="flow mt-12">
        <div><div class="bubble" style="background:${s.from[2]}">${s.from[0]}</div><div class="lbl">${s.from[1]}</div></div>
        <div class="arrow">${icon('arrow-right')}</div>
        <div><div class="bubble" style="background:${s.to[2]}">${s.to[0]}</div><div class="lbl">${s.to[1]}</div></div>
      </div>
      <div class="card info mt-16"><p style="color:var(--text-2);font-size:14px;line-height:1.6">${s.text}</p></div>
      ${last ? `<div class="notice green mt-16">${icon('check-circle')} You've finished all ${t.steps.length} steps of ${t.name}!</div>` : ''}
    `, {
      back: '/ub/explainer',
      footer: `<div class="footer row">${i > 0 ? `<button class="btn btn-ghost" data-go="/ub/step?i=${i - 1}">Previous</button>` : ''}
        ${last ? `<button class="btn btn-primary green-btn" data-go="/ub/map">Explore Concept Map</button>` : `<button class="btn btn-primary green-btn" data-go="/ub/step?i=${i + 1}">Next Step</button>`}</div>`
    });
  }
});

route('/ub/map', {
  title: 'Concept Link Map',
  render: () => {
    const t = ubTopic(), cx = 160, cy = 60;
    const seen = App.session.ubSeen || [];
    return ubShell('learn', 'Concept Link Map', '2.1', `
      ${topicChips()}
      <h1 class="page-title">Concept Link Map</h1>
      <p class="page-sub">Explore how concepts connect</p>
      <div class="concept-map"><svg viewBox="0 0 320 310" role="group" aria-label="Concept map for ${esc(t.name)}">
        ${t.nodes.map(n => `<line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" class="${seen.includes(n.id) ? 'on' : ''}"/>`).join('')}
        <g class="node center"><circle cx="${cx}" cy="${cy}" r="47"/><text x="${cx}" y="${cy + 1}">${t.name.split(' ').slice(-1)[0]}</text><text x="${cx}" y="${cy + 14}" style="font-size:8px;font-weight:400">(Central)</text></g>
        ${t.nodes.map(n => `<g class="node ${seen.includes(n.id) ? 'on' : ''}" data-node="${n.id}" tabindex="0" role="button" aria-label="${n.label.join(' ')}"><circle cx="${n.x}" cy="${n.y}" r="30"/>
          ${n.label.map((w, k) => `<text x="${n.x}" y="${n.y + 4 + (k - (n.label.length - 1) / 2) * 12}">${w}</text>`).join('')}</g>`).join('')}
      </svg></div>
      <p class="center-text xs muted mt-8">Tap any node to explore its connections · ${seen.filter(id => t.nodes.some(n => n.id === id)).length}/${t.nodes.length} explored</p>
    `);
  },
  mount(root) {
    wireTopicChips(root);
    const t = ubTopic();
    const open = id => {
      const i = t.nodes.findIndex(n => n.id === id), n = t.nodes[i];
      App.session.ubSeen = [...new Set([...(App.session.ubSeen || []), id])];
      overlay(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Relationship">
        <header><div><h2>Relationship</h2><div class="sub">${t.name} → ${n.label.join(' ')}</div></div><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        <div class="card info"><p style="color:var(--text-2);font-size:14px;line-height:1.6">${n.text}</p></div>
        <p class="label mt-16">Key Points:</p><ul class="bul">${n.points.map(p => `<li>${p}</li>`).join('')}</ul>
        <button class="btn btn-primary green-btn mt-16" id="more">Explore More Connections</button>
      </div>`, {
        kind: 'bottom',
        onMount(o, close) {
          $('#more', o).addEventListener('click', () => {
            close();
            const next = t.nodes.find(x => !(App.session.ubSeen || []).includes(x.id)) || t.nodes[(i + 1) % t.nodes.length];
            render();
            setTimeout(() => open(next.id), 50);
          });
          // reflect explored state on the map underneath
          new MutationObserver((_, obs) => {
            if (o.isConnected) return;
            obs.disconnect();
            if (parseHash().path === '/ub/map' && !$('.overlay')) render();
          }).observe($('.device'), { childList: true });
        }
      });
    };
    on(root, 'click', '[data-node]', (e, el) => open(el.dataset.node));
    on(root, 'keydown', '[data-node]', (e, el) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el.dataset.node); } });
  }
});

function diagramHTML(t) {
  const d = UB_DIAGRAMS[t.id];
  return `<div class="diagram" id="dg">
    <div class="d-row">${d.inputs.map(([a, b]) => `<div class="d-box"><b>${a}</b>${b}</div>`).join('')}</div>
    <div class="d-arrow">▼</div>
    <div class="d-main"><span>${d.main[0]}</span><div>${d.main[1]}<div class="xs muted" style="font-weight:400">${d.main[2]}</div></div></div>
    <div class="d-arrow">▼</div>
    <div class="d-row">${d.outputs.map(([e, n, s, bg, bd]) => `<div class="d-out" style="background:${bg};border:1px solid ${bd};color:#111827"><span>${e}</span><b>${n}</b>${s}</div>`).join('')}</div>
  </div>`;
}

route('/ub/diagrams', {
  title: 'Visual Diagrams',
  render: () => {
    const t = ubTopic(), done = (App.session.ubDiagrams || []).includes(t.id);
    return ubShell('diagrams', 'Visual Diagrams', done ? '3.2' : '3.1', `
      ${topicChips()}
      <div id="dz-area">${done ? `<h1 class="page-title">${t.name}</h1><p class="page-sub">Generated diagram</p>${diagramHTML(t)}`
        : `<div class="empty" style="padding:50px 10px">${icon('image')}<div>Generate a labelled diagram of <b>${t.name}</b>.</div></div>`}</div>
    `, {
      footer: `<div class="footer">${done ? `<button class="btn btn-primary green-btn" id="zoom">${icon('zoom-in')} Zoom View</button><button class="btn btn-ghost" id="gen">Regenerate</button>` : `<button class="btn btn-primary green-btn" id="gen">Generate Diagram</button>`}</div>`
    });
  },
  mount(root) {
    wireTopicChips(root);
    const t = ubTopic();
    $('#gen', root).addEventListener('click', async () => {
      $('#dz-area', root).innerHTML = `<div class="loader mt-24"><div class="spinner" style="border-top-color:#059669" aria-hidden="true"></div><h2>Generating Diagram…</h2><p>Creating visual representation of ${t.name.toLowerCase()}</p>
        <div class="bar soft" style="max-width:240px;margin:0 auto"><span id="load-bar" style="width:5%;background:#059669"></span></div></div>`;
      $$('.footer button', root).forEach(b => { b.disabled = true; });
      for (let p = 15; p <= 100; p += 17) { await wait(220); if (!root.isConnected) return; $('#load-bar', root).style.width = p + '%'; }
      App.session.ubDiagrams = [...new Set([...(App.session.ubDiagrams || []), t.id])];
      render();
    });
    $('#zoom', root)?.addEventListener('click', () => {
      let z = 1.5;
      overlay(`<div class="dialog" style="max-width:none;height:100%;display:flex;flex-direction:column;padding:16px" role="dialog" aria-modal="true" aria-label="Zoom view">
        <div class="between mb-12"><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
          <div class="row" style="gap:6px"><button class="icon-btn" id="zo" aria-label="Zoom out">${icon('zoom-out')}</button><span class="zoom-pill" id="zl">150%</span><button class="icon-btn" id="zi" aria-label="Zoom in">${icon('zoom-in')}</button></div></div>
        <div class="zoom-wrap" style="flex:1"><div id="zc" style="width:300px;padding:10px">${diagramHTML(t)}</div></div>
        <p class="center-text xs muted mt-8">Use + / − to zoom · drag or scroll to pan</p>
      </div>`, {
        onMount(o) {
          const apply = () => {
            const zc = $('#zc', o);
            zc.style.zoom = z;
            $('#zl', o).textContent = Math.round(z * 100) + '%';
          };
          apply();
          $('#zi', o).addEventListener('click', () => { z = Math.min(3, z + 0.25); apply(); });
          $('#zo', o).addEventListener('click', () => { z = Math.max(0.75, z - 0.25); apply(); });
          // drag to pan
          const wrap = $('.zoom-wrap', o);
          let drag = null;
          wrap.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, l: wrap.scrollLeft, t: wrap.scrollTop }; wrap.setPointerCapture(e.pointerId); });
          wrap.addEventListener('pointermove', e => { if (!drag) return; wrap.scrollLeft = drag.l - (e.clientX - drag.x); wrap.scrollTop = drag.t - (e.clientY - drag.y); });
          wrap.addEventListener('pointerup', () => { drag = null; });
        }
      });
    });
  }
});

route('/ub/examples', {
  title: 'Example Library',
  render: () => {
    const f = App.session.ubFilters || (App.session.ubFilters = { level: [], kind: [], all: false, q: '' });
    const t = ubTopic();
    const list = DATA.booster.examples.filter(e => (f.all || e.topic === t.id)
      && (!f.level.length || f.level.includes(e.level)) && (!f.kind.length || f.kind.includes(e.kind))
      && (!f.q || (e.title + ' ' + e.text).toLowerCase().includes(f.q.toLowerCase())));
    const active = f.level.length + f.kind.length;
    const chip = (group, v) => { const on = f[group].includes(v); return `<button class="chip ${on ? 'on' : ''}" data-fg="${group}" data-fv="${v}" style="${on ? 'background:#059669;border-color:#059669' : ''}">${v}${on ? ' ' + icon('x') : ''}</button>`; };
    const lvlBadge = { Beginner: 'b-purple', Intermediate: 'b-amber', Advanced: 'b-red' };
    return ubShell('examples', active ? 'Filtered Examples' : 'Example Library', active ? '4.2' : '4.1', `
      <h1 class="page-title">${active ? 'Filtered Examples' : 'Example Library'}</h1>
      <p class="page-sub" style="margin-bottom:12px">${plural(list.length, 'example')} ${active || f.q ? (list.length === 1 ? 'matches' : 'match') + ' your filters' : 'available'}</p>
      <div class="search mb-12">${icon('search')}<input class="input" id="exq" type="search" placeholder="Search examples..." value="${esc(f.q)}" aria-label="Search examples"></div>
      <div class="chips mb-8"><button class="chip ${!f.all ? 'on' : ''}" data-scope="topic" style="${!f.all ? 'background:#059669;border-color:#059669' : ''}">${t.name}</button><button class="chip ${f.all ? 'on' : ''}" data-scope="all" style="${f.all ? 'background:#059669;border-color:#059669' : ''}">All topics</button></div>
      <div class="chips mb-8">${['Beginner', 'Intermediate', 'Advanced'].map(v => chip('level', v)).join('')}</div>
      <div class="chips mb-16">${['Real-World', 'Lab', 'Everyday'].map(v => chip('kind', v)).join('')}</div>
      ${list.length ? list.map(e => `<button class="example" data-ex="${e.id}"><strong>${e.title} <span class="muted">${icon('chevron-right')}</span></strong>
        <div class="badges"><span class="badge b-blue">${e.kind}</span><span class="badge ${lvlBadge[e.level]}">${e.level}</span></div><p>${e.text}</p></button>`).join('')
        : `<div class="empty">${icon('search')}<div>No examples match. Try removing a filter.</div></div>`}
      ${active || f.q ? '<button class="btn btn-ghost mt-16" id="clear">Clear Filters</button>' : ''}
    `);
  },
  mount(root) {
    const f = App.session.ubFilters;
    on(root, 'click', '[data-fg]', (e, el) => {
      const g = el.dataset.fg, v = el.dataset.fv;
      f[g] = f[g].includes(v) ? f[g].filter(x => x !== v) : f[g].concat(v);
      render();
    });
    on(root, 'click', '[data-scope]', (e, el) => { f.all = el.dataset.scope === 'all'; render(); });
    const q = $('#exq', root);
    let deb;
    q.addEventListener('input', () => {
      clearTimeout(deb);
      deb = setTimeout(() => {
        f.q = q.value; const pos = q.selectionStart; render();
        const n = $('#exq'); n.focus(); n.setSelectionRange(pos, pos);
      }, 250);
    });
    $('#clear', root)?.addEventListener('click', () => { Object.assign(f, { level: [], kind: [], q: '' }); render(); });
    on(root, 'click', '[data-ex]', (e, el) => {
      const ex = DATA.booster.examples.find(x => x.id === el.dataset.ex);
      overlay(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(ex.title)}">
        <header><div><h2>${ex.title}</h2><div class="sub">${ex.kind} · ${ex.level}</div></div><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        <p style="color:var(--text-2);line-height:1.6">${ex.text}</p>
        <div class="card info"><p style="color:var(--text-2);line-height:1.6">${ex.detail}</p></div>
        <button class="btn btn-primary green-btn mt-16" data-close>Got it</button>
      </div>`, { kind: 'bottom' });
    });
  }
});
