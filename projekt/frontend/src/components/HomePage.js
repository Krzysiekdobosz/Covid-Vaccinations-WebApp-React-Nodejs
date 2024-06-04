import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [data, setData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('Poland');
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/dataall?country=${selectedCountry}`);
        setData(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      }
    };

    fetchData();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/countries');
        setCountryList(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania listy krajów:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const formatNumber = (number) => {
    if (typeof number === 'number') {
      return number.toFixed(1);
    }
    return number;
  };

  return (
    <div>
      <h2>Home Page</h2>
      <p>Wybierz kraj:</p>
      <select value={selectedCountry} onChange={handleCountryChange}>
        {countryList.map((country, index) => (
          <option key={index} value={country}>
            {country}
          </option>
        ))}
      </select>
      {data && (
        <div>
          <p>Location: {data.location}</p>
          <p>Total Vaccinations: {formatNumber(data.total_vaccinations)}</p>
          <p>People Vaccinated: {formatNumber(data.people_vaccinated)}</p>
          <p>People Fully Vaccinated: {formatNumber(data.people_fully_vaccinated)}</p>
          <p>Total Boosters: {formatNumber(data.total_boosters)}</p>
          <p>Daily Vaccinations Raw: {formatNumber(data.avg_daily_vaccinations_raw)}</p>
          <p>Daily Vaccinations: {formatNumber(data.avg_daily_vaccinations)}</p>
          <p>Total Vaccinations Per Hundred: {formatNumber(data.avg_total_vaccinations_per_hundred)}</p>
          <p>People Vaccinated Per Hundred: {formatNumber(data.avg_people_vaccinated_per_hundred)}</p>
          <p>People Fully Vaccinated Per Hundred: {formatNumber(data.avg_people_fully_vaccinated_per_hundred)}</p>
          <p>Total Boosters Per Hundred: {formatNumber(data.avg_total_boosters_per_hundred)}</p>
          <p>Daily Vaccinations Per Million: {formatNumber(data.avg_daily_vaccinations_per_million)}</p>
          <p>Daily People Vaccinated: {formatNumber(data.avg_daily_people_vaccinated)}</p>
          <p>Daily People Vaccinated Per Hundred: {formatNumber(data.avg_daily_people_vaccinated_per_hundred)}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
