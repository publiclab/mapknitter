/***
 * @overview Ext template publisher.
 * @author Chris Scott <christocracy@gmail.com>
 *
 */


/***
 * publish
 * @param {Object} symbolGroup
 *
 */
function publish(symbolGroup) {

    var outDir = (typeof(JSDOC.opt.d) != 'undefined') ? JSDOC.opt.d : SYS.pwd() + "../out/jsdox/";
    publish.conf = {  // trailing slash expected for dirs
        ext: ".html",
        outDir: outDir + "/",
        templatesDir: SYS.pwd() + "../" + JSDOC.opt.t + '/',
        symbolsDir: "symbols/",
        srcDir: "src/"
    };

    // build template directory structure
    buildTemplate();

    // used to check the details of things being linked to
    JSDOC.template.symbolGroup = symbolGroup;
    JSDOC.template.Link.base = publish.conf.symbolsDir;
    JSDOC.template.ext = publish.conf.ext;

    // create XTemplate instances.
    try {
        var link = new JSDOC.template.Link();
        JSDOC.template.Util.linker = link;
        var indexTpl = new Ext.XTemplate(IO.readFile(publish.conf.templatesDir + "index.tmpl"), JSDOC.template.Util).compile();
        var classTpl = new Ext.XTemplate(IO.readFile(publish.conf.templatesDir + "class.tmpl"), JSDOC.template.Util).compile();
    }
    catch(e) {
        print(e.message);
        quit();
    }

    // filters
    function hasNoParent($) {return ($.memberof == "")}
    function isaFile($) {return ($.is("FILE"))}
    function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace())}

    var symbols = symbolGroup.getSymbols();
    var classes = symbols.filter(isaClass).sort(JSDOC.template.Util.makeSortby("alias"));

    // create output syntax-highlighted src-files
    var srcDir = publish.conf.outDir + "src/";
    var files = JSDOC.opt.srcFiles;
    for (var i = 0, l = files.length; i < l; i++) {
        JSDOC.template.Util.makeSrcFile(files[i], srcDir);
    }

    print ("num classes: " + classes.length);

    // create root-node for Tree in index.tmpl
    var treeData = {
        "id": "apidocs",
        "text": JSDOC.opt.H,
        "iconCls": "icon-docs",
        "singleClickExpand": true,
        "children": []
    };

    var packages = {};
    var list = [];

    // build package hash and list of classes.
    for (var i = 0, l = classes.length; i < l; i++) {
        var symbol = classes[i];
        //print('symbol: ' + symbol.get('name') + ', isa: ' + symbol.get('isa'));

        var path = symbol.get('alias').split('.');
        var className = path.pop(); // <-- remove last item Namespace.package.ClassName *pop*
        var parent = path.join('.') || 'root';
        if (path.length) {

            // check if this package name has been registerd in hash already.
            var name = path.join('.');
            ns = path.shift();                       // <-- Namespace exists?
            if (typeof(packages[name]) == 'undefined') { // Namespace.package
                if (typeof(packages[ns]) == 'undefined') {
                    packages[ns] = 'root'; // <-- parent ('Apollo' : 'root'
                }
                for (var n = 0, len = path.length; n < len; n++) {
                    if (typeof(packages[ns + '.' + path[n]]) == 'undefined') {
                        packages[ns + '.' + path[n]] = ns; // <-- parent  ('Apollo.order' : 'Apollo')
                    }
                    ns = ns + '.' + path[n]; // <-- ns becomes "Apollo.order" now
                }
            }
        }
        var filename = symbol.get("alias") + publish.conf.ext;
		
		var SIcon = 'icon-cls';
		if (symbol.get('isSingleton')) { 
			SIcon='icon-static';
		}
		if (symbol.get('isComponent')) { 
			SIcon='icon-cmp';
		}
		
		print ('-----------------------------------------------------------');
		print ('start find augments: ' + symbol.get('alias'));
		var StartAugments = symbol.get('augments');
		if (StartAugments.length > 0) {				// extends another class so search back in class tree
			var ExtraAugments = findAugmentTree(StartAugments[0], classes);
			ExtraAugments.pop(); // last one is double
			symbol.set('augments', ExtraAugments.concat(StartAugments))
		}

        if (symbol.get("alias") != '') { // sometimes a symbol wiht no alias is getting through
            // class tree-node
            list.push({
                id: symbol.get('alias'),  //DH : id's were not unique enuf to support tree->tab selection
                parent: parent,
                text: className,
                iconCls: SIcon,
                leaf: true,
                href: 'symbols/' + filename,
                cls: 'cls',
                children: []
            });

            // render output for Class.File.html
            IO.saveFile(publish.conf.outDir + "symbols/", filename, classTpl.applyTemplate(symbol));
        }
    }

    // build recursive Package tree.
    treeData.children = buildPackage('root', packages, list).children;

    // create index file
    IO.saveFile(publish.conf.outDir, 'index.html', indexTpl.applyTemplate({
        classData : Ext.encode(treeData)
    }));
}

/***
 * buildTemplate
 * creates template directories and static files
 */
function buildTemplate() {

    IO.makeDir(publish.conf.outDir);
    // create base directories.
    IO.makeDir(publish.conf.outDir + "symbols");
    IO.makeDir(publish.conf.outDir + "src");
    IO.makeDir(publish.conf.outDir + 'resources');
    IO.makeDir(publish.conf.outDir + 'resources/css');
    // copy welcome.html
    IO.copyFile(publish.conf.templatesDir + '/static/welcome.html', publish.conf.outDir);
    // copy extjs libs
    IO.copyFile(publish.conf.templatesDir + '/../../' + pathToExtJS + '/adapter/ext/ext-base.js', publish.conf.outDir + 'resources');
    IO.copyFile(publish.conf.templatesDir + '/../../' + pathToExtJS + '/ext-all.js', publish.conf.outDir + 'resources');
    IO.copyFile(publish.conf.templatesDir + '/../../' + pathToExtJS + '/resources/css/ext-all.css', publish.conf.outDir + 'resources/css');
    IO.copyRecursive(publish.conf.templatesDir + '/../../' + pathToExtJS + '/docs/resources', publish.conf.outDir + 'resources');
    IO.copyRecursive(publish.conf.templatesDir + '/../../' + pathToExtJS + '/resources/images/default', publish.conf.outDir + 'resources/images/default');
}

/***
 * buildPackage
 * recursively iteractes package & classlist to build tree nodes.
 * @param {Object} parent
 * @param {Object} packages
 * @param {Object} classes
 * @return {Object} Package
 */
function buildPackage(name, packages, classes) {
    var children = [];
    for (var pkg in packages) {
        if (packages[pkg] == name) {
            children.push(buildPackage(pkg, packages, classes))
        }
    }
    for (var n=0,len=classes.length;n<len;n++) {
        if (classes[n].parent == name && classes[n].text != '_global_') {
            children.push(classes[n]);
        }
    }

    children.sort(function (a,b){
        if (a.children.length && !b.children.length) return 1;
        if (!a.children.length && b.children.length) return -1;

        if (a.text < b.text) return -1;
        if (a.text > b.text) return 1;
        return 0;
    });

    return {
        id: 'pkg-' + name,
        text: name.split('.').pop(),
        iconCls: 'icon-pkg',
        cls: 'package',
        singleClickExpand: true,
        children: children
    };
}

/***
 * findAugmentTree
 * recursively iteractes augmentlist with classlist to build tree nodes.
 * @param {String} parent
 * @param {Objects} classes
 * @return {Array} Augment strings
 */
function findAugmentTree(parent, classes) {
	var parents = [];
	print ('start find parentree: ' + parent);
    for (var i = 0, l = classes.length; i < l; i++) {
        var symbol = classes[i];
		var symbolname = symbol.get('alias')
        if (parent == symbolname) {
			print ('down: ' + symbolname + ', isa: ' + symbol.get('isa'));
			var StartAugments = symbol.get('augments');
			if (StartAugments.length > 0) {				// Does this class have a parent ??
				parents = findAugmentTree(StartAugments[StartAugments.length - 1], classes);	// get those parents
			}
			parents.push(parent);	// add this symbolname to the end
			print ('up: ' + symbolname);
			return parents;			// and return, don't need to wait for the for loop to be ready...
		}
	}
	parents.push(parent);	// add this symbolname to the start
	print ('up (bottom): ' + parent);
	return parents;  // last class doen't exist so go back with last parent
}