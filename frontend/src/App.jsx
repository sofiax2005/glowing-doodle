// frontend/src/App.jsx

import React, { useState } from 'react';
import ScrollStory from './components/ScrollStory';
import UploadCSV from './components/UploadCSV';
import RowToEntityMorph from './visualizations/RowToEntityMorph';

function App() {
  const [dataset, setDataset] = useState(null);
  const [normalizationResult, setNormalizationResult] = useState(null);

  // Handler for uploaded CSV or selected sample dataset
  const handleDatasetUpload = async (data) => {
    setDataset(data);

    // Call your backend normalization API
    const response = await fetch('/api/normalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: data.rows,
        tableName: data.name || 'UploadedTable'
      }),
    });

    const result = await response.json();
    setNormalizationResult(result);
  };

  return (
    <div className="App min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-blue-700 text-white p-6 mb-6">
        <h1 className="text-4xl font-bold">NormalDB</h1>
        <p className="text-lg">Interactive Database Normalization Platform</p>
      </header>

      {/* Upload or select dataset */}
      <div className="max-w-2xl mx-auto mb-6">
        <UploadCSV onUpload={handleDatasetUpload} />
      </div>

      {/* Show normalization story only after uploading/selecting data */}
      {normalizationResult && (
        <ScrollStory data={normalizationResult}>
          {/* You can pass props to visualize each normalization stage */}
          <RowToEntityMorph
            data={dataset?.rows}
            isActive={true}
          />
          {/* Add more animated visualizations here as more components are completed */}
        </ScrollStory>
      )}
    </div>
  );
}

export default App;
