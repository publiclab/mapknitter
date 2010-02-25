// path to ExtJS, relative to jsdoc-toolkit-ext
var pathToExtJS = 'templates/ext/lib';

var argj = arguments.pop();
var thisScript;
if (argj.match(/^-j=(.+)/)) thisScript = RegExp.$1;
else {
	print("run with JsRun.");
	quit();
}

try { importClass(java.lang.System); }
catch (e) { throw "RuntimeException: The class java.lang.System is required to run this script."; }

/** @namespace */
SYS = {
	os: [
		System.getProperty("os.name"),
		System.getProperty("os.arch"),
		System.getProperty("os.version")
	],
	
	slash: System.getProperty("file.separator")||"/",
	userDir: System.getProperty("user.dir"),
	javaHome: System.getProperty("java.home"),
	
	pwd: function() {
		if (SYS._pwd) return SYS._pwd;
		
		var fname = thisScript;
		var absPath = SYS.userDir+SYS.slash+fname;
		
		var thisDir = new FilePath(absPath);
		thisDir.toDir();

		return SYS._pwd = thisDir;
	}
}

// shortcuts
var File = Packages.java.io.File;
//var FileWriter = Packages.java.io.FileWriter;

/** @class */
function FilePath(absPath) {
	this.root = FilePath.separator;
	this.path = [];
	this.file = "";
	
	var parts = absPath.split(/[\\\/]/);
	if (parts) {
		if (parts.length) this.root = parts.shift() + FilePath.separator;
		if (parts.length) this.file =  parts.pop()
		if (parts.length) this.path = parts;
	}
	
	this.path = this.resolvePath();
}
FilePath.separator = SYS.slash;
FilePath.prototype.resolvePath = function() {
	var resolvedPath = [];
	for (var i = 0; i < this.path.length; i++) {
		if (this.path[i] == "..") resolvedPath.pop();
		else if (this.path[i] != ".") resolvedPath.push(this.path[i]);
	}
	return resolvedPath;
}
FilePath.prototype.toDir = function(n) {
	if (this.file) this.file = "";
}
FilePath.prototype.upDir = function(n) {
	this.toDir();
	if (this.path.length) this.path.pop();
}
FilePath.prototype.toString = function() {
	return this.root
		+ this.path.join(FilePath.separator)
		+ ((this.path.length > 0)? FilePath.separator : "")
		+ this.file;
}

/**
	@namespace
*/
IO = {
	saveFile: function(outDir, fileName, content) {
		var out = new Packages.java.io.PrintWriter(
			new Packages.java.io.OutputStreamWriter(
				new Packages.java.io.FileOutputStream(outDir+SYS.slash+fileName),
				IO.encoding
			)
		);
		out.write(content);
		out.flush();
		out.close();
	},

	readFile: function(path) {
		if (!IO.exists(path)) {
			throw "File doesn't exist there: "+path;
		}
		return readFile(path, IO.encoding);
	},

	copyFile: function(inFile, outDir, fileName) {
		if (fileName == null) fileName = JSDOC.Util.fileName(inFile);
	
		var inFile = new File(inFile);
		var outFile = new File(outDir+SYS.slash+fileName);
		
		var bis = new Packages.java.io.BufferedInputStream(new Packages.java.io.FileInputStream(inFile), 4096);
		var bos = new Packages.java.io.BufferedOutputStream(new Packages.java.io.FileOutputStream(outFile), 4096);
		var theChar;
		while ((theChar = bis.read()) != -1) {
			bos.write(theChar);
		}
		bos.close();
		bis.close();
	},
	copyRecursive: function(inPath, outPath) {
        var inPath = new File(inPath);
        var inPathLength = inPath.toString().length();
		var files = IO.ls(inPath, 10);
		for (var n=0,len=files.length;n<len;n++) {
			
			var outFile = new File(outPath + files[n].substring(inPathLength));
			
			//var outPathParts = outFile.toString().split('/');
            var outPathParts = outFile.toString().replace('\\','/').split('/');
			outPathParts = outPathParts.splice(0,outPathParts.length-1);
            IO.mkPath(outPathParts);
            IO.copyFile(files[n], outPathParts.join('/'));    
        }
	},
	mkPath: function(/**Array*/ path) {
		var make = "";
		for (var i = 0, l = path.length; i < l; i++) {
			make += path[i] + SYS.slash;
			if (! IO.exists(make)) {
				IO.makeDir(make);
			}
		}
	},

	makeDir: function(dirName) {
		(new File(dirName)).mkdir();
	},

	ls: function(dir, recurse, allFiles, path) {
		if (path === undefined) { // initially
			var allFiles = [];
			var path = [dir];
		}
		if (path.length == 0) return allFiles;
		if (recurse === undefined) recurse = 1;
		
		dir = new File(dir);
		if (!dir.directory) return [String(dir)];
		var files = dir.list();
		
		for (var f = 0; f < files.length; f++) {
			var file = String(files[f]);
			if (file.match(/^\.[^\.\/\\]/)) continue; // skip dot files
	
			if ((new File(path.join(SYS.slash)+SYS.slash+file)).list()) { // it's a directory
				path.push(file);
				if (path.length-1 < recurse) IO.ls(path.join(SYS.slash), recurse, allFiles, path);
				path.pop();
			}
			else {
				allFiles.push((path.join(SYS.slash)+SYS.slash+file).replace(SYS.slash+SYS.slash, SYS.slash));
			}
		}
	
		return allFiles;
	},

	exists: function(path) {
		file = new File(path);
	
		if (file.isDirectory()){
			return true;
		}
		if (!file.exists()){
			return false;
		}
		if (!file.canRead()){
			return false;
		}
		return true;
	},

	open: function(path, append) {
		var append = true;
		var outFile = new Packages.java.io.File(path);
		var out = new Packages.java.io.PrintWriter(
			new Packages.java.io.OutputStreamWriter(
				new Packages.java.io.FileOutputStream(outFile, append),
				IO.encoding
			)
		);
		return out;
	},

	setEncoding: function(encoding) {
		if (/ISO-8859-([0-9]+)/i.test(encoding)) {
			IO.encoding = "ISO8859_"+RegExp.$1;
		}
		else {
			IO.encoding = encoding;
		}
	},

	/** @default "utf-8"
		@private
	 */
	encoding: "utf-8",
	
	include: function(relativePath) {
		load(SYS.pwd()+relativePath);
	},
	
	includeDir: function(path) {
		if (!path) return;
		
		for (var lib = IO.ls(SYS.pwd()+path), i = 0; i < lib.length; i++) 
			load(lib[i]);
	}
}

/** @namespace */
LOG = {
	warn: function(msg, e) {
		if (e) msg = e.fileName+", line "+e.lineNumber+": "+msg;
		
		msg = ">> WARNING: "+msg;
		LOG.warnings.push(msg);
		if (LOG.out) LOG.out.write(msg+"\n");
		else print(msg);
	},

	inform: function(msg) {
		msg = " > "+msg;
		if (LOG.out) LOG.out.write(msg+"\n");
		else if (typeof LOG.verbose != "undefined" && LOG.verbose) print(msg);
	}
};
LOG.warnings = [];
LOG.verbose = true

/*debug*///print("SYS.pwd() is "+SYS.pwd());

IO.include("frame.js");
IO.include("lib/JSDOC.js");
IO.includeDir("plugins/");

var jsdoc = new JSDOC.JsDoc(arguments);

if (JSDOC.opt.T) {
	IO.include("frame/Testrun.js");
	IO.include("test.js");
}
else {
	var myTemplate = JSDOC.opt.t;

	if (!myTemplate) {
		//IO.include("frame/Dumper.js");
		var symbols = jsdoc.symbolGroup.getSymbols();
		for (var i = 0, l = symbols.length; i < l; i++) {
			var symbol = symbols[i];
			//if (symbol.get("alias") == "Square")
			//print(Dumper.dump(symbol));
			/*debug*/print("s> "+symbol.get("alias"));
		}
	}
	else {
		load(myTemplate+"/publish.js");
		if (publish) publish(jsdoc.symbolGroup);
		else LOG.warn("publish() is not defined in that template.");
	}
}