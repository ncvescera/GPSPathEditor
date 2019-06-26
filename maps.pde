import de.fhpotsdam.unfolding.*;
import de.fhpotsdam.unfolding.geo.*;
import de.fhpotsdam.unfolding.utils.*;  
import de.fhpotsdam.unfolding.providers.*;
import de.fhpotsdam.unfolding.marker.*;
import controlP5.*;
import java.util.*;

class Pos {
  float lat;
  float lon;

  Pos(float lat, float lon) {
    this.lat = lat;
    this.lon = lon;
  }
}

class XMLParser {
  private String path;
  private ArrayList<Pos> values;

  XMLParser(String path) {
    this.path = path;
    this.values = new ArrayList<Pos>();

    XML xml = loadXML(path);
    XML[] child = xml.getChildren("trk");

    XML[] cchild = child[0].getChildren("trkseg");

    for (int i = 0; i < cchild.length; i++) {
      XML[] lastChild = cchild[i].getChildren("trkpt");

      for (int j = 0; j < lastChild.length; j++) {
        Pos pos = new Pos(lastChild[j].getFloat("lat"), lastChild[j].getFloat("lon") );
        values.add(pos);
      }
    }
  }

  Pos[] parse() {
    return this.values.toArray(new Pos[this.values.size()]);
  }
}

UnfoldingMap map;
List<Location> locations;
ControlP5 gui;
MarkerManager manager;

void setup() {
  size(900, 800);
  gui = new ControlP5(this);

  gui.addTextfield("input")
    .setPosition(10, 10)
      .setSize(200, 20)
        ;

  gui.addButton("Inport")
    .setValue(0)
      .setPosition(220, 10)
        .setSize(40, 20)
          .activateBy(ControlP5.RELEASE)
            ;



  map = new UnfoldingMap(this, new Microsoft.AerialProvider());
  //map = new UnfoldingMap(this);
  //map = new UnfoldingMap(this, new OpenStreetMapProvider());
  MapUtils.createDefaultEventDispatcher(this, map);
  manager = map.getDefaultMarkerManager();
  //List<Marker> list = new ArrayList<Marker>();
}

void draw() {
  map.draw();
}

public void Inport(int value) {
  String t = gui.get(Textfield.class, "input").getText();

  if (!t.equals("")) {
    locations = new ArrayList<Location>();

    List<Marker> tmp = map.getMarkers();

    if (tmp.size() > 0) {
      manager.clearMarkers();
    }

    XMLParser xml = new XMLParser(t);
    Pos[] elems = xml.parse();

    for (int i = 0; i < elems.length; i++) {
      locations.add(new Location(elems[i].lat, elems[i].lon));
      //SimpleLinesMarker m = new SimpleLinesMarker(new Location(elems[i].lat, elems[i].lon).getLocations());
    }


    SimpleLinesMarker m = new SimpleLinesMarker(locations);
    m.setColor(color(233, 57, 35));
    m.setStrokeWeight(5);

    map.addMarkers(m);

    for (Location location : locations) {
      SimplePointMarker mark = new SimplePointMarker(location);

      mark.setColor(color(0, 0, 255)); 
      mark.setStrokeWeight(1);
      map.addMarker(mark);
    }

    map.zoomAndPanTo(locations.get(0), 12);
  }
}

public void mousePressed(){
  if(mouseButton == RIGHT){
    SimplePointMarker tmp = new SimplePointMarker(map.getLocation(mouseX, mouseY));
    Marker near = manager.getNearestMarker(mouseX, mouseY);
    
    tmp.setColor(color(0,255,0));
    
    map.addMarker(tmp);
    locations.add(locations.indexOf(near.getLocation())+1, tmp.getLocation());
  }
}

boolean edit = false;
public void mouseMoved() {
  if (edit) {
    //manager = map.getDefaultMarkerManager();
    Marker hitMarker = map.getFirstHitMarker(mouseX, mouseY);
    if (hitMarker != null) {
      // Select current marker 
      hitMarker.setSelected(true);
      manager.removeMarker(hitMarker);
      locations.remove(hitMarker.getLocation());
      hitMarker = null;
    } else {
      // Deselect all other markers
      for (Marker marker : map.getMarkers ()) {
        marker.setSelected(false);
      }
    }
  }
}

public void keyPressed() {
  if (key == TAB) {
    edit = !edit;
  }
  if (key == CODED) {
    if (keyCode == CONTROL) {
      //if (key == 'r') {
      SimpleLinesMarker m = new SimpleLinesMarker(locations);
      m.setColor(color(233, 57, 35));
      m.setStrokeWeight(5);
      m.setSelected(false);
      map.addMarkers(m);
    } else if (keyCode == ALT) {
      PrintWriter output = createWriter("mappa.gpx"); 
      output.println("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>\r\n<gpx version=\"1.1\" xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:geotracker=\"http://ilyabogdanovich.com/gpx/extensions/geotracker\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" creator=\"Geo Tracker 3.3.0.1338 for Android by Ilya Bogdanovich\">\r\n  <metadata>\r\n    <name>9 Giu 2019 16:54:36</name>\r\n    <author>\r\n      <name>Registrato da Geo Tracker per Android di Ilya Bogdanovich</name>\r\n      <link href=\"https://play.google.com/store/apps/details?id=com.ilyabogdanovich.geotracker\" />\r\n    </author>\r\n    <link href=\"https://play.google.com/store/apps/details?id=com.ilyabogdanovich.geotracker\" />\r\n    <time>2019-06-09T14:54:36.646Z</time>\r\n  </metadata>");
      output.println("<trk>");
      output.println("<name>9 Giu 2019 16:54:36</name>\r\n    <src>Registrato da Geo Tracker per Android di Ilya Bogdanovich</src>\r\n    <link href=\"https://play.google.com/store/apps/details?id=com.ilyabogdanovich.geotracker\" />\r\n    <extensions>\r\n      <geotracker:meta>\r\n        <length>23564.57</length>\r\n        <duration>10444275</duration>\r\n        <creationtime>2019-06-09T14:54:36.646Z</creationtime>\r\n        <activity>0</activity>\r\n      </geotracker:meta>\r\n    </extensions>");
      output.println("<trkseg>");

      for (Location location : locations) {
        output.println("<trkpt lat=\"" + location.getLat() + "\" lon=\"" + location.getLon() + "\"></trkpt>");
      }
      output.println("</trkseg>");
      output.println("</trk>");
      output.println("</gpx>");

      output.flush(); // Writes the remaining data to the file
      output.close(); // Finishes the file
      //exit(); // Stops the program
    }
  }
}

