import { useEffect, useRef } from "react";
import * as d3 from "d3";

const WheelsSalesPieChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    d3.csv(data).then((data) => {
      const wheelCounts = d3.rollup(
        data,
        (v) => v.length,
        (d) => typeof d.wheels === "string" && d.wheels.trim()
      );

      let wheelsArray = Array.from(wheelCounts, ([wheel, count]) => ({
        wheel,
        count,
      }));
      wheelsArray.sort((a, b) => b.count - a.count);

      const topN = 5;
      const totalVehicles = d3.sum(wheelsArray, (d) => d.count);
      const topWheels = wheelsArray.slice(0, topN);
      const otherWheelsCount = wheelsArray
        .slice(topN)
        .reduce((sum, d) => sum + d.count, 0);

      if (otherWheelsCount > 0) {
        topWheels.push({ wheel: "Others", count: otherWheelsCount });
      }

      const width = 800,
        height = 450,
        margin = 40;

      const radius = Math.min(width - 200, height) / 2 - margin;

      d3.select(chartRef.current).selectAll("*").remove();

      const svg = d3
        .select(chartRef.current)
        .attr("width", width)
        .attr("height", height);

      const pieGroup = svg
        .append("g")
        .attr("transform", `translate(${(width - 200) / 2},${height / 2})`);

      const color = d3
        .scaleOrdinal()
        .domain(topWheels.map((d) => d.wheel))
        .range(d3.schemeSet2);

      const pie = d3.pie().value((d) => d.count);

      const data_ready = pie(topWheels);

      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const slices = pieGroup
        .selectAll("slices")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.wheel))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

      const legendGroup = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - 220}, ${height / 2 - topWheels.length * 10})`
        );

      const legend = legendGroup
        .selectAll(".legend-item")
        .data(topWheels)
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
        .attr("fill", (d) => color(d.wheel));

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text((d) => `${capitalizeAndReplace(d.wheel)}: ${d.count}`);

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

          const filteredData = data.filter(
            (row) =>
              typeof row.wheels === "string" &&
              row.wheels.trim() === d.data.wheel
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

          if (d.data.wheel !== "Others") {
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
              .attr("fill", color(d.data.wheel));
          }

          tooltip
            .append("div")
            .style("text-align", "center")
            .style("margin-top", "10px")
            .text(`${capitalizeAndReplace(d.data.wheel)}: ${d.data.count}`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
    });
  }, [data]);

  const capitalizeAndReplace = (str) => {
    if (typeof str !== "string") {
      return "";
    }

    const wheelSizeMap = {
      EIGHTEEN: "Eighteen Inch",
      NINETEEN: "Nineteen Inch",
      TWENTY: "Twenty Inch",
      TWENTY_ONE: "Twenty One Inch",
      TWENTY_TWO: "Twenty Two Inch",
    };

    return (
      wheelSizeMap[str] ||
      str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  return <svg ref={chartRef}></svg>;
};

export default WheelsSalesPieChart;
