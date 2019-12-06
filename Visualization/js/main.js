
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

    d3.csv("data/listings.csv", function(data){

        // data cleaning- format
        data = data.filter(function(d){
            return (d.bathrooms!=="0")&(d.bedrooms!=="")&(d.beds!=="0")&(d.bathrooms!=="")&(d.bathrooms!=="0.5")
        })
        data.forEach(function(d){
            d.longitude = parseFloat(d.longitude);
            d.latitude = parseFloat(d.latitude);
            if(parseInt(d.bedrooms)>=3){
                d.bedrooms = "3+"
            }
            if(parseInt(d.beds)>=3){
                d.beds = "3+"
            }
            if(parseFloat(d.bathrooms)>2){
                d.bathrooms = "2.5+"
            }

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
    stationMap = new StationMap('map-area', allData.listings, [42.358990, -71.058632]);





    // previous
    // boston map
    // mapchart = new MapChart("map-area", allData);

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
    // barcharts.push(new BarChart("price-histogram", allData.listings, "price"));

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
