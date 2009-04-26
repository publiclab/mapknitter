var Label = Class.create({
	initialize: function() {
		$('labels').insert({ bottom: "<div id='label_"+this.obj_id+"'></div>" })
		$('label_'+this.obj_id).absolutize()
		this.draw()
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
			this.shape()
		canvas.restore()
	},
	draw: function() {
		if ($('label_'+this.obj_id)) {
			$('label_'+this.obj_id).setStyle({top: this.y+"px"})
			$('label_'+this.obj_id).setStyle({left: this.x+"px"})
		}
	},
	overlaps: function() {
		return false
	}
})
load_next_script()