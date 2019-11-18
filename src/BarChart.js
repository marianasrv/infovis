import React, {
  Component
} from 'react'
import './App.css'
import * as d3 from "d3";

var dataBar;

class BarChart extends Component {
  constructor(props) {
    super(props)
    this.createBarChart = this.createBarChart.bind(this)
    this.drawBarChart = this.drawBarChart.bind(this)
  }

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    d3.csv("/project2.csv").then((data) => {
      dataBar = data;
      this.drawBarChart();
    });

  }

  drawBarChart() {
    const node = this.node
    const height = 200
    const width = 500
    const padding = 30
    const dataMax = d3.max(dataBar, function(d) {
      return d.work_ratings_count / 1000000;
    })
    const xScale = d3.scaleLinear()
      .domain([0, dataMax])
      .range([padding, width - padding])
    const yScale = d3.scaleLinear()
      .domain([0, 4])
      .range([padding, height-padding])

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(function(d) { return d3.format(".1f")(d);})
      .ticks(10);

    d3.select(node)
      .selectAll('rect')
      .data(dataBar)
      .enter()
      .append('rect')
      .style('fill', 'steelblue')
      .attr('x', 0)
      .attr('y', (d, i) => yScale(i))
      .attr('height', 25)
      .attr('width', d => xScale(d.work_ratings_count / 1000000))

    d3.select(node)
      .append("g")
      .attr("transform","translate(" + (-padding) + ", " + (height + padding + 5) +")")
      .call(xAxis);
  }

  render() {
    return <svg
    ref = {
      node => this.node = node
    }
    width = {
      500
    }
    height = {
        1000
      } >
      <
      /svg>
  }
}
export default BarChart
