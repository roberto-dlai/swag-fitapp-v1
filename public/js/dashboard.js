const Dashboard = {
  user: null,

  async init() {
    try {
      const data = await API.get('/api/users/me');
      this.user = data.user;
      document.getElementById('user-name').textContent = this.user.name;
      this.populatePreferences();
      this.setupPreferencesForm();
      this.setupCustomize();

      // Load all sections in parallel
      await Promise.all([
        WeatherWidget.load(),
        this.loadTodayWorkout(),
        WorkoutCards.load(),
        ReviewSection.load(),
      ]);
    } catch (err) {
      Notifications.error('Failed to load dashboard: ' + err.message);
    }
  },

  async loadTodayWorkout() {
    const container = document.getElementById('today-workout');
    try {
      const data = await API.get('/api/workouts/today');
      const workout = data.workout;

      // Update streak
      if (data.streak && data.streak > 0) {
        const badge = document.getElementById('streak-badge');
        badge.textContent = `\u{1F525} ${data.streak} day streak`;
        badge.classList.remove('hidden');
      }

      this.renderTodayWorkout(container, workout);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load workout: ' + err.message;
      container.appendChild(div);
    }
  },

  renderTodayWorkout(container, workout) {
    container.innerHTML = '';

    // Tips
    if (workout.tips && workout.tips.length > 0) {
      for (const tip of workout.tips) {
        const tipEl = document.createElement('div');
        tipEl.className = 'tip-item';
        tipEl.textContent = tip;
        container.appendChild(tipEl);
      }
    }

    // Indoor/outdoor badge
    if (workout.isIndoor !== undefined) {
      const badge = document.createElement('span');
      badge.className = workout.isIndoor ? 'badge badge-indoor' : 'badge badge-outdoor';
      badge.textContent = workout.isIndoor ? 'Indoor' : 'Outdoor';
      container.appendChild(badge);
    }

    // Exercise list
    if (workout.exercises && workout.exercises.length > 0) {
      const list = document.createElement('ul');
      list.className = 'exercise-list';

      for (const ex of workout.exercises) {
        const li = document.createElement('li');
        li.className = 'exercise-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'exercise-name';
        nameSpan.textContent = ex.name;

        const detailSpan = document.createElement('span');
        detailSpan.className = 'exercise-detail';
        if (ex.sets && ex.reps) {
          detailSpan.textContent = `${ex.sets} x ${ex.reps}`;
        } else if (ex.duration_min) {
          detailSpan.textContent = `${ex.duration_min} min`;
        }

        li.appendChild(nameSpan);
        li.appendChild(detailSpan);
        list.appendChild(li);
      }
      container.appendChild(list);
    } else {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No exercises planned for today.';
      container.appendChild(empty);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'workout-actions';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-success btn-sm';
    startBtn.textContent = workout.status === 'in_progress' ? 'Complete Workout' : 'Start Workout';
    startBtn.setAttribute('aria-label', 'Start or complete workout');
    startBtn.addEventListener('click', () => this.toggleWorkoutStatus(workout));

    actions.appendChild(startBtn);
    container.appendChild(actions);
  },

  async toggleWorkoutStatus(workout) {
    try {
      let newStatus;
      if (workout.status === 'planned') {
        newStatus = 'in_progress';
      } else if (workout.status === 'in_progress') {
        newStatus = 'completed';
      } else {
        return;
      }

      await API.patch(`/api/workouts/${workout.id}`, { status: newStatus });
      Notifications.success(newStatus === 'in_progress' ? 'Workout started!' : 'Workout completed!');
      this.loadTodayWorkout();
    } catch (err) {
      Notifications.error(err.message);
    }
  },

  populatePreferences() {
    if (!this.user) return;
    document.getElementById('pref-unit').value = this.user.unit_pref;
    document.getElementById('pref-goal').value = this.user.fitness_goal;
    document.getElementById('pref-level').value = this.user.fitness_level;
    document.getElementById('pref-frequency').value = this.user.weekly_frequency;
    document.getElementById('pref-location').value = this.user.location || '';
  },

  setupPreferencesForm() {
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const updates = {
          unit_pref: document.getElementById('pref-unit').value,
          fitness_goal: document.getElementById('pref-goal').value,
          fitness_level: document.getElementById('pref-level').value,
          weekly_frequency: parseInt(document.getElementById('pref-frequency').value, 10),
          location: document.getElementById('pref-location').value,
        };

        const data = await API.patch('/api/users/me', updates);
        this.user = data.user;
        Notifications.success('Preferences saved!');
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },

  setupCustomize() {
    const modal = document.getElementById('customize-modal');
    const form = document.getElementById('customize-form');

    document.getElementById('customize-btn').addEventListener('click', () => {
      modal.classList.remove('hidden');
    });

    document.getElementById('customize-cancel').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const workoutType = document.getElementById('custom-type').value;
      try {
        await API.patch('/api/workouts/today', { workout_type: workoutType });
        modal.classList.add('hidden');
        Notifications.success('Workout customized!');
        this.loadTodayWorkout();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },
};
