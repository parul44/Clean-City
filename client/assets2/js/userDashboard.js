// Script for displaying User information
var user
var $userdiv = document.getElementById('user')
var $submissions = document.getElementById('submissions')
var $unseen = document.getElementById('unseen')
var $seen = document.getElementById('seen')
var $closed = document.getElementById('closed')
var $credits = document.getElementById('credits')

fetch('/admin/info')
  .then(res => res.json())
  .then(data => {
    user = data
    $userdiv.textContent = ` ${user.username} : ${user.name}`
    $submissions.textContent = ` ${user.submissions}`
    fetch('/report/count/?status=unseen')
      .then(res => res.json())
      .then(data => {
        $unseen.textContent = data.count
      })
    fetch('/report/count/?status=seen')
      .then(res => res.json())
      .then(data => {
        $seen.textContent = data.count
      })
    fetch('/report/count/?status=closed')
      .then(res => res.json())
      .then(data => {
        $closed.textContent = data.count
      })
    $credits.textContent = ` ${user.credits}`
  })

//Script for redeem buttons
function redeem() {
  fetch(`/user/redeem`, {
    method: 'put',
    // body: JSON.stringify(body),
    headers: { 'Content-type': 'application/json' }
  })
    .then(alert('Msg for redemption/failure'))
    .catch(function(error) {
      console.log(error)
    })
}
var $redeemButtons = document.querySelectorAll('.redeem')
$redeemButtons.forEach($redeemButton => {
  $redeemButton.addEventListener('click', redeem)
})
