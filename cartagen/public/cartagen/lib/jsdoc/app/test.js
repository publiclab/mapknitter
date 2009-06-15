
function symbolize(opt) {
	jsdoc = null;
	symbols = null;
	jsdoc = new JSDOC.JsDoc(opt);
	symbols = jsdoc.symbolGroup.getSymbols();
}


var testCases = [
	function() {
		symbolize({a:true, p:true, _: [SYS.pwd()+"test/prototype.js"]});
//print(Dumper.dump(symbols[0].get("methods")));	

		is('symbols[0].get("name")', "Article", 'Function set to constructor prototype with inner constructor name is found.');
		is('symbols[0].get("methods")[0].get("name")', "init", 'The initializer method name of prototype function is correct.');
		is('symbols[0].get("properties")[0].get("name")', "title", 'A property set on the initializer "this"  is on the outer constructor.');
		is('symbols[3].get("name")', "counter", 'A static property set in the initializer has the name set correctly.');
		is('symbols[3].get("memberof")', "Article", 'A static property set in the initializer has the memberof set correctly.');
		is('symbols[3].get("isStatic")', true, 'A static property set in the initializer has isStatic set to true.');

	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/prototype_oblit.js"]});
		
		is('symbols[0].get("name")', "Article", 'Oblit set to constructor prototype name is found.');
		is('symbols[0].get("memberof")', "", 'The memberof of prototype oblit is correct.');
		is('symbols[0].get("methods")[0].get("name")', "getTitle", 'The nonstatic method name of prototype oblit is correct.');
		is('symbols[0].get("methods")[0].get("isStatic")', false, 'The isStatic of a nonstatic method of prototype oblit is correct.');
		is('symbols[0].get("methods")[1].get("name")', "getTitle", 'The static method name of prototype oblit is correct.');
		is('symbols[0].get("methods")[1].get("isStatic")', true, 'The isStatic of a static method of prototype oblit is correct.');
		is('symbols[1].get("alias")', "Article#getTitle", 'The alias of non-static method of prototype oblit is correct.');
		is('symbols[1].get("isa")', "FUNCTION", 'The isa of non-static method of prototype oblit is correct.');
		is('symbols[2].get("alias")', "Article.getTitle", 'The alias of a static method of prototype oblit is correct.');
		is('symbols[1].get("isa")', "FUNCTION", 'The isa of static method of prototype oblit is correct.');
	}
	,
	function() {
		symbolize({a:true, p:true, _: [SYS.pwd()+"test/prototype_oblit_constructor.js"]});
		
		is('symbols[0].get("name")', "Article", 'Oblit set to constructor prototype with inner constructor name is found.');
		is('symbols[0].get("methods")[0].get("name")', "init", 'The initializer method name of prototype oblit is correct.');
		is('symbols[0].get("properties")[0].get("name")', "pages", 'Property set by initializer method "this" is on the outer constructor.');
		is('symbols[1].get("name")', "Title", 'Name of the inner constructor name is found.');
		is('symbols[1].get("memberof")', "Article", 'The memberof of the inner constructor name is found.');
		is('symbols[1].get("isa")', "CONSTRUCTOR", 'The isa of the inner constructor name is constructor.');
		is('symbols[1].get("properties")[0].get("name")', "title", 'A property set on the inner constructor "this"  is on the inner constructor.');
	}
	,
	function() {
		symbolize({a:true, p:true, _: [SYS.pwd()+"test/inner.js"]});
		
		is('symbols[0].get("name")', "Outer", 'Outer constructor prototype name is found.');
		is('symbols[0].get("methods").length', 1, 'Inner function doesnt appear as a method of the outer.');
		is('symbols[0].get("methods")[0].get("alias")', "Outer#open", 'Outer constructors methods arent affected by inner function.');
		is('symbols[1].get("alias")', "Outer-Inner", 'Alias of inner function is found.');
		is('symbols[1].get("isa")', "CONSTRUCTOR", 'isa of inner function constructor is found.');
		is('symbols[1].get("memberof")', "Outer", 'The memberof of inner function is found.');
		is('symbols[1].get("name")', "Inner", 'The name of inner function is found.');
		is('symbols[2].get("name")', "name", 'A member of the inner function constructor, attached to "this" is found on inner.');
		is('symbols[2].get("memberof")', "Outer-Inner", 'The memberof of an inner function member is found.');		
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/prototype_nested.js"]});
		
		is('symbols[0].get("name")', "Word", 'Base constructor name is found.');
		is('symbols[0].get("methods")[0].get("name")', "reverse", 'Base constructor method is found.');
		is('symbols[0].get("methods").length', 1, 'Base constructor has only one method.');
		is('symbols[0].get("memberof")', "", 'Base constructor memberof is empty.');
		is('symbols[1].get("name")', "reverse", 'Member of constructor prototype name is found.');
		is('symbols[1].get("memberof")', "Word", 'Member of constructor prototype memberof is found.');
		is('symbols[1].get("methods")[0].get("name")', "utf8", 'Member of constructor prototype method name is found.');
		is('symbols[2].get("name")', "utf8", 'Static nested member name is found.');
		is('symbols[2].get("memberof")', "Word#reverse", 'Static nested member memberof is found.');
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/namespace_nested.js"]});
		
		is('symbols[0].get("name")', "ns1", 'Base namespace name is found.');
		is('symbols[0].get("memberof")', "", 'Base namespace memberof is empty (its a constructor).');
		is('symbols[1].get("name")', "ns2", 'Nested namespace name is found.');
		is('symbols[1].get("alias")', "ns1.ns2", 'Nested namespace alias is found.');
		is('symbols[1].get("memberof")', "ns1", 'Nested namespace memberof is found.');
		is('symbols[2].get("name")', "Function1", 'Method of nested namespace name is found.');
		is('symbols[2].get("memberof")', "ns1.ns2", 'Constructor of nested namespace memberof is found.');			
	}
	,
	function() {
		symbolize({a:true, p:true, _: [SYS.pwd()+"test/functions_nested.js"]});
		
		is('symbols[0].get("name")', "Zop", 'Any constructor name is found.');
		is('symbols[0].get("isa")', "CONSTRUCTOR", 'It isa constructor.');
		is('symbols[0].get("methods")[0].get("name")', "zap", 'Its method name, set later, is in methods array.');
		is('symbols[1].get("name")', "Foo", 'Containing constructor name is found.');
		is('symbols[1].get("methods")[0].get("name")', "methodOne", 'Its method name is found.');
		is('symbols[1].get("methods")[1].get("name")', "methodTwo", 'Its second method name is found.');
		is('symbols[2].get("alias")', "Foo#methodOne", 'A methods alias is found.');
		is('symbols[2].get("isStatic")', false, 'A methods is not static.');
		is('symbols[4].get("name")', "Bar", 'A function set inside another function is found.');
		is('symbols[4].get("isa")', "FUNCTION", 'It isa function.');
		is('symbols[6].get("name")', "inner", 'An inner functions name is found.');
		is('symbols[6].get("memberof")', "Foo", 'It is member of the outer function.');
		is('symbols[6].get("isInner")', true, 'It is an inner function.');
		is('symbols[6].get("alias")', "Foo-inner", 'The inner functions alias is found.');
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/memberof_constructor.js"]});
		
		is('symbols[1].get("name")', "Tangent", 'Constructor set on prototype using @member has correct name.');
		is('symbols[1].get("memberof")', "Circle", 'Constructor set on prototype using @member has correct memberof.');
		is('symbols[1].get("alias")', "Circle#Tangent", 'Constructor set on prototype using @member has correct alias.');
		is('symbols[1].get("isa")', "CONSTRUCTOR", 'Constructor set on prototype using @member has correct isa.');
		is('symbols[1].get("isStatic")', false, 'Constructor set on prototype using @member is not static.');
		is('symbols[2].get("name")', "getDiameter", 'Method set on prototype using @member has correct name.');
		is('symbols[2].get("memberof")', "Circle#Tangent", 'Method set on prototype using @member has correct memberof.');
		is('symbols[2].get("alias")', "Circle#Tangent#getDiameter", 'Method set on prototype using @member has correct alias.');
		is('symbols[2].get("isa")', "FUNCTION", 'Method set on prototype using @member has correct isa.');
		is('symbols[2].get("isStatic")', false, 'Method set on prototype using @member is not static.');
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/inherits.js"]});
//print(Dumper.dump(symbols));		
		is('symbols[0].get("name")', "Layout", 'Constructor can be found.');
		is('symbols[0].get("methods")[0].get("name")', "init", 'Constructor method name can be found.');
		is('symbols[0].get("properties")[0].get("name")', "orientation", 'Constructor property name can be found.');
		is('symbols[4].get("methods")[0].get("name")', "reset", 'Second constructor method name can be found.');
		is('symbols[4].get("properties")[0].get("name")', "orientation", 'Second constructor inherited property name can be found in properties.');
		is('symbols[4].get("properties")[0].get("memberof")', "Page", 'Second constructor inherited property memberof can be found.');
		is('symbols[6].get("methods")[0].get("alias")', "ThreeColumnPage#init", 'Third constructor method can be found even though method with same name is inherited.');
		is('symbols[6].get("methods")[1].get("alias")', "ThreeColumnPage#reset", 'Inherited method can be found.');
		is('symbols[6].get("properties")[0].get("alias")', "ThreeColumnPage#orientation", 'Twice inherited method can be found.');
	
	}
	,
	function() {
		symbolize({a: true, _: [SYS.pwd()+"test/augments.js", SYS.pwd()+"test/augments2.js"]});
		
		is('symbols[4].get("augments")[0]', "Layout", 'An augmented class can be found.');
		is('symbols[4].get("methods")[0].get("alias")', "Page#reset", 'Method of augmenter can be found.');
		is('symbols[4].get("methods")[1].get("alias")', "Layout#init", 'Method from augmented can be found.');
		is('symbols[4].get("properties")[0].get("alias")', "Layout#orientation", 'Property from augmented can be found.');
		is('symbols[4].get("methods").length', 3, 'Methods of augmented class are included in methods array.');
		
		is('symbols[6].get("augments")[0]', "Page", 'The extends tag is a synonym for augments.');
		is('symbols[6].get("methods")[0].get("alias")', "ThreeColumnPage#init", 'Local method overrides augmented method of same name.');
		is('symbols[6].get("methods").length', 3, 'Local method count is right.');
		
		is('symbols[12].get("augments")[0]', "ThreeColumnPage", 'Can augment across file boundaries.');
		is('symbols[12].get("augments").length', 2, 'Multiple augments are supported.');
		is('symbols[12].get("inherits")[0].alias', "Junkmail#annoy", 'Inherited method with augments.');
		is('symbols[12].get("methods").length', 6, 'Methods of augmented class are included in methods array across files.');
		is('symbols[12].get("properties").length', 1, 'Properties of augmented class are included in properties array across files.');
	}
	,

	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/static_this.js"]});
		
		is('symbols[0].get("name")', "box.holder", 'Static namespace name can be found.');
		is('symbols[1].get("name")', "foo", 'Static namespace method name can be found.');
		is('symbols[1].get("isStatic")', true, 'Static namespace method is static.');
		
		is('symbols[2].get("name")', "counter", 'Instance namespace property name set on "this" can be found.');
		is('symbols[2].get("alias")', "box.holder#counter", 'Instance namespace property alias set on "this" can be found.');
		is('symbols[2].get("memberof")', "box.holder", 'Static namespace property memberof set on "this" can be found.');
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/scope.js"]});

		is('symbols[0].get("name")', "Person", 'Class defined in scope comment is found.');
		is('symbols[0].get("methods")[0].get("name")', "initialize", 'Scoped instance method name can be found.');
		is('symbols[0].get("methods")[1].get("name")', "say", 'Second instance method can be found.');
		is('symbols[0].get("methods")[1].get("isStatic")', false, 'Instance method is known to be not static.');
		
		is('symbols[0].get("methods")[2].get("name")', "sing", 'Instance method name from second scope comment can be found.');
		is('symbols[4].get("name")', "getCount", 'Static method name from second scope comment can be found.');
		is('symbols[4].get("isStatic")', true, 'Static method from second scope comment is known to be static.');
		
		is('symbols[5].get("name")', "Unknown.isok", 'Static instance method from scope comment is kept.');
		is('symbols[6].get("name")', "_global_", 'Orphaned instance method from scope comment is discarded.');
	}
	,
	function() {
		symbolize({a:true, _: [SYS.pwd()+"test/param_inline.js"]});
	
		is('symbols[0].get("params")[0].type', "int", 'Inline param name is set.');
		is('symbols[0].get("params")[0].desc', "The number of columns.", 'Inline param desc is set from comment.');
		is('symbols[1].get("params")[0].name', "id", 'User defined param documentation takes precedence over parser defined.');
		is('symbols[1].get("params")[0].isOptional', true, 'Default for param is to not be optional.');
		is('symbols[1].get("params")[1].isOptional', false, 'Can mark a param as being optional.');
		is('symbols[1].get("params")[1].type', "number, string", 'Type of inline param doc can have multiple values.');
		is('symbols[2].get("params")[0].type', "", 'Type can be not defined for some params.');
		is('symbols[2].get("params")[2].type', "int", 'Type can be defined inline for only some params.');
		is('symbols[4].get("params").length', 0, 'Docomments inside function sig is ignored without a param.');
		is('symbols[5].get("params")[2].type', "zoppler", 'Doccomments type overrides inline type for param with same name.');
	}
	,
	function() {
		symbolize({a: true, _: [SYS.pwd()+"test/shared.js", SYS.pwd()+"test/shared2.js"]});

		is('symbols[1].get("name")', 'some', 'The name of a symbol in a shared section is found.');
		is('symbols[1].get("alias")', 'Array#some', 'The alias of a symbol in a shared section is found.');
		is('symbols[1].get("desc")', "Extension to builtin array.", 'A description can be shared.');
		is('symbols[2].get("desc")', "Extension to builtin array.\nChange every element of an array.", 'A shared description is appended.');
		is('symbols[3].get("desc")', "A first in, first out data structure.", 'A description is not shared when outside a shared section.');
		is('symbols[4].get("alias")', "Queue.rewind", 'Second shared tag can be started.');
		is('symbols[5].get("alias")', "_global_#startOver", 'Shared tag doesnt cross over files.');
	
	}
	,
	function() {
		symbolize({a: true, _: [SYS.pwd()+"test/config.js"]});
		is('symbols[0].get("params")[0].name', 'person', 'The name of a param is found.');
		is('symbols[0].get("params")[1].name', 'person.name', 'The name of a param set with a dot name is found.');
		is('symbols[0].get("params")[2].name', 'person.age', 'The name of a param set with a dot name is found.');
		is('symbols[0].get("params")[4].name', 'connection', 'The name of a param after config is found.');
		
		is('symbols[1].get("params")[0].name', 'persons', 'Another name of a param is found.');
		is('symbols[1].get("params")[1].name', 'persons.Father', 'The name of a param+config is found.');
		is('symbols[1].get("params")[2].name', 'persons.Mother', 'The name of a second param+config is found.');
		is('symbols[1].get("params")[3].name', 'persons.Children', 'The name of a third param+config is found.');
			
	}
];


//// run and print results
print(testrun(testCases));
