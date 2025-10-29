// frontend/src/App.jsx

import React, { useState } from 'react';
import UploadCSV from './components/UploadCSV';
import ScrollStory from './components/ScrollStory';
import TableInspector from './components/TableInspector';
import RowToEntityMorph from './visualizations/RowToEntityMorph';

function App() {
  const [dataset, setDataset] = useState(null);
  const [normalizationResult, setNormalizationResult] = useState(null);

  // CSV upload handler
  const handleDatasetUpload = async (data) => {
    setDataset(data);

    // API: POST the rows to /api/normalize
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

  const stages = normalizationResult?.normalizedSchemas?.stages || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-blue-700 text-white p-6 mb-6">
        <h1 className="text-4xl font-bold">NormalDB</h1>
        <p className="text-lg">
          Interactive Database Normalization Platform<br />
          <span className="text-sm text-blue-100">Upload a CSV, watch and explore normalization step-by-step.</span>
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* Upload */}
        <UploadCSV onUpload={handleDatasetUpload} />

        {/* Show storyboard and table details after upload */}
        {normalizationResult && stages.length > 0 && (
          <ScrollStory data={normalizationResult}>
            {/* UNF → 1NF D3 animation */}
            <RowToEntityMorph
              data={dataset?.rows}
              isActive={true}
            />
            {/* Table Inspector for each stage and its tables */}
            {stages.map((stage, idx) => (
              <div key={stage.normalForm + idx} className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {stage.normalForm} Tables
                </h2>
                {stage.tables.map((tbl, tIdx) => (
                  <TableInspector
                    key={tbl.name + tIdx}
                    table={tbl}
                    sampleRows={dataset?.rows?.slice(0, 5) || []}
                    primaryKey={tbl.primaryKey}
                    foreignKeys={tbl.foreignKeys || []}
                  />
                ))}
              </div>
            ))}
          </ScrollStory>
        )}
      </main>

      <footer className="py-6 mt-10 text-center text-gray-500">
        <small>
          NormalDB &copy; {new Date().getFullYear()} — Use arrow keys or buttons to explore normalization stages.
        </small>
      </footer>
    </div>
  );
}

export default App;
