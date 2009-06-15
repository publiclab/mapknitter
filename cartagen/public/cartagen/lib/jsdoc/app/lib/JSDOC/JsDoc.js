/**
	@constructor
*/
JSDOC.JsDoc = function(opt) {
	if (opt.constructor === Array) {
		JSDOC.opt = JSDOC.Util.getOptions(opt, {d:'directory', r:'recurse', x:'ext', p:'private', a:'allfunctions', A:'Allfunctions', e:'encoding', o:'out', T:'test', h:'help', v:'verbose', 'D[]':'define', H:'Headline'});
	}
	else JSDOC.opt = opt;
	
	// the -c option: use a configuration file
	if (JSDOC.opt.c) {
		eval("JSDOC.conf = " + IO.readFile(SYS.pwd()+"../conf/"+JSDOC.opt.c));
		
		for (var c in JSDOC.conf) {
			if (c !== "D" && !defined(JSDOC.opt[c])) { // commandline overrules config file
				JSDOC.opt[c] = JSDOC.conf[c];
			}
		}
	}
	
	// defend against options that are not sane 
	//if (JSDOC.opt.t === true) JSDOC.usage();
    JSDOC.opt.t = 'templates/ext';
    
    var cnt=0, opt;
    for (opt in JSDOC.opt) cnt++;
    
	// the -v option: make verbose
	if (LOG) LOG.verbose = JSDOC.opt.v;
	
	if (JSDOC.opt.h || cnt < 3) {
		JSDOC.usage();
		quit();
	}
	
    if(typeof(JSDOC.opt.H) != 'string') {
        JSDOC.opt.H = 'API Documentation';
    }
    
	// the -e option: use character encoding
	if (!JSDOC.opt.e) JSDOC.opt.e = "utf-8";
	IO.setEncoding(JSDOC.opt.e);
	
	// the -r option: scan source directories recursively
	if (typeof(JSDOC.opt.r) == "boolean") JSDOC.opt.r = 10;
	else if (!isNaN(parseInt(JSDOC.opt.r))) JSDOC.opt.r = parseInt(JSDOC.opt.r);
	else JSDOC.opt.r = 1;
	
	// the -D option: define user variables
	var D = {};
	if (JSDOC.opt.D) {
		for (var i = 0; i < JSDOC.opt.D.length; i++) {
			var defineParts = JSDOC.opt.D[i].split(":", 2);
			if (defineParts) D[defineParts[0]] = defineParts[1];
		}
	}
	JSDOC.opt.D = D;
	// combine any conf file D options with the commandline D options
	if (defined(JSDOC.conf)) for (var c in JSDOC.conf.D) {
 		if (!defined(JSDOC.opt.D[c])) {
 			JSDOC.opt.D[c] = JSDOC.conf.D[c];
 		}
 	}

	JSDOC.opt.srcFiles = this.getSrcFiles();
	this.symbolGroup = new JSDOC.SymbolGroup(this.getSymbols());
}

/**
	Lazy retrieval of source file list, only happens when requested, only once.
 */
JSDOC.JsDoc.prototype.getSrcFiles = function() {
	if (this.srcFiles) return this.srcFiles;
	var srcFiles = [];
	var ext = ["js"];
	if (JSDOC.opt.x) ext = JSDOC.opt.x.split(",").map(function($) {return $.toLowerCase()});
	
	function isJs($) {
		var thisExt = $.split(".").pop().toLowerCase();
		return (ext.indexOf(thisExt) > -1); // we're only interested in files with certain extensions
	}
	
	for (var i = 0; i < JSDOC.opt._.length; i++) {
		srcFiles = srcFiles.concat(
			IO.ls(JSDOC.opt._[i], JSDOC.opt.r).filter(isJs)
		);
	}
	
	this.srcFiles = srcFiles;
	return this.srcFiles;
}

JSDOC.JsDoc.prototype.getSymbols = function() {
	if (this.symbols) return this.symbols;
	var symbols = [];

	for (var i = 0, l = this.srcFiles.length; i < l; i++) {
		var srcFile = this.srcFiles[i];
		
		try {
			var src = IO.readFile(srcFile);
		}
		catch(e) {
			print("oops: "+e.message);
		}

		var tr = new JSDOC.TokenReader();
		var tokens = tr.tokenize(new JSDOC.TextStream(src));
        
		symbols = symbols.concat(
			JSDOC.Parser.parse(
				new JSDOC.TokenStream(tokens),
				srcFile
			)
		);
		
	}
	this.symbols = symbols;
	return this.symbols;
}
