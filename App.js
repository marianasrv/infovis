var dataLine, dataScat, dataBar, dataNet, dataGenre, dataTitle, dataAuthors, dataContext;
var dataBarFilter;
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
var focus, context;
var height;
var dispatch;
var selectedBar, selectedBars, selectedDotsOnScat, selectedCircle, selectedOnLine, selectedDotOnLine, selectedNode;
var selectedNodes, otherNodes, selectedLinks;
var tooltip, showTooltip, hideTooltip, moveTooltip, showTooltipLine, showTooltipNetwork;
var genres, titles, authors, allAuthors, auxAuthors;
var svgNetwork, dataFilterLink, dataFilterNode;
var allLinks, allNodes;
var link, node, simulation, color;
var firstTime = 1, menu = 0, years = 0;

var opts = {
  lines: 20, // The number of lines to draw
  length: 80, // The length of each line
  width: 30, // The line thickness
  radius: 84, // The radius of the inner circle
  scale: 0.45, // Scales overall size of the spinner
  corners: 0.4, // Corner roundness (0..1)
  color: '#1f77b4', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1.1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-shrink', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};


d3.csv("sample.csv").then(function(data) {
  //full_dataScat = data;
  dataLine = data;
  dataScat = data;
  dataBar = data;
  dataGenre = data;
  dataTitle = data;
  dataAuthors = data;
  // dataNet = data.slice(0, 10);
  d3.json("data.js").then(function(data) {
    console.log(data); // this is your data
    dataNet = data;
    allLinks = dataNet.Links;
    allNodes = dataNet.Nodes;
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
    showTooltipNetwork = function(d) {
      tooltip
        .transition()
        .duration(100)
        .style("opacity", .8)
      tooltip
        .html('<span> Title: ' + d.title + '\n' + ', Author: ' + d.author + ', Rating: ' + d.rating + '</span>')
        .style("left", (d3.event.pageX) + 10 + "px")
        .style("top", (d3.event.pageY) + 10 + "px")
    }
    showTooltip = function(d) {
      tooltip
        .transition()
        .duration(100)
        .style("opacity", .8)
      tooltip
        .html('<span> Title: ' + d.title + '\n' + ', Author: ' + d.authors + ', Rating: ' + d.average_rating + '</span>')
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
    genNetwork();

    spinner.stop();
    target.classList.remove("opaque");
  })
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
    .domain([2015, 2017])
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

  context = svg.append("g")
    .attr("class", "context")
    .attr("height", heightOverview)
    .attr("transform", "translate(30,150)");

  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "#1f77b4")
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
    .attr("fill", "#1f77b4")
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
    .call(brush.move, [2015, 2017].map(xScaleOverview));


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
      selectedBar.attr("fill", "#1f77b4");
    }
    if (selectedBars) {
      selectedBars.attr("fill", "#1f77b4");
    }
    if (selectedDotsOnScat) {
      selectedDotsOnScat.attr("fill", "#1f77b4");
      selectedDotsOnScat.attr("opacity", 0.5);
      selectedDotsOnScat.attr("r", 3);
      selectedDotsOnScat.lower();
    }
    if (selectedDotOnLine) {
      selectedDotOnLine.attr("fill", "#1f77b4");
    }
    if (selectedCircle) {
      selectedCircle.attr("fill", "#1f77b4");
      selectedCircle.attr("opacity", 0.5);
      selectedCircle.attr("r", 3);
      selectedCircle.lower();
    }
    if (selectedOnLine) {
      selectedOnLine.attr("fill", "#1f77b4");
    }
    if (otherNodes) {
      otherNodes.attr("opacity", 1);
      selectedNode.attr("r", 3);
      selectedNodes.attr("r", 3);
    }




    selectedCircle = d3.select("circle[title =\'" + book.title + "\']");
    selectedCircle.attr("opacity", 1);
    selectedCircle.attr("r", 7);
    selectedCircle.attr("fill", "#ff7f0e");
    selectedCircle.raise();


    selectedOnLine = focus.select("circle[year =\'" + book.original_publication_year + "\']");
    selectedOnLine.attr("fill", "#ff7f0e");

    selectedDotsOnScat = svgScat.selectAll("circle[year =\'" + book.key + "\']");
    selectedDotsOnScat.attr("opacity", 1);
    selectedDotsOnScat.attr("r", 7);
    selectedDotsOnScat.attr("fill", "#ff7f0e");
    selectedDotsOnScat.raise();


    selectedDotOnLine = focus.select("circle[year =\'" + book.key + "\']");
    selectedDotOnLine.attr("fill", "#ff7f0e");

    selectedBars = d3.selectAll("rect[year =\'" + book.key + "\']");
    selectedBars.attr("fill", "#ff7f0e");
    selectedBar = d3.select("rect[title =\'" + book.title + "\']");
    selectedBar.attr("fill", "#ff7f0e");

    otherNodes = node.selectAll("circle");
    otherNodes.attr("opacity", 0.3);
    selectedNode = node.select("circle[title =\'" + book.title + "\']")
    selectedNode.attr("opacity", 1);
    selectedNode.attr("r", 6);

    selectedNodes = node.selectAll("circle[year =\'" + book.key + "\']")
    selectedNodes.attr("opacity", 1);
    selectedNodes.attr("r", 6);



  });

  dispatch.on("MouseLeave", function(book) {
    if (selectedBar) {
      selectedBar.attr("fill", "#1f77b4");
    }
    if (selectedBars) {
      selectedBars.attr("fill", "#1f77b4");
    }
    if (selectedDotsOnScat) {
      selectedDotsOnScat.attr("fill", "#1f77b4");
      selectedDotsOnScat.attr("opacity", 0.5);
      selectedDotsOnScat.attr("r", 3);
      selectedDotsOnScat.lower();
    }
    if (selectedCircle) {
      selectedCircle.attr("fill", "#1f77b4");
      selectedCircle.attr("opacity", 0.5);
      selectedCircle.attr("r", 3);
      selectedCircle.lower();
    }
    if (selectedOnLine) {
      selectedOnLine.attr("fill", "#1f77b4");
    }
    if (selectedDotOnLine) {
      selectedDotOnLine.attr("fill", "#1f77b4");
    }

    if (otherNodes) {
      otherNodes.attr("opacity", 1);
      selectedNode.attr("r", 3);
      selectedNodes.attr("r", 3);
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

    years = 1;
    update()
  }
}

function update() {



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
    .attr("fill", "#1f77b4");


  focus.select(".x.axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xAxis);


  focus.select(".line").remove();
  focus.append("path")
    .datum(filterData(dataLine, xScale.domain()))
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "#1f77b4");

  line = d3.line()
    .x(function(d) {
      return xScale(d.key);
    })
    .y(function(d) {
      return yScale(d.value);
    });
  focus.select(".line").attr("d", line);

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
    .attr("fill", "#1f77b4")
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
    .attr("author", function(d) {
      return d.authors;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    });
  svgScat.select(".x.axis").call(xAxisScat);

  d3.select(".svgBar").remove();
  genBarChart();
  d3.select(".svgNetwork").remove();
  firstTime = 0;
  simulation.stop();
  genNetwork();
  menu = 0;
  years = 0;


}



function filterData(data, range) {

  var selectedAuthorVal = $("#multiselectAuthor").val();
  var dataFilter;
  var result;


  if (selectedAuthorVal != null) {
    dataFilter = data.filter(d => genres.includes(d.tag_name) && d.authors.split(",").some(a => authors.includes(a)));
    var years = [d3.min(dataFilter, function(d) {
        return d.original_publication_year;
      }),
      d3.max(dataFilter, function(d) {
        return d.original_publication_year;
      })
    ];

    xScale.domain(years);
    if ((xScale.domain()[1] - xScale.domain()[0]) < 4) {
      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 2 + 1);
      if ((xScale.domain()[1] - xScale.domain()[0]) == 1) {
        xAxis.ticks(1);
      }
    } else if ((xScale.domain()[1] - xScale.domain()[0]) > 45) {

      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 4);

    } else {
      xAxis.ticks((xScale.domain()[1] - xScale.domain()[0]) / 2);

    }
    context.select(".x.brush")
      .call(brush.move, years.map(xScaleOverview));
  } else {
    dataFilter = data.filter(d => genres.includes(d.tag_name));
  }

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

  if (selectedAuthorVal != null) {
    result = dataFilter;
  } else {
    result = dataFilter.filter(d => d.key >= range[0] && d.key < range[1]);
  }

  return result;
}

function filterDataScat(data, range) {


  var selectedAuthorVal = $("#multiselectAuthor").val();
  var dataFilter;
  var result;


  if (selectedAuthorVal != null) {
    result = data.filter(d => d.authors.split(",").some(a => authors.includes(a)) &&
      genres.includes(d.tag_name));
    var years = [d3.min(result, function(d) {
        return d.original_publication_year;
      }),
      d3.max(result, function(d) {
        return d.original_publication_year;
      }) + 1
    ];
    xScaleScat.domain(years);
    if ((xScaleScat.domain()[1] - xScaleScat.domain()[0]) < 4) {

      xAxisScat.ticks((xScaleScat.domain()[1] - xScaleScat.domain()[0]) / 2 + 1);
      if ((xScaleScat.domain()[1] - xScaleScat.domain()[0]) == 1) {

        xAxisScat.ticks(1);
      }
    } else if ((xScaleScat.domain()[1] - xScaleScat.domain()[0]) > 45) {

      xAxisScat.ticks((xScaleScat.domain()[1] - xScaleScat.domain()[0]) / 4);
    } else {
      xAxisScat.ticks(xScaleScat.domain()[1] - xScaleScat.domain()[0]);
    }
    context.select(".x.brush")
      .call(brush.move, years.map(xScaleOverview));

    console.log(result)
  } else {
    result = data.filter(d => d.original_publication_year >= range[0] && d.original_publication_year < range[1] &&
      genres.includes(d.tag_name));

  }


  return result;
}


function genScatterplot() {
  widthScat = 1200;
  heightScat = 140;

  svgScat = d3.select("#scatterplot")
    .append("svg")
    .attr("width", widthScat)
    .attr("height", heightScat)
    .style("background-color", "white");


  var padding = 30;

  dataScat.forEach(function(d, i) {
    d.original_publication_year = +d.original_publication_year;
  });
  dataScat = dataScat.sort(function(a, b) {
    return d3.ascending(a.original_publication_year, b.original_publication_year);
  });


  xScaleScat = d3.scaleLinear()
    .domain([2015, 2018])
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
    .attr("fill", "#1f77b4")
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
    })
    .attr("author", function(d) {
      return d.authors;
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

  dataBarFilter = filterDataScat(dataBar, xScale.domain());

  yScaleBar = d3.scaleLinear()
    .domain(dataBarFilter.map(function(d, i) {
      return i;
    }))
    .range([heightBar - padding, padding]);

  if (yScaleBar.domain().length === 1) {
    yScaleBar.domain([0, 1])
  }

  xScaleBar = d3.scaleLinear()
    //  .domain([0, 5000000])
    .range([0, widthBar - 2 * padding]);

  yZoom = d3.scaleLinear()
    .range([heightBar - padding, padding])
    .domain([heightBar - padding, padding]);

  bar_h = 42;

  var selected = yScaleBar.domain()
    .filter(function(d, i) {
      return (heightBar - yScaleBar(i) - i * (bar_h + 100) <= (heightBar - padding) && padding <= heightBar - yScaleBar(i) - i * (bar_h + 100));
    });

  var maxXScale = d3.max(dataBarFilter, function(d, i) {
    return selected.indexOf(i) > -1 ? d.work_ratings_count : 0;
  }) + 50000;
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
    .attr("transform", "translate(0,-10)")
    .append("g") //another one for the clip path - due to not wanting to clip the labels
    .attr("class", "MainBar")
    .attr("clip-path", "url(#path)");



  /*
      mainBar.append("g") // create a 'g' element to match our 'y' axis
          .attr("transform", "translate(30,0)") // 30 is the padding
          .attr("class","yaxis") // give css style
          .call(yAxisBar);
  */
  var bar = mainBar.selectAll("g.bar")
    .data(dataBarFilter)
    .enter().append("g")
    .attr("class", "bar");

  bar.append("rect") // for each item append a bar
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
      return heightBar - yScaleBar(i) - i * (bar_h + 100);
    })
    .attr("x", function(d) {
      return padding; // fit to our scale
    })
    .attr("fill", "#1f77b4")
    .attr("class", "colorBar")
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    })
    .attr("author", function(d) {
      return d.authors;
    })
    .attr("popularity", function(d) {
      return d.work_ratings_count;
    });

  bar.append("text")
    .attr("x", padding + 5)
    .attr("y", function(d, i) {
      return heightBar - yScaleBar(i) - i * (bar_h + 100) + bar_h / 2;
    })
    .text(function(d, i) {
      return i + 1;
    })
    .style("fill", "#ffffff");




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

  var padding = 30;


  if (d3.event.sourceEvent.deltaY > 0) {
    //down

    if ((yZoom.domain()[1] - (bar_h + 6)) >= (heightBar - padding - (bar_h + 6) * dataBarFilter.length)) {
      yZoom.domain([yZoom.domain()[0] - (bar_h + 6), yZoom.domain()[1] - (bar_h + 6)]);

    }
  } else {
    // up
    if ((yZoom.domain()[0] + (bar_h + 6)) <= (heightBar - padding)) {
      yZoom.domain([yZoom.domain()[0] + (bar_h + 6), yZoom.domain()[1] + (bar_h + 6)]);
    }
  }



  yScaleBar.domain(dataBarFilter.map(function(d, i) {
    return i;
  }))

  if (yScaleBar.domain().length === 1) {
    yScaleBar.domain([0, 1])
  }

  yScaleBar.range([yZoom(originalRange[0]), yZoom(originalRange[1])]);

  var selected = yScaleBar.domain()
    .filter(function(d, i) {
      return (heightBar - yScaleBar(i) - i * (bar_h + 100) <= (heightBar - padding) && padding <= heightBar - yScaleBar(i) - i * (bar_h + 100));
    });


  var newMaxXScale = d3.max(dataBarFilter, function(d, i) {
    return selected.indexOf(i) > -1 ? d.work_ratings_count : 0;
  }) + 50000;
  xScaleBar.domain([0, newMaxXScale]);


  //Update the x axis of the big chart
  d3.select(".BarWrapper")
    .select(".xaxis")
    .transition().duration(50)
    .call(xAxisBar);

  mainBar.selectAll(".bar").remove();
  var bar = mainBar.selectAll("g.bar")
    .data(dataBarFilter)
    .enter().append("g")
    .attr("class", "bar");

  bar.append("rect") // for each item append a bar
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
      return heightBar - yScaleBar(i) - i * (bar_h + 100); // com legenda : sem "heightBar -"
    })
    .attr("x", function(d) {
      return padding; // fit to our scale
    })
    .attr("fill", "#1f77b4")
    .attr("class", "colorBar")
    .attr("title", function(d) {
      return d.title;
    })
    .attr("year", function(d) {
      return d.original_publication_year;
    })
    .attr("author", function(d) {
      return d.authors;
    })
    .attr("popularity", function(d) {
      return d.work_ratings_count;
    });

  bar.append("text")
    .attr("x", padding + 5)
    .attr("y", function(d, i) {
      return heightBar - yScaleBar(i) - i * (bar_h + 100) + bar_h / 2;
    })
    .text(function(d, i) {
      return i + 1;
    })
    .style("fill", "#ffffff");


}

function myDelta() {
  return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / 1500;
}


function genMenu() {

  dataGenre.sort(function(a, b) {
    return d3.ascending(a.tag_name, b.tag_name);
  });
  genres = d3.map(dataGenre, function(d) {
    return d.tag_name;
  }).keys();



  dataAuthors.sort(function(a, b) {
    return d3.ascending(a.authors, b.authors);
  });
  auxAuthors = d3.map(dataAuthors, function(d) {
    return d.authors;
  }).keys();

  authors = []
  for (var i = 0; i < auxAuthors.length; i++) {
    if (auxAuthors[i].includes(",")) {
      for (e of auxAuthors[i].split(",")) {
        if (!authors.includes(e)) {
          authors.push(e)
        }
      }
    } else {
      if (!authors.includes(auxAuthors[i])) {
        authors.push(auxAuthors[i]);
      }
    }
  }

  authors.sort();

  allAuthors = authors;



  $('#multiselectGenre').multiselect({
    buttonWidth: '160px',
    maxHeight: 400,
    includeSelectAllOption: true,
    enableFiltering: true,
    enableCaseInsensitiveFiltering: true,
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
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  $('#multiselectGenre').multiselect('rebuild');

  $('#multiselectAuthor').multiselect({
    buttonWidth: '160px',
    maxHeight: 400,
    includeSelectAllOption: true,
    enableFiltering: true,
    enableCaseInsensitiveFiltering: true,
    filterPlaceholder: 'Search',
    nonSelectedText: 'Select an Author',
    selectAllText: 'Select All',
    nSelectedText: ' selected elements',
    allSelectedText: 'All Authors'
  });

  d3.select("#multiselectAuthor").selectAll("option")
    .data(authors)
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  $('#multiselectAuthor').multiselect('rebuild');

}

function genNetwork() {

  var width = 655,
    height = 460;

  color = d3.scaleOrdinal(d3.schemeCategory10);



  svgNetwork = d3.select("#Network").append("svg")
    .attr("class", "svgNetwork")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
        svgNetwork.attr("transform", d3.event.transform,d3.event.scale)
                  //.attr("transform", d3.event.scale)
})).append("g");





    if (firstTime == 1){
      simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) {
          return d.id;
        }))
        .force("charge", d3.forceManyBody().strength(-0.25).distanceMax(400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.rating));
    }
    else {
      simulation.alphaTarget(0.1).restart()
    }




      dataFilterNode = filterNetwork(allNodes, xScaleScat.domain(), links=0);



      dataFilterLink = filterNetwork(allLinks, xScaleScat.domain());

      /*
      var pageBounds = { x: 0, y: 0, width: 620, height: 460 },
      page = svgNetwork.append('rect').attr('id', 'page')
                              .attr("fill", "white")
                              .attr("x", pageBounds.x)
                              .attr("y", pageBounds.y)
                              .attr("width", pageBounds.width)
                              .attr("height", pageBounds.height),
      nodeRadius = 10,
      topLeft = { x: pageBounds.x, y: pageBounds.y, fixed: true },
      tlIndex = allNodes.push(topLeft) - 1,
      bottomRight = { x: pageBounds.x + pageBounds.width, y: pageBounds.y + pageBounds.height, fixed: true },
      brIndex = allNodes.push(bottomRight) - 1,
      constraints = [];
      for (var i = 0; i < dataFilterNode.length; i++) {
          constraints.push({ axis: 'x', type: 'separation', left: tlIndex, right: i, gap: nodeRadius });
          constraints.push({ axis: 'y', type: 'separation', left: tlIndex, right: i, gap: nodeRadius });
          constraints.push({ axis: 'x', type: 'separation', left: i, right: brIndex, gap: nodeRadius });
          constraints.push({ axis: 'y', type: 'separation', left: i, right: brIndex, gap: nodeRadius });
      }
      */

      link = svgNetwork.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(dataFilterLink)
        .enter().append("line")
        .attr("stroke-width", function(d) {
          return d.value * 5;
        });

      node = svgNetwork.append("g")
        .attr("class", "nodes");

        node.selectAll("circle")
        .data(dataFilterNode)
        .enter().append("circle")
        .on("mouseover", function(d) {
          dispatch.call("MouseOver", d, d);
          showTooltipNetwork(d);
        })
        .on("mouseleave", function(d) {
          dispatch.call("MouseLeave", d, d);
          hideTooltip(d);
        })
        .attr("opacity", 1)
        .attr("fill", function(d) {
          return color(d.genre);
        })
        .attr("r", 3)
        .attr("title", function(d) {
          return d.title;
        })
        .attr("year", function(d) {
          return d.original_publication_year;
        })
         .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

      simulation
        .nodes(dataFilterNode)
        .on("tick", ticked)
        //.alphaDecay(0)
        .force("link")
        .links(dataFilterLink);


    //invalidation.then(() => simulation.stop());


}


  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }


function filterNetwork(data, range, links=1) {

  if (links == 1) {
    if (firstTime == 1 || (years == 1 )) { //&& ($("#multiselectGenre").val() != null || $("#multiselectAuthor").val()))) {
      return data.filter(d => d.source_year >= range[0] && d.source_year < range[1] &&
                              d.target_year >= range[0] && d.target_year < range[1]
                              && dataFilterNode.some(item => item.id == d.source)
                              && dataFilterNode.some(item => item.id == d.target));
    }
   else {

      return data.filter(d => d.source_year >= range[0] && d.source_year < range[1] &&
                                d.target_year >= range[0] && d.target_year < range[1] &&
                                dataFilterNode.some(item => item.id == d.source.id) &&
                                dataFilterNode.some(item => item.id == d.target.id));
    }


  }
  else {
    if ($("#multiselectAuthor").val() != null) {
      return data.filter(d => d.author.split(",").some(a => authors.includes(a)))
    }
    else {
      return data.filter(d => d.original_publication_year >= xScaleScat.domain()[0] &&
        d.original_publication_year < xScaleScat.domain()[1] &&
        genres.includes(d.genre));
    }

  }
}


function ticked() {

  link
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });

  node.selectAll("circle")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
}

function getSelectedValues() {
  var selectedGenreVal = $("#multiselectGenre").val();
  var selectedAuthorVal = $("#multiselectAuthor").val();
  if (selectedGenreVal != null) {
    genValues = []

    for (var i = 0; i < selectedGenreVal.length; i++) {
      genValues.push(selectedGenreVal[i])
    }

    genres = genValues;
    authors = allAuthors;
    $("#multiselectAuthor").multiselect('clearSelection');
    $('#multiselectAuthor').multiselect('refresh');
    $('#multiselectGenre').multiselect('refresh');

  } else {
    genres = d3.map(dataGenre, function(d) {
      return d.tag_name;
    }).keys();
  }


  if (selectedAuthorVal != null) {
    authorsValues = []

    for (var i = 0; i < selectedAuthorVal.length; i++) {
      authorsValues.push(selectedAuthorVal[i])
    }
    authors = authorsValues;
    //$("#multiselectGenre").multiselect('clearSelection');
    //$('#multiselectGenre').multiselect('refresh');
    genres = d3.map(dataGenre, function(d) {
      return d.tag_name;
    }).keys();
    $("#multiselectGenre").multiselect('clearSelection');
    $('#multiselectGenre').multiselect('refresh');
    $('#multiselectAuthor').multiselect('refresh');
    dataBarFilter = filterData(dataBar, xScaleScat.domain())


    //  var dt = dataTitle.filter(function(d) { return d.authors.split(",").some(a => authors.includes(a))}).sort(function (a,b) {return d3.ascending(a.title, b.title);});
    //  titles = d3.map(dt, function(d){return d.title;}).keys();
  } else {
    authors = allAuthors;
  }
  if (selectedGenreVal == null && selectedAuthorVal == null) {
    xScale.domain([2015, 2017]);
    xScaleScat.domain([2015, 2018]);
    context.select(".x.brush")
      .call(brush.move, xScale.domain().map(xScaleOverview));
  }
  menu = 1;
  update();

}

function deselectAll() {
  $("#multiselectAuthor").multiselect('clearSelection');
  $('#multiselectAuthor').multiselect('refresh');
  $("#multiselectGenre").multiselect('clearSelection');
  $('#multiselectGenre').multiselect('refresh');
  getSelectedValues();
  update();
}
