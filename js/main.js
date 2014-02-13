//global variables
var map; //map object
var counter = 0;

//begin script when window loads
window.onload = initialize(); //->

//the first function called once the html is loaded
function initialize(){
  //<-window.onload
  setMap(); //->
};

//set basemap parameters
function setMap() {
  //<-initialize()
  
  //create  the map and set its initial view
  map = L.map('map').setView([1.355312,103.840068], 12);
  var ui = document.getElementById('map-ui');
}
  	//add the standard tile layer to the map
  	var standardLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
    {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
    //add the tile layer to the map
    var transportLayer = L.tileLayer('http://{s}.tile.opencyclemap.org/transport/{z}/{x}/{y}.png', 
    {
  	  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  	});
	
	
	//Load Locate
	L.control.locate({
	    position: 'topleft',  // set the location of the control
	    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
	    follow: false,  // follow the user's location
	    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
	    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
	    circleStyle: {},  // change the style of the circle around the user's location
	    markerStyle: {},
	    followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
	    followMarkerStyle: {},
	    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
	    metric: true,  // use metric or imperial units
	    onLocationError: function(err) {alert(err.message)},  // define an error callback function
	    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
	            alert(context.options.strings.outsideMapBoundsMsg);
	    },
	    strings: {
	        title: "Show me where I am",  // title of the locat control
	        popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
	        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
	    },
	    locateOptions: {}  // define location options e.g enableHighAccuracy: true
	}).addTo(map);
	

	new L.Control.GeoSearch({
	    provider: new L.GeoSearch.Provider.OpenStreetMap(),
	    position: 'topcenter',
	    showMarker: true
	}).addTo(map);

	var selectedIcon = 'book';
	function getMarker(feature) {
		var tierOneMarker = L.AwesomeMarkers.icon({
		  icon: selectedIcon,
		  iconColor: 'white',
		  markerColor: 'green'
		});
		
		var tierTwoMarker = L.AwesomeMarkers.icon({
		  icon: selectedIcon,
		  iconColor: 'white',
		  markerColor: 'orange'
		});
		
		var tierThreeMarker = L.AwesomeMarkers.icon({
		  icon: selectedIcon,
		  iconColor: 'white',
		  markerColor: 'red'
		});
		
		if(feature.properties.Tier == "Tier 1") {
			return tierOneMarker;
		} else if (feature.properties.Tier == "Tier 2") {
			return tierTwoMarker;
		} else {
			return tierThreeMarker;
		}
	}
	
	var markers = L.markerClusterGroup(
		{ 
			maxClusterRadius: 100 
		}
	);
	var education;
	$.getJSON('data/education.geojson', function(data) {
		education = L.geoJson(data, {
			pointToLayer: function (feature, latlng) {
			        return L.marker(latlng, {icon: getMarker(feature)});
			},
			onEachFeature: function (feature, layer) {
				layer.bindPopup(feature.properties.POI_NAME + "<br/>" + feature.properties.Tier + " Ranking (" + feature.properties.POI_TYPE + ")");
				markers.addLayer(layer);
			}
		});
		counter++;
		loadLayerControl();
	});
	markers.addTo(map);
		
	var proportionalLayer;
	 $.getJSON('data/district-point.geojson', function(data){
		proportionalLayer = L.geoJson(data, {
			pointToLayer: function(feature, latLng) {
				return L.circleMarker(latLng, {
					radius: feature.properties.COUNT/50,
					fillColor: "#0056a6",
					color: "#0056a6",
				});
			}
		});
		
		//proportionalLayer.setZIndex(9999);
		//proportionalLayer.bringToFront();
		counter++;
		loadLayerControl();
	});	
		
	
	var choropeth;
	 $.getJSON('data/district.geojson', function(data){
		
		 
		choropeth = L.geoJson(data, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
		choropeth.setZIndex(9);
		choropeth.bringToBack();
		counter++;
		loadLayerControl();

	});
	

	
	//Functions for Choropeth
	var choroplethSelectedVariable = "AVG_TRAN";
	function style(feature){
		var choroplethStyle;
		if (choroplethSelectedVariable == "AVG_TRAN"){
			choroplethStyle = {
			fillOpacity: 1,
			opacity: 1,
			fillColor: getColor(feature.properties.AVG_TRAN, "AVG_TRAN"),
			color: 'white',
			weight: 2,
			dashArray: '3'
			}
		} else if (choroplethSelectedVariable == "AVG_UNIT") {
			choroplethStyle = {
			fillOpacity: 1,
			opacity: 1,
			fillColor: getColor(feature.properties.AVG_UNIT, "AVG_UNIT"),
			color: 'white',
			weight: 2,
			dashArray: '3'
			}
		} else if (choroplethSelectedVariable == "COUNT") {
			choroplethStyle = {
			fillOpacity: 1,
			opacity: 1,
			fillColor: getColor(feature.properties.COUNT, "COUNT"),
			color: 'white',
			weight: 2,
			dashArray: '3'
			}
		}
		return choroplethStyle;
	}

	var selectedColorScheme = "OrRd"; //Default Color Scheme
	var BuGn = ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76",
	"#238b45", "#006d2c", "#00441b"];
	var OrRd = ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548",
	"#d7301f", "#b30000", "#7f0000"];
	var BrBG = ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5",
	"#80cdc1", "#35978f", "#01665e"];
	var PiYG = ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0",
	"#b8e186", "#7fbc41", "#4d9221"];

	var selectedArr;
	var colorSchemeArr = "OrRd";
	function getColor(d, selectedVariable) {
		var avgTranArr = [343036, 686072, 1029109, 1372145, 2058218, 2401255, 2744291, 3087328, 9608044];
		var avgUnitArr = [237, 475, 712, 950, 1187, 1425, 1662, 1900, 2804];
		var countArr = [290, 580, 870, 1160, 1450, 1740, 2030, 2320, 2610];

		if(selectedVariable == "AVG_TRAN") {
			selectedArr = avgTranArr;
		} else if (selectedVariable == "AVG_UNIT") {
			selectedArr = avgUnitArr;
		} else if (selectedVariable == "COUNT") {
			selectedArr = countArr;
		}
		
		if(selectedColorScheme == "OrRd") {
			colorSchemeArr = OrRd;
		} else if (selectedColorScheme == "BuGn") {
			colorSchemeArr = BuGn;
		} else if (selectedColorScheme == "BrBG") {
			colorSchemeArr = BrBG;
		} else if (selectedColorScheme == "PiYG") {
			colorSchemeArr = PiYG;
		}
		
		//console.log(d);
		
	    return d > selectedArr[8] ? colorSchemeArr[8] :
	           d > selectedArr[7]  ? colorSchemeArr[7]  :
	           d > selectedArr[6]  ? colorSchemeArr[6]  :
	           d > selectedArr[5]  ? colorSchemeArr[5] :
	           d > selectedArr[4]   ? colorSchemeArr[4]  :
	           d > selectedArr[3]   ? colorSchemeArr[3]  :
	           d > selectedArr[2]   ? colorSchemeArr[2]  :
			   d > selectedArr[1]   ? colorSchemeArr[1]  :
	                      colorSchemeArr[0] ;
	}
	
	function onEachFeature(feature, layer) {
	    layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetHighlight,
	        click: zoomToFeature
	    });
	}
	
	function zoomToFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}
	
	//=== Update Information ====
	var info = L.control({position: 'topright'});
	
	function highlightFeature(e) {
		var layer = e.target;
	    info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
		//geojson.resetStyle(e.target);
	    info.update();
	}

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
	    this._div.innerHTML = '<h4 class="panel-title">District Information</h4>' +  (props ?
	        '<b>' + props.DGPZ_NAME + '</b><br />Transaction Count: ' + props.COUNT + "<br/>" +
			"Avg Trans Price ($): " + props.AVG_TRAN + "<br/>" +
			"Avg Unit Price ($/psf): " + props.AVG_UNIT
	        : 'Hover over a state<br/>Hover');
	};

	info.addTo(map);
	//============================
	
	//====== Color Scheme ========
	var colorBrewer = L.control({position: 'topright'});
	colorBrewer.onAdd = function(map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this._div.innerHTML = "<h4 class='panel-title'>Color Scheme</h4>" + 
		"<select id='selectColorScheme'>" +
		  "<option value='OrRd' selected>OrRd</option>" +
		  "<option value='BuGn'>BuGn</option>" +
		  "<option value='BrBG'>BrBG</option>" +
		  "<option value='PiYG'>PiYG</option>" +
		"</select>";
	    return this._div;
	}
	colorBrewer.addTo(map);
	
	$('#selectColorScheme').on('change', function(event) {
		event.stopPropagation();
	    selectedColorScheme = this.value; // or $(this).val()
		choropeth.setStyle(style);
		var colorCounter = 0;
		$('.choropleth-bar').each(function(i, obj) {
		    $(obj).css('fill', colorSchemeArr[colorCounter]);
			colorCounter++;
		});
	});
	//==========================
	
	//===== Choropleth Selection ===
	var choroplethDropdown = L.control({position: 'topright'});
	choroplethDropdown.onAdd = function(map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this._div.innerHTML = "<h4 class='panel-title'>Choropleth Variable</h4>" + 
		"<select id='choroplethVariableSelector'>" +
		  "<option value='AVG_TRAN' selected>Avg Transaction Price</option>" +
		  "<option value='AVG_UNIT'>Unit Price ($/psf)</option>" +
		  "<option value='COUNT'> # of Transactions</option>" +
		"</select>";
	    return this._div;
	}
	choroplethDropdown.addTo(map);
	
	$('#choroplethVariableSelector').on('change', function(event) {
		event.stopPropagation();
		choroplethSelectedVariable = this.value;
		choropeth.setStyle(style);
		
		$('#legendMaxLabel').html(selectedArr[8]);
		if(this.value != "AVG_TRAN") {
			$('#legendMaxLabel').attr("x", 278);
		} else {
			$('#legendMaxLabel').attr("x", 255);
		}
		
	});
	
	//====== Marker Selector ===
	var markerSelector = L.control({position: 'topright'});
	markerSelector.onAdd = function(map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this._div.innerHTML = "<h4 class='panel-title'>Marker Selector</h4>" + 
		"<select id='markerVariableSelector'>" +
		  "<option value='book' selected>Book Icon</option>" +
		  "<option value='star'>Star Icon</option>" +
		  "<option value='heart'> Heart Icon</option>" +
		"</select>";
		return this._div;
	}
	markerSelector.addTo(map)
	
	$('#markerVariableSelector').on('change', function(event) {
		event.stopPropagation();
		var previousIcon = selectedIcon; 
		selectedIcon = this.value;
		
		$('.glyphicon').each(function (i, obj){
			$(obj).addClass('glyphicon-' + selectedIcon).removeClass('glyphicon-' + previousIcon);
		});
	});
	
	//===== Upload File =======
	var uploadFile = L.control({position: 'topright'});
	uploadFile.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info');
		this._div.innerHTML = "<h4 class='panel-title'>Add New Layer</h4>" +
		"<button type='button' class='btn btn-default' data-toggle='modal' data-target='#myModal'>Upload GeoJSON</button>";
		return this._div;
	}
	uploadFile.addTo(map);
	
	//Control Scale
	
	L.control.scale({
		maxWidth: 200
	}).addTo(map);
	
	
	
	//==== Load MRT =======
	var eastWestLine = ["160808332", "141393160", "141393156", "19881423", 
	"19939726", "142440364", "142440361", "20141158", "20141164", "19880782", 
	"142420479", "142424444", "19979739"];
	var northSouthLine = ["19987450", "93836774", "93836775", "19810659", "103410980", 
	"233926982", "233926990", "233926980", "233926981","233926987", "233927001", "233926992",
	"233926991", "233926984", "233926998", "233927002", "233926989", "233926996", "233926999",
	"233926997", "173131864", "141393963", "141393961"];
	var northEastLine = ["20164999"];
	var circleLine = ["35308148", "35308147", "33739391", "140918628"];
	var downtownLine = ["178063325", "251603805", "251603810", "203845606", "203845607"];
	
	var eastWestStyle =
	{
		fillOpacity: 1,
		opacity: 1,
		color: '#39ac00',
		weight: 3,
	}
	
	var northSouthStyle = {
		fillOpacity: 1,
		opacity: 1,
		color: '#dc0000',
		weight: 3,
	}
		
	var northEastStyle =
	{
		fillOpacity: 1,
		opacity: 1,
		color: '#8000a5',
		weight: 3,
	}
	
	var circleStyle =
	{
		fillOpacity: 1,
		opacity: 1,
		color: '#F4B234',
		weight: 3,
	}
	
	var downtownStyle =
	{
		fillOpacity: 1,
		opacity: 1,
		color: '#0354A6',
		weight: 3,
	}
	
	var mrt = L.layerGroup();
	var eastWestCounter = 0;
	var northSouthCounter = 0;
	var northEastCounter = 0;
	var circleCounter = 0;
	var downtownCounter = 0;
	var eastWestLayer;
	var northSouthLayer;
	var northEastLayer;
	var circleLayer;
	var downtownLayer;

	for(var i = 0; i < eastWestLine.length; i++) {
		$.ajax({
	  	  	url: "http://www.openstreetmap.org/api/0.6/way/" + eastWestLine[i] + "/full",
	  		dataType: "xml",
			success: function (xml) {
	    		eastWestLayer = new L.OSM.DataLayer(xml);
				eastWestLayer.setStyle(eastWestStyle);
				mrt.addLayer(eastWestLayer);
				eastWestCounter++;
				
				if(eastWestCounter == eastWestLine.length) {
					counter++;
					loadLayerControl();
				}
			}
		});
	}
	
	for(var i = 0; i < northSouthLine.length; i++) {
		$.ajax({
	  	  	url: "http://www.openstreetmap.org/api/0.6/way/" + northSouthLine[i] + "/full",
	  		dataType: "xml",
			success: function (xml) {
	    		northSouthLayer = new L.OSM.DataLayer(xml);
				northSouthLayer.setStyle(northSouthStyle);
				mrt.addLayer(northSouthLayer);
				northSouthCounter++;
				
				if(northSouthCounter == northSouthLine.length) {
					counter++;
					loadLayerControl();
				}
			}
		});
	}
	
	for(var i = 0; i < northEastLine.length; i++) {
		$.ajax({
	  	  	url: "http://www.openstreetmap.org/api/0.6/way/" + northEastLine[i] + "/full",
	  		dataType: "xml",
			success: function (xml) {
	    		northEastLayer = new L.OSM.DataLayer(xml);
				northEastLayer.setStyle(northEastStyle);
				mrt.addLayer(northEastLayer);
				northEastCounter++;
				
				if(northEastCounter == northEastLine.length) {
					counter++;
					loadLayerControl();
				}
	  		}
		});
	}
	
	for(var i = 0; i < circleLine.length; i++) {
		$.ajax({
	  	  	url: "http://www.openstreetmap.org/api/0.6/way/" + circleLine[i] + "/full",
	  		dataType: "xml",
			success: function (xml) {
	    		circleLayer = new L.OSM.DataLayer(xml);
				circleLayer.setStyle(circleStyle);
				mrt.addLayer(circleLayer);
				circleCounter++;
				
				if(circleCounter == circleLine.length) {
					counter++;
					loadLayerControl();
				}
	  		}
		});
	}
	
	for(var i = 0; i < downtownLine.length; i++) {
		$.ajax({
	  	  	url: "http://www.openstreetmap.org/api/0.6/way/" + downtownLine[i] + "/full",
	  		dataType: "xml",
			success: function (xml) {
	    		downtownLayer = new L.OSM.DataLayer(xml);
				downtownLayer.setStyle(downtownStyle);
				mrt.addLayer(downtownLayer);
				downtownCounter++;
				
				if(downtownCounter == downtownLine.length) {
					counter++;
					loadLayerControl();
				}
	  		}
		});
	}



	
	
	function loadLayerControl() { 
		//console.log(counter);
		if(counter == 7) {
			var baseMaps = {
				"Standard Map": standardLayer, 
				"Transport Map": transportLayer
			};

			var overlayMaps = {
				"District": choropeth,
				"Transaction Volume": proportionalLayer,
				"MRT": mrt,
				"Education": markers

		
			};

				L.control.layers(baseMaps, overlayMaps, {
					collapsed: false,
					position: "topleft"
				}).addTo(map);
		}
	}
	
	
	//Listening to Base Layer Change
	map.on('baselayerchange', function(a) {
	        //console.log(a);
	        //alert("The layer changed to " + baseMaps[a.name].getLayers()[0].getLatLng().lat);
	    });

	//Listening to Overlay Layer Add
	map.on('overlayadd', function(a) {
	  if(a.name == "MRT") {
	  	$('#mrt-legend').show();
	  }
	  if(a.name == "District") {
	  	$('#choropleth-legend').show();
	  }
	});

	//Listening to Overlay Layer Remove
	map.on('overlayremove', function(a) {
	   console.log(a);
 	  if(a.name == "MRT") {
 	  	$('#mrt-legend').hide();
 	  }
	  if(a.name == "District") {
	  	$('#choropleth-legend').hide();
	  }
	});
	
	//Uploading FIle
	$('#upload-temp-submit').click(function() {
		var data = new FormData();
		var filename = "";
		jQuery.each($('#file')[0].files, function(i, file) {
		    data.append('file-'+i, file);
			filename = file.name;
		});
		
		$.ajax({
		    url: 'upload.php',
		    data: data,
		    cache: false,
		    contentType: false,
		    processData: false,
		    type: 'POST',
		    success: function(data){
		        if(data == "true") {
					var filePath = "file/" + filename;
					console.log(filePath);
			   	 	$.getJSON(filePath,function(data){
						var newLayer = L.geoJson(data, {
							onEachFeature: onEachFeature
						}).addTo(map);
					});
				}
				$('#myModal').modal('hide');
		    }
		});
	});
	
	
	
	
	

	
	
		

	
	
	
