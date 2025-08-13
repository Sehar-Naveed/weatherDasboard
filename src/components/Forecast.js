import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudMoon } from '@fortawesome/free-solid-svg-icons';

const Forecast = ({ data, onDayClick }) => (
  <div className="forecast-container">
    <h3 className="forecast-title">7-Day Forecast</h3>
    <div className="forecast-row">
      {data.map((day, index) => (
        <div key={index} className="forecast-item" onClick={() => onDayClick(day)} style={{ width: '150px', height: '150px' }}>
          <FontAwesomeIcon icon={faCloudMoon} size="2x" />
          <p>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
          <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
          <p>{day.temp.day}°C</p>
        </div>
      ))}
    </div>
  </div>
);

export default Forecast;
