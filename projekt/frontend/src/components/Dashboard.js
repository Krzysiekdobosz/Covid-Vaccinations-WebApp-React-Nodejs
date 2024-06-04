import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState(['date', 'total_vaccinations']);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [data, setData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([
    'date', 'location', 'total_vaccinations', 'people_vaccinated', 'people_fully_vaccinated', 
    'total_boosters', 'daily_vaccinations_raw', 'daily_vaccinations', 
    'total_vaccinations_per_hundred', 'people_vaccinated_per_hundred', 
    'people_fully_vaccinated_per_hundred', 'total_boosters_per_hundred', 
    'daily_vaccinations_per_million', 'daily_people_vaccinated', 
    'daily_people_vaccinated_per_hundred'
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      fetchCountries();
    }
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, page, pageSize, selectedAttributes, selectedCountries]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/countries');
      setAvailableCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data', {
        params: {
          attributes: selectedAttributes,
          page: page,
          pageSize: pageSize,
          countries: selectedCountries,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAttributeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedAttributes([...selectedAttributes, value]);
    } else {
      setSelectedAttributes(selectedAttributes.filter(attr => attr !== value));
    }
  };

  const handleCountryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCountries([...selectedCountries, value]);
    } else {
      setSelectedCountries(selectedCountries.filter(country => country !== value));
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <div>
      <h2>Przetwarzamy dane</h2>
      <form>
        <div>
          <h3>Wybierz atrybuty:</h3>
          {availableAttributes.map(attr => (
            <label key={attr}>
              <input type="checkbox" value={attr} onChange={handleAttributeChange} checked={selectedAttributes.includes(attr)} />
              {attr}
            </label>
          ))}
        </div>
        <div>
          <h3>Wybierz kraje:</h3>
          {availableCountries.map((country) => (
            <label key={country}>
              <input type="checkbox" value={country} onChange={handleCountryChange} checked={selectedCountries.includes(country)} />
              {country}
            </label>
          ))}
        </div>
      </form>
      <div>
        <button onClick={handlePrevPage}>Poprzednia strona</button>
        <button onClick={handleNextPage}>Następna strona</button>
      </div>
      <div>
        <label>
          Rozmiar strony: 
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedAttributes.map(attr => (
              <Line key={attr} type="monotone" dataKey={attr} stroke="#8884d8" activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
