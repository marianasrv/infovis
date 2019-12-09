var dataLine, dataScat, dataBar, dataGenre, dataTitle, dataContext;
var svgBar, widthBar, heightBar;
var yScaleBar, xScaleBar, yZoom;
var groups, cibo_data;
var bar_h;
var xAxisBar;
var mainBar, zoomer, defs;
var brush;
var xScaleOverview, xScale, yScale;
var widthLine, widthScat, heightScat;
var line, xAxis;
var focus;
var height;
var dispatch;
var selectedBar, selectedBars, selectedDotsOnScat, selectedCircle, selectedOnLine, selectedDotOnLine;
var tooltip, showTooltip, hideTooltip, moveTooltip, showTooltipLine;
var genres, titles;



d3.csv("sampleBook.csv").then(function(data) {
  //full_dataScat = data;
  dataLine = data;
  dataScat = data;
  dataBar = data;
  dataGenre = data;
  dataTitle = data.sort(function (a,b) {return d3.ascending(a.title, b.title);});
  dispatch = d3.dispatch("MouseOver", "MouseLeave");

  tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute")

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  showTooltipLine = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", .8)
    tooltip
      .html(parseFloat(d.value).toFixed(2))
      .style("left", (d3.event.pageX) + 10 + "px")
      .style("top", (d3.event.pageY) + 10 + "px")
  }
  showTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", .8)
    tooltip
      .html(d.title)
      .style("left", (d3.event.pageX) + 10 + "px")
      .style("top", (d3.event.pageY) + 10 + "px")
  }
  moveTooltip = function(d) {
    tooltip
      .style("left", (d3.event.pageX) + 10 + "px")
      .style("top", (d3.event.pageY) + 10 + "px")
  }
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", 0)
  }

  genMenu();
  genLineChart();
  genScatterplot();
  genBarChart();



});

function genLineChart() {

  dataContext = d3.nest()
    .key(function(d) {
      return d.original_publication_year;
    })
    .rollup(function(v) {
      return d3.mean(v, function(d) {
        return d.average_rating;
      });
    })
    .entries(dataLine);

  dataContext.forEach(function(d, i) {
    d.key = +d.key;
  });
  dataContext.sort(function(a, b) {
    return d3.ascending(a.key, b.key);
  });



  height = 120;
  var heightOverview = 60;
  widthLine = 710;
  var padding = 30

  xScale = d3.scaleLinear()
    .domain([2010, 2015])
    .range([padding, widthLine - padding]);

  xScaleOverview = d3.scaleLinear()
    .domain([d3.min(dataContext, function(d) {
        return d.key;
      }),
      d3.max(dataContext, function(d) {
        return d.key;
      }) + 1
    ])
    .range([padding, widthLine - padding]);


  xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat(d3.format("d"))
    .ticks((xScale.domain()[1] - xScale.domain()[0]));

  var xAxisOverview = d3.axisBottom()
    .scale(xScaleOverview)
    .tickFormat(d3.format("d"))
    .ticks(10);

  yScale = d3.scaleLinear()
    .domain([3, 5])
    .range([height, 0]);

  var yScaleOverview = d3.scaleLinear()
    .domain([0, 5])
    .range([heightOverview, 0]);

  var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickFormat(d3.format("d"))
    .ticks(2);

  brush = d3.brushX()
    .extent([
      [30, 0],
      [widthLine - 29, 40]
    ])
    .on("end", brushended);


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
    .attr("transform", "translate(30,150)");

  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "#5C9AA8")
    .attr("d", line);

  focus.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(30,5)")
    .call(yAxis);

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);

  focus.selectAll("circle")
    .data(filterData(dataLine, xScale.domain()))
    .enter().append("circle")
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltipLine(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .attr("r", 3.5)
    .attr("class", "dot")
    .attr("title", function(d) {
      return d.title;
    })
    .attr("cx", function(d) {
      return xScale(d.key);
    })
    .attr("cy", function(d) {
      return yScale(d.value);
    })
    .attr("fill", "#5C9AA8")
    .attr("year", function(d) {
      return d.key;
    });

  focus.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -3)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", 10)
    .text("Average Rating");


  context.append("path")
    .datum(dataContext)
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "gray")
    .attr("d", lineOverview);

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (20) + ")")
    .call(xAxisOverview);

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .call(brush.move, [2010, 2015].map(xScaleOverview));


  context.append("text")
    .attr("transform",
      "translate(" + (widthLine / 2) + " ," +
      (heightOverview - 12) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 10)
    .text("Publication Year");

  context.selectAll("dot")
    .data(dataContext)
    .enter().append("circle")
    .attr("r", 1.5)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScaleOverview(d.key);
    })
    .attr("cy", function(d) {
      return yScaleOverview(d.value);
    })
    .style("fill", "gray");

  dispatch.on("MouseOver", function(book) {
    if (selectedBar) {
      selectedBar.attr("fill", "#5C9AA8");
    }
    if (selectedBars) {
      selectedBars.attr("fill", "#5C9AA8");
    }
    if (selectedDotsOnScat) {
      selectedDotsOnScat.attr("fill", "#5C9AA8");
      selectedDotsOnScat.attr("opacity", 0.5);
      selectedDotsOnScat.attr("r", 3);
      selectedDotsOnScat.style("z-index", "initial");
    }
    if (selectedDotOnLine) {
      selectedDotOnLine.attr("fill", "#5C9AA8");
    }
    if (selectedCircle) {
      selectedCircle.attr("fill", "#5C9AA8");
      selectedCircle.attr("opacity", 0.5);
      selectedCircle.attr("r", 3);
      selectedCircle.style("z-index", "initial");
    }
    if (selectedOnLine) {
      selectedOnLine.attr("fill", "#5C9AA8");
    }


    selectedCircle = d3.select("circle[title =\'" + book.title + "\']");
    selectedCircle.attr("opacity", 1);
    selectedCircle.attr("r", 7);
    selectedCircle.attr("fill", "#F1A758");
    selectedCircle.style("z-index", "-1");

    selectedOnLine = focus.select("circle[year =\'" + book.original_publication_year + "\']");
    selectedOnLine.attr("fill", "#F1A758");

    selectedDotsOnScat = svgScat.selectAll("circle[year =\'" + book.key + "\']");
    selectedDotsOnScat.attr("opacity", 1);
    selectedDotsOnScat.attr("r", 7);
    selectedDotsOnScat.attr("fill", "#F1A758");
    selectedDotsOnScat.style("z-index", "-1");

    selectedDotOnLine = focus.select("circle[year =\'" + book.key + "\']");
    selectedDotOnLine.attr("fill", "#F1A758");

    selectedBars = d3.selectAll("rect[year =\'" + book.key + "\']");
    selectedBars.attr("fill", "#F1A758");
    selectedBar = d3.select("rect[title =\'" + book.title + "\']");
    selectedBar.attr("fill", "#F1A758");

  });

  dispatch.on("MouseLeave", function(book) {
    if (selectedBar) {
      selectedBar.attr("fill", "#5C9AA8");
    }
    if (selectedBars) {
      selectedBars.attr("fill", "#5C9AA8");
    }
    if (selectedDotsOnScat) {
      selectedDotsOnScat.attr("fill", "#5C9AA8");
      selectedDotsOnScat.attr("opacity", 0.5);
      selectedDotsOnScat.attr("r", 3);
      selectedDotsOnScat.style("z-index", "initial");
    }
    if (selectedCircle) {
      selectedCircle.attr("fill", "#5C9AA8");
      selectedCircle.attr("opacity", 0.5);
      selectedCircle.attr("r", 3);
      selectedCircle.style("z-index", "initial");
    }
    if (selectedOnLine) {
      selectedOnLine.attr("fill", "#5C9AA8");
    }
    if (selectedDotOnLine) {
      selectedDotOnLine.attr("fill", "#5C9AA8");
    }
  })


}



function brushended() {
  const selection = d3.event.selection;
  if (!d3.event.sourceEvent || !selection) return;
  const [x0, x1] = selection.map(d => Math.round(xScaleOverview.invert(d)));

  if (x0 != xScale.domain()[0] || x1 != xScale.domain()[1]) {
    d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1].map(xScaleOverview) : null);
    xScale.domain(d3.event.selection === null ? xScaleOverview.domain() : [x0, x1]);
    xScaleScat.domain(d3.event.selection === null ? xScaleOverview.domain() : [x0, x1]);

    if ((xScale.domain()[1] - xScale.domain()[0]) < 4) {
      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 2 + 1);
      xAxisScat.ticks((xScaleScat.domain()[1] - xScaleScat.domain()[0]) / 2 + 1);
      if ((xScale.domain()[1] - xScale.domain()[0]) == 1) {
        xAxis.ticks(1);
        xAxisScat.ticks(1);
      }
    } else if ((xScale.domain()[1] - xScale.domain()[0]) > 45) {

      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 4);
      xAxisScat.ticks((xScaleScat.domain()[1] - xScaleScat.domain()[0]) / 4);
    } else {
      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 2);
      xAxisScat.ticks(xScaleScat.domain()[1] - xScaleScat.domain()[0]);
    }

    update()
  }
}

function update() {
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
    .style("stroke", "#5C9AA8")
    .attr("d", line);

  focus.selectAll(".dot").remove();
  focus.selectAll("circle")
    .data(filterData(dataLine, xScale.domain()))
    .enter().append("circle")
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltipLine(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .attr("r", 3.5)
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScale(d.key);
    })
    .attr("cy", function(d) {
      return yScale(d.value);
    })
    .attr("year", function(d) {
      return d.key;
    })
    .attr("fill", "#5C9AA8");


  focus.select(".x.axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);


  svgScat.selectAll(".dot").remove();
  svgScat.selectAll("circle")
    .data(filterDataScat(dataScat, xScaleScat.domain()))
    .enter().append("circle")
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltip(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .on("mousemove", function(d) {
      dispatch.call("MouseOver", d, d);
      moveTooltip(d);
    })
    .attr("r", 3)
    .attr("class", "dot")
    .attr("fill", "#5C9AA8")
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
      return heightScat - 20 - Math.floor(Math.random() * (heightScat / 2 + 1)) - heightScat / 4;

    })
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    });
  svgScat.select(".x.axis").call(xAxisScat);

  d3.select(".svgBar").remove();
  genBarChart();
}



function filterData(data, range) {

  var dataFilter = data.filter(d => genres.includes(d.tag_name) ); // && titles.includes(d.title) ????
  dataFilter = d3.nest()
    .key(function(d) {
      return d.original_publication_year;
    })
    .rollup(function(v) {
      return d3.mean(v, function(d) {
        return d.average_rating;
      });
    })
    .entries(dataFilter);

  dataFilter.forEach(function(d, i) {
    d.key = +d.key;
  });
  dataFilter.sort(function(a, b) {
    return d3.ascending(a.key, b.key);
  });

  const result = dataFilter.filter(d => d.key >= range[0] && d.key < range[1] );

  return result;
}

function filterDataScat(data, range) {

  const result = data.filter(d => d.original_publication_year >= range[0] && d.original_publication_year < range[1] &&
                                  genres.includes(d.tag_name)); // && titles.includes(d.title) ????

  return result;
}


function genScatterplot() {
  widthScat = 1200;
  heightScat = 120;

  svgScat = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widthScat)
    .attr("height", heightScat);


  var padding = 30;

  dataScat.forEach(function(d, i) {
    d.original_publication_year = +d.original_publication_year;
  });
  dataScat = dataScat.sort(function(a, b) {
    return d3.ascending(a.original_publication_year, b.original_publication_year);
  });


  xScaleScat = d3.scaleLinear()
    .domain([2010, 2015])
    .range([padding, widthScat - padding]);



  xAxisScat = d3.axisBottom()
    .scale(xScaleScat)
    .tickFormat(d3.format("d"))
    .ticks((xScaleScat.domain()[1] - xScaleScat.domain()[0]));



  svgScat.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (heightScat - 40) + ")")
    .call(xAxisScat);

  svgScat.append("text")
    .attr("transform",
      "translate(" + (widthScat / 2) + " ," +
      (heightScat - 10) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 10)
    .text("Publication Year");


  svgScat.selectAll("circle")
    .data(filterDataScat(dataScat, xScaleScat.domain()))
    .enter().append("circle")
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltip(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .on("mousemove", function(d) {
      dispatch.call("MouseOver", d, d);
      moveTooltip(d);
    })
    .attr("r", 3)
    .attr("class", "dot")
    .attr("fill", "#5C9AA8")
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
      return heightScat - 20 - Math.floor(Math.random() * (heightScat / 2 + 1)) - heightScat / 4;
    })
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    });

}


function genBarChart() {
  widthBar = 710;
  heightBar = 250;

  zoomer = d3.zoom()
    .extent([
      [30, 0],
      [widthLine - 29, 40]
    ])
    .wheelDelta(myDelta)
    .on("zoom", scrolled);


  svgBar = d3.select("#BarChart")
    .append("svg")
    .attr("class", "svgBar")
    .attr("width", widthBar)
    .attr("height", heightBar)
    .call(zoomer);

  var padding = 30;
  var bar_w = Math.floor((widthBar - padding * 2) / dataBar.length) - 1;


  dataBar.forEach(function(d, i) {
    d.work_ratings_count = +d.work_ratings_count;
  });
  dataBar = dataBar.sort(function(a, b) {
    return d3.descending(a.work_ratings_count, b.work_ratings_count);
  });
  /*
    yScaleBar = d3.scaleBand()
      .domain(dataBar.map(function(d) {
        return d.title;
      }))
      .range([padding, h - padding]);
  */


  yScaleBar = d3.scaleBand()
    .domain(filterDataScat(dataBar, xScale.domain()).map(function(d, i) {
      return i + 1;
    }))
    .range([heightBar - padding, padding]);

  xScaleBar = d3.scaleLinear()
  //  .domain([0, 5000000])
    .range([0, widthBar - 2 * padding]);

  yZoom = d3.scaleLinear()
    .range([heightBar - padding, padding])
    .domain([heightBar - padding, padding]);

    bar_h = yScaleBar.bandwidth() * (1/5 * filterDataScat(dataBar, xScale.domain()).length);
    var selected = yScaleBar.domain()
      .filter(function(d, i) { return (heightBar - yScaleBar(i + 1) + i * (bar_h + 10)  <= (heightBar - 30) && (30) <= heightBar - yScaleBar(i + 1) + i * (bar_h + 10)); });

    var maxXScale = d3.max(filterDataScat(dataBar, xScale.domain()), function(d, i) { return selected.indexOf(i + 1) > -1 ? d.work_ratings_count : 0; }) + 50000;
    xScaleBar.domain([0, maxXScale]);

  xAxisBar = d3.axisBottom() // create a d3 axis
    .scale(xScaleBar); // fit to our scale

  var yAxisBar = d3.axisLeft()
    .scale(yScaleBar)
    .tickSize(0)
    .tickSizeOuter(0);

    defs = svgBar.append("defs");

      defs.append("clipPath")
        .attr("id", "path")
        .append("rect")
        .attr("x", padding)
        .attr("y", 30)
        .attr("width", 670)
        .attr("height", 190);

  mainBar = svgBar.append("g")
    .attr("class", "BarWrapper")
    .attr("transform", "translate(0,-30)")
    .append("g") //another one for the clip path - due to not wanting to clip the labels
    .attr("class", "MainBar")
    .attr("clip-path", "url(#path)");



/*
    mainBar.append("g") // create a 'g' element to match our 'y' axis
        .attr("transform", "translate(30,0)") // 30 is the padding
        .attr("class","yaxis") // give css style
        .call(yAxisBar);
*/
    mainBar.selectAll("rect")
    .data(filterDataScat(dataBar, xScale.domain()))
    .enter().append("rect") // for each item append a bar
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltip(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .on("mousemove", function(d) {
      dispatch.call("MouseOver", d, d);
      moveTooltip(d);
    })
    .attr("height", bar_h) // each bar height depends on the number of bars
    .attr("width", function(d) {
      return xScaleBar(d.work_ratings_count); // each bar width is a score
    })
    .attr("y", function(d, i) { // d -> each item | i -> each item's index
      return heightBar - yScaleBar(i + 1) + i * (bar_h + 10); // com legenda : sem "heightBar -"
    })
    .attr("x", function(d) {
      return padding; // fit to our scale
    })
    .attr("fill", "#5C9AA8")
    .attr("class", "bar")
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    })
    .attr("popularity" , function(d) {
      return d.work_ratings_count;
    });



  d3.select(".BarWrapper")
    .append("g") // create a 'g' element to match our 'y' axis
    .attr("transform", "translate(30," + (heightBar - padding) + ")") // 30 is the padding
    .attr("class", "xaxis") // give css style
    .call(xAxisBar);

    d3.select(".BarWrapper").append("text")
      .attr("transform",
        "translate(" + (widthBar / 2) + " ," +
        (heightBar - 1) + ")")
      .style("text-anchor", "middle")
      .style("font-size", 10)
      .text("Reviews (Popularity)");



}

function scrolled() {

  /////////////////////////////////////////////////////////////
  ////////// Update the bars of the main bar chart ////////////
  /////////////////////////////////////////////////////////////

  var originalRange = yZoom.range();
  if (d3.event.sourceEvent.deltaY > 0) {
    //down

    if ((yZoom.domain()[1] - (bar_h + 10) - yScaleBar.step()) >= (heightBar - 30 - (bar_h + 10 + yScaleBar.step())*(filterDataScat(dataBar, xScale.domain()).length ))) {
      yZoom.domain([yZoom.domain()[0] - (bar_h + 10) - yScaleBar.step(), yZoom.domain()[1] - (bar_h + 10) - yScaleBar.step()]);
    }
  }
   else {
     // up
    if ((yZoom.domain()[0] + (bar_h + 10) + yScaleBar.step()) <= (heightBar - 30 + yScaleBar.step())) {
      yZoom.domain([yZoom.domain()[0] + (bar_h + 10) + yScaleBar.step(), yZoom.domain()[1] + (bar_h + 10) + yScaleBar.step()]);
    }
  }



  yScaleBar.domain(filterDataScat(dataBar, xScale.domain()).map(function(d, i) {
    return i + 1;
  }))

  yScaleBar.range([yZoom(originalRange[0]), yZoom(originalRange[1])]);

  var selected = yScaleBar.domain()
    .filter(function(d, i) { return (heightBar - yScaleBar(i + 1) + i * (bar_h + 10)  <= (heightBar - 30) && (30) <= heightBar - yScaleBar(i + 1) + i * (bar_h + 10)); });


  var newMaxXScale = d3.max(filterDataScat(dataBar, xScale.domain()), function(d, i) { return selected.indexOf(i + 1) > -1 ? d.work_ratings_count : 0; }) + 50000;
  xScaleBar.domain([0, newMaxXScale]);


   //Update the x axis of the big chart
   d3.select(".BarWrapper")
     .select(".xaxis")
     .transition().duration(50)
     .call(xAxisBar);

  mainBar.selectAll(".bar").remove();
  mainBar.selectAll("rect")
    .data(filterDataScat(dataBar, xScale.domain()))
    .enter().append("rect")
    .attr("class", "bar")
    .on("mouseover", function(d) {
      dispatch.call("MouseOver", d, d);
      showTooltip(d);
    })
    .on("mouseleave", function(d) {
      dispatch.call("MouseLeave", d, d);
      hideTooltip(d);
    })
    .on("mousemove", function(d) {
      dispatch.call("MouseOver", d, d);
      moveTooltip(d);
    })
    .attr("fill", "#5C9AA8")
    .attr("height", bar_h) // each bar height depends on the number of bars
    .attr("width", function(d) {
      return xScaleBar(d.work_ratings_count); // each bar width is a score
    })
    .attr("y", function(d, i) { // d -> each item | i -> each item's index
      return heightBar - yScaleBar(i + 1) + i * (bar_h + 10); // com legenda : sem "heightBar -"
    })
    .attr("x", function(d) {
      return 30; // fit to our scale
    })
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    })
    .attr("popularity" , function(d) {
      return d.work_ratings_count;
    })
    .transition().duration(150);





}

function myDelta() {
  return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / 1500;
}


function genMenu() {

dataGenre.sort(function (a,b) {return d3.ascending(a.tag_name, b.tag_name);});
genres = d3.map(dataGenre, function(d){return d.tag_name;}).keys();
console.log(genres);

dataTitle.sort(function (a,b) {return d3.ascending(a.title, b.title);});
titles = d3.map(dataTitle, function(d){return d.title;}).keys();

$('#multiselectGenre').multiselect({
  buttonWidth : '160px',
  includeSelectAllOption : true,
  enableFiltering: true,
  filterPlaceholder: 'Search',
  nonSelectedText: 'Select a Genre',
  selectAllText: 'Select All',
  nSelectedText: ' selected elements',
  allSelectedText: 'All Genre'
});

d3.select("#multiselectGenre").selectAll("option")
    .data(genres)
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value",function(d){return d;});

$('#multiselectGenre').multiselect('rebuild');


$('#multiselectTitle').multiselect({
  buttonWidth : '160px',
  includeSelectAllOption : true,
  enableFiltering: true,
  filterPlaceholder: 'Search',
  nonSelectedText: 'Select a Title',
  selectAllText: 'Select All',
  nSelectedText: ' selected elements',
  allSelectedText: 'All Books'
});

d3.select("#multiselectTitle").selectAll("option")
    .data(titles)
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value",function(d){return d;});

$('#multiselectTitle').multiselect('rebuild');

/*
$.each(cibo_data, function(key, value) {
     $('#multiselectGenre')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(value["label"]));
});
$('#multiselectGenre').multiselect('rebuild');


var selector = d3.select("#multiselectGenre")
  .selectAll("option")
  .data(cibo_data)
  .enter().append("option")
  .text( function(d){return d.label;})
  .attr("value", function (d, i) {
    return i;
  });


groups_data = d3.nest()
  .key(function(d) {
    return d.group;
  })
  .entries(cibo_data);

console.log(groups_data)

groups = d3.select('#Genre').selectAll('optgroup')
  .data(groups_data);

groups.enter().append('optgroup')
  .attr("label", function(d) {
    return d.key;
  });

cibo = groups.selectAll("option")
  .data(function(d) {
    return d.values;
  });


cibo.enter().append("option")
  .text(function(d) {
    return d.label;
  })
  .attr("value", function(d) { return d.label;});


var on_selection_changed = function() {
  so_values = []
//  for so in d3.select('#Genre').node().selectedOptions(){
//        so_values.push(so.value)
//  }
  console.log(so_values)
}

$('#Genre').multiselect
  buttonWidth: '300px'
  maxHeight: 400
  enableClickableOptGroups: true
  enableCollapsibleOptGroups: true
  enableFiltering: true
  filterPlaceholder: 'Cerca'
  includeSelectAllOption: true
  selectAllJustVisible: false
  selectAllText: 'Selecionar tudo'
  nSelectedText: ' Elemetento selecionado'
  allSelectedText: 'Todos os elementos selecionados'
  nonSelectedText: 'Nenhum elemento selecionado'
  onChange: on_selection_changed
  onSelectAll: on_selection_changed
  onDeselectAll: on_selection_changed
  */
  /*
  var selector = d3.select("#Title")
    //  .append("select")
      .attr("id", "titleSelector")
      .selectAll("option")
      .data(dataGenre)
      .enter().append("option")
      .text( function(d){return d.title;})
      .style("text-overflow", "ellipsis")
      .attr("value", function (d, i) {
        return i;
      });
      */
}
/*
$(document).ready(function() {
  $('#multiselectGenre').multiselect({
    buttonWidth : '160px',
    includeSelectAllOption : true,
    enableFiltering: true,
    filterPlaceholder: 'Search',
		nonSelectedText: 'Select a Genre',
    selectAllText: 'Select all',
    nSelectedText: ' selected elements',
    allSelectedText: 'All selected'
  });
  $('#multiselectGenre').multiselect('selectAll', false);
  $('#multiselectGenre').multiselect('updateButtonText');
});
*/
function getSelectedValues() {
  var selectedGenreVal = $("#multiselectGenre").val();
  var selectedTitleVal = $("#multiselectTitle").val();
  if (selectedGenreVal != null && selectedTitleVal != null) {
    genValues = []
    titleValues = []
	  for(var i=0; i<selectedGenreVal.length; i++){
		    genValues.push(selectedGenreVal[i])
	  }
    for(var i=0; i<selectedTitleVal.length; i++){
 		    titleValues.push(selectedTitleVal[i])
 	    }
    console.log(genValues)
    genres = genValues;
    titles = titleValues;
    update();
    }
  else if (selectedGenreVal == null && selectedTitleVal != null) {
    genres = d3.map(dataGenre, function(d){return d.tag_name;}).keys();
    titleValues = []

  for(var i=0; i<selectedTitleVal.length; i++){
      titleValues.push(selectedTitleVal[i])
    }
    titles = titleValues;
    update();
  }

  else if (selectedGenreVal != null && selectedTitleVal == null) {
    genValues = []

	  for(var i=0; i<selectedGenreVal.length; i++){
		    genValues.push(selectedGenreVal[i])
      }
    genres = genValues;
    titles = d3.map(dataTitle, function(d){return d.title;}).keys();
    update();
  }
  else {
    genres = d3.map(dataGenre, function(d){return d.tag_name;}).keys();
    titles = d3.map(dataTitle, function(d){return d.title;}).keys();
    update();
  }
}
