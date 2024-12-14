import React, { Component } from "react";
import "./App.css";
import dataset from "./data/dataset.csv";

import TeslaSalesBarChart from "./components/TeslaSalesBarChart";
import ModelSalesPieChart from "./components/ModelSalesPieChart";
import WheelSalesPieChart from "./components/WheelSalesPieChart";

class App extends Component {
  render() {
    return (
      <div className="App" style={{ display: "flex" }}>
        <div style={{ width: "600px" }}>
          <TeslaSalesBarChart data={dataset} />
        </div>

        <div style={{ marginLeft: "50px" }}>
          <h2 style={{ textAlign: "center", marginLeft: "-170px" }}>
            Model Proportion
          </h2>
          <ModelSalesPieChart data={dataset} />
        </div>

        <div>
          <h2>Wheels Proportion</h2>
          <WheelSalesPieChart data={dataset} />
        </div>
      </div>
    );
  }
}

export default App;
