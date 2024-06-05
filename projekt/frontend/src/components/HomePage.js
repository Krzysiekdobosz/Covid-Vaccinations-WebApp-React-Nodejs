import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [data, setData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['Poland']); // Początkowo wybieramy Polskę
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    const fetchDataForCountries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/dataall', {
          params: { countries: selectedCountries }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataForCountries();
  }, [selectedCountries]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/countries');
        setCountryList(response.data);
      } catch (error) {
        console.error('Error fetching country list:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCountries(selectedOptions);
  };

  const formatNumber = (number) => {
    if (typeof number === 'number') {
      return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return number;
  };

  return (
    <div>
      <h2>Home Page</h2>
      <p>Select countries:</p>
      <select multiple value={selectedCountries} onChange={handleCountryChange}>
        {countryList.map((country, index) => (
          <option key={index} value={country}>
            {country}
          </option>
        ))}
      </select>
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Total Vaccinations</th>
              <th>People Vaccinated</th>
              <th>People Fully Vaccinated</th>
              <th>Total Boosters</th>
              <th>Average Total Vaccinations Per Hundred</th>
              <th>Average People Vaccinated Per Hundred</th>
              <th>Average People Fully Vaccinated Per Hundred</th>
              <th>Average Total Boosters Per Hundred</th>
              <th>Average Daily Vaccinations Per Million</th>
              <th>Average Daily People Vaccinated Per Hundred</th>
            </tr>
          </thead>
          <tbody>
            {data.map((countryData, index) => (
              <tr key={index}>
                <td>{countryData.location}</td>
                <td>{formatNumber(countryData.total_vaccinations)}</td>
                <td>{formatNumber(countryData.people_vaccinated)}</td>
                <td>{formatNumber(countryData.people_fully_vaccinated)}</td>
                <td>{formatNumber(countryData.total_boosters)}</td>
                <td>{formatNumber(countryData.avg_total_vaccinations_per_hundred)}</td>
                <td>{formatNumber(countryData.avg_people_vaccinated_per_hundred)}</td>
                <td>{formatNumber(countryData.avg_people_fully_vaccinated_per_hundred)}</td>
                <td>{formatNumber(countryData.avg_total_boosters_per_hundred)}</td>
                <td>{formatNumber(countryData.avg_daily_vaccinations_per_million)}</td>
                <td>{formatNumber(countryData.avg_daily_people_vaccinated_per_hundred)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HomePage;
