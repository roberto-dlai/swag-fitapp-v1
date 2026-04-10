const WorkoutCards = {
  container: null,
  delegationAttached: false,

  /**
   * Render recent workouts. If `workouts` is provided, skip the fetch;
   * otherwise fetch history and render. The caller (Dashboard) can pass
   * pre-fetched data to avoid duplicate requests.
   */
  async load(workouts) {
    this.container = document.getElementById('weekly-plan');
    try {
      if (!workouts) {
        const historyData = await API.get('/api/workouts/history');
        workouts = historyData.workouts;
      }

      const completed = workouts
        .slice(0, 7)
        .reverse();

      const firstName = (Dashboard.user?.name || '').split(' ')[0];

      this.render(this.container, completed, firstName);
      this.attachDelegation();
    } catch (err) {
      this.container.innerHTML = '';
      this.container.appendChild(createEl('div', 'error-state', 'Failed to load history: ' + err.message));
    }
  },

  // Attach a single click listener on the grid container. Delete buttons
  // carry the workout id as a data attribute.
  attachDelegation() {
    if (this.delegationAttached) return;
    this.delegationAttached = true;
    this.container.addEventListener('click', async (e) => {
      const btn = e.target.closest('.card-delete-btn');
      if (!btn) return;
      e.stopPropagation();
      const workoutId = btn.dataset.workoutId;
      if (!workoutId) return;
      try {
        await API.delete(`/api/workouts/${workoutId}`);
        Dashboard.refreshWorkouts();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },

  render(container, workouts, firstName) {
    container.innerHTML = '';

    if (!workouts || workouts.length === 0) {
      container.appendChild(createEl('div', 'empty-state', 'No completed workouts yet. Complete your first workout!'));
      return;
    }

    const grid = createEl('div', 'plan-grid');

    for (const workout of workouts) {
      grid.appendChild(this.buildCard(workout, firstName));
    }

    container.appendChild(grid);
  },

  buildCard(workout, firstName) {
    const card = createEl('div', 'plan-card completed');

    const deleteBtn = createEl('button', 'card-delete-btn', '\u00d7');
    deleteBtn.setAttribute('aria-label', 'Delete workout');
    deleteBtn.dataset.workoutId = workout.id;
    card.appendChild(deleteBtn);

    card.appendChild(createEl('div', 'day-name', dayNameForDate(workout.date)));
    card.appendChild(createEl('div', 'day-date', workout.date.split('T')[0]));
    card.appendChild(createEl('div', 'plan-card-name', firstName));
    card.appendChild(createEl('span', 'badge badge-completed', workoutTypeLabel(workout.type)));

    if (workout.duration_min) {
      card.appendChild(createEl('div', 'plan-card-weather', formatDuration(workout.duration_min)));
    }

    if (workout.location) {
      card.appendChild(createEl('div', 'plan-card-location', workout.location));
    }

    return card;
  },
};
