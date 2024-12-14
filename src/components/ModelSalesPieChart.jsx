import React, { Component } from "react";
import * as d3 from "d3";

class ModelSalesPieChart extends Component {
  constructor(props) {
    super(props);
    this.pieChartRef = React.createRef();
  }

  componentDidMount() {
    this.createPieChart();
  }

  createPieChart() {
    const width = 300;
    const height = 450;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(["#ff6347", "#69b3a2", "#4daf4a", "#984ea3"]);

    const pieData = [
      { model: "Model 3", abbreviation: "m3", percentage: 57.38 },
      { model: "Model Y", abbreviation: "my", percentage: 15.2 },
      { model: "Model S", abbreviation: "ms", percentage: 12.29 },
      { model: "Model X", abbreviation: "mx", percentage: 15.14 },
    ];

    const svg = d3
      .select(this.pieChartRef.current)
      .attr("width", width + 200)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.percentage);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(pieData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    svg
      .selectAll("text")
      .data(pie(pieData))
      .join("text")
      .text((d) => `${d.data.abbreviation}: ${d.data.percentage.toFixed(2)}%`)
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        const offset = 1.3;
        return `translate(${x * offset}, ${y * offset})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    const legend = d3
      .select(this.pieChartRef.current)
      .append("g")
      .attr("transform", `translate(${width + 20}, ${height / 2 - 60})`);

    legend
      .selectAll("rect")
      .data(pieData)
      .join("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * 25)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (_, i) => color(i))
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    legend
      .selectAll("text")
      .data(pieData)
      .join("text")
      .attr("x", 25)
      .attr("y", (_, i) => i * 25 + 14)
      .text((d) => d.model)
      .style("font-size", "12px")
      .attr("fill", "#000");
  }

  render() {
    return <svg ref={this.pieChartRef}></svg>;
  }
}

export default ModelSalesPieChart;
