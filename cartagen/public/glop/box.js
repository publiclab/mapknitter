var Box = Class.create({
  initialize: function(name) {
	if (objects.length == 0) {
		this.obj_id = 0
	} else {
		this.obj_id = objects[objects.length-1].obj_id+1
	}
  },
  h: 50,
  w: 50,
  x: Math.random()*$('canvas').width,
  y: 0,
  rotation: 0,
  obj_id: "",
  color: randomColor(),
  draw: function() {
	this.shape()
  },
  shape: function() {
	
  },
  drag: function() {
	
  },
  overlaps: function(target_x,target_y,fudge) {
  	if (target_x > this.x-(this.w/2)-fudge && target_x < this.x+(this.w/2)+fudge) {
  		if (target_y > this.y-(this.h/2)-fudge && target_y < this.y+(this.h/2)+fudge) {
		  	return true
  		} else {
  			return false
  		}
  	} else {
  		return false
  	}
  },
  within: function(start_x,start_y,end_x,end_y) {
	var dragLeft = Math.min(start_x,end_x)
	var dragRight = Math.max(start_x,end_x)
	var dragTop = Math.min(start_y,end_y)
	var dragBottom = Math.max(start_y,end_y)
	
	var sideLeft = this.x-(this.w/2)
	var sideRight = this.x+(this.w/2)
	var sideTop = this.y-(this.h/2)
	var sideBottom = this.y+(this.h/2)
	
	if (sideLeft > dragRight || sideRight < dragLeft || sideTop > dragBottom || sideBottom < dragTop) {
		return false
	} else {
		return true
	}
  },
  click: function() {
  },
  rightclick: function() {
  },
  doubleclick: function() {
  },
  highlight: function() {
    canvas.save()
	strokeStyle("rgba(40,40,40,0.2)")
	lineWidth(8)
	translate(this.x,this.y)
	rotate(this.rotation)
	strokeRect(this.w/-2,this.h/-2,this.w,this.h)
	canvas.restore()
  }
});
var box = new Box
load_next_script()