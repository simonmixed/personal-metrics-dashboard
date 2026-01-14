import React, { useState, useEffect } from 'react';
import './StepTracker.css';

const StepTracker = () => {
  const [miles, setMiles] = useState(() => {
    const saved = localStorage.getItem('stepTrackerData');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      // Reset if it's a new day
      if (data.date === today) {
        return data.miles;
      }
    }
    return 0;
  });
  const [animatedMiles, setAnimatedMiles] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const goalMiles = 10;
  const percentage = Math.min((animatedMiles / goalMiles) * 100, 100);

  // Save miles to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('stepTrackerData', JSON.stringify({
      miles,
      date: today
    }));
  }, [miles]);

  // Animate miles value on mount and when miles changes
  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const increment = (miles - animatedMiles) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedMiles(miles);
        clearInterval(timer);
      } else {
        setAnimatedMiles(prev => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [miles]);

  // Number of segments in the arc (matching reference image)
  const totalSegments = 40;
  const filledSegments = Math.round((percentage / 100) * totalSegments);

  // Generate segments as individual rounded rectangles
  const segments = [];
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  for (let i = 0; i < totalSegments; i++) {
    const angle = 180 - (i * 180 / (totalSegments - 1));
    const angleRad = (angle * Math.PI) / 180;

    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY - radius * Math.sin(angleRad);

    const isFilled = i < filledSegments;

    segments.push(
      <rect
        key={i}
        x={x - 3}
        y={y - 12}
        width="6"
        height="20"
        rx="3"
        fill={isFilled ? '#5CC97A' : '#ECECEC'}
        transform={`rotate(${-angle + 90} ${x} ${y})`}
      />
    );
  }

  // Format the display value - show decimals only if needed
  const formatMiles = (value) => {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  const handleCardClick = () => {
    setInputValue('');
    setShowKeypad(true);
  };

  const handleKeypadClick = (value) => {
    if (value === 'delete') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setInputValue('');
    } else if (value === '.') {
      if (!inputValue.includes('.')) {
        setInputValue(prev => prev + '.');
      }
    } else {
      setInputValue(prev => prev + value);
    }
  };

  const handleDone = () => {
    const addedValue = parseFloat(inputValue) || 0;
    setMiles(prevMiles => prevMiles + addedValue);
    setShowKeypad(false);
    setInputValue('');
  };

  const handleCancel = () => {
    setShowKeypad(false);
    setInputValue('');
  };

  return (
    <>
      <div className="metric-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="metric-header">
          <h3>Steps Taken</h3>
        </div>

        <div className="gauge-container">
          <svg width="300" height="200" viewBox="0 0 300 200">
            <g>
              {segments}
            </g>
          </svg>

          <div className="gauge-center-content">
            <div className="gauge-value">
              <span className="miles-value">{formatMiles(animatedMiles)}</span>
            </div>
            <span className="gauge-subtitle">miles</span>
          </div>
        </div>
      </div>

      {showKeypad && (
        <div className="keypad-overlay" onClick={handleCancel}>
          <div className="keypad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="keypad-header">
              <h3>Add Miles</h3>
              <button className="close-button" onClick={handleCancel}>×</button>
            </div>

            <div className="keypad-display">
              {inputValue || '0'}
            </div>

            <div className="keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'].map((key) => (
                <button
                  key={key}
                  className={`keypad-button ${key === 'delete' ? 'delete-button' : ''}`}
                  onClick={() => handleKeypadClick(key)}
                >
                  {key === 'delete' ? '⌫' : key}
                </button>
              ))}
            </div>

            <div className="keypad-actions">
              <button className="keypad-action-button cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="keypad-action-button done" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StepTracker;
