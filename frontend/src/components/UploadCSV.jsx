// frontend/src/components/UploadCSV.jsx

import React from 'react';
import Papa from 'papaparse';

// Simple CSV upload component
function UploadCSV({ onUpload }) {
  function handleFileChange(evt) {
    const file = evt.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          alert('Error parsing CSV: ' + results.errors[0].message);
        } else {
          onUpload({ 
            name: file.name.replace(/\.csv$/i, ''), // Use filename as table name
            rows: results.data 
          });
        }
      }
    });
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <label className="block mb-2 font-semibold">
        Upload a CSV file for normalization:
      </label>
      <input
        type="file"
        accept=".csv,text/csv"
        className="block w-full px-3 py-2 border rounded"
        onChange={handleFileChange}
      />
      <p className="text-xs text-gray-500 mt-2">
        (Headers required. Max 10MB. Your data will <span className="font-semibold">not</span> leave your device except to your backend.)
      </p>
    </div>
  );
}

export default UploadCSV;
