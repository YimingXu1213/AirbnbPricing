
/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BarChart = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = _data;
    this.initVis();
};



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 60, bottom: 0, left: 100 };
    // Get current width
    var Width = $("#" + vis.parentElement).width();
    // Set min width so that layout won't break
    document.getElementById(vis.parentElement).style.minWidth = Width+"px";
    vis.width = Width - vis.margin.left - vis.margin.right,
        vis.height = 140 - vis.margin.top - vis.margin.bottom;

    // * TO-DO *
    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleBand()
        .range([0, vis.height])
        .paddingInner(0.4);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "y-axis axis");


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;

    // (1) Group data by key variable (e.g. 'electricity') and count leaves
    // (2) Sort columns descending


    // * TO-DO *
    vis.displayData = d3.nest()
        .key(function(d) { return d[vis.config]; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(vis.displayData);
    vis.displayData.sort(function(a,b){return a.key - b.key});

    console.log(vis.displayData);
    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

BarChart.prototype.updateVis = function(){
    var vis = this;

    // * TO-DO *
    // (1) Update domains
    vis.x.domain([0, d3.max(vis.displayData, d=>d.value)]);
    vis.y.domain(vis.displayData.map(d=>d.key));
    vis.displayData.forEach(function(d){
        d['feature'] = vis.config;
    })
    console.log(vis.displayData);

    // (2) Draw rectangles
    var bars = vis.svg.selectAll("rect")
        .data(vis.displayData);

    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("fill", "#73BFBF")
        .attr("width", function(d){
            return vis.x(d.value)})
        .attr("height", vis.y.bandwidth())
        .attr("x", function(d){return 0})
        .attr("y", function(d){return vis.y(d.key)});

    vis.svg.selectAll("rect").on("click",function(d){
        console.log(d);
    });

    bars.exit().remove();

    // (3) Draw labels
    var labels = vis.svg.selectAll("text.bar-label")
        .data(vis.displayData);

    labels.enter()
        .append("text")
        .merge(labels)
        .transition()
        .duration(1000)
        .attr("class","bar-label")
        .attr("x", function(d){return vis.x(d.value)})
        .attr("y", function(d){return vis.y(d.key) + 0.5*vis.y.bandwidth()})
        .attr("font-size", 11)
        .text(function(d){
            return d.value;
        })
        .attr("alignment-baseline", "middle");

    labels.exit().remove();

    // Update the y-axis
    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

}



/*
 * Filter data when the user changes the selection
 * Example for brushRegion: 07/16/2016 to 07/28/2016
 */

BarChart.prototype.selectionChanged = function(brushRegion){
    var vis = this;

    // Filter data accordingly without changing the original data

    // * TO-DO *
    console.log(brushRegion);
    vis.displayData = vis.data.filter(function(d){
        return d.survey>=brushRegion[0] && d.survey<=brushRegion[1]
    });


    // Update the visualization
    vis.wrangleData();
}

