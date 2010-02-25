require('app/JsHilite.js');



function publish (fileGroup, context) {
	if (!context.d) { return; }
	
	var files = fileGroup.files;
	var names = [];
	for (var i = 0, ix = files.length; i < ix; i++) {
		names.push(files[i].overview.name || files[i].filename);
	}
	names.sort();
	
	var mad     = isset(context.mad) ? context.mad : {};
	mad.title   = isset(mad.title)   ? mad.title   : 'JsDoc';
	mad.pages   = isset(mad.pages)   ? mad.pages   : [];
	mad.author  = isset(mad.author)  ? mad.author  : '';
	mad.author += isset(mad.contact)
	            ? (' &lt;<a href="' + mad.contact + '">'
	            + mad.contact.replace(/^mailto\:/, '')
	            + '</a>&gt;')
	            : '';
	
	var index = { mad: mad, files: [] };
	var pages = mad.pages;
	for (var i = 0, ix = pages.length; i < ix; i++) {
		var n = ((i < 10) ? '0' : '') + i;
		
		pages[i].file = n + '_page.html';
		index.files.push({
			name   : pages[i].name,
			file   : pages[i].file,
			is_page: true
		});
	}
	
	for (var i = 0, ix = files.length; i < ix; i++) {
		var name = (files[i].overview.name || files[i].filename);
		for (var j = 0, jx = names.length; j < jx; j++) {
			if (names[j] == name) {
				var num = pages.length + j;
				var n   = ((j < 10) ? '0' : '') + j;
				break;
			}
		}
		
		files[i].file    = n + '_file.html';
		files[i].src     = n + '_src.html';
		index.files[num] = {
			name        : name,
			file        : files[i].file,
			desc        : files[i].overview.desc,
			constructors: [],
			objects     : [],
			is_page     : false
		};
		
		for (var j = 0, jx = files[i].symbols.length; j < jx; j++) {
			var symbol = files[i].symbols[j];
			switch (symbol.isa) {
				case 'CONSTRUCTOR':
					index.files[num].constructors.push(symbol.alias);
					break;
					
				case 'OBJECT':
					index.files[num].objects.push(symbol.alias);
					break;
			}
		}
	}
	
	for (var i = 0, ix = pages.length; i < ix; i++) {
		var tpl = new JsPlate(context.t + pages[i].tpl);
		IO.saveFile(context.d, pages[i].file, tpl.process({
			index   : index,
			overview: { name: pages[i].name },
			file    : pages[i].file
		}));
	}
	
	var tpl = new JsPlate(context.t + 'file.tpl');
	var src = new JsPlate(context.t + 'src.tpl');
	for (var i = 0, ix = files.length; i < ix; i++) {
		var path = /* __DIR__ + */ files[i].path;
		new JsHilite(IO.readFile(path)).hilite().match(/<pre>([^\b]+)<\/pre>/);
		
		files[i].code  = RegExp.$1;
		files[i].index = index;
		IO.saveFile(context.d, files[i].src , src.process(files[i]));
		IO.saveFile(context.d, files[i].file, tpl.process(files[i]));
	}
	
	var tpl = new JsPlate(context.t + 'index.tpl');
	IO.saveFile(context.d,  'index.html' , tpl.process(index));
	IO.copyFile(context.t + 'default.css', context.d);
	IO.copyFile(context.t + 'pages.css'  , context.d);
	IO.copyFile(context.t + 'default.js' , context.d);
	IO.makeDir(context.d + 'img');
	var img = IO.ls([context.t + 'img']);
	for (var i = 0, ix = img.length; i < ix; i++) {
		IO.copyFile(img[i], context.d + 'img');
	}
}



function isset (val) {
	return (typeof(val) != 'undefined') && (val != null);
}