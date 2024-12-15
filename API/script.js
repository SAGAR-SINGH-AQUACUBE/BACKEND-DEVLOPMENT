const apiKey = 'your_api_key'; // Replace with your OpenWeatherMap API key
const city = 'Dehradun';

fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
        const weatherDiv = document.getElementById('weather');
        const temperature = data.main.temp;
        const description = data.weather[0].description;

        weatherDiv.innerHTML = `
            <p>Current Weather in Dehradun:</p>
            <p>Temperature: ${temperature}°C</p>
            <p>Description: ${description}</p>
        `;
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather').innerText = 'Unable to load weather data';
    });
