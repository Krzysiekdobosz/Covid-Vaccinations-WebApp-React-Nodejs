import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'chartjs-adapter-date-fns'; // adapter for time scale
import Chart from './Chart';



function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]); // Stan przechowujący wybrane atrybuty
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // Domyślny rozmiar strony

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/data?page=${page}&pageSize=${pageSize}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      fetchData();
    }
  }, [navigate, page, pageSize]);

  // Obsługa zmiany zaznaczonych atrybutów w formularzu
  const handleAttributeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedAttributes([...selectedAttributes, value]); // Dodaj atrybut do listy wybranych
    } else {
      setSelectedAttributes(selectedAttributes.filter(attr => attr !== value)); // Usuń atrybut z listy wybranych
    }
  };

  // Obsługa zmiany rozmiaru strony
  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
  };

  // Obsługa przycisków nawigacyjnych
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM D, YYYY', // Dodaj pełny rok do formatu daty
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Selected Attribute',
        },
      },
    },
  };



  
  return (
    <div>
      <h2>Przetwarzamy dane</h2>
      <form>
        {/* Formularz do wyboru atrybutów */}
        <label>
          <input type="checkbox" value="location" onChange={handleAttributeChange} /> Location
        </label>
        <label>
          <input type="checkbox" value="total_vaccinations" onChange={handleAttributeChange} /> Total Vaccinations
        </label>
        {/* Dodaj więcej pól wyboru atrybutów w formularzu */}
      </form>
      <Chart data={data} options={options} selectedAttributes={selectedAttributes} /> {/* Przekazujemy wybrane atrybuty do komponentu wykresu */}
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
    </div>
  );
}

export default Dashboard;
