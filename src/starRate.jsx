import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

function StarRate({onRate}) {
  const [rating, setRating] = useState(null);
  const [rateColor, setColor] = useState(null); 

  const handleRate = (currentRate) => {
    setRating(currentRate);
    onRate(currentRate);
  }

  return (
    <div>
    <h2><span style={{color:'#ff9500'}}>Rate</span> Your Course:</h2>
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
              color={currentRate <= (rating || rateColor) ? "gold" : "lightgrey"}
              style={{ cursor: "pointer" }}
            />
          </label>
        );
      })}
    </div>
  );
}

export default StarRate;
