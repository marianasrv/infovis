var dataLine;

d3.csv("project2.csv").then(function(data) {
  //  full_dataScat = data;
  dataLine = data;
  //  dispatch = d3.dispatch("bookEnter");
  dataLine.forEach(function(d, i) {
    d.original_publication_year = +d.original_publication_year;
  });
  dataLine = dataLine.sort(function(a, b) {
    return d3.ascending(a.original_publication_year, b.original_publication_year);
  });
  gen_lineChart();
});

function gen_lineChart() {

  var w = 900;
  var h = 300;
  var padding = 30;

  var svg = d3.select("#lineChart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var xscale = d3.scaleTime()
    .domain(d3.extent(dataLine, function(d) {
      return d.original_publication_year;
    }))
    .range([0, w]);



  var xaxis = d3.axisBottom()
    .scale(xscale)
    .tickFormat(d3.format("d"))
    .ticks(10);


  var hscale = d3.scaleLinear()
    .domain([0, 5])
    .range([h - padding, padding]);

  var yaxis = d3.axisLeft()
    .scale(hscale)
    .tickFormat(d3.format("d"))
    .ticks(5);

  var line = d3.line()
    .x(function(d) {
      return xscale(d.original_publication_year);
    })
    .y(function(d) {
      return hscale(d.average_rating);
    });

  svg.append("g")
    .attr("transform", "translate(30,0)")
    .attr("class", "y axis")
    .call(yaxis);

  svg.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xaxis);


  svg.append("path")
    .datum(dataLine)
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "steelblue")
    .attr("d", line);

  svg.selectAll("dot")
    .data(dataLine)
    .enter().append("circle")
    .attr("r", 3)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xscale(d.original_publication_year);
    })
    .attr("cy", function(d) {
      return hscale(d.average_rating);
    })
    .style("fill", "steelblue")
    .append("title")
    .text(function(d) {
      return d.title;
    });

}
