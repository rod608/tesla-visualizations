import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";
import "./App.css";
import tesla_sales from "./tesla_sales.csv";
import WheelsPieChart from "./WheelsPieChart";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            originalData: [],
            filteredData: [],
        };
        this.pieChartRef = React.createRef();
    }

    componentDidMount() {
        d3.csv(tesla_sales).then((data) => {
            const parseDate = d3.timeParse("%Y/%m/%d");
            const parsedData = data.map((d) => ({
                Date: parseDate(d.sold_date),
                Day: parseDate(d.sold_date).getDate(),
                Sales: +d.sales_count,
                model: d.model,
                week: +d.week,
                week_count: +d.week_count,
            }));

            console.log("Loaded Data:", parsedData);
            this.setState({
                originalData: parsedData,
                filteredData: parsedData,
            });

            this.createPieChart();
        });
    }

    componentDidUpdate() {
        const { filteredData, originalData } = this.state;

        if (originalData.length === 0) {
            console.log("No data to render.");
            return;
        }

        if (filteredData.length > 0) {
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

            svg.selectAll(".x-axis")
                .data([null])
                .join("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${innerHeight})`)
                .call(d3.axisBottom(x));

            svg.selectAll(".y-axis")
                .data([null])
                .join("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));

            svg.selectAll(".bar")
                .data(filteredData)
                .join("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.Day))
                .attr("y", (d) => y(d.Sales))
                .attr("width", x.bandwidth())
                .attr("height", (d) => innerHeight - y(d.Sales))
                .attr("fill", "#69b3a2");
        }

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

        svg.selectAll("path")
            .data(pie(pieData))
            .join("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => this.showTooltip(event, d.data.abbreviation))
            .on("mousemove", (event) => this.moveTooltip(event))
            .on("mouseout", () => this.hideTooltip());

        svg.selectAll("text")
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

    showTooltip(event, abbreviation) {
        const tooltip = d3
            .select("#tooltip")
            .style("opacity", 1)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 150}px`);

        const modelData = this.state.originalData.filter((d) => d.model === abbreviation);

        const color = d3
            .scaleOrdinal()
            .domain(["m3", "my", "ms", "mx"])
            .range(["#ff6347", "#69b3a2", "#4daf4a", "#984ea3"])(abbreviation);

        const width = 300;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = tooltip
            .select("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll("g")
            .data([null])
            .join("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
            .scaleBand()
            .domain(modelData.map((d) => d.week))
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(modelData, (d) => d.week_count)])
                        .range([height - margin.top - margin.bottom, 0]);

        svg.selectAll(".x-axis")
            .data([null])
            .join("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.selectAll(".y-axis")
            .data([null])
            .join("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(modelData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.week))
            .attr("y", (d) => y(d.week_count))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - margin.top - margin.bottom - y(d.week_count))
            .attr("fill", color);
    }

    moveTooltip(event) {
        d3.select("#tooltip")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 150}px`);
    }

    hideTooltip() {
        d3.select("#tooltip").style("opacity", 0);
    }

    render() {
        return (
            <div className="App" style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ width: "600px" }}>
                    <h1 style={{ textAlign: "left" }}>Tesla Sales per Day</h1>
                    <svg className="slider-range"></svg>
                    <div id="chart-container"></div>
                </div>
                <div style={{ marginLeft: "50px" }}>
                    <h2 style={{ textAlign: "center", marginLeft: "-170px" }}>Model Proportion</h2>
                    <svg ref={this.pieChartRef}></svg>
                </div>
                <div style={{ marginLeft: "50px" }}>
                    <h2 style={{ textAlign: "center", marginLeft: "-170px" }}>Wheels Proportion</h2>
                    <WheelsPieChart />
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





