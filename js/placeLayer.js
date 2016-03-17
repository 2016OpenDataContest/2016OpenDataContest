function PlaceLayer(map) {
	
    var _obj = this;
	_obj.setMap(map);

    var dragEvent; 

    var _overlayLayer;

    // _projection is generated by google map api
    // to conver lng and lat to x and y
    var _projection;

    // div elements of nodes and edges (visible)
    var _selectionNode;
    var _selectionEdge;
	
	// a function call when click a node
    var _onClickNode;

    function checkInbound(place)
    {
        if(place.info.location.coordinate.longitude === undefined)
        {
            console.log("**WARRN: lat and lng is undefined");
            console.log(place);
        return true;
        }
        var position = new google.maps.LatLng(place.info.location.coordinate.latitude, place.info.location.coordinate.longitude);
        return map.getBounds().contains(position);
    }
    function laglng2px(place)
    {
        if(place.info.location.coordinate.longitude === undefined)
        {
            console.log("**WARRN: lat and lng is undefined");
            console.log(place);
            return true;
        }
        var position = new google.maps.LatLng(place.info.location.coordinate.latitude, place.info.location.coordinate.longitude);
        var p = _projection.fromLatLngToDivPixel(position);
        place.x = p.x;
        place.y = p.y;
        place.px = p.x;
        place.py = p.y;

        return map.getBounds().contains(position);
    }

    function createLargeNode(place)
    {
        var ret = {
            info: place.info,
            radius: parseInt((place.rating)*(place.rating)*(place.rating)/1.2),
            fixed: false,
            color: color()
        };
        if(undefined === ret.radius || ret.radius < 10)
            ret.radius = 10;
        return ret;
    }

    function createSmallNode(place)
    {
        var ret = {
            info : place.info,
            fixed : true,
            radius : 5,
            color : "#777777",
            x : place.x,
            y : place.y
        };

        return ret;
    }

    // modify _places according to old place index and new places
    this.showPlace = function (oldPlaceIdx, newPlaces) {

        // add newPlaces[i].x and newPlaces[i].y
        convertLatLng(newPlaces);

        var nodes = createNodes(newPlaces);
        var edges = createEdges(nodes);
		
		this.updateData(nodes , edges);
        _overlayLayer.style('visibility','visible');

    };
    // use _places to build nodes (both big and small)
    var createNodes = function (places) {
        if(_selectionNode !== undefined)
        {
            var nodes = _selectionNode.data();
            for (var i = 0 ; i < places.length ; i += 1)
            {
                //console.log("#d" + places[i].info.id);
                var nd = d3.select("#d" + places[i].info.id);
                //console.log(nd.data());
                if(nd[0][0] === null)
                {
                    nodes.splice(nodes.length/2, 0, createSmallNode(places[i]));
                    nodes.push(createLargeNode(places[i]));
                }
            }

            for (var i = 0 ; i < nodes.length/2 ; i+=1)
            {
                if(checkInbound(nodes[i]) === false)
                { 
                    nodes.splice(i+nodes.length/2, 1);
                    nodes.splice(i, 1);
                    i-=1;
                }
            }
            var sortList = [];
            for (var i = 0 ; i < nodes.length/2 ; i+=1)
                sortList[i] = i;
            sortList.sort(function(a,b){
                var ret =  parseFloat(- nodes[a].info.rating) + parseFloat(nodes[b].info.rating);
                if(ret === 0)
                    ret = parseInt( - nodes[a].info.review_count + nodes[b].info.review_count );
                return ret;
            });
            
            var deleteList = [];
            while (sortList.length > 20)
                deleteList.push(sortList.pop());

            deleteList.sort(function(a,b){return a-b});
            console.log(deleteList);

            while (deleteList.length != 0)
            {
                var eraseID = deleteList.pop();
                nodes.splice(eraseID+nodes.length/2, 1);
                nodes.splice(eraseID, 1);
            }

            console.log(nodes);

            for (var i = 0 ; i < nodes.length/2 ; i+=1)
            {
                laglng2px(nodes[i]);
            }
            return nodes;
        }
        var ret = Array();
        {
            // build small nodes
            for (var i in places)
                ret.push(createSmallNode(places[i]));

            // build big nodes
            for (var i in places) {
                ret.push(createLargeNode(places[i]));
            }
        }
		return ret;
    }

    // use _places to build edges
    var createEdges = function (nodes) {
        ret = [];
        for (var i  = 0 ; i < nodes.length/2 ; i+=1) {
            var source = i+nodes.length/2;
            ret.push({ "target" : i ,
                       "source" : source});
        }
		return ret;
    }

    this.onClickNode = function (callback) {
        _onClickNode = callback;
    };

    // when initial to map
    this.onAdd = function() {
		_projection = this.getProjection();
        _overlayLayer = d3.select(this.getPanes().overlayMouseTarget)
                 .append("div")
                 .attr('class', 'layer')
                 .attr('id','layer');

        // setup google map undraggable or draggable depending on overlayLayer event
        google.maps.event.addDomListener(_overlayLayer[0][0], 'mouseup', function() {
            map.set('draggable',true);
        });
        google.maps.event.addDomListener(_overlayLayer[0][0], 'mousedown', function() {
            map.set('draggable',false);
        });
    };

    // google map api will call this function when initial and zooming
    this.draw = function () {
        _projection = this.getProjection();
        _overlayLayer.style('visibility','hidden');

    };

    // redraw the nodes and edges
    this.updateData = function (nodes , edges) {
	
        // setting force layout
		var tick = 0;
        this.force = d3.layout.force()
            .gravity(0)
            .charge(-20)
            .nodes(nodes)
            .links(edges)
            .size([this.getPanes().overlayLayer.scrollWidth, this.getPanes().overlayLayer.scrollHeight])
            .linkDistance(this.getPanes().overlayLayer.scrollWidth/15)
			.on('tick', function (e) {
				// prevent overlaped nodes
                
				var q = d3.geom.quadtree(nodes);
				for(var i = nodes.length/2 ;i < nodes.length ; i++) {
					q.visit(collide(nodes[i]));
				}
				// redering nodes
				if(tick++%1==0 && tick > 2) {
					_selectionNode.each(nodeTransition);
					_selectionEdge.each(edgeTransition);
				}
		});
			
        // update exist edges
        _selectionEdge = _overlayLayer
            .selectAll('.edge')
			.attr('class', 'edge')
            .data(edges)
            .each(edgeTransition);

        // add new edges
        _selectionEdge.enter()
            .append("div")
            .attr('class', 'edge')
            .each(edgeTransition);

        // update exist nodes
        _selectionNode = _overlayLayer
            .selectAll('.node')
            .data(nodes)
            .attr('class', 'node')
            .attr('id', function(d){return "d" +d.info.id;})
            .each(nodeInitialTransition);
			
        var startX,startY;
        dragEvent= d3.behavior.drag()//this.force.drag()
            .on("dragstart", dragstart)
            .on("drag", drag)
            .on("dragend", dragend);

        // add new nodes
        _selectionNode.enter()
            .append("div")
            .attr('class', 'node')
            .attr('id', function(d){return "d" + d.info.id;})
            .each(nodeInitialTransition)
            .call(dragEvent)
            .on("mouseover",function(d){
                d3.select(this).transition()
                   .ease('elastic')
                   .style('width'      , (d.radius *3) + 'px' )
                   .style('height'     ,  (d.radius *3) + 'px' )
                   .style('margin-left', ' -' + d.radius*1.5 + 'px' )
                   .style('margin-top' , ' -' + d.radius*1.5 + 'px' )
                   .select('.node__circle')
                   .style('background-size','' + String(d.radius*3) + 'px ' + String(d.radius*3) + 'px');

            })
            .on("mouseout",function(d){
                d3.select(this).transition()
                   .ease('elastic')
                   .style('width'      , (d.radius*2) + 'px' )
                   .style('height'     , (d.radius*2) + 'px' )
                   .style('margin-left', ' -' + d.radius + 'px' )
                   .style('margin-top' , ' -' + d.radius + 'px' )
                   .select('.node__circle')
                   .style('background-size','' + String(d.radius*2) + 'px ' + String(d.radius*2) + 'px');
            })
            .on("click", function (d) {
                if (d3.event.defaultPrevented) return;
                    _onClickNode(d);
            });

        // remove redundant edges
        _selectionEdge.exit().remove();
        _selectionNode.exit().remove();

        //_overlayLayer.selectAll('["raduis=5"]').on('mousedown.drag', null);
    };


    // add x and y to datas according to lng and lat
    var convertLatLng = function(datas) {
        // build _data[i].x and _data[i].y for each _data
        //var parseOperation = new ParseOperation();
        for(var i in datas){
            var p = new google.maps.LatLng(datas[i].lng, datas[i].lat);
            p = _projection.fromLatLngToDivPixel(p);
            datas[i].x = p.x;
            datas[i].y = p.y;
        }
    };

    // initial a node not only apperant but also position
    var nodeInitialTransition = function(d) {
        var div = d3.select(this);

        if(d.radius === 10)
            div.style("display","none");
        else
            div.style("display","inline");


        

        var saturation = 255;
        if(d.info.review_count !== undefined)
            saturation = Math.min(( d.info.review_count * 15 ),255);
        else 
            saturation = 0;

        // div style (circle)
        div.style('width'      , (d.radius * 2) + 'px' )
           .style('height'     , (d.radius * 2) + 'px' )
           .style('margin-left', ' -' + d.radius + 'px' )
           .style('margin-top' , ' -' + d.radius + 'px' )
           .style("left", d.x + "px")
           .style("top",  d.y + "px")
           .style('border-color', 'rgb(' + parseInt(Math.min(saturation*2,255)) + ',' + parseInt(saturation/5) + ','+parseInt(saturation/2)+')');

        // open information
        div.html("");
        if(d.fixed === false){
            div.append("div")
                .attr("class","node__inner")
                .append("div")
                .attr("class","node__wrapper")
                .append("div")
                .attr("class","node__content");
            if(d.radius > 30)
                div.select(".node__content").html(d.info.name);
        }
        if(d.info.image_url === undefined)
        {
            div.append("div").attr("class","node__circle")
                .style('background-color',d.color);
        }
        else
        {
            div.append("div").attr("class","node__circle")
                .style('background-image' , "url(\"" + d.info.image_url + "\")" )
                .style('background-size','' + String(d.radius*2) + 'px ' + String(d.radius*2) + 'px')
                .style('background-color',d.color);
        }


        if(d.fixed === false) {
            var plusx = Number(d.x) + Number(-20);
            var plusy = Number(d.y) + Number(-20);
            div.style("left" , plusx + "px")
               .style("top" , plusy + "px");
        }

        return div;
    }

    // move a node
    var nodeTransition = function (d) {
        return d3.select(this)
            .style("left", d.x + "px")
            .style("top",  d.y + "px");
    }

    // move an edge
    var edgeTransition = function (d) {
        if(d.source.radius === 10 || d.target.radius === 10)
            d3.select(this).style("display","none");
        else
            d3.select(this).style("display","inline");
        var ax = d.source.x;
        var ay = d.source.y;
        var bx = d.target.x;
        var by = d.target.y;
        var dx = bx - ax;
        var dy = by - ay;

        var deg = (dx)? Math.atan(dy/dx)
                 :(dy > 0)? Math.PI/2 : -Math.PI/2;

        if(dx < 0)
            deg = Math.PI + deg;

        deg = deg*180/Math.PI;

        //calc = 0;
        var length=Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));

        return d3.select(this)
                .style("width" , length + "px")
                .style("top" , ay + "px")
                .style("left" , ax + "px")
                .style("transform",     "rotate(" + deg + "deg)")
                .style("transform-origin",         "0% 0%")
                .style("-ms-transform", "rotate(" + deg + "deg)")
                .style("-moz-transform", "rotate(" + deg + "deg)")
                .style("-moz-transform-origin",    "0% 0%")
                .style("-webkit-transform", "rotate(" + deg + "deg)")
                .style("-webkit-transform-origin", "0% 0%")
                .style("-o-transform", "rotate(" + deg + "deg)")
                .style("-o-transform-origin",      "0% 0%");
    }

    // prevent overlap nodes
    function collide(node) {
      var r = node.radius + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .2;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
    }

    function color () {
        var alpha = 0.9;
        var beautifulColor = ["rgba(11, 221, 24,0.9)","rgba(29, 98, 240 , 0.9)","rgba(255, 42, 104, 0.9)","rgba(255,205,2,0.9)"];
        
        return beautifulColor[Math.floor((Math.random() * 4) + 0)];
    }
    function mobileAndTabletcheck () {
          var check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
              return check;
    }

	var startX = null,startY = null;

	function dragstart(d , i) {
        _obj.force.stop();
        var arr = [0,0];
        arr = d3.mouse(this);
        startX=arr[0];
        startY=arr[1];
	}

	function drag(d) {
        var arr = [0,0];
        arr = d3.mouse(this);
        if(d.radius != 5)
        {
            d.x += arr[0] - startX;
            d.y += arr[1] - startY;
        }

        d3.select(this)
            .style("left", d.x + "px")
            .style("top",  d.y + "px");
        _selectionEdge.each(edgeTransition);
        

        var length=(Math.abs(arr[0]-startX)+Math.abs(arr[1]-startY));
		var like = (d.x > _projection.fromLatLngToDivPixel(map.getCenter()).x);
        console.log(length);
		//_obj.force.start();
		console.log("center: " + _projection.fromLatLngToDivPixel(map.getCenter()).x);

		// show or not
		var visibility = (length > 300)?"visible":"hidden";


		d3.select("#likeDIV").style("visibility",visibility);  
		d3.select("#dislikeDIV").style("visibility",visibility);

        if(like) {
            d3.select("#likeIMG").style("animation-play-state","running"); 
            d3.select("#dislikeIMG").style("animation-play-state","paused");
            d3.select("#likeDIV").style("opacity","1");
            d3.select("#dislikeDIV").style("opacity","0.7");
        }
        else {
            d3.select("#likeIMG").style("animation-play-state","paused"); 
            d3.select("#dislikeIMG").style("animation-play-state","running");
            d3.select("#likeDIV").style("opacity","0.7");
            d3.select("#dislikeDIV").style("opacity","1");
        }                
	}

	function dragend(d) {
        length=(Math.abs(d.x-startX)+Math.abs(d.y-startY));

        d3.select("#likeDIV").style("visibility","hidden");  
        d3.select("#dislikeDIV").style("visibility","hidden");

        //var parseOperation = new ParseOperation();
        var valid = length > 150;
        var like = (d.x > d3.select("#dislikeDIV").node().getBoundingClientRect().width);
        map.set('draggable',true);
        var arr = [0,0];
        arr = d3.mouse(this);
        if(d.radius != 5)
        {
            d.x += arr[0] - startX;
            d.y += arr[1] - startY;
        }
        d3.select(this)
            .style("left", d.x + "px")
            .style("top",  d.y + "px");
        _selectionEdge.each(edgeTransition);
        _obj.force.resume();
	}

}
