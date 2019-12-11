
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
	L.Icon.Default.imagePath = '../static/img/';

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

StationMap.prototype.wrangleData = function(priceRange) {
	var vis = this;

	// filter displayData
	var features = ["bedrooms","beds","bathrooms","room_type"];

	vis.displayData = vis.data.filter(function(d){
		var mask = true;
		// filter by barcharts
		features.forEach(function(f){
			if(filteringPrice[f].length > 0){
				mask = mask & filteringPrice[f].includes(d[f])
			}
		});
		// filter by area chart
		if(priceRange){
			mask = mask &(d.price < priceRange[1])&(d.price > priceRange[0]);
		}
		return mask;
	})

	// Update the visualization
	vis.updateVis();

}


/*
 *  The drawing function
 */

StationMap.prototype.updateVis = function() {
	var vis = this;
	console.log(vis.displayData);
	// remove old layer
	if(vis.myRenderer){
		vis.map.removeLayer(vis.myRenderer);
	}

	vis.myRenderer = L.canvas({ padding: 0.5 });
	vis.stations = L.layerGroup().addTo(vis.map);
	vis.displayData.forEach(function(d){
		var popUpContent = '<strong>'+d.name+'</strong><br/>'+d.room_type+'<br/>' + d.bedrooms+' bedrooms, '+ d.beds+' beds'+'<br/>' + d.bathrooms+' bathrooms';
		var marker = L.circleMarker([d.latitude, d.longitude],{
			renderer: vis.myRenderer,
			color: '#F25764',
			radius: 3,
			opacity: 0.7
		}).bindPopup(popUpContent).addTo(vis.map); //.bindPopup(popUpContent)
		vis.stations.addLayer(marker);
	})

}
