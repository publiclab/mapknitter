var Label = Class.create({
	initialize: function(_x,_y) {
		this.x = _x
		this.y = _y
		$('labels').insert({ bottom: "<div id='label_"+this.obj_id+"'></div>" })
		$('label_'+this.obj_id).absolutize()
		this.draw()
		this.show()
	},
	content: "label",
	class_name: "label",
	obj_id: highest_id() + 1,
	x: 0,
	y: 0,
	// w: 40,
	// h: 20,
	show: function() {
		$('label_'+this.obj_id).show()
	},
	hide: function() {
		$('label_'+this.obj_id).hide()
	},
	update: function(string) {
		this.content = string
		$('label_'+this.obj_id).update("<span class='"+this.class_name+"'>"+this.content+"</span>")
	},
	// delete: function() {
	// 	delete this
	// },
	shape: function() {
		canvas.save()
			beginPath()
			translate(this.x,this.y)
			rect()
			stroke()
			fill()
		canvas.restore()
	},
	draw: function() {
		// console.log("Hover: "+Math.round(this.x-global_x)+","+Math.round(this.y-global_y))
		if ($('label_'+this.obj_id)) {
			$('label_'+this.obj_id).setStyle({top: Math.round(this.y+global_y)+"px"})
			$('label_'+this.obj_id).setStyle({left: Math.round(this.x+global_x)+"px"})
		}
	},
	overlaps: function() {
		return false
	}
})
load_next_script()