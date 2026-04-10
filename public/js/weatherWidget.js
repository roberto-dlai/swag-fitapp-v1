const WeatherWidget = {
  async load() {
    const container = document.getElementById('weather-widget');
    try {
      const weather = await API.get('/api/weather');
      this.render(container, weather);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load weather';
      container.appendChild(div);
    }
  },

  render(container, weather) {
    container.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'weather-widget';

    // Temperature (backend already returns in user's unit)
    const tempEl = document.createElement('div');
    tempEl.className = 'weather-temp';
    const unit = weather.unit === 'celsius' ? '°C' : '°F';
    tempEl.textContent = `${weather.temperature}${unit}`;

    // Details
    const details = document.createElement('div');
    details.className = 'weather-details';

    const condEl = document.createElement('div');
    condEl.className = 'weather-condition';
    condEl.textContent = weather.condition;

    const humEl = document.createElement('div');
    humEl.className = 'weather-humidity';
    humEl.textContent = `Humidity: ${weather.humidity}%`;

    details.appendChild(condEl);
    details.appendChild(humEl);

    widget.appendChild(tempEl);
    widget.appendChild(details);
    container.appendChild(widget);

    // Default weather notice
    if (weather.isDefault) {
      const notice = document.createElement('div');
      notice.className = 'weather-tip';
      notice.textContent = 'Using default weather data. Live weather is unavailable.';
      container.appendChild(notice);
    }

    // Hydration tip when temperature exceeds 85°F (convert celsius to F for check)
    const tempF = weather.unit === 'celsius'
      ? (weather.temperature * 9 / 5) + 32
      : weather.temperature;
    if (tempF > 85) {
      const tip = document.createElement('div');
      tip.className = 'weather-tip';
      tip.textContent = 'Stay hydrated! Temperature is high — drink water before, during, and after your workout.';
      container.appendChild(tip);
    }
  },
};
