print ('Plugin Ext installed');

/***
 * @class JSDOC.plugins.Ext
 * @param {String} name
 */
JSDOC.plugins.Ext = Ext.extend(JSDOC.plugins.Base, {
    
    /***
     * initPlugin
     * called automatically by JSDOC.plugins.Base.  EVERY plugin MUST implement this method.  
     * returns a hash of events that you want your plugin to listen-to.  Note how events are sub-categorized.
     * @return {Object}
     */    
    initPlugin : function() {
       return {     
            fnbody : {
                // Ext-specific method for adding events to a class.  we need to document these
                'this.addEvents' : this.onAddEvents,
                'Ext.applyIf' : this.onApplyIf
            },
            tokens : {
                // Ext inheritance
                'Ext.extend' : this.onExtend,              
                            
                // Ext inheritance
                'Ext.override' : this.onOverride   
            },                                     
            comments: {                
                // for handling std JSDOC event onDocCommentSrc
                'commentsrc' : this.onCommentSrc,
            
                // for handling std JSDOC event onDocCommentTag                 
                'commenttags' : this.onCommentTags
            }                               
        };          
    },
    
    /***
     * onApplyIf
     * Ext.applyIf({
     *     ***
     *     * @cfg onfoo
     *     * @param {Object} this
     *     *         
     * });
     * @param {Object} param
     */
    onApplyIf : function(param) {
//        print ("---- Ext plugin found this.onApplyIf " + param.nspace);   

        var object = param.nspace.split('#').shift();
        
//        print ('object : ' + object);
        
        // create a new Stream and hunt for @event comments.                        
        var block = new JSDOC.TokenStream(param.ts.balance("LEFT_PAREN"));
        
        while (block.look()) {
            if (!block.look().is("VOID") && block.look().is("JSDOC")) {                                             
                // we need to discover the scope of this event and add a @scope tag to this comment.
                // after doing so, we'll create a new Symbol.                
                var comment = new JSDOC.DocComment(block.look().data);                                                
                var ename = comment.tags[0].name;
                print('property: ' + ename);
                if(ename == null || ename.length == 0) {
                    ename = comment.tags[0].name;
                    print('property 2: ' + ename);
                }
                if(ename != null && ename.length > 0) {
                    var event = new JSDOC.Symbol().init(object + "#" + ename, [], "OBJECT", comment);
                    
                    JSDOC.Parser.symbols.push(event);
                }
                
            }
            if (!block.next()) break;
        }                            
    },
    
    /***
     * onAddEvents
     * this.addEvents({
     *     ***
     *     * @event onfoo
     *     * @param {Object} this
     *     *         
     * });
     * @param {Object} param
     */
    onAddEvents : function(param) {
//        print ("---- Ext plugin found this.addEvents " + param.nspace);   

    	var object = param.nspace.split('#').shift();
        
//        print ('object : ' + object);
        
        // create a new Stream and hunt for @event comments.                        
        var block = new JSDOC.TokenStream(param.ts.balance("LEFT_PAREN"));
        
        while (block.look()) {
            if (!block.look().is("VOID") && block.look().is("JSDOC")) {               		                        
                // we need to discover the scope of this event and add a @scope tag to this comment.
                // after doing so, we'll create a new Symbol.                
                var comment = new JSDOC.DocComment(block.look().data);                                                
                var ename = comment.getTag('event').toString().split("\n").shift();                                                                                                                                              
                var event = new JSDOC.Symbol().init(object + "#" + ename, [], "FUNCTION", comment);
                
                JSDOC.Parser.symbols.push(event);
            }
            if (!block.next()) break;
        }                            
        
         
    },
    
    /***
     * onCommentSrc
     * @param {Object} param
     */        
    onCommentSrc : function(param) {
        //print ('Ext::onCommentSrc ');
    },
    
    /***
     * onCommentTags
     * @param {Object} param
     */
    onCommentTags : function(param) {
        var firstTag = param.tags[0];
		if (firstTag) {
			if(firstTag.title == 'cfg' || firstTag.title.indexOf('property') == 0) {
	            //print(firstTag.title);
	        } else {
	            return;
	        }
	        var map = ["type", "desc"];
	        for(var i=0; i < map.length; i++) {
	            if(!param.tags[map[i]]) {
	                var docTag = new JSDOC.DocTag();
	                docTag.title = map[i];
	                docTag.desc = firstTag[docTag.title];
	                param.tags.push(docTag);
	            }
	        }
		}
    },
    
    /***
     * onSymbol
     * @param {Object} symbol
     */
    onSymbol: function(symbol) {
        //print ('Ext::onSymbol');                    
    },
    
    /***
     * onSymbol
     * @param {Object} param
     */
    onOverride : function(param) {
        //print ('Ext::onOverride ' + param);
    },
    
    /***
     * onExtend
     * @param {Object} param
     */
    onExtend : function(param) {
        var ts = param.ts;
        var x = param.x;
        
        //print ('Ext::onExtend ' + param.name);
        //print ('look-1: ' + ts.look(x).data);
        
        //print(ts.look(-2));
        var doc = '';
        if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
		else if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) doc = ts.look(-2).data;
	    else if (ts.look(-3).is("JSDOC")) doc = JSDOC.DocComment.unwrapComment(ts.look(-3).data);
		
        // case 1: Foo = Ext.extend(Bar, {});                                
        if (ts.look(x-1).is("ASSIGN") && ts.look(x+1).data == '(') {
            
            extClass = ts.look(x-2).data;                    
            extSuper = ts.look(x+2).data;
            
            //print ("--- found case 1: class: " + extClass + ', super: ' + extSuper);
            
        }
        // case 2: Ext.extend(Foo, Bar, {});     
        else {
            extClass = ts.look(x+2).data;
            extSuper = ts.look(x+4).data;
            
            //print ("--- found case 2: class: " + extClass + ', super: ' + extSuper);
                         
        }
        
        var pkg = extClass.split('.');
        var alias = pkg.pop(); 
            
        //var insert = doc+"/**\n"; 
        var insert = doc; 
        if (!insert.match(/@package/)) {                                       
            insert += "@package " + pkg.join('.') + "\n";
        }                  
        if (!insert.match(/@class/)) {                    
            insert += "@class " + extClass + "\n";
        }     
        if (!insert.match(/@alias/)) {
            insert += "@alias " + extClass + "\n";
        }                           
        if (!insert.match(/@constructor/)) {
            insert += "@constructor\n";
        }
        if (!insert.match(/@extends/)) {
            insert += "@augments " + extSuper + "\n";                    
        }  
        if (!insert.match(/@scope/)) {
            insert += "@scope " + extClass + ".prototype\n";
        }
        //insert += '*/';    			
		insert = insert.replace(/\*\/\/\*\*/g, "\n");
		try {
	       token.data = insert;
		} catch(e) {
			
		}
        
        var c = new JSDOC.Token("", "COMM", "JSDOC");
	    c.data = insert;
		ts.insertAhead(c);    //<-- this insertAhead is still a bit mysterious to me. 
                                                                               
        // pop off initially created Symbol so we can create a new one.  not sure how hackish this is but it works.
        original = JSDOC.Parser.symbols.pop();
        //if the @class definition and extend definition are divided, sometimes last symbol is removing unnecesery (last event loosing)
        if (original && (original.get('isa') != 'CONSTRUCTOR')) {
        	JSDOC.Parser.symbols.push(original);
        }
                                        
        // push new symbol
        JSDOC.Parser.symbols.push(new JSDOC.Symbol().init(extClass, [], "CONSTRUCTOR", new JSDOC.DocComment(insert)));                                                                                           
    }       
});

/***
 * instantiate Ext plugin.  
 *  plugins automatically register themselves with JSDOC.resistor.PluginMgr
 */
new JSDOC.plugins.Ext('ext');

