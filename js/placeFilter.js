function PlaceFilter(map)
{
    var _obj = this;
    var _maxLength = 10000;
    var _category;
    var _places = [];
    

    _obj.setCategory = function (c) {
      _category = c;
    }
    
    _obj.findInBoundPlaces = function(p) {
        _places = p;
        removeOutbounds();
        return _places;
    }

    _obj.resetPlaces = function() {
        _places = [];
    }

    _obj.summaryType = function(p) {
        _places = p;
        var typeList = new Array();
        for (var i = 0; i < _places.length; i+=1) {
            for (var j = 0; j < _places[i].info.categories.length; j+=1) {
               if (_places[i].info.categories[j][1] === _category)
                 continue;
               if (typeList[_places[i].info.categories[j][0]] === undefined)
                   typeList[_places[i].info.categories[j][0]] = 1;
               else
                   typeList[_places[i].info.categories[j][0]] += 1;
               //console.log(_places[i].info.categories[j][0] + ' ' + typeList[_places[i].info.categories[j][0]]);
            }
        }
        var tuples = [];
        for (var key in typeList) {
            tuples.push([key, typeList[key]]);
            //console.log(key + ' ' + typeList[key] );
        }
        tuples.sort(function(a,b) {
            a = a[1];
            b = b[1];
            return b - a;
        });
        console.log(tuples);
        return tuples;
    }
    function checkInbound(place)
    {
        var position = new google.maps.LatLng(place.info.location.coordinate.latitude, place.info.location.coordinate.longitude);
        return map.getBounds().contains(position);
    }

    function removeOutbounds()
    {
        _places = _places.filter(checkInbound); 
    }


    function removeOutLength()
    {
        // sort the place ID according to rating and review_count
        var sortList = [];
        for (var i = 0 ; i < _places.length ; i+=1)
            sortList[i] = i;
        
        // sort
        sortList.sort(function(a,b){
            var ret =  parseFloat(- _places[a].info.rating) + parseFloat(_places[b].info.rating);
            if(ret === 0)
                ret = parseInt( - _places[a].info.review_count + _places[b].info.review_count );
            return ret;
        });
        
        // create deleteList, which contains the place ID we would like to delete
        var deleteList = [];
        while (sortList.length > _maxLength)
            deleteList.push(sortList.pop());
        
        // we should delete from the largest one to prevent the place IDs shifting
        deleteList.sort(function(a,b){return a-b});
        
        // delete the place according to the delete list
        while (deleteList.length != 0)
        {
            var eraseID = deleteList.pop();
            _places.splice(eraseID, 1);
        }
    }
};