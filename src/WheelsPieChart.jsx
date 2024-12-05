// WheelsPieChart.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const WheelsPieChart = () => {
  const chartRef = useRef();

  useEffect(() => {
    // Adjust the path if necessary
    d3.csv("/data/dataset.csv") // Use relative path from the public folder
      .then((data) => {
        console.log("Loaded Data:", data); // Debugging: Check loaded data

        // Check if 'wheels' column exists
        if (!data[0] || !data[0].hasOwnProperty("wheels")) {
          console.error("CSV does not contain 'wheels' column.");
          return;
        }

        // Handle undefined or missing 'wheels' values
        const wheelCounts = d3.rollup(
          data,
          (v) => v.length,
          (d) => (d.wheels ? d.wheels.trim() : "Unknown") // Default to 'Unknown' if undefined
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

        const width = 800; // Increased width to accommodate legend
        const height = 450;
        const margin = 40;

        const radius = Math.min(width - 200, height) / 2 - margin; // Adjusted radius calculation

        d3.select(chartRef.current).selectAll("*").remove(); // Clear previous content

        const svg = d3
          .select(chartRef.current)
          .attr("width", width)
          .attr("height", height);

        const pieGroup = svg
          .append("g")
          .attr(
            "transform",
            `translate(${(width - 200) / 2},${height / 2})`
          ); // Adjusted pie chart position

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

        // Add a legend
        const legendGroup = svg
          .append("g")
          .attr(
            "transform",
            `translate(${width - 220}, ${height / 2 - topWheels.length * 10})`
          ); // Adjusted legend position

        const legend = legendGroup
          .selectAll(".legend-item")
          .data(topWheels)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        // Add legend color boxes
        legend
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", (d) => color(d.wheel));

        // Add legend text
        legend
          .append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font-size", "12px")
          .text((d) => `${capitalizeAndReplace(d.wheel)}: ${d.count}`);

        // Tooltip
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

            // Filter data for the selected wheel size
            const filteredData = data.filter(
              (row) => row.wheels && row.wheels.trim() === d.data.wheel
            );

            // Aggregate data by year
            const yearCounts = d3.rollup(
              filteredData,
              (v) => v.length,
              (d) => d.year
            );

            let yearArray = Array.from(yearCounts, ([year, count]) => ({
              year,
              count,
            }));

            // Sort yearArray by year
            yearArray.sort((a, b) => a.year - b.year);

            tooltip.selectAll("*").remove(); // Clear previous tooltip content

            if (d.data.wheel !== "Others") {
              // Create bar chart data
              const miniWidth = 200;
              const miniHeight = 100;
              const miniMargin = { top: 10, right: 10, bottom: 30, left: 30 };

              const miniSvg = tooltip
                .append("svg")
                .attr(
                  "width",
                  miniWidth + miniMargin.left + miniMargin.right
                )
                .attr(
                  "height",
                  miniHeight + miniMargin.top + miniMargin.bottom
                )
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
                .attr(
                  "transform",
                  `translate(0, ${miniHeight})`
                )
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

              const y = d3
                .scaleLinear()
                .domain([0, d3.max(yearArray, (d) => d.count) || 1])
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
                .attr(
                  "height",
                  (d) => miniHeight - y(d.count)
                )
                .attr("fill", color(d.data.wheel));
            }

            tooltip
              .append("div")
              .style("text-align", "center")
              .style("margin-top", "10px")
              .text(
                `${capitalizeAndReplace(d.data.wheel)}: ${d.data.count}`
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
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  const capitalizeAndReplace = (str) => {
    const wheelSizeMap = {
      EIGHTEEN: "Eighteen Inch",
      NINETEEN: "Nineteen Inch",
      TWENTY: "Twenty Inch",
      TWENTY_ONE: "Twenty One Inch",
      TWENTY_TWO: "Twenty Two Inch",
    };
    return wheelSizeMap[str] || str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return <svg ref={chartRef}></svg>;
};

export default WheelsPieChart;