var global;
/**
	@constructor
*/
JSDOC.SymbolGroup = function(symbols) {
	this.symbols = this.filterByOption(symbols, JSDOC.opt);
	
	// generate a dummy class to hold any symbols with no parent class
	global = new JSDOC.Symbol().init("_global_", [], "CONSTRUCTOR", new JSDOC.DocComment("/** BUILTIN */"));
	global.set("isNamespace", true);
	global.set("srcFile", "");
	
	this.symbols.push(global);
	
	this.fileIndex = new Hash();
	this.classIndex = {};
	this.nameIndex = new Hash();
	this.typeIndex = new Hash();
	
	this.indexAll();
	this.resolveInherits();
	this.indexAll();
	this.resolveMemberOf();
	this.indexAll();
	this.resolveNames();
	this.indexAll(this.symbols);
	this.resolveMembers();
	this.indexAll();
	this.resolveAugments();
}

JSDOC.SymbolGroup.prototype.getOverview = function(path) {
	var overviews = this.getSymbolsByType().filter(
		function(symbol) {
			return (symbol.get("srcFile") == path);
		}
	);
	if (overviews.constructor === Array) return overviews[0];
}

/** Apply any effects of -a -A -p (etcetera) commandline options */
JSDOC.SymbolGroup.prototype.filterByOption = function(symbols, options) {			 
	symbols = symbols.filter(
		function(symbol) {
			if (symbol.get("isInner")) symbol.set("isPrivate", "true");
			
			var keep = true;
			
			if (symbol.is("FILE")) keep = true;
			else if (!symbol.get("comment").userComment && !(options.a ||options.A)) keep = false;
			else if (/(^|[.#-])_/.test(symbol.get("alias")) && !options.A) keep = false;
			else if (symbol.get("isPrivate") && !options.p) keep = false;
			else if (symbol.get("isIgnored")) keep = false;
			
			if (/#$/.test(symbol.get("alias"))) keep = false; // we don't document prototype
			
			if (keep) return symbol
		}
	);
	return symbols;
}

JSDOC.SymbolGroup.prototype.getSymbol = function(alias) {
	return this.nameIndex.get(alias);
}

JSDOC.SymbolGroup.prototype.getSymbols = function() {
	return this.symbols;
}

JSDOC.SymbolGroup.prototype.getSymbolsByFile = function(filename) {
	return this.fileIndex.get(filename);
}

JSDOC.SymbolGroup.prototype.getSymbolsByClass = function(parentname) {
	return this.classIndex.get(parentname);
}

JSDOC.SymbolGroup.prototype.getSymbolsByType = function(type) {
	return this.typeIndex.get(type);
}

JSDOC.SymbolGroup.prototype.indexAll = function() {
	this.nameIndex.reset();
	this.typeIndex.reset();
	this.fileIndex.reset();
	
	// remove any symbols set to null
	this.symbols = this.symbols.filter(function($){return $ != null});
	
	for (var i = 0, l = this.symbols.length; i < l; i++) {
		this.indexSymbol(this.symbols[i]);
	}
}

JSDOC.SymbolGroup.prototype.indexSymbol = function(symbol) {
	// filename=>symbol[] map
	var srcFile = symbol.get("srcFile");
	if (srcFile) {
		if (!this.fileIndex.has(srcFile)) this.fileIndex.put(srcFile, []);
		this.fileIndex.get(srcFile).push(symbol);
	}
	
	// alias=>symbol map, presumes symbol.alias are unique
	if (symbol.get("alias")) {
		this.nameIndex.put(symbol.get("alias"), symbol);
	}

	// isa=>symbol[] map
	//if (symbol.isa) {
		var kind = symbol.get("isa");
		if (!this.typeIndex.has(kind)) this.typeIndex.put(kind, []);
		this.typeIndex.get(kind).push(symbol);
	//}
}

JSDOC.SymbolGroup.prototype.addBuiltIn = function(isa) {
	if (this.getSymbol(isa)) return; // user defined one of these exists
	var docComment = new JSDOC.DocComment("/** BUILTIN */");
	var builtIn = new JSDOC.Symbol().init(isa, [], "CONSTRUCTOR", docComment, "");
	builtIn.isStatic = true;
	builtIn.srcFile = "";
	this.symbols.push(builtIn);
	this.indexSymbol(builtIn);
	return builtIn;
}

JSDOC.SymbolGroup.prototype.resolveMemberOf = function(symbol) {
	for (var i = 0, l = this.symbols.length; i < l; i++) {
		var symbol = this.symbols[i];
		if (symbol.get("alias") == "_global_" || symbol.is("FILE")) continue;

// TODO can't this be resolved in init() of the Symbol script?		
		if (symbol.get("memberof")) {
			symbol.makeMemberOf(symbol.get("memberof"));	
		}
	}
}

JSDOC.SymbolGroup.prototype.resolveNames = function() {
	eachSymbol:
	for (var i = 0, l = this.symbols.length; i < l; i++) {
		var symbol = this.symbols[i];
		if (symbol.get("alias") == "_global_" || symbol.is("FILE")) continue;

		var nameChain = new Chain(symbol.get("alias").split(/([#.-])/));

		// find the constructor closest in the chain to "this"
		for (var node = nameChain.last(); node !== null; node = nameChain.prev()) {
			var parentName = nameChain.joinLeft();
			if (parentName) {
				var parent = this.getSymbol(parentName);
				if (
					(parent && parent.is("CONSTRUCTOR"))
					||
					(symbol.set("addOn", JSDOC.Lang.isBuiltin(parentName)))
				) {
					symbol.set("parentConstructor", parentName);
					if (symbol.get("addOn")) {
						this.addBuiltIn(parentName);
					}
					break;
				}
			}
		}

		if (symbol.get("parentConstructor")) {
			// constructor#blah#foo => constructor#foo
			var oldAlias = symbol.get("alias");
			symbol.set("alias",
				symbol.get("alias").replace(
					new RegExp("^"+RegExp.escapeMeta(symbol.get("parentConstructor"))+'(\\.|#)[^+]+#'), 
					symbol.get("parentConstructor")+"#"
				)
			);
			this.nameIndex.rename(oldAlias, symbol.get("alias"));

			var parts = symbol.get("alias").match(/^(.*[.#-])([^.#-]+)$/);
			if (parts) {
				symbol.set("memberof", parts[1]);
				symbol.set("name", parts[2]);

				if (symbol.get("memberof")) {
					switch (symbol.get("memberof").charAt(symbol.get("memberof").length-1)) {
						case '#' :
							symbol.set("isStatic", false);
							symbol.set("isInner", false);
						break;
						case '.' :
							symbol.set("isStatic", true);
							symbol.set("isInner", false);
						break;
						case '-' :
							symbol.set("isStatic", false);
							symbol.set("isInner", true);
						break;
					}
					symbol.set("memberof", symbol.get("memberof").substr(0, symbol.get("memberof").length-1));
				}
				else {
					symbol.set("isStatic", true);
					symbol.set("isInner", false);
				}
			}
			if (!this.classIndex[symbol.get("memberof")]) this.classIndex[symbol.get("memberof")] = [];
			this.classIndex[symbol.get("memberof")].push(symbol);
		}
		else { // no parent constructor
			symbol.set("alias", symbol.get("alias").replace(/^(_global_#)?([^#]+)(\.[^#.]+)#(.+)$/, "$1$2.$4"));
			if (RegExp.$2 && RegExp.$4) symbol.set("name", RegExp.$2+"."+RegExp.$4);

			if (!symbol.is("CONSTRUCTOR")) {
				if (symbol.get("alias").indexOf("#") > -1) {
					print("WARNING: Documentation found for instance member: "+symbol.get("name")+", but no documentation exists for parent class.");
					this.symbols[i] = null;
					continue eachSymbol;
				}
				
				symbol.set("memberof", "_global_");
				symbol.set("alias", "_global_#"+symbol.get("name"));
			}
			
			symbol.set("isStatic", true);
			symbol.set("isInner", false);
			global.inherit(symbol);
		}
	}
}

JSDOC.SymbolGroup.prototype.resolveMembers = function() {
    for (var i = 0, l = this.symbols.length; i < l; i++) {
		var symbol = this.symbols[i];
		if (symbol.is("FILE")) continue;
		
		var members = this.classIndex[symbol.get("alias")];
		if (members) {
			for(var ii = 0, il = members.length; ii < il; ii++) {
				var member = members[ii];
				if (member.is("FUNCTION")) {
					symbol.addMethod(member);
				}
				if (member.is("OBJECT")) {                    
					symbol.addProperty(member);
					//if (!symbol.hasMember(member.get("alias"))) symbol.get("properties").push(member);
				}
			}
		}
	}
}

JSDOC.SymbolGroup.prototype.resolveInherits = function() {
	for (var i = 0, l = this.symbols.length; i < l; i++) {
		var symbol = this.symbols[i];
		if (symbol.get("alias") == "_global_" || symbol.is("FILE")) continue;
		
		var inherits = symbol.get("inherits");
		if (inherits.length) {
			for (var j = 0; j < inherits.length; j++) {
				var inherited = this.symbols.filter(function($){return $.get("alias") == inherits[j].alias});
				var inheritedAs = inherits[j].as;
				
				if (symbol.hasMember(inheritedAs)) continue;
				
				if (inherited && inherited[0]) {

					inherited = inherited[0];
				
					var clone = inherited.clone();
	
					clone.set("name", inheritedAs);
					clone.set("alias", inheritedAs);
					this.symbols.push(clone);
				}
			}
		}
	}
}


JSDOC.SymbolGroup.prototype.resolveAugments = function() {
	for (var i = 0, l = this.symbols.length; i < l; i++) {
		var symbol = this.symbols[i];
		if (symbol.get("alias") == "_global_" || symbol.is("FILE")) continue;
		
		var augments = symbol.get("augments");
		for(var ii = 0, il = augments.length; ii < il; ii++) {
			var contributer = this.getSymbol(augments[ii]);
			if (contributer) {
				symbol.get("inheritsFrom").push(contributer.get("alias"));
				if (!isUnique(symbol.get("inheritsFrom"))) {
					LOG.warn("Can't resolve inherits: Circular reference: "+symbol.get("alias")+" inherits from "+contributer.get("alias")+" more than once.");
				}
				else {
					var cmethods = contributer.getMethods();
					var cproperties = contributer.getProperties();
					
					for (var ci = 0, cl = cmethods.length; ci < cl; ci++)
						symbol.inherit(cmethods[ci]);
					for (var ci = 0, cl = cproperties.length; ci < cl; ci++)
						symbol.inherit(cproperties[ci]);
				}
			}
		}
	}
}