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
        this.refreshWorkouts(),
        ReviewSection.load(),
      ]);
    } catch (err) {
      Notifications.error('Failed to load dashboard: ' + err.message);
    }
  },

  // === Data Loading ===

  /**
   * Single history fetch shared by WorkoutCards and the Total Workouts counter.
   */
  async refreshWorkouts() {
    try {
      const data = await API.get('/api/workouts/history');
      const workouts = data.workouts || [];
      WorkoutCards.load(workouts);
      this.renderTotalWorkouts(workouts);
    } catch (err) {
      const wcContainer = document.getElementById('weekly-plan');
      const tcContainer = document.getElementById('total-workouts');
      wcContainer.innerHTML = '';
      wcContainer.appendChild(createEl('div', 'error-state', 'Failed to load history'));
      tcContainer.innerHTML = '';
      tcContainer.appendChild(createEl('div', 'error-state', 'Failed to load'));
    }
  },

  renderTotalWorkouts(workouts) {
    const container = document.getElementById('total-workouts');
    const completed = workouts.filter(w => w.status === 'completed');
    container.innerHTML = '';
    container.appendChild(createEl('div', 'total-workouts-count', completed.length));
    container.appendChild(createEl('div', 'total-workouts-label', 'completed'));
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

      const formType = document.getElementById('workout-type-select').value;
      const categoryName = formValueToWorkoutType(formType);
      const durationMin = parseInt(document.getElementById('workout-duration').value, 10);
      const location = document.getElementById('workout-location').value;

      if (!Number.isInteger(durationMin) || durationMin <= 0) {
        Notifications.error('Please select a duration');
        return;
      }
      if (!location) {
        Notifications.error('Please select a location');
        return;
      }

      // Prevent double-submit while the request is in flight
      completeBtn.disabled = true;
      try {
        await API.post('/api/workouts', {
          date: selectedDate,
          type: categoryName,
          status: 'completed',
          duration_min: durationMin,
          location,
        });

        await this.refreshWorkouts();
      } catch (err) {
        Notifications.error(err.message);
      } finally {
        completeBtn.disabled = false;
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
      } catch (err) {
        Notifications.error(err.message);
      }
    });
  },
};
