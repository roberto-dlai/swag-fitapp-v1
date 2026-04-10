const WorkoutCards = {
  async load() {
    const container = document.getElementById('weekly-plan');
    try {
      const [historyData, userData] = await Promise.all([
        API.get('/api/workouts/history'),
        API.get('/api/users/me'),
      ]);

      const completed = historyData.workouts
        .filter(w => w.status === 'completed')
        .slice(0, 7)
        .reverse();

      const firstName = userData.user.name.split(' ')[0];

      this.render(container, completed, firstName);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load history: ' + err.message;
      container.appendChild(div);
    }
  },

  render(container, workouts, firstName) {
    container.innerHTML = '';

    if (!workouts || workouts.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No completed workouts yet. Complete your first workout!';
      container.appendChild(empty);
      return;
    }

    const typeLabels = {
      cardio: 'Cardio',
      strength: 'Strength',
      endurance: 'Endurance',
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const grid = document.createElement('div');
    grid.className = 'plan-grid';

    for (const workout of workouts) {
      const card = document.createElement('div');
      card.className = 'plan-card completed';

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'card-delete-btn';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.setAttribute('aria-label', 'Delete workout');
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await API.delete(`/api/workouts/${workout.id}`);
          this.load();
          Dashboard.loadTotalWorkouts();
        } catch (err) {
          Notifications.error(err.message);
        }
      });
      card.appendChild(deleteBtn);

      // Day name + date
      const date = new Date(workout.date);
      const dayName = document.createElement('div');
      dayName.className = 'day-name';
      dayName.textContent = dayNames[date.getUTCDay()];
      card.appendChild(dayName);

      const dayDate = document.createElement('div');
      dayDate.className = 'day-date';
      dayDate.textContent = workout.date.split('T')[0];
      card.appendChild(dayDate);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'plan-card-name';
      nameEl.textContent = firstName;
      card.appendChild(nameEl);

      // Workout category badge
      const badge = document.createElement('span');
      badge.className = 'badge badge-completed';
      badge.textContent = typeLabels[workout.type] || 'Cardio';
      card.appendChild(badge);

      // Duration (round to nearest 0.5, clamp to valid range)
      if (workout.duration_min) {
        const durEl = document.createElement('div');
        durEl.className = 'plan-card-weather';
        const hrs = Math.round((workout.duration_min / 60) * 2) / 2;
        const clamped = Math.max(0.5, Math.min(2.5, hrs));
        durEl.textContent = clamped === 1 ? '1 hr' : `${clamped} hrs`;
        card.appendChild(durEl);
      }

      // City
      if (workout.location) {
        const locEl = document.createElement('div');
        locEl.className = 'plan-card-location';
        locEl.textContent = workout.location;
        card.appendChild(locEl);
      }

      grid.appendChild(card);
    }

    container.appendChild(grid);
  },
};
