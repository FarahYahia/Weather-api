document.addEventListener("DOMContentLoaded", function () {
  const datetimeElement = document.getElementById("datetime");
  var latitude = 0;
  var longitude = 0;
  var cityName = "";

  function updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDateTime = now.toLocaleDateString("en-US", options);
    datetimeElement.innerHTML = formattedDateTime;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  // const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=10&language=en&format=json`;
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=25&longitude=45&daily=precipitation_probability_max,weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,weather_code,visibility&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl&timezone=GMT&past_days=3";
  // const url =
  //   "https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_probability_max,weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,weather_code,visibility&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl&timezone=GMT&past_days=3";

  //API  الأيقوناات
  const skycons = new Skycons({
    color: "white",
    resizeClear: true,
  });

  function changeWallpaper(weatherCode) {
    const wallpaper = document.getElementById("wallpaper");
    switch (weatherCode) {
      case 0:
        wallpaper.src = "img/wallpapers/clear.jpg";
        break;
      case 1:
      case 2:
      case 3:
        wallpaper.src = "img/wallpapers/cloudy.jpg"; //Mainly clear, partly cloudy, and overcast
        break;
      case 45:
      case 48:
        wallpaper.src = "img/wallpapers/fog.jpg";
        break;
      case 51:
      case 53:
      case 55:
        wallpaper.src = "img/wallpapers/drizzle.jpg";
        break;
      case 61:
      case 63:
      case 65:
        wallpaper.src = "img/wallpapers/rain.jpg";
        break;
      case 66:
      case 67:
        wallpaper.src = "img/wallpapers/freezingRain.jpg";
        break;
      case 71:
      case 73:
      case 75:
        wallpaper.src = "img/wallpapers/snow.png";
        break;
      case 80:
      case 81:
      case 82:
        wallpaper.src = "img/wallpapers/rainShowers.jpg";
        break;
      case 85:
      case 86:
        wallpaper.src = "img/wallpapers/snowShowers.jpg";
        break;
      case 95:
      case 96:
      case 99:
        wallpaper.src = "img/wallpapers/thunderstorm.jpg";
        break;
      default:
        wallpaper.src = "img/wallpapers/default.jpg";
        break;
    }
  }
  function getWeatherIcon(weatherCode) {
    switch (weatherCode) {
      case 0:
        return Skycons.CLEAR_DAY;
      case 1:
      case 2:
      case 3:
        return Skycons.PARTLY_CLOUDY_DAY;
      case 45:
      case 48:
        return Skycons.FOG;
      case 51:
      case 53:
      case 55:
        return Skycons.RAIN;
      case 61:
      case 63:
      case 65:
        return Skycons.RAIN;
      case 71:
      case 73:
      case 75:
        return Skycons.SNOW;
      case 80:
      case 81:
      case 82:
        return Skycons.SLEET;
      case 95:
      case 96:
      case 99:
        return Skycons.RAIN;
      default:
        return Skycons.CLOUDY;
    }
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      function getWeatherData() {
        document.getElementById(
          "temperature"
        ).innerHTML = `${data.current.temperature_2m} °C`; // درجة حرارة الجو

        document.getElementById(
          "apparent-value"
        ).innerHTML = ` ${data.current.apparent_temperature} °C`; // احساس حرارة الجو feels like

        document.getElementById(
          "wind-value"
        ).innerHTML = `${data.current.wind_speed_10m} km/h`; // الرياح

        document.getElementById(
          "humidity-value"
        ).innerHTML = `${data.current.relative_humidity_2m} %`; // الرطوبة

        const visibilityKm = Math.round(data.hourly.visibility[0] / 1000); // او ممكن نستخدم to.Fixed عشان تصير مع فاصلة
        document.getElementById(
          "visibility-value"
        ).innerHTML = `${visibilityKm} km`; // الرؤيةة بالكيلو متر

        document.getElementById(
          "pressure-value"
        ).innerHTML = `${data.current.pressure_msl} hPa`; // الضغط فوق مستوى سطح البحر
      }
      function getHourlyData() {
        const hourly = [0, 3, 6, 9, 12, 15, 18, 21];
        hourly.forEach((hour, index) => {
          document.getElementById(`time-${index}`).innerHTML = `${hour}:00`;
          document.getElementById(
            `temp-${index}`
          ).innerHTML = `${data.hourly.temperature_2m[hour]}°C`;
          const hourlyIcon = getWeatherIcon(data.hourly.weather_code[hour]);
          skycons.set(`hourly-icon${index}`, hourlyIcon);
        });
      }
      function getDailyTemp() {
        for (let i = 1; i <= 5; i++) {
          document.getElementById(
            `day-${i}-high`
          ).innerHTML = `${data.daily.temperature_2m_max[i]} °C`;
          document.getElementById(
            `day-${i}-low`
          ).innerHTML = `${data.daily.temperature_2m_min[i]} °C`;
        }
      }
      function getDailyPPM() {
        for (let i = 1; i <= 5; i++) {
          document.getElementById(
            `ppm${i}`
          ).innerHTML = `${data.daily.precipitation_probability_max[i]} %`;
        }
      }
      function getDate() {
        for (let i = 1; i <= 5; i++) {
          const dateData = data.daily.time[i];
          const date = new Date(dateData);
          const day = date.toLocaleDateString("en-EG", { weekday: "long" });
          const shortDate = date.toLocaleDateString("en-EG", {
            month: "short",
            day: "numeric",
          });
          document.getElementById(`day${i}`).innerHTML = day;
          document.getElementById(`date${i}`).innerHTML = shortDate;
        }
      }
      function getDailyIcon() {
        for (let i = 1; i <= 5; i++) {
          const dailyIcon = getWeatherIcon(data.daily.weather_code[i]);
          skycons.set(`weather-icon${i}`, dailyIcon);
        }
      }
      changeWallpaper(data.current.weather_code);
      getWeatherData();
      getHourlyData();
      getDailyTemp();
      getDailyPPM();
      getDailyIcon();
      getDate();

      // ---------------
      const currentIcon = getWeatherIcon(data.current.weather_code);
      skycons.set("current-weather-icon", currentIcon);
      skycons.play();
    })

    .catch((error) => {
      document.getElementById("result").innerHTML = "Error: " + error;
    });
});
setInterval(function () {
  window.location.reload(true);
}, 3600000);
