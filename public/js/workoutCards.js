const WorkoutCards = {
  async load() {
    const container = document.getElementById('weekly-plan');
    try {
      const data = await API.get('/api/workouts/plan');
      this.render(container, data.plan);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load plan: ' + err.message;
      container.appendChild(div);
    }
  },

  render(container, plan) {
    container.innerHTML = '';

    if (!plan || plan.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No workout plan available.';
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'plan-grid';

    for (const day of plan) {
      const card = document.createElement('div');
      card.className = 'plan-card' + (day.type === 'rest' ? ' rest' : '');

      const dayName = document.createElement('div');
      dayName.className = 'day-name';
      dayName.textContent = day.day;

      const dayDate = document.createElement('div');
      dayDate.className = 'day-date';
      dayDate.textContent = day.date || '';

      card.appendChild(dayName);
      card.appendChild(dayDate);

      if (day.type === 'rest') {
        const badge = document.createElement('span');
        badge.className = 'badge badge-rest';
        badge.textContent = 'REST';
        card.appendChild(badge);
      } else {
        const count = document.createElement('div');
        count.className = 'exercise-count';
        count.textContent = day.exercises ? day.exercises.length : 0;

        const label = document.createElement('div');
        label.className = 'exercise-label';
        label.textContent = 'exercises';

        const duration = document.createElement('div');
        duration.className = 'duration';
        duration.textContent = day.duration_min ? `${day.duration_min} min` : '';

        // Indoor/outdoor badge
        const badge = document.createElement('span');
        badge.className = day.isIndoor ? 'badge badge-indoor' : 'badge badge-outdoor';
        badge.textContent = day.isIndoor ? 'Indoor' : 'Outdoor';

        card.appendChild(count);
        card.appendChild(label);
        card.appendChild(duration);
        card.appendChild(badge);
      }

      grid.appendChild(card);
    }

    container.appendChild(grid);
  },
};
