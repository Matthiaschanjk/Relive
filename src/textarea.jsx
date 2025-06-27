import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';

function TextareaWithValidation({ onChange, onValidChange }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount <= 75) {
      setError(`Please enter more than 75 words (currently ${wordCount})`);
    } else {
      setError('');
    }

    if (onChange) onChange(value);
    if (onValidChange) onValidChange(wordCount > 75);
  };

  return (
    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
      <Form.Label className="formTextArea">
        How was the <span style={{ color: '#ff9500' }}>course?</span>
      </Form.Label>
      <div className="d-flex justify-content-center">
        <Form.Control
          required
          as="textarea"
          rows={10}
          style={{ width: '80%' }}
          value={text}
          onChange={handleChange}
          isInvalid={!!error}
          placeholder="Tell us about your experience..."
        />
      </div>
      <Form.Control.Feedback type="invalid" className="d-block">
        {error}
      </Form.Control.Feedback>
      <span className="mt-1 fw-bold">We will validate your reviews!</span>
    </Form.Group>
  );
}

export default TextareaWithValidation;
