import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './components/HomePage'; // Make sure you have this component
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UploadData from './components/UploadData';
import DataCsv from './components/DataCsv';
function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
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
            
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-data" element={<UploadData />} />
          <Route path='data-csv' element={<DataCsv />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
