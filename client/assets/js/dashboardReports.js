//set options/set user on sidebar
var user = { owner: '-', username: '-' }
fetch('/admin/info')
  .then(res => res.json())
  .then(data => {
    user = data
    document.getElementById('user').textContent = ` ${user.owner} : ${user.username}`
    var types = document.getElementById('inputState1')

    switch (true) {
      case user.owner == 'PWD':
        var road = document.createElement('option')
        road.setAttribute('value', 'road')
        road.textContent = 'Road'
        types.appendChild(road)
        break
      case user.owner == 'DJB':
        var water = document.createElement('option')
        water.setAttribute('value', 'water')
        water.textContent = 'Water'
        types.appendChild(water)
        break
      case user.owner == 'EDMC' || user.owner == 'NDMC' || user.owner == 'SDMC' || user.owner == 'NewDMC':
        var all = document.createElement('option')
        all.setAttribute('value', '')
        all.textContent = 'All'
        types.appendChild(all)
        var garbage = document.createElement('option')
        garbage.setAttribute('value', 'garbage')
        garbage.textContent = 'Garbage/Sewage'
        types.appendChild(garbage)
        var road = document.createElement('option')
        road.setAttribute('value', 'road')
        road.textContent = 'Road'
        types.appendChild(road)
        var water = document.createElement('option')
        water.setAttribute('value', 'water')
        water.textContent = 'Water'
        types.appendChild(water)
        var electricity = document.createElement('option')
        electricity.setAttribute('value', 'electricity')
        electricity.textContent = 'Electricity'
        types.appendChild(electricity)
        var crime = document.createElement('option')
        crime.setAttribute('value', 'crime')
        crime.textContent = 'Crime'
        types.appendChild(crime)
        break
    }

    //navbar notif(priority)
    function priority1Notif(message) {
      let d1 = document.createElement('div')
      d1.className = 'card notif critical border-0'
      let d2 = document.createElement('div')
      d2.className = 'card-body'
      let im = document.createElement('img')
      im.setAttribute('src', '../assets/img/alert.png')
      let d3 = document.createElement('span')
      d3.setAttribute('style', 'font-size:10px')
      d3.innerText = message
      d2.appendChild(im)
      d2.appendChild(d3)

      d1.appendChild(d2)
      let d = document.getElementById('drpdwn')
      // d.appendChild(d1)
      d.insertBefore(d1, d.firstChild)

      let bell = document.getElementById('bell')
      bell.className = 'fas fa-bell color'
      bell.addEventListener('click', function() {
        let d = document.getElementById('bell')
        d.classList.remove('color')
      })
    }

    function priority2Notif(message) {
      let d1 = document.createElement('div')
      d1.className = 'card notif medium border-0'
      let d2 = document.createElement('div')
      d2.className = 'card-body'
      d2.setAttribute('style', 'font-size:10px')
      d2.innerText = message
      d1.appendChild(d2)
      let d = document.getElementById('drpdwn')
      // d.appendChild(d1)
      d.insertBefore(d1, d.firstChild)

      let bell = document.getElementById('bell')
      bell.className = 'fas fa-bell color'
      bell.addEventListener('click', function() {
        let d = document.getElementById('bell')
        d.classList.remove('color')
      })
    }

    function priority3Notif(message) {
      let d1 = document.createElement('div')
      d1.className = 'card notif light border-0'
      let d2 = document.createElement('div')
      d2.className = 'card-body'
      d2.setAttribute('style', 'font-size:10px')
      d2.innerText = message
      d1.appendChild(d2)
      let d = document.getElementById('drpdwn')
      // d.appendChild(d1)
      d.insertBefore(d1, d.firstChild)

      let bell = document.getElementById('bell')
      bell.className = 'fas fa-bell color'
      bell.addEventListener('click', function() {
        let d = document.getElementById('bell')
        d.classList.remove('color')
      })
    }

    fetch('/report/priorityCount/?status=unseen')
      .then(res => res.json())
      .then(data => {
        data.forEach(element => {
          if (element.count > 20) {
            priority1Notif(`More than 20 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
          } else if (element.count > 15) {
            priority2Notif(`More than 15 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
          } else if (element.count > 10) {
            priority2Notif(`More than 10 ${element._id.reportType} reports from Pincode: ${element._id.pincode} in last 24hrs`)
          }
        })
      })

    //Notification/Socket
    const socket = io()

    function notifyMe(message) {
      // Let's check if the browser supports notifications
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notification')
      }

      // Let's check if the user is okay to get some notification
      else if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        var notification = new Notification(message)
      }

      // Otherwise, we need to ask the user for permission
      // Note, Chrome does not implement the permission static property
      // So we have to check for NOT 'denied' instead of 'default'
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          // Whatever the user answers, we make sure we store the information
          if (!('permission' in Notification)) {
            Notification.permission = permission
          }

          // If the user is okay, let's create a notification
          if (permission === 'granted') {
            var notification = new Notification(message)
          }
        })
      }
    }

    switch (user.owner) {
      case 'PWD':
        socket.on('reportAddedPWD', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportPWD', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportPWD', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportPWD', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break

      case 'DJB':
        socket.on('reportAddedDJB', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportDJB', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportDJB', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportDJB', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break

      case 'EDMC':
        socket.on('reportAddedEDMC', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportEDMC', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportEDMC', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportEDMC', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break

      case 'NDMC':
        socket.on('reportAddedNDMC', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportNDMC', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportNDMC', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportNDMC', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break

      case 'SDMC':
        socket.on('reportAddedSDMC', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportSDMC', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportSDMC', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportSDMC', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break

      case 'NewDMC':
        socket.on('reportAddedEDMC', reportData => {
          notifyMe(`New Report`)
          nowuiDashboard.showNotification('bottom', 'center', `New Report ID: ${reportData._id}`)
        })
        socket.on('priority1ReportNewDMC', reportData => {
          notifyMe(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'centre',
            `More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority1Notif(`More than 20 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority2ReportNewDMC', reportData => {
          notifyMe(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority2Notif(`More than 15 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        socket.on('priority3ReportNewDMC', reportData => {
          notifyMe(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
          nowuiDashboard.showNotification(
            'top',
            'center',
            `More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`
          )
          priority3Notif(`More than 10 ${reportData.reportType} reports from Pincode: ${reportData.pincode} within 24hrs`)
        })
        break
    }
  })

//fetch reports then append
async function getReports() {
  var form = document.getElementById('myForm')
  var fetchURL = `/report/reports?location=${form.location.value}&description=${form.description.value}&reportType=${form.reportType.value}&status=${
    form.status.value
  }&sortBy=${form.sortBy.value}`
  var data = await fetch(fetchURL)
    .then(res => res.json())
    .catch(function(error) {
      console.log(error)
    })
  var ul = document.getElementById('reportList')
  while (ul.lastChild) {
    ul.removeChild(ul.lastChild)
  }

  length = data.length
  for (i = 0; i < length; i++) {
    let li = document.createElement('li')
    let div1 = document.createElement('div')
    let div2 = document.createElement('div')
    let span = document.createElement('span')
    let a = document.createElement('a')
    let btnDone = document.createElement('button')
    let btnSeen = document.createElement('button')
    let btnClose = document.createElement('button')

    li.className = 'list-group-item'
    li.setAttribute('id', `${data[i]._id}`)
    div2.className = 'div2'
    div2.setAttribute('dispaly', 'inline-block')
    span.className = 'reporttitle col col-6 py-1'
    a.setAttribute('href', `/report/${data[i]._id}`)
    a.setAttribute('target', `_blank`)
    a.textContent = `View Report`
    btnDone.className = 'btn col-6 mx-2 transparent'
    btnSeen.className = 'btn btn-danger col-6 mx-2'
    btnClose.className = 'btn btn-danger col-6 mx-2'
    date = new Date(data[i].createdAt)
    span.innerText = `ID: ${data[i]._id}
        Status : ${data[i].status}
        ${date.toLocaleString()}
        ${data[i].results.locality} , ${data[i].results.district}, ${data[i].results.pincode}`
    // btnDone.setAttribute('done', false);
    btnDone.innerText = this.done ? '❌' : '✔'
    div1.className = this.done ? 'row done' : 'row'
    btnSeen.innerText = 'SEEN'
    btnClose.innerText = 'CLOSE'

    btnDone.onclick = function() {
      this.done = !this.done
      this.innerText = this.done ? '❌' : '✔'
      this.parentElement.parentElement.className = this.done ? 'row done' : 'row'
    }

    btnSeen.onclick = function() {
      let id = this.parentElement.parentElement.parentElement.id
      let body = { idarray: [id], status: 'seen' }
      fetch(`/report/reports`, {
        method: 'put',
        body: JSON.stringify(body),
        headers: { 'Content-type': 'application/json' }
      })
        .then(document.getElementById(`${id}`).remove())
        .catch(function(error) {
          console.log(error)
        })
    }

    btnClose.onclick = function() {
      let id = this.parentElement.parentElement.parentElement.id
      let body = { idarray: [id], status: 'closed' }
      fetch(`/report/reports`, {
        method: 'put',
        body: JSON.stringify(body),
        headers: { 'Content-type': 'application/json' }
      })
        .then(document.getElementById(`${id}`).remove())
        .catch(function(error) {
          console.log(error)
        })
    }

    div2.appendChild(a)
    div2.appendChild(span)
    div2.appendChild(btnDone)
    div2.appendChild(btnSeen)
    div2.appendChild(btnClose)
    div1.appendChild(div2)
    // div1.appendChild(img)
    li.appendChild(div1)
    reportList.appendChild(li)
  }
}

function tickedArray() {
  var ul = document.getElementById('reportList')
  var idarray = []
  for (i = 0; i < ul.children.length; i++) {
    if (ul.children[i].children[0].children[0].children[2].innerText === '❌') {
      let id = ul.children[i].id
      idarray.push(id)
    }
  }
  return idarray
}

async function seenTicked() {
  var idarray = tickedArray()
  var body = { idarray: idarray, status: 'seen' }
  fetch(`/report/reports`, {
    method: 'put',
    body: JSON.stringify(body),
    headers: { 'Content-type': 'application/json' }
  })
    .then(
      idarray.forEach(id => {
        document.getElementById(id).remove()
      })
    )
    .catch(function(error) {
      console.log(error)
    })
}

async function closeTicked() {
  var idarray = tickedArray()

  var body = { idarray: idarray, status: 'closed' }
  fetch(`/report/reports`, {
    method: 'put',
    body: JSON.stringify(body),
    headers: { 'Content-type': 'application/json' }
  })
    .then(
      idarray.forEach(id => {
        document.getElementById(id).remove()
      })
    )
    .catch(function(error) {
      console.log(error)
    })
}

async function deleteTicked() {
  var idarray = tickedArray()
  var body = { idarray: idarray }
  fetch(`/report/reports`, {
    method: 'delete',
    body: JSON.stringify(body),
    headers: { 'Content-type': 'application/json' }
  })
    .then(
      idarray.forEach(id => {
        document.getElementById(id).remove()
      })
    )
    .catch(function(error) {
      console.log(error)
    })
}
