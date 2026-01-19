document.addEventListener("DOMContentLoaded", function () {
  const datetimeElement = document.getElementById("datetime");
  const loadingOverlay = document.getElementById("loading-overlay");

  // for the fallback
  const def_city = "Riyadh";
  const def_lat = 24.7136;
  const def_lon = 46.6753;

  let timeZone;
  let currentTimeZone = null;
  let dateTimeInterval = null;

  // changing the time format from 24 to 12 hour notation
  function timeFormat(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period;
    if (hours >= 12) {
      period = "PM";
    } else {
      period = "AM";
    }
    hours = hours % 12 || 12;
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return hours + ":" + minutes + " " + period;
  }

  // Update date and time based on location
  function updateDateTime() {
    if (!currentTimeZone) return;
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: currentTimeZone,
    };
    const formattedDateTime = now.toLocaleDateString("en-US", options);
    datetimeElement.innerHTML = formattedDateTime;
  }

  // icons  setup
  const skycons = new Skycons({
    color: "white",
    resizeClear: true,
  });

  // Change wallpaper based on weather code and visibility ------------------------------------------------------
  function changeWallpaper(weatherCode, visibilityKm, isDay) {
    const wallpaperContainer = document.querySelector(".weather-background");
    const currentWallpaper = document.getElementById("wallpaper");

    let wallpaperSrc = "";

    if (visibilityKm !== undefined && visibilityKm <= 10) {
      if (visibilityKm <= 1) {
        wallpaperSrc = [
          "img/wallpapers/Sandstorm.jpg",
          "img/wallpapers/Sandstorm-2.jpg",
        ];
      } else if (visibilityKm > 1 && visibilityKm <= 5) {
        wallpaperSrc = "img/wallpapers/dusty.jpg";
      } else if (visibilityKm > 5 && visibilityKm <= 10) {
        wallpaperSrc = "img/wallpapers/haze.jpg";
      }
    }

    if (!wallpaperSrc) {
      switch (weatherCode) {
        case 0:
          wallpaperSrc = isDay
            ? [
                "img/wallpapers/clear.jpg",
                "img/wallpapers/clear-2.jpg",
                "img/wallpapers/clear-3.jpg",
              ]
            : ["img/wallpapers/clear-night.jpg"];
          break;
        case 1:
        case 2:
        case 3:
          wallpaperSrc = isDay
            ? [
                "img/wallpapers/cloudy.jpg",
                "img/wallpapers/cloudy-2.jpg",
                "img/wallpapers/cloudy-3.jpg",
              ]
            : "img/wallpapers/cloudy-night.jpg";
          break;
        case 45:
        case 48:
          wallpaperSrc = "img/wallpapers/fog.jpg";
          break;
        case 51:
        case 53:
        case 55:
          wallpaperSrc = [
            "img/wallpapers/drizzle.jpg",
            "img/wallpapers/drizzle-2.jpg",
            "img/wallpapers/drizzle-3.jpg",
          ];
          break;
        case 61:
        case 63:
        case 65:
          wallpaperSrc = "img/wallpapers/rain.jpg";
          break;
        case 66:
        case 67:
          wallpaperSrc = "img/wallpapers/freezingRain.jpg";
          break;
        case 71:
        case 73:
        case 75:
          wallpaperSrc = "img/wallpapers/snow.png";
          break;
        case 80:
        case 81:
        case 82:
          wallpaperSrc = "img/wallpapers/rainShowers.jpg";
          break;
        case 85:
        case 86:
          wallpaperSrc = "img/wallpapers/snowShowers.jpg";
          break;
        case 95:
        case 96:
        case 99:
          wallpaperSrc = [
            "img/wallpapers/thunderstorm.jpg",
            "img/wallpapers/thunderstorm-2.jpg",
            "img/wallpapers/thunderstorm-3.jpg",
          ];
          break;
        default:
          wallpaperSrc = "img/wallpapers/default.jpg";
          break;
      }
    }
    const randomIndex = Math.floor(Math.random() * wallpaperSrc.length);
    const wallpaperOption = wallpaperSrc[randomIndex];

    // transition fade out
    if (
      currentWallpaper &&
      currentWallpaper.src.includes(wallpaperOption.split("/").pop())
    ) {
      return;
    }

    const newWallpaper = document.createElement("img");
    newWallpaper.src = wallpaperOption;
    newWallpaper.style.cssText = `
        position: absolute; 
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        z-index: -98;
    `;

    if (!wallpaperContainer) {
      return;
    }
    wallpaperContainer.appendChild(newWallpaper);

    newWallpaper.onload = function () {
      setTimeout(() => {
        newWallpaper.style.opacity = "1";
      }, 50);

      setTimeout(() => {
        if (currentWallpaper) {
          newWallpaper.id = "wallpaper";
          currentWallpaper.removeAttribute("id");

          wallpaperContainer.removeChild(currentWallpaper);
        }
      }, 450);
    };

    newWallpaper.onerror = function () {
      wallpaperContainer.removeChild(newWallpaper);
      if (currentWallpaper) {
        currentWallpaper.src = "img/wallpapers/default.jpg";
      }
    };
  }
  // Get weather icon based on wearther code ------------------------------------------------------------------------
  function getWeatherIcon(weatherCode, isDay) {
    switch (weatherCode) {
      case 0:
        return isDay ? Skycons.CLEAR_DAY : Skycons.CLEAR_NIGHT;
      case 1:
      case 2:
      case 3:
        return isDay ? Skycons.PARTLY_CLOUDY_DAY : Skycons.PARTLY_CLOUDY_NIGHT;
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

  async function getCityFromCoordinates(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "WeatherApp/1.0",
        },
      });

      const data = await response.json();

      console.log("Nominatim response:", data);

      if (data && data.address) {
        return {
          name:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.country ||
            "",
          country: data.address.country || "",
          admin1: data.address.state || "",
        };
      }

      return {
        name: "Your Location",
        country: "",
        admin1: "",
      };
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return {
        name: "Your Location",
        country: "",
        admin1: "",
      };
    }
  }

  // ALADHAN :::::: Prayer times and hijri date
  async function fetchPrayerTimes(lat, lon, time) {
    const method = 4; // هذا رقم أم القرى

    const url = `https://api.aladhan.com/v1/timings/today?latitude=${lat}&longitude=${lon}&method=${method}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 200 && data.data && data.data.timings) {
        const timings = data.data.timings;
        document.getElementById("Fajr").innerHTML = timeFormat(timings.Fajr);
        document.getElementById("Sunrise").innerHTML = timeFormat(
          timings.Sunrise
        );
        document.getElementById("Dhuhr").innerHTML = timeFormat(timings.Dhuhr);
        document.getElementById("Asr").innerHTML = timeFormat(timings.Asr);
        document.getElementById("Maghrib").innerHTML = timeFormat(
          timings.Maghrib
        );
        document.getElementById("Isha").innerHTML = timeFormat(timings.Isha);
        document.getElementById("Midnight").innerHTML = timeFormat(
          timings.Midnight
        );
      }

      if (data.code === 200 && data.data && data.data.date.hijri) {
        const hijri = data.data.date.hijri;
        document.getElementById(
          "hijriDate"
        ).innerHTML = `${hijri.day} ${hijri.month.en} ${hijri.year}`;
      }
    } catch (error) {
      console.error("Prayer Times API Error:", error);
    }
  }

  // IMPORTANT Weather FUNCTION =========================////////////////////////////////////////////////////////////////////////////////////=================================
  function fetchWeatherData(lat, lon, updateCityName = false) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max,weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,weather_code,visibility&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl&timezone=auto&past_days=3`;
    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        const isDay = data.current.is_day;

        document.getElementById(
          "temperature"
        ).innerHTML = `${data.current.temperature_2m} °C`;
        document.getElementById(
          "apparent-value"
        ).innerHTML = ` ${data.current.apparent_temperature} °C`;
        document.getElementById(
          "wind-value"
        ).innerHTML = `${data.current.wind_speed_10m} km/h`;
        document.getElementById(
          "humidity-value"
        ).innerHTML = `${data.current.relative_humidity_2m} %`;
        const visibilityKm = Math.round(data.hourly.visibility[0] / 1000);
        document.getElementById(
          "visibility-value"
        ).innerHTML = `${visibilityKm} km`;
        document.getElementById(
          "pressure-value"
        ).innerHTML = `${data.current.pressure_msl} hPa`;

        // Update hourly waether data***********
        const hourly = [0, 3, 6, 9, 12, 15, 18, 21];
        hourly.forEach((hour, index) => {
          const formatHour = timeFormat(`${hour}:00`);
          document.getElementById(`time-${index}`).innerHTML = `${formatHour}`;
          document.getElementById(
            `temp-${index}`
          ).innerHTML = `${data.hourly.temperature_2m[hour]}°C`;
          const hourIsDay = hour >= 6 && hour < 18;

          const hourlyIcon = getWeatherIcon(
            data.hourly.weather_code[hour],
            hourIsDay
          );
          skycons.set(`hourly-icon${index}`, hourlyIcon);
        });

        // Update daily temperatures*******
        for (let i = 1; i <= 5; i++) {
          document.getElementById(
            `day-${i}-high`
          ).innerHTML = `${data.daily.temperature_2m_max[i]} °C`;
          document.getElementById(
            `day-${i}-low`
          ).innerHTML = `${data.daily.temperature_2m_min[i]} °C`;
          document.getElementById(
            `ppm${i}`
          ).innerHTML = `${data.daily.precipitation_probability_max[i]} %`;
        }

        // Update dates *****
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

        // for the updateDateTime function *******************************
        currentTimeZone = data.timezone;
        clearInterval(dateTimeInterval);
        updateDateTime();
        dateTimeInterval = setInterval(updateDateTime, 1000);

        // Update daily icons and call icon function *********************
        for (let i = 1; i <= 5; i++) {
          const dailyIcon = getWeatherIcon(data.daily.weather_code[i], true); // true for sunny icon
          skycons.set(`weather-icon${i}`, dailyIcon);
        }

        // If this is from user's location, get city name ******************
        if (updateCityName) {
          const detectedLocation = await getCityFromCoordinates(lat, lon);
          updateCityInUI(
            detectedLocation.name,
            detectedLocation.country,
            detectedLocation.admin1
          );
        }

        // Change wallpaper function and set current icon ***********************
        changeWallpaper(data.current.weather_code, visibilityKm, isDay);
        // prayer time function **********************************************
        fetchPrayerTimes(lat, lon);

        const currentIcon = getWeatherIcon(data.current.weather_code, isDay);
        skycons.set("current-weather-icon", currentIcon);
        skycons.play();
      })
      .catch((error) => {
        console.error("Weather API Error:", error);
      });
  }

  async function getCityFromIP() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data && data.latitude && data.longitude) {
        return {
          city: data.city || "Unknown",
          lat: data.latitude,
          lon: data.longitude,
          country: data.country_name || "",
        };
      }

      return null;
    } catch (error) {
      console.error("IP Geolocation Error:", error);

      // Fallback
      try {
        const fallbackResponse = await fetch("http://ip-api.com/json/");
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.status === "success") {
          return {
            city: fallbackData.city,
            lat: fallbackData.lat,
            lon: fallbackData.lon,
            country: fallbackData.country,
          };
        }
      } catch (fallbackError) {
        console.error("Fallback IP API also failed:", fallbackError);
      }

      return null;
    }
  }
  function updateCityInUI(name, country, admin1 = "") {
    const cityElement = document.querySelector(".city");
    let displayString = name;

    if (country && name !== country) {
      displayString = country;
      if (name) {
        displayString += ", " + name;
      }
    } else if (admin1) {
      displayString = admin1 + ", " + name;
    }

    if (cityElement) {
      cityElement.innerHTML = `
            <i class="fas fa-map-marker-alt" style="font-size: 1.3rem; margin-right: 10px; padding-top: 7px"></i>
            ${displayString}
        `;
    }
  }
  // GEOLOCATION: Get user's location ------------------------------------------------------------------------------------------------------------------------------------------
  async function getUserLocation() {
    const ipLocation = await getCityFromIP();

    let currentLat = ipLocation ? ipLocation.lat : def_lat;
    let currentLon = ipLocation ? ipLocation.lon : def_lon;
    let currentCity = ipLocation ? ipLocation.city : def_city;

    if (ipLocation) {
      currentLat = ipLocation.lat;
      currentLon = ipLocation.lon;
      currentCity = ipLocation.city;

      updateCityInUI(currentCity, ipLocation.country);
    } else {
      const loadingText = document.getElementById("loading-text");
      if (loadingText) {
        loadingText.innerHTML =
          "Connection failed, loading default location...";
      }
    }
    fetchWeatherData(currentLat, currentLon, false);

    if ("geolocation" in navigator) {
      console.log("Requesting user location...");

      navigator.geolocation.getCurrentPosition(
        function (position) {
          let finalLat = position.coords.latitude;
          let finalLon = position.coords.longitude;

          // Fetch weather for user's actual location
          fetchWeatherData(finalLat, finalLon, true);
          console.log("User location obtained:", finalLat, finalLon);
        },
        function (error) {
          console.log(
            "Location access denied, loading your default location... "
          );
          fetchWeatherData(currentLat, currentLon, true);
        },
        // Options
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      // IF the Browser doesn't support geolocation
      console.log("Geolocation not supported. Using IP/Default.");
      fetchWeatherData(currentLat, currentLon, true);
    }
  }

  //GEOLOCATION function call  -------------------------------------------------------------------------------------------------------------------------
  getUserLocation();

  // GEOCODING search bar connect functionability
  const searchInput = document.getElementById("city-search");
  const resultsDiv = document.getElementById("search-results");
  const searchBtn = document.getElementById("search-btn");

  // City search function using Geocoding API
  async function searchCity(cityName) {
    if (!cityName || cityName.length < 2) {
      resultsDiv.innerHTML = "";
      resultsDiv.style.display = "none";
      return [];
    }

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName
      )}&count=10&language=en&format=json`;

      const response = await fetch(geoUrl);
      const data = await response.json();

      return data.results || [];
    } catch (error) {
      console.error("Geocoding Error:", error);
      return [];
    }
  }

  // Display search results
  function displayResults(cities) {
    if (cities.length === 0) {
      resultsDiv.innerHTML =
        "<p style='padding: 10px; color: #666;'>No results found</p>";
      resultsDiv.style.display = "block";
      return;
    }

    resultsDiv.innerHTML = cities
      .map(
        (city) => `
        <div class="city-result" onclick="selectCity(${city.latitude}, ${
          city.longitude
        }, '${city.name.replace(/'/g, "\\'")}', '${city.country || ""}', '${
          city.admin1 || ""
        }')">
          <strong>${city.name}</strong>
          <span>${city.country || ""} ${
          city.admin1 ? ", " + city.admin1 : ""
        }</span>
        </div>
      `
      )
      .join("");

    resultsDiv.style.display = "block";
  }
  function updateCity(name, country) {
    const cityElement = document.querySelector(".city");
    if (cityElement) {
      cityElement.innerHTML = `
      <i class="fas fa-map-marker-alt" style="font-size: 1.3rem; margin-right: 10px; padding-top: 7px"></i>
      ${country}, ${name}  
    `;
    }
  }
  window.selectCity = function (lat, lon, name, country, region) {
    console.log(`City selected: ${name}`);
    console.log(`Coordinates: ${lat}, ${lon}`);

    // Update variables
    latitude = lat;
    longitude = lon;
    cityName = name;
    countryName = country;

    // Clear search
    searchInput.value = name;
    resultsDiv.innerHTML = "";
    resultsDiv.style.display = "none";

    updateCity(name, country);
    // Fetch weather for the selected city
    fetchWeatherData(lat, lon, false);
  };

  // Debounce search
  let searchTimeout;
  searchInput.addEventListener("input", function (e) {
    clearTimeout(searchTimeout);

    const query = e.target.value.trim();

    if (query.length < 2) {
      resultsDiv.innerHTML = "";
      resultsDiv.style.display = "none";
      return;
    }

    searchTimeout = setTimeout(async function () {
      const cities = await searchCity(query);
      displayResults(cities);
    }, 300);
  });

  // Handle search clicks )))))))))))))))))))))))))))
  searchBtn.addEventListener("click", async function () {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      const cities = await searchCity(query);
      displayResults(cities);
    }
  });
  document.addEventListener("click", function (e) {
    if (
      !searchInput.contains(e.target) &&
      !resultsDiv.contains(e.target) &&
      !searchBtn.contains(e.target)
    ) {
      resultsDiv.style.display = "none";
    }
  });
  searchInput.addEventListener("keypress", async function (e) {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        const cities = await searchCity(query);
        displayResults(cities);
      }
    }
  });
});
// ((((((((((((((((((((((((())))))))))))))))))))))))) END

// Auto refresh page every hour
setInterval(function () {
  window.location.reload(true);
}, 3600000);
