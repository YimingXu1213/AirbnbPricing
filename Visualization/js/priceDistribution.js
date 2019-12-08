// empty means all
filteringPrice = {"bedrooms":[],"beds":[],"bathrooms":[],"room_type":[]};

/*
 * PriceDistribution - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

PriceDistribution = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}

/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

PriceDistribution = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}


/*
 * Initialize area chart with brushing component
 */

PriceDistribution.prototype.initVis = function(){
    var vis = this; // read about the this

    vis.margin = {top: 80, right: 0, bottom: 30, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


// Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.path = vis.svg.append("path");


    // TO-DO: Initialize brush component
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush", brushed);

    // TO-DO: Append brush component here
    vis.svg.append("g")
        .attr("class", "x brush")
        .call(vis.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");


    // add axis labels
    vis.svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", vis.width-50)
        .attr("y", vis.height+15)
        .text("Price");

    vis.svg.append("text")
        .attr("class", "axis-label")
        .attr("x", -33)
        .attr("y", -10)
        .text("Frequency");

    //add title
    vis.svg.append("text")
        .attr("class", "title")
        .attr("x", -33)
        .attr("y", -30)
        .text("Price Difference");


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

PriceDistribution.prototype.wrangleData = function(){
    var vis = this;

    // filter displayData
    var features = ["bedrooms","beds","bathrooms","room_type"];

    vis.displayData = vis.data.filter(function(d){
        var mask = true;
        features.forEach(function(f){
            if(filteringPrice[f].length > 0){
                mask = mask & filteringPrice[f].includes(d[f])
            }
        });
        return mask;
    })

    // update x domain before generating bins
    vis.x.domain(d3.extent(vis.displayData, function(d) { return d.price; }));

    vis.bins = vis.x.ticks(25);

    vis.binnedData = d3.histogram()
        .thresholds(vis.bins)
        .value(function(d) { return d.price; })
        (vis.displayData);

    vis.binnedData.unshift({x0:0,x1:0,length:0});

    console.log("binned Data");
    console.log(vis.binnedData);

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

PriceDistribution.prototype.updateVis = function(){
    var vis = this;

    // * TO-DO *
    // (1) Update domains
    vis.y.domain([0, d3.max(vis.binnedData, function(d) { return d.length; })]);


    // (2) area plot

    // SVG area path generator
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x((d.x0+d.x1)/2); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.length); });

    // Draw area by using the path generator
    vis.path
        .datum(vis.binnedData)
        .transition()
        .duration(1000)
        .attr("d", vis.area);

    // path.exit().remove();

    // // (2) Draw rectangles
    // var bars = vis.svg.selectAll("rect")
    //     .data(vis.displayData);
    //
    // bars.enter()
    //     .append("rect")
    //     .merge(bars)
    //     .transition()
    //     .duration(1000)
    //     .attr("fill", "#73BFBF")
    //     .attr("width", function(d){
    //         return vis.x(d.value)})
    //     .attr("height", vis.y.bandwidth())
    //     .attr("x", function(d){return 0})
    //     .attr("y", function(d){return vis.y(d.key)});
    //
    // vis.svg.selectAll("rect").on("click",function(d){
    //     console.log(d);
    // });
    //
    // bars.exit().remove();

    // // (3) Draw labels
    // var labels = vis.svg.selectAll("text.bar-label")
    //     .data(vis.displayData);
    //
    // labels.enter()
    //     .append("text")
    //     .merge(labels)
    //     .transition()
    //     .duration(1000)
    //     .attr("class","bar-label")
    //     .attr("x", function(d){return vis.x(d.value)})
    //     .attr("y", function(d){return vis.y(d.key) + 0.5*vis.y.bandwidth()})
    //     .attr("font-size", 11)
    //     .text(function(d){
    //         return d.value;
    //     })
    //     .attr("alignment-baseline", "middle");
    //
    // labels.exit().remove();

    // Update axis
    vis.svg.select(".x-axis")
        .call(vis.xAxis);

    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);


}


