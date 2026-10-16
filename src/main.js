const toast = document.querySelector('#toast');
let toastTimer;

const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('#sidebar-toggle');
const closeMobileSidebar = () => {
  sidebar.classList.remove('is-expanded');
  sidebarToggle.setAttribute('aria-expanded', 'false');
  sidebarToggle.setAttribute('aria-label', 'Open navigation menu');
};
sidebarToggle.addEventListener('click', () => {
  const opening = !sidebar.classList.contains('is-expanded');
  sidebar.classList.toggle('is-expanded', opening);
  sidebarToggle.setAttribute('aria-expanded', String(opening));
  sidebarToggle.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    closeMobileSidebar();
    showToast(`${button.textContent.trim()} selected`);
  });
});

const closeFilterMenus = () => {
  document.querySelectorAll('.filter-menu').forEach((menu) => { menu.hidden = true; });
  document.querySelectorAll('.filter').forEach((button) => button.setAttribute('aria-expanded', 'false'));
};
const activeFilters = {};
const applyCourseFilters = () => {
  document.querySelectorAll('.course-card').forEach((card) => {
    const visible = Object.entries(activeFilters).every(([name, value]) => !value || card.dataset[name.toLowerCase()] === value);
    card.classList.toggle('is-filtered-out', !visible);
  });
};

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const menu = button.nextElementSibling;
    const opening = menu.hidden;
    closeFilterMenus();
    menu.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('is-active'));
    if (opening) button.classList.add('is-active');
  });
});

document.querySelectorAll('.filter-menu button').forEach((option) => {
  option.addEventListener('click', () => {
    const group = option.closest('.filter-group');
    const filter = group.querySelector('.filter');
    filter.querySelector('.filter-label').textContent = option.textContent;
    filter.classList.add('is-active');
    activeFilters[filter.dataset.filter] = option.textContent;
    applyCourseFilters();
    closeFilterMenus();
    showToast(`${filter.dataset.filter}: ${option.textContent}`);
  });
});

document.querySelector('#clear-filters').addEventListener('click', () => {
  Object.keys(activeFilters).forEach((key) => delete activeFilters[key]);
  document.querySelectorAll('.filter').forEach((filter) => {
    filter.querySelector('.filter-label').textContent = filter.dataset.filter;
    filter.classList.remove('is-active');
  });
  applyCourseFilters();
  showToast('All course filters cleared');
});

document.addEventListener('click', closeFilterMenus);

const searchToggle = document.querySelector('#search-toggle');
const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#course-search');

searchToggle.addEventListener('click', () => {
  const opening = searchPanel.hidden;
  searchPanel.hidden = !opening;
  searchToggle.setAttribute('aria-expanded', String(opening));
  if (opening) searchInput.focus();
});

searchInput.addEventListener('input', (event) => {
  const term = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.course-card').forEach((card) => {
    card.classList.toggle('is-search-filtered', Boolean(term) && !card.textContent.toLowerCase().includes(term));
  });
});

document.querySelector('#notification-toggle').addEventListener('click', (event) => {
  event.currentTarget.querySelector('span').classList.toggle('read');
  showToast('You are all caught up — no new notifications.');
});

const courseDialog = document.querySelector('#course-dialog');
const dialogTitle = document.querySelector('#dialog-course-title');
const dialogInfo = document.querySelector('#dialog-course-info');
document.querySelectorAll('.course-arrow').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const card = event.currentTarget.closest('.course-card');
    dialogTitle.textContent = card.querySelector('h3').textContent;
    dialogInfo.textContent = `${card.querySelector('p').textContent} · Created by ${card.querySelector('.created b').textContent}`;
    courseDialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => courseDialog.close());
courseDialog.addEventListener('click', (event) => { if (event.target === courseDialog) courseDialog.close(); });

const tasksToggle = document.querySelector('#tasks-toggle');
const tasksList = document.querySelector('#tasks-list');
tasksToggle.addEventListener('click', () => {
  const opening = tasksList.hidden;
  tasksList.hidden = !opening;
  tasksToggle.setAttribute('aria-expanded', String(opening));
});
document.querySelectorAll('.tasks-list button').forEach((task) => task.addEventListener('click', () => showToast(`${task.querySelector('b').textContent} added to your focus list`)));

const monthTitle = document.querySelector('#calendar-month');
const dateGrid = document.querySelector('#date-grid');
let displayedMonth = new Date(2025, 11, 1);
let selectedDate = new Date(2025, 11, 15);
const eventDates = new Set(['2025-12-15', '2025-12-17', '2025-12-19']);
const formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  monthTitle.textContent = displayedMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  dateGrid.replaceChildren();
  for (let cell = 0; cell < 35; cell += 1) {
    const date = new Date(year, month, cell - firstDay + 1);
    const outsideMonth = date.getMonth() !== month;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `calendar-date${outsideMonth ? ' muted' : ''}`;
    button.textContent = date.getDate();
    button.setAttribute('aria-label', date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    if (eventDates.has(formatKey(date))) button.classList.add('highlight');
    if (formatKey(date) === formatKey(selectedDate)) {
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
    }
    button.addEventListener('click', () => {
      selectedDate = date;
      renderCalendar();
      showToast(`${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} selected`);
    });
    dateGrid.append(button);
  }
}

document.querySelector('#previous-month').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
});
document.querySelector('#next-month').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
});
renderCalendar();

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchPanel.hidden = false;
    searchToggle.setAttribute('aria-expanded', 'true');
    searchInput.focus();
  }
  if (event.key === 'Escape') {
    searchPanel.hidden = true;
    searchToggle.setAttribute('aria-expanded', 'false');
    closeFilterMenus();
    closeMobileSidebar();
  }
});

document.querySelector('.content').addEventListener('click', () => {
  if (window.matchMedia('(max-width: 780px)').matches) closeMobileSidebar();
});

window.addEventListener('load', () => {
  const loader = document.querySelector('#app-loader');
  window.setTimeout(() => loader.classList.add('done'), 220);
});
