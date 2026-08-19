/**
 * Acme Flow — Task Creation interactions
 *
 * Presentation-level behavior only. The form does not talk to a server yet;
 * `handleSubmit` below is the seam where a real
 * `POST /api/task-groups/{groupId}/tasks` call will eventually go.
 */

document.addEventListener('DOMContentLoaded', () => {
  initFormattingToolbar();
  initChecklist();
  initPrioritySelect();
  initDueDateToggle();
  initAssignees();
  initBackButton();
  initSubmit();
});

/* ==========================================================================
   Description formatting toolbar (Bold / Italic / Strikethrough / Code)
   Wraps the current textarea selection with the matching markdown-style
   marker — a lightweight stand-in until a real rich-text editor is wired up.
   ========================================================================== */

function initFormattingToolbar() {
  const textarea = document.getElementById('task-description');
  const markers = { bold: '**', italic: '_', strikethrough: '~~', code: '`' };

  document.querySelectorAll('.format-btn[data-format]').forEach((button) => {
    button.addEventListener('click', () => {
      const marker = markers[button.dataset.format];
      if (!textarea || !marker) return;

      const { selectionStart: start, selectionEnd: end, value } = textarea;
      const selected = value.slice(start, end) || 'text';
      const before = value.slice(0, start);
      const after = value.slice(end);

      textarea.value = `${before}${marker}${selected}${marker}${after}`;
      textarea.focus();
      textarea.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  });
}

/* ==========================================================================
   Checklist — toggled on from the description toolbar, items can be
   added and removed freely.
   ========================================================================== */

function initChecklist() {
  const toggleBtn = document.getElementById('checklist-toggle');
  const list = document.getElementById('checklist-items');
  if (!toggleBtn || !list) return;

  let itemCount = 0;

  const addItem = (text = '') => {
    itemCount += 1;
    const id = `checklist-item-${itemCount}`;

    const li = document.createElement('li');
    li.className = 'checklist-item';
    li.innerHTML = `
      <label class="checkbox-field" aria-label="Mark checklist item complete">
        <input type="checkbox" name="${id}-done">
        <span class="checkbox-visual" aria-hidden="true"></span>
      </label>
      <input type="text" class="text-input" name="${id}-text" placeholder="Checklist item" aria-label="Checklist item text" value="${text}">
      <button type="button" class="checklist-item__remove" aria-label="Remove checklist item">
        <svg class="icon icon--sm" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    `;

    li.querySelector('.checklist-item__remove').addEventListener('click', () => {
      li.remove();
    });

    list.insertBefore(li, list.querySelector('.checklist-add'));
    return li;
  };

  const addRow = document.createElement('button');
  addRow.type = 'button';
  addRow.className = 'checklist-add';
  addRow.innerHTML = `
    <svg class="icon icon--sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    Add item
  `;
  addRow.addEventListener('click', () => {
    const item = addItem();
    item.querySelector('.text-input').focus();
  });
  list.appendChild(addRow);

  toggleBtn.addEventListener('click', () => {
    const isHidden = list.hidden;
    list.hidden = !isHidden;
    toggleBtn.setAttribute('aria-expanded', String(isHidden));

    // Seed a first empty row the first time the checklist is revealed.
    if (isHidden && itemCount === 0) {
      const item = addItem();
      item.querySelector('.text-input').focus();
    }
  });
}

/* ==========================================================================
   Priority select — a small custom dropdown plus an "escalate" shortcut
   that steps to the next priority level up.
   ========================================================================== */

function initPrioritySelect() {
  const levels = ['Low Priority', 'Normal Priority', 'High Priority', 'Urgent Priority'];
  const valueEl = document.querySelector('.priority-select__value');
  const menuBtn = document.getElementById('priority-menu-btn');
  const [, escalateBtn] = document.querySelectorAll('.priority-select__btn');
  if (!valueEl || !menuBtn) return;

  let currentIndex = levels.indexOf(valueEl.textContent.trim());
  if (currentIndex === -1) currentIndex = 1;

  let menu = null;

  const closeMenu = () => {
    if (!menu) return;
    menu.remove();
    menu = null;
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  const setLevel = (index) => {
    currentIndex = Math.min(Math.max(index, 0), levels.length - 1);
    valueEl.textContent = levels[currentIndex];
  };

  const openMenu = () => {
    menu = document.createElement('div');
    menu.className = 'card';
    menu.setAttribute('role', 'listbox');
    menu.style.position = 'absolute';
    menu.style.zIndex = '10';
    menu.style.marginTop = '4px';
    menu.style.padding = '4px';
    menu.style.minWidth = '180px';

    levels.forEach((level, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'btn btn--ghost';
      option.style.width = '100%';
      option.style.justifyContent = 'flex-start';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(index === currentIndex));
      option.textContent = level;
      option.addEventListener('click', () => {
        setLevel(index);
        closeMenu();
      });
      menu.appendChild(option);
    });

    const wrapper = menuBtn.closest('.priority-select');
    wrapper.style.position = 'relative';
    wrapper.appendChild(menu);
    menuBtn.setAttribute('aria-expanded', 'true');
  };

  menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menu) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (escalateBtn) {
    escalateBtn.addEventListener('click', () => setLevel(currentIndex + 1));
  }

  document.addEventListener('click', (event) => {
    if (menu && !event.target.closest('.priority-select')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu) {
      closeMenu();
      menuBtn.focus();
    }
  });
}

/* ==========================================================================
   Due date & time — disable the date/time pickers while the checkbox
   is unchecked, matching what the Figma implies about their relationship.
   ========================================================================== */

function initDueDateToggle() {
  const toggle = document.getElementById('due-date-toggle');
  const controls = [document.getElementById('due-date-btn'), document.getElementById('due-time-btn')];
  if (!toggle) return;

  const applyState = () => {
    controls.forEach((btn) => {
      if (!btn) return;
      btn.disabled = !toggle.checked;
      btn.style.opacity = toggle.checked ? '1' : '0.5';
      btn.style.pointerEvents = toggle.checked ? 'auto' : 'none';
    });
  };

  toggle.addEventListener('change', applyState);
  applyState();
}

/* ==========================================================================
   Assignees — remove existing chips, add new ones by typing a name
   and pressing Enter.
   ========================================================================== */

function initAssignees() {
  const field = document.getElementById('assignee-field');
  const input = document.getElementById('assignee-input');
  if (!field || !input) return;

  field.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.assignee-chip__remove');
    if (!removeBtn) return;
    removeBtn.closest('.assignee-chip')?.remove();
  });

  const initials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !input.value.trim()) return;
    event.preventDefault();

    const name = input.value.trim();
    const chip = document.createElement('span');
    chip.className = 'assignee-chip';
    chip.dataset.assigneeId = name.toLowerCase().replace(/\s+/g, '-');
    chip.innerHTML = `
      <span class="avatar avatar--xs" aria-hidden="true">${initials(name)}</span>
      ${name}
      <button type="button" class="assignee-chip__remove" aria-label="Remove ${name} as assignee">
        <svg class="icon" viewBox="0 0 24 24" style="width:10px;height:10px;stroke-width:2.6;"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    `;

    field.insertBefore(chip, input);
    input.value = '';
  });
}

/* ==========================================================================
   Back — returns to the previous step (group selection) when one exists,
   otherwise falls back to the dashboard.
   ========================================================================== */

function initBackButton() {
  const backBtn = document.getElementById('back-btn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
}

/* ==========================================================================
   Submit — gathers the form into a plain object shaped like the future
   API payload, then hands off back to the dashboard.
   ========================================================================== */

function initSubmit() {
  const form = document.querySelector('.task-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const checklistItems = Array.from(document.querySelectorAll('.checklist-item')).map((item) => ({
      text: item.querySelector('.text-input').value,
      done: item.querySelector('input[type="checkbox"]').checked,
    }));

    const assignees = Array.from(document.querySelectorAll('.assignee-chip')).map(
      (chip) => chip.dataset.assigneeId
    );

    const payload = {
      title: document.getElementById('task-name').value,
      description: document.getElementById('task-description').value,
      checklist: checklistItems,
      priority: document.querySelector('.priority-select__value').textContent.trim(),
      dueDateEnabled: document.getElementById('due-date-toggle').checked,
      dueDate: document.getElementById('due-date-btn').textContent.trim(),
      dueTime: document.getElementById('due-time-btn').textContent.trim(),
      urgent: document.getElementById('urgent-toggle').checked,
      assignees,
      taskGroup: 'Sprint 4 Deliverables',
    };

    // TODO: POST payload to /api/task-groups/{groupId}/tasks once the
    // Spring Boot backend exists, then let the Task Groups, Calendar and
    // Kanban views on the dashboard re-render from the same response.
    console.log('Create Task payload', payload);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24"><path d="M20 6.5 9.5 17 4 11.5"/></svg>
      Created
    `;

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  });
}
