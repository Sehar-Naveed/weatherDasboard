import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import './App.css';

const App = () => {
  const [location, setLocation] = useState('Lahore');
  const [coords, setCoords] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetches geographic coordinates for a given location
  const fetchCoords = async (loc) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${loc}&format=json&limit=1`
      );
      if (res.data.length === 0) throw new Error('City not found');
      return { lat: res.data[0].lat, lon: res.data[0].lon, name: res.data[0].display_name };
    } catch (err) {
      throw new Error('City not found');
    }
  };

  // Retrieves current and daily weather data from Open-Meteo API
  const fetchWeather = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      return res.data;
    } catch (err) {
      throw new Error('Failed to fetch weather data');
    }
  };

  // Fetches hourly weather data for a specific date
  const fetchHourly = async (lat, lon, date) => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&past_days=2&forecast_days=7&timezone=auto`
      );
      const targetDate = new Date(date).toISOString().split('T')[0];
      const hourlyData = res.data.hourly.time.map((time, i) => ({
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        temp: res.data.hourly.temperature_2m[i],
        date: new Date(time).toISOString().split('T')[0],
      })).filter(item => {
        return item.date === targetDate;
      });
      return hourlyData.length > 0 ? hourlyData : [];
    } catch (err) {
      return [];
    }
  };

  // Initiates data fetching for the initial location and updates state
  const fetchData = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon, name } = await fetchCoords(loc);
      setCoords({ lat, lon, name });

      const weatherData = await fetchWeather(lat, lon);
      setCurrentWeather({
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        condition: weatherCodeToText(weatherData.current.weather_code),
      });
      setForecast(
        weatherData.daily.time.map((time, i) => ({
          dt: new Date(time).getTime() / 1000,
          temp: { day: weatherData.daily.temperature_2m_max[i] },
          weather: [{ description: weatherCodeToText(weatherData.daily.weather_code[i]) }],
        }))
      );
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Converts weather codes to human-readable conditions
  const weatherCodeToText = (code) => {
    const codes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      61: 'Light rain',
      63: 'Moderate rain',
      80: 'Rain showers',
    };
    return codes[code] || 'Unknown';
  };

  useEffect(() => {
    fetchData(location);
  }, [location]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude).then((data) => {
            setCurrentWeather({
              temp: data.current.temperature_2m,
              humidity: data.current.relative_humidity_2m,
              condition: weatherCodeToText(data.current.weather_code),
            });
            setForecast(
              data.daily.time.map((time, i) => ({
                dt: new Date(time).getTime() / 1000,
                temp: { day: data.daily.temperature_2m_max[i] },
                weather: [{ description: weatherCodeToText(data.daily.weather_code[i]) }],
              }))
            );
          });
        },
      );
    }
  }, []);

  const handleSearch = (newLocation) => {
    setLocation(newLocation);
    setSelectedDay(null);
    setHourly(null);
  };

  const handleDayClick = async (day) => {
    setSelectedDay(day.dt * 1000);
    if (coords) {
      try {
        const hourlyData = await fetchHourly(coords.lat, coords.lon, new Date(day.dt * 1000).toLocaleDateString());
        setHourly(hourlyData);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="app">
      <h1 className="dashboard-title">Weather Dashboard</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {currentWeather && coords && coords.name && (
        <CurrentWeather
          data={currentWeather}
          name={coords.name.split(',')[0]}
          date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        />
      )}
      {forecast && !selectedDay && (
        <Forecast data={forecast} onDayClick={handleDayClick} />
      )}
      {hourly && selectedDay && (
        <div className="hourly-container">
          <h3 className="hourly-title">Hourly Forecast for {new Date(selectedDay).toLocaleDateString()}</h3>
          <div className="hourly-row">
            {hourly.length > 0 ? (
              hourly.map((hour, index) => (
                <div key={index} className="hourly-item">
                  <p>{hour.time}</p>
                  <p>{hour.temp}°C</p>
                </div>
              ))
            ) : (
              <p>No hourly data available. Please try again later.</p>
            )}
          </div>
          <button onClick={() => { setSelectedDay(null); setHourly(null); }}>Back to Daily</button>
        </div>
      )}
    </div>
  );
};

export default App;
