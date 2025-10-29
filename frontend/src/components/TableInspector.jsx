// frontend/src/components/TableInspector.jsx

import React from 'react';

function TableInspector({ table, sampleRows = [], primaryKey = [], foreignKeys = [] }) {
  if (!table) return null;

  return (
    <div className="bg-gray-100 border border-gray-300 rounded p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">
        Table: <span className="text-blue-700">{table.name}</span>
      </h2>
      <div className="mb-2">
        <span className="font-semibold">Attributes:</span>
        <ul className="flex flex-wrap gap-4 mt-1">
          {table.attributes.map(attr => (
            <li
              key={attr}
              className={`px-2 py-1 rounded border ${
                primaryKey.includes(attr) ? 'border-blue-600 bg-blue-50 font-bold' : 
                foreignKeys.some(fk => fk.columns.includes(attr)) ? 'border-green-600 bg-green-50' : 
                'border-gray-300 bg-white'
              }`}
            >
              {attr}
              {primaryKey.includes(attr) ? <span className="ml-1 text-xs text-blue-800">(PK)</span> : null}
              {foreignKeys.some(fk => fk.columns.includes(attr)) ? <span className="ml-1 text-xs text-green-800">(FK)</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {sampleRows && sampleRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded shadow mb-1">
            <thead>
              <tr>
                {table.attributes.map(attr => (
                  <th key={attr} className="p-2 border-b font-semibold">{attr}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  {table.attributes.map(attr => (
                    <td key={attr} className="border border-gray-100 px-2 py-1">
                      <span className="whitespace-nowrap">{row[attr]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-8 text-xs mt-2">
        <div>
          <span className="font-semibold">Primary Key:</span>{" "}
          {primaryKey.length > 0 ? primaryKey.join(', ') : <span className="italic text-gray-500">None</span>}
        </div>
        <div>
          <span className="font-semibold">Foreign Keys:</span>{" "}
          {foreignKeys.length > 0 ? foreignKeys.map((fk, i) => (
            <span key={i}>
              {fk.columns.join(', ')} → {fk.references}
            </span>
          )) : <span className="italic text-gray-500">None</span>}
        </div>
      </div>
    </div>
  );
}

export default TableInspector;
