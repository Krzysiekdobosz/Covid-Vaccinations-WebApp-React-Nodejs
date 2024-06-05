import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage'; // Make sure you have this component
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UploadData from './components/UploadData';
import DataCsv from './components/DataCsv';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            {!isLoggedIn ? (
              <>
                <li>
                  <Link to="/">HomePage</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/">HomePage</Link>
                </li>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/upload-data">Upload Data</Link>
                </li>
                <li>
                  <Link to="/data-csv">Data CSV</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/upload-data" element={<UploadData />} />
          <Route path='/data-csv' element={<DataCsv />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
