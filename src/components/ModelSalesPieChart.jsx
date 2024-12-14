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

      this.createPieChart(pieData, data);
    });
  }

  createPieChart(pieData, originalData) {
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

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)");

    slices
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible");

        const filteredData = originalData.filter(
          (row) => row.model === d.data.model
        );

        const yearCounts = d3.rollup(
          filteredData,
          (v) => v.length,
          (d) => d.year
        );

        let yearArray = Array.from(yearCounts, ([year, count]) => ({
          year,
          count,
        }));

        yearArray.sort((a, b) => a.year - b.year);

        tooltip.selectAll("*").remove();

        const miniWidth = 200;
        const miniHeight = 100;
        const miniMargin = { top: 10, right: 10, bottom: 30, left: 30 };

        const miniSvg = tooltip
          .append("svg")
          .attr("width", miniWidth + miniMargin.left + miniMargin.right)
          .attr("height", miniHeight + miniMargin.top + miniMargin.bottom)
          .append("g")
          .attr(
            "transform",
            `translate(${miniMargin.left}, ${miniMargin.top})`
          );

        const x = d3
          .scaleBand()
          .domain(yearArray.map((d) => d.year))
          .range([0, miniWidth])
          .padding(0.1);

        miniSvg
          .append("g")
          .attr("transform", `translate(0, ${miniHeight})`)
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(yearArray, (d) => d.count)])
          .range([miniHeight, 0]);

        miniSvg.append("g").call(d3.axisLeft(y));

        miniSvg
          .selectAll(".bar")
          .data(yearArray)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.year))
          .attr("y", (d) => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", (d) => miniHeight - y(d.count))
          .attr("fill", color(d.data.model));

        tooltip
          .append("div")
          .style("text-align", "center")
          .style("margin-top", "10px")
          .text(
            `${modelMapping[d.data.model] || d.data.model}: ${d.data.count}`
          );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });
  }

  render() {
    return <svg ref={this.pieChartRef}></svg>;
  }
}

export default ModelSalesPieChart;
