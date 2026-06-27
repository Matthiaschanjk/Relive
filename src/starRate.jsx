import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

function StarRate({onRate}) {
  const [rating, setRating] = useState(null);

  const handleRate = (currentRate) => {
    setRating(currentRate);
    onRate(currentRate);
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {[...Array(5)].map((star, index) => {
        const currentRate = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rate"
              value={currentRate}
              style={{ display: "none" }}
              onClick={() => {
                handleRate(currentRate);
              }}
            />
            <FaStar
              size={50}
              color={currentRate <= rating ? "gold" : "lightgrey"}
              style={{ cursor: "pointer" }}
            />
          </label>
        );
      })}
    </div>
  );
}

export default StarRate;
