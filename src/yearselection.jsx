import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

function YearSelection({onSelect}) {
  const [selectedYear, setSelectedYear] = useState('');

  const yearOptions = [
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Graduate',
    'Prefer not to say'
  ];

  
  const handleYear = (currentYear) => {
    setSelectedYear(currentYear);
    onSelect(currentYear); // Pass selected value to parent
  };

  return (
    <div>
    <div className="d-flex flex-column text-start">
      {yearOptions.map((year, index) => (
        <Form.Check
          required
          type="radio"
          key={index}
          id={`year-radio-${index}`}
          name="yearGroup"
          label={year}
          value={year}
          checked={selectedYear === year}
          onChange={(e) => handleYear(e.target.value)}
          className="mb-2"
        />
      ))}

      <p className="mt-2 mx-1"><span>Selected:</span> {selectedYear}</p>
    </div>
    </div>
  );
}

export default YearSelection;
