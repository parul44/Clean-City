// mapbox script
mapboxgl.accessToken = 'pk.eyJ1IjoiZXJyYWh1bDkzIiwiYSI6ImNqdW8wemlxODJwNzUzeXFqbnVibHZzYzUifQ.bZKWernpF2H1uvOVNp4DOA'
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [77.146721, 28.6448],
  zoom: 11
})

map.on('load', function() {
  //ADDING LAYER SOURCES
  map.addSource('Sample', {
    type: 'geojson',
    data: 'sampleJson.geojson'
  })

  map.addSource('Road', {
    type: 'geojson',
    data: '/report/geojson/road?user=public'
  })

  map.addSource('Garbage', {
    type: 'geojson',
    data: '/report/geojson/garbage?user=public'
  })

  map.addSource('Water', {
    type: 'geojson',
    data: '/report/geojson/water?user=public'
  })

  map.addSource('Electricity', {
    type: 'geojson',
    data: '/report/geojson/electricity?user=public'
  })

  map.addSource('Crime', {
    type: 'geojson',
    data: '/report/geojson/crime?user=public'
  })

  //ADDING  HEATMAP LAYERS
  const heatPaint = {
    // increase weight as diameter breast height increases
    'heatmap-weight': {
      property: 'dbh',
      type: 'exponential',
      stops: [[1, 0], [62, 1]]
    },
    // increase intensity as zoom level increases
    'heatmap-intensity': {
      stops: [[11, 1], [15, 3]]
    },
    // assign color values be applied to points depending on their density
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(33,102,172,0)',
      0.2,
      'rgb(103,169,207)',
      0.4,
      'rgb(209,229,240)',
      0.6,
      'rgb(253,219,199)',
      0.8,
      'rgb(239,138,98)',
      1,
      'rgb(178,24,43)'
    ],
    // increase radius as zoom increases
    'heatmap-radius': {
      stops: [[11, 15], [15, 20]]
    },
    // decrease opacity to transition into the circle layer
    'heatmap-opacity': {
      default: 1,
      stops: [[14, 1], [15, 0]]
    }
  }

  map.addLayer(
    {
      id: 'Sample-heat',
      type: 'heatmap',
      source: 'Sample',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Road-heat',
      type: 'heatmap',
      source: 'Road',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Garbage-heat',
      type: 'heatmap',
      source: 'Garbage',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Water-heat',
      type: 'heatmap',
      source: 'Water',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Electricity-heat',
      type: 'heatmap',
      source: 'Electricity',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Crime-heat',
      type: 'heatmap',
      source: 'Crime',
      maxzoom: 15,
      paint: heatPaint
    },
    'waterway-label'
  )

  //ADDING  POINTS LAYERS
  const circlePaint = {
    // increase the radius of the circle as the zoom level and dbh value increases
    'circle-radius': {
      property: 'dbh',
      type: 'exponential',
      stops: [[{ zoom: 15, value: 1 }, 5], [{ zoom: 15, value: 62 }, 10], [{ zoom: 22, value: 1 }, 20], [{ zoom: 22, value: 62 }, 50]]
    },
    'circle-color': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [0, 'rgba(236,222,239,0)'],
        [10, 'rgb(236,222,239)'],
        [20, 'rgb(208,209,230)'],
        [30, 'rgb(166,189,219)'],
        [40, 'rgb(103,169,207)'],
        [50, 'rgb(28,144,153)'],
        [60, 'rgb(1,108,89)']
      ]
    },
    'circle-stroke-color': 'white',
    'circle-stroke-width': 3,
    'circle-opacity': {
      stops: [[14, 0], [15, 1]]
    }
  }

  map.addLayer(
    {
      id: 'Sample-point',
      type: 'circle',
      source: 'Sample',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Road-point',
      type: 'circle',
      source: 'Road',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Garbage-point',
      type: 'circle',
      source: 'Garbage',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Water-point',
      type: 'circle',
      source: 'Water',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Electricity-point',
      type: 'circle',
      source: 'Electricity',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  map.addLayer(
    {
      id: 'Crime-point',
      type: 'circle',
      source: 'Crime',
      minzoom: 14,
      paint: circlePaint
    },
    'waterway-label'
  )

  //Events On point layers(PopUp text/Pointer Icon change)
  var pointLayerIds = ['Sample-point', 'Garbage-point', 'Road-point', 'Water-point', 'Electricity-point', 'Crime-point']

  pointLayerIds.forEach(function(layer) {
    // Popup on click
    map.on('click', `${layer}`, function(e) {
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(
          '<b>' +
            `${layer}` +
            '</b><br>' +
            e.features[0].properties.brief.slice(0, 33) +
            '<br>' +
            e.features[0].properties.brief.slice(33, 66) +
            '<br>' +
            e.features[0].properties.brief.slice(66, 100)
        )
        .addTo(map)
    })

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', `${layer}`, function() {
      map.getCanvas().style.cursor = 'pointer'
    })

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', `${layer}`, function() {
      map.getCanvas().style.cursor = ''
    })
  })
})

//LAYER TOGGLE MENU
var toggleableLayerIds = [
  ['Sample-heat', 'Sample-point'],
  ['Garbage-heat', 'Garbage-point'],
  ['Road-heat', 'Road-point'],
  ['Water-heat', 'Water-point'],
  ['Electricity-heat', 'Electricity-point'],
  ['Crime-heat', 'Crime-point']
]

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var link = document.createElement('a')
  link.href = '#'
  link.className = 'active'
  link.textContent = toggleableLayerIds[i][0]
  link.layers = toggleableLayerIds[i]

  link.onclick = function(e) {
    this.layers.forEach(layer => {
      var clickedLayer = layer
      e.preventDefault()
      e.stopPropagation()

      var visibility = map.getLayoutProperty(clickedLayer, 'visibility')

      if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayer, 'visibility', 'none')
        this.className = ''
      } else {
        this.className = 'active'
        map.setLayoutProperty(clickedLayer, 'visibility', 'visible')
      }
    })
  }

  var layers = document.getElementById('menu')
  layers.appendChild(link)
}

//fetching latest6 reports

fetch('/report/reports?user=public&status=seen&limit=6&sortBy=createdAt:desc')
  .then(res => {
    res.json().then(data => {
      latest6 = document.getElementsByClassName('latest')
      text1 = document.getElementsByClassName('text1')
      text2 = document.getElementsByClassName('text2')
      length = data.length
      for (i = 0; i < length; i++) {
        latest6[i].src = `${data[i].imageUrl}`
        text1[i].innerHTML = `${data[i].results.locality} , ${data[i].results.district}`
        date = new Date(data[i].createdAt)
        text2[i].innerHTML = `${date.toLocaleString()}`
      }
    })
  })
  .catch(console.log())
