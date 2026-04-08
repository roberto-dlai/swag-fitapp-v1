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

    if (workout.status === 'completed') {
      const completedBadge = document.createElement('span');
      completedBadge.className = 'badge badge-completed';
      completedBadge.textContent = 'Completed';
      actions.appendChild(completedBadge);
    } else {
      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn btn-success btn-sm';
      completeBtn.textContent = 'Workout Complete';
      completeBtn.setAttribute('aria-label', 'Mark workout as complete');
      completeBtn.addEventListener('click', () => this.markCompleted(workout));
      actions.appendChild(completeBtn);
    }

    container.appendChild(actions);
  },

  async markCompleted(workout) {
    try {
      await API.patch(`/api/workouts/${workout.id}`, { status: 'completed' });
      Notifications.success('Workout completed!');
      this.loadTodayWorkout();
      WorkoutCards.load();
    } catch (err) {
      Notifications.error(err.message);
    }
  },

  populatePreferences() {
    if (!this.user) return;
    document.getElementById('pref-unit').value = this.user.unit_pref;
    document.getElementById('pref-location').value = this.user.location || '';
  },

  setupPreferencesForm() {
    const savePrefs = async () => {
      try {
        const updates = {
          unit_pref: document.getElementById('pref-unit').value,
          location: document.getElementById('pref-location').value,
        };

        const data = await API.patch('/api/users/me', updates);
        this.user = data.user;
        WeatherWidget.load();
        WorkoutCards.load();
      } catch (err) {
        Notifications.error(err.message);
      }
    };

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await savePrefs();
    });

    // Auto-save when unit changes
    document.getElementById('pref-unit').addEventListener('change', savePrefs);
  },

  setupCustomize() {
    const select = document.getElementById('workout-type-select');

    // Set initial value from user's fitness goal
    if (this.user) {
      select.value = this.user.fitness_goal;
    }

    select.addEventListener('change', async () => {
      try {
        await API.patch('/api/workouts/today', { workout_type: select.value });
        this.loadTodayWorkout();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },
};
