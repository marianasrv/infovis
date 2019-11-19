var dataScat;
var xScaleScat;
var svgScat;
var xAxisScat;
var h;

d3.csv("project2.csv").then(function (data) {
  //  full_dataScat = data;
    dataScat = data;
  //  dispatch = d3.dispatch("bookEnter");
    gen_scatterplot();
});

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
                       .domain(d3.extent(dataScat, function(d) { return d.original_publication_year; }))
                       .range([padding,w-padding]);



    xAxisScat = d3.axisBottom()
	                 .scale(xScaleScat)
                   .tickFormat(d3.format("d"));



    svgScat.append("g")
    .attr("class", "x axis")
   	.attr("transform","translate(0," + (h-20) + ")")
	   .call(xAxisScat);



   svgScat.selectAll("circle")
        .data(dataScat)
        .enter().append("circle")
        .attr("r", 3)
        .attr("class", "dot")
        .attr("fill", "steelblue")
        .attr("opacity", "0.5")
        .attr("cx",function(d) {
          //  if (d.original_publication_year == xscale().min) {return padding;}
                return  xScaleScat(d.original_publication_year);
          })
        .attr("cy", function(d) {
            return h - Math.floor(Math.random() * (h/2 +1)) - h/4;})
        .append("title")
          .text(function(d) { return d.title; });

}
