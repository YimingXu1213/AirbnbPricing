
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

StationMap = function(_parentElement, _data, _mapPosition) {

	this.parentElement = _parentElement;
	this.data = _data;
	this.mapPosition = _mapPosition;
	this.displayData = this.data;

	this.initVis();
}


/*
 *  Initialize station map
 */

StationMap.prototype.initVis = function() {
	var vis = this;

	// add map
	vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 13);
	L.Icon.Default.imagePath = 'img/';

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(vis.map);

	// // MBTA lines
	// $.getJSON('data/MBTA-Lines.json', function(data) {
	// 	// Work with data
	// 	L.geoJson(data.features,{
	// 		style: styleMBTA,
	// 		weight: 3,
	// 		fillOpacity: 0.5
	// 	}).addTo(vis.map);
	// 	console.log(data.features);
	// 	function styleMBTA(line){
	// 		return { color: line.properties.LINE}
	// 	}
	// });

	vis.wrangleData();
}


/*
 *  Data wrangling
 */

StationMap.prototype.wrangleData = function() {
	var vis = this;

	// Currently no data wrangling/filtering needed
	vis.displayData = vis.data;

	// Update the visualization
	vis.updateVis();

}


/*
 *  The drawing function
 */

StationMap.prototype.updateVis = function() {
	var vis = this;
	console.log(vis.displayData)

	var myRenderer = L.canvas({ padding: 0.5 });
	vis.stations = L.layerGroup().addTo(vis.map);
	vis.displayData.forEach(function(d){
		// var popUpContent = '<strong>'+d.name+'</strong><br/>'+d.nbBikes+' bike(s) available<br/>>' + d.nbEmptyDocks+' empty docks';
		var marker = L.circleMarker([d.latitude, d.longitude],{
			renderer: myRenderer,
			color: '#F25764',
			radius: 3,
			opacity: 0.7
		}).addTo(vis.map); //.bindPopup(popUpContent)
		vis.stations.addLayer(marker);
	})

}
