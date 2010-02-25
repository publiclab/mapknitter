/**
	@constructor
*/
JSDOC.DocTag = function(src) {
	this.title = "";
	this.type = "";
	this.name = "";
	this.desc = "";
	
	if (defined(src)) {
		var parts = src.match(/^(\S+)(?:\s+\{\s*([\S\s]+?)\s*\})?\s*([\S\s]*\S)?/);
		
		if (defined(parts) && parts != null) {
			this.title = (parts[1].toLowerCase() || "");
			this.type = (parts[2] || "");
	
			if (this.type) this.type = this.type.replace(/\s*(,|\|\|?)\s*/g, ", ");
			this.desc = (parts[3] || "");
		
			// should be @type foo but we'll accept @type {foo} too
			if (this.title == "type") {
				if (this.type) this.desc = this.type;
				
				// should be @type foo, bar, baz but we'll accept @type foo|bar||baz too
				if (this.desc) {
					this.desc = this.desc.replace(/\s*(,|\|\|?)\s*/g, ", ");
				}
			}

			if (this.desc) {
				if (this.title == "param" || this.title == "property" || this.title == "cfg") { // long tags like {type} [name] desc
					var m = this.desc.match(/^\s*\[([a-zA-Z0-9.$_]+)(?:\s*=([^\]]+))?\](?:\s+\{\s*([\S\s]+?)\s*\})?(?:\s+([\S\s]*\S))?/);
					if (m) { // optional parameter
						this.isOptional = true; // bracketed name means optional
						this.name = (m[1] || "");
						this.defaultValue = (m[2] || undefined);
						this.type = (m[3] || this.type);
						this.desc = (m[4] || "");
					}
					else { // required parameter
						var m = this.desc.match(/^\s*([a-zA-Z0-9.$_]+)(?:\s+\{\s*([\S\s]+?)\s*\})?(?:\s+([\S\s]*\S))?/);
						if (m) {
							this.isOptional = false;
							this.name = (m[1] || "");
							this.type = (m[2] || this.type);
							this.desc = (m[3] || "");
						}
					}
				}
/*				else if (this.title == "requires" || this.title == "see") {
					var m = this.desc.match(/^\s*(\S+)(?:\s+([\S\s]*\S))?/);
					if (m) {
						this.name = (m[1] || "");
						this.desc = (m[2] || "");
					}
				}
*/
				else if (this.title == "config") {
					var m = this.desc.match(/^\s*\[([a-zA-Z0-9.$_]+)(?:\s*=([^\]]+))?\](?:\s+\{\s*([\S\s]+?)\s*\})?(?:\s+([\S\s]*\S))?/);
					if (m) { // optional config parameter
						this.isOptional = true; // bracketed name means optional
						this.name = (m[1] || "");
						this.defaultValue = (m[2] || undefined);
						this.type = (m[3] || this.type);
						this.desc = (m[4] || "");
					}
					else { // required config parameter
						m = this.desc.match(/^\s*([a-zA-Z0-9.$_]+)(?:\s+\{\s*([\S\s]+?)\s*\})?(?:\s+([\S\s]*\S))?/);
						if (m) {
							this.isOptional = false;
							this.name = (m[1] || "");
							this.type = (m[2] || this.type);
							this.desc = (m[3] || "");
						}
					}
				}
			}
		}
	}
}

JSDOC.DocTag.prototype.toString = function() {
	return this.desc;
}
