// 1.x Login / Sign up, 2.0 Home, profile, notifications, help, settings (7.x)

function initials(name) {
  return (name || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
function firstName() {
  const n = Store.state.user?.name || '';
  return n.split(/\s+/)[0] || '';
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- 1.0 Welcome ---------- */

route('/welcome', {
  public: true, authOnly: true, title: 'Welcome',
  render: () => `<div class="screen welcome">
    <div class="content center">
      <div class="logo">${icon('cap')}</div>
      <h1>MyLearningAI</h1>
      <p>Learn smarter with AI</p>
      <button class="btn btn-primary" data-go="/login">Login</button>
      <button class="btn btn-ghost mt-12" data-go="/signup">Sign Up</button>
    </div>
  </div>`
});

/* ---------- 1.1 Login ---------- */

route('/login', {
  public: true, authOnly: true, title: 'Login',
  render: () => `<div class="screen">
    <div class="topbar"><button class="icon-btn" data-back="/welcome" aria-label="Back">${icon('arrow-left')}</button></div>
    <form class="content" id="login-form" novalidate>
      <h1 class="page-title">Welcome Back</h1>
      <p class="page-sub">Login to continue learning</p>
      <div class="field">
        <label for="li-user">Email / Username</label>
        <input id="li-user" class="input" placeholder="Enter your email or username" autocomplete="username" value="${esc(Store.state.user?.email || '')}">
        <div class="error hidden" id="li-user-err">Please enter your email or username.</div>
      </div>
      <div class="field">
        <label for="li-pass">Password</label>
        <div class="input-wrap">
          <input id="li-pass" class="input" type="password" placeholder="Enter your password" autocomplete="current-password">
          <button type="button" class="icon-btn" id="li-eye" aria-label="Show password">${icon('eye')}</button>
        </div>
        <div class="error hidden" id="li-pass-err">Password must be at least 6 characters.</div>
      </div>
      <div style="text-align:right;margin:-4px 0 22px"><button type="button" class="btn-link" data-go="/forgot">Forgot Password?</button></div>
      <button class="btn btn-primary" type="submit">Login</button>
      <p class="center-text small muted mt-16">Don't have an account? <button type="button" class="btn-link" data-go="/signup">Sign Up</button></p>
      <div class="notice mt-16">${icon('info')} Prototype: any username and a password of 6+ characters will sign you in.</div>
    </form>
  </div>`,
  mount(root) {
    const user = $('#li-user', root), pass = $('#li-pass', root);
    $('#li-eye', root).addEventListener('click', e => {
      const show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      e.currentTarget.innerHTML = icon(show ? 'eye-off' : 'eye');
      e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    $('#login-form', root).addEventListener('submit', e => {
      e.preventDefault();
      const u = user.value.trim(), okU = !!u, okP = pass.value.length >= 6;
      user.classList.toggle('invalid', !okU); $('#li-user-err', root).classList.toggle('hidden', okU);
      pass.classList.toggle('invalid', !okP); $('#li-pass-err', root).classList.toggle('hidden', okP);
      if (!okU || !okP) return;
      Store.set(s => {
        if (!s.user || (s.user.email !== u && s.user.name !== u)) {
          const name = u.includes('@') ? u.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : u;
          s.user = { name, email: u.includes('@') ? u : `${u.toLowerCase().replace(/\s+/g, '')}@student.sp.edu.sg` };
        }
        s.loggedIn = true;
      });
      replace('/home');
      toast(`Welcome back, ${firstName()}!`);
    });
  }
});

/* ---------- 1.1.1 / 1.1.2 Reset password ---------- */

route('/forgot', {
  public: true, authOnly: true, title: 'Reset Password',
  render: () => `<div class="screen">
    <div class="topbar"><button class="icon-btn" data-back="/login" aria-label="Back">${icon('arrow-left')}</button></div>
    <div class="content" id="fp">
      <form id="fp-form" novalidate>
        <h1 class="page-title">Reset Password</h1>
        <p class="page-sub">Enter the email linked to your account and we'll send you a reset link.</p>
        <div class="field">
          <label for="fp-email">Email</label>
          <input id="fp-email" class="input" type="email" placeholder="Enter your email" autocomplete="email">
          <div class="error hidden">Please enter a valid email address.</div>
        </div>
        <button class="btn btn-primary" type="submit">Send Reset Link</button>
      </form>
    </div>
  </div>`,
  mount(root) {
    $('#fp-form', root).addEventListener('submit', e => {
      e.preventDefault();
      const inp = $('#fp-email', root), ok = EMAIL_RE.test(inp.value.trim());
      inp.classList.toggle('invalid', !ok);
      $('.error', root).classList.toggle('hidden', ok);
      if (!ok) return;
      $('#fp', root).innerHTML = `<div class="feedback mt-24">
        <div class="halo teal">${icon('mail')}</div>
        <h2>Check your email</h2>
        <p>We sent a password reset link to <b>${esc(inp.value.trim())}</b>.</p>
        <button class="btn btn-primary" data-go="/login">Back to Login</button>
        <p class="xs muted mt-16">Prototype: no email is actually sent.</p>
      </div>`;
    });
  }
});

/* ---------- 1.2 Sign up, 1.2.1–1.2.4 verification ---------- */

route('/signup', {
  public: true, authOnly: true, title: 'Sign Up',
  render: () => {
    const s = App.session.signup || {};
    return `<div class="screen">
      <div class="topbar"><button class="icon-btn" data-back="/welcome" aria-label="Back">${icon('arrow-left')}</button></div>
      <form class="content" id="su-form" novalidate>
        <h1 class="page-title">Create Account</h1>
        <p class="page-sub">Sign up to start learning smarter</p>
        <div class="field"><label for="su-name">Full Name</label><input id="su-name" class="input" placeholder="Enter your full name" autocomplete="name" value="${esc(s.name || '')}"><div class="error hidden">Please enter your name.</div></div>
        <div class="field">
          <label for="su-email">Email ${s.verified ? '<span class="badge b-green" style="margin-left:6px">✓ Verified</span>' : ''}</label>
          <div class="row">
            <input id="su-email" class="input" type="email" placeholder="Enter your email" autocomplete="email" value="${esc(s.email || '')}" ${s.verified ? 'readonly' : ''}>
            ${s.verified ? '' : '<button type="button" class="btn btn-outline btn-sm" id="su-verify" style="padding:12px">Verify</button>'}
          </div>
          <div class="error hidden" id="su-email-err">Please enter a valid email address.</div>
        </div>
        <div class="field"><label for="su-pass">Password</label><input id="su-pass" class="input" type="password" placeholder="At least 6 characters" autocomplete="new-password"><div class="error hidden">Password must be at least 6 characters.</div></div>
        <div class="field"><label for="su-pass2">Confirm Password</label><input id="su-pass2" class="input" type="password" placeholder="Re-enter your password" autocomplete="new-password"><div class="error hidden">Passwords do not match.</div></div>
        <button class="btn btn-primary" type="submit" ${s.verified ? '' : 'disabled'}>Sign Up</button>
        ${s.verified ? '' : '<p class="hint center-text">Verify your email to continue.</p>'}
        <p class="center-text small muted mt-16">Already have an account? <button type="button" class="btn-link" data-go="/login">Login</button></p>
      </form>
    </div>`;
  },
  mount(root) {
    const name = $('#su-name', root), email = $('#su-email', root);
    const keep = () => { App.session.signup = { ...(App.session.signup || {}), name: name.value, email: email.value }; };
    name.addEventListener('input', keep);
    const vb = $('#su-verify', root);
    if (vb) vb.addEventListener('click', () => {
      const ok = EMAIL_RE.test(email.value.trim());
      email.classList.toggle('invalid', !ok);
      $('#su-email-err', root).classList.toggle('hidden', ok);
      if (!ok) return;
      keep();
      App.session.signup.code = String(rand(100000, 999999));
      go('/verify');
    });
    $('#su-form', root).addEventListener('submit', e => {
      e.preventDefault();
      const fields = $$('.field', root);
      const p1 = $('#su-pass', root), p2 = $('#su-pass2', root);
      const checks = [[name, !!name.value.trim()], [p1, p1.value.length >= 6], [p2, p2.value === p1.value && !!p2.value]];
      let ok = true;
      checks.forEach(([el, good]) => {
        el.classList.toggle('invalid', !good);
        $('.error', el.closest('.field')).classList.toggle('hidden', good);
        ok = ok && good;
      });
      if (!ok || !fields) return;
      Store.set(s => { s.user = { name: name.value.trim(), email: email.value.trim() }; s.loggedIn = true; });
      App.session.signup = null;
      replace('/home');
      toast('Account created. Welcome to MyLearningAI!');
    });
  }
});

route('/verify', {
  public: true, authOnly: true, title: 'Verify Email',
  guard: () => !!App.session.signup?.code, fallback: '/signup',
  render: () => `<div class="screen">
    <div class="topbar"><button class="icon-btn" data-back="/signup" aria-label="Back">${icon('arrow-left')}</button></div>
    <div class="content" id="vf">
      <h1 class="page-title">Verify your email</h1>
      <p class="page-sub">Enter the 6-digit code we sent to <b>${esc(App.session.signup.email)}</b></p>
      <div class="code-inputs" id="code">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" ${i === 0 ? 'autocomplete="one-time-code"' : ''} aria-label="Digit ${i + 1}">`).join('')}</div>
      <div class="error hidden" id="code-err">That code doesn't match. Please try again.</div>
      <button class="btn btn-primary mt-24" id="vf-btn" disabled>Verify</button>
      <p class="center-text small muted mt-16">Didn't get a code? <button class="btn-link" id="resend">Resend</button></p>
      <div class="notice mt-16">${icon('info')} <span>Prototype: no email is sent. Your code is <b id="demo-code">${App.session.signup.code}</b></span></div>
    </div>
  </div>`,
  mount(root) {
    const boxes = $$('#code input', root), btn = $('#vf-btn', root);
    const value = () => boxes.map(b => b.value).join('');
    boxes[0].focus();
    // Spreads digits from box i onwards, so pasted or autofilled codes fill every box
    const fill = (i, digits) => {
      digits.split('').forEach((d, k) => { if (boxes[i + k]) boxes[i + k].value = d; });
      const nextEmpty = boxes.find(x => !x.value);
      (nextEmpty || boxes[Math.min(5, i + digits.length - 1)]).focus();
      btn.disabled = value().length !== 6;
      $('#code-err', root).classList.add('hidden');
      boxes.forEach(x => x.classList.remove('invalid'));
    };
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        const digits = b.value.replace(/\D/g, '');
        b.value = '';
        if (digits) fill(i, digits.slice(0, 6 - i));
        else btn.disabled = true;
      });
      b.addEventListener('focus', () => b.select());
      b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      b.addEventListener('paste', e => {
        const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!digits) return;
        e.preventDefault();
        fill(0, digits);
      });
    });
    $('#resend', root).addEventListener('click', () => {
      App.session.signup.code = String(rand(100000, 999999));
      $('#demo-code', root).textContent = App.session.signup.code;
      toast('A new code has been sent');
    });
    btn.addEventListener('click', async () => {
      if (value() !== App.session.signup.code) {
        $('#code-err', root).classList.remove('hidden');
        boxes.forEach(b => b.classList.add('invalid'));
        return;
      }
      $('#code', root).classList.add('ok');
      btn.disabled = true;
      await wait(500);
      App.session.signup.verified = true;
      $('#vf', root).innerHTML = `<div class="feedback mt-24">
        <div class="halo green">${icon('check-circle')}</div>
        <h2 class="green">Email Verified</h2>
        <p>Your email has been verified successfully. You can now finish creating your account.</p>
        <button class="btn btn-primary" id="vf-cont">Continue Sign Up</button>
      </div>`;
      $('#vf-cont', root).addEventListener('click', () => back('/signup'));
    });
  }
});

/* ---------- 2.0 Home, 2.1 Logout ---------- */

function logout() {
  confirmDialog({ title: 'Log out?', text: 'You will need to log in again to continue learning.', yes: 'Log Out', danger: true, iconName: 'logout' }).then(ok => {
    if (!ok) return;
    Store.set(s => { s.loggedIn = false; });
    App.stack = [];
    replace('/welcome');
    toast('You have been logged out');
  });
}

route('/home', {
  title: 'Home',
  render: () => {
    const last = Store.state.practice.last;
    const pct = Math.round(last.correct / last.total * 100);
    const msg = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practising!';
    const modules = [
      ['/lc', 'ti-yellow', 'bulb', 'AI Lesson Companion', 'Interactive lesson previews and summaries'],
      ['/ub', 'ti-pink', 'brain', 'AI Understanding Booster', 'Enhance comprehension with AI'],
      ['/pe', 'ti-cyan', 'book', 'AI Practice Engine', 'Practice with personalized questions'],
      ['/pc', 'ti-teal', 'trend', 'Progress & Confidence System', 'Track your learning journey']
    ];
    return `<div class="screen">
      <div class="content">
        <div class="home-head">
          <div><h1>Welcome Back${firstName() ? ', ' + esc(firstName()) : ''}!</h1><p>Ready to continue learning?</p></div>
          <div class="row" style="gap:6px">
            <button class="icon-btn" id="logout" aria-label="Log out">${icon('logout')}</button>
            <button class="avatar" data-go="/profile" aria-label="Profile">${esc(initials(Store.state.user?.name))}</button>
          </div>
        </div>
        <button class="card prev-quiz mb-16" data-go="/pe" style="cursor:pointer">
          <div><small>Previous Quiz</small><span class="score">${last.correct}/${last.total}</span></div>
          <div class="pct"><b>${pct}%</b><small>${msg}</small></div>
        </button>
        ${modules.map(([path, cls, ic, t, d]) => `<button class="module" data-go="${path}">
          <span class="tile-icon ${cls}">${icon(ic)}</span><span class="grow"><strong>${t}</strong><small>${d}</small></span>
        </button>`).join('')}
      </div>
      ${tabbar('home')}
    </div>`;
  },
  mount(root) { $('#logout', root).addEventListener('click', logout); }
});

/* ---------- Profile ---------- */

route('/profile', {
  title: 'Profile',
  render: () => {
    const s = Store.state, u = s.user || {};
    const avg = Math.round(s.history.reduce((a, h) => a + h.score, 0) / s.history.length);
    const hours = Math.round((s.history.length * 45 + s.practice.sessions * 25 + s.practice.seconds / 60) / 60);
    return `<div class="screen">
      ${topbar({ back: '/home' })}
      <div class="content">
        <div class="center-text">
          <div class="avatar lg" style="margin:0 auto 10px">${esc(initials(u.name))}</div>
          <h1 class="page-title" style="margin:0">${esc(u.name || 'Student')}</h1>
          <p class="muted small" style="margin:2px 0 18px">${esc(u.email || '')}</p>
        </div>
        <div class="stats-grid">
          <div class="card"><b>${hours}h</b><small>Study hours</small></div>
          <div class="card"><b>${s.streak.current}🔥</b><small>Day streak</small></div>
          <div class="card"><b>${s.history.length}</b><small>Weekly tests</small></div>
          <div class="card"><b>${avg}%</b><small>Average score</small></div>
        </div>
        <p class="section-label">Achievements</p>
        ${DATA.achievements.map(a => {
          const got = a.got || (a.title === '7-Day Streak' && s.streak.best >= 7) || (a.title === 'Organised' && s.sheets.length >= 5);
          return `<div class="ach ${got ? '' : 'locked'}"><span class="tile-icon round ${got ? 'ti-teal' : 'ti-gray'}" style="width:38px;height:38px">${icon(a.icon)}</span>
          <div class="grow"><strong class="small">${a.title}</strong><div class="xs muted">${a.text}</div></div>${got ? `<span class="badge b-green">Earned</span>` : `<span class="badge b-gray">Locked</span>`}</div>`;
        }).join('')}
        <button class="btn btn-ghost mt-16" data-go="/settings/account">${icon('edit')} Edit Profile</button>
      </div>
      ${tabbar('')}
    </div>`;
  }
});

/* ---------- Notifications ---------- */

route('/notifications', {
  title: 'Notifications',
  render: q => {
    const cats = ['All', 'Quiz', 'Study Plan', 'AI Suggestions'];
    const cat = cats.includes(q.cat) ? q.cat : 'All';
    const read = Store.state.readNotifs;
    const list = DATA.notifications.filter(n => cat === 'All' || n.cat === cat);
    const unread = n => n.unread && !read.includes(n.id);
    return `<div class="screen gray">
      <div class="content">
        <div class="between"><h1 class="page-title">Notifications</h1>
          ${unreadCount() ? '<button class="btn-link small" id="read-all">Mark all read</button>' : ''}</div>
        <div class="chips scroll mt-8 mb-16" role="tablist">${cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${c}" role="tab" aria-selected="${c === cat}">${c}</button>`).join('')}</div>
        ${list.length ? list.map(n => `<button class="notif ${unread(n) ? 'unread' : ''}" data-n="${n.id}">
          <span class="tile-icon ${unread(n) ? 'ti-soft' : 'ti-gray'}">${icon(n.icon)}</span>
          <span class="grow"><span class="between"><strong>${n.title}</strong></span><p>${n.text}</p>
          <span class="between"><time>${icon('clock')} ${n.time}</time>${unread(n) ? '<span class="badge b-teal">New</span>' : ''}</span></span>
        </button>`).join('') : `<div class="empty">${icon('bell')}<div>No notifications here</div></div>`}
      </div>
      ${tabbar('notif')}
    </div>`;
  },
  mount(root) {
    on(root, 'click', '[data-cat]', (e, el) => replace('/notifications?cat=' + encodeURIComponent(el.dataset.cat)));
    on(root, 'click', '[data-n]', (e, el) => {
      const n = DATA.notifications.find(x => x.id === el.dataset.n);
      Store.set(s => { if (!s.readNotifs.includes(n.id)) s.readNotifs.push(n.id); });
      go(n.go);
    });
    const ra = $('#read-all', root);
    if (ra) ra.addEventListener('click', () => {
      Store.set(s => { s.readNotifs = DATA.notifications.map(n => n.id); });
      render();
      toast('All notifications marked as read');
    });
  }
});

/* ---------- Help & Support ---------- */

route('/help', {
  title: 'Help',
  render: () => {
    const cats = [...new Set(DATA.faqs.map(f => f.cat))];
    return `<div class="screen gray">
      <div class="content">
        <h1 class="page-title">Help & Support</h1>
        <p class="page-sub">Find answers or get in touch</p>
        <div class="search mb-16">${icon('search')}<input class="input" id="faq-q" type="search" placeholder="Search help articles..." aria-label="Search help articles"></div>
        <div class="chips scroll mb-16" id="faq-cats"><button class="chip on" data-fc="">All</button>${cats.map(c => `<button class="chip" data-fc="${c}">${c}</button>`).join('')}</div>
        <div id="faq-list"></div>
        <div class="card mt-16">
          <h3>Still need help?</h3>
          <p class="mb-12">Our support team usually replies within one school day.</p>
          <button class="btn btn-primary" id="contact">${icon('message')} Contact Support</button>
        </div>
      </div>
      ${tabbar('help')}
    </div>`;
  },
  mount(root) {
    let cat = '';
    const draw = () => {
      const q = $('#faq-q', root).value.trim().toLowerCase();
      const list = DATA.faqs.filter(f => (!cat || f.cat === cat) && (!q || (f.q + ' ' + f.a).toLowerCase().includes(q)));
      $('#faq-list', root).innerHTML = list.length
        ? list.map(f => `<details class="acc"><summary>${esc(f.q)} ${icon('chevron-down')}</summary><p>${esc(f.a)}</p></details>`).join('')
        : `<div class="empty">${icon('search')}<div>No articles match "${esc(q)}"</div></div>`;
    };
    draw();
    $('#faq-q', root).addEventListener('input', draw);
    on(root, 'click', '[data-fc]', (e, el) => {
      cat = el.dataset.fc;
      $$('[data-fc]', root).forEach(c => c.classList.toggle('on', c === el));
      draw();
    });
    $('#contact', root).addEventListener('click', () => {
      overlay(`<form class="sheet" role="dialog" aria-modal="true" aria-label="Contact support">
        <header><div><h2>Contact Support</h2><div class="sub">We'll reply to ${esc(Store.state.user?.email || 'your email')}</div></div><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        <div class="field"><label for="cs-topic">Topic</label><select id="cs-topic" class="input"><option>Quizzes</option><option>Study plans</option><option>Uploading notes</option><option>My account</option><option>Something else</option></select></div>
        <div class="field"><label for="cs-msg">Message</label><textarea id="cs-msg" class="input" placeholder="Describe your issue..." required></textarea></div>
        <button class="btn btn-primary" type="submit">${icon('send')} Send Message</button>
      </form>`, {
        kind: 'bottom',
        onMount(o, close) {
          $('form', o).addEventListener('submit', e => {
            e.preventDefault();
            if (!$('#cs-msg', o).value.trim()) { $('#cs-msg', o).classList.add('invalid'); return; }
            close();
            toast('Message sent. We’ll get back to you soon.');
          });
        }
      });
    });
  }
});

/* ---------- 7.0 Settings ---------- */

route('/settings', {
  title: 'Settings',
  render: () => {
    const u = Store.state.user || {};
    const item = (path, ic, t, d) => `<button class="set-item" data-go="${path}">${icon(ic)}<span class="grow"><strong>${t}</strong><small>${d}</small></span><span class="chev">${icon('chevron-right')}</span></button>`;
    return `<div class="screen gray">
      <div class="content">
        <h1 class="page-title mb-16">Settings</h1>
        <button class="card row mb-16" data-go="/profile" style="width:100%;text-align:left;cursor:pointer">
          <span class="avatar">${esc(initials(u.name))}</span>
          <span class="grow"><strong>${esc(u.name || 'Student')}</strong><br><small class="muted">${esc(u.email || '')}</small></span>
          <span class="chev muted">${icon('chevron-right')}</span>
        </button>
        <div class="set-group">
          ${item('/settings/account', 'user', 'Account Management', 'Name, email and password')}
          ${item('/settings/privacy', 'shield', 'Privacy & Security', 'Two-factor login, data and privacy')}
          ${item('/settings/notifications', 'bell', 'Notification Preferences', 'Choose what we remind you about')}
          ${item('/settings/appearance', 'palette', 'Appearance & Theme', 'Light or dark mode, text size')}
        </div>
        <div class="set-group">
          <button class="set-item" id="so-logout" style="color:var(--danger)">${icon('logout')}<span class="grow"><strong>Log Out</strong></span></button>
        </div>
        <p class="center-text xs muted mt-16">MyLearningAI prototype v1.0</p>
      </div>
      ${tabbar('settings')}
    </div>`;
  },
  mount(root) { $('#so-logout', root).addEventListener('click', logout); }
});

route('/settings/account', {
  title: 'Account Management',
  render: () => {
    const u = Store.state.user || {};
    return `<div class="screen">
      ${topbar({ back: '/settings' })}
      <form class="content" id="acc-form" novalidate>
        <h1 class="page-title">Account Management</h1>
        <p class="page-sub">Update your personal details</p>
        <div class="field"><label for="ac-name">Full Name</label><input id="ac-name" class="input" value="${esc(u.name || '')}" maxlength="60"><div class="error hidden">Please enter your name.</div></div>
        <div class="field"><label for="ac-email">Email</label><input id="ac-email" class="input" type="email" value="${esc(u.email || '')}"><div class="error hidden">Please enter a valid email address.</div></div>
        <button class="btn btn-primary" type="submit">Save Changes</button>
        <hr class="divider">
        <div class="set-group">
          <button type="button" class="set-item" id="ac-pass">${icon('key')}<span class="grow"><strong>Change Password</strong><small>Last changed 3 months ago</small></span><span class="chev">${icon('chevron-right')}</span></button>
        </div>
      </form>
    </div>`;
  },
  mount(root) {
    $('#acc-form', root).addEventListener('submit', e => {
      e.preventDefault();
      const n = $('#ac-name', root), m = $('#ac-email', root);
      const okN = !!n.value.trim(), okM = EMAIL_RE.test(m.value.trim());
      n.classList.toggle('invalid', !okN); $('.error', n.parentNode).classList.toggle('hidden', okN);
      m.classList.toggle('invalid', !okM); $('.error', m.parentNode).classList.toggle('hidden', okM);
      if (!okN || !okM) return;
      Store.set(s => { s.user = { ...s.user, name: n.value.trim(), email: m.value.trim() }; });
      toast('Profile updated');
    });
    $('#ac-pass', root).addEventListener('click', () => {
      overlay(`<form class="sheet" role="dialog" aria-modal="true" aria-label="Change password" novalidate>
        <header><h2>Change Password</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></header>
        <div class="field"><label for="cp-old">Current Password</label><input id="cp-old" class="input" type="password" autocomplete="current-password"></div>
        <div class="field"><label for="cp-new">New Password</label><input id="cp-new" class="input" type="password" autocomplete="new-password"><div class="hint">At least 6 characters.</div></div>
        <div class="error hidden" id="cp-err"></div>
        <button class="btn btn-primary" type="submit">Update Password</button>
      </form>`, {
        kind: 'bottom',
        onMount(o, close) {
          $('form', o).addEventListener('submit', e => {
            e.preventDefault();
            const err = $('#cp-err', o);
            if (!$('#cp-old', o).value) { err.textContent = 'Enter your current password.'; err.classList.remove('hidden'); return; }
            if ($('#cp-new', o).value.length < 6) { err.textContent = 'New password must be at least 6 characters.'; err.classList.remove('hidden'); return; }
            close();
            toast('Password updated');
          });
        }
      });
    });
  }
});

function toggleRow(key, title, desc, checked) {
  return `<label class="set-item" style="cursor:pointer"><span class="grow"><strong>${title}</strong><small>${desc}</small></span>
    <span class="switch"><input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}><span></span></span></label>`;
}

route('/settings/privacy', {
  title: 'Privacy & Security',
  render: () => {
    const p = Store.state.settings.privacy;
    return `<div class="screen">
      ${topbar({ back: '/settings' })}
      <div class="content">
        <h1 class="page-title">Privacy & Security</h1>
        <p class="page-sub">Control how your data is used</p>
        <div class="set-group">
          ${toggleRow('twofa', 'Two-factor login', 'Ask for a code when logging in on a new device', p.twofa)}
          ${toggleRow('personalised', 'Personalised AI suggestions', 'Use your quiz results to tailor recommendations', p.personalised)}
          ${toggleRow('analytics', 'Share usage analytics', 'Help improve the app with anonymous usage data', p.analytics)}
        </div>
        <div class="set-group">
          <button class="set-item" id="pv-clear" style="color:var(--danger)">${icon('trash')}<span class="grow"><strong>Clear my data</strong><small>Reset all progress saved in this browser</small></span></button>
        </div>
        <div class="notice mt-16">${icon('lock')} Everything in this prototype is stored only in your browser.</div>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'change', '[data-key]', (e, el) => {
      Store.set(s => { s.settings.privacy[el.dataset.key] = el.checked; });
      toast('Preference saved');
    });
    $('#pv-clear', root).addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Clear all data?', text: 'This resets quizzes, study plans, revision sheets and settings to the demo data and logs you out.', yes: 'Clear Data', danger: true, iconName: 'trash' });
      if (!ok) return;
      Store.reset();
      applySettings();
      App.stack = [];
      replace('/welcome');
      toast('Your data has been cleared');
    });
  }
});

route('/settings/notifications', {
  title: 'Notification Preferences',
  render: () => {
    const n = Store.state.settings.notif;
    return `<div class="screen">
      ${topbar({ back: '/settings' })}
      <div class="content">
        <h1 class="page-title">Notification Preferences</h1>
        <p class="page-sub">Choose what you want to hear about</p>
        <div class="set-group">
          ${toggleRow('quiz', 'Quiz reminders', 'New quizzes and weekly test reminders', n.quiz)}
          ${toggleRow('plan', 'Study plan updates', 'Task reminders and plan changes', n.plan)}
          ${toggleRow('ai', 'AI suggestions', 'Weak areas and practice recommendations', n.ai)}
          ${toggleRow('checkin', 'Daily check-in', 'A daily nudge to review your progress', n.checkin)}
          ${toggleRow('email', 'Email summaries', 'A weekly progress summary by email', n.email)}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'change', '[data-key]', (e, el) => {
      Store.set(s => { s.settings.notif[el.dataset.key] = el.checked; });
      toast(el.checked ? 'Notifications on' : 'Notifications off');
    });
  }
});

route('/settings/appearance', {
  title: 'Appearance & Theme',
  render: () => {
    const { theme, text } = Store.state.settings;
    return `<div class="screen">
      ${topbar({ back: '/settings' })}
      <div class="content">
        <h1 class="page-title">Appearance & Theme</h1>
        <p class="page-sub">Make the app comfortable to read</p>
        <p class="label">Theme</p>
        <div class="seg mb-16" id="theme">${[['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'phone', 'System']].map(([v, ic, l]) =>
          `<button class="${theme === v ? 'on' : ''}" data-v="${v}" aria-pressed="${theme === v}"><span class="row" style="justify-content:center;gap:6px">${icon(ic)}${l}</span></button>`).join('')}</div>
        <p class="label">Text size</p>
        <div class="seg mb-16" id="text">${[['small', 'Small'], ['normal', 'Default'], ['large', 'Large']].map(([v, l]) =>
          `<button class="${text === v ? 'on' : ''}" data-v="${v}" aria-pressed="${text === v}">${l}</button>`).join('')}</div>
        <div class="card soft"><h3>Preview</h3><p>This is how text will look across MyLearningAI.</p></div>
      </div>
    </div>`;
  },
  mount(root) {
    on(root, 'click', '#theme [data-v]', (e, el) => { Store.set(s => { s.settings.theme = el.dataset.v; }); applySettings(); render(); });
    on(root, 'click', '#text [data-v]', (e, el) => { Store.set(s => { s.settings.text = el.dataset.v; }); applySettings(); render(); });
  }
});
