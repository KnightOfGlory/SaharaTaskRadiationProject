# Acme Flow — Frontend

Static HTML/CSS/JS implementation of the Dashboard and Task Creation screens,
built from the Figma reference. No build step — open the HTML files directly
or serve the folder with any static file server.

## Running it

```bash
# from this folder
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

Opening `index.html` / `task-creation.html` directly by double-clicking also
works; a local server just avoids the Google Fonts request being blocked by
some browsers' file:// CORS rules.

## Structure

```
frontend/
├── index.html            Dashboard: header, Active Task Groups, Kanban, Calendar
├── task-creation.html    Step 2 of the task creation flow ("Task Details")
├── css/
│   ├── global.css         Design tokens + shared components (buttons, cards,
│   │                      badges, checkboxes, avatars, inputs, dropdowns)
│   ├── dashboard.css       Dashboard-only layout and components
│   └── task-creation.css   Task Creation-only layout and components
├── js/
│   ├── dashboard.js        Expand/collapse task groups, task checkbox state
│   └── task-creation.js    Checklist, priority menu, due-date toggle,
│                            assignees, formatting toolbar, submit
└── assets/icons/           (reserved — icons are inlined as SVG in the HTML
                             so they can be recolored per state via CSS)
```

## Design system

All tokens (color, radius, shadow, spacing, type scale) live in
`css/global.css` under `:root`. Both pages share the same button, card,
badge, checkbox, avatar, and form-input styles from that file so the two
screens read as one product.

## Notes for backend integration

- Task cards carry `data-task-id`; task groups carry `data-group-id`; Kanban
  columns carry `data-status`; calendar events carry `data-event-id`. These
  are the hooks a future data layer (and drag-and-drop) can bind to.
- `js/task-creation.js`'s `initSubmit()` builds the exact payload shape the
  form represents — swap the `console.log` + redirect for a
  `POST /api/task-groups/{groupId}/tasks` call once Spring Boot is live.
- `js/dashboard.js` has `TODO` comments marking where group-expand and
  checkbox-toggle should eventually call the REST API instead of only
  updating local DOM state.
- Nothing in either JS file talks to a database, handles auth, or performs
  business logic — by design, per the current scope.
