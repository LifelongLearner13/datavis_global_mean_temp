# Visualization of Goddard Institute for Space Studies (GISS) Global Mean Surface Temperatures

## Discription

Solution to a data visualization assignment for the [Data Mining](https://www.coursera.org/specializations/data-mining) specialization on Coursera. 

## Technologies

- [D3.js](https://d3js.org/)

## Process

I started the project by exploring examples on the [D3 Gal](https://github.com/d3/d3/wiki/Gallery) for inspiration. Mike Bostock's [Brush &amp; Zoom](ttps://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172) chart provides a way to explore large data sets while maintaining the benefits of an overview. I initially tried to recreate Bostock's chart from scratch. Unfortunately, due to my lack of experience working with SVG coordinate systems, this plan ended in frustration. Next, I tried copying Bostock's code verbatim, then slow modifying it to meet my needs. The result was a bar chart with zoom and pan interactions. I tried to organize the code with but ended up with a lot of global variables. In the future, I hope to refactor the code and increase the interactive nature of the visualization.

## Technical To-Dos:

- [ ] Reduce/elinate the global variables
- [ ] Modularize code using classes
- [ ] Use D3 color scale instead of hard coded values
- [ ] Automate the creation of the legend

## Visualization To-Dos:

- [ ] Zoom shows more data, for example, the mean temperatures for each month in a year.


