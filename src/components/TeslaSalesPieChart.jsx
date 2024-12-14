import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";

class TeslaSalesPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalData: [],
      filteredData: [],
    };
  }

  componentDidMount() {
    d3.csv(this.props.data).then((data) => {
      const parseDate = d3.timeParse("%Y/%m/%d");
      const parsedData = data.map((d) => ({
        Date: parseDate(d.sold_date),
        Day: parseDate(d.sold_date).getDate(),
        Sales: +d.sales_count,
        model: d.model,
        week: +d.week,
        week_count: +d.week_count,
      }));

      this.setState({
        originalData: parsedData,
        filteredData: parsedData,
      });

      this.createBarChart();
    });
  }

  componentDidUpdate() {
    this.createBarChart();
  }

  createBarChart() {
    const { filteredData, originalData } = this.state;

    if (originalData.length === 0) {
      return;
    }

    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 600;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select("#chart-container")
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width)
      .attr("height", height)
      .selectAll("g")
      .data([null])
      .join("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.Day))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.Sales) * 1.1])
      .range([innerHeight, 0]);

    svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    svg
      .selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    svg
      .selectAll(".bar")
      .data(filteredData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Day))
      .attr("y", (d) => y(d.Sales))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.Sales))
      .attr("fill", "#69b3a2");

    const minDay = d3.min(originalData, (d) => d.Day);
    const maxDay = d3.max(originalData, (d) => d.Day);

    const sliderRange = sliderBottom()
      .min(minDay)
      .max(maxDay)
      .width(300)
      .step(1)
      .default([minDay, maxDay])
      .fill("#69b3a2")
      .on("onchange", ([start, end]) => {
        const filtered = originalData.filter(
          (d) => d.Day >= start && d.Day <= end
        );
        this.setState({ filteredData: filtered });
      });

    const gRange = d3
      .select(".slider-range")
      .attr("width", 500)
      .attr("height", 100)
      .selectAll(".slider-g")
      .data([null])
      .join("g")
      .attr("class", "slider-g")
      .attr("transform", "translate(30,30)");

    gRange.call(sliderRange);
  }

  render() {
    return (
      <div>
        <h1 style={{ textAlign: "left" }}>Tesla Sales per Day</h1>
        <svg className="slider-range"></svg>
        <div id="chart-container"></div>
      </div>
    );
  }
}

export default TeslaSalesPieChart;
