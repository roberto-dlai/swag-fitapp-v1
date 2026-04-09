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
      const userLocation = userData.user.location || '';
      const unitPref = userData.user.unit_pref;

      this.render(container, completed, firstName, userLocation, unitPref);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load history: ' + err.message;
      container.appendChild(div);
    }
  },

  getDominantCategory(exercises) {
    if (!exercises || exercises.length === 0) return null;
    const counts = {};
    for (const ex of exercises) {
      const cat = ex.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  },

  render(container, workouts, firstName, userLocation, unitPref) {
    container.innerHTML = '';

    if (!workouts || workouts.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No completed workouts yet. Complete your first workout!';
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'plan-grid';

    for (const workout of workouts) {
      const card = document.createElement('div');
      card.className = 'plan-card completed';
      card.style.position = 'relative';

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

      // Date
      const date = new Date(workout.date);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = document.createElement('div');
      dayName.className = 'day-name';
      dayName.textContent = dayNames[date.getUTCDay()];

      const dayDate = document.createElement('div');
      dayDate.className = 'day-date';
      dayDate.textContent = workout.date.split('T')[0];

      card.appendChild(dayName);
      card.appendChild(dayDate);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'plan-card-name';
      nameEl.textContent = firstName;
      card.appendChild(nameEl);

      // Workout category badge (read from workout.type)
      const typeLabels = {
        cardio: 'Cardio',
        strength: 'Strength',
        endurance: 'Endurance',
      };
      const badge = document.createElement('span');
      badge.className = 'badge badge-completed';
      badge.textContent = typeLabels[workout.type] || 'Cardio';
      card.appendChild(badge);

      // Duration (round to nearest valid dropdown value: 0.5, 1, 1.5, 2, 2.5)
      if (workout.duration_min) {
        const durEl = document.createElement('div');
        durEl.className = 'plan-card-weather';
        const rawHrs = workout.duration_min / 60;
        const hrs = Math.round(rawHrs * 2) / 2; // round to nearest 0.5
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
