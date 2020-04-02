## Visualizing a Song Space and Nearby Tags
Hanna Rocks\
April 15, 2020

### Objective
The overarching goal of lucyd was to create a simple tool that taught the user where their music recommendations came from, and how they might modify those recommendations to best suit their mood. As is detailed in the [Algorithms](https://github.com/timspit/lucyd/tree/master/1_Algorithms) section, we used machine learning and natural language processing techniques to identify the recommended songs based on user tags. The next challenge was **how can we communicate the source of those recommendations to a user?**

We determined that this would require two steps:
  1. **Visualize a filtered song space:** Show the user the number of songs returned by their tag query, and a summary of the tags associated with those songs.
  2. **Visualize song clusters determined by tags:** Show the user tags that are similar to those used in the tag query, as determined by a cluster analysis in a multi-dimensional space.

### Approach
#### Visualize a Filtered Song Space
We chose to use a Venn Diagram to visualize the number of songs returned from a user's tag query and the amount of overlap between tags for that set of songs. A Venn Diagram is a classic infographic that we believed most users would be familiar with, and, with the help of some responsive tooltips, easily understand the space of songs returned by their query.

To implement the Venn Diagram, we used Ben Frederickson's [venn.js](https://github.com/benfred/venn.js) library. This library allowed us to take data sent through an API response and quickly render a proportional Venn Diagram that could support user interactions.
```
// Initialize the Venn Diagram
var chart = venn.VennDiagram()
    .width(width)
    .height(height)
    ;
//...pull API response with song sets as var 'graph'...
// Bind the data to the Venn Diagram within the appropriate HTML element
var div = d3.select("#venn_box").datum(graph.data).call(chart);
```

Because the `venn.js` library uses [d3](https://d3js.org/), the resulting visualizations are highly customizeable. We sought to add three customizations to improve the users' experience with this element of lucyd:
  1. Change color scheme to align with lucyd brand colors.
```
//List of lucyd brand colors
var colors = ['#D5FF31',
              '#CC6CF7',
              '#4FE3AE',
              '#E0007A'
            ];
// Update style of Venn circles and create a list to hold legend values
div.selectAll(".venn-circle path")
        .style("fill-opacity", 0.75)
        .style("fill", function(d, i) {
          color_ids.push([d.label, colors[i]]);
          return colors[i];
        })
        .style("color", function(d) {
          return d[1];
        });
```
  2. Add a legend to indicate which circle corresponds to which tag.
```
// Select the legend element from the HTML template
var legend = d3.select("#venn_legend");
// Update the text of the legend with the tags and their corresponding colors
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
```
  3. Add interactive tooltips indicating the number of songs within each set of tag(s).

      **TO BE ADDED ONCE I FIX FLICKERING TOOLTIPS**


#### Visualize Song Clusters
- Address how the path diagram addresses users whose tag queries may not be accurate representations of what they’re looking for in final presentation
