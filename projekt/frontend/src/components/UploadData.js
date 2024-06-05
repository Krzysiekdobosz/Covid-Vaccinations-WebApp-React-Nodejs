import React, { useState } from 'react';
import axios from 'axios';

function UploadData() {
  const [message, setMessage] = useState('');

  const handleUpload = async (fileName) => {
    try {
      const response = await axios.post('http://localhost:5000/upload', { fileName });
      setMessage(response.data);
    } catch (error) {
      setMessage('Error uploading file');
    }
  };

  return (
    <div>
      <h2>Upload Data</h2>
      <button onClick={() => handleUpload('vaccinations.csv')}>Upload Vaccinations</button>
      {/* <button onClick={() => handleUpload('covid-hospitalizations.csv')}>Upload Cases</button> */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default UploadData;
