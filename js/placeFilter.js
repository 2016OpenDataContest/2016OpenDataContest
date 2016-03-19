function PlaceFilter(map)
{
    var _obj = this;
    var _maxLength = 10000;
    var _category;
    var _places = [];
    var _filter = [];
    var _filterplaces = [];
    var tuples = [];

    _obj.returnTopFive = function() {
        
        //checkFilter();
        // sort the place ID according to rating and review_count
        var sortList = [];
        for (var i = 0 ; i < _filterplaces.length ; i+=1)
            sortList[i] = i;
        // sort
        sortList.sort(function(a,b){
            var ret =  parseFloat( - _filterplaces[a].info.rating) + parseFloat(_filterplaces[b].info.rating);
            if(ret === 0)
                ret = parseInt( - _filterplaces[a].info.review_count + _filterplaces[b].info.review_count );
            return ret;
        });
        var topFiveList = [];
        for (var i = 0; i < Math.min(_filterplaces.length, 5); i+=1)
            topFiveList.push(_filterplaces[sortList[i]]);
        //console.log(topFiveList);
        return topFiveList;
    }
    
    _obj.resetFilter = function() {
      _filter = [];
    }

    _obj.setFilter = function(f, operation) {
      if (operation == true) _filter.push(f);
      else {
        var Idx = _filter.indexOf(f);
        _filter.splice(Idx, 1);
      }
      console.log(_filter);
      checkFilter();
    }
    _obj.setCategory = function (c) {
      _category = c;
    }
    
    _obj.findInBoundPlaces = function(p) {
        _places = p;
        removeOutbounds();
        //_filterplaces = _places;
        //checkFilter();
        return _places;
    }

    _obj.resetPlaces = function() {
        _places = [];
    }

    _obj.summaryType = function(p) {
        _places = p;
        _filterplaces = _places; // maybe redundant
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
     tuples = [];
        for (var key in typeList) {
            tuples.push([key, typeList[key]]);
            //console.log(key + ' ' + typeList[key] );
        }
        tuples.sort(function(a,b) {
            a = a[1];
            b = b[1];
            return b - a;
        });
        //console.log(tuples);
        return tuples;
    }
    _obj.returnPlaces = function() {
        return _filterplaces;
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
    function checkFilter(){
        _filterplaces=[];
        var index ;
        var caseWithOther=0;
        for (var k = 0; k < _filter.length; k+=1)
            if(_filter[k]==="Others")
                caseWithOther=1;
        if(caseWithOther==0){
            for (var i = 0; i < _places.length; i+=1) {

                index = _places[i].info.categories.length;
                byCategory=0;
                for (var j = 0; j < _places[i].info.categories.length; j+=1) {
                    if (_places[i].info.categories[j][1] === _category ){
                            index-=1;
                            byCategory=1;
                        }
                    for (var k = 0; k < _filter.length; k+=1) {
                        
                        if (_places[i].info.categories[j][0] === _filter[k]){
                            index-=1;
                        }
                    }
                   //console.log(_places[i].info.categories[j][0] + ' ' + typeList[_places[i].info.categories[j][0]]);
                }
                //if(_places[i].info.id==="the-v-f舞蔬弄果-信義旗艦店-台北市大安區")
                if(index > 0||(_places[i].info.categories.length == 1 && byCategory == 1)){
                    _filterplaces.push(_places[i]);
                     //console.log(index+"  "+_places[i]);
                     //console.log(_filterplaces);
                }
            //console.log(index);
            }
        console.log(_filterplaces);

        }
        else{
            for (var i = 0; i < _places.length; i+=1) {
                index = 0;
                for (var j = 0; j < _places[i].info.categories.length; j+=1) {
                    for (var k = 0; k < _filter.length; k+=1) {
                        //if (_places[i].info.categories[j][1] === _category )
                            //index-=1;
                        if (_places[i].info.categories[j][0] === _filter[k])
                            index-=1;
                    }
                    for (var k = 0; k < 5; k+=1) {
                        if (_places[i].info.categories[j][0] === tuples[k][0])
                            //console.log(tuples[k][0]);
                            index+=1;
                    }
                   //console.log(_places[i].info.categories[j][0] + ' ' + typeList[_places[i].info.categories[j][0]]);
                }
                if(index > 0)
                _filterplaces.push(_places[i]);
            //console.log(index);
            }
        }

    }
};