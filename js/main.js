$(document).ready(function() {

//********************Diseño de las capas en Openlayers********************
var bingmaps = new ol.layer.Tile({
      source: new ol.source.BingMaps({
         key: 'AiMTVzRDXjI59qeeiRX0JM-EolDuDPTc-TjqzmAkzxcOiKwvjBgIC2C7BFIc3Rvd',
         imagerySet:'RoadOnDemand'}),
    visible: false,
    name: 'bingmaps',
    title: 'bingmaps'
  })

var esri = new ol.layer.Tile({
    source: new ol.source.XYZ({
            attributions: [
                new ol.Attribution({
                    html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
                })
            ],
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        }),
    visible: false,
    name: 'esri',
    title: 'esri'
  });

var stamen = new ol.layer.Group({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.Stamen({ 
          layer: 'watercolor' 
        })
      }),
      new ol.layer.Tile({
        source: new ol.source.Stamen({ 
          layer: 'terrain-labels' 
        })
      })
    ],
    visible: false,
    name: 'stamen',
    title: 'stamen'
  });

var mapquest = new ol.layer.Tile({
      source: new ol.source.OSM(),
      visible: true,
      name: 'mapquest',
      title: 'mapquest'
});

var view = new ol.View({
    center: [-7217890.205764902, -2010870.6048274133],
    zoom: 5,
    maxZoom: 18,
    minZoom: 2
  });

var map = new ol.Map({
  layers: [
    mapquest,bingmaps, esri, stamen
  ],
  target: 'map',
  controls: ol.control.defaults().extend([
      new ol.control.ScaleLine(),
      new ol.control.ZoomSlider()
    ]),
  renderer: 'canvas',
  view: view
});
//*************************************************************************************

//**************************Funcion del nav ******************************************
$('#layers input[type=radio]').change(function() {
    var layer = $(this).val();
    map.getLayers().getArray().forEach(function(e) {
      var name = e.get('name');
      e.setVisible(name == layer);
    });
  });
//*************************************************************************************

//***************************Punteros*************************************************
var pointDraw;
var vectorSource = new ol.source.Vector();
var coordinates = $("#coordinates");

  var vectorLayer = new ol.layer.Vector({
    source: vectorSource
  });

  map.addLayer(vectorLayer);

  $("#pan").click(function() {
    clearCustomInteractions();
    $(this).addClass('active');
    return false;
  });

  $("#drawPoint").click(function() {
    clearCustomInteractions();
    $(this).addClass('active');

    pointDraw = new ol.interaction.Draw({
      source: vectorSource,
      type: 'Point'
    });

    map.addInteraction(pointDraw);

    pointDraw.on('drawend', function(e) {
      var feature = e.feature;
      vectorSource.clear();
      vectorSource.addFeature(feature);
      var latLong = feature.getGeometry().getCoordinates();
      coordinates.text(ol.coordinate.toStringHDMS(ol.proj.transform(latLong, 'EPSG:3857', 'EPSG:4326')));
      generatePointWkt(feature);
    });

    return false;
  });

  $("#erasePoint").click(function() {
    clearCustomInteractions();
    $(this).addClass('active');
    vectorSource.clear();
    coordinates.empty();
    return false;
  });

  function clearCustomInteractions() {
    $("#bar").find("p").removeClass('active');
    map.removeInteraction(pointDraw);
  }
//**********************************************************************************

//***************************campos para mostrar lat-lon****************************
var latitude = $("[name='latitude']");
var longitude = $("[name='longitude']");
var wkt = $("[name='wkt']");

  $('#enviar').click(function() {
    var lat = latitude.val();
    var long = longitude.val();

    if(long != '' && lat != '') {
      vectorSource.clear();
      vectorSource.addFeature(
        new ol.Feature({
          geometry: new ol.geom.Point([parseFloat(long), parseFloat(lat)]).transform('EPSG:4326', 'EPSG:3857')
        })
      );

      wkt.val('POINT(' + long + ' ' + lat + ')');
      map.getView().fitExtent(vectorSource.getExtent(), map.getSize());
    }
    return false;
  });

  function generatePointWkt(e) {
    var coords = ol.proj.transform(e.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    longitude.val(coords[0]);
    latitude.val(coords[1]);

    coords.length ? wkt.val('POINT(' + coords[0] + ' ' + coords[1] + ')') : wkt.val('');

    return false;
  }


});