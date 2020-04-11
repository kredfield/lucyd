export function updateClusterViz(data) {
  // Canvas set up and scaling
  var canvas = document.getElementById("horizon_viz"),
      context = canvas.getContext("2d");

  var dpi = fix_dpi(); //Fix resolution to adjust for varying screen sizes

  var width = canvas.width / dpi,
      height = canvas.height / dpi;

  context.clearRect(0, 0, width, height);

  var colors = [
    '#D5FF31',
    '#CC6CF7',
    '#4FE3AE',
    '#E0007A'
    ]; //lucyd brand colors

  var search_terms = data["search_tags"],
      adjacent_tags = data["adjacent_tags"],
      coordinates = {};

  var scale_params = getScaleParameters(data["coordinates"]);

  for (const k of Object.keys(data["coordinates"])) {
    // Scale coordinates
    let coords = data["coordinates"][k];
    coordinates[k] = scaleCoordinates(coords, 0.15);
  }

  window.clusters = [];
  var adjacent_clusters = [];

  // Create cluster objects for tags from user's initial search
  // for (i=0; i < search_terms.length; i++) {
  for (const s of search_terms) {
    let x = coordinates[s][0],
        y = coordinates[s][1];

    let c = {
      tag_name: s,
      is_adjacent: false,
      coordinates: {
        x: x,
        y:y
      },
      color: "#ffffff",
      linear_grad: null,
      rad_grad: makeRadGrad(x,
                            y,
                            0.1,
                            0.2,
                            "#ffffff")
    };

    window.clusters.push(c);

  }
  // Create cluster objects for the adjacent tags
  let i = 0;
  for (const a of adjacent_tags) {
    let x = coordinates[a][0],
        y = coordinates[a][1];

    let c = {
      tag_name: a,
      is_adjacent: true,
      coordinates: {
        x: x,
        y:y
      },
      color: colors[i],
      linear_grad: makeLinearGrad(colors[i]),
      rad_grad: makeRadGrad(x, y, 0.5, 1, colors[i]),
      track_data: data['track_data'][a]
    };

    window.clusters.push(c);
    adjacent_clusters.push(c);
    i += 1;
  }

  drawClusters(window.clusters); //Draw all of the clusters

  ////////////////////////
  /////Event Handlers/////
  ////////////////////////
  var closeCluster = null,
      // onLegend = null,
      // onCluster = null,
      new_search = []; //Used with mouse events to identify the closest cluster

  $("#horizon_viz").click(function(e) {
    let position = getPosition(e);

    var close_cluster = findNearestCluster(position, window.clusters);

    if (new_search.length >= 3) {
      new_search.shift();
    }
    new_search.push(close_cluster.tag_name);

    fillSearchTable(new_search);

  }); // Add cluster closest to mouse click to the "update" search table

  $("#horizon_viz").mousemove(function(e) {
    let position = getPosition(e);
    var nearest_cluster = findNearestCluster(position, adjacent_clusters);

    context.globalCompositeOperation = "destination-over"; //Lines will be drawn beneath existing drawings

    if (closeCluster==null) {
      closeCluster = nearest_cluster;
      drawLine(closeCluster);
      drawTable(closeCluster);

    } else if (closeCluster != nearest_cluster) { //If you moved closer to a different cluster, clear the canvas, redraw the clusters, and draw a new line
      context.clearRect(0, 0, width, height);

      drawClusters(window.clusters);

      closeCluster = nearest_cluster;
      drawLine(closeCluster);
      drawTable(closeCluster);

    } else {
      null; //do nothing
    }
  }); //Draw a line to the cluster closest to the mouse cursor

  $("#horizon_viz").mouseout(function(e) {

    context.clearRect(0, 0, width, height);

    drawClusters(window.clusters);

  }); //Clear the lines and re-draw clusters when your mouse exits the element

  ///////////////////////////
  /////Utility Functions/////
  ///////////////////////////
  function fix_dpi() {

    var dpi = window.devicePixelRatio;

    //Get CSS height
    let style_height = +getComputedStyle(canvas) //+ casts to integer
                        .getPropertyValue("height")
                        .slice(0, -2); //Removes "px" from value

    //Get CSS width
    let style_width = +getComputedStyle(canvas)
                        .getPropertyValue("width")
                        .slice(0, -2);

    //Scale the canvas
    canvas.setAttribute("height", (style_height * dpi));
    canvas.setAttribute("width", (style_width * dpi));

    context.scale(dpi, dpi);

    return dpi;

  }//fix_dpi

  function getScaleParameters(data_tag_coordinates) {
    let x_list = [],
        y_list = [];

    for (const k of Object.keys(data_tag_coordinates)) {
      x_list.push(data_tag_coordinates[k][0]);
      y_list.push(data_tag_coordinates[k][1])
    }

    return {
      x: {
        min: Math.min(...x_list),
        max: Math.max(...x_list)
      },
      y: {
        min: Math.min(...y_list),
        max: Math.max(...y_list)
      }
    }
  }; //getScaleParameters

  function scaleCoordinates(coordinate, pad_percent) {
    //coordinates: coordinates you want to scale
    //pad_percent: percent (in decimals) of padding you would like (e.g. 0.05 for 5%)
    let x = coordinate[0],
        y = coordinate[1];

    let w_scale = ((1-(2*pad_percent)) * width) / (scale_params.x.max - scale_params.x.min),
        h_scale = ((1-(2*pad_percent)) * height) / (scale_params.y.max - scale_params.y.min);

    return [
      ((x - scale_params.x.min) * w_scale) + (pad_percent * width),
      ((y - scale_params.y.min) * h_scale) + (pad_percent * height),
    ];
  }//scaleCoordinates

  function makeRadGrad(x, y, r, d, color) {
    var rad_grad = context.createRadialGradient(
      x,
      y,
      r * 5,
      x,
      y,
      d * 50
    );

    rad_grad.addColorStop(0, color);
    rad_grad.addColorStop(1, 'rgba(0,0,0,0)');

    return rad_grad;

  } // makeRadGrad

  function makeLinearGrad(color) {
    var linear_grad = context.createLinearGradient(
      width,
      height,
      0,
      0
    );

    linear_grad.addColorStop("0", "#1C1E58");
    linear_grad.addColorStop("0.4", color);

    return linear_grad;

  } // makeLinearGrad

  function drawClusters(clusters) {
    for (const c of clusters) {
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = c.rad_grad;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "source-over";

      context.textAlign = "center";

      if (c.is_adjacent==false) {
        context.font = "1em VisbyCF-Regular";
        context.fillStyle = "rgba(255, 255, 255, 0.55)";
        context.fillText(
          c.tag_name.toLowerCase(),
          c.coordinates.x,
          c.coordinates.y-10
        );

      } else if (c.is_adjacent==true) {
        context.font = "1.25em VisbyCF-ExtraBold";
        context.fillStyle = c.color;
        context.fillText(
          c.tag_name.toLowerCase(),
          c.coordinates.x,
          c.coordinates.y - 20
        );
      }
    }
  } //drawClusters

  function drawTable(cluster) {

    var container = d3.select("#horizon_legend")
                      .transition()
                      .duration(0)
                      .style("display", "inline");

    let fill_grad = "linear-gradient(to right, transparent, " + cluster.color + ", transparent)";

    let tag = cluster.tag_name;
    container.select(".one")
              .transition()
              .duration(0)
              .style("background-image", fill_grad)
              .text(tag);

    let track_data = Object.values(cluster.track_data);

    if ($("tbody", "#song_samples").get().length != 0) {
      d3.select("#song_samples").selectAll("tbody").remove();
    }

    if (Object.keys(track_data).length === 0) {
      d3.select("#track_info").text("Whoops! We couldn't find any songs on Spotify with that tag.");
    } else {

      var table = d3.select("#song_samples").append("tbody");
      var tr = table.selectAll("tr")
                    .data(track_data)
                    .enter().append("tr");
      tr.each(function(d, i) {
          d3.select("#track_info").text("Hover over the tracks below to hear some songs with this tag.");

          var self = d3.select(this);
          let play_elem = "document.getElementById('sample_player_" + String(i) + "').play()",
              pause_elem = "document.getElementById('sample_player_" + String(i) + "').pause()";

          self.append("a")
                .attr("href", d.url)
                .attr("target", "_blank")
                .attr("onmouseover", play_elem)
                .attr("onmouseout", pause_elem)
                .style("text-align", "center")
                .text(d.name + " by " + d.artist);

            });

          if ($("audio", "#song_samples").get().length != 0) {
            d3.select("#playlist").selectAll("audio").remove();
          }
          // Update audio elements
          table.selectAll("audio")
                .data(track_data)
                .enter().append("audio")
                  .attr("id", function(d, i) {
                    return "sample_player_" + String(i);
                  })
                  .attr("src", function(d) {
                    return d['clip'];
                  })
                  .attr("type", "audio/mpeg");

  }
} // drawTable()

  function getPosition(event) {
    var rect = canvas.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top;

    return [x, y];

  } //getPosition

  function findNearestCluster(position, clusters) {
    //Given a position (x, y), returns the center of the nearest cluster,
    // given a list of clusters to search through.
    // Allows flexibility to identify the nearest adjacent cluster, or the
    // nearest of all the clusters
    var min_dist_index,
        min_dist,
        x = position[0],
        y = position[1];

    for (i=0; i < clusters.length; i++) {

        let x0 = clusters[i].coordinates.x,
            y0 = clusters[i].coordinates.y;

        var calc_dist = pythagDistance(x, y, x0, y0);

        if (min_dist == null) {

          min_dist_index = i;
          min_dist = calc_dist;

        } else if (calc_dist < min_dist) {

          min_dist_index = i;
          min_dist = calc_dist;

        } else {

          continue;

        }

    }

    return clusters[min_dist_index];

  } //findNearestCluster

  function fillSearchTable(search_tags) {
    if (search_tags[0]) {
      d3.select("#update0")
          .text(search_tags[0])
          .transition()
            .duration(1000)
          .style("color", "#1C1E58")
          .style("border", "3px solid #E0007A")
          .style("background", "rgba(255, 255, 255, 0.55)")
          .style("font-weight", "bolder")
          .transition()
            .delay(1500)
            .duration(3000)
          .style("border", "2px solid white");
    }

    if (search_tags[1]) {
      d3.select("#update1")
          .text(search_tags[1])
          .transition()
            .duration(1000)
          .style("color", "#1C1E58")
          .style("border", "3px solid #E0007A")
          .style("background", "rgba(255, 255, 255, 0.55)")
          .style("font-weight", "bolder")
          .transition()
            .delay(1500)
            .duration(3000)
          .style("border", "2px solid white");
    }

    if (search_tags[2]) {
      d3.select("#update2")
          .text(search_tags[2])
          .transition()
            .duration(1000)
          .style("color", "#1C1E58")
          .style("border", "3px solid #E0007A")
          .style("background", "rgba(255, 255, 255, 0.55)")
          .style("font-weight", "bolder")
          .transition()
            .delay(1500)
            .duration(3000)
          .style("border", "2px solid white");
    }

  } //fillSearchTable

  function drawLine(to_cluster) {
    //Draws a line from the bottom right corner of the canvas to the
    //given end point [x, y].
    let x = to_cluster.coordinates.x,
        y = to_cluster.coordinates.y;
        // x0 = width,
        // y0 = height;

    context.strokeStyle = to_cluster.linear_grad;

    // for (i=0; i < clusters.length; i++) {
    for (const c of clusters) {
      if (c.is_adjacent==false) {

        let x0 = c.coordinates.x,
            y0 = c.coordinates.y;

        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x, y);
        context.stroke();

      } else {
        continue;
      }


    }
  } //drawLine

  function pythagDistance(x0, y0, x1, y1) {
    var dist = Math.sqrt(Math.pow((x1-x0), 2) + Math.pow((y1-y0), 2));

    return dist;
  } //pythagDistance

  function hexToRgbA(hex) {
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
              c= [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c= '0x'+c.join('');
          return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
      }
      throw new Error('Bad Hex');
  }

};
