import React, { Component } from "react";
import * as d3 from "d3";

class ModelSalesPieChart extends Component {
  constructor(props) {
    super(props);
    this.pieChartRef = React.createRef();
  }

  componentDidMount() {
    d3.csv(this.props.data).then((data) => {
      const modelCounts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.model
      );

      const pieData = Array.from(modelCounts, ([model, count]) => ({
        model,
        count,
      }));

      this.createPieChart(pieData);
    });
  }

  createPieChart(pieData) {
    const width = 800;
    const height = 450;
    const margin = 40;
    const radius = Math.min(width - 200, height) / 2 - margin;

    const color = d3.scaleOrdinal(d3.schemeSet2);

    d3.select(this.pieChartRef.current).selectAll("*").remove();

    const svg = d3
      .select(this.pieChartRef.current)
      .attr("width", width)
      .attr("height", height);

    const pieGroup = svg
      .append("g")
      .attr("transform", `translate(${(width - 200) / 2},${height / 2})`);
    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const slices = pieGroup
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.model))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    svg
      .selectAll("text")
      .data(pie(pieData))
      .join("text")
      .text((d) => `${d.data.model}: ${d.data.count}`)
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x}, ${y})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - 220}, ${height / 2 - pieData.length * 10})`
      );

    const legend = legendGroup
      .selectAll(".legend-item")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => color(d.model));

    const modelMapping = {
      m3: "Model 3",
      my: "Model Y",
      ms: "Model S",
      mx: "Model X",
    };

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .text((d) => `${modelMapping[d.model] || d.model}: ${d.count}`);
  }

  render() {
    return <svg ref={this.pieChartRef}></svg>;
  }
}

export default ModelSalesPieChart;
