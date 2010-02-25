/***
 * @overview template-parsing resources
 * @namespace JSDOC.template
 * @desc A collection of handy utilities for use in all templates.  I found most of these methods in the jsdoc template's publsh.js
 * @author Chris Scott
 */
JSDOC.template = {};


/**
 * @class JSDOC.template.Util
 * @singleton
 * A collection of template functions.  these methods can be included into an Ext.XTemplate constructor like so:
 * var tpl = new Ext.Template('<p>{[this.summarize(values.get("alias"))]}</p>'), JSDOC.template.Util);
 *
 */
JSDOC.template.Util = function(){

    // cache for some common collections of Symbol.  set to null initially to signal that not yet cached.
    var properties = null;
    var events = null;
    var methods = null;
    var cfg = null;

    return {

        /***
         * getClassName
         * if alias == "Foo.util.Bar", returned className will be "Bar"
         * @param {String} v
         * @return (String)
         */
        getClassName : function(v) {
            return v.split('.').pop();
        },

        /***
         * getPackageName
         * if classname == 'Foo.util.Bar', package name will be Foo.util
         * @param {String} class/alias
         * @return {String}
         */
        getPackageName : function(v) {
            var path = v.split('.');
            path.pop();
            return path.join('.');
        },

        /***
         * isInherited
         * is this member inherited from another class?
         * @param {JSDOC.Symbol} subject the one being compared
         * @param {JSDOC.Symbol} [from] the one being compared *to*
         */
        isInherited : function(subject, from) {
            from = (typeof(from) != 'undefined') ? from : subject;
            return (subject.get("memberof") != from.get("alias")) ? true : false;
        },

        /** Just the first sentence. */
        summarize : function(desc) {
            if (typeof desc != "undefined")
                return desc.match(/([\w\W]+?\.)[^a-z0-9]/i) ? RegExp.$1 : desc;
        },

        /** make a symbol sorter by some attribute */
        makeSortby : function(attribute){
            return function(a, b){
                if (a.get(attribute) != undefined && b.get(attribute) != undefined) {
                    a = a.get(attribute).toLowerCase();
                    b = b.get(attribute).toLowerCase();
                    if (a < b)
                        return -1;
                    if (a > b)
                        return 1;
                    return 0;
                }
            }
        },

        include : function(path){
            var path = publish.conf.templatesDir + "jsdoc/" + path;
            return IO.readFile(path);
        },

        makeSrcFile : function(path, srcDir, name){
            if (!name)
                name = path.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");

            var src = {
                path: path,
                name: name,
                hilited: ""
            };

            if (defined(JSDOC.PluginManager)) {
                JSDOC.PluginManager.run("onPublishSrc", src);
            }

            if (src.hilited) {
                IO.saveFile(srcDir, name + publish.conf.ext, src.hilited);
            }
        },

        makeSignature : function(params){
            if (!params)
                return "()";
            var signature = "(" +
            params.filter(function($){
                return $.name.indexOf(".") == -1; // don't show config params in signature
            }).map(function($){
                return (($.type) ? "<span class=\"light\">" + (new Link().toSymbol($.type)) + " </span>" : "") +
                $.name;
            }).join(", ") +
            ")";
            return signature;
        },

        /** Find symbol {@link ...} strings in text and turn into html links */
        resolveLinks : function(str, from){
            str = str.replace(/\{@link ([^} ]+?)\s*\}/gi, function(match, symbolName){
                return new Link().toSymbol(symbolName);
            });

            return str;
        },

        truncate : function(str){
            str = str.replace(/<(\S+)(?:\s[\s\S]*?)?>([\s\S]*?)<\/\1>/g, '$2');
            str = str.replace(/([\s\S]{1,120})([\s\S]*)/, '$1...');

            return str;
        },
		
		insertSpace: function(number){
			var result='';
			for (var t = 0; t < number; t++) { result = result +' '; };
			return result;
		}

    }
}();

/**
 * @class JSDOC.template.Link
 * A class for creating different kinds of links on a doc.
 */
JSDOC.template.Link = function() {
    // constructor
};
JSDOC.template.Link.prototype = {

    alias : '',
    src : '',
    file : '',
    text: '',
    targetName : '',

    /**
     * clear
     * @param {} targetName
     * @return {}
     */
    clear : function() {
        this.alias = '';
        this.src = '';
        this.file = '';
        this.text = '';
        this.targetName = '';
    },

    /***
     * target
     * @param {String} targetName
     * @return {Object} this
     */
    target : function(targetName){
        if (defined(targetName)) {
            this.clear();
            this.targetName = targetName;
        }

        return this;
    },

    /***
     * withText
     * @param {String} text
     */
    withText : function(text){
        if (defined(text)) {
            this.clear();
            this.text = text;
        }

        return this;
    },

    /***
     * toSrc
     * @param {String} filename
     * @return {Object} this
     */
    toSrc : function(filename){
        if (defined(filename)) {
            this.clear();
            this.src = filename;
        }

        return this;
    },

    /***
     * toSymbol
     * @param {String} alias
     * @return {Object} this
     */
    toSymbol : function(alias){
        if (defined(alias)) {
            this.clear();
            this.alias = new String(alias);
        }

        return this;
    },

    /***
     * toFile
     * @param {String} file
     * @return {Object} this
     */
    toFile : function(file){
        if (defined(file)) {
            this.clear();
            this.file = file;
        }

        return this;
    },

    /***
     * toFileInRepo
     * @param {String} filename
     * @return {Object} this
     */
    toFileInRepo : function(classname){
        if (defined(classname)) {
            this.clear();
            this.file = '/' + ['repo','trunk'].concat(classname.split('.')).join('/') + '.js';

        }

        return this;
    },

    /***
     * toFileInRepo
     * @param {String} filename
     * @return {Object} this
     */
     toParsedFileInRepo : function(url){
        if (defined(url)) {
            this.clear();
            this.file = 'http://code.google.com/p/cartagen/source/browse/trunk/cartagen/public/cartagen/src/' + url.slice(10);

        }

        return this;
    },

    /***
     * toString
     * @param {Boolean} asHtml return html [true] set false to return just href
     */
    toString : function(asHtml, rawHref){
        asHtml = (typeof(asHtml) != 'undefined') ? asHtml : true;

        var linkString;
        var thisLink = this;

        if (this.alias) {
            linkString = this.alias.replace(/(?:^|[^a-z$0-9_])(#[a-z$0-9_#-.]+|[a-z$0-9_#-.]+)\b/gi, function(match, symbolName){
                return thisLink._makeSymbolLink(symbolName, asHtml);
            });
        }
        else
            if (this.src) {
                linkString = thisLink._makeSrcLink(this.src, asHtml);
            }
            else
                if (this.file) {
                    linkString = thisLink._makeFileLink(this.file, asHtml, rawHref);
                }
        return linkString;
    },

    /***
     * symbolNameToLinkName
     * @param {String} symbol
     * @return {String}
     */
    symbolNameToLinkName : function(symbol){
        var linker = "";
        if (symbol.get('isStatic'))
            linker = ".";
        else
            if (symbol.get('isInner'))
                linker = "-";

        return linker + symbol.get("name");
    },

    /**
     * _makeSymbolLink
     * create a link to another symbol
     * @private
     * @param {Object} alias
     * @param {Boolean} asHtml [true] set false to return just href
     */
    _makeSymbolLink : function(alias, asHtml){
        var linkBase = JSDOC.template.Link.base;
        var linkTo;
        var linkPath;
        var target = (this.targetName) ? " target=\"" + this.targetName + "\"" : "";
        var member = "";
        var classname = "";

        // is it an interfile link?
        if (alias.charAt(0) == "#") {
            var linkPath = alias;
//          member = "ext:member='" + alias.replace(/^#/,'') + "'";
            this.text = alias.split('-')[1];
            classname = "class='inner-link'";
        }
        // if there is no symbol by that name just return the name unaltered
        else
            if (!(linkTo = JSDOC.template.symbolGroup.getSymbol(alias)))
                return alias;
            // it's a symbol in another file
            else {
                classname = "ext:cls='" + alias + "'";

                linkPath = escape(linkTo.get('alias')) + JSDOC.template.ext;
                if (!linkTo.is("CONSTRUCTOR")) { // it's a method or property
                    linkPath = escape(linkTo.get('parentConstructor')) || "_global_";
                    linkPath += publish.conf.ext + "#" + this.symbolNameToLinkName(linkTo);
                }
                linkPath = linkBase + linkPath
            }

        if (!this.text)
            this.text = alias;
        return (asHtml === true) ? "<a href='" + linkPath + "' " + target + " " + member + " " + classname + ">" + this.text + "</a>" : linkPath;
    },

    /**
     * _makeSrcLink
     * Create a link to a source file.
     * @private
     * @param {Object} srcFilePath
     * @param {Boolean} asHtml [true] set false to return just href
     */
    _makeSrcLink : function(srcFilePath, asHtml){
        var target = (this.targetName) ? " target=\"" + this.targetName + "\"" : "";

        // transform filepath into a filename
        var srcFile = srcFilePath.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");
        var outFilePath = publish.conf.srcDir + srcFile + publish.conf.ext;

        if (!this.text)
            this.text = JSDOC.Util.fileName(srcFilePath);
        return (asHtml === true) ? "<a href=\"" + outFilePath + "\"" + target + ">" + this.text + "</a>" : outFilePath;
    },

    /**
     * Create a link to a source file.
     * @private
     * @param {Object} filePath
     * @param {Boolean} asHtml [true] set false to return just href
     */
    _makeFileLink : function(filePath, asHtml, rawHref){
        var target = (this.targetName) ? " target=\"" + this.targetName + "\"" : "";

        var outFilePath = (rawHref ? "" : JSDOC.template.Link.base) + filePath;

        if (!this.text)
            this.text = filePath;
        return (asHtml === true) ? "<a href=\"" + outFilePath + "\"" + target + ">" + this.text + "</a>" : outFilePath;
    }
};

/** Appended to the front of relative link paths. */
JSDOC.template.Link.base = "";

Link = JSDOC.template.Link;

/** chris: I saw a ref to this in publish.js.  not sure what it's for */
JSDOC.template.symbolGroup = null;

/** From prototype.js */
String.prototype.camelize = function() {
	var parts = this.split('_'), len = parts.length;
	if (len == 1) parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
	
	var camelized = parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
	
	for (var i = 1; i < len; i++)
	  camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
	
	return camelized;
}
