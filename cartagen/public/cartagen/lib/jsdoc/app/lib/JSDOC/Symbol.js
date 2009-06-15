/** @constructor */
JSDOC.Symbol = function() {
    var properties = {
        _addOn: "",
        _alias: "",
        _augments: [],
        _author: "",
        _classDesc: "",
        _comment: {},
        _deprecated: "",
        _defaultValue: "",  // <-- added by Doug to support @default on @cfg
        _donate: "",
        _example: [],
        _desc: "",
        _events: [],
        _exceptions: [],
        _inherits: [],
        _inheritsFrom: [],
        _isa: "OBJECT",
        _isEvent: false,
        _isCfg: false,    // <-- added by chris to handle @cfg tag.  @cfg is a kind of @property.  handled as event's "isEvent" is to method.
        _isIgnored: false,
        _isInner: false,
        _isNamespace: false,
        _isPrivate: false,
        _isStatic: false,
        _isSingleton: false,
        _isComponent: false,
        _license: "",
        _memberof: "",
        _methods: [],
        _name: "",
        _parentConstructor: "",
        _params: [],
        _properties: [],
        _requires: [],
        _returns: [],
        _see: [],
        _since: "",
        _srcFile: {},
        _type: "",
        _version: ""
    };

    this.init = function(
        /** String */ name,
        /** Object[] */ params,
        /** String */ isa,
        /** JSDOC.DocComment */ comment
    ) {
        this.init.args = arguments;

        this.set("name", name);
        this.set("alias", this.get("name"));
        this.set("params", params);
        this.set("isa", isa);
        this.set("comment", comment);
        this.set("srcFile", JSDOC.Symbol.srcFile);

        // cache some common collections of Symbol.  they're set to null initially to signal not-yet-cached.
        this.cfg = null;
        this.properties = null;
        this.methods = null;
        this.events = null;

        this.processTags();

        if (defined(JSDOC.PluginManager)) {
            JSDOC.PluginManager.run("onSymbol", this);
        }

        return this;
    }

    this.hasProperty = function(propName) {
        return (properties.hasOwnProperty("_"+propName));
    }

    this.get = function(propName) {
        return properties["_"+propName];
    }

    this.set = function(propName, v) {
        if (this.hasProperty(propName)) {
            switch(propName) {
                case "name":
                    v = v.replace(/\.prototype\.?/g, '#');
                    break;
                case "isa":
                    if (JSDOC.Symbol.validKinds.indexOf(v) < 0) {
                        throw "Unknown kind: "+v+" is not in "+Symbol.validKinds+".";
                    }
                case "params":
                    for (var i = 0; i < v.length; i++) {
                        if (v[i].constructor != JSDOC.DocTag) { // may be a generic object parsed from signature, like {type:..., name:...}
                            v[i] = new JSDOC.DocTag("param"+((v[i].type)?" {"+v[i].type+"}":"")+" "+v[i].name);
                        }
                    }
                    break;
            }
            properties["_"+propName] = v;
        }
        //else throw "Property \""+propName+"\" not defined in properties of class ";//+new Reflection(this).getConstructorName()+".";
    }

    this.clone = function() {
        var clone = new this.constructor();
        clone = clone.init.apply(clone, this.init.args);
        // do further cloning here
        clone.srcFile = this.srcFile;

        return clone;
    }

    this.serialize = function() {
        var out = "\n{\n";
        var keys = [];
        for (var p in properties) keys.push(p);
        keys = keys.sort();
        for (var k in keys) {
            out += keys[k].substring(1)+" => "+Dumper.dump(properties[keys[k]])+",\n";
        }

        out += "}\n";

        return out;
    }

    this.processTags = function() {
        // @desc
        var descs = this.get("comment").getTag("desc");
        if (descs.length) {
            this.set("desc", descs.map(function($){return $.desc;}).join("\n")); // multiple descriptions are concatenated into one
        }

        // @since
        var sinces = this.get("comment").getTag("since");
        if (sinces.length) {
            this.set("since", sinces.map(function($){return $.desc;}).join(", "));
        }

        // @version
        var versions = this.get("comment").getTag("version");
        if (versions.length) {
            this.set("version", versions.map(function($){return $.desc;}).join(", "));
        }

        // @author
        var authors = this.get("comment").getTag("author");
        if (authors.length) {
            this.set("author", authors.map(function($){return $.desc;}).join(", "));
        }

        // @license
        var licenses = this.get("comment").getTag("license");
        if (licenses.length) {
            this.set("license", licenses.map(function($){return $.desc;}).join(", "));
        }

        // @deprecated
        var deprecateds = this.get("comment").getTag("deprecated");
        if (deprecateds.length) {
            this.set("deprecated", deprecateds.map(function($){return $.desc;}).join("\n"));
        }

        // @example
        var examples = this.get("comment").getTag("example");
        if (examples.length) {
                var thisExamples = this.get("example");
                examples.map(function($){thisExamples.push({example:$.desc.replace(/\s+$/, "")});});
        }

        // @donate
        var donates = this.get("comment").getTag("donate");
        if (donates.length) {
            this.set("donate", donates[0].desc);
        }

        // @see
        var sees = this.get("comment").getTag("see");
        if (sees.length) {
            var thisSee = this.get("see");
            sees.map(function($){thisSee.push($.desc);});
        }

        // @class
        var classes = this.get("comment").getTag("class");
        if (classes.length) {
            this.set("isa", "CONSTRUCTOR");
            this.set("classDesc", classes[0].desc); // desc can't apply to the constructor as there is none.

        }

        // @namespace
        var namespaces = this.get("comment").getTag("namespace");
        if (namespaces.length) {
            this.set("classDesc", namespaces[0].desc+"\n"+this.get("desc")); // desc can't apply to the constructor as there is none.
            this.set("isa", "CONSTRUCTOR");
            this.set("isNamespace", true);
        }

        // @param
        var params = this.get("comment").getTag("param");
        if (params.length) {
            // user-defined params overwrite those with same name defined by the parser
            var thisParams = this.get("params");
            if (thisParams.length == 0) { // none exist yet, so just bung all these user-defined params straight in
                this.set("params", params);
            }
            else { // need to overlay these user-defined params on to existing parser-defined params
                for (var i = 0, l = params.length; i < l; i++) {
                    if (thisParams[i]) {
                        if (params[i].type) thisParams[i].type = params[i].type;
                        thisParams[i].name = params[i].name;
                        thisParams[i].desc = params[i].desc;
                        thisParams[i].isOptional = params[i].isOptional;
                        thisParams[i].defaultValue = params[i].defaultValue;
                    }
                    else thisParams[i] = params[i];
                }
            }
        }

        // @constructor
        var constructors = this.get("comment").getTag("constructor");
        if (constructors.length) {
            this.set("isa", "CONSTRUCTOR");
        }

        // @static
        var statics = this.get("comment").getTag("static");
        if (statics.length) {
            this.set("isStatic", true);
        }

        // @singleton
        var singleton = this.get("comment").getTag("singleton");
        if (singleton.length) {
            this.set("isSingleton", true);
        }

        // @component
        var component = this.get("comment").getTag("component");
        if (component.length) {
            this.set("isComponent", true);
        }

        // @function
        var functions = this.get("comment").getTag("function");
        if (functions.length) {
            this.set("isa", "FUNCTION");
        }

        // @event
        var events = this.get("comment").getTag("event");
        if (events.length) {
            this.set("isa", "FUNCTION");
            this.set("isEvent", true);
        }

        // @name
        var names = this.get("comment").getTag("name");
        if (names.length) {
            this.set("name", names[0].desc);
        }

        // @property
        var properties = this.get("comment").getTag("property");
        if (properties.length) {
            thisProperties = this.get("properties");
            for (var i = 0; i < properties.length; i++) {
                var thisAlias = this.get("alias");
                var joiner = ".";
                if (thisAlias.charAt(thisAlias.length-1) == "#" || properties[i].name.charAt(0) == "#") {
                    joiner = "";
                }
                properties[i].alias = this.alias + joiner + properties[i].name;
                thisProperties.push(properties[i]);
            }
        }

        // @cfg, by chris.
        var cfg = this.get("comment").getTag("cfg");
        if (cfg.length) {
            this.set('isCfg', true);
        }

        // @return
        var returns = this.get("comment").getTag("return");
        if (returns.length) { // there can be many return tags in a single doclet
            this.set("returns", returns);
            this.set("type", returns.map(function($){return $.type}).join(" ,"));
        }

        // @exception
        var exceptions = this.get("comment").getTag("throws");
        if (exceptions.length) {
            this.set("exceptions", exceptions);
        }

        // @requires
        var requires = this.get("comment").getTag("requires");
        if (requires.length) {
            this.set("requires", requires);
        }

        // @type
        var types = this.get("comment").getTag("type");
        if (types.length) {
            this.set("type", types[0].desc); // multiple type tags are ignored
        }

        // @private
        var privates = this.get("comment").getTag("private");
        if (privates.length) {
            this.set("isPrivate", true);
        }

        // @ignore
        var ignores = this.get("comment").getTag("ignore");
        if (ignores.length) {
            this.set("isIgnored", true);
        }

        // @inherits ... as ...
        var inherits = this.get("comment").getTag("inherits");
        if (inherits.length) {
            for (var i = 0; i < inherits.length; i++) {
                if (/^\s*([a-z$0-9_.#]+)(?:\s+as\s+([a-z$0-9_.#]+))?/i.test(inherits[i].desc)) {
                    var inAlias = RegExp.$1;
                    var inAs = RegExp.$2 || inAlias;

                    if (inAlias) inAlias = inAlias.replace(/\.prototype\.?/g, "#");

                    if (inAs) {
                        inAs = inAs.replace(/\.prototype\.?/g, "#");
                        inAs = inAs.replace(/^this\.?/, "#");
                    }
                    if (inAs.indexOf(inAlias) != 0) { //not a full namepath
                        var joiner = ".";
                        if (this.get("alias").charAt(this.get("alias").length-1) == "#" || inAs.charAt(0) == "#") {
                            joiner = "";
                        }
                        inAs = this.get("alias") + joiner + inAs;
                    }
                }

                this.get("inherits").push({alias: inAlias, as: inAs});
            }
        }

        // @augments
        var augments = this.get("comment").getTag("augments");
        if (augments.length) {
            this.set("augments", augments);
        }

        // @default
        var defaults = this.get("comment").getTag("default");
        if (defaults.length) {
            //if(this.is("OBJECT")) {
                this.set("defaultValue", this.defaultValue = defaults[0].desc);

            //}
        }

        // @memberOf
        var memberofs = this.get("comment").getTag("memberof");
        if (memberofs.length) {
            this.set("memberof", memberofs[0].desc);
        }
    }
}

JSDOC.Symbol.validKinds = ["CONSTRUCTOR", "FILE", "VIRTUAL", "FUNCTION", "OBJECT", "VOID"];

JSDOC.Symbol.prototype.is = function(what) {
    return this.get("isa") === what;
}

JSDOC.Symbol.prototype.isBuiltin = function() {
    return JSDOC.Lang.isBuiltin(this.get("alias"));
}


JSDOC.Symbol.prototype.isNamespace = function() {
    return this.get("isNamespace");
}

JSDOC.Symbol.prototype.hasTag = function(tagTitle) {
    for (var i = 0, l = this.get("comment").tags.length; i < l; i++) {
        if (this.get("comment").tags[i].title == tagTitle)
            return true;
    }
    return false;
}

JSDOC.Symbol.prototype.setType = function(/**String*/comment, /**Boolean*/overwrite) {
    if (!overwrite && this.get("type")) return;
    var typeComment = JSDOC.DocComment.unwrapComment(comment);
    this.set("type",  typeComment);
}


//TODO why make distinction between properties and methods?
JSDOC.Symbol.prototype.inherit = function(symbol) {
    if (!this.hasMember(symbol.get("name")) && !symbol.get("isInner")) {
        if (symbol.is("FUNCTION"))
            this.get("methods").push(symbol);
        else if (symbol.is("OBJECT"))
            this.get("properties").push(symbol);
    }
}

JSDOC.Symbol.prototype.makeMemberOf = function(alias) {
    alias = alias.replace(/\.prototype(\.|$)/g, "#");
    var thisAlias = this.get("alias");

    var joiner = ".";
    if (alias.charAt(alias.length-1) == "#" || thisAlias.charAt(0) == "#") {
        joiner = "";
    }
    this.set("alias", alias + joiner + thisAlias);
}

JSDOC.Symbol.prototype.hasMember = function(name) {
    return (this.hasMethod(name) || this.hasProperty(name));
}

JSDOC.Symbol.prototype.hasMethod = function(name) {
    var thisMethods = this.get("methods");
    for (var i = 0, l = thisMethods.length; i < l; i++) {
        if (thisMethods[i].get("name") == name) return true;
        if (thisMethods[i].get("alias") == name) return true;
    }
    return false;
}

JSDOC.Symbol.prototype.addMethod = function(symbol) {
    var methodAlias = symbol.get("alias");
    var thisMethods = this.get("methods");
    for (var i = 0, l = thisMethods.length; i < l; i++) {
        if (thisMethods[i].get("alias") == methodAlias) {
            thisMethods[i] = symbol; // overwriting previous method
            return;
        }
    }
    thisMethods.push(symbol); // new method with this alias
}

JSDOC.Symbol.prototype.hasProperty = function(name) {
    var thisProperties = this.get("properties");
    for (var i = 0, l = thisProperties.length; i < l; i++) {
        if (thisProperties[i].get("name") == name) return true;
        if (thisProperties[i].get("alias") == name) return true;
    }
    return false;
}

JSDOC.Symbol.prototype.addProperty = function(symbol) {
    var propertyAlias = symbol.get("alias");
    var thisProperties = this.get("properties");
    for (var i = 0, l = thisProperties.length; i < l; i++) {
        if (thisProperties[i].get("alias") == propertyAlias) {
            thisProperties[i] = symbol; // overwriting previous property
            return;
        }
    }
    thisProperties.push(symbol); // new property with this alias
}

/* @see re-written below
JSDOC.Symbol.prototype.getMethods = function() {
    return this.get("methods");
}

JSDOC.Symbol.prototype.getProperties = function() {
    return this.get("properties");
}
*/

/***
 * getCfg
 * get this Symbol's associated @cfg params
 * @author Chris Scott
 * @return {Array} the array of config params
 */
JSDOC.Symbol.prototype.getCfg = function() {
    if (this.cfg === null) {
        this.cfg = this.get('properties').filter(function($){
            return $.get('isCfg') == true
        }).sort(JSDOC.template.Util.makeSortby("name"));
    }
    return this.cfg;
};

/***
 * hasCfg
 * does this Symbol have any @cfg params?
 * @author Chris Scott
 * @return {Boolean}
 */
JSDOC.Symbol.prototype.hasCfg = function() { return (this.getCfg().length > 0) ? true : false; };

/***
 * getProperties
 * get this Symbol's associated @property params
 * @author Chris Scott
 * @return {Array} the array of properties
 */
JSDOC.Symbol.prototype.getProperties = function(){
    if (this.properties === null) {
        this.properties = this.get("properties").filter(function($){
            return $.get("isCfg") == false
        }).sort(JSDOC.template.Util.makeSortby("name"));
    }
    return this.properties;
}

/***
 * hasProperties
 * does this Symbol have any @property params?
 * @author Chris Scott
 * @return {Boolean}
 */
JSDOC.Symbol.prototype.hasProperties = function() { return (this.getProperties().length > 0) ? true : false; };

/***
 * getMethods
 * return this Symbols's methods.  if they don't exist in local cache, query the Symbol for them.
 * @author Chris Scott
 * @return {Array} the methods
 */
JSDOC.Symbol.prototype.getMethods = function(){
    if (this.methods === null) {
        this.methods = this.get('methods').filter(function($){
            return $.get('isEvent') == false
        }).sort(JSDOC.template.Util.makeSortby("name"));
    }
    return this.methods;
};

/***
 * hasMethods
 * does this Symbol have any methods?
 * @author Chris Scott
 * @return {Boolean}
 */
JSDOC.Symbol.prototype.hasMethods = function() { return (this.getMethods().length > 0) ? true : false; };

/***
 * getEvents
 * get this Symbol's associated @events
 * @author Chris Scott
 * @return {Array} the array of Symbols
 */
JSDOC.Symbol.prototype.getEvents = function(){
    if (this.events === null) {
        this.events = this.get('methods').filter(function($){
            return $.get('isEvent') == true
        }).sort(JSDOC.template.Util.makeSortby("name"));
    }
    return this.events;
};

/***
 * getAugments
 * get this Symbol's associated augments (@extends, @base)
 * @author Doug Hendricks
 * @return {Array} the array of augments hash (for template)
 */
JSDOC.Symbol.prototype.getAugments = function(){
    this.augments || (this.augments = this.get('augments').map(function($){return {name:$}; }));
    return this.augments;
};

/***
 * hasEvents
 * does this Symbol have any events?
 * @author Chris Scott
 * @return {Boolean}
 */
JSDOC.Symbol.prototype.hasEvents = function() { return ( this.getEvents().length > 0) ? true : false; };

JSDOC.Symbol.setShortcuts = function(shortcuts) {
    JSDOC.Symbol.shortcuts = eval("JSDOC.Symbol.shortcuts = "+shortcuts);
}

JSDOC.Symbol.shortcuts = {}; // holds map of shortcut names to full names
JSDOC.Symbol.srcFile = ""; // running reference to the current file being parsed



JSDOC.Symbol.dox = {
    "desc": "This is an example.",
    "isa": "constructor",
    "private": true
}