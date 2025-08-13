const CurrentWeather = ({ data, name, date }) => (
  <div className="weather-card">
    <h2>{name}</h2>
    <p>{date}</p>
    <p>Temperature: {data.temp}°C</p>
    <p>Conditions: {data.condition}</p>
    <p>Humidity: {data.humidity}%</p>
  </div>
);

export default CurrentWeather;
