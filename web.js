$(document).ready(function() {
    drawTaiwan()
   });

function drawTaiwan(){

  var width = 1000,
  height = 1000;

  // Setting color domains(intervals of values) for our map

  var color_domain = [0.01, 0.20, 0.45, 0.65, 0.80]
  var ext_color_domain = [0, 0.01, 0.20, 0.45, 0.65, 0.80]
  var legend_labels = [" 0%", "0.1%", "20%", "45%", "65%", "> 80%"]              

  var color = d3.scale.threshold()
  .domain(color_domain)
  .range(["#adfcad", "#ffcb40", "#ffba00", "#ff7d73", "#ff4e40", "#ff1300"]);

  var div = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

  var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("margin", "10px auto");

  var projection = d3.geo.mercator()
  .center([121,24])
  .scale(7500)
  .translate([width / 2, height / 2]);

  var path = d3.geo.path().projection(projection);

  //Reading map file and data

  queue()
  .defer(d3.json, "TWN_TOWN_v2_topo3.json")
  .defer(d3.csv, "web.csv")
  .await(ready);

  //Start of Choropleth drawing

  function ready(error, town, data) {
    var dataById = {};
    var nameById = {};

    data.forEach(function(d) {
      dataById[d.TOWN_ID] = +d.web;
      nameById[d.TOWN_ID] = d.nfullname;
    });

    //Drawing Choropleth

    svg.append("g")
    .attr("class", "town")
    .selectAll("path")
    .data(topojson.object(town, town.objects.TWN_TOWN_v2).geometries)
    //.data(topojson.feature(town, town.objects.TWN_TOWN_v2).features) //<-- in case topojson.v1.js
    .enter().append("path")
    .attr("d", path)
    .style("fill", function(d) {
      return color(dataById[d.id]); 
    })
    .style("opacity", 0.8)

    //Adding mouseevents
    .on("mouseover", function(d) {
      d3.select(this).transition().duration(300).style("opacity", 1);
      div.transition().duration(300)
      .style("opacity", 1)
      div.text(nameById[d.id] + " : " + Math.round( dataById[d.id] * 100 )+ " % " )
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY -30) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
      .transition().duration(300)
      .style("opacity", 0.8);
      div.transition().duration(300)
      .style("opacity", 0);
    })

    // Adding cities on the map

 /*   d3.tsv("cities.tsv", function(error, data) {
      var city = svg.selectAll("g.city")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "city")
      .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; });

      city.append("circle")
      .attr("r", 3)
      .style("fill", "lime")
      .style("opacity", 0.75);

      city.append("text")
      .attr("x", 5)
      .text(function(d) { return d.City; });
    });*/
  
  }; // <-- End of Choropleth drawing
 
  //Adding legend for our Choropleth

  var legend = svg.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return color(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
  .text(function(d, i){ return legend_labels[i]; });


}