import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState(['date', 'total_vaccinations']); // Domyślnie wybrane atrybuty
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // Domyślny rozmiar strony
  const [data, setData] = useState([]); // Stan przechowujący dane z serwera
  const [selectedCountries, setSelectedCountries] = useState([]); // Stan przechowujący wybrane kraje
  const [availableCountries, setAvailableCountries] = useState([]); // Lista dostępnych krajów

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      fetchCountries(); // Pobierz listę dostępnych krajów
    }
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, page, pageSize, selectedAttributes, selectedCountries]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/countries'); // Dodaj endpoint do pobierania dostępnych krajów
      setAvailableCountries(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania listy krajów:', error);
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
      console.error('Błąd podczas pobierania danych:', error);
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
        <label>
          <input type="checkbox" value="date" onChange={handleAttributeChange} checked={selectedAttributes.includes('date')} />
          Data
        </label>
        <label>
          <input type="checkbox" value="location" onChange={handleAttributeChange} checked={selectedAttributes.includes('location')} />
          Lokalizacja
        </label>
        <label>
          <input type="checkbox" value="total_vaccinations" onChange={handleAttributeChange} checked={selectedAttributes.includes('total_vaccinations')} />
          Całkowite szczepienia
        </label>
        <label>
          <input type="checkbox" value="people_vaccinated" onChange={handleAttributeChange} checked={selectedAttributes.includes('people_vaccinated')} />
          Liczba zaszczepionych osób
        </label>
        <label>
          <input type="checkbox" value="people_fully_vaccinated" onChange={handleAttributeChange} checked={selectedAttributes.includes('people_fully_vaccinated')} />
          Liczba w pełni zaszczepionych osób
        </label>
        <label>
          <input type="checkbox" value="total_boosters" onChange={handleAttributeChange} checked={selectedAttributes.includes('total_boosters')} />
          Łączna liczba dawek przypominających
        </label>
        <label>
          <input type="checkbox" value="daily_vaccinations_raw" onChange={handleAttributeChange} checked={selectedAttributes.includes('daily_vaccinations_raw')} />
          Dzienna liczba szczepień (surowe dane)
        </label>
        <label>
          <input type="checkbox" value="daily_vaccinations" onChange={handleAttributeChange} checked={selectedAttributes.includes('daily_vaccinations')} />
          Średnia dzienna liczba szczepień
        </label>
        <label>
          <input type="checkbox" value="total_vaccinations_per_hundred" onChange={handleAttributeChange} checked={selectedAttributes.includes('total_vaccinations_per_hundred')} />
          Całkowite szczepienia na 100 osób
        </label>
        <label>
          <input type="checkbox" value="people_vaccinated_per_hundred" onChange={handleAttributeChange} checked={selectedAttributes.includes('people_vaccinated_per_hundred')} />
          Liczba zaszczepionych osób na 100 osób
        </label>
        <label>
          <input type="checkbox" value="people_fully_vaccinated_per_hundred" onChange={handleAttributeChange} checked={selectedAttributes.includes('people_fully_vaccinated_per_hundred')} />
          Liczba w pełni zaszczepionych osób na 100 osób
        </label>
        <label>
          <input type="checkbox" value="total_boosters_per_hundred" onChange={handleAttributeChange} checked={selectedAttributes.includes('total_boosters_per_hundred')} />
          Łączna liczba dawek przypominających na 100 osób
        </label>
        <label>
          <input type="checkbox" value="daily_vaccinations_per_million" onChange={handleAttributeChange} checked={selectedAttributes.includes('daily_vaccinations_per_million')} />
          Dzienna liczba szczepień na milion osób
        </label>
        <label>
          <input type="checkbox" value="daily_people_vaccinated" onChange={handleAttributeChange} checked={selectedAttributes.includes('daily_people_vaccinated')} />
          Dzienna liczba zaszczepionych osób
        </label>
        <label>
          <input type="checkbox" value="daily_people_vaccinated_per_hundred" onChange={handleAttributeChange} checked={selectedAttributes.includes('daily_people_vaccinated_per_hundred')} />
          Dzienna liczba zaszczepionych osób na 100 osób
        </label>
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
            {selectedCountries.map((country) => (
              <Line key={country} type="monotone" dataKey={`total_vaccinations_${country}`} stroke="#8884d8" activeDot={{ r: 8 }} />
            ))}
            {/* Dodaj więcej linii dla innych atrybutów */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
