/**
	This is the main container for the entire application.
	@namespace
*/
JSDOC = {
};

/** The current version string of this application. */
JSDOC.VERSION = "ext-0.4";

JSDOC.usage = function() {
	print("USAGE: java -jar jsrun.jar app/main.js [OPTIONS] <SRC_DIR> <SRC_FILE> ...");
	print("");
	print("OPTIONS:");
	print("  -a or --allfunctions\n          Include all functions, even undocumented ones.\n");
	print("  -A or --Allfunctions\n          Include all functions, even undocumented, underscored ones.\n");
	print("  -H=<Headline> or --Headline=<Headline>\n          Headline / Title of Documentation.\n");
	print("  -d=<PATH> or --directory=<PATH>\n          Output to this directory (defaults to \"out\").\n");
	print("  -D=\"myVar:My value\" or --define=\"myVar:My value\"\n          Multiple. Define a variable, available in JsDoc as JSDOC.opt.D.myVar\n");
	print("  -e=<ENCODING> or --encoding=<ENCODING>\n          Use this encoding to read and write files.\n");
	print("  -h or --help\n          Show this message and exit.\n");
	print("  -o=<PATH> or --out=<PATH>\n          Print log messages to a file (defaults to stdout).\n");
	print("  -p or --private\n          Include symbols tagged as private and inner symbols.\n");
	print("  -r=<DEPTH> or --recurse=<DEPTH>\n          Descend into src directories.\n");
	//print("  -t=<PATH> or --template=<PATH>\n          Required. Use this template to format the output.\n");
	print("  -T or --test\n          Run all unit tests and exit.\n");
	print("  -x=<EXT>[,EXT]... or --ext=<EXT>[,EXT]...\n          Scan source files with the given extension/s (defaults to js).\n");
	
	java.lang.System.exit(0);
}

IO.includeDir("lib/JSDOC/");

// include template resources (JSDOC.template.Util)
IO.include("../templates/util.js");

// include new resistor lib (christocracy)
IO.include("lib/JSDOC/resistor/init.js");

