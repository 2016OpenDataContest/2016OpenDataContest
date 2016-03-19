function CenterControl(controlDiv, map, d) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundImage = 'url(img/bk.jpg)';
  controlUI.style.borderRadius = '25px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'cursor';
  controlUI.style.position = 'relative';
  controlUI.style.top = '50px';
  controlUI.style.textAlign = 'center';
  controlUI.style.padding = '10px';
  controlUI.style.width = 'auto';
  controlUI.style.height = 'auto';
  controlUI.style.overflowY = 'auto';
  controlDiv.appendChild(controlUI);

  // get restaurant data
  var phone = (d.phone !== undefined)?d.display_phone:d.formatted_phone_number;
  var address = (d.formatted_address !== undefined)?d.formatted_address:d.location.city + ' ' + d.location.address[0];

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.className = "panel";
  controlText.style.fontFamily = 'Impact, Charcoal, sans-serif';
  controlText.innerHTML = '';
  //iframe
  controlText.innerHTML += '<br>';
  controlText.innerHTML += '<br>';
  controlText.innerHTML += '<iframe src="'+d.url+'" width = "1200" height = "500"></iframe>';
  controlText.innerHTML += '<br>';

  controlText.innerHTML += '<img src=img/navigation.png height="70" width="70">';
  controlText.innerHTML += '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
  controlText.innerHTML += '<h5 style="display: inline;color:#333333;margin:0;padding:10;font-size:9em"><a syle="font-size: 5em" href="https://maps.google.com/maps?saddr=&daddr='+address+'" target="view_window">Navigation</a></h5>';
  
  controlText.innerHTML += '<input type="button" style="position:absolute;left:0;right:0;top:0;background-image:url(img/x.png);border:none;background-color:transparent;" onClick="map.controls[google.maps.ControlPosition.TOP_CENTER].clear();">';
  controlUI.appendChild(controlText);
}
