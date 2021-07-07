
// No. of Reports (quick Glance)
       unseenText = document.getElementById('unseenText')
        seenText = document.getElementById('seenText')
        closedText = document.getElementById('closedText')
        fetch("/report/count/?status=unseen").then(res => res.json()).then(data => {unseenText.textContent=data.count;})
        fetch("/report/count/?status=seen").then(res => res.json()).then(data => {seenText.textContent=data.count;})
        fetch("/report/count/?status=closed").then(res => res.json()).then(data => {closedText.textContent=data.count;})

        //navbar notif(priority)
        function priority1Notif(message){
            let d1 = document.createElement('div')
                d1.className = "card notif critical border-0";
                let d2 = document.createElement('div')
                d2.className = "card-body"
                let im = document.createElement("img")
                im.setAttribute("src","../assets/img/alert.png")
               let d3  = document.createElement("span")
               d3.setAttribute("style","font-size:10px")
                d3.innerText = message
                d2.appendChild(im)
                d2.appendChild(d3)
               
                d1.appendChild(d2)
                let d = document.getElementById("drpdwn")
                // d.appendChild(d1)
                d.insertBefore(d1, d.firstChild);

                let bell = document.getElementById("bell");
                bell.className = "fas fa-bell color";
                bell.addEventListener("click",function (){
                    let d = document.getElementById("bell");
                    d.classList.remove("color");
                });
        }
          
        function priority2Notif(message){
            let d1 = document.createElement('div')
            d1.className = "card notif medium border-0";
            let d2 = document.createElement('div')
            d2.className = "card-body"
            d2.setAttribute("style","font-size:10px")
            d2.innerText = message;
            d1.appendChild(d2)
            let d = document.getElementById("drpdwn")
            // d.appendChild(d1)
            d.insertBefore(d1, d.firstChild);

            let bell = document.getElementById("bell");
                bell.className = "fas fa-bell color";
                bell.addEventListener("click",function (){
                    let d = document.getElementById("bell");
                    d.classList.remove("color");
                });
        }

        function priority3Notif(message){
            let d1 = document.createElement('div')
            d1.className = "card notif light border-0";
            let d2 = document.createElement('div')
            d2.className = "card-body"
            d2.setAttribute("style","font-size:10px")
            d2.innerText = message;
            d1.appendChild(d2)
            let d = document.getElementById("drpdwn")
            // d.appendChild(d1)
            d.insertBefore(d1, d.firstChild);

            let bell = document.getElementById("bell");
                bell.className = "fas fa-bell color";
                bell.addEventListener("click",function (){
                    let d = document.getElementById("bell");
                    d.classList.remove("color");
                });
        }

          fetch("/report/priorityCount/?status=unseen").then(res => res.json()).then(data => {
          data.forEach((element)=>{
            if(element.count>20){
              priority1Notif(`More than 20 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
            }
            else if(element.count>15){
              priority2Notif(`More than 15 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
            }
            else if(element.count>10){
              priority2Notif(`More than 10 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
            }
          })
        })


//Script for Mapbox/Socket Notifications
let user={owner: '-' , username: '-'};
      fetch("/admin/info").then(res => res.json()).then(data => {
        
        user=data;
        document.getElementById('user').textContent=` ${user.owner} : ${user.username}`
        
        mapboxgl.accessToken = 'pk.eyJ1IjoiZXJyYWh1bDkzIiwiYSI6ImNqdW8wemlxODJwNzUzeXFqbnVibHZzYzUifQ.bZKWernpF2H1uvOVNp4DOA';
        var map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [77.146721,28.610800],
          zoom: 10
        });
            map.on('load', function() {
      
              //ADDING LAYER SOURCES

              switch (true) {
                case user.owner=='PWD':
                  map.addSource('Road', {
                    type: 'geojson',
                    data: '/report/geojson/road'
                  });
                  break;
                case user.owner=='DJB':
                  map.addSource('Water', {
                    type: 'geojson',
                    data: '/report/geojson/water'
                  });
                  break;
                case user.owner=='EDMC'||user.owner=='NDMC'||user.owner=='SDMC'||user.owner=='NewDMC':
                  map.addSource('Garbage', {
                    type: 'geojson',
                    data: '/report/geojson/garbage'
                  });

                  map.addSource('Road', {
                    type: 'geojson',
                    data: '/report/geojson/road'
                  });
                  
                  map.addSource('Water', {
                    type: 'geojson',
                    data: '/report/geojson/water'
                  });

                  map.addSource('Electricity', {
                    type: 'geojson',
                    data: '/report/geojson/electricity'
                  });
          
                  map.addSource('Crime', {
                    type: 'geojson',
                    data: '/report/geojson/crime'
                  });
                  break;
              }
              
              
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
          
              switch (true) {
                case user.owner=='PWD':
                  map.addLayer({
                  id: 'Road-heat',
                  type: 'heatmap',
                  source: 'Road',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
                  break;

                case user.owner=='DJB':
                  map.addLayer({
                  id: 'Water-heat',
                  type: 'heatmap',
                  source: 'Water',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
                  break;

                case user.owner=='EDMC'||user.owner=='NDMC'||user.owner=='SDMC'||user.owner=='NewDMC':
                  map.addLayer({
                  id: 'Garbage-heat',
                  type: 'heatmap',
                  source: 'Garbage',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');

                  map.addLayer({
                  id: 'Road-heat',
                  type: 'heatmap',
                  source: 'Road',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
                  
                  map.addLayer({
                  id: 'Water-heat',
                  type: 'heatmap',
                  source: 'Water',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
                  
                  map.addLayer({
                  id: 'Electricity-heat',
                  type: 'heatmap',
                  source: 'Electricity',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
          
                  map.addLayer({
                  id: 'Crime-heat',
                  type: 'heatmap',
                  source: 'Crime',
                  maxzoom: 15,
                  paint: heatPaint
                  }, 'waterway-label');
                  break;
              }


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

              switch (true) {
                case user.owner=='PWD':
                  map.addLayer({
                  id: 'Road-point',
                  type: 'circle',
                  source: 'Road',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
                  break;

                case user.owner=='DJB':
                  map.addLayer({
                  id: 'Water-point',
                  type: 'circle',
                  source: 'Water',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
                  break;

                case user.owner=='EDMC'||user.owner=='NDMC'||user.owner=='SDMC'||user.owner=='NewDMC':
                  map.addLayer({
                  id: 'Garbage-point',
                  type: 'circle',
                  source: 'Garbage',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
              
                  map.addLayer({
                  id: 'Road-point',
                  type: 'circle',
                  source: 'Road',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
                  
                  map.addLayer({
                  id: 'Water-point',
                  type: 'circle',
                  source: 'Water',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
                  
                  map.addLayer({
                  id: 'Electricity-point',
                  type: 'circle',
                  source: 'Electricity',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
              
                  map.addLayer({
                  id: 'Crime-point',
                  type: 'circle',
                  source: 'Crime',
                  minzoom: 14,
                  paint: circlePaint
                  }, 'waterway-label');
                  break;
              }
              
        
              //On clicking point layers
              var pointLayerIds=[];
              switch (true) {
                case user.owner=='PWD':
                pointLayerIds = ['Road-point'];
                  break;
                case user.owner=='DJB':
                  pointLayerIds = [ 'Water-point'];
                  break;
                case user.owner=='EDMC'||user.owner=='NDMC'||user.owner=='SDMC'||user.owner=='NewDMC':
                  pointLayerIds = ['Garbage-point', 'Road-point', 'Water-point', 'Electricity-point', 'Crime-point' ];
                  break;
              }
              
              pointLayerIds.forEach(function(layer) {
                // Popup on click
                map.on('click', `${layer}`, function(e) {
                  new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML('<b>'+`${layer}`+'</b><br>'+ e.features[0].properties.brief.slice(0,33) + '<br>'
                    + e.features[0].properties.brief.slice(33,66) + '<br>'
                    + e.features[0].properties.brief.slice(66,100))
                    .addTo(map);
                });
      
                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', `${layer}` , function () {
                  map.getCanvas().style.cursor = 'pointer';
                });
                
                // Change it back to a pointer when it leaves.
                map.on('mouseleave',  `${layer}` , function () {
                  map.getCanvas().style.cursor = '';
                });
              });
      
          }); 
      
          //LAYER TOGGLE MENU
          var toggleableLayerIds=[];
          switch (true) {
            case user.owner=='PWD':
              toggleableLayerIds = [ ['Road-heat', 'Road-point'] ];
              break;
            case user.owner=='DJB':
              toggleableLayerIds = [ ['Water-heat', 'Water-point'] ];
              break;
            case user.owner=='EDMC'||user.owner=='NDMC'||user.owner=='SDMC'||user.owner=='NewDMC':
              toggleableLayerIds = [ ['Garbage-heat', 'Garbage-point'], ['Road-heat', 'Road-point'], ['Water-heat', 'Water-point'], ['Electricity-heat', 'Electricity-point'], ['Crime-heat', 'Crime-point'] ];
          }

          for (var i = 0; i < toggleableLayerIds.length; i++) {
            var link = document.createElement('a');
            link.href = '#';
            link.className = 'active';
            link.textContent = toggleableLayerIds[i][0];
            link.layers= toggleableLayerIds[i];
              
            link.onclick = function (e) {
              this.layers.forEach((layer) => {
                var clickedLayer = layer;
                e.preventDefault();
                e.stopPropagation();
                  
                var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
                  
                if (visibility === 'visible') {
                  map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                  this.className = '';
                } else {
                  this.className = 'active';
                  map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                }
              });
            };
              
            var layers = document.getElementById('menu');
            layers.appendChild(link);
          }
          
          //Notification/Socket
          const socket = io();
          
          function notifyMe(message) {
            // Let's check if the browser supports notifications
            if (!('Notification' in window)) {
              alert('This browser does not support desktop notification');
            }

            // Let's check if the user is okay to get some notification
            else if (Notification.permission === 'granted') {
              // If it's okay let's create a notification
              var notification = new Notification(message);
            }

            // Otherwise, we need to ask the user for permission
            // Note, Chrome does not implement the permission static property
            // So we have to check for NOT 'denied' instead of 'default'
            else if (Notification.permission !== 'denied') {
              Notification.requestPermission(function(permission) {
                // Whatever the user answers, we make sure we store the information
                if (!('permission' in Notification)) {
                  Notification.permission = permission;
                }

                // If the user is okay, let's create a notification
                if (permission === 'granted') {
                  var notification = new Notification(message);
                }
              });
            }
          }

          switch(user.owner){
            case 'PWD':
            socket.on('reportAddedPWD', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportPWD', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportPWD', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportPWD', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;

            case 'DJB':
            socket.on('reportAddedDJB', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportDJB', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportDJB', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportDJB', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;

            case 'EDMC':
              socket.on('reportAddedEDMC', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportEDMC', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportEDMC', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportEDMC', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;

            case 'NDMC':
            socket.on('reportAddedNDMC', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportNDMC', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportNDMC', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportNDMC', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;

            case 'SDMC':
            socket.on('reportAddedSDMC', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportSDMC', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportSDMC', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportSDMC', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;

            case 'NewDMC':
            socket.on('reportAddedEDMC', (reportData) => {
                notifyMe(`New Report`);
                nowuiDashboard.showNotification('bottom','center', `New Report ID: ${reportData._id}`);
               });
              socket.on('priority1ReportNewDMC', (reportData) => {
                notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','centre', `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority2ReportNewDMC', (reportData) => {
                notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              socket.on('priority3ReportNewDMC', (reportData) => {
                notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                nowuiDashboard.showNotification('top','center', `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
                priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`);
              });
              break;
          }

        })

//Script for line chart for years
          // set the dimensions and margins of the graph
          var margin = {top: 10, right: 30, bottom: 30, left: 60},
              width = 460 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;
          
          // append the svg object to the body of the page
          var svg = d3.select("#week")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
          
          //Read the data
          d3.json("/report/graph/?graphType=weekly").then(function(data) {
              // List of groups (here I have one group per column)s
              var allGroup = d3.map(data, function(d){return(d.reportType)}).keys()
          
              // add the options to the button
              d3.select("#selectButton1")
                .selectAll('myOptions')
                   .data(allGroup)
                .enter()
                  .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; }) // corresponding value returned by the button
          
              // A color scale: one color for each group
              var myColor = d3.scaleOrdinal()
                .domain(allGroup)
                .range(d3.schemeSet2);
          
              // Add X axis --> it is a date format
              var x = d3.scaleLinear()
                .domain(d3.extent(data, function(d) { return d.week; }))
                .range([ 0, width ]);
              svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(7))
    
                svg.append("text")             
                    .attr("transform",
                          "translate(" + (width/2) + " ," + 
                               (height + margin.top + 20) + ")")
                    .style("text-anchor", "middle")
                    .text("Weeks");  
          
              // Add Y axis
              var y = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return +d.n; })])
                .range([ height, 0 ]);
              svg.append("g")
                .call(d3.axisLeft(y))
              
                svg.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - margin.left)
                  .attr("x",0 - (height / 2))
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text("Number Of Reports");        
    
              // Initialize line with first group of the list
              var line = svg
                .append('g')
                .append("path")
                  .datum(data.filter(function(d){return d.reportType==allGroup[0]}))
                  .attr("d", d3.line()
                    .x(function(d) { return x(d.week) })
                    .y(function(d) { return y(+d.n) })
                  )
                  .attr("stroke", function(d){ return myColor("valueA") })
                  .style("stroke-width", 4)
                  .style("fill", "none")
          
              // A function that update the chart
              function update(selectedGroup) {
          
                // Create new data with the selection?
                var dataFilter = data.filter(function(d){return d.reportType==selectedGroup})
          
                // Give these new data to update line
                line
                    .datum(dataFilter)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                      .x(function(d) { return x(d.week) })
                      .y(function(d) { return y(+d.n) })
                    )
                    .attr("stroke", function(d){ return myColor(selectedGroup) })
              }
          
              // When the button is changed, run the updateChart function
              d3.select("#selectButton1").on("change", function(d) {
                  // recover the option that has been chosen
                  var selectedOption = d3.select(this).property("value")
                  // run the updateChart function with this selected option
                  update(selectedOption)
              })
          
          })
            
    
//Script for line chart for months
          var margin = {top: 10, right: 30, bottom: 30, left: 60},
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
      
      // append the svg object to the body of the page
      var svg2 = d3.select("#month")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
      //Read the data
      d3.json("/report/graph/?graphType=monthly").then(function(data) {
          // List of groups (here I have one group per column)
          var allGroup = d3.map(data, function(d){return(d.reportType)}).keys()
      
          // add the options to the button
          d3.select("#selectButton2")
            .selectAll('myOptions')
               .data(allGroup)
            .enter()
              .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }) // corresponding value returned by the button
      
          // A color scale: one color for each group
          var myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeSet2);
          // Add X axis --> it is a date format
          var x = d3.scaleLinear()
            .domain([d3.min(data, function(d) { return Number(d.month); }),d3.max(data, function(d) { return Number(d.month); })])
            .range([ 0, width ]);
          svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10));
      
            svg2.append("text")             
                    .attr("transform",
                          "translate(" + (width/2) + " ," + 
                               (height + margin.top + 20) + ")")
                    .style("text-anchor", "middle")
                    .text("Months");
    
          // Add Y axis
          var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.n; })])
            .range([ height, 0 ]);
          svg2.append("g")
            .call(d3.axisLeft(y));
      
            svg2.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - margin.left)
                  .attr("x",0 - (height / 2))
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text("Number Of Reports"); 
    
          // Initialize line with first group of the list
          var line = svg2
            .append('g')
            .append("path")
              .datum(data.filter(function(d){return d.reportType==allGroup[0]}))
              .attr("d", d3.line()
                .x(function(d) { return x(Number(d.month)) })
                .y(function(d) { return y(+d.n) })
              )
              .attr("stroke", function(d){ return myColor("valueA") })
              .style("stroke-width", 4)
              .style("fill", "none")
      
          // A function that update the chart
          function update(selectedGroup) {
      
            // Create new data with the selection?
            var dataFilter = data.filter(function(d){return d.reportType==selectedGroup})
      
            // Give these new data to update line
            line
                .datum(dataFilter)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                  .x(function(d) { return x(Number(d.month)) })
                  .y(function(d) { return y(+d.n) })
                )
                .attr("stroke", function(d){ return myColor(selectedGroup) })
          }
      
          // When the button is changed, run the updateChart function
          d3.select("#selectButton2").on("change", function(d) {
              // recover the option that has been chosen
              var selectedOption = d3.select(this).property("value")
              // run the updateChart function with this selected option
              update(selectedOption)
          })
      
      })