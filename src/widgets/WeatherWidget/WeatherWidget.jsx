// src/widgets/WeatherWidget/WeatherWidget.jsx
import { useEffect, useState } from "react";
import "./WeatherWidget.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res1 = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}&lang=es`
        );
        const data1 = await res1.json();

        const res2 = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}&lang=es`
        );
        const data2 = await res2.json();

        const daily = data2.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );

        setWeather(data1);
        setForecast(daily.slice(0, 5));
      } catch (err) {
        setError("Error loading weather.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <div className="weather-widget">Cargando clima...</div>;
  if (error) return <div className="weather-widget">{error}</div>;

  return (
    <div className="weather-widget">
      <h5>{weather.name}</h5>
      <div className="current">
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt="weather"
        />
        <div>
          <div className="temp">{Math.round(weather.main.temp)}°C</div>
          <div className="desc">{weather.weather[0].description}</div>
        </div>
      </div>

      <div className="forecast">
        {forecast.map((day) => (
          <div key={day.dt} className="day">
            <div>
              {new Date(day.dt_txt).toLocaleDateString("es-AR", {
                weekday: "short",
              })}
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
              alt="forecast"
            />
            <div>{Math.round(day.main.temp)}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
