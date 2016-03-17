function PlaceMerge(map)
{
    var _obj = this;
    var _maxLength = 10000;

    var _places = [];
    
    _obj.resetPlaces = function() {
        _places = [];
    }
    _obj.setMaxLength = function(l)
    {
        _maxLength = l;
    }

    function existPlace(p)
    {
        var samePlace = _places.find(function(pp){return pp.info.name == p.info.name;});
        return samePlace != undefined;
    }

    _obj.merge = function (ps)
    {
        var psNew = ps.filter(function(p){return !existPlace(p);});
        _places = _places.concat(psNew);
        removeOutbounds();
        removeOutLength();

        return _places;
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
