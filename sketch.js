class Point {

  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

let myMap;
let canvas;
const mappa = new Mappa('Leaflet');
let pos = [];

/*
 const options = {
    lat: pos[0].lat,
    lng: pos[0].lng,
    zoom: 4,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }*/

let options = {
    lat: 42.504154,
    lng: 12.646361,
    zoom: 6,
    //style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
    style: ((localStorage.getItem("style") != null) ? localStorage.getItem("style") : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}")
}

let styles = ["http://{s}.tile.osm.org/{z}/{x}/{y}.png", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"];

function process(text) {
  pos = [];

  parser=new DOMParser();
  xmlDoc=parser.parseFromString(text,"text/xml");

  console.log(xmlDoc.getElementsByTagName("trk")[0].getElementsByTagName("trkseg"));
  console.log(xmlDoc.getElementsByTagName("trk")[0].getElementsByTagName("trkseg").length);

  for(let i = 0; i < xmlDoc.getElementsByTagName("trk")[0].getElementsByTagName("trkseg").length; i++) {
    let tmp = xmlDoc.getElementsByTagName("trk")[0].getElementsByTagName("trkseg")[i].getElementsByTagName("trkpt");

    for(let j = 0; j < tmp.length; j++) {
      let lat = tmp[j].getAttribute("lat");
      let lon = tmp[j].getAttribute("lon");

      pos.push(new Point(lat, lon));
    }

  }

  drawPoint();

}

function setup(){
  cursor('https://s3.amazonaws.com/mupublicdata/cursor.cur');
  //canvas = createCanvas(850,760);
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("a");

  // Create a tile map with the options declared

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  myMap.onChange(drawPoint);

  let editBtn = createButton('Edit (e)').parent("a");
  editBtn.mousePressed(enable_edit);
  editBtn.position(60, 10);
  editBtn.style('z-index', '1000');
  editBtn.class("btn btn-default");

  let exportBtn = createButton('Export GPX (u)').parent("a");
  exportBtn.mousePressed(exportXML);
  exportBtn.position(145, 10);
  exportBtn.style('z-index', '1000');
  exportBtn.class("btn btn-default");

  // Make the file input
  var fileInput = createInput().parent("a");
  fileInput.position(0,0);
  fileInput.id("upload");
  //fileInput.position(280,10);
  // Set attribute to file
  fileInput.attribute('type','file');
  // If we want to allow multiple files
  fileInput.attribute('multiple','');
  fileInput.style('z-index', '2000');
  fileInput.style('display', 'none');
  //fileInput.style('opacity', '0');
  // If a file is selected this event will be triggered
  fileInput.elt.addEventListener('change', handleFileSelect, false);

  let fakeButton = createButton('Upload File').parent("a");
  //fakeButton.mousePressed(exportXML);
  fakeButton.position(280,10);
  fakeButton.style('z-index', '1000');
  fakeButton.class("btn btn-default");
  fakeButton.attribute("onclick", "document.getElementById(\'upload\').click()");

  let reload = createButton('Change Map').parent("a");
  reload.mousePressed(changeMap);
  reload.position(390, 10);
  reload.style('z-index', '1000');
  reload.class("btn btn-default");

  // Function to handle when a file is selected
  function handleFileSelect(evt) {
    // A FileList
    var files = evt.target.files;

    // Show some properties
    for (var i = 0, f; f = files[i]; i++) {
      // Read the file and process the result
      var reader = new FileReader();

      reader.readAsText(f);
      reader.onload = function(e) {
        process(e.target.result);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw(){

  /*
  if(mouseIsPressed) {
    if(mouseButton == CENTER) {
      //console.log("MOUSE");
      let x = mouseX;
      let y = mouseY;
      let posizione = myMap.pixelToLatLng(x, y);
      ellipse(x, y, 10,10);


    //let ptemp = new Point(tmp.lat, tmp.lng);
      let index = 0;
      let min_dist = Number.MAX_VALUE;

      for(let i = 0; i < pos.length; i++) {
        let tmp = myMap.latLngToPixel(pos[i].x, pos[i].y);
        let distanza = dist(tmp.x, tmp.y, x, y);

        if(distanza < min_dist){
          min_dist = distanza;
          index = i;
        }
        //console.log(distanza);
      }

      pos.splice(index, 0, new Point(posizione.lat, posizione.lng));

      drawPoint();
    }
  }*/

}

function changeMap() {
  let locStyle = localStorage.getItem("style");
  if(locStyle != null && locStyle.localeCompare(styles[0]) == 0) {
    localStorage.setItem("style", styles[1]);
  }
  else if(locStyle == null) {
    localStorage.setItem("style", "http://{s}.tile.osm.org/{z}/{x}/{y}.png")
  }
  else {
    localStorage.setItem("style", styles[0]);
  }
  //localStorage.setItem("style", "http://{s}.tile.osm.org/{z}/{x}/{y}.png");
  location.reload();
}

let edit = false;
function enable_edit() {
  edit = !edit;
}

function keyPressed() {
  console.log(key);
 if(key.toLowerCase() == "e") {
   edit = !edit;
 }

  if(key.toLowerCase() == "u") {
    exportXML();
  }


  if(key.toLowerCase() == "x") {
    let x = mouseX;
      let y = mouseY;
      let posizione = myMap.pixelToLatLng(x, y);
      ellipse(x, y, 10,10);


    //let ptemp = new Point(tmp.lat, tmp.lng);
      let index = 0;
      let min_dist = Number.MAX_VALUE;

      for(let i = 0; i < pos.length; i++) {
        let tmp = myMap.latLngToPixel(pos[i].x, pos[i].y);
        let distanza = dist(tmp.x, tmp.y, x, y);

        if(distanza < min_dist){
          min_dist = distanza;
          index = i;
        }
        //console.log(distanza);
      }

      pos.splice(index, 0, new Point(posizione.lat, posizione.lng));

      drawPoint();
  }
}

function mouseMoved(){

  if(edit) {
    let tmp = myMap.pixelToLatLng(mouseX, mouseY);
    let ptemp = new Point(tmp.lat, tmp.lng);

    pos.forEach(function (elem) {
      let tmp = myMap.latLngToPixel(elem.x, elem.y);
      let distanza = dist(tmp.x, tmp.y, mouseX, mouseY);

      if(distanza < 5) {
        //console.log(distanza);
        pos.splice(pos.indexOf(elem),1);
        drawPoint();
      }

    });
  }
}

function exportXML() {
  let strings = []
  let xmlHead = "<?xml version=\'1.0\' encoding=\'UTF-8\' standalone=\'yes\' ?>\r\n<gpx version=\"1.1\" xmlns=\"http:\/\/www.topografix.com\/GPX\/1\/1\" xmlns:geotracker=\"http:\/\/ilyabogdanovich.com\/gpx\/extensions\/geotracker\" xmlns:xsi=\"http:\/\/www.w3.org\/2001\/XMLSchema-instance\" xsi:schemaLocation=\"http:\/\/www.topografix.com\/GPX\/1\/1 http:\/\/www.topografix.com\/GPX\/1\/1\/gpx.xsd\" creator=\"Geo Tracker 3.3.0.1338 for Android by Ilya Bogdanovich\">\r\n  <metadata>\r\n    <name>9 Giu 2019 16:54:36<\/name>\r\n    <author>\r\n      <name>Registrato da Geo Tracker per Android di Ilya Bogdanovich<\/name>\r\n      <link href=\"https:\/\/play.google.com\/store\/apps\/details?id=com.ilyabogdanovich.geotracker\" \/>\r\n    <\/author>\r\n    <link href=\"https:\/\/play.google.com\/store\/apps\/details?id=com.ilyabogdanovich.geotracker\" \/>\r\n    <time>2019-06-09T14:54:36.646Z<\/time>\r\n  <\/metadata>\r\n  <trk>\r\n    <name>9 Giu 2019 16:54:36<\/name>\r\n    <src>Registrato da Geo Tracker per Android di Ilya Bogdanovich<\/src>\r\n    <link href=\"https:\/\/play.google.com\/store\/apps\/details?id=com.ilyabogdanovich.geotracker\" \/>\r\n    <extensions>\r\n      <geotracker:meta>\r\n        <length>23564.57<\/length>\r\n        <duration>10444275<\/duration>\r\n        <creationtime>2019-06-09T14:54:36.646Z<\/creationtime>\r\n        <activity>0<\/activity>\r\n      <\/geotracker:meta>\r\n    <\/extensions><trkseg>";

  strings.push(xmlHead);
  pos.forEach(function (elem) {
    let tmpStr = "<trkpt lat=\"" + elem.x + "\" lon=\"" + elem.y + "\"><\/trkpt>";

    strings.push(tmpStr);
  });

  strings.push("<\/trkseg><\/trk><\/gpx>");

  saveStrings(strings, 'mappa', 'gpx');
}

function drawPoint(){
  clear();

  fill(0,0,255);
  stroke(0);
  strokeWeight(1);
  for(let i = 0; i < pos.length; i++) {
    let tmp = myMap.latLngToPixel(pos[i].x, pos[i].y);

    ellipse(tmp.x, tmp.y, 10, 10);
  }

  for(let i = 1; i < pos.length; i++){
    let end = myMap.latLngToPixel(pos[i].x, pos[i].y);
    let start = myMap.latLngToPixel(pos[i-1].x, pos[i-1].y);

    //fill(255,0,0);
    stroke(color(255,0,0));
    strokeWeight(4);
    line(start.x, start.y, end.x, end.y);
  }
}
