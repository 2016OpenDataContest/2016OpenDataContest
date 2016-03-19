function CenterControl(controlDiv, map, d) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  // controlUI.style.backgroundColor = '#B3C4F2 transparent';
  controlUI.style.backgroundImage = 'url(img/bk.jpg)';
  //controlUI.style.border = '3px solid #B3C4F2';
  controlUI.style.borderRadius = '25px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'cursor';
  //controlUI.style.marginBottom = '22px';
   controlUI.style.position = 'relative';
   controlUI.style.top = '50px';
  // controlUI.style.right = '0%';
  // controlUI.style.left = '5%';
  controlUI.style.textAlign = 'center';
  controlUI.style.padding = '10px';
  controlUI.style.width = 'auto';
  controlUI.style.height = 'auto';
  controlUI.style.overflowY = 'auto';
  controlDiv.appendChild(controlUI);
  // console.log(d);

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


  //name
  // controlText.innerHTML += '<h3 style="color:#0979E2;line-height:1.5em;font-size:5em;margin:0.2em;padding:0">' + d.name + "<h3>";
  //rating
  // if(d.rating_img_url !== undefined)
  //     controlText.innerHTML += '<br><img src='+d.rating_img_url+">";
  //phone + address + navigation
  // controlText.innerHTML += '<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em">' + phone + "</h5>" +
  //                          '<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em">' + address + "</h5>"+
  //                          '<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em"><a href="https://maps.google.com/maps?saddr=&daddr='+address+'" target="view_window">Navigation</a></h5>';
    controlText.innerHTML += '<img src=img/navigation.png height="70" width="70">';
    controlText.innerHTML += '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
    controlText.innerHTML += '<h5 style="display: inline;color:#333333;margin:0;padding:10;font-size:9em"><a syle="font-size: 5em" href="https://maps.google.com/maps?saddr=&daddr='+address+'" target="view_window">Navigation</a></h5>';
  
  //description
  // if(d.snippet_text !== undefined) {
  //      // d.snippet_text += '<br>&nbspp&nbsp&nbsp';
  //     controlText.innerHTML += '<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em">' + d.snippet_text + "</h5>";
  // }
  // controlText.innerHTML += '<br>';
  //details
  // if(d.url !== undefined)
  //     controlText.innerHTML +=  '<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em"><a href="'+d.url+'" target="view_window">Yelp Details</a></h5>';

  //opening hours
  // if(d.opening_hours !== undefined) {
  //    var day = new Date();
  //    var text = d.opening_hours.weekday_text[day.getDay() - 1];
  //    if(text !== undefined) {
  //        text = text.substring(4,text.length);
  //        controlText.innerHTML += ('<h5 style="color:#333333;margin:0;padding:0;font-size:1.2em">' + text + "</h5>");
  //    }
  // }
  //
  // if(d.image_url !== undefined) {
  //       controlText.innerHTML += '</br><img style="-webkit-border-radius:5px" src='+d.image_url+">";
  // }

  //photos
  // if(d.photos !== undefined) {
  //    for(var i in d.photos) {
  //       controlText.innerHTML += '</br><img style="-webkit-border-radius:5px" src='+d.photos[i].getUrl({'maxWidth': 270, 'maxHeight': 2000})+">";
  //    }
  // }
  controlText.innerHTML += '<input type="button" style="position:absolute;left:0;right:0;top:0;background-image:url(img/x.png);border:none;background-color:transparent;" onClick="map.controls[google.maps.ControlPosition.TOP_CENTER].clear();">';
  controlUI.appendChild(controlText);
}
