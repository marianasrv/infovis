var dataScat;


d3.csv("project2.csv").then(function (data) {
  //  full_dataScat = data;
    dataScat = data;
  //  dispatch = d3.dispatch("bookEnter");
    gen_scatterplot();
});

function gen_scatterplot() {
    var w = 800;
    var h = 200;

    var svg = d3.select("#scatterplot")
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


    var xscale = d3.scaleTime()
                       .domain(d3.extent(dataScat, function(d) { return d.original_publication_year; }))
                       .range([padding,w-padding]);



    var xaxis = d3.axisBottom()
	                 .scale(xscale)
                   .tickFormat(d3.format("d"))
                   .ticks(10);



    gX = svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	   .call(xaxis);



   svg.selectAll("circle")
        .data(dataScat)
        .enter().append("circle")
        .attr("r", 6)
        .attr("fill", "steelblue")
        .attr("opacity", "0.5")
        .attr("cx",function(d) {
          //  if (d.original_publication_year == xscale().min) {return padding;}
                return  xscale(d.original_publication_year);
          })
        .attr("cy", function(d) {
            return h - Math.floor(Math.random() * 101) - 50;})
        .append("title")
          .text(function(d) { return d.title; });;






}
