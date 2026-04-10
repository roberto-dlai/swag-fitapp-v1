const Dashboard = {
  user: null,

  async init() {
    try {
      const data = await API.get('/api/users/me');
      this.user = data.user;
      document.getElementById('user-name').textContent = this.user.name;

      this.populatePreferences();
      this.setupPreferencesForm();
      this.setupAddWorkoutButton();
      this.setupLocationChange();
      this.resetWorkoutTypeDefault();

      // Load all sections in parallel
      await Promise.all([
        WeatherWidget.load(),
        WorkoutCards.load(),
        this.loadTotalWorkouts(),
        ReviewSection.load(),
      ]);
    } catch (err) {
      Notifications.error('Failed to load dashboard: ' + err.message);
    }
  },

  // === Data Loading ===

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

  // === Form Handlers ===

  resetWorkoutTypeDefault() {
    document.getElementById('workout-type-select').value = 'weight_loss';
  },

  setupAddWorkoutButton() {
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
          location,
        });

        WorkoutCards.load();
        this.loadTotalWorkouts();
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },

  setupLocationChange() {
    document.getElementById('workout-location').addEventListener('change', async () => {
      try {
        const location = document.getElementById('workout-location').value;
        const data = await API.patch('/api/users/me', { location });
        this.user = data.user;
        WeatherWidget.load();
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
};
