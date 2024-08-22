
var map = {}
    document.getElementById('myfile').addEventListener('change', handleFile);
    var geojson = ""
    var feature =[]

function handleFile(event) {

    const file = event.target.files[0];
  
   if(validateFile(file) == false){
    event.target.value = ''
    return
   }      
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
       geojson = textToGeoJSON(text);
        feature = geojson.features[0].geometry.coordinates[0]

    //   feature.forEach(element => element.pop())  //remove z

    console.log('feature',feature)
    
      // You can also display the GeoJSON on the page or use it as needed
      document.getElementById('txt').innerHTML = new XmlBeautify().beautify(text, 
  {
      indent: "  ",  //indent pattern like white spaces
      useSelfClosingElement: true //true:use self-closing element when empty element.
  });
  
  document.getElementById("download").value = "Download (" +   geojson.features.length + ")"

  GetMap(feature)
  feature=[]
    };
    reader.readAsText(file);

	
console.log(file.name)
$('.highlight').highlightWithinTextarea({
    highlight: file.name
});

    //-------onload end -----------------------------------------

    console.log(file.name)
    $('.highlight').highlightWithinTextarea({
        highlight: 'OM1'
    });
  }

  function GetMap(poly)
    {
      if(!poly){
        poly = []
      }


      if(poly.length==0){
        //center the map in beni mellal on the first load
        x = 32.28119505924205
        y = -6.456126853142409
    
      }else{
        //move the map to one of the polygon point
        x=poly[0][1]
        y=poly[0][0]
        

      }

      console.log('x-y:',[x,y])
         map = new Microsoft.Maps.Map('#myMap',
         {
  credentials: 'Ap9MQf8SmemILwnUNnzDa5x0Q23AgQdAkoTTWRBMJ2oGIc2zDT7-kXvfOacM0YfX',
  center: new Microsoft.Maps.Location(x,y),
  mapTypeId: Microsoft.Maps.MapTypeId.aerial,
  zoom: 14
        })
      //Load the GeoJson Module.
      Microsoft.Maps.loadModule('Microsoft.Maps.GeoJson', function () {

          //Parse the GeoJson object into a Bing Maps shape.
          var shape = Microsoft.Maps.GeoJson.read(geojson, {
              polygonOptions: {
                  fillColor: 'rgba(255,0,0,0.5)',
                  strokeColor: 'black',
                  strokeThickness: 2,
                  cursor:'pointer'
              }
          });
             //Add the shape to the map.
          shape.forEach( function(element) {
              addPolygonWithLabel(element)
          } )         
      });
      Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath')
      }

function downloadKmlFiles(){
if(geojson.length == 0){
return
}   
geojson.features.forEach(element => {

  //delete the styleHash property fron the elementm since it will not work with tokml function
  delete element.properties.styleHash
  //convert to kml
  //wrap the elemet in a geojsoncolletion before passing it to tokml
              const geocollection = {
type: 'FeatureCollection',
features:[element]
};
   
    const kml = tokml(geocollection);
    
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = element.properties.name + '.kml';
    downloadLink.click()
      });
}

  function textToGeoJSON(text) {
    // Use the toGeoJSON library to convert text to GeoJSON
    const geojson = toGeoJSON.kml(new DOMParser().parseFromString(text, 'text/xml'));
    return geojson;
  }    

function CalculateArea(shape){
var area = 0
var perimeter = 0
var area = 0
 area = Microsoft.Maps.SpatialMath.Geometry.area(shape, Microsoft.Maps.SpatialMath.AreaUnits.SquareKilometers);
 perimeter = Microsoft.Maps.SpatialMath.Geometry.calculateLength(shape, Microsoft.Maps.SpatialMath.DistanceUnits.Meters);
          area = Math.round(area * 100) / 100;
          perimeter = Math.round(perimeter * 100) / 100;
return {area:area,perimeter:perimeter}


}
  function addPolygonWithLabel(polygon) {
         console.log(polygon)
      //Calculate the centroid of the polygon.
      var centroid = polygon.geometry.boundingBox.center

      //calculate area and distances
   var measures =     CalculateArea(polygon)
  //  console.log(measures)
    
      //Create a pushpin that has a transparent icon and a title property set to the label value.
      var labelPin = new Microsoft.Maps.Pushpin(centroid, {
        icon: '<svg xmlns="https://www.w3.org/2000/svg" width="0.5" height="0.5"></svg>',
          title: polygon.metadata.name,
          subTitle:  measures.area.toString() + " km2",            
      });


      //Create drone start point pushpin
       const location = new Microsoft.Maps.Location(polygon.geometry.rings[0].y[0],polygon.geometry.rings[0].x[0]);
          console.log('location',location)
          const startPoint = new Microsoft.Maps.Pushpin(location, {
              title: 'start',
             // text: 'st'
          }); 

      //Store a reference to the label pushpin in the polygon metadata.
      polygon.metadata = { label: labelPin, measures:measures };  
      console.log('polygones data',polygon.geometry.rings[0].x[0])
      
      //polygone click event and hover effects
      Microsoft.Maps.Events.addHandler(polygon, 'click', function (e) {scrollToWord(labelPin.entity.title) });
      Microsoft.Maps.Events.addHandler(polygon, 'mouseover', function (e) {
        e.target.setOptions({ fillColor: 'rgba(200,200,2000,0.5)' });
      });
      Microsoft.Maps.Events.addHandler(polygon, 'mouseout', function (e) {
          e.target.setOptions({ fillColor: 'rgba(255,0,0,0.5)' });
      });

 
      //Add the label pushpin to the map.
      map.entities.push(polygon);
      map.entities.push(labelPin);
      map.entities.push(startPoint);
  }

function scrollToWord(word) {
var textarea = document.getElementById('txt');
var text = textarea.value;
var innerHTML = textarea.innerHTML
var index = text.indexOf(word);


if (index !== -1) {
  // Calculate the number of lines before the word
  var linesBeforeWord = text.substr(0, index).split('\n').length - 1;
  // Calculate the height of each line (you might need to adjust this based on your styling)
  
  
  var lineHeight = textarea.scrollHeight / textarea.rows;

  // Scroll to the position
  textarea.scrollTop = (linesBeforeWord * lineHeight);
}
}
function validateFile(file){

if (!file || file.name.split('.').pop().toLowerCase() !== 'kml' ) {
  alertify.set('notifier','delay', 2); 
      alertify.error('File Format Error');
      
      return false;
    }
}

