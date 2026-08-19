document.addEventListener('DOMContentLoaded', async () => {
  await loadTaskGroups();

  initTaskGroups();
  initTaskCheckboxes();
});

/**
 * Fetch task groups from the Spring Boot API
 * and render them into the dashboard.
 */
async function loadTaskGroups() {
  try {
    const response = await fetch('/api/task-groups');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const groups = await response.json();

    const container = document.querySelector('.task-groups');
    if (!container) return;

    // Remove the hardcoded task groups,
    // but keep the section header.
    container.querySelectorAll('.task-group').forEach(group => {
      group.remove();
    });

    groups.forEach((group) => {
      const groupElement = document.createElement('article');

      const completedTasks = group.tasks.filter(
        task => task.status === 'DONE'
      ).length;

      const totalTasks = group.tasks.length;

      groupElement.className = 'task-group task-group--expanded';
      groupElement.dataset.groupId = group.id;

      groupElement.innerHTML = `
    <div class="task-group__header">
      <button
        type="button"
        class="task-group__toggle"
        aria-expanded="true"
        aria-controls="group-${group.id}-list"
      >
        <svg class="icon task-group__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6"/>
        </svg>

        <h3>${group.name}</h3>

        <span class="badge badge--progress">
          ${completedTasks} of ${totalTasks} completed
        </span>
      </button>

      <button
        type="button"
        class="icon-button-ghost"
        aria-label="More options for ${group.name}"
      >
        <svg class="icon icon--sm" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.4"/>
          <circle cx="12" cy="12" r="1.4"/>
          <circle cx="12" cy="19" r="1.4"/>
        </svg>
      </button>
    </div>

    <div
      class="task-list"
      id="group-${group.id}-list"
    >
      ${group.tasks.map(task => `
        <article
          class="task-card ${task.status === 'DONE' ? 'task-card--done' : ''}"
          data-task-id="${task.id}"
        >
          <label
            class="task-card__checkbox checkbox-field"
            aria-label="Mark '${task.title}' complete"
          >
            <input
              type="checkbox"
              name="task-${task.id}-done"
              ${task.status === 'DONE' ? 'checked' : ''}
            >
            <span class="checkbox-visual" aria-hidden="true"></span>
          </label>

          <span class="task-card__title">
            ${task.title}
          </span>

          <span class="badge badge--priority-${task.priority.toLowerCase()}">
            ${task.priority}
          </span>
        </article>
      `).join('')}
    </div>
  `;

      container.appendChild(groupElement);
    });

  } catch (error) {
    console.error('Failed to load task groups:', error);
  }
}

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

      group.classList.toggle(
        'task-group--collapsed',
        !isExpanded
      );

      toggle.setAttribute(
        'aria-expanded',
        String(isExpanded)
      );

      list.hidden = !isExpanded;
    });
  });
}

/**
 * Reflect a task's checked state visually.
 */
function initTaskCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '.task-card input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      const card = checkbox.closest('.task-card');
      if (!card) return;

      const taskId = card.dataset.taskId;
      const newStatus = checkbox.checked ? 'DONE' : 'TODO';

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.text();
        console.log(result);





        // Only update the UI after the server accepted the change.
        card.classList.toggle(
          'task-card--done',
          checkbox.checked
        );

        const badge = card.closest('.task-group').querySelector('.badge--progress');

        if (badge) {
          const match = badge.textContent.match(/(\d+) of (\d+) completed/);

          if (match) {
            let completed = Number(match[1]);
            const total = Number(match[2]);

            completed += checkbox.checked ? 1 : -1;

            badge.textContent = `${completed} of ${total} completed`;
            if (completed === total) {
              badge.classList.add('badge--complete');
            } else {
              badge.classList.remove('badge--complete');
            }
          }
        }

      } catch (error) {
        console.error('Failed to update task:', error);

        // Revert checkbox if the server update failed.
        checkbox.checked = !checkbox.checked;

      }
    });
  });
}