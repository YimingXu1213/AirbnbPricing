
// Will be used to the save the loaded JSON data
var allData = {};

// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Variables for the visualization instances
var mapchart;
var barcharts = [];

// Start application by loading the data
loadData();

function loadData() {
    // d3.json("data/uk-household-purchases.json", function(error, jsonData){
    //     if(!error){
    //         allData = jsonData;
    //
    //         // Convert Pence Sterling (GBX) to USD and years to date objects
    //         allData.layers.forEach(function(d){
    //             for (var column in d) {
    //                 if (d.hasOwnProperty(column) && column != "Year") {
    //                     d[column] = parseFloat(d[column]) * 1.481105 / 100;
    //                 } else if(d.hasOwnProperty(column) && column == "Year") {
    //                     d[column] = parseDate(d[column].toString());
    //                 }
    //             }
    //         });
    //
    //         allData.years.forEach(function(d){
    //             d.Expenditures = parseFloat(d.Expenditures) * 1.481105 / 100;
    //             d.Year = parseDate(d.Year.toString());
    //         });
    //
    //         // Update color scale (all column headers except "Year")
    //         // We will use the color scale later for the stacked area chart
    //         colorScale.domain(d3.keys(allData.layers[0]).filter(function(d){ return d != "Year"; }))
    //
    //         createVis();
    //     }
    // });

    d3.csv("data/listings.csv", function(data){

        data.forEach(function(d){
            d.longitude = parseFloat(d.longitude);
            d.latitude = parseFloat(d.latitude)
        });
        allData.listings = data;

        d3.json("data/Boston_Neighborhoods.geojson",function(boston){
            allData.boston = boston;

            createVis();
        });


    });
}


function createVis() {

	// Instantiate visualization objects
    // boston map
    mapchart = new MapChart("map-area", allData);

    // bars as filters on the right
    barcharts.push(new BarChart("bar-area", allData.listings, "bedrooms"));
    barcharts.push(new BarChart("bar-area", allData.listings, "beds"));
    barcharts.push(new BarChart("bar-area", allData.listings, "bathrooms"));
    barcharts.push(new BarChart("bar-area", allData.listings, "room_type"));

    barcharts[0].svg.append("text").attr("class","chart-title")
        .text("Bedrooms").attr("x",-100).attr("y", -20);
    barcharts[1].svg.append("text").attr("class","chart-title")
        .text("Beds").attr("x",-100).attr("y", -20);
    barcharts[2].svg.append("text").attr("class","chart-title")
        .text("Bathrooms").attr("x",-100).attr("y", -20);
    barcharts[3].svg.append("text").attr("class","chart-title")
        .text("Room Type").attr("x",-100).attr("y", -20);

    // histogram for price
    barcharts.push(new BarChart("price-histogram", allData.listings, "price"));

}


function brushed() {

	// TO-DO: React to 'brushed' event
    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    var selectionDomain = selectionRange.map(timeline.x.invert);

    // Update focus chart (detailed information)
    areachart.x.domain(selectionDomain);
    areachart.wrangleData();

}
