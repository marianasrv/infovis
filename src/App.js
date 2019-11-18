import React from 'react';
import './App.css';
import BarChart from './BarChart'
import ScatterPlot from './ScatterPlot'
import * as d3 from "d3";

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <h2>Information Visualization - Group 11</h2>
      </div>
      <div className="ScatterPlot">
        <ScatterPlot/>
      </div>
      <div className="BarChart">
        <BarChart/>
      </div>
    </div>
  );
}

export default App;
