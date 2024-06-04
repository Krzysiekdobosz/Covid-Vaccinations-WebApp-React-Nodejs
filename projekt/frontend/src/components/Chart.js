import React from 'react';
import { Line } from 'react-chartjs-2';

function Chart({ data, options, selectedAttributes }) {
  // Przygotowanie danych dla wykresu
  const datasets = selectedAttributes.map(attribute => {
    const filteredData = data.map(item => ({
      x: item.date,
      y: item[attribute]
    }));

    return {
      label: attribute,
      data: filteredData,
      fill: false,
      borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`,
      tension: 0.1
    };
  });

  return (
    <div>
      <Line
        data={{
          datasets: datasets
        }}
        options={options}
      />
    </div>
  );
}

export default Chart;