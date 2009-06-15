
/**
	@namespace
*/
JSDOC.Parser =  {
}

JSDOC.Parser.parse = function(/**JSDOC.TokenStream*/ts, /**String*/srcFile) {
	JSDOC.Parser.symbols = [];
	
	JSDOC.DocComment.shared = "";
	JSDOC.Symbol.setShortcuts();
	JSDOC.Symbol.srcFile = (srcFile || "");
	
	while(ts.next()) {
		if (JSDOC.Parser.findDocComment(ts)) continue;
		if (JSDOC.Parser.findFunction(ts)) continue;
		if (JSDOC.Parser.findVariable(ts)) continue;
        
        // hook resistor.PluginMgr onto TokenStream
        if (ts.look().is("NAME")) {
            JSDOC.resistor.PluginMgr.onTokenStream(ts.look().data, ts, 0);
            continue;
        }      
	}  
    /***
     debug
    var list = JSDOC.Parser.symbols;
    for (var n=0,len=list.length;n<len;n++) {
        print('-- name: ' + list[n].get('name') + ', isa: ' + list[n].get('isa'));
    }       
    */         
	return JSDOC.Parser.symbols;
}

JSDOC.Parser.findDocComment = function(/**JSDOC.TokenStream*/ts) {
/*debug*///print("~~ JSDOC.Parser.findDocComment() "+ts.look());
	if (ts.look().is("JSDOC")) {
		var rawComment = ts.look().data;
		var docComment = new JSDOC.DocComment(rawComment);

		if (docComment.meta) {
			if (docComment.meta == "@+") JSDOC.DocComment.shared = docComment.src;
			if (docComment.meta == "@-") JSDOC.DocComment.shared = "";
			if (docComment.meta == "=+") JSDOC.Symbol.setShortcuts(docComment.src);
			if (docComment.meta == "=-") JSDOC.Symbol.setShortcuts();
			delete ts.tokens[ts.cursor];
			return true;
		}
		else if (docComment.getTag("overview").length > 0) {
			JSDOC.Parser.symbols.push(new JSDOC.Symbol().init("", [], "FILE", docComment));
			delete ts.tokens[ts.cursor];
			return true;
		}
		else if (docComment.getTag("scope").length > 0) {
			var scope = docComment.getTag("scope")[0].desc;
			var block = new JSDOC.TokenStream(ts.balance("LEFT_CURLY"));
			if (scope) {
				scope = scope.replace(/\.prototype(\.|$)/g, "#");
				var virtualName = docComment.getTag("name");

				if (virtualName.length && (virtualName = virtualName[0].desc)) {
					JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(virtualName, [], "VIRTUAL", docComment));
				}
				JSDOC.Parser.onObLiteral(block, scope);
			}
			return true;
		}
		else if (docComment.getTag("name").length > 0) {
			var name = docComment.getTag("name")[0].desc;
			if (name) {					
				JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(name, [], "VIRTUAL", docComment));
				delete ts.tokens[ts.cursor];
				return true;
			}
		}
	}
	return false;
}

JSDOC.Parser.findFunction = function(/**JSDOC.TokenStream*/ts, /**String*/nspace) {
/*debug*///print("~~ JSDOC.Parser.findFunction() "+ts.look());
	
    if (ts.look().is("NAME")) {
		var name = ts.look().data.replace(/\.prototype(\.|$)/g, "#");
		        			
		var doc = "";
		var isa = null;
		var body = "";
		var paramTokens = [];
		var params = [];
		var typeDoc = "";
		var isInner;
		                                                                 
		// like function foo()
		if (ts.look(-1).is("FUNCTION")) {
			if (nspace) {
				name = nspace+"-"+name;
				isInner = true;
			}
			isa = "FUNCTION";
			
			if (ts.look(-2).is("JSDOC")) {
				doc = ts.look(-2).data;
			}
			paramTokens = ts.balance("LEFT_PAREN");
            if (ts.look(1).is("JSDOC")) typeDoc = ts.next();
					
			body = ts.balance("LEFT_CURLY");
		}
		/***
         * give PluginMgr a chance to handle current Token.
         */                        
        //else if (JSDOC.resistor.PluginMgr.onTokenStream(name, ts, 0)) {  
            // do nothing?                                                
        //}
        
		// like foo = function() or var foo = new function()
		else if (
			(ts.look(1).is("ASSIGN") && ts.look(2).is("FUNCTION"))
			||
			(ts.look(1).is("ASSIGN") && ts.look(2).is("NEW") && ts.look(3).is("FUNCTION"))
		) {
			if (nspace) {
				if (ts.look(-1).is("VAR")) isInner = true;
				name = name.replace(/^this[.#]/, (nspace+"#").replace("##", "#"));
			}
			
			isa = (ts.look(2).is("NEW"))? "OBJECT" : "FUNCTION";
			
			if (ts.look(-1).is("JSDOC")) {
				doc = ts.look(-1).data;
			}
			else if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) {
				doc = ts.look(-2).data;
			}
			paramTokens = ts.balance("LEFT_PAREN");
			
            if (ts.look(1).is("JSDOC")) typeDoc = ts.next();

			body = ts.balance("LEFT_CURLY");
			
			// like foo = function(n) {return n}(42)
			if (ts.look(1).is("LEFT_PAREN") ) {
				isa = "OBJECT";
				ts.balance("LEFT_PAREN");
			}
			
			if (isa == "OBJECT") {
				if (doc) { // we only keep these if they're documented
					var docComment = new JSDOC.DocComment(doc);
					if (!/#$/.test(name)) { // assigning to prototype of already existing symbol
						JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(name, [], isa, docComment));
					}
				}

				JSDOC.Parser.onFnBody(
					new JSDOC.TokenStream(body),
					name
				);
				return true;
			}
		}

		if (isa && name) {            
			if (isa == "FUNCTION") {
				params = JSDOC.Parser.onParamList(paramTokens);
			}
			
			var docComment = new JSDOC.DocComment(doc);
			var newSymbol = new JSDOC.Symbol().init(name, params, isa, docComment);
			JSDOC.Parser.symbols.push(newSymbol);
			if (isInner) newSymbol.set("isInner", true);
			if (typeDoc) newSymbol.setType(typeDoc.data);
			
			if (body) {
				JSDOC.Parser.onFnBody(
					new JSDOC.TokenStream(body),
					name
				);
			}
			return true;
		}
	}
	return false;
}

JSDOC.Parser.findVariable = function(/**JSDOC.TokenStream*/ts, /**String*/nspace) {
/*debug*///print("~~ JSDOC.Parser.findVariable() "+ts.look());*/
	                       
    if (ts.look().is("NAME") && ts.look(1).is("ASSIGN")) {
		
		// like foo = 
		var name = ts.look().data;
		if (nspace) name = name.replace(/^this./, nspace+"#");
		isa = "OBJECT";
		var doc;
		if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
		else if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) doc = ts.look(-2).data;
		
		name = name.replace(/\.prototype(\.|$)/, "#");
		
		// like Foo = Class.create(BaseClass,{})
		var nextName = ts.look(2);
		if (nextName.is("NAME") && nextName.data == "Class.create" && ts.look(3).data == "(" && ts.look(4).data != ")") { // skip pre 1.6 type of Class.create() syntax
			if (defined(JSDOC.PluginManager)) {
				var addComment = new JSDOC.Token("", "COMM", "JSDOC");
				JSDOC.PluginManager.run("onPrototypeClassCreate", {"name":name, "comment": doc, "addComment":addComment});
				ts.insertAhead(addComment)
			}
		
		}
        /***
        * @hack query JSDOC.resistor.PluginMgr when any NAME is found.  give all plugins a chace to respond to any entity in teh 
        * stream.  I don't like how the existing JSDOC.PluginManager above has prototype-specific logic.  this is why I created
        * a different plugin manager.
        */         
        //else if (nextName.is("NAME") && JSDOC.resistor.PluginMgr.onTokenStream(nextName.data, ts, 2)) {  
            // do nothing?                                                                    
        //}
        
		else if (doc) { // we only keep these if they're documented
			var docComment = new JSDOC.DocComment(doc);
			var isInner = (nspace && ts.look(-1).is("VAR"));
			
			if (!/#$/.test(name)) { // assigning to prototype of already existing symbol
				JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(name, [], isa, docComment));
				if (isInner) JSDOC.Parser.symbols[JSDOC.Parser.symbols.length-1].isInner = true;
			}
		}
		
		// like foo = {
		if (ts.look(2).is("LEFT_CURLY")) {            
			JSDOC.Parser.onObLiteral(
				new JSDOC.TokenStream(ts.balance("LEFT_CURLY")),
				name
			);
		}
		return true;
	}
	return false;
}

JSDOC.Parser.onObLiteral = function(/**JSDOC.TokenStream*/ts, /**String*/nspace) {
/*debug*///print("~~ JSDOC.Parser.onObLiteral with nspace: "+nspace);
	while (ts.look()) {                        
		if (!ts.look().is("VOID")) {                       
			if (ts.look().is("NAME") && ts.look(1).is("COLON")) {
				var name = nspace+((nspace.charAt(nspace.length-1)=="#")?"":".")+ts.look().data;
				
				// like foo: function
				if (ts.look(2).is("FUNCTION")) {
					var isa = "FUNCTION";
					var doc = "";
					if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
					
					var params = JSDOC.Parser.onParamList(ts.balance("LEFT_PAREN"));
if (ts.look(1).is("JSDOC")) var typeDoc = ts.next();
					var body = ts.balance("LEFT_CURLY");
					
					// like foo: function(n) {return n}(42)
					if (ts.look(1).is("LEFT_PAREN")) {
						isa = "OBJECT";
						ts.balance("LEFT_PAREN");
					}
					var docComment = new JSDOC.DocComment(doc);
					
					var newSymbol = new JSDOC.Symbol().init(name, params, isa, docComment);
					JSDOC.Parser.symbols.push(newSymbol);
					if (typeDoc) newSymbol.setType(typeDoc.data);
					
					JSDOC.Parser.onFnBody(
						new JSDOC.TokenStream(body),
						name
					);
				}
				// like foo: {...}
				else if (ts.look(2).is("LEFT_CURLY")) { // another nested object literal
					if (ts.look(-1).is("JSDOC")) {
						var isa = "OBJECT";
						var doc = ts.look(-1).data;
						var docComment = new JSDOC.DocComment(doc);
						
						JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(name, [], isa, docComment));
					}
					
					JSDOC.Parser.onObLiteral(
						new JSDOC.TokenStream(ts.balance("LEFT_CURLY")),
						name
					);
				}
				else { // like foo: 1, or foo: "one"
					if (ts.look(-1).is("JSDOC")) { // we only grab these if they are documented
						var isa = "OBJECT";
						var doc = ts.look(-1).data;
						var docComment = new JSDOC.DocComment(doc);						
						JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(name, [], isa, docComment));                                                
					}
					
					// skip to end of RH value ignoring values like foo: bar({blah, blah}),
					while (!ts.look().is("COMMA")) {
						if (ts.look().is("LEFT_PAREN")) ts.balance("LEFT_PAREN");
						else if (ts.look().is("LEFT_CURLY")) ts.balance("LEFT_CURLY");
						else if (!ts.next()) break;
					}
				}
			}
		}
		if (!ts.next()) break;
	}
}

JSDOC.Parser.onFnBody = function(/**JSDOC.TokenStream*/ts, /**String*/nspace) {
/*debug*///print(">   ~~ JSDOC.Parser.onFnBody with nspace: "+nspace+" and look = "+ts.look());
	while (ts.look()) {
        
		if (!ts.look().is("VOID")) {
			if (JSDOC.Parser.findDocComment(ts)) {
			}
			else if (JSDOC.Parser.findFunction(ts, nspace)) {
			}
			else if (JSDOC.Parser.findVariable(ts, nspace)) {
			}  
                                             
            else if (ts.look().is("NAME") && typeof(nspace) != 'undefined') {    // <-- hook in JSDOC.resistor.PluginMgr                
                JSDOC.resistor.PluginMgr.onFnBody(ts, nspace);        
            }
		}
		if (!ts.next()) break;
	}
}

JSDOC.Parser.onParamList = function(/**Array*/paramTokens) {
	var params = [];
	for (var i = 0, l = paramTokens.length; i < l; i++) {
		if (paramTokens[i].is("JSDOC")) {
			var paramType = paramTokens[i].data.replace(/(^\/\*\* *| *\*\/$)/g, "");
			
			if (paramTokens[i+1] && paramTokens[i+1].is("NAME")) {
				i++;
				params.push({type: paramType, name: paramTokens[i].data});
			}
		}
		else if (paramTokens[i].is("NAME")) {
			params.push({name: paramTokens[i].data});
		}
	}
	return params;
}
