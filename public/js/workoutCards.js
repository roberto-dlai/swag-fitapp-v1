const WorkoutCards = {
  async load() {
    const container = document.getElementById('weekly-plan');
    try {
      const [planData, todayData, userData] = await Promise.all([
        API.get('/api/workouts/plan'),
        API.get('/api/workouts/today'),
        API.get('/api/users/me'),
      ]);
      const todayStatus = todayData.workout?.status || 'planned';
      const todayWeather = todayData.workout?.weather_temp
        ? { temp: todayData.workout.weather_temp, cond: todayData.workout.weather_cond }
        : null;
      // Determine dominant workout category from exercises
      const exercises = todayData.workout?.exercises || [];
      const todayWorkoutType = this.getDominantCategory(exercises);
      const firstName = userData.user.name.split(' ')[0];
      const userLocation = userData.user.location || '';
      const forecastUnit = planData.forecastUnit;
      this.render(container, planData.plan, todayStatus, todayWorkoutType, firstName, userLocation, forecastUnit);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load plan: ' + err.message;
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

  render(container, plan, todayStatus, todayWorkoutType, firstName, userLocation, forecastUnit) {
    container.innerHTML = '';

    if (!plan || plan.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No workout plan available.';
      container.appendChild(empty);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const grid = document.createElement('div');
    grid.className = 'plan-grid';

    for (const day of plan) {
      const isToday = day.date === todayStr;
      const isCompleted = isToday && todayStatus === 'completed';

      const card = document.createElement('div');
      card.className = 'plan-card'
        + (day.type === 'rest' ? ' rest' : '')
        + (isCompleted ? ' completed' : '');

      const dayName = document.createElement('div');
      dayName.className = 'day-name';
      dayName.textContent = day.day + (isToday ? ' (Today)' : '');

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
        // Show first name
        const nameEl = document.createElement('div');
        nameEl.className = 'plan-card-name';
        nameEl.textContent = firstName;
        card.appendChild(nameEl);

        if (isCompleted) {
          const badge = document.createElement('span');
          badge.className = 'badge badge-completed';
          badge.textContent = 'DONE';
          card.appendChild(badge);

          // Show workout type for completed workout
          if (todayWorkoutType) {
            const typeEl = document.createElement('div');
            typeEl.className = 'plan-card-type';
            typeEl.textContent = todayWorkoutType;
            card.appendChild(typeEl);
          }

          // Show temperature and location for completed workout
          if (day.weather && day.weather.temperature !== undefined) {
            const weatherInfo = document.createElement('div');
            weatherInfo.className = 'plan-card-weather';
            const unitSymbol = forecastUnit === 'celsius' ? '°C' : '°F';
            weatherInfo.textContent = `${Math.round(day.weather.temperature)}${unitSymbol}`;
            card.appendChild(weatherInfo);
          }

          if (userLocation) {
            const locEl = document.createElement('div');
            locEl.className = 'plan-card-location';
            locEl.textContent = userLocation;
            card.appendChild(locEl);
          }

        }

        // Show forecast temperature (skip if completed, already shown above)
        if (!isCompleted && day.weather && day.weather.temperature !== undefined) {
          const tempEl = document.createElement('div');
          tempEl.className = 'plan-card-weather';
          const unitSymbol = forecastUnit === 'celsius' ? '°C' : '°F';
          tempEl.textContent = `${Math.round(day.weather.temperature)}${unitSymbol}`;
          card.appendChild(tempEl);
        }

        const locationBadge = document.createElement('span');
        locationBadge.className = day.isIndoor ? 'badge badge-indoor' : 'badge badge-outdoor';
        locationBadge.textContent = day.isIndoor ? 'Indoor' : 'Outdoor';
        card.appendChild(locationBadge);
      }

      grid.appendChild(card);
    }

    container.appendChild(grid);
  },
};
