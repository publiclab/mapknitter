JSDOC.PluginManager.registerPlugin(
	"JSDOC.tagShortcuts",
	{
		onSymbol: function(symbol) {			
			for (var n in JSDOC.Symbol.shortcuts) {
				var pat = RegExp.escapeMeta(n);
				var re = new RegExp("^"+pat+"\\b");
				if (re.test(symbol.get("alias"))) {
					symbol.set("alias", symbol.get("alias").replace(re, JSDOC.Symbol.shortcuts[n]));
					symbol.set("name", symbol.get("alias"));
					return;
				}
			}
		}
	}
);