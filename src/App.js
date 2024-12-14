import React, { Component } from "react";
import "./App.css";

import WheelSalesPieChart from "./components/WheelSalesPieChart";
import ModelSalesPieChart from "./components/ModelSalesPieChart";
import TeslaSalesPieChart from "./components/TeslaSalesPieChart";

import dataset from "./data/dataset.csv";

class App extends Component {
  render() {
    return (
      <div className="App" style={{ display: "flex" }}>
        <div style={{ width: "600px" }}>
          <TeslaSalesPieChart data={dataset} />
        </div>

        <div style={{ marginLeft: "50px" }}>
          <h2 style={{ textAlign: "center", marginLeft: "-170px" }}>
            Model Proportion
          </h2>
          <ModelSalesPieChart />
        </div>

        <div>
          <h2>Wheels Proportion</h2>
          <WheelSalesPieChart />
        </div>

        <div
          id="tooltip"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <svg></svg>
        </div>
      </div>
    );
  }
}

export default App;
