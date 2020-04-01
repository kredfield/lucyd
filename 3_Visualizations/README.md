## Visualizing a Song Space and Nearby Tags
Hanna Rocks\
April 15, 2020

### Objective
The overarching goal of lucyd was to create a simple tool that taught the user where their music recommendations came from, and how they might modify those recommendations to best suit their mood. As is detailed in the [Algorithms](https://github.com/timspit/lucyd/tree/master/1_Algorithms) section, we used machine learning and natural language processing techniques to identify the recommended songs based on user tags. The next challenge was **how can we communicate the source of those recommendations to a user?**

We determined that this would require two steps:
  1. **Visualize a filtered song space:** Show the user the number of songs returned by their tag query, and a summary of the tags associated with those songs.
  2. **Visualize song clusters determined by tags:** Show the user tags that are similar to those used in the tag query, as determined by a cluster analysis in a multi-dimensional space.

### Approach
The sections below summarize our approach to the two steps identified above.
#### Visualize a Filtered Song Space

#### Visualize Song Clusters
- Address how the path diagram addresses users whose tag queries may not be accurate representations of what they’re looking for in final presentation
