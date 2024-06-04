import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataCsv = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [plotType, setPlotType] = useState('total_vaccinations');

  const handlePlotTypeChange = (event) => {
    setPlotType(event.target.value);
  };

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        const response = await axios.post('http://localhost:5000/generate-plot', { plotType });
        setImageSrc(response.data.plotUrl);
      } catch (error) {
        console.error('Error fetching plot:', error);
      }
    };

    fetchPlot();
  }, [plotType]);

  return (
    <div>
      <label htmlFor="plotType">Choose a plot type:</label>
      <select id="plotType" value={plotType} onChange={handlePlotTypeChange}>
        <option value="total_vaccinations">Total Vaccinations</option>
        <option value="people_vaccinated">People Vaccinated</option>
        <option value="people_fully_vaccinated">People Fully Vaccinated</option>
        <option value="total_boosters">Total Boosters</option>
        <option value="daily_vaccinations">Daily Vaccinations</option>
        {/* Add more options as needed */}
      </select>
      {imageSrc ? <img src={imageSrc} alt="Vaccination Plot" /> : <p>Loading...</p>}
    </div>
  );
};

export default DataCsv;
