export function updateVennDiagram(graph) {
  var i = 0,
      color_ids,
      width = 700,
      height = 400;

  var svg = d3.select("#venn_box");
  svg.attr("width", width)
      .attr("height", height);

  var width = +svg.attr("width");
  var height = +svg.attr("height");

  var chart = venn.VennDiagram()
      .width(width)
      .height(height)
      ;

  var colors = ['#D5FF31',
                '#CC6CF7',
                '#4FE3AE',
                '#E0007A'
              ];
  // Remove existing elements in DOM
  if ($("svg", "#venn_box").get().length != 0) {
    svg.select("svg").remove();
  }

// window.addEventListener("load", updateLegend());
  var url = window.location.host;
  var pathname = window.location.pathname;

  var div = d3.select("#venn_box").datum(graph.data).call(chart);
  var sizes = Array();

  for (i = 0; i < graph.data.length; i++) {
    if (graph.data[i].sets.length==1) {
      sizes.push(graph.data[i].size);
    } else {
      continue;
    }
  }
  var sum = sizes.reduce((a, b) => a + b, 0);

  d3.select("#n_songs_returned").text(numberWithCommas(sum));

  div.selectAll("text").attr("display", "none"); // hide labels in venn

  d3.selectAll("#venn_box .venn-circle path")
          .style("stroke", function(d, i) {
            return colors[i];
          });

  color_ids = [];
  let venn_circles = [];
  div.selectAll(".venn-circle path")
          .style("fill-opacity", 0.75)
          .style("fill", function(d, i) {
            color_ids.push([d.label, colors[i]]);
            venn_circles.push(d);
            return colors[i];
          })
          .style("color", function(d) {
            return d[1];
          })

  // Clear existing legend, if present
  if ($("th", "#venn_legend").get().length != 0) {
    d3.select("#venn_legend").selectAll("th").remove();
  } else {
    //do nothing
  }

  // Add legend with correct colors
  var legend = d3.select("#venn_legend");

  legend.selectAll("th")
        .data(color_ids.reverse())
        .enter()
        .append("th")
        .text(function(d){
          return d[0];
        })
        .style("color", function(d) {
          return d[1];
        });

  var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

  tooltip.append("p")
          .attr("class", "tooltip-header");

  tooltip.append("p")
          .attr("class", "tooltip-body");

  div.selectAll("g")
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);
  function handleMouseMove(d, i) {

    // sort all the areas relative to the current item
    venn.sortAreas(div, d);

    // highlight the current path
    var selection = d3.select(this).transition("tooltip");
    selection.select("path")
        .style("stroke-width", 3)
        .style("fill-opacity", d.sets.length == 1 ? .8 : 0)
        .style("stroke-opacity", 1);

    // Display a tooltip with the current size
    var t = d3.transition().duration(200).ease(d3.easeLinear);
    tooltip.transition(t)
            .style("visibility", "visible");
    tooltip.select(".tooltip-header")
            .text(numberWithCommas(d.size) + " songs");
    tooltip.select(".tooltip-body")
            .text(d.label);

    tooltip.style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");

  } //handleMouseMove

  function handleMouseOut(d, i) {

    tooltip.transition()
            .style("visibility", "hidden");

    var selection = d3.select(this);
    selection.select("path")
        .style("stroke-width", 3)
        .style("fill-opacity", d.sets.length == 1 ? .8 : 0)
        .style("stroke-opacity", 1);

  } //handleMouseOut

  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } //handleMouseOut

};
