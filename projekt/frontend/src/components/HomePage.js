import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS

function HomePage() {
  const [data, setData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['Poland']);
  const [countryList, setCountryList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'location', direction: 'ascending' });
  const [sortedData, setSortedData] = useState([]);

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

  useEffect(() => {
    const sortData = () => {
      const sorted = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setSortedData(sorted);
    };

    sortData();
  }, [data, sortConfig]);

  const handleCountryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCountries(selectedOptions);
  };

  const handleSortColumnChange = (e) => {
    setSortConfig((prevConfig) => ({
      ...prevConfig,
      key: e.target.value,
    }));
  };

  const handleSortDirectionChange = (e) => {
    setSortConfig((prevConfig) => ({
      ...prevConfig,
      direction: e.target.value,
    }));
  };

  const formatNumber = (number) => {
    if (typeof number === 'number') {
      return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return number;
  };

  return (
    <div className="container mt-5">
      <h2>Home Page</h2>
      <p>Select countries:</p>
      <select multiple className="form-select mb-3" value={selectedCountries} onChange={handleCountryChange}>
        {countryList.map((country, index) => (
          <option key={index} value={country}>
            {country}
          </option>
        ))}
      </select>
      
      <div className="d-flex mb-3">
        <div className="me-3">
          <label htmlFor="sortColumn" className="form-label">Sort by:</label>
          <select id="sortColumn" className="form-select" value={sortConfig.key} onChange={handleSortColumnChange}>
            <option value="total_vaccinations">Total Vaccinations</option>
            <option value="people_vaccinated">People Vaccinated</option>
            <option value="people_fully_vaccinated">People Fully Vaccinated</option>
            <option value="total_boosters">Total Boosters</option>
            <option value="avg_total_vaccinations_per_hundred">Avg Total Vaccinations Per Hundred</option>
            <option value="avg_people_vaccinated_per_hundred">Avg People Vaccinated Per Hundred</option>
            <option value="avg_people_fully_vaccinated_per_hundred">Avg People Fully Vaccinated Per Hundred</option>
            <option value="avg_total_boosters_per_hundred">Avg Total Boosters Per Hundred</option>
            <option value="avg_daily_vaccinations_per_million">Avg Daily Vaccinations Per Million</option>
            <option value="avg_daily_people_vaccinated_per_hundred">Avg Daily People Vaccinated Per Hundred</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortDirection" className="form-label">Sort direction:</label>
          <select id="sortDirection" className="form-select" value={sortConfig.direction} onChange={handleSortDirectionChange}>
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>
      </div>

      {sortedData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="thead-dark">
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
              {sortedData.map((countryData, index) => (
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
        </div>
      )}
    </div>
  );
}

export default HomePage;
