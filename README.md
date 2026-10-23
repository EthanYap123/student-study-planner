# MyLearningAI — Student Study Planner Prototype

An interactive, mobile-first prototype of **MyLearningAI**, an AI-assisted learning app for students. It turns our ST0277 Design for User Interaction (DEUI) wireframes, Figma prototype and usability-test findings into a working web app.

**Live demo:** https://ethanyap123.github.io/student-study-planner/

On a desktop the app runs inside a phone frame; on a phone it fills the screen. Everything runs in the browser with mock data, so no account or server is needed. Sign up or log in with any details.

## Features

**Login & sign up** — welcome screen, login, password reset and sign up with 6-digit email verification.

**AI Progress & Confidence System** (the feature we usability-tested), including the improvements from our usability report:
- **Weekly Test**: upload notes (drag and drop, file picker or camera scan), supported-format guidance, file rename/delete/reorder with page detection, and quiz settings (difficulty, number of questions, question types, estimated time)
- The quiz itself has a progress and time indicator, flag and skip, instant feedback with explanations, and short-answer questions
- Results show a topic breakdown, areas to improve and an automatic confidence-accuracy summary. The answer review has explanations, bookmarks, filters and "redo wrong questions only"
- **Study Plan Generator**: pick past quizzes and study hours. The plan targets your weakest topics, with to-do progress, reminders, snooze and a daily check-in time
- **Smart Revision Sheets**: generate a sheet from notes, then save, search and delete it
- **Performance Dashboard**: streaks, score and confidence trend chart, past scores, and a topic-strength heatmap with study recommendations

**AI Practice & Feedback Engine** — topic search, difficulty selection and randomly generated maths questions (linear equations, triangles, fractions, quadratics, percentages, area, indices). Each question has hints, step-by-step solutions, a guided tutor, misconception detection with correction practice, streaks and a session summary.

**AI Lesson Companion** — lesson preview with a quick check, key-points highlighter, simplified slide mode (with enlarge and download) and a video generator with captions and optional voice-over.

**AI Understanding Booster** — step-by-step explainer, interactive concept link map, generated diagrams with a zoom view, and an example library with search and filters.

**Notifications, Help & Settings** — filterable notifications with unread badges, a searchable FAQ with a contact form, account management, privacy controls, notification preferences, and light/dark/system themes with adjustable text size.

Progress (quiz history, plans, sheets, streaks and settings) is saved in the browser's local storage. Use **Settings → Privacy & Security → Clear my data** or **Reset demo data** on desktop to start over.

## Tech

Plain HTML, CSS and vanilla JavaScript with no build step and no dependencies. It uses a hash router and is hosted on GitHub Pages.

```
index.html              app shell and device frame
css/styles.css          design tokens (light and dark) and components
js/icons.js             inline SVG icons
js/data.js              mock data and question generators
js/app.js               state, router and shared UI helpers
js/screens-core.js      login, home, profile, notifications, help, settings
js/screens-progress.js  Progress & Confidence System
js/screens-practice.js  Practice & Feedback Engine
js/screens-learn.js     Lesson Companion and Understanding Booster
```

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Context

Built for ST0277 Design for User Interaction at Singapore Polytechnic (DIT, Year 1). The design follows our group's sitemap, wireframes and Figma prototype, and the recommendations from our CA3 usability test report.
