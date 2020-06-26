// Advanced Version

function colorScale(mag) {
    return mag > 6 ? "#370617":
        mag >= 5 ? "#d00000":
        mag >= 4 ? "#e85d04":
        mag >= 3 ? "#faa307":
        mag >= 2 ? "#ffba08":
        mag >= 1 ? "#d6ff00":
                    "#63ff00";
}

function features(data, faults) {

    var info = L.control();

    info.onAdd = function() {
        this._div = L.DomUtil.create("div", "info"); // Create div with class info
        this.update();
        return this._div;
    }

    info.update = function(props) {
        this._div.innerHTML = '<h4>Earthquake Data</h4>' +  (props ?
            '<strong>Date: </strong>' + new Date(props.time) +'<br>' + '<strong>Location: </strong>' + props.place + '<br>' + '<strong>Magnitude: </strong>' + props.mag
            : 'Hover over an earthquake');
    }

    function highlightFeature(e) {
        var layer = e.target;
    
        layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "Dash",
            fillOpacity: 0.7
        });
    
        if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    
        info.update(layer.feature.properties);
    }
    
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    }
    
    function zoomFeature(e) {
        console.log(e)
        map.fitBounds(e.latlng);
    }
    
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            // click: zoomFeature
        });

        var popupContent = `<h3> ${feature.properties.title}</h3>
        <hr><p>Updated: ${new Date(feature.properties.updated)}</p>
        <p>More Information: <a href=${feature.properties.url}>USGS Page</a></p>`

        layer.bindPopup(popupContent);
    }

    var geojson = L.geoJson(data, {
        
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {
            
            return L.circleMarker(latlng, {
                radius: feature.properties.mag,
                fillColor: colorScale(feature.properties.mag),
                color: colorScale(feature.properties.mag),
                weight: 2,
                opacity: 1,
                fillOpacity: 1
            });
        },

    });

    var geofaults = L.geoJson(faults, {
        style: {
            color: "green",
            weight: 2,
        }
    });

    map(geojson, geofaults, info);
}

function map(geojson, faults, info) {

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
      });

      var baseMaps = {
          "Outdoor Map": outdoors,
          "Satellite Map": satellite,
          "Dark Map": dark
      };

      var overlayMaps = {
          Earthquakes: geojson,
          Faults: faults
      };

      var myMap = L.map("map", {
          center: [0, 0],
          zoom: 2,
          layers: [outdoors, geojson, faults]
      });

      L.control.layers(baseMaps, overlayMaps, {
          position: "bottomright",
          collapsed: false
      }).addTo(myMap);

      info.addTo(myMap);

      var legend = L.control({position: "bottomright"});

      legend.onAdd = function() {
  
          var div = L.DomUtil.create("div", "info legend"),
          grades = [0, 1, 2, 3, 4, 5, 6],
          labels = [];
  
          // Loop through the density intervals and generate labels with colored squares
          for (var i = 0; i<grades.length; i++){
              div.innerHTML += 
                  '<i style="background:' + colorScale(grades[i] + 1) + '"></i> ' +
                  grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
          };
  
          return div;
  
      };

      legend.addTo(myMap);
}

// GeoJSON API url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var url2 = "./static/js/boundaries.json";

d3.json(url, function(data) {
    d3.json(url2, function(faults) {
        features(data, faults);
    })
});


