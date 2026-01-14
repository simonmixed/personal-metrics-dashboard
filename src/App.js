import React from 'react';
import './App.css';
import StepTracker from './components/StepTracker';
import SleepMetric from './components/SleepMetric';

function App() {
  return (
    <div className="App">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Personal Metrics</h1>
        </header>

        <div className="metrics-grid">
          <div className="step-tracker-wrapper">
            <StepTracker />
          </div>
          <div className="sleep-metrics-row">
            <SleepMetric type="asleep" />
            <SleepMetric type="awake" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
