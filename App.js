var dataLine;
var brush;
var xScaleOverview, xScale, yScale;
var width;
var line, xAxis;
var focus;
var height;

d3.csv("sample.csv").then(function(data) {
  //  full_dataScat = data;
  dataLine = data;
  dataScat = data;
  //  dispatch = d3.dispatch("bookEnter");

  gen_lineChart();
  gen_scatterplot();
});

function gen_lineChart() {


  dataLine = d3.nest()
        .key(function(d) { return d.original_publication_year; })
        .rollup(function(v) { return d3.mean(v, function(d) { return d.average_rating; }); })
        .entries(dataLine);

  dataLine.forEach(function(d, i) {
    d.key = +d.key;
  });
  dataLine.sort(function(a, b) {
    return d3.ascending(a.key, b.key);
  });
  console.log(dataLine)


    height = 100 ;
    var heightOverview = 50;
    width = 900 ;

   xScale = d3.scaleLinear()
    .domain([1990, 2010])
    .range([20, width - 20]);

  xScaleOverview = d3.scaleLinear()
    .domain(d3.extent(dataLine.map(function(d) {
      return d.key;
    })))
    .range([20, width - 20]);


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
    .extent([[18,0], [881, 50]])
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
    .attr("width", width + 20)
    .attr("height", height + heightOverview + 30);

  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(0,0)");

  var context = svg.append("g")
    .attr("class", "context")
    .attr("height", heightOverview)
    .attr("transform", "translate(0,130)");

  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "steelblue")
    .attr("d", line);

  focus.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(20,5)")
    .call(yAxis);

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height+5) + ")")
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
    .attr("transform", "translate(0," + (heightOverview-20) + ")")
    .call(xAxisOverview);

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
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

  //  drawBrush(0.2, 0.4);
}


    function drawBrush(a, b) {
      // define our brush extent

      // note that x0 and x1 refer to the lower and upper bound of the brush extent
      // while x2 refers to the scale for the second x-axis, for the context or brush area.
      // unfortunate variable naming :-/
      var x0 = xScaleOverview.invert(a*width)
      var x1 = xScaleOverview.invert(b*width)
      //const [x0, x1] = selection.map(d => Math.round(xScaleOverview.invert(d)));
      console.log("x0", x0)
      console.log("x1", x1)
      brush.extent([x0, x1])

      // now draw the brush to match our extent
      // use transition to slow it down so we can see what is happening
      // set transition duration to 0 to draw right away
      brush.on(".end", brushended);

      // now fire the brushstart, brushmove, and brushend events
      // set transition the delay and duration to 0 to draw right away
    //  brush.brushSelection(d3.move(brushContainer, selectedDomain.map(xScaleOverview))).transition().delay(1000).duration(500)

    }

  function brushended() {
    const selection = d3.event.selection;
      if (!d3.event.sourceEvent || !selection) return;
      const [x0, x1] = selection.map(d => Math.round(xScaleOverview.invert(d)));
      
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
            .attr("transform", "translate(0," + (height+5) + ")")
            .call(xAxis);

      svgScat.selectAll(".dot").remove();
      svgScat.selectAll("circle")
           .data(filterDataScat(dataScat, xScaleScat.domain()))
           .enter().append("circle")
           .attr("r", 3)
           .attr("class", "dot")
           .attr("fill", "steelblue")
           .attr("opacity", "0.5")
           .attr("cx",function(d) {
             //  if (d.original_publication_year == xscale().min) {return padding;}
                   return  xScaleScat(d.original_publication_year) + Math.floor(Math.random() * 20);
             })
           .attr("cy", function(d) {
               return h - Math.floor(Math.random() * (h/2 +1)) - h/4;})
           .append("title")
             .text(function(d) { return d.title; });
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
    var w = 1200;
    h = 100;

    svgScat = d3.select("#scatterplot")
                .append("svg")
                .attr("width",w)
                .attr("height",h);


    var padding = 30;

    dataScat.forEach (function(d, i) {
      d.original_publication_year = +d.original_publication_year;
    });
    dataScat = dataScat.sort(function (a, b) {
          return d3.ascending(a.original_publication_year, b.original_publication_year);
    });


    xScaleScat = d3.scaleLinear()
                       .domain([1990, 2010])
                       .range([padding,w-padding]);



    xAxisScat = d3.axisBottom()
	                 .scale(xScaleScat)
                   .tickFormat(d3.format("d"));



    svgScat.append("g")
    .attr("class", "x axis")
   	.attr("transform","translate(0," + (h-20) + ")")
	   .call(xAxisScat);



   svgScat.selectAll("circle")
        .data(filterDataScat(dataScat, xScaleScat.domain()))
        .enter().append("circle")
        .attr("r", 3)
        .attr("class", "dot")
        .attr("fill", "steelblue")
        .attr("opacity", "0.5")
        .attr("cx",function(d) {
          //  if (d.original_publication_year == xscale().min) {return padding;}
                return  xScaleScat(d.original_publication_year) + Math.floor(Math.random() * 20);
          })
        .attr("cy", function(d) {
            return h - Math.floor(Math.random() * (h/2 +1)) - h/4;})
        .append("title")
          .text(function(d) { return d.title; });

}
