/**
	Create a new DocComment. This takes a raw documentation comment,
	and wraps it in useful accessors.
	@class Represents a documentation comment object.
*/ 
JSDOC.DocComment = function(/**String*/comment) {
	this.userComment = true; // is this a generated comment or one written by the user?
	if (!comment) {
		comment = "/** @desc */";
		this.userComment = false;
	}
	
	this.rawSrc = comment;
	this.src = JSDOC.DocComment.unwrapComment(this.rawSrc);
	
	this.meta = "";
	if (this.src.indexOf("#") == 0) {
		this.meta = this.src.substring(1, 3);
		this.src = this.src.substring(3);
	}
	
	this.fixDesc();
	
	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run("onDocCommentSrc", this);
	}
	
	this.src = JSDOC.DocComment.shared+"\n"+this.src;
	
	this.tagTexts = this.src.split(/(^|[\r\n])\s*@/)
		.filter(function(el){return el.match(/\S/)});
	
	/**
		The tags found in the comment.
		@type JSDOC.DocTag[]
	*/
	this.tags =
		this.tagTexts.map(function(el){return new JSDOC.DocTag(el)});
	
	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run("onDocCommentTags", this);
	}
}

/**
	If no @desc tag is provided, this function will add it.
*/
JSDOC.DocComment.prototype.fixDesc = function() {
	if (this.meta && this.meta != "@+") return;
	if (/^\s*[^@\s]/.test(this.src)) {				
		this.src = "@desc "+this.src;
	}
}

/**
	Remove slash-star comment wrapper from a raw comment string.
	@type String
*/
JSDOC.DocComment.unwrapComment = function(/**String*/comment) {
	if (!comment) return "";
	var unwrapped = comment.replace(/(^\/\*\*|\*\/$)/g, "").replace(/^\s*\* ?/gm, "");
	return unwrapped;
}

/**
	Provides a printable version of the comment.
	@type String
*/
JSDOC.DocComment.prototype.toString = function() {
	return this.src;
}

/**
	Given the title of a tag, returns all tags that have that title.
	@type JSDOC.DocTag[]
*/
JSDOC.DocComment.prototype.getTag = function(/**String*/tagTitle) {
	return this.tags.filter(function(el){return el.title == tagTitle});
}

JSDOC.DocComment.shared = "";
