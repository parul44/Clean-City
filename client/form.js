//Form Autofill (if a user is logged in)
var user
var $username = document.getElementById('username')
var $name = document.getElementById('name')
// var $contactNumber = document.getElementById('contactNumber');
fetch('/user/info')
  .then(res => res.json())
  .then(data => {
    user = data
    if (!user.owner) {
      $username.value = user.username
      $name.value = user.name
      $name.readOnly = true
      // $contactNumber.value = user.contactNumber;
      // $contactNumber.readOnly = true;
    }
  })
  .catch(e => console.log)

//MAPBOX script
mapboxgl.accessToken = 'pk.eyJ1IjoiZXJyYWh1bDkzIiwiYSI6ImNqdW8wemlxODJwNzUzeXFqbnVibHZzYzUifQ.bZKWernpF2H1uvOVNp4DOA'
var coordinates = document.getElementById('coordinates')
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [77.146721, 28.6448],
  zoom: 11
})

//Creating Draggable Marker
var marker = new mapboxgl.Marker({
  draggable: true
})
  .setLngLat([77.146721, 28.6448])
  .addTo(map)

//setPosition Function (callback for Geolocation API)
function setPosition(position) {
  accuracy = position.coords.accuracy
  if (position.coords.accuracy > 100) {
    alert(`Accuracy>100m . Please drag marker to exact location.`)
  }
  long = position.coords.longitude
  lat = position.coords.latitude
  marker.setLngLat([long, lat]).addTo(map)
  onDragEnd()

  //Fly animation
  map.flyTo({
    center: [long, lat],
    zoom: 15
  })
}

//Geolocation API check
document.getElementById('fly').addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      setPosition,
      function() {
        alert(' Allow location acess and try again.')
      },
      { maximumAge: 0, timeout: 9000, enableHighAccuracy: true }
    )
  } else {
    alert('Geolocation is not supported by this browser')
  }
})

//Set Coordinates on drag
function onDragEnd() {
  var lngLat = marker.getLngLat()
  coordinates.style.display = 'block'
  coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat
  //feeding location to form
  document.getElementById('longitude').value = lngLat.lng
  document.getElementById('latitude').value = lngLat.lat
}

marker.on('dragend', onDragEnd)

//Script for File size validation
var $uploadField = document.getElementById('image')

$uploadField.onchange = function() {
  var ext = this.value.match(/\.([^\.]+)$/)[1].toLowerCase()
  if (this.files[0].size > 6 * 1024 * 1024 || !(ext == 'png' || ext == 'jpg' || ext == 'jpeg')) {
    alert('Please Choose an Image(PNG/JPG/JPEG) of size less than 6 MB ')
    this.value = ''
  }
}
