/***
 * @overview ext2 and resistor initialization
 * includes some core Ext2 libs along with a new Plugin Manager.
 */

// include ext-2.0 lib
// create some dummy objects to satisfy Ext.js
var navigator = {
    userAgent : 'linux'
};
var document = {
    compatMode: '',
    location: {
        href: 'localhost'
    }
};
var window = {
    document: document,
    location: document.location
};

// include core Ext libs.
IO.include("../" + pathToExtJS + "/source/core/Ext.js");
IO.include("../" + pathToExtJS + "/source/util/Format.js");
Ext.DomHelper = {};
IO.include("../" + pathToExtJS + "/source/core/Template.js");
IO.include("../" + pathToExtJS + "/source/util/XTemplate.js");
IO.include("../" + pathToExtJS + "/source/util/JSON.js");
IO.include("../" + pathToExtJS + "/source/util/Observable.js");

/***
 * @namespace JSDOC.resistor
 */
JSDOC.resistor = {};

// includes a new Ext-based Plugin manager.  This plugin Manager is implemented into
// JSDOC's lib/Parser.js.  a bit hackish, but not too bad.
IO.include("lib/JSDOC/resistor/PluginMgr.js");


