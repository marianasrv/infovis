var dataLine, dataScat, dataBar;
var brush;
var xScaleOverview, xScale, yScale;
var widthLine, widthScat;
var line, xAxis;
var focus;
var height;

d3.csv("sample.csv").then(function(data) {
  //  full_dataScat = data;
  dataLine = data;
  dataScat = data;
  dataBar = data.slice(0, 5);
  //  dispatch = d3.dispatch("bookEnter");

  gen_lineChart();
  gen_scatterplot();
  genBarChart();
});

function gen_lineChart() {


  dataLine = d3.nest()
    .key(function(d) {
      return d.original_publication_year;
    })
    .rollup(function(v) {
      return d3.mean(v, function(d) {
        return d.average_rating;
      });
    })
    .entries(dataLine);

  dataLine.forEach(function(d, i) {
    d.key = +d.key;
  });
  dataLine.sort(function(a, b) {
    return d3.ascending(a.key, b.key);
  });


  height = 100;
  var heightOverview = 50;
  widthLine = 900;
  var padding = 30

  xScale = d3.scaleLinear()
    .domain([1950, 2015])
    .range([padding, widthLine - padding]);

  xScaleOverview = d3.scaleLinear()
    .domain(d3.extent(dataLine.map(function(d) {
      return d.key;
    })))
    .range([padding, widthLine - padding]);


  xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat(d3.format("d"));

  var xAxisOverview = d3.axisBottom()
    .scale(xScaleOverview)
    .tickFormat(d3.format("d"));

  yScale = d3.scaleLinear()
    .domain([0, 5])
    .range([height, 0]);

  var yScaleOverview = d3.scaleLinear()
    .domain([0, 5])
    .range([heightOverview, 0]);

  var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickFormat(d3.format("d"))
    .ticks(5);

  brush = d3.brushX()
    .extent([
      [18, 0],
      [881, 57]
    ])
    .on("end", brushended);

  //d3.select(this).transition().call(brush.move,  [2000, 2010].map(xScaleOverview));

  line = d3.line()
    .x(function(d) {
      return xScale(d.key);
    })
    .y(function(d) {
      return yScale(d.value);
    });

  var lineOverview = d3.line()
    .x(function(d) {
      return xScaleOverview(d.key);
    })
    .y(function(d) {
      return yScaleOverview(d.value);
    });

  var svg = d3.select("#lineChart")
    .append("svg")
    .attr("width", widthLine + 30)
    .attr("height", height + heightOverview + 30);

  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widthLine)
    .attr("height", height);

  focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(30,0)");

  var context = svg.append("g")
    .attr("class", "context")
    .attr("height", heightOverview)
    .attr("transform", "translate(30,130)");

  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "steelblue")
    .attr("d", line);

  focus.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(30,5)")
    .call(yAxis);

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);

  focus.selectAll("dot")
    .data(filterData(dataLine, xScale.domain()))
    .enter().append("circle")
    .attr("r", 2)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScale(d.key);
    })
    .attr("cy", function(d) {
      return yScale(d.value);
    })
    .style("fill", "steelblue")
    .append("title")
    .text(function(d) {
      return d.title;
    });

  context.append("path")
    .datum(dataLine)
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "gray")
    .attr("d", lineOverview);

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (heightOverview - padding) + ")")
    .call(xAxisOverview);

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .call(brush.move, [1950, 2015].map(xScaleOverview))
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", heightOverview + 7);

  context.selectAll("dot")
    .data(dataLine)
    .enter().append("circle")
    .attr("r", 2)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScaleOverview(d.key);
    })
    .attr("cy", function(d) {
      return yScaleOverview(d.value);
    })
    .style("fill", "gray")
    .append("title")
    .text(function(d) {
      return d.title;
    });

}



function brushended() {
  const selection = d3.event.selection;
  if (!d3.event.sourceEvent || !selection) return;
  const [x0, x1] = selection.map(d => Math.round(xScaleOverview.invert(d)));
  //console.log([x0, x1])
  d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1].map(xScaleOverview) : null);
  xScale.domain(d3.event.selection === null ? xScaleOverview.domain() : [x0, x1]);
  xScaleScat.domain(d3.event.selection === null ? xScaleOverview.domain() : [x0, x1]);

  line = d3.line()
    .x(function(d) {
      return xScale(d.key);
    })
    .y(function(d) {
      return yScale(d.value);
    })
  focus.select(".line").remove();
  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "steelblue")
    .attr("d", line);

  focus.selectAll(".dot").remove();
  focus.selectAll("dot")
    .data(filterData(dataLine, xScale.domain()))
    .enter().append("circle")
    .attr("r", 2)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScale(d.key);
    })
    .attr("cy", function(d) {
      return yScale(d.value);
    })
    .style("fill", "steelblue")
    .append("title")
    .text(function(d) {
      return d.title;
    });
  focus.select(".x.axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);

  svgScat.selectAll(".dot").remove();
  svgScat.selectAll("circle")
    .data(filterDataScat(dataScat, xScaleScat.domain()))
    .enter().append("circle")
    .attr("r", 3)
    .attr("class", "dot")
    .attr("fill", "steelblue")
    .attr("opacity", "0.5")
    .attr("cx", function(d) {
      if (d.original_publication_year >= xScaleScat.domain()[1]) {
        cx = xScaleScat(d.original_publication_year)
      } else {
        cx = xScaleScat(d.original_publication_year) + Math.floor(Math.random() * (1140 / (xScaleScat.domain()[1] - xScaleScat.domain()[0])));
      }
      return cx;
    })
    .attr("cy", function(d) {
      return h - Math.floor(Math.random() * (h / 2 + 1)) - h / 4;
    })
    .append("title")
    .text(function(d) {
      return d.title;
    });
  svgScat.select(".x.axis").call(xAxisScat);
}

function filterData(data, range) {

  const result = data.filter(d => d.key >= range[0] && d.key <= range[1]);

  return result;
}

function filterDataScat(data, range) {

  const result = data.filter(d => d.original_publication_year >= range[0] && d.original_publication_year < range[1]);

  return result;
}


function gen_scatterplot() {
  widthScat = 1200;
  h = 100;

  svgScat = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widthScat)
    .attr("height", h);


  var padding = 30;

  dataScat.forEach(function(d, i) {
    d.original_publication_year = +d.original_publication_year;
  });
  dataScat = dataScat.sort(function(a, b) {
    return d3.ascending(a.original_publication_year, b.original_publication_year);
  });


  xScaleScat = d3.scaleLinear()
    .domain([1950, 2015])
    .range([padding, widthScat - padding]);



  xAxisScat = d3.axisBottom()
    .scale(xScaleScat)
    .tickFormat(d3.format("d"));



  svgScat.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h - 20) + ")")
    .call(xAxisScat);



  svgScat.selectAll("circle")
    .data(filterDataScat(dataScat, xScaleScat.domain()))
    .enter().append("circle")
    .attr("r", 3)
    .attr("class", "dot")
    .attr("fill", "steelblue")
    .attr("opacity", "0.5")
    .attr("cx", function(d) {

      if (d.original_publication_year >= xScaleScat.domain()[1]) {
        cx = xScaleScat(d.original_publication_year)
      } else {
        cx = xScaleScat(d.original_publication_year) + Math.floor(Math.random() * (1140 / (xScaleScat.domain()[1] - xScaleScat.domain()[0])));
      }
      return cx;
    })
    .attr("cy", function(d) {
      return h - Math.floor(Math.random() * (h / 2 + 1)) - h / 4;
    })
    .append("title")
    .text(function(d) {
      return d.title;
    });
}


function genBarChart() {
  w = 900;
  h = 300;

  svg = d3.select("#BarChart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var padding = 30;
  var bar_w = Math.floor((w - padding * 2) / dataBar.length) - 1;
  var bar_h = Math.floor((h - padding * 2) / dataBar.length) - 1;

  dataBar.forEach(function(d, i) {
    d.work_ratings_count = +d.work_ratings_count;
  });
  dataBar = dataBar.sort(function(a, b) {
    return d3.descending(a.work_ratings_count, b.work_ratings_count);
  });

  yScaleBar = d3.scaleLinear()
    .domain([0, dataBar.length])
    .range([h - padding, padding]);

  xScaleBar = d3.scaleLinear()
    .domain([0, 5000000])
    .range([padding, w - padding]);


  var yAxisBar = d3.axisLeft()
    .scale(d3.scaleLinear()
      .domain([dataBar[0].oscar_year, dataBar[dataBar.length - 1].oscar_year])
      .range([padding + bar_w / 2, w - padding - bar_w / 2]))
    .tickFormat(d3.format("d"))
    .ticks(dataBar.length / 4);

  svg.selectAll("rect")
    .data(dataBar)
    .enter().append("rect") // for each item append a bar
    .attr("height", bar_h) // each bar width depends on the number of bars
    .attr("width", function(d) {
      return xScaleBar(d.work_ratings_count); // each bar height is a score
    })
    .attr("fill", "purple")
    .attr("y", function(d, i) { // d -> each item | i -> each item's index
      return h - yScaleBar(i); // set each bar position
    })
    .attr("x", function(d) {
      return padding; // fit to our scale
    })
    .append("title").text((d) => d.title);
}
