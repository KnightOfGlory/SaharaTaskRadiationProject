/**
 * Acme Flow — Dashboard interactions
 *
 * Presentation-level behavior only. Nothing here talks to a server —
 * once the Spring Boot API exists, the TODOs below are the seams where
 * real data fetching / mutation calls should replace the mock state.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTaskGroups();
  initTaskCheckboxes();
});

/**
 * Expand / collapse a task group's task list when its header is clicked.
 */
function initTaskGroups() {
  const groups = document.querySelectorAll('.task-group');

  groups.forEach((group) => {
    const toggle = group.querySelector('.task-group__toggle');
    const list = group.querySelector('.task-list');
    if (!toggle || !list) return;

    toggle.addEventListener('click', () => {
      const isExpanded = group.classList.toggle('task-group--expanded');
      group.classList.toggle('task-group--collapsed', !isExpanded);
      toggle.setAttribute('aria-expanded', String(isExpanded));
      list.hidden = !isExpanded;

      // TODO: once groups lazily load their tasks from the API, fetch
      // and render `list`'s contents here on first expand.
    });
  });
}

/**
 * Reflect a task's checked state visually (strike-through + muted title)
 * so Task Groups, Kanban, and Calendar can eventually stay in sync as
 * the same underlying task is represented across all three views.
 */
function initTaskCheckboxes() {
  const checkboxes = document.querySelectorAll('.task-card input[type="checkbox"]');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const card = checkbox.closest('.task-card');
      if (!card) return;
      card.classList.toggle('task-card--done', checkbox.checked);

      // TODO: PATCH /api/tasks/{id} { status: 'DONE' | 'TODO' } and let
      // the Kanban + Calendar views re-render from the same response.
    });
  });
}
