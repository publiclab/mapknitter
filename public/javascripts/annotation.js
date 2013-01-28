$A = {
  description: "",
  node_index: 0,
  polygons: {},
  points: {},
  initialize: function(args) {
    this.map_id = args['map_id']
    this.map_name = args['map_name']
  },
  add_point: function() {
    map.on('click',$A.save_point) 
  },
  save_point: function(e) {
      $A.description = prompt("Enter a description")
      $A.marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
      $.ajax({
        url: "/annotation/create/",
        type: "GET",
        data: {
          description: $A.description,
          lat: e.latlng.lat,
          lon: e.latlng.lng,
          map_id: $A.map_id
        },
        failure: function(r) { location.reload() },
        success: function(r) {
          $A.marker.bindPopup($A.description+" (<a href='#' onClick='$A.delete_point("+r+")'>x</a>)").openPopup();
          $A.points[''+r] = $A.marker
          map.off('click',$A.save_point)
        }
      })
  },

  add_poly: function() {
    map.doubleClickZoom.disable();
    $A.poly_nodes = []
    $A.poly_nodexy = []

    // begin click loop, adding to nodes
    map.on('click',$A.on_poly_click)
    map.on('dblclick',$A.save_poly)
  },

  distance: function(x,y,x2,y2) {
    return Math.sqrt(Math.abs(x-x2)*Math.abs(x-x2)+Math.abs(y-y2)*Math.abs(y-y2))
  },
  on_poly_click: function(e) {
    
    // store new point
    $A.poly_nodes.push([e.latlng.lat,e.latlng.lng,$A.node_index])
    $A.poly_nodexy.push([e.originalEvent.offsetX,e.originalEvent.offsetY])
    $A.node_index += 1 // track order of nodes

    if ($A.poly) {
      // draw poly
      $A.poly.addLatLng([e.latlng.lat,e.latlng.lng])
    } else {
      // create if none
      $A.poly = new L.Polygon([[e.latlng.lat,e.latlng.lng]],{color:$('#color').val()})
      $A.poly.addTo(map)
    }
  },

  save_poly: function() {   
    $A.description = prompt("Enter a description")
    map.off('click',$A.on_poly_click)
    map.off('dblclick',$A.save_poly)
    map.doubleClickZoom.enable();
    $.ajax({
      url: "/annotation/create_poly/",
      type: "GET",
      data: {
        description: $A.description,
        color: $('#color').val(),
        map_id: $A.map_id,
        nodes: $A.poly_nodes
      },
      failure: function(r) { location.reload() },
      success: function(r) {
        $A.poly.bindPopup($A.description+" (<a href='#' onClick='$A.delete_poly("+r+")'>x</a>)").openPopup();
        // add to layer based on color
        // color = $('#color').val()
        //if (!$A.layer[color]) $A.legend[color] = []
        //$A.layer[color].push($A.poly)
        $A.polygons[''+r] = $A.poly
        $A.poly = false
        $A.node_index = 0 // track order of nodes
      }
    })
  },

  delete_point: function(id) {
    $.ajax({
      url: "/annotation/delete/"+id+"?back=/map/view/"+$A.map_name,
      type: "GET",
      failure: function(r) { alert('Annotation deletion failed. This may be a bug!') },
      success: function(r) { 
        alert('Deleted annotation') 
        map.removeLayer($A.points[""+id])
      }
    })
  },

  delete_poly: function(id) {
    $.ajax({
      url: "/annotation/delete_poly/"+id+"?back=/map/view/"+$A.map_name,
      type: "GET",
      failure: function(r) { alert('Polygon deletion failed. This may be a bug!') },
      success: function(r) { 
        alert('Deleted polygon') 
        map.removeLayer($A.polygons[""+id])
      }
    })
  }

}
