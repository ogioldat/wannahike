import { z } from "zod";

const WeatherOutputSchema = z.object({
    temperature: z.number(),
    temperature_unit: z.string(),
    temperature_feels_like: z.number(),
    condition: z.array(z.string()),
    precipitation: z.string(),
    humidity: z.number(),
    humidity_unit: z.string(),
    wind: z.number(),
    wind_unit: z.string(),
    visibility: z.number(),
    visibility_unit: z.string(),
    pressure: z.number(),
    pressure_unit: z.string(),
    hiking_warnings: z.array(z.string()),
    sunrise: z.string(),
    sunset: z.string(),
});

export type WeatherForecast = z.infer<typeof WeatherOutputSchema>;

export async function getWeatherForecast(location: string): Promise<WeatherForecast> {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data: any = await response.json();
  const warnings = [];

  // Temperature warnings
  if (data.main.temp < 0) {
    warnings.push("⚠️ Freezing temperatures - risk of ice");
  } else if (data.main.temp > 35) {
    warnings.push("🌡️ Very hot - heat exhaustion risk");
  }

  // Wind warnings
  if (data.wind.speed > 10) {
    warnings.push("💨 Strong winds - difficult hiking conditions");
  }

  // Weather condition warnings
  const condition = data.weather[0].main.toLowerCase();
  if (condition.includes("thunderstorm")) {
    warnings.push("⛈️ THUNDERSTORM - avoid exposed ridges/peaks");
  } else if (condition.includes("rain")) {
    warnings.push("🌧️ Rain - slippery trails, bring waterproof gear");
  } else if (condition.includes("snow")) {
    warnings.push("❄️ Snow - need proper winter gear and experience");
  } else if (condition.includes("fog") || data.visibility < 1000) {
    warnings.push("🌫️ Poor visibility - easy to get lost");
  }

  if (data.main.humidity > 85) {
    warnings.push("💧 High humidity - increased dehydration risk");
  }

  const result = {
    temperature: data.main.temp,
    temperature_unit: "°C",
    temperature_feels_like: data.main.feels_like,
    condition: data.weather.map((w: any) => w.description),
    precipitation: data.rain
      ? `${data.rain["1h"] || data.rain["3h"] || 0}mm`
      : data.snow
      ? `${data.snow["1h"] || data.snow["3h"] || 0}mm snow`
      : "None",
    humidity: data.main.humidity,
    humidity_unit: "%",
    wind: data.wind.speed,
    wind_unit: "m/s",
    visibility: data.visibility,
    visibility_unit: "m",
    pressure: data.main.pressure,
    pressure_unit: "hPa",
    hiking_warnings: warnings,
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return WeatherOutputSchema.parse(result);
}
