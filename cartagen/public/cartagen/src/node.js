var Node = Class.create({
	radius: 6,
	tags: new Hash(),
	fillStyle: "#555",
	fontColor: "#eee",
	fontSize: 12,
	fontRotation: 0,
	draw: function() {
		Cartagen.object_count++
		Cartagen.node_count++
		canvas.save()
		this.shape()
		canvas.restore()
	},
	shape: function() {
	    canvas.save()
			Style.apply_style(this)
		$C.begin_path()
		$C.translate(this.x,this.y-this.radius)
		$C.arc(0,this.radius,this.radius,0,Math.PI*2,true)
		$C.fill()
		$C.stroke()
	    canvas.restore()
  }
})