import React, {
  Component
} from 'react'
import './App.css'
import * as d3 from "d3";

var dataScat;

class ScatterPlot extends Component {
  constructor(props) {
    super(props)
    this.createScatterPlot = this.createScatterPlot.bind(this)
    this.drawScatterPlot = this.drawScatterPlot.bind(this)
  }

  componentDidMount() {
    this.createScatterPlot()
  }

  componentDidUpdate() {
    this.createScatterPlot()
  }

  createScatterPlot() {
    d3.csv("/project2.csv").then((data) => {
      dataScat = data;
      dataScat.forEach (function(d, i) {
      d.original_publication_year = +d.original_publication_year;
      });
      dataScat = dataScat.sort(function (a, b) {
          return d3.ascending(a.original_publication_year, b.original_publication_year);
      });
      this.drawScatterPlot();
    });

  }

  drawScatterPlot() {
    const node = this.node
    const height = 200
    const width = 1440
    const padding = 30
    const dataMax = d3.max(dataScat, function(d) {
      return d.work_ratings_count / 1000000;
    })
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataScat, function(d) { return d.original_publication_year; }))
        .range([padding,width-padding]);


    const xAxis = d3.axisBottom()
	                 .scale(xScale)
                   .tickFormat(d3.format("d"))
                   .ticks(15);

    d3.select(node)
      .selectAll('circle')
      .data(dataScat)
      .enter()
      .append('circle')
      .attr("r", 6)
      .style('fill', 'steelblue')
      .attr("opacity", "0.5")
      .attr("cx",function(d) {
          //  if (d.original_publication_year == xscale().min) {return padding;}
          return  xScale(d.original_publication_year);
          })
      .attr("cy", function(d) {
            return height - Math.floor(Math.random() * 101) - 50;})
      .append("title")
        .text(function(d) { return d.title; });

    d3.select(node)
      .append("g")
      .attr("transform","translate(0, " + (height - padding) +")")
      .call(xAxis);
  }

  render() {
    return <svg
    ref = {
      node => this.node = node
    }

    height = {
        220
      } >
      <
      /svg>
  }
}
export default ScatterPlot
