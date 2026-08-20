const KANBAN_STORAGE_KEY = 'acme-flow-kanban';
const KANBAN_STORAGE_DAYS = 5;

const KANBAN_COLUMNS = ['todo', 'doing', 'done'];

let kanbanState = {
  cards: [],
  expiresAt: null
};


document.addEventListener('DOMContentLoaded', () => {
  initKanban();
});


/* =========================
   Initialization
   ========================= */

async function initKanban() {
  loadKanbanState();

  initKanbanColumns();

  renderKanban();
}


/* =========================
   Local storage
   ========================= */

function loadKanbanState() {
  const saved = localStorage.getItem(KANBAN_STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!parsed.expiresAt || Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(KANBAN_STORAGE_KEY);
      return;
    }

    kanbanState = parsed;

  } catch (error) {
    console.error('Failed to load Kanban state:', error);

    localStorage.removeItem(KANBAN_STORAGE_KEY);
  }
}


function saveKanbanState() {
  if (!kanbanState.expiresAt) {
    kanbanState.expiresAt =
      Date.now() +
      KANBAN_STORAGE_DAYS * 24 * 60 * 60 * 1000;
  }

  localStorage.setItem(
    KANBAN_STORAGE_KEY,
    JSON.stringify(kanbanState)
  );
}


/* =========================
   Column collapse
   ========================= */

function initKanbanColumns() {
  const columns = document.querySelectorAll('.kanban-column');

  columns.forEach((column) => {
    const toggle = column.querySelector(
      '.kanban-column__toggle'
    );

    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      /*
       * Don't collapse when clicking an interactive
       * element inside the header later.
       */
      if (event.target.closest('button:not(.kanban-column__toggle)')) {
        return;
      }

      const collapsed =
        column.classList.toggle(
          'kanban-column--collapsed'
        );

      toggle.setAttribute(
        'aria-expanded',
        String(!collapsed)
      );
    });
  });
}


/* =========================
   Rendering
   ========================= */

function renderKanban() {
  KANBAN_COLUMNS.forEach((columnName) => {
    renderColumn(columnName);
  });
}


function renderColumn(columnName) {
  const column = document.querySelector(
    `.kanban-column[data-column="${columnName}"]`
  );

  if (!column) return;

  const cardsContainer = column.querySelector(
    '.kanban-column__cards'
  );

  const cards = kanbanState.cards.filter(
    card => card.column === columnName
  );

  cardsContainer.innerHTML = '';

  cards.forEach((card) => {
    cardsContainer.appendChild(
      createKanbanCard(card)
    );
  });

  updateColumnSummary(column, cards);
}


/* =========================
   Card creation
   ========================= */

function createKanbanCard(card) {
  const element = document.createElement('article');

  element.className = 'kanban-card';
  element.draggable = true;

  element.dataset.cardId = card.id;

  const columnIndex =
    KANBAN_COLUMNS.indexOf(card.column);

  const isFirstColumn = columnIndex === 0;
  const isLastColumn =
    columnIndex === KANBAN_COLUMNS.length - 1;

  element.innerHTML = `
    <button
      type="button"
      class="kanban-card__arrow ${
        isFirstColumn
          ? 'kanban-card__arrow--hidden'
          : ''
      }"
      data-direction="left"
      aria-label="Move task left"
    >
      ←
    </button>

    <div class="kanban-card__content">

      <span class="kanban-card__title">
        ${escapeHtml(card.title)}
      </span>

      <span class="kanban-card__group">
        ${escapeHtml(card.group)}
      </span>

      <div class="kanban-card__stripes">

        <span
          class="kanban-card__stripe
          kanban-card__stripe--priority-${card.priority.toLowerCase()}"
        ></span>

        ${
          card.urgent
            ? `
              <span
                class="kanban-card__stripe
                kanban-card__stripe--urgent"
                title="Urgent"
              ></span>
            `
            : ''
        }

        ${
          card.overdue
            ? `
              <span
                class="kanban-card__stripe
                kanban-card__stripe--overdue"
                title="Overdue"
              ></span>
            `
            : ''
        }

      </div>

    </div>

    <button
      type="button"
      class="kanban-card__arrow ${
        isLastColumn
          ? 'kanban-card__arrow--hidden'
          : ''
      }"
      data-direction="right"
      aria-label="Move task right"
    >
      →
    </button>
  `;

  initKanbanCardEvents(element);

  return element;
}


/* =========================
   Card interactions
   ========================= */

function initKanbanCardEvents(cardElement) {

  const arrows = cardElement.querySelectorAll(
    '.kanban-card__arrow'
  );

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', (event) => {
      event.stopPropagation();

      const direction =
        arrow.dataset.direction;

      moveCardByArrow(
        cardElement.dataset.cardId,
        direction
      );
    });
  });


  cardElement.addEventListener(
    'dragstart',
    () => {
      cardElement.classList.add(
        'kanban-card--dragging'
      );

      window.__draggedKanbanCard =
        cardElement.dataset.cardId;
    }
  );


  cardElement.addEventListener(
    'dragend',
    () => {
      cardElement.classList.remove(
        'kanban-card--dragging'
      );

      window.__draggedKanbanCard = null;
    }
  );
}


/* =========================
   Arrow movement
   ========================= */

function moveCardByArrow(cardId, direction) {
  const card = kanbanState.cards.find(
    card => String(card.id) === String(cardId)
  );

  if (!card) return;

  const currentIndex =
    KANBAN_COLUMNS.indexOf(card.column);

  const newIndex =
    direction === 'right'
      ? currentIndex + 1
      : currentIndex - 1;

  if (
    newIndex < 0 ||
    newIndex >= KANBAN_COLUMNS.length
  ) {
    return;
  }

  card.column =
    KANBAN_COLUMNS[newIndex];

  saveKanbanState();

  renderKanban();
}


/* =========================
   Drag and drop
   ========================= */

document.addEventListener('dragover', (event) => {
  const cardsContainer =
    event.target.closest(
      '.kanban-column__cards'
    );

  if (!cardsContainer) {
    return;
  }

  event.preventDefault();

  cardsContainer.classList.add(
    'kanban-column__cards--drag-over'
  );
});


document.addEventListener('dragleave', (event) => {
  const cardsContainer =
    event.target.closest(
      '.kanban-column__cards'
    );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.remove(
    'kanban-column__cards--drag-over'
  );
});


document.addEventListener('drop', (event) => {
  const cardsContainer =
    event.target.closest('.kanban-column__cards');

  if (!cardsContainer) {
    if (window.__draggedKanbanCard) {
      removeKanbanCard(window.__draggedKanbanCard);
    }

    return;
  }

  event.preventDefault();

  cardsContainer.classList.remove(
    'kanban-column__cards--drag-over'
  );

  const column =
    cardsContainer.closest('.kanban-column');

  if (!column) return;

  const newColumn =
    column.dataset.column;


  // =========================
  // Existing Kanban card
  // =========================

  if (window.__draggedKanbanCard) {
    const card = kanbanState.cards.find(
      card =>
        String(card.id) ===
        String(window.__draggedKanbanCard)
    );

    if (!card) return;

    card.column = newColumn;

    saveKanbanState();
    renderKanban();

    return;
  }


  // =========================
  // Active task
  // =========================

  if (window.__draggedTaskId) {
    addTaskToKanban(
      window.__draggedTaskId,
      newColumn
    );
  }
});

function addTaskToKanban(taskId, column) {
  // Don't add the same task twice.
  const alreadyExists = kanbanState.cards.some(
    card =>
      String(card.id) === String(taskId)
  );

  if (alreadyExists) {
    return;
  }

  const taskElement =
    document.querySelector(
      `.task-card[data-task-id="${taskId}"]`
    );

  if (!taskElement) return;

  const title =
    taskElement.querySelector(
      '.task-card__title'
    )?.textContent.trim();

  const priorityBadge =
    taskElement.querySelector(
      '[class*="badge--priority-"]'
    );

  const priority =
    priorityBadge?.textContent.trim().toUpperCase()
    || 'LOW';

  const group =
    taskElement.closest('.task-group')
      ?.querySelector('.task-group__toggle h3')
      ?.textContent.trim()
    || '';

  const card = {
    id: taskId,
    title,
    group,
    priority,
    urgent: false,
    overdue: false,
    column
  };

  kanbanState.cards.push(card);

  saveKanbanState();
  renderKanban();
}


/* =========================
   Remove card
   ========================= */

function removeKanbanCard(cardId) {
  kanbanState.cards =
    kanbanState.cards.filter(
      card =>
        String(card.id) !== String(cardId)
    );

  saveKanbanState();

  renderKanban();
}


/* =========================
   Column summary
   ========================= */

function updateColumnSummary(column, cards) {
  const count =
    column.querySelector(
      '.kanban-column__count'
    );

  const summary =
    column.querySelector(
      '.kanban-column__priority-summary'
    );

  count.textContent = cards.length;

  summary.innerHTML = '';

  const priorityCounts = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  cards.forEach((card) => {
    if (priorityCounts[card.priority] !== undefined) {
      priorityCounts[card.priority]++;
    }
  });

  Object.entries(priorityCounts).forEach(
    ([priority, amount]) => {

      if (amount === 0) return;

      const wrapper =
        document.createElement('span');

      wrapper.className =
        'kanban-priority-summary';

      wrapper.innerHTML = `
        <span
          class="kanban-priority-dot
          kanban-card__stripe--priority-${priority.toLowerCase()}"
        ></span>

        <span class="kanban-priority-dot__count">
          ${amount}
        </span>
      `;

      summary.appendChild(wrapper);
    }
  );
}


/* =========================
   Utility
   ========================= */

function escapeHtml(value) {
  const div = document.createElement('div');

  div.textContent = value ?? '';

  return div.innerHTML;
}