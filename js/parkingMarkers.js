function parkingMarker(map, newPlaces)
{
    var markers = [];
    var infowindows = [];

    var image = {
        url: 'img/parking.jpg',
        // This marker is 20 pixels wide by 32 pixels high.
        //size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0)
            // The anchor for this image is the base of the flagpole at (0, 32).
            //anchor: new google.maps.Point(10, 16)
    };
    var shape = {
        coords: [0, 0, 50, 0, 50, 50, 0, 0],
        type: 'poly'
    };
    // draw marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    for (var i = 0; i < newPlaces.length; i++) {
        var place = newPlaces[i];
        var marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            icon: image,
            //shape: shape,
            title: place.info.name,
        });
        markers.push(marker);
    }
    infowindows = [];
    for (var i = 0; i < newPlaces.length; i++) {
        var place = newPlaces[i];
        var infowindow = new google.maps.InfoWindow({
            content: place.info.name
        });
        infowindows.push(infowindow);
    }
    function addListener(marker, info)
    {
        marker.addListener('click', function() {
            console.log(i)
                console.log(infowindow);
            infowindows[i].open(map, marker);
        });
    }
    for (var key = 0; key < newPlaces.length; key++) {
        google.maps.event.addListener(markers[key], 'click', function(innerKey) {
            return function() {
                infowindows[innerKey].open(map, markers[innerKey]);
            }
        }(key));
    }
}
