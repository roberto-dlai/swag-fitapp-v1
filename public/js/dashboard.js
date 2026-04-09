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
      this.setupCompleteButton();

      // Load all sections in parallel
      await Promise.all([
        WeatherWidget.load(),
        this.loadTodayWorkout(),
        WorkoutCards.load(),
        this.loadTotalWorkouts(),
        ReviewSection.load(),
      ]);
    } catch (err) {
      Notifications.error('Failed to load dashboard: ' + err.message);
    }
  },

  async loadTotalWorkouts() {
    const container = document.getElementById('total-workouts');
    try {
      const data = await API.get('/api/workouts/history');
      const completed = data.workouts.filter(w => w.status === 'completed');
      container.innerHTML = '';

      const count = document.createElement('div');
      count.className = 'total-workouts-count';
      count.textContent = completed.length;
      container.appendChild(count);

      const label = document.createElement('div');
      label.className = 'total-workouts-label';
      label.textContent = 'completed';
      container.appendChild(label);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load';
      container.appendChild(div);
    }
  },

  async loadTodayWorkout() {
    const container = document.getElementById('today-workout');
    try {
      const data = await API.get('/api/workouts/today');
      const workout = data.workout;

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


  },

  setupCompleteButton() {
    const dateInput = document.getElementById('workout-date');
    const completeBtn = document.getElementById('complete-workout-btn');

    // Default to today
    dateInput.value = new Date().toISOString().split('T')[0];

    completeBtn.addEventListener('click', async () => {
      const selectedDate = dateInput.value;
      if (!selectedDate) {
        Notifications.error('Please select a date');
        return;
      }

      const workoutType = document.getElementById('workout-type-select').value;
      const durationMin = parseInt(document.getElementById('workout-duration').value, 10);
      const typeLabels = { weight_loss: 'cardio', strength: 'strength', endurance: 'endurance' };
      const categoryName = typeLabels[workoutType] || 'cardio';

      const location = document.getElementById('workout-location').value;

      try {
        await API.post('/api/workouts', {
          date: selectedDate,
          type: categoryName,
          status: 'completed',
          duration_min: durationMin,
          location: location,
        });

        WorkoutCards.load();
        this.loadTotalWorkouts();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },

  populatePreferences() {
    if (!this.user) return;
    document.getElementById('pref-unit').value = this.user.unit_pref;
    const locationSelect = document.getElementById('workout-location');
    const validCities = Array.from(locationSelect.options).map(o => o.value);
    locationSelect.value = validCities.includes(this.user.location) ? this.user.location : 'New York';
  },

  setupPreferencesForm() {
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const updates = {
          unit_pref: document.getElementById('pref-unit').value,
        };

        const data = await API.patch('/api/users/me', updates);
        this.user = data.user;
        WeatherWidget.load();
        WorkoutCards.load();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },

  setupCustomize() {
    const select = document.getElementById('workout-type-select');

    select.value = 'weight_loss';

    select.addEventListener('change', async () => {
      try {
        await API.patch('/api/workouts/today', { workout_type: select.value });
        this.loadTodayWorkout();
      } catch (err) {
        Notifications.error(err.message);
      }
    });

    // Location change updates user profile and refreshes weather
    document.getElementById('workout-location').addEventListener('change', async () => {
      try {
        const location = document.getElementById('workout-location').value;
        const data = await API.patch('/api/users/me', { location });
        this.user = data.user;
        WeatherWidget.load();
        WorkoutCards.load();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },
};
