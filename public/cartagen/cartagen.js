/* cartagen.js
 *
 * Copyright (C) 2009 Jeffrey Warren, Design Ecology, MIT Media Lab
 *
 * This file is part of the Cartagen mapping framework. Read more at
 * <http://cartagen.org>
 *
 * Cartagen is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License. You should have received a copy
 * of the MIT License along with Cartagen.  If not, see
 * <http://www.opensource.org/licenses/mit-license.php>.
 */

/* The following sections (until "BEGIN CARTAGEN") are not part of Cartagen. They are, however,
 * also available under an MIT license.
 */

/* **** BEGIN PROTOTYPE **** */

/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
    Version: '1.6.0.3',

    Browser: {
        IE:     !!(window.attachEvent &&
                        navigator.userAgent.indexOf('Opera') === -1),
        Opera:  navigator.userAgent.indexOf('Opera') > -1,
        WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
        Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
            navigator.userAgent.indexOf('KHTML') === -1,
        MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
    },

    BrowserFeatures: {
        XPath: !!document.evaluate,
        SelectorsAPI: !!document.querySelector,
        ElementExtensions: !!window.HTMLElement,
        SpecificElementExtensions:
            document.createElement('div')['__proto__'] &&
            document.createElement('div')['__proto__'] !==
            document.createElement('form')['__proto__']
    },

    ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
    JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

    emptyFunction: function() { },
    K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
    Prototype.BrowserFeatures.SpecificElementExtensions = false;


    /* Based on Alex Arnell's inheritance implementation. */
    var Class = {
        create: function() {
            var parent = null, properties = $A(arguments);
            if (Object.isFunction(properties[0]))
                parent = properties.shift();

            function klass() {
                this.initialize.apply(this, arguments);
            }

            Object.extend(klass, Class.Methods);
            klass.superclass = parent;
            klass.subclasses = [];

            if (parent) {
                var subclass = function() { };
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass;
                parent.subclasses.push(klass);
            }

            for (var i = 0; i < properties.length; i++)
                klass.addMethods(properties[i]);

            if (!klass.prototype.initialize)
                klass.prototype.initialize = Prototype.emptyFunction;

            klass.prototype.constructor = klass;

            return klass;
        }
    };

Class.Methods = {
    addMethods: function(source) {
        var ancestor   = this.superclass && this.superclass.prototype;
        var properties = Object.keys(source);

        if (!Object.keys({ toString: true }).length)
            properties.push("toString", "valueOf");

        for (var i = 0, length = properties.length; i < length; i++) {
            var property = properties[i], value = source[property];
            if (ancestor && Object.isFunction(value) &&
                    value.argumentNames().first() == "$super") {
                        var method = value;
                        value = (function(m) {
                            return function() { return ancestor[m].apply(this, arguments) };
                        })(property).wrap(method);

                        value.valueOf = method.valueOf.bind(method);
                        value.toString = method.toString.bind(method);
                    }
            this.prototype[property] = value;
        }

        return this;
    }
};

var Abstract = { };

Object.extend = function(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
};

Object.extend(Object, {
    inspect: function(object) {
        try {
            if (Object.isUndefined(object)) return 'undefined';
            if (object === null) return 'null';
            return object.inspect ? object.inspect() : String(object);
        } catch (e) {
            if (e instanceof RangeError) return '...';
            throw e;
        }
    },

    toJSON: function(object) {
        var type = typeof object;
        switch (type) {
            case 'undefined':
            case 'function':
            case 'unknown': return;
            case 'boolean': return object.toString();
        }

        if (object === null) return 'null';
        if (object.toJSON) return object.toJSON();
        if (Object.isElement(object)) return;

        var results = [];
        for (var property in object) {
            var value = Object.toJSON(object[property]);
            if (!Object.isUndefined(value))
                results.push(property.toJSON() + ': ' + value);
        }

        return '{' + results.join(', ') + '}';
    },

    toQueryString: function(object) {
        return $H(object).toQueryString();
    },

    toHTML: function(object) {
        return object && object.toHTML ? object.toHTML() : String.interpret(object);
    },

    keys: function(object) {
        var keys = [];
        for (var property in object)
            keys.push(property);
        return keys;
    },

    values: function(object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    },

    clone: function(object) {
        return Object.extend({ }, object);
    },

    isElement: function(object) {
        return !!(object && object.nodeType == 1);
    },

    isArray: function(object) {
        return object != null && typeof object == "object" &&
            'splice' in object && 'join' in object;
    },

    isHash: function(object) {
        return object instanceof Hash;
    },

    isFunction: function(object) {
        return typeof object == "function";
    },

    isString: function(object) {
        return typeof object == "string";
    },

    isNumber: function(object) {
        return typeof object == "number";
    },

    isUndefined: function(object) {
        return typeof object == "undefined";
    }
});

Object.extend(Function.prototype, {
    argumentNames: function() {
        var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
            .replace(/\s+/g, '').split(',');
            return names.length == 1 && !names[0] ? [] : names;
            },

            bind: function() {
                if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
                var __method = this, args = $A(arguments), object = args.shift();
                return function() {
                    return __method.apply(object, args.concat($A(arguments)));
                }
            },

            bindAsEventListener: function() {
                var __method = this, args = $A(arguments), object = args.shift();
                return function(event) {
                    return __method.apply(object, [event || window.event].concat(args));
                }
            },

            curry: function() {
                if (!arguments.length) return this;
                var __method = this, args = $A(arguments);
                return function() {
                    return __method.apply(this, args.concat($A(arguments)));
                }
            },

            delay: function() {
                var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
                return window.setTimeout(function() {
                    return __method.apply(__method, args);
                }, timeout);
            },

            defer: function() {
                var args = [0.01].concat($A(arguments));
                return this.delay.apply(this, args);
            },

            wrap: function(wrapper) {
                var __method = this;
                return function() {
                    return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
                }
            },

            methodize: function() {
                if (this._methodized) return this._methodized;
                var __method = this;
                return this._methodized = function() {
                    return __method.apply(null, [this].concat($A(arguments)));
                };
            }
});

Date.prototype.toJSON = function() {
    return '"' + this.getUTCFullYear() + '-' +
        (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
        this.getUTCDate().toPaddedString(2) + 'T' +
        this.getUTCHours().toPaddedString(2) + ':' +
        this.getUTCMinutes().toPaddedString(2) + ':' +
        this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
    these: function() {
        var returnValue;

        for (var i = 0, length = arguments.length; i < length; i++) {
            var lambda = arguments[i];
            try {
                returnValue = lambda();
                break;
            } catch (e) { }
        }

        return returnValue;
    }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
    initialize: function(callback, frequency) {
        this.callback = callback;
        this.frequency = frequency;
        this.currentlyExecuting = false;

        this.registerCallback();
    },

    registerCallback: function() {
        this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
    },

    execute: function() {
        this.callback(this);
    },

    stop: function() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    },

    onTimerEvent: function() {
        if (!this.currentlyExecuting) {
            try {
                this.currentlyExecuting = true;
                this.execute();
            } finally {
                this.currentlyExecuting = false;
            }
        }
    }
});
Object.extend(String, {
    interpret: function(value) {
        return value == null ? '' : String(value);
    },
    specialChar: {
        '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
    }
});

Object.extend(String.prototype, {
    gsub: function(pattern, replacement) {
        var result = '', source = this, match;
        replacement = arguments.callee.prepareReplacement(replacement);

        while (source.length > 0) {
            if (match = source.match(pattern)) {
                result += source.slice(0, match.index);
                result += String.interpret(replacement(match));
                source  = source.slice(match.index + match[0].length);
            } else {
                result += source, source = '';
            }
        }
        return result;
    },

    sub: function(pattern, replacement, count) {
        replacement = this.gsub.prepareReplacement(replacement);
        count = Object.isUndefined(count) ? 1 : count;

        return this.gsub(pattern, function(match) {
            if (--count < 0) return match[0];
            return replacement(match);
        });
    },

    scan: function(pattern, iterator) {
        this.gsub(pattern, iterator);
        return String(this);
    },

    truncate: function(length, truncation) {
        length = length || 30;
        truncation = Object.isUndefined(truncation) ? '...' : truncation;
        return this.length > length ?
            this.slice(0, length - truncation.length) + truncation : String(this);
    },

    strip: function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    },

    stripTags: function() {
        return this.replace(/<\/?[^>]+>/gi, '');
    },

    stripScripts: function() {
        return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
    },

    extractScripts: function() {
        var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
        var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
        return (this.match(matchAll) || []).map(function(scriptTag) {
            return (scriptTag.match(matchOne) || ['', ''])[1];
        });
    },

    evalScripts: function() {
        return this.extractScripts().map(function(script) { return eval(script) });
    },

    escapeHTML: function() {
        var self = arguments.callee;
        self.text.data = this;
        return self.div.innerHTML;
    },

    unescapeHTML: function() {
        var div = new Element('div');
        div.innerHTML = this.stripTags();
        return div.childNodes[0] ? (div.childNodes.length > 1 ?
                $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
                div.childNodes[0].nodeValue) : '';
    },

    toQueryParams: function(separator) {
        var match = this.strip().match(/([^?#]*)(#.*)?$/);
        if (!match) return { };

        return match[1].split(separator || '&').inject({ }, function(hash, pair) {
            if ((pair = pair.split('='))[0]) {
                var key = decodeURIComponent(pair.shift());
                var value = pair.length > 1 ? pair.join('=') : pair[0];
                if (value != undefined) value = decodeURIComponent(value);

                if (key in hash) {
                    if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
                    hash[key].push(value);
                }
                else hash[key] = value;
            }
            return hash;
        });
    },

    toArray: function() {
        return this.split('');
    },

    succ: function() {
        return this.slice(0, this.length - 1) +
            String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
    },

    times: function(count) {
        return count < 1 ? '' : new Array(count + 1).join(this);
    },

    camelize: function() {
        var parts = this.split('-'), len = parts.length;
        if (len == 1) return parts[0];

        var camelized = this.charAt(0) == '-'
            ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
            : parts[0];

        for (var i = 1; i < len; i++)
            camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

        return camelized;
    },

    capitalize: function() {
        return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
    },

    underscore: function() {
        return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
    },

    dasherize: function() {
        return this.gsub(/_/,'-');
    },

    inspect: function(useDoubleQuotes) {
        var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
            var character = String.specialChar[match[0]];
            return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
        });
        if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
        return "'" + escapedString.replace(/'/g, '\\\'') + "'";
    },

    toJSON: function() {
        return this.inspect(true);
    },

    unfilterJSON: function(filter) {
        return this.sub(filter || Prototype.JSONFilter, '#{1}');
    },

    isJSON: function() {
        var str = this;
        if (str.blank()) return false;
        str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
        return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
    },

    evalJSON: function(sanitize) {
        var json = this.unfilterJSON();
        try {
            if (!sanitize || json.isJSON()) return eval('(' + json + ')');
        } catch (e) { }
        throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
    },

    include: function(pattern) {
        return this.indexOf(pattern) > -1;
    },

    startsWith: function(pattern) {
        return this.indexOf(pattern) === 0;
    },

    endsWith: function(pattern) {
        var d = this.length - pattern.length;
        return d >= 0 && this.lastIndexOf(pattern) === d;
    },

    empty: function() {
        return this == '';
    },

    blank: function() {
        return /^\s*$/.test(this);
    },

    interpolate: function(object, pattern) {
        return new Template(this, pattern).evaluate(object);
    }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
    escapeHTML: function() {
        return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
   unescapeHTML: function() {
       return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
   }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
    div:  document.createElement('div'),
    text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
    initialize: function(template, pattern) {
        this.template = template.toString();
        this.pattern = pattern || Template.Pattern;
    },

    evaluate: function(object) {
        if (Object.isFunction(object.toTemplateReplacements))
    object = object.toTemplateReplacements();

return this.template.gsub(this.pattern, function(match) {
    if (object == null) return '';

    var before = match[1] || '';
    if (before == '\\') return match[2];

    var ctx = object, expr = match[3];
    var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
    match = pattern.exec(expr);
    if (match == null) return before;

    while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
    }

    return before + String.interpret(ctx);
});
}
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
    each: function(iterator, context) {
        var index = 0;
        try {
            this._each(function(value) {
                iterator.call(context, value, index++);
            });
        } catch (e) {
            if (e != $break) throw e;
        }
        return this;
    },

    eachSlice: function(number, iterator, context) {
        var index = -number, slices = [], array = this.toArray();
        if (number < 1) return array;
        while ((index += number) < array.length)
            slices.push(array.slice(index, index+number));
        return slices.collect(iterator, context);
    },

    all: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var result = true;
        this.each(function(value, index) {
            result = result && !!iterator.call(context, value, index);
            if (!result) throw $break;
        });
        return result;
    },

    any: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var result = false;
        this.each(function(value, index) {
            if (result = !!iterator.call(context, value, index))
            throw $break;
        });
        return result;
    },

    collect: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var results = [];
        this.each(function(value, index) {
            results.push(iterator.call(context, value, index));
        });
        return results;
    },

    detect: function(iterator, context) {
        var result;
        this.each(function(value, index) {
            if (iterator.call(context, value, index)) {
                result = value;
                throw $break;
            }
        });
        return result;
    },

    findAll: function(iterator, context) {
        var results = [];
        this.each(function(value, index) {
            if (iterator.call(context, value, index))
            results.push(value);
        });
        return results;
    },

    grep: function(filter, iterator, context) {
        iterator = iterator || Prototype.K;
        var results = [];

        if (Object.isString(filter))
            filter = new RegExp(filter);

        this.each(function(value, index) {
            if (filter.match(value))
            results.push(iterator.call(context, value, index));
        });
        return results;
    },

    include: function(object) {
        if (Object.isFunction(this.indexOf))
            if (this.indexOf(object) != -1) return true;

        var found = false;
        this.each(function(value) {
            if (value == object) {
                found = true;
                throw $break;
            }
        });
        return found;
    },

    inGroupsOf: function(number, fillWith) {
        fillWith = Object.isUndefined(fillWith) ? null : fillWith;
        return this.eachSlice(number, function(slice) {
            while(slice.length < number) slice.push(fillWith);
            return slice;
        });
    },

    inject: function(memo, iterator, context) {
        this.each(function(value, index) {
            memo = iterator.call(context, memo, value, index);
        });
        return memo;
    },

    invoke: function(method) {
        var args = $A(arguments).slice(1);
        return this.map(function(value) {
            return value[method].apply(value, args);
        });
    },

    max: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var result;
        this.each(function(value, index) {
            value = iterator.call(context, value, index);
            if (result == null || value >= result)
            result = value;
        });
        return result;
    },

    min: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var result;
        this.each(function(value, index) {
            value = iterator.call(context, value, index);
            if (result == null || value < result)
            result = value;
        });
        return result;
    },

    partition: function(iterator, context) {
        iterator = iterator || Prototype.K;
        var trues = [], falses = [];
        this.each(function(value, index) {
            (iterator.call(context, value, index) ?
             trues : falses).push(value);
        });
        return [trues, falses];
    },

    pluck: function(property) {
        var results = [];
        this.each(function(value) {
            results.push(value[property]);
        });
        return results;
    },

    reject: function(iterator, context) {
        var results = [];
        this.each(function(value, index) {
            if (!iterator.call(context, value, index))
            results.push(value);
        });
        return results;
    },

    sortBy: function(iterator, context) {
        return this.map(function(value, index) {
            return {
                value: value,
        criteria: iterator.call(context, value, index)
            };
        }).sort(function(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }).pluck('value');
    },

    toArray: function() {
        return this.map();
    },

    zip: function() {
        var iterator = Prototype.K, args = $A(arguments);
        if (Object.isFunction(args.last()))
            iterator = args.pop();

        var collections = [this].concat(args).map($A);
        return this.map(function(value, index) {
            return iterator(collections.pluck(index));
        });
    },

    size: function() {
        return this.toArray().length;
    },

    inspect: function() {
        return '#<Enumerable:' + this.toArray().inspect() + '>';
    }
};

Object.extend(Enumerable, {
    map:     Enumerable.collect,
    find:    Enumerable.detect,
    select:  Enumerable.findAll,
    filter:  Enumerable.findAll,
    member:  Enumerable.include,
    entries: Enumerable.toArray,
    every:   Enumerable.all,
    some:    Enumerable.any
});
function $A(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
}

if (Prototype.Browser.WebKit) {
    $A = function(iterable) {
        if (!iterable) return [];
        if (!(typeof iterable === 'function' && typeof iterable.length ===
                    'number' && typeof iterable.item === 'function') && iterable.toArray)
            return iterable.toArray();
        var length = iterable.length || 0, results = new Array(length);
        while (length--) results[length] = iterable[length];
        return results;
    };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
    _each: function(iterator) {
        for (var i = 0, length = this.length; i < length; i++)
    iterator(this[i]);
    },

    clear: function() {
        this.length = 0;
        return this;
    },

    first: function() {
        return this[0];
    },

    last: function() {
        return this[this.length - 1];
    },

    compact: function() {
        return this.select(function(value) {
            return value != null;
        });
    },

    flatten: function() {
        return this.inject([], function(array, value) {
            return array.concat(Object.isArray(value) ?
                value.flatten() : [value]);
        });
    },

    without: function() {
        var values = $A(arguments);
        return this.select(function(value) {
            return !values.include(value);
        });
    },

    reverse: function(inline) {
        return (inline !== false ? this : this.toArray())._reverse();
    },

    reduce: function() {
        return this.length > 1 ? this : this[0];
    },

    uniq: function(sorted) {
        return this.inject([], function(array, value, index) {
            if (0 == index || (sorted ? array.last() != value : !array.include(value)))
            array.push(value);
        return array;
        });
    },

    intersect: function(array) {
        return this.uniq().findAll(function(item) {
            return array.detect(function(value) { return item === value });
        });
    },

    clone: function() {
        return [].concat(this);
    },

    size: function() {
        return this.length;
    },

    inspect: function() {
        return '[' + this.map(Object.inspect).join(', ') + ']';
    },

    toJSON: function() {
        var results = [];
        this.each(function(object) {
            var value = Object.toJSON(object);
            if (!Object.isUndefined(value)) results.push(value);
        });
        return '[' + results.join(', ') + ']';
    }
});

if (Object.isFunction(Array.prototype.forEach))
    Array.prototype._each = Array.prototype.forEach;

    if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
        i || (i = 0);
        var length = this.length;
        if (i < 0) i = length + i;
        for (; i < length; i++)
            if (this[i] === item) return i;
        return -1;
    };

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
    if (!Object.isString(string)) return [];
    string = string.strip();
    return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
    Array.prototype.concat = function() {
        var array = [];
        for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
        for (var i = 0, length = arguments.length; i < length; i++) {
            if (Object.isArray(arguments[i])) {
                for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
                    array.push(arguments[i][j]);
            } else {
                array.push(arguments[i]);
            }
        }
        return array;
    };
}
Object.extend(Number.prototype, {
    toColorPart: function() {
        return this.toPaddedString(2, 16);
    },

succ: function() {
    return this + 1;
},

times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
},

toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
},

toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
}
});

$w('abs round ceil floor').each(function(method){
    Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
    return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

    function toQueryPair(key, value) {
        if (Object.isUndefined(value)) return key;
        return key + '=' + encodeURIComponent(String.interpret(value));
    }

    return {
        initialize: function(object) {
            this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
        },

    _each: function(iterator) {
        for (var key in this._object) {
            var value = this._object[key], pair = [key, value];
            pair.key = key;
            pair.value = value;
            iterator(pair);
        }
    },

    set: function(key, value) {
        return this._object[key] = value;
    },

    get: function(key) {
        if (this._object[key] !== Object.prototype[key])
            return this._object[key];
    },

    unset: function(key) {
        var value = this._object[key];
        delete this._object[key];
        return value;
    },

    toObject: function() {
        return Object.clone(this._object);
    },

    keys: function() {
        return this.pluck('key');
    },

    values: function() {
        return this.pluck('value');
    },

    index: function(value) {
        var match = this.detect(function(pair) {
            return pair.value === value;
        });
        return match && match.key;
    },

    merge: function(object) {
        return this.clone().update(object);
    },

    update: function(object) {
        return new Hash(object).inject(this, function(result, pair) {
            result.set(pair.key, pair.value);
            return result;
        });
    },

    toQueryString: function() {
        return this.inject([], function(results, pair) {
            var key = encodeURIComponent(pair.key), values = pair.value;

            if (values && typeof values == 'object') {
                if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
            } else results.push(toQueryPair(key, values));
            return results;
        }).join('&');
    },

    inspect: function() {
        return '#<Hash:{' + this.map(function(pair) {
            return pair.map(Object.inspect).join(': ');
        }).join(', ') + '}>';
    },

    toJSON: function() {
        return Object.toJSON(this.toObject());
    },

    clone: function() {
        return new Hash(this);
    }
    }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
    initialize: function(start, end, exclusive) {
        this.start = start;
        this.end = end;
        this.exclusive = exclusive;
    },

    _each: function(iterator) {
        var value = this.start;
        while (this.include(value)) {
            iterator(value);
            value = value.succ();
        }
    },

    include: function(value) {
        if (value < this.start)
    return false;
if (this.exclusive)
    return value < this.end;
return value <= this.end;
    }
});

var $R = function(start, end, exclusive) {
    return new ObjectRange(start, end, exclusive);
};

var Ajax = {
    getTransport: function() {
        return Try.these(
                function() {return new XMLHttpRequest()},
                function() {return new ActiveXObject('Msxml2.XMLHTTP')},
                function() {return new ActiveXObject('Microsoft.XMLHTTP')}
                ) || false;
    },

    activeRequestCount: 0
};

Ajax.Responders = {
    responders: [],

    _each: function(iterator) {
        this.responders._each(iterator);
    },

    register: function(responder) {
        if (!this.include(responder))
            this.responders.push(responder);
    },

    unregister: function(responder) {
        this.responders = this.responders.without(responder);
    },

    dispatch: function(callback, request, transport, json) {
        this.each(function(responder) {
            if (Object.isFunction(responder[callback])) {
                try {
                    responder[callback].apply(responder, [request, transport, json]);
                } catch (e) { }
            }
        });
    }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
    onCreate:   function() { Ajax.activeRequestCount++ },
    onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
    initialize: function(options) {
        this.options = {
            method:       'post',
    asynchronous: true,
    contentType:  'application/x-www-form-urlencoded',
    encoding:     'UTF-8',
    parameters:   '',
    evalJSON:     true,
    evalJS:       true
        };
        Object.extend(this.options, options || { });

        this.options.method = this.options.method.toLowerCase();

        if (Object.isString(this.options.parameters))
    this.options.parameters = this.options.parameters.toQueryParams();
        else if (Object.isHash(this.options.parameters))
    this.options.parameters = this.options.parameters.toObject();
    }
});

Ajax.Request = Class.create(Ajax.Base, {
    _complete: false,

    initialize: function($super, url, options) {
        $super(options);
        this.transport = Ajax.getTransport();
        this.request(url);
    },

    request: function(url) {
        this.url = url;
        this.method = this.options.method;
        var params = Object.clone(this.options.parameters);

        if (!['get', 'post'].include(this.method)) {
            params['_method'] = this.method;
            this.method = 'post';
        }

        this.parameters = params;

        if (params = Object.toQueryString(params)) {
            if (this.method == 'get')
                this.url += (this.url.include('?') ? '&' : '?') + params;
            else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
                params += '&_=';
        }

        try {
            var response = new Ajax.Response(this);
            if (this.options.onCreate) this.options.onCreate(response);
            Ajax.Responders.dispatch('onCreate', this, response);

            this.transport.open(this.method.toUpperCase(), this.url,
                    this.options.asynchronous);

            if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

            this.transport.onreadystatechange = this.onStateChange.bind(this);
            this.setRequestHeaders();

            this.body = this.method == 'post' ? (this.options.postBody || params) : null;
            this.transport.send(this.body);

            /* Force Firefox to handle ready state 4 for synchronous requests */
            if (!this.options.asynchronous && this.transport.overrideMimeType)
                this.onStateChange();

        }
        catch (e) {
            this.dispatchException(e);
        }
    },

    onStateChange: function() {
        var readyState = this.transport.readyState;
        if (readyState > 1 && !((readyState == 4) && this._complete))
            this.respondToReadyState(this.transport.readyState);
    },

    setRequestHeaders: function() {
        var headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Prototype-Version': Prototype.Version,
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
                                                                                 };

                                                                                 if (this.method == 'post') {
                                                                                 headers['Content-type'] = this.options.contentType +
                                                                                 (this.options.encoding ? '; charset=' + this.options.encoding : '');

                /* Force "Connection: close" for older Mozilla browsers to work
                 * around a bug where XMLHttpRequest sends an incorrect
                 * Content-length header. See Mozilla Bugzilla #246651.
                 */
                if (this.transport.overrideMimeType &&
                        (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
                    headers['Connection'] = 'close';
        }

        if (typeof this.options.requestHeaders == 'object') {
            var extras = this.options.requestHeaders;

            if (Object.isFunction(extras.push))
                for (var i = 0, length = extras.length; i < length; i += 2)
                    headers[extras[i]] = extras[i+1];
            else
                $H(extras).each(function(pair) { headers[pair.key] = pair.value });
        }

        for (var name in headers)
            this.transport.setRequestHeader(name, headers[name]);
    },

    success: function() {
        var status = this.getStatus();
        return !status || (status >= 200 && status < 300);
    },

    getStatus: function() {
        try {
            return this.transport.status || 0;
        } catch (e) { return 0 }
    },

    respondToReadyState: function(readyState) {
        var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

        if (state == 'Complete') {
            try {
                this._complete = true;
                (this.options['on' + response.status]
                 || this.options['on' + (this.success() ? 'Success' : 'Failure')]
                 || Prototype.emptyFunction)(response, response.headerJSON);
            } catch (e) {
                this.dispatchException(e);
            }

            var contentType = response.getHeader('Content-type');
            if (this.options.evalJS == 'force'
                    || (this.options.evalJS && this.isSameOrigin() && contentType
                        && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
                this.evalResponse();
        }

        try {
            (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
            Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
        } catch (e) {
            this.dispatchException(e);
        }

        if (state == 'Complete') {
            this.transport.onreadystatechange = Prototype.emptyFunction;
        }
    },

    isSameOrigin: function() {
        var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
        return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
        protocol: location.protocol,
            domain: document.domain,
            port: location.port ? ':' + location.port : ''
    }));
    },

    getHeader: function(name) {
        try {
            return this.transport.getResponseHeader(name) || null;
        } catch (e) { return null }
    },

    evalResponse: function() {
        try {
            return eval((this.transport.responseText || '').unfilterJSON());
        } catch (e) {
            this.dispatchException(e);
        }
    },

    dispatchException: function(exception) {
        (this.options.onException || Prototype.emptyFunction)(this, exception);
        Ajax.Responders.dispatch('onException', this, exception);
    }
});

Ajax.Request.Events =
['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
    initialize: function(request){
        this.request = request;
        var transport  = this.transport  = request.transport,
    readyState = this.readyState = transport.readyState;

if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
    this.status       = this.getStatus();
    this.statusText   = this.getStatusText();
    this.responseText = String.interpret(transport.responseText);
    this.headerJSON   = this._getHeaderJSON();
}

if(readyState == 4) {
    var xml = transport.responseXML;
    this.responseXML  = Object.isUndefined(xml) ? null : xml;
    this.responseJSON = this._getResponseJSON();
}
},

status:      0,
    statusText: '',

    getStatus: Ajax.Request.prototype.getStatus,

    getStatusText: function() {
        try {
            return this.transport.statusText || '';
        } catch (e) { return '' }
    },

    getHeader: Ajax.Request.prototype.getHeader,

    getAllHeaders: function() {
        try {
            return this.getAllResponseHeaders();
        } catch (e) { return null }
    },

    getResponseHeader: function(name) {
        return this.transport.getResponseHeader(name);
    },

    getAllResponseHeaders: function() {
        return this.transport.getAllResponseHeaders();
    },

    _getHeaderJSON: function() {
        var json = this.getHeader('X-JSON');
        if (!json) return null;
        json = decodeURIComponent(escape(json));
        try {
            return json.evalJSON(this.request.options.sanitizeJSON ||
                    !this.request.isSameOrigin());
        } catch (e) {
            this.request.dispatchException(e);
        }
    },

    _getResponseJSON: function() {
        var options = this.request.options;
        if (!options.evalJSON || (options.evalJSON != 'force' &&
                    !(this.getHeader('Content-type') || '').include('application/json')) ||
                this.responseText.blank())
            return null;
        try {
            return this.responseText.evalJSON(options.sanitizeJSON ||
                    !this.request.isSameOrigin());
        } catch (e) {
            this.request.dispatchException(e);
        }
    }
});

Ajax.Updater = Class.create(Ajax.Request, {
    initialize: function($super, container, url, options) {
        this.container = {
            success: (container.success || container),
    failure: (container.failure || (container.success ? null : container))
        };

        options = Object.clone(options);
        var onComplete = options.onComplete;
        options.onComplete = (function(response, json) {
            this.updateContent(response.responseText);
            if (Object.isFunction(onComplete)) onComplete(response, json);
        }).bind(this);

        $super(url, options);
    },

    updateContent: function(responseText) {
        var receiver = this.container[this.success() ? 'success' : 'failure'],
    options = this.options;

        if (!options.evalScripts) responseText = responseText.stripScripts();

        if (receiver = $(receiver)) {
            if (options.insertion) {
                if (Object.isString(options.insertion)) {
                    var insertion = { }; insertion[options.insertion] = responseText;
                    receiver.insert(insertion);
                }
                else options.insertion(receiver, responseText);
            }
            else receiver.update(responseText);
        }
    }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
    initialize: function($super, container, url, options) {
        $super(options);
        this.onComplete = this.options.onComplete;

        this.frequency = (this.options.frequency || 2);
        this.decay = (this.options.decay || 1);

        this.updater = { };
        this.container = container;
        this.url = url;

        this.start();
    },

    start: function() {
        this.options.onComplete = this.updateComplete.bind(this);
        this.onTimerEvent();
    },

    stop: function() {
        this.updater.options.onComplete = undefined;
        clearTimeout(this.timer);
        (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
    },

    updateComplete: function(response) {
        if (this.options.decay) {
            this.decay = (response.responseText == this.lastText ?
                    this.decay * this.options.decay : 1);

            this.lastText = response.responseText;
        }
        this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
    },

    onTimerEvent: function() {
        this.updater = new Ajax.Updater(this.container, this.url, this.options);
    }
});
function $(element) {
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++)
            elements.push($(arguments[i]));
        return elements;
    }
    if (Object.isString(element))
        element = document.getElementById(element);
    return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
    document._getElementsByXPath = function(expression, parentElement) {
        var results = [];
        var query = document.evaluate(expression, $(parentElement) || document,
                null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(Element.extend(query.snapshotItem(i)));
        return results;
    };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
    Object.extend(Node, {
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE: 6,
        PROCESSING_INSTRUCTION_NODE: 7,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9,
        DOCUMENT_TYPE_NODE: 10,
        DOCUMENT_FRAGMENT_NODE: 11,
        NOTATION_NODE: 12
    });
}

(function() {
    var element = this.Element;
    this.Element = function(tagName, attributes) {
        attributes = attributes || { };
        tagName = tagName.toLowerCase();
        var cache = Element.cache;
        if (Prototype.Browser.IE && attributes.name) {
            tagName = '<' + tagName + ' name="' + attributes.name + '">';
            delete attributes.name;
            return Element.writeAttribute(document.createElement(tagName), attributes);
        }
        if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
        return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
    };
    Object.extend(this.Element, element || { });
    if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
    visible: function(element) {
        return $(element).style.display != 'none';
    },

    toggle: function(element) {
        element = $(element);
        Element[Element.visible(element) ? 'hide' : 'show'](element);
        return element;
    },

    hide: function(element) {
        element = $(element);
        element.style.display = 'none';
        return element;
    },

    show: function(element) {
        element = $(element);
        element.style.display = '';
        return element;
    },

    remove: function(element) {
        element = $(element);
        element.parentNode.removeChild(element);
        return element;
    },

    update: function(element, content) {
        element = $(element);
        if (content && content.toElement) content = content.toElement();
        if (Object.isElement(content)) return element.update().insert(content);
        content = Object.toHTML(content);
        element.innerHTML = content.stripScripts();
        content.evalScripts.bind(content).defer();
        return element;
    },

    replace: function(element, content) {
        element = $(element);
        if (content && content.toElement) content = content.toElement();
        else if (!Object.isElement(content)) {
            content = Object.toHTML(content);
            var range = element.ownerDocument.createRange();
            range.selectNode(element);
            content.evalScripts.bind(content).defer();
            content = range.createContextualFragment(content.stripScripts());
        }
        element.parentNode.replaceChild(content, element);
        return element;
    },

    insert: function(element, insertions) {
        element = $(element);

        if (Object.isString(insertions) || Object.isNumber(insertions) ||
                Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
            insertions = {bottom:insertions};

        var content, insert, tagName, childNodes;

        for (var position in insertions) {
            content  = insertions[position];
            position = position.toLowerCase();
            insert = Element._insertionTranslations[position];

            if (content && content.toElement) content = content.toElement();
            if (Object.isElement(content)) {
                insert(element, content);
                continue;
            }

            content = Object.toHTML(content);

            tagName = ((position == 'before' || position == 'after')
                    ? element.parentNode : element).tagName.toUpperCase();

            childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

            if (position == 'top' || position == 'after') childNodes.reverse();
            childNodes.each(insert.curry(element));

            content.evalScripts.bind(content).defer();
        }

        return element;
    },

    wrap: function(element, wrapper, attributes) {
        element = $(element);
        if (Object.isElement(wrapper))
            $(wrapper).writeAttribute(attributes || { });
        else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
        else wrapper = new Element('div', wrapper);
        if (element.parentNode)
            element.parentNode.replaceChild(wrapper, element);
        wrapper.appendChild(element);
        return wrapper;
    },

    inspect: function(element) {
        element = $(element);
        var result = '<' + element.tagName.toLowerCase();
        $H({'id': 'id', 'className': 'class'}).each(function(pair) {
            var property = pair.first(), attribute = pair.last();
            var value = (element[property] || '').toString();
            if (value) result += ' ' + attribute + '=' + value.inspect(true);
        });
        return result + '>';
    },

    recursivelyCollect: function(element, property) {
        element = $(element);
        var elements = [];
        while (element = element[property])
            if (element.nodeType == 1)
                elements.push(Element.extend(element));
        return elements;
    },

    ancestors: function(element) {
        return $(element).recursivelyCollect('parentNode');
    },

    descendants: function(element) {
        return $(element).select("*");
    },

    firstDescendant: function(element) {
        element = $(element).firstChild;
        while (element && element.nodeType != 1) element = element.nextSibling;
        return $(element);
    },

    immediateDescendants: function(element) {
        if (!(element = $(element).firstChild)) return [];
        while (element && element.nodeType != 1) element = element.nextSibling;
        if (element) return [element].concat($(element).nextSiblings());
        return [];
    },

    previousSiblings: function(element) {
        return $(element).recursivelyCollect('previousSibling');
    },

    nextSiblings: function(element) {
        return $(element).recursivelyCollect('nextSibling');
    },

    siblings: function(element) {
        element = $(element);
        return element.previousSiblings().reverse().concat(element.nextSiblings());
    },

    match: function(element, selector) {
        if (Object.isString(selector))
            selector = new Selector(selector);
        return selector.match($(element));
    },

    up: function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return $(element.parentNode);
        var ancestors = element.ancestors();
        return Object.isNumber(expression) ? ancestors[expression] :
            Selector.findElement(ancestors, expression, index);
    },

    down: function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? element.descendants()[expression] :
            Element.select(element, expression)[index || 0];
    },

    previous: function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
        var previousSiblings = element.previousSiblings();
        return Object.isNumber(expression) ? previousSiblings[expression] :
            Selector.findElement(previousSiblings, expression, index);
    },

    next: function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
        var nextSiblings = element.nextSiblings();
        return Object.isNumber(expression) ? nextSiblings[expression] :
            Selector.findElement(nextSiblings, expression, index);
    },

    select: function() {
        var args = $A(arguments), element = $(args.shift());
        return Selector.findChildElements(element, args);
    },

    adjacent: function() {
        var args = $A(arguments), element = $(args.shift());
        return Selector.findChildElements(element.parentNode, args).without(element);
    },

    identify: function(element) {
        element = $(element);
        var id = element.readAttribute('id'), self = arguments.callee;
        if (id) return id;
        do { id = 'anonymous_element_' + self.counter++ } while ($(id));
        element.writeAttribute('id', id);
        return id;
    },

    readAttribute: function(element, name) {
        element = $(element);
        if (Prototype.Browser.IE) {
            var t = Element._attributeTranslations.read;
            if (t.values[name]) return t.values[name](element, name);
            if (t.names[name]) name = t.names[name];
            if (name.include(':')) {
                return (!element.attributes || !element.attributes[name]) ? null :
                    element.attributes[name].value;
            }
        }
        return element.getAttribute(name);
    },

    writeAttribute: function(element, name, value) {
        element = $(element);
        var attributes = { }, t = Element._attributeTranslations.write;

        if (typeof name == 'object') attributes = name;
        else attributes[name] = Object.isUndefined(value) ? true : value;

        for (var attr in attributes) {
            name = t.names[attr] || attr;
            value = attributes[attr];
            if (t.values[attr]) name = t.values[attr](element, value);
            if (value === false || value === null)
                element.removeAttribute(name);
            else if (value === true)
                element.setAttribute(name, name);
            else element.setAttribute(name, value);
        }
        return element;
    },

    getHeight: function(element) {
        return $(element).getDimensions().height;
    },

    getWidth: function(element) {
        return $(element).getDimensions().width;
    },

    classNames: function(element) {
        return new Element.ClassNames(element);
    },

    hasClassName: function(element, className) {
        if (!(element = $(element))) return;
        var elementClassName = element.className;
        return (elementClassName.length > 0 && (elementClassName == className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    },

    addClassName: function(element, className) {
        if (!(element = $(element))) return;
        if (!element.hasClassName(className))
            element.className += (element.className ? ' ' : '') + className;
        return element;
    },

    removeClassName: function(element, className) {
        if (!(element = $(element))) return;
        element.className = element.className.replace(
                new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
        return element;
    },

    toggleClassName: function(element, className) {
        if (!(element = $(element))) return;
        return element[element.hasClassName(className) ?
            'removeClassName' : 'addClassName'](className);
    },

    cleanWhitespace: function(element) {
        element = $(element);
        var node = element.firstChild;
        while (node) {
            var nextNode = node.nextSibling;
            if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
                element.removeChild(node);
            node = nextNode;
        }
        return element;
    },

    empty: function(element) {
        return $(element).innerHTML.blank();
    },

    descendantOf: function(element, ancestor) {
        element = $(element), ancestor = $(ancestor);

        if (element.compareDocumentPosition)
            return (element.compareDocumentPosition(ancestor) & 8) === 8;

        if (ancestor.contains)
            return ancestor.contains(element) && ancestor !== element;

        while (element = element.parentNode)
            if (element == ancestor) return true;

        return false;
    },

    scrollTo: function(element) {
        element = $(element);
        var pos = element.cumulativeOffset();
        window.scrollTo(pos[0], pos[1]);
        return element;
    },

    getStyle: function(element, style) {
        element = $(element);
        style = style == 'float' ? 'cssFloat' : style.camelize();
        var value = element.style[style];
        if (!value || value == 'auto') {
            var css = document.defaultView.getComputedStyle(element, null);
            value = css ? css[style] : null;
        }
        if (style == 'opacity') return value ? parseFloat(value) : 1.0;
        return value == 'auto' ? null : value;
    },

    getOpacity: function(element) {
        return $(element).getStyle('opacity');
    },

    setStyle: function(element, styles) {
        element = $(element);
        var elementStyle = element.style, match;
        if (Object.isString(styles)) {
            element.style.cssText += ';' + styles;
            return styles.include('opacity') ?
                element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
        }
        for (var property in styles)
            if (property == 'opacity') element.setOpacity(styles[property]);
            else
                elementStyle[(property == 'float' || property == 'cssFloat') ?
                    (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
                    property] = styles[property];

        return element;
    },

    setOpacity: function(element, value) {
        element = $(element);
        element.style.opacity = (value == 1 || value === '') ? '' :
            (value < 0.00001) ? 0 : value;
        return element;
    },

    getDimensions: function(element) {
        element = $(element);
        var display = element.getStyle('display');
        if (display != 'none' && display != null) // Safari bug
            return {width: element.offsetWidth, height: element.offsetHeight};

        var els = element.style;
        var originalVisibility = els.visibility;
        var originalPosition = els.position;
        var originalDisplay = els.display;
        els.visibility = 'hidden';
        els.position = 'absolute';
        els.display = 'block';
        var originalWidth = element.clientWidth;
        var originalHeight = element.clientHeight;
        els.display = originalDisplay;
        els.position = originalPosition;
        els.visibility = originalVisibility;
        return {width: originalWidth, height: originalHeight};
    },

    makePositioned: function(element) {
        element = $(element);
        var pos = Element.getStyle(element, 'position');
        if (pos == 'static' || !pos) {
            element._madePositioned = true;
            element.style.position = 'relative';
            if (Prototype.Browser.Opera) {
                element.style.top = 0;
                element.style.left = 0;
            }
        }
        return element;
    },

    undoPositioned: function(element) {
        element = $(element);
        if (element._madePositioned) {
            element._madePositioned = undefined;
            element.style.position =
                element.style.top =
                element.style.left =
                element.style.bottom =
                element.style.right = '';
        }
        return element;
    },

    makeClipping: function(element) {
        element = $(element);
        if (element._overflow) return element;
        element._overflow = Element.getStyle(element, 'overflow') || 'auto';
        if (element._overflow !== 'hidden')
            element.style.overflow = 'hidden';
        return element;
    },

    undoClipping: function(element) {
        element = $(element);
        if (!element._overflow) return element;
        element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
        element._overflow = null;
        return element;
    },

    cumulativeOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return Element._returnOffset(valueL, valueT);
    },

    positionedOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
            if (element) {
                if (element.tagName.toUpperCase() == 'BODY') break;
                var p = Element.getStyle(element, 'position');
                if (p !== 'static') break;
            }
        } while (element);
        return Element._returnOffset(valueL, valueT);
    },

    absolutize: function(element) {
        element = $(element);
        if (element.getStyle('position') == 'absolute') return element;

        var offsets = element.positionedOffset();
        var top     = offsets[1];
        var left    = offsets[0];
        var width   = element.clientWidth;
        var height  = element.clientHeight;

        element._originalLeft   = left - parseFloat(element.style.left  || 0);
        element._originalTop    = top  - parseFloat(element.style.top || 0);
        element._originalWidth  = element.style.width;
        element._originalHeight = element.style.height;

        element.style.position = 'absolute';
        element.style.top    = top + 'px';
        element.style.left   = left + 'px';
        element.style.width  = width + 'px';
        element.style.height = height + 'px';
        return element;
    },

    relativize: function(element) {
        element = $(element);
        if (element.getStyle('position') == 'relative') return element;

        element.style.position = 'relative';
        var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
        var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

        element.style.top    = top + 'px';
        element.style.left   = left + 'px';
        element.style.height = element._originalHeight;
        element.style.width  = element._originalWidth;
        return element;
    },

    cumulativeScrollOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.scrollTop  || 0;
            valueL += element.scrollLeft || 0;
            element = element.parentNode;
        } while (element);
        return Element._returnOffset(valueL, valueT);
    },

    getOffsetParent: function(element) {
        if (element.offsetParent) return $(element.offsetParent);
        if (element == document.body) return $(element);

        while ((element = element.parentNode) && element != document.body)
            if (Element.getStyle(element, 'position') != 'static')
                return $(element);

        return $(document.body);
    },

    viewportOffset: function(forElement) {
        var valueT = 0, valueL = 0;

        var element = forElement;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;

            if (element.offsetParent == document.body &&
                    Element.getStyle(element, 'position') == 'absolute') break;

        } while (element = element.offsetParent);

        element = forElement;
        do {
            if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
                valueT -= element.scrollTop  || 0;
                valueL -= element.scrollLeft || 0;
            }
        } while (element = element.parentNode);

        return Element._returnOffset(valueL, valueT);
    },

    clonePosition: function(element, source) {
        var options = Object.extend({
            setLeft:    true,
        setTop:     true,
        setWidth:   true,
        setHeight:  true,
        offsetTop:  0,
        offsetLeft: 0
        }, arguments[2] || { });

        source = $(source);
        var p = source.viewportOffset();

        element = $(element);
        var delta = [0, 0];
        var parent = null;
        if (Element.getStyle(element, 'position') == 'absolute') {
            parent = element.getOffsetParent();
            delta = parent.viewportOffset();
        }

        if (parent == document.body) {
            delta[0] -= document.body.offsetLeft;
            delta[1] -= document.body.offsetTop;
        }

        if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
        if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
        if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
        if (options.setHeight) element.style.height = source.offsetHeight + 'px';
        return element;
    }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
    getElementsBySelector: Element.Methods.select,
    childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
    write: {
        names: {
            className: 'class',
            htmlFor:   'for'
        },
        values: { }
    }
};

if (Prototype.Browser.Opera) {
    Element.Methods.getStyle = Element.Methods.getStyle.wrap(
            function(proceed, element, style) {
                switch (style) {
                    case 'left': case 'top': case 'right': case 'bottom':
                        if (proceed(element, 'position') === 'static') return null;
                    case 'height': case 'width':
                        if (!Element.visible(element)) return null;

                        var dim = parseInt(proceed(element, style), 10);

                        if (dim !== element['offset' + style.capitalize()])
        return dim + 'px';

    var properties;
    if (style === 'height') {
        properties = ['border-top-width', 'padding-top',
        'padding-bottom', 'border-bottom-width'];
    }
    else {
        properties = ['border-left-width', 'padding-left',
        'padding-right', 'border-right-width'];
    }
    return properties.inject(dim, function(memo, property) {
        var val = proceed(element, property);
        return val === null ? memo : memo - parseInt(val, 10);
    }) + 'px';
                    default: return proceed(element, style);
                }
            }
    );

    Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
            function(proceed, element, attribute) {
                if (attribute === 'title') return element.title;
                return proceed(element, attribute);
            }
            );
}

else if (Prototype.Browser.IE) {
    Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
            function(proceed, element) {
                element = $(element);
                try { element.offsetParent }
                catch(e) { return $(document.body) }
                var position = element.getStyle('position');
                if (position !== 'static') return proceed(element);
                element.setStyle({ position: 'relative' });
                var value = proceed(element);
                element.setStyle({ position: position });
                return value;
            }
            );

    $w('positionedOffset viewportOffset').each(function(method) {
        Element.Methods[method] = Element.Methods[method].wrap(
            function(proceed, element) {
                element = $(element);
                try { element.offsetParent }
                catch(e) { return Element._returnOffset(0,0) }
                var position = element.getStyle('position');
                if (position !== 'static') return proceed(element);
                var offsetParent = element.getOffsetParent();
                if (offsetParent && offsetParent.getStyle('position') === 'fixed')
            offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
            }
            );
    });

    Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
            function(proceed, element) {
                try { element.offsetParent }
                catch(e) { return Element._returnOffset(0,0) }
                return proceed(element);
            }
            );

    Element.Methods.getStyle = function(element, style) {
        element = $(element);
        style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
        var value = element.style[style];
        if (!value && element.currentStyle) value = element.currentStyle[style];

        if (style == 'opacity') {
            if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
                if (value[1]) return parseFloat(value[1]) / 100;
            return 1.0;
        }

        if (value == 'auto') {
            if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
                return element['offset' + style.capitalize()] + 'px';
            return null;
        }
        return value;
    };

    Element.Methods.setOpacity = function(element, value) {
        function stripAlpha(filter){
            return filter.replace(/alpha\([^\)]*\)/gi,'');
        }
        element = $(element);
        var currentStyle = element.currentStyle;
        if ((currentStyle && !currentStyle.hasLayout) ||
                (!currentStyle && element.style.zoom == 'normal'))
            element.style.zoom = 1;

        var filter = element.getStyle('filter'), style = element.style;
        if (value == 1 || value === '') {
            (filter = stripAlpha(filter)) ?
                style.filter = filter : style.removeAttribute('filter');
            return element;
        } else if (value < 0.00001) value = 0;
        style.filter = stripAlpha(filter) +
            'alpha(opacity=' + (value * 100) + ')';
                    return element;
                    };

                    Element._attributeTranslations = {
                        read: {
                            names: {
                                'class': 'className',
                'for':   'htmlFor'
                            },
                values: {
                    _getAttr: function(element, attribute) {
                        return element.getAttribute(attribute, 2);
                    },
                _getAttrNode: function(element, attribute) {
                    var node = element.getAttributeNode(attribute);
                    return node ? node.value : "";
                },
                _getEv: function(element, attribute) {
                    attribute = element.getAttribute(attribute);
                    return attribute ? attribute.toString().slice(23, -2) : null;
                },
                _flag: function(element, attribute) {
                    return $(element).hasAttribute(attribute) ? attribute : null;
                },
                style: function(element) {
                    return element.style.cssText.toLowerCase();
                },
                title: function(element) {
                    return element.title;
                }
                }
                        }
                    };

                    Element._attributeTranslations.write = {
                        names: Object.extend({
                            cellpadding: 'cellPadding',
                        cellspacing: 'cellSpacing'
                        }, Element._attributeTranslations.read.names),
                        values: {
                            checked: function(element, value) {
                                element.checked = !!value;
                            },

                            style: function(element, value) {
                                element.style.cssText = value ? value : '';
                            }
                        }
                    };

                    Element._attributeTranslations.has = {};

                    $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
                            'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
                                Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
                                Element._attributeTranslations.has[attr.toLowerCase()] = attr;
                            });

                    (function(v) {
                        Object.extend(v, {
                            href:        v._getAttr,
                            src:         v._getAttr,
                            type:        v._getAttr,
                            action:      v._getAttrNode,
                            disabled:    v._flag,
                            checked:     v._flag,
                            readonly:    v._flag,
                            multiple:    v._flag,
                            onload:      v._getEv,
                            onunload:    v._getEv,
                            onclick:     v._getEv,
                            ondblclick:  v._getEv,
                            onmousedown: v._getEv,
                            onmouseup:   v._getEv,
                            onmouseover: v._getEv,
                            onmousemove: v._getEv,
                            onmouseout:  v._getEv,
                            onfocus:     v._getEv,
                            onblur:      v._getEv,
                            onkeypress:  v._getEv,
                            onkeydown:   v._getEv,
                            onkeyup:     v._getEv,
                            onsubmit:    v._getEv,
                            onreset:     v._getEv,
                            onselect:    v._getEv,
                            onchange:    v._getEv
                        });
                    })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
    Element.Methods.setOpacity = function(element, value) {
        element = $(element);
        element.style.opacity = (value == 1) ? 0.999999 :
            (value === '') ? '' : (value < 0.00001) ? 0 : value;
        return element;
    };
}

else if (Prototype.Browser.WebKit) {
    Element.Methods.setOpacity = function(element, value) {
        element = $(element);
        element.style.opacity = (value == 1 || value === '') ? '' :
            (value < 0.00001) ? 0 : value;

        if (value == 1)
            if(element.tagName.toUpperCase() == 'IMG' && element.width) {
                element.width++; element.width--;
            } else try {
                var n = document.createTextNode(' ');
                element.appendChild(n);
                element.removeChild(n);
            } catch (e) { }

        return element;
    };

    Element.Methods.cumulativeOffset = function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            if (element.offsetParent == document.body)
                if (Element.getStyle(element, 'position') == 'absolute') break;

            element = element.offsetParent;
        } while (element);

        return Element._returnOffset(valueL, valueT);
    };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
    Element.Methods.update = function(element, content) {
        element = $(element);

        if (content && content.toElement) content = content.toElement();
        if (Object.isElement(content)) return element.update().insert(content);

        content = Object.toHTML(content);
        var tagName = element.tagName.toUpperCase();

        if (tagName in Element._insertionTranslations.tags) {
            $A(element.childNodes).each(function(node) { element.removeChild(node) });
            Element._getContentFromAnonymousElement(tagName, content.stripScripts())
                .each(function(node) { element.appendChild(node) });
        }
        else element.innerHTML = content.stripScripts();

        content.evalScripts.bind(content).defer();
        return element;
    };
}

if ('outerHTML' in document.createElement('div')) {
    Element.Methods.replace = function(element, content) {
        element = $(element);

        if (content && content.toElement) content = content.toElement();
        if (Object.isElement(content)) {
            element.parentNode.replaceChild(content, element);
            return element;
        }

        content = Object.toHTML(content);
        var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

        if (Element._insertionTranslations.tags[tagName]) {
            var nextSibling = element.next();
            var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
            parent.removeChild(element);
            if (nextSibling)
                fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
            else
                fragments.each(function(node) { parent.appendChild(node) });
        }
        else element.outerHTML = content.stripScripts();

        content.evalScripts.bind(content).defer();
        return element;
    };
}

Element._returnOffset = function(l, t) {
    var result = [l, t];
    result.left = l;
    result.top = t;
    return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
    var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
    if (t) {
        div.innerHTML = t[0] + html + t[1];
        t[2].times(function() { div = div.firstChild });
    } else div.innerHTML = html;
    return $A(div.childNodes);
};

Element._insertionTranslations = {
    before: function(element, node) {
        element.parentNode.insertBefore(node, element);
    },
    top: function(element, node) {
        element.insertBefore(node, element.firstChild);
    },
    bottom: function(element, node) {
        element.appendChild(node);
    },
    after: function(element, node) {
        element.parentNode.insertBefore(node, element.nextSibling);
    },
    tags: {
        TABLE:  ['<table>',                '</table>',                   1],
        TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
        TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
        TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
        SELECT: ['<select>',               '</select>',                  1]
    }
};

(function() {
    Object.extend(this.tags, {
        THEAD: this.tags.TBODY,
        TFOOT: this.tags.TBODY,
        TH:    this.tags.TD
    });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
    hasAttribute: function(element, attribute) {
        attribute = Element._attributeTranslations.has[attribute] || attribute;
        var node = $(element).getAttributeNode(attribute);
        return !!(node && node.specified);
    }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
        document.createElement('div')['__proto__']) {
            window.HTMLElement = { };
            window.HTMLElement.prototype = document.createElement('div')['__proto__'];
            Prototype.BrowserFeatures.ElementExtensions = true;
        }

Element.extend = (function() {
    if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

var Methods = { }, ByTag = Element.Methods.ByTag;

var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
    tagName = element.tagName.toUpperCase(), property, value;

if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

for (property in methods) {
    value = methods[property];
    if (Object.isFunction(value) && !(property in element))
    element[property] = value.methodize();
}

element._extendedByPrototype = Prototype.emptyFunction;
return element;

}, {
    refresh: function() {
        if (!Prototype.BrowserFeatures.ElementExtensions) {
            Object.extend(Methods, Element.Methods);
            Object.extend(Methods, Element.Methods.Simulated);
        }
    }
});

extend.refresh();
return extend;
})();

Element.hasAttribute = function(element, attribute) {
    if (element.hasAttribute) return element.hasAttribute(attribute);
    return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
    var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

    if (!methods) {
        Object.extend(Form, Form.Methods);
        Object.extend(Form.Element, Form.Element.Methods);
        Object.extend(Element.Methods.ByTag, {
            "FORM":     Object.clone(Form.Methods),
            "INPUT":    Object.clone(Form.Element.Methods),
            "SELECT":   Object.clone(Form.Element.Methods),
            "TEXTAREA": Object.clone(Form.Element.Methods)
        });
    }

    if (arguments.length == 2) {
        var tagName = methods;
        methods = arguments[1];
    }

    if (!tagName) Object.extend(Element.Methods, methods || { });
    else {
        if (Object.isArray(tagName)) tagName.each(extend);
        else extend(tagName);
    }

    function extend(tagName) {
        tagName = tagName.toUpperCase();
        if (!Element.Methods.ByTag[tagName])
            Element.Methods.ByTag[tagName] = { };
        Object.extend(Element.Methods.ByTag[tagName], methods);
    }

    function copy(methods, destination, onlyIfAbsent) {
        onlyIfAbsent = onlyIfAbsent || false;
        for (var property in methods) {
            var value = methods[property];
            if (!Object.isFunction(value)) continue;
            if (!onlyIfAbsent || !(property in destination))
                destination[property] = value.methodize();
        }
    }

    function findDOMClass(tagName) {
        var klass;
        var trans = {
            "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
            "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
            "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
            "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
            "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
                "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
                "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
                "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
                "FrameSet", "IFRAME": "IFrame"
        };
        if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
        if (window[klass]) return window[klass];
        klass = 'HTML' + tagName + 'Element';
        if (window[klass]) return window[klass];
        klass = 'HTML' + tagName.capitalize() + 'Element';
        if (window[klass]) return window[klass];

        window[klass] = { };
        window[klass].prototype = document.createElement(tagName)['__proto__'];
        return window[klass];
    }

    if (F.ElementExtensions) {
        copy(Element.Methods, HTMLElement.prototype);
        copy(Element.Methods.Simulated, HTMLElement.prototype, true);
    }

    if (F.SpecificElementExtensions) {
        for (var tag in Element.Methods.ByTag) {
            var klass = findDOMClass(tag);
            if (Object.isUndefined(klass)) continue;
            copy(T[tag], klass.prototype);
        }
    }

    Object.extend(Element, Element.Methods);
    delete Element.ByTag;

    if (Element.extend.refresh) Element.extend.refresh();
    Element.cache = { };
};

document.viewport = {
    getDimensions: function() {
        var dimensions = { }, B = Prototype.Browser;
        $w('width height').each(function(d) {
            var D = d.capitalize();
            if (B.WebKit && !document.evaluate) {
                dimensions[d] = self['inner' + D];
            } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {
                dimensions[d] = document.body['client' + D]
            } else {
                dimensions[d] = document.documentElement['client' + D];
            }
        });
        return dimensions;
    },

    getWidth: function() {
        return this.getDimensions().width;
    },

    getHeight: function() {
        return this.getDimensions().height;
    },

    getScrollOffsets: function() {
        return Element._returnOffset(
                window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
    }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
    initialize: function(expression) {
        this.expression = expression.strip();

        if (this.shouldUseSelectorsAPI()) {
            this.mode = 'selectorsAPI';
        } else if (this.shouldUseXPath()) {
            this.mode = 'xpath';
            this.compileXPathMatcher();
        } else {
            this.mode = "normal";
            this.compileMatcher();
        }

    },

    shouldUseXPath: function() {
        if (!Prototype.BrowserFeatures.XPath) return false;

        var e = this.expression;

        if (Prototype.Browser.WebKit &&
                (e.include("-of-type") || e.include(":empty")))
            return false;

        if ((/(\[[\w-]*?:|:checked)/).test(e))
            return false;

        return true;
    },

    shouldUseSelectorsAPI: function() {
        if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

        if (!Selector._div) Selector._div = new Element('div');

        try {
            Selector._div.querySelector(this.expression);
        } catch(e) {
            return false;
        }

        return true;
    },

    compileMatcher: function() {
        var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

        if (Selector._cache[e]) {
            this.matcher = Selector._cache[e];
            return;
        }

        this.matcher = ["this.matcher = function(root) {",
            "var r = root, h = Selector.handlers, c = false, n;"];

        while (e && le != e && (/\S/).test(e)) {
            le = e;
            for (var i in ps) {
                p = ps[i];
                if (m = e.match(p)) {
                    this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
                            new Template(c[i]).evaluate(m));
                    e = e.replace(m[0], '');
                    break;
                }
            }
        }

        this.matcher.push("return h.unique(n);\n}");
        eval(this.matcher.join('\n'));
        Selector._cache[this.expression] = this.matcher;
    },

    compileXPathMatcher: function() {
        var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

        if (Selector._cache[e]) {
            this.xpath = Selector._cache[e]; return;
        }

        this.matcher = ['.//*'];
        while (e && le != e && (/\S/).test(e)) {
            le = e;
            for (var i in ps) {
                if (m = e.match(ps[i])) {
                    this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
                            new Template(x[i]).evaluate(m));
                    e = e.replace(m[0], '');
                    break;
                }
            }
        }

        this.xpath = this.matcher.join('');
        Selector._cache[this.expression] = this.xpath;
    },

    findElements: function(root) {
        root = root || document;
        var e = this.expression, results;

        switch (this.mode) {
            case 'selectorsAPI':
                if (root !== document) {
                    var oldId = root.id, id = $(root).identify();
                    e = "#" + id + " " + e;
                }

                results = $A(root.querySelectorAll(e)).map(Element.extend);
                root.id = oldId;

                return results;
            case 'xpath':
                return document._getElementsByXPath(this.xpath, root);
            default:
                return this.matcher(root);
        }
    },

    match: function(element) {
        this.tokens = [];

        var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
        var le, p, m;

        while (e && le !== e && (/\S/).test(e)) {
            le = e;
            for (var i in ps) {
                p = ps[i];
                if (m = e.match(p)) {
                    if (as[i]) {
                        this.tokens.push([i, Object.clone(m)]);
                        e = e.replace(m[0], '');
                    } else {
                        return this.findElements(document).include(element);
                    }
                }
            }
        }

        var match = true, name, matches;
        for (var i = 0, token; token = this.tokens[i]; i++) {
            name = token[0], matches = token[1];
            if (!Selector.assertions[name](element, matches)) {
                match = false; break;
            }
        }

        return match;
    },

    toString: function() {
        return this.expression;
    },

    inspect: function() {
        return "#<Selector:" + this.expression.inspect() + ">";
    }
});

Object.extend(Selector, {
    _cache: { },

    xpath: {
        descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
        if (m[1] == '*') return '';
        return "[local-name()='" + m[1].toLowerCase() +
    "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
        m[1] = m[1].toLowerCase();
        return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
        m[1] = m[1].toLowerCase();
        m[3] = m[5] || m[6];
        return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
        var h = Selector.xpath.pseudos[m[1]];
        if (!h) return '';
        if (Object.isFunction(h)) return h(m);
        return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
        '=':  "[@#{1}='#{3}']",
        '!=': "[@#{1}!='#{3}']",
        '^=': "[starts-with(@#{1}, '#{3}')]",
        '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
        '*=': "[contains(@#{1}, '#{3}')]",
        '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
        '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
        'first-child': '[not(preceding-sibling::*)]',
        'last-child':  '[not(following-sibling::*)]',
        'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
        'empty':       "[count(*) = 0 and (count(text()) = 0)]",
        'checked':     "[@checked]",
        'disabled':    "[(@disabled) and (@type!='hidden')]",
        'enabled':     "[not(@disabled) and (@type!='hidden')]",
        'not': function(m) {
            var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

            var exclusion = [];
            while (e && le != e && (/\S/).test(e)) {
                le = e;
                for (var i in p) {
                    if (m = e.match(p[i])) {
                        v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
                        exclusion.push("(" + v.substring(1, v.length - 1) + ")");
                        e = e.replace(m[0], '');
                        break;
                    }
                }
            }
            return "[not(" + exclusion.join(" and ") + ")]";
        },
        'nth-child':      function(m) {
            return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
        },
        'nth-last-child': function(m) {
            return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
        },
        'nth-of-type':    function(m) {
            return Selector.xpath.pseudos.nth("position() ", m);
        },
        'nth-last-of-type': function(m) {
            return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
        },
        'first-of-type':  function(m) {
            m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
        },
        'last-of-type':   function(m) {
            m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
        },
        'only-of-type':   function(m) {
            var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
        },
        nth: function(fragment, m) {
            var mm, formula = m[6], predicate;
            if (formula == 'even') formula = '2n+0';
            if (formula == 'odd')  formula = '2n+1';
            if (mm = formula.match(/^(\d+)$/)) // digit only
                return '[' + fragment + "= " + mm[1] + ']';
            if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
                if (mm[1] == "-") mm[1] = -1;
                var a = mm[1] ? Number(mm[1]) : 1;
                var b = mm[2] ? Number(mm[2]) : 0;
                predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
                    "((#{fragment} - #{b}) div #{a} >= 0)]";
                return new Template(predicate).evaluate({
                    fragment: fragment, a: a, b: b });
            }
        }
    }
    },

    criteria: {
        tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
        className:    'n = h.className(n, r, "#{1}", c);    c = false;',
        id:           'n = h.id(n, r, "#{1}", c);           c = false;',
        attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
        attr: function(m) {
            m[3] = (m[5] || m[6]);
            return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
        },
        pseudo: function(m) {
            if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
            return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
        },
        descendant:   'c = "descendant";',
        child:        'c = "child";',
        adjacent:     'c = "adjacent";',
        laterSibling: 'c = "laterSibling";'
    },

    patterns: {
        laterSibling: /^\s*~\s*/,
        child:        /^\s*>\s*/,
        adjacent:     /^\s*\+\s*/,
        descendant:   /^\s/,

        tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
        id:           /^#([\w\-\*]+)(\b|$)/,
        className:    /^\.([\w\-\*]+)(\b|$)/,
        pseudo:
            /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
        attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
        attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
    },

    assertions: {
        tagName: function(element, matches) {
            return matches[1].toUpperCase() == element.tagName.toUpperCase();
        },

        className: function(element, matches) {
            return Element.hasClassName(element, matches[1]);
        },

        id: function(element, matches) {
            return element.id === matches[1];
        },

        attrPresence: function(element, matches) {
            return Element.hasAttribute(element, matches[1]);
        },

        attr: function(element, matches) {
            var nodeValue = Element.readAttribute(element, matches[1]);
            return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
        }
    },

    handlers: {
        concat: function(a, b) {
            for (var i = 0, node; node = b[i]; i++)
                a.push(node);
            return a;
        },

        mark: function(nodes) {
            var _true = Prototype.emptyFunction;
            for (var i = 0, node; node = nodes[i]; i++)
                node._countedByPrototype = _true;
            return nodes;
        },

        unmark: function(nodes) {
            for (var i = 0, node; node = nodes[i]; i++)
                node._countedByPrototype = undefined;
            return nodes;
        },

        index: function(parentNode, reverse, ofType) {
            parentNode._countedByPrototype = Prototype.emptyFunction;
            if (reverse) {
                for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
                    var node = nodes[i];
                    if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
                }
            } else {
                for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
                    if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
            }
        },

        unique: function(nodes) {
            if (nodes.length == 0) return nodes;
            var results = [], n;
            for (var i = 0, l = nodes.length; i < l; i++)
                if (!(n = nodes[i])._countedByPrototype) {
                    n._countedByPrototype = Prototype.emptyFunction;
                    results.push(Element.extend(n));
                }
            return Selector.handlers.unmark(results);
        },

        descendant: function(nodes) {
            var h = Selector.handlers;
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                h.concat(results, node.getElementsByTagName('*'));
            return results;
        },

        child: function(nodes) {
            var h = Selector.handlers;
            for (var i = 0, results = [], node; node = nodes[i]; i++) {
                for (var j = 0, child; child = node.childNodes[j]; j++)
                    if (child.nodeType == 1 && child.tagName != '!') results.push(child);
            }
            return results;
        },

        adjacent: function(nodes) {
            for (var i = 0, results = [], node; node = nodes[i]; i++) {
                var next = this.nextElementSibling(node);
                if (next) results.push(next);
            }
            return results;
        },

        laterSibling: function(nodes) {
            var h = Selector.handlers;
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                h.concat(results, Element.nextSiblings(node));
            return results;
        },

        nextElementSibling: function(node) {
            while (node = node.nextSibling)
                if (node.nodeType == 1) return node;
            return null;
        },

        previousElementSibling: function(node) {
            while (node = node.previousSibling)
                if (node.nodeType == 1) return node;
            return null;
        },

        tagName: function(nodes, root, tagName, combinator) {
            var uTagName = tagName.toUpperCase();
            var results = [], h = Selector.handlers;
            if (nodes) {
                if (combinator) {
                    if (combinator == "descendant") {
                        for (var i = 0, node; node = nodes[i]; i++)
                            h.concat(results, node.getElementsByTagName(tagName));
                        return results;
                    } else nodes = this[combinator](nodes);
                    if (tagName == "*") return nodes;
                }
                for (var i = 0, node; node = nodes[i]; i++)
                    if (node.tagName.toUpperCase() === uTagName) results.push(node);
                return results;
            } else return root.getElementsByTagName(tagName);
        },

        id: function(nodes, root, id, combinator) {
            var targetNode = $(id), h = Selector.handlers;
            if (!targetNode) return [];
            if (!nodes && root == document) return [targetNode];
            if (nodes) {
                if (combinator) {
                    if (combinator == 'child') {
                        for (var i = 0, node; node = nodes[i]; i++)
                            if (targetNode.parentNode == node) return [targetNode];
                    } else if (combinator == 'descendant') {
                        for (var i = 0, node; node = nodes[i]; i++)
                            if (Element.descendantOf(targetNode, node)) return [targetNode];
                    } else if (combinator == 'adjacent') {
                        for (var i = 0, node; node = nodes[i]; i++)
                            if (Selector.handlers.previousElementSibling(targetNode) == node)
                                return [targetNode];
                    } else nodes = h[combinator](nodes);
                }
                for (var i = 0, node; node = nodes[i]; i++)
                    if (node == targetNode) return [targetNode];
                return [];
            }
            return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
        },

        className: function(nodes, root, className, combinator) {
            if (nodes && combinator) nodes = this[combinator](nodes);
            return Selector.handlers.byClassName(nodes, root, className);
        },

        byClassName: function(nodes, root, className) {
            if (!nodes) nodes = Selector.handlers.descendant([root]);
            var needle = ' ' + className + ' ';
            for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
                nodeClassName = node.className;
                if (nodeClassName.length == 0) continue;
                if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
                    results.push(node);
            }
            return results;
        },

        attrPresence: function(nodes, root, attr, combinator) {
            if (!nodes) nodes = root.getElementsByTagName("*");
            if (nodes && combinator) nodes = this[combinator](nodes);
            var results = [];
            for (var i = 0, node; node = nodes[i]; i++)
                if (Element.hasAttribute(node, attr)) results.push(node);
            return results;
        },

        attr: function(nodes, root, attr, value, operator, combinator) {
            if (!nodes) nodes = root.getElementsByTagName("*");
            if (nodes && combinator) nodes = this[combinator](nodes);
            var handler = Selector.operators[operator], results = [];
            for (var i = 0, node; node = nodes[i]; i++) {
                var nodeValue = Element.readAttribute(node, attr);
                if (nodeValue === null) continue;
                if (handler(nodeValue, value)) results.push(node);
            }
            return results;
        },

        pseudo: function(nodes, name, value, root, combinator) {
            if (nodes && combinator) nodes = this[combinator](nodes);
            if (!nodes) nodes = root.getElementsByTagName("*");
            return Selector.pseudos[name](nodes, value, root);
        }
    },

    pseudos: {
        'first-child': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++) {
                if (Selector.handlers.previousElementSibling(node)) continue;
                results.push(node);
            }
            return results;
        },
        'last-child': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++) {
                if (Selector.handlers.nextElementSibling(node)) continue;
                results.push(node);
            }
            return results;
        },
        'only-child': function(nodes, value, root) {
            var h = Selector.handlers;
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
                    results.push(node);
            return results;
        },
        'nth-child':        function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, formula, root);
        },
        'nth-last-child':   function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, formula, root, true);
        },
        'nth-of-type':      function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, formula, root, false, true);
        },
        'nth-last-of-type': function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, formula, root, true, true);
        },
        'first-of-type':    function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, "1", root, false, true);
        },
        'last-of-type':     function(nodes, formula, root) {
            return Selector.pseudos.nth(nodes, "1", root, true, true);
        },
        'only-of-type':     function(nodes, formula, root) {
            var p = Selector.pseudos;
            return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
        },

        getIndices: function(a, b, total) {
            if (a == 0) return b > 0 ? [b] : [];
            return $R(1, total).inject([], function(memo, i) {
                if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
                return memo;
            });
        },

        nth: function(nodes, formula, root, reverse, ofType) {
            if (nodes.length == 0) return [];
            if (formula == 'even') formula = '2n+0';
            if (formula == 'odd')  formula = '2n+1';
            var h = Selector.handlers, results = [], indexed = [], m;
            h.mark(nodes);
            for (var i = 0, node; node = nodes[i]; i++) {
                if (!node.parentNode._countedByPrototype) {
                    h.index(node.parentNode, reverse, ofType);
                    indexed.push(node.parentNode);
                }
            }
            if (formula.match(/^\d+$/)) { // just a number
                formula = Number(formula);
                for (var i = 0, node; node = nodes[i]; i++)
                    if (node.nodeIndex == formula) results.push(node);
            } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
                if (m[1] == "-") m[1] = -1;
                var a = m[1] ? Number(m[1]) : 1;
                var b = m[2] ? Number(m[2]) : 0;
                var indices = Selector.pseudos.getIndices(a, b, nodes.length);
                for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
                    for (var j = 0; j < l; j++)
                        if (node.nodeIndex == indices[j]) results.push(node);
                }
            }
            h.unmark(nodes);
            h.unmark(indexed);
            return results;
        },

        'empty': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++) {
                if (node.tagName == '!' || node.firstChild) continue;
                results.push(node);
            }
            return results;
        },

        'not': function(nodes, selector, root) {
            var h = Selector.handlers, selectorType, m;
            var exclusions = new Selector(selector).findElements(root);
            h.mark(exclusions);
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                if (!node._countedByPrototype) results.push(node);
            h.unmark(exclusions);
            return results;
        },

        'enabled': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                if (!node.disabled && (!node.type || node.type !== 'hidden'))
                    results.push(node);
            return results;
        },

        'disabled': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                if (node.disabled) results.push(node);
            return results;
        },

        'checked': function(nodes, value, root) {
            for (var i = 0, results = [], node; node = nodes[i]; i++)
                if (node.checked) results.push(node);
            return results;
        }
    },

    operators: {
        '=':  function(nv, v) { return nv == v; },
        '!=': function(nv, v) { return nv != v; },
        '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
        '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
        '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
        '$=': function(nv, v) { return nv.endsWith(v); },
        '*=': function(nv, v) { return nv.include(v); },
        '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
        '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
                '-').include('-' + (v || "").toUpperCase() + '-'); }
    },

    split: function(expression) {
        var expressions = [];
        expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
            expressions.push(m[1].strip());
        });
        return expressions;
    },

    matchElements: function(elements, expression) {
        var matches = $$(expression), h = Selector.handlers;
        h.mark(matches);
        for (var i = 0, results = [], element; element = elements[i]; i++)
            if (element._countedByPrototype) results.push(element);
        h.unmark(matches);
        return results;
    },

    findElement: function(elements, expression, index) {
        if (Object.isNumber(expression)) {
            index = expression; expression = false;
        }
        return Selector.matchElements(elements, expression || '*')[index || 0];
    },

    findChildElements: function(element, expressions) {
        expressions = Selector.split(expressions.join(','));
        var results = [], h = Selector.handlers;
        for (var i = 0, l = expressions.length, selector; i < l; i++) {
            selector = new Selector(expressions[i].strip());
            h.concat(results, selector.findElements(element));
        }
        return (l > 1) ? h.unique(results) : results;
    }
});

if (Prototype.Browser.IE) {
    Object.extend(Selector.handlers, {
        concat: function(a, b) {
            for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
    return a;
        },

        unmark: function(nodes) {
            for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
    return nodes;
        }
    });
}

function $$() {
    return Selector.findChildElements(document, $A(arguments));
}
var Form = {
    reset: function(form) {
        $(form).reset();
        return form;
    },

    serializeElements: function(elements, options) {
        if (typeof options != 'object') options = { hash: !!options };
        else if (Object.isUndefined(options.hash)) options.hash = true;
        var key, value, submitted = false, submit = options.submit;

        var data = elements.inject({ }, function(result, element) {
            if (!element.disabled && element.name) {
                key = element.name; value = $(element).getValue();
                if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
                            submit !== false && (!submit || key == submit) && (submitted = true)))) {
                                if (key in result) {
                                    if (!Object.isArray(result[key])) result[key] = [result[key]];
                                    result[key].push(value);
                                }
                                else result[key] = value;
                            }
            }
            return result;
        });

        return options.hash ? data : Object.toQueryString(data);
    }
};

Form.Methods = {
    serialize: function(form, options) {
        return Form.serializeElements(Form.getElements(form), options);
    },

    getElements: function(form) {
        return $A($(form).getElementsByTagName('*')).inject([],
                function(elements, child) {
                    if (Form.Element.Serializers[child.tagName.toLowerCase()])
            elements.push(Element.extend(child));
        return elements;
                }
                );
    },

    getInputs: function(form, typeName, name) {
        form = $(form);
        var inputs = form.getElementsByTagName('input');

        if (!typeName && !name) return $A(inputs).map(Element.extend);

        for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
            var input = inputs[i];
            if ((typeName && input.type != typeName) || (name && input.name != name))
                continue;
            matchingInputs.push(Element.extend(input));
        }

        return matchingInputs;
    },

    disable: function(form) {
        form = $(form);
        Form.getElements(form).invoke('disable');
        return form;
    },

    enable: function(form) {
        form = $(form);
        Form.getElements(form).invoke('enable');
        return form;
    },

    findFirstElement: function(form) {
        var elements = $(form).getElements().findAll(function(element) {
            return 'hidden' != element.type && !element.disabled;
        });
        var firstByIndex = elements.findAll(function(element) {
            return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
        }).sortBy(function(element) { return element.tabIndex }).first();

        return firstByIndex ? firstByIndex : elements.find(function(element) {
            return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
        });
    },

    focusFirstElement: function(form) {
        form = $(form);
        form.findFirstElement().activate();
        return form;
    },

    request: function(form, options) {
        form = $(form), options = Object.clone(options || { });

        var params = options.parameters, action = form.readAttribute('action') || '';
        if (action.blank()) action = window.location.href;
        options.parameters = form.serialize(true);

        if (params) {
            if (Object.isString(params)) params = params.toQueryParams();
            Object.extend(options.parameters, params);
        }

        if (form.hasAttribute('method') && !options.method)
            options.method = form.method;

        return new Ajax.Request(action, options);
    }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
    focus: function(element) {
        $(element).focus();
        return element;
    },

    select: function(element) {
        $(element).select();
        return element;
    }
};

Form.Element.Methods = {
    serialize: function(element) {
        element = $(element);
        if (!element.disabled && element.name) {
            var value = element.getValue();
            if (value != undefined) {
                var pair = { };
                pair[element.name] = value;
                return Object.toQueryString(pair);
            }
        }
        return '';
    },

    getValue: function(element) {
        element = $(element);
        var method = element.tagName.toLowerCase();
        return Form.Element.Serializers[method](element);
    },

    setValue: function(element, value) {
        element = $(element);
        var method = element.tagName.toLowerCase();
        Form.Element.Serializers[method](element, value);
        return element;
    },

    clear: function(element) {
        $(element).value = '';
        return element;
    },

    present: function(element) {
        return $(element).value != '';
    },

    activate: function(element) {
        element = $(element);
        try {
            element.focus();
            if (element.select && (element.tagName.toLowerCase() != 'input' ||
                        !['button', 'reset', 'submit'].include(element.type)))
                element.select();
        } catch (e) { }
        return element;
    },

    disable: function(element) {
        element = $(element);
        element.disabled = true;
        return element;
    },

    enable: function(element) {
        element = $(element);
        element.disabled = false;
        return element;
    }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
    input: function(element, value) {
        switch (element.type.toLowerCase()) {
            case 'checkbox':
            case 'radio':
                return Form.Element.Serializers.inputSelector(element, value);
            default:
                return Form.Element.Serializers.textarea(element, value);
        }
    },

    inputSelector: function(element, value) {
        if (Object.isUndefined(value)) return element.checked ? element.value : null;
        else element.checked = !!value;
    },

    textarea: function(element, value) {
        if (Object.isUndefined(value)) return element.value;
        else element.value = value;
    },

    select: function(element, value) {
        if (Object.isUndefined(value))
            return this[element.type == 'select-one' ?
                'selectOne' : 'selectMany'](element);
        else {
            var opt, currentValue, single = !Object.isArray(value);
            for (var i = 0, length = element.length; i < length; i++) {
                opt = element.options[i];
                currentValue = this.optionValue(opt);
                if (single) {
                    if (currentValue == value) {
                        opt.selected = true;
                        return;
                    }
                }
                else opt.selected = value.include(currentValue);
            }
        }
    },

    selectOne: function(element) {
        var index = element.selectedIndex;
        return index >= 0 ? this.optionValue(element.options[index]) : null;
    },

    selectMany: function(element) {
        var values, length = element.length;
        if (!length) return null;

        for (var i = 0, values = []; i < length; i++) {
            var opt = element.options[i];
            if (opt.selected) values.push(this.optionValue(opt));
        }
        return values;
    },

    optionValue: function(opt) {
        return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
    }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
    initialize: function($super, element, frequency, callback) {
        $super(callback, frequency);
        this.element   = $(element);
        this.lastValue = this.getValue();
    },

    execute: function() {
        var value = this.getValue();
        if (Object.isString(this.lastValue) && Object.isString(value) ?
            this.lastValue != value : String(this.lastValue) != String(value)) {
                this.callback(this.element, value);
                this.lastValue = value;
            }
    }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
    getValue: function() {
        return Form.Element.getValue(this.element);
    }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
    getValue: function() {
        return Form.serialize(this.element);
    }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
    initialize: function(element, callback) {
        this.element  = $(element);
        this.callback = callback;

        this.lastValue = this.getValue();
        if (this.element.tagName.toLowerCase() == 'form')
    this.registerFormCallbacks();
        else
    this.registerCallback(this.element);
    },

    onElementEvent: function() {
        var value = this.getValue();
        if (this.lastValue != value) {
            this.callback(this.element, value);
            this.lastValue = value;
        }
    },

    registerFormCallbacks: function() {
        Form.getElements(this.element).each(this.registerCallback, this);
    },

    registerCallback: function(element) {
        if (element.type) {
            switch (element.type.toLowerCase()) {
                case 'checkbox':
                case 'radio':
                    Event.observe(element, 'click', this.onElementEvent.bind(this));
                    break;
                default:
                    Event.observe(element, 'change', this.onElementEvent.bind(this));
                    break;
            }
        }
    }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
    getValue: function() {
        return Form.Element.getValue(this.element);
    }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
    getValue: function() {
        return Form.serialize(this.element);
    }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: { },

    relatedTarget: function(event) {
        var element;
        switch(event.type) {
            case 'mouseover': element = event.fromElement; break;
            case 'mouseout':  element = event.toElement;   break;
            default: return null;
        }
        return Element.extend(element);
    }
});

Event.Methods = (function() {
    var isButton;

    if (Prototype.Browser.IE) {
        var buttonMap = { 0: 1, 1: 4, 2: 2 };
        isButton = function(event, code) {
            return event.button == buttonMap[code];
        };

    } else if (Prototype.Browser.WebKit) {
        isButton = function(event, code) {
            switch (code) {
                case 0: return event.which == 1 && !event.metaKey;
                case 1: return event.which == 1 && event.metaKey;
                default: return false;
            }
        };

    } else {
        isButton = function(event, code) {
            return event.which ? (event.which === code + 1) : (event.button === code);
        };
    }

    return {
        isLeftClick:   function(event) { return isButton(event, 0) },
            isMiddleClick: function(event) { return isButton(event, 1) },
            isRightClick:  function(event) { return isButton(event, 2) },

            element: function(event) {
                event = Event.extend(event);

                var node          = event.target,
                    type          = event.type,
                    currentTarget = event.currentTarget;

                if (currentTarget && currentTarget.tagName) {
                    if (type === 'load' || type === 'error' ||
                            (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
                             && currentTarget.type === 'radio'))
                        node = currentTarget;
                }
                if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
                return Element.extend(node);
            },

            findElement: function(event, expression) {
                var element = Event.element(event);
                if (!expression) return element;
                var elements = [element].concat(element.ancestors());
                return Selector.findElement(elements, expression, 0);
            },

            pointer: function(event) {
                var docElement = document.documentElement,
                body = document.body || { scrollLeft: 0, scrollTop: 0 };
                return {
                    x: event.pageX || (event.clientX +
                               (docElement.scrollLeft || body.scrollLeft) -
                               (docElement.clientLeft || 0)),
                        y: event.pageY || (event.clientY +
                                (docElement.scrollTop || body.scrollTop) -
                                (docElement.clientTop || 0))
                };
            },

            pointerX: function(event) { return Event.pointer(event).x },
            pointerY: function(event) { return Event.pointer(event).y },

            stop: function(event) {
                Event.extend(event);
                event.preventDefault();
                event.stopPropagation();
                event.stopped = true;
            }
    };
})();

Event.extend = (function() {
    var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
        m[name] = Event.Methods[name].methodize();
        return m;
    });

    if (Prototype.Browser.IE) {
        Object.extend(methods, {
            stopPropagation: function() { this.cancelBubble = true },
            preventDefault:  function() { this.returnValue = false },
            inspect: function() { return "[object Event]" }
        });

        return function(event) {
            if (!event) return false;
            if (event._extendedByPrototype) return event;

            event._extendedByPrototype = Prototype.emptyFunction;
            var pointer = Event.pointer(event);
            Object.extend(event, {
                target: event.srcElement,
                relatedTarget: Event.relatedTarget(event),
                pageX:  pointer.x,
                pageY:  pointer.y
            });
            return Object.extend(event, methods);
        };

    } else {
        Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
        Object.extend(Event.prototype, methods);
        return Prototype.K;
    }
})();

Object.extend(Event, (function() {
    var cache = Event.cache;

    function getEventID(element) {
        if (element._prototypeEventID) return element._prototypeEventID[0];
        arguments.callee.id = arguments.callee.id || 1;
        return element._prototypeEventID = [++arguments.callee.id];
    }

    function getDOMEventName(eventName) {
        if (eventName && eventName.include(':')) return "dataavailable";
        return eventName;
    }

    function getCacheForID(id) {
        return cache[id] = cache[id] || { };
    }

    function getWrappersForEventName(id, eventName) {
        var c = getCacheForID(id);
        return c[eventName] = c[eventName] || [];
    }

    function createWrapper(element, eventName, handler) {
        var id = getEventID(element);
        var c = getWrappersForEventName(id, eventName);
        if (c.pluck("handler").include(handler)) return false;

        var wrapper = function(event) {
            if (!Event || !Event.extend ||
                    (event.eventName && event.eventName != eventName))
                return false;

            Event.extend(event);
            handler.call(element, event);
        };

        wrapper.handler = handler;
        c.push(wrapper);
        return wrapper;
    }

    function findWrapper(id, eventName, handler) {
        var c = getWrappersForEventName(id, eventName);
        return c.find(function(wrapper) { return wrapper.handler == handler });
    }

    function destroyWrapper(id, eventName, handler) {
        var c = getCacheForID(id);
        if (!c[eventName]) return false;
        c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
    }

    function destroyCache() {
        for (var id in cache)
            for (var eventName in cache[id])
                cache[id][eventName] = null;
    }


    if (window.attachEvent) {
        window.attachEvent("onunload", destroyCache);
    }

    if (Prototype.Browser.WebKit) {
        window.addEventListener('unload', Prototype.emptyFunction, false);
    }

    return {
        observe: function(element, eventName, handler) {
            element = $(element);
            var name = getDOMEventName(eventName);

            var wrapper = createWrapper(element, eventName, handler);
            if (!wrapper) return element;

            if (element.addEventListener) {
                element.addEventListener(name, wrapper, false);
            } else {
                element.attachEvent("on" + name, wrapper);
            }

            return element;
        },

        stopObserving: function(element, eventName, handler) {
            element = $(element);
            var id = getEventID(element), name = getDOMEventName(eventName);

            if (!handler && eventName) {
                getWrappersForEventName(id, eventName).each(function(wrapper) {
                    element.stopObserving(eventName, wrapper.handler);
                });
                return element;

            } else if (!eventName) {
                Object.keys(getCacheForID(id)).each(function(eventName) {
                    element.stopObserving(eventName);
                });
                return element;
            }

            var wrapper = findWrapper(id, eventName, handler);
            if (!wrapper) return element;

            if (element.removeEventListener) {
                element.removeEventListener(name, wrapper, false);
            } else {
                element.detachEvent("on" + name, wrapper);
            }

            destroyWrapper(id, eventName, handler);

            return element;
        },

        fire: function(element, eventName, memo) {
            element = $(element);
            if (element == document && document.createEvent && !element.dispatchEvent)
                element = document.documentElement;

            var event;
            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("dataavailable", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "ondataavailable";
            }

            event.eventName = eventName;
            event.memo = memo || { };

            if (document.createEvent) {
                element.dispatchEvent(event);
            } else {
                element.fireEvent(event.eventType, event);
            }

            return Event.extend(event);
        }
    };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
    fire:          Event.fire,
    observe:       Event.observe,
    stopObserving: Event.stopObserving
});

Object.extend(document, {
    fire:          Element.Methods.fire.methodize(),
    observe:       Element.Methods.observe.methodize(),
    stopObserving: Element.Methods.stopObserving.methodize(),
    loaded:        false
});

(function() {
    /* Support for the DOMContentLoaded event is based on work by Dan Webb,
       Matthias Miller, Dean Edwards and John Resig. */

    var timer;

    function fireContentLoadedEvent() {
        if (document.loaded) return;
        if (timer) window.clearInterval(timer);
        document.fire("dom:loaded");
        document.loaded = true;
    }

    if (document.addEventListener) {
        if (Prototype.Browser.WebKit) {
            timer = window.setInterval(function() {
                if (/loaded|complete/.test(document.readyState))
                fireContentLoadedEvent();
            }, 0);

            Event.observe(window, "load", fireContentLoadedEvent);

        } else {
            document.addEventListener("DOMContentLoaded",
                    fireContentLoadedEvent, false);
        }

    } else {
        document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
        $("__onDOMContentLoaded").onreadystatechange = function() {
            if (this.readyState == "complete") {
                this.onreadystatechange = null;
                fireContentLoadedEvent();
            }
        };
    }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
    Before: function(element, content) {
        return Element.insert(element, {before:content});
    },

    Top: function(element, content) {
        return Element.insert(element, {top:content});
    },

    Bottom: function(element, content) {
        return Element.insert(element, {bottom:content});
    },

    After: function(element, content) {
        return Element.insert(element, {after:content});
    }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
    includeScrollOffsets: false,

    prepare: function() {
        this.deltaX =  window.pageXOffset
            || document.documentElement.scrollLeft
            || document.body.scrollLeft
            || 0;
        this.deltaY =  window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
    },

    within: function(element, x, y) {
        if (this.includeScrollOffsets)
            return this.withinIncludingScrolloffsets(element, x, y);
        this.xcomp = x;
        this.ycomp = y;
        this.offset = Element.cumulativeOffset(element);

        return (y >= this.offset[1] &&
                y <  this.offset[1] + element.offsetHeight &&
                x >= this.offset[0] &&
                x <  this.offset[0] + element.offsetWidth);
    },

    withinIncludingScrolloffsets: function(element, x, y) {
        var offsetcache = Element.cumulativeScrollOffset(element);

        this.xcomp = x + offsetcache[0] - this.deltaX;
        this.ycomp = y + offsetcache[1] - this.deltaY;
        this.offset = Element.cumulativeOffset(element);

        return (this.ycomp >= this.offset[1] &&
                this.ycomp <  this.offset[1] + element.offsetHeight &&
                this.xcomp >= this.offset[0] &&
                this.xcomp <  this.offset[0] + element.offsetWidth);
    },

    overlap: function(mode, element) {
        if (!mode) return 0;
        if (mode == 'vertical')
            return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
                element.offsetHeight;
        if (mode == 'horizontal')
            return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
                element.offsetWidth;
    },


    cumulativeOffset: Element.Methods.cumulativeOffset,

    positionedOffset: Element.Methods.positionedOffset,

    absolutize: function(element) {
        Position.prepare();
        return Element.absolutize(element);
    },

    relativize: function(element) {
        Position.prepare();
        return Element.relativize(element);
    },

    realOffset: Element.Methods.cumulativeScrollOffset,

    offsetParent: Element.Methods.getOffsetParent,

    page: Element.Methods.viewportOffset,

    clone: function(source, target, options) {
        options = options || { };
        return Element.clonePosition(target, source, options);
    }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
    function iter(name) {
        return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
    }

    instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
        function(element, className) {
            className = className.toString().strip();
            var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
            return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
        } : function(element, className) {
            className = className.toString().strip();
            var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
            if (!classNames && !className) return elements;

            var nodes = $(element).getElementsByTagName('*');
            className = ' ' + className + ' ';

            for (var i = 0, child, cn; child = nodes[i]; i++) {
                if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
                            (classNames && classNames.all(function(name) {
                                return !name.toString().blank() && cn.include(' ' + name + ' ');
                            }))))
                elements.push(Element.extend(child));
            }
            return elements;
        };

    return function(className, parentElement) {
        return $(parentElement || document.body).getElementsByClassName(className);
    };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
    initialize: function(element) {
        this.element = $(element);
    },

    _each: function(iterator) {
        this.element.className.split(/\s+/).select(function(name) {
            return name.length > 0;
        })._each(iterator);
    },

    set: function(className) {
        this.element.className = className;
    },

    add: function(classNameToAdd) {
        if (this.include(classNameToAdd)) return;
        this.set($A(this).concat(classNameToAdd).join(' '));
    },

    remove: function(classNameToRemove) {
        if (!this.include(classNameToRemove)) return;
        this.set($A(this).without(classNameToRemove).join(' '));
    },

    toString: function() {
        return $A(this).join(' ');
    }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();

/* **** END PROTOTYPE **** */

/* **** BEGIN MATRIX **** */

var Matrix = function (w, h, values) {
    this.w = w;
    this.h = h;
    this.values = values || Matrix.allocate(h);
};

Matrix.allocate = function (w, h) {
    var values = [];
    for (var i = 0; i < h; ++i) {
        values[i] = [];
        for (var j = 0; j < w; ++j) {
            values[i][j] = 0;
        }
    }
    return values;
}

Matrix.cloneValues = function (values) {
    clone = [];
    for (var i = 0; i < values.length; ++i) {
        clone[i] = [].concat(values[i]);
    }
    return clone;
}

Matrix.prototype.add = function (operand) {
    if (operand.w != this.w || operand.h != this.h) {
        throw "Matrix add size mismatch";
    }

    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.h; ++y) {
        for (var x = 0; x < this.w; ++x) {
            values[y][x] = this.values[y][x] + operand.values[y][x];
        }
    }
    return new Matrix(this.w, this.h, values);
};

Matrix.prototype.transformProjectiveVector = function (operand) {
    var out = [];
    for (var y = 0; y < this.h; ++y) {
        out[y] = 0;
        for (var x = 0; x < this.w; ++x) {
            out[y] += this.values[y][x] * operand[x];
        }
    }
    var iz = 1 / (out[out.length - 1]);
    for (var y = 0; y < this.h; ++y) {
        out[y] *= iz;
    }
    return out;
}

Matrix.prototype.multiply = function (operand) {
    if (+operand !== operand) {
        if (operand.h != this.w) {
            throw "Matrix mult size mismatch";
        }
        var values = Matrix.allocate(this.w, this.h);
        for (var y = 0; y < this.h; ++y) {
            for (var x = 0; x < operand.w; ++x) {
                var accum = 0;
                for (var s = 0; s < this.w; s++) {
                    accum += this.values[y][s] * operand.values[s][x];
                }
                values[y][x] = accum;
            }
        }
        return new Matrix(operand.w, this.h, values);
    }
    else {
        var values = Matrix.allocate(this.w, this.h);
        for (var y = 0; y < this.h; ++y) {
            for (var x = 0; x < this.w; ++x) {
                values[y][x] = this.values[y][x] * operand;
            }
        }
        return new Matrix(this.w, this.h, values);
    }
};

Matrix.prototype.rowEchelon = function () {
    if (this.w <= this.h) {
        throw "Matrix rowEchelon size mismatch";
    }

    var temp = Matrix.cloneValues(this.values);

    for (var yp = 0; yp < this.h; ++yp) {
        var pivot = temp[yp][yp];
        while (pivot == 0) {
            for (var ys = yp + 1; ys < this.h; ++ys) {
                if (temp[ys][yp] != 0) {
                    var tmpRow = temp[ys];
                    temp[ys] = temp[yp];
                    temp[yp] = tmpRow;
                    break;
                }
            }
            if (ys == this.h) {
                return new Matrix(this.w, this.h, temp);
            }
            else {
                pivot = temp[yp][yp];
            }
        };
        var scale = 1 / pivot;
        for (var x = yp; x < this.w; ++x) {
            temp[yp][x] *= scale;
        }
        for (var y = 0; y < this.h; ++y) {
            if (y == yp) continue;
            var factor = temp[y][yp];
            temp[y][yp] = 0;
            for (var x = yp + 1; x < this.w; ++x) {
                temp[y][x] -= factor * temp[yp][x];
            }
        }
    }

    return new Matrix(this.w, this.h, temp);
}

Matrix.prototype.invert = function () {
    if (this.w != this.h) {
        throw "Matrix invert size mismatch";
    }

    var temp = Matrix.allocate(this.w * 2, this.h);

    for (var y = 0; y < this.h; ++y) {
        for (var x = 0; x < this.w; ++x) {
            temp[y][x] = this.values[y][x];
            temp[y][x + this.w] = (x == y) ? 1 : 0;
        }
    }

    temp = new Matrix(this.w * 2, this.h, temp);
    temp = temp.rowEchelon();

    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.w; ++y) {
        for (var x = 0; x < this.w; ++x) {
            values[y][x] = temp.values[y][x + this.w];
        }
    }
    return new Matrix(this.w, this.h, values);
};

Matrix.prototype.print = function () {
    var out = "<table>";
    for (var y = 0; y < this.h; ++y) {
        out += '<tr>';
        for (var x = 0; x < this.w; ++x) {
            out += '<td>';
            out += Math.round(this.values[y][x] * 100.0) / 100.0;
            out += '</td>';
        }
        out += '</tr>';
    }
    out += '</table>';
    $('body').append(out);

    return this;
};


/* **** END MATRIX **** */

/* **** BEGIN PROTOTYPE-GRAPHIC **** */


/* **** END PROTOTYPE-GRAPHIC **** */

/* **** BEGIN GEOHASH **** */


BITS = [16, 8, 4, 2, 1];

BASE32 = 											   "0123456789bcdefghjkmnpqrstuvwxyz";
NEIGHBORS = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
    left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
    top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
    bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" } };
BORDERS   = { right  : { even : "bcfguvyz" },
    left   : { even : "0145hjnp" },
    top    : { even : "prxz" },
    bottom : { even : "028b" } };

NEIGHBORS.bottom.odd = NEIGHBORS.left.even;
NEIGHBORS.top.odd = NEIGHBORS.right.even;
NEIGHBORS.left.odd = NEIGHBORS.bottom.even;
NEIGHBORS.right.odd = NEIGHBORS.top.even;

BORDERS.bottom.odd = BORDERS.left.even;
BORDERS.top.odd = BORDERS.right.even;
BORDERS.left.odd = BORDERS.bottom.even;
BORDERS.right.odd = BORDERS.top.even;

function refine_interval(interval, cd, mask) {
    if (cd&mask)
        interval[0] = (interval[0] + interval[1])/2;
    else
        interval[1] = (interval[0] + interval[1])/2;
}

function calculateAdjacent(srcHash, dir) {
    srcHash = srcHash.toLowerCase();
    var lastChr = srcHash.charAt(srcHash.length-1);
    var type = (srcHash.length % 2) ? 'odd' : 'even';
    var base = srcHash.substring(0,srcHash.length-1);
    if (BORDERS[dir][type].indexOf(lastChr)!=-1)
        base = calculateAdjacent(base, dir);
    return base + BASE32[NEIGHBORS[dir][type].indexOf(lastChr)];
}

function decodeGeoHash(geohash) {
    var is_even = 1;
    var lat = []; var lon = [];
    lat[0] = -90.0;  lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;
    lat_err = 90.0;  lon_err = 180.0;

    for (i=0; i<geohash.length; i++) {
        c = geohash[i];
        cd = BASE32.indexOf(c);
        for (j=0; j<5; j++) {
            mask = BITS[j];
            if (is_even) {
                lon_err /= 2;
                refine_interval(lon, cd, mask);
            } else {
                lat_err /= 2;
                refine_interval(lat, cd, mask);
            }
            is_even = !is_even;
        }
    }
    lat[2] = (lat[0] + lat[1])/2;
    lon[2] = (lon[0] + lon[1])/2;

    return { latitude: lat, longitude: lon};
}

function encodeGeoHash(latitude, longitude) {
    var is_even=1;
    var i=0;
    var lat = []; var lon = [];
    var bit=0;
    var ch=0;
    var precision = 12;
    geohash = "";

    lat[0] = -90.0;  lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;

    while (geohash.length < precision) {
        if (is_even) {
            mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= BITS[bit];
                lon[0] = mid;
            } else
                lon[1] = mid;
        } else {
            mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= BITS[bit];
                lat[0] = mid;
            } else
                lat[1] = mid;
        }

        is_even = !is_even;
        if (bit < 4)
            bit++;
        else {
            geohash += BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
}

/* **** END GEOHASH **** */


/* **** BEGIN LIVEPIPE **** */

/*
 * @author Ryan Johnson <http://syntacticx.com/>
 * @copyright 2008 PersonalGrid Corporation <http://personalgrid.com/>
 * @package LivePipe UI
 * @license MIT
 * @url http://livepipe.net/core
 * @require prototype.js
 */

if(typeof(Control) == 'undefined')
Control = {};

var $proc = function(proc){
    return typeof(proc) == 'function' ? proc : function(){return proc};
};

var $value = function(value){
    return typeof(value) == 'function' ? value() : value;
};

Object.Event = {
    extend: function(object){
        object._objectEventSetup = function(event_name){
            this._observers = this._observers || {};
            this._observers[event_name] = this._observers[event_name] || [];
        };
        object.observe = function(event_name,observer){
            if(typeof(event_name) == 'string' && typeof(observer) != 'undefined'){
                this._objectEventSetup(event_name);
                if(!this._observers[event_name].include(observer))
                    this._observers[event_name].push(observer);
            }else
                for(var e in event_name)
                    this.observe(e,event_name[e]);
        };
        object.stopObserving = function(event_name,observer){
            this._objectEventSetup(event_name);
            if(event_name && observer)
                this._observers[event_name] = this._observers[event_name].without(observer);
            else if(event_name)
                this._observers[event_name] = [];
            else
                this._observers = {};
        };
        object.observeOnce = function(event_name,outer_observer){
            var inner_observer = function(){
                outer_observer.apply(this,arguments);
                this.stopObserving(event_name,inner_observer);
            }.bind(this);
            this._objectEventSetup(event_name);
            this._observers[event_name].push(inner_observer);
        };
        object.notify = function(event_name){
            this._objectEventSetup(event_name);
            var collected_return_values = [];
            var args = $A(arguments).slice(1);
            try{
                for(var i = 0; i < this._observers[event_name].length; ++i)
                    collected_return_values.push(this._observers[event_name][i].apply(this._observers[event_name][i],args) || null);
            }catch(e){
                if(e == $break)
                    return false;
                else
                    throw e;
            }
            return collected_return_values;
        };
        if(object.prototype){
            object.prototype._objectEventSetup = object._objectEventSetup;
            object.prototype.observe = object.observe;
            object.prototype.stopObserving = object.stopObserving;
            object.prototype.observeOnce = object.observeOnce;
            object.prototype.notify = function(event_name){
                if(object.notify){
                    var args = $A(arguments).slice(1);
                    args.unshift(this);
                    args.unshift(event_name);
                    object.notify.apply(object,args);
                }
                this._objectEventSetup(event_name);
                var args = $A(arguments).slice(1);
                var collected_return_values = [];
                try{
                    if(this.options && this.options[event_name] && typeof(this.options[event_name]) == 'function')
                        collected_return_values.push(this.options[event_name].apply(this,args) || null);
                    for(var i = 0; i < this._observers[event_name].length; ++i)
                        collected_return_values.push(this._observers[event_name][i].apply(this._observers[event_name][i],args) || null);
                }catch(e){
                    if(e == $break)
                        return false;
                    else
                        throw e;
                }
                return collected_return_values;
            };
        }
    }
};

/* Begin Core Extensions */

Element.addMethods({
    observeOnce: function(element,event_name,outer_callback){
        var inner_callback = function(){
            outer_callback.apply(this,arguments);
            Element.stopObserving(element,event_name,inner_callback);
        };
        Element.observe(element,event_name,inner_callback);
    }
});

Object.extend(Event, (function() {
    var cache = Event.cache;

    function getEventID(element) {
        if (element._prototypeEventID) return element._prototypeEventID[0];
        arguments.callee.id = arguments.callee.id || 1;
        return element._prototypeEventID = [++arguments.callee.id];
    }

    function getDOMEventName(eventName) {
        if (eventName && eventName.include(':')) return "dataavailable";
        if(!Prototype.Browser.IE){
            eventName = {
                mouseenter: 'mouseover',
    mouseleave: 'mouseout'
            }[eventName] || eventName;
        }
        return eventName;
    }

    function getCacheForID(id) {
        return cache[id] = cache[id] || { };
    }

    function getWrappersForEventName(id, eventName) {
        var c = getCacheForID(id);
        return c[eventName] = c[eventName] || [];
    }

    function createWrapper(element, eventName, handler) {
        var id = getEventID(element);
        var c = getWrappersForEventName(id, eventName);
        if (c.pluck("handler").include(handler)) return false;

        var wrapper = function(event) {
            if (!Event || !Event.extend ||
                    (event.eventName && event.eventName != eventName))
                return false;

            Event.extend(event);
            handler.call(element, event);
        };

        if(!(Prototype.Browser.IE) && ['mouseenter','mouseleave'].include(eventName)){
            wrapper = wrapper.wrap(function(proceed,event) {
                var rel = event.relatedTarget;
                var cur = event.currentTarget;
                if(rel && rel.nodeType == Node.TEXT_NODE)
                rel = rel.parentNode;
            if(rel && rel != cur && !rel.descendantOf(cur))
                return proceed(event);
            });
        }

        wrapper.handler = handler;
        c.push(wrapper);
        return wrapper;
    }

    function findWrapper(id, eventName, handler) {
        var c = getWrappersForEventName(id, eventName);
        return c.find(function(wrapper) { return wrapper.handler == handler });
    }

    function destroyWrapper(id, eventName, handler) {
        var c = getCacheForID(id);
        if (!c[eventName]) return false;
        c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
    }

    function destroyCache() {
        for (var id in cache)
            for (var eventName in cache[id])
                cache[id][eventName] = null;
    }

    if (window.attachEvent) {
        window.attachEvent("onunload", destroyCache);
    }

    return {
        observe: function(element, eventName, handler) {
            element = $(element);
            var name = getDOMEventName(eventName);

            var wrapper = createWrapper(element, eventName, handler);
            if (!wrapper) return element;

            if (element.addEventListener) {
                element.addEventListener(name, wrapper, false);
            } else {
                element.attachEvent("on" + name, wrapper);
            }

            return element;
        },

        stopObserving: function(element, eventName, handler) {
            element = $(element);
            var id = getEventID(element), name = getDOMEventName(eventName);

            if (!handler && eventName) {
                getWrappersForEventName(id, eventName).each(function(wrapper) {
                    element.stopObserving(eventName, wrapper.handler);
                });
                return element;

            } else if (!eventName) {
                Object.keys(getCacheForID(id)).each(function(eventName) {
                    element.stopObserving(eventName);
                });
                return element;
            }

            var wrapper = findWrapper(id, eventName, handler);
            if (!wrapper) return element;

            if (element.removeEventListener) {
                element.removeEventListener(name, wrapper, false);
            } else {
                element.detachEvent("on" + name, wrapper);
            }

            destroyWrapper(id, eventName, handler);

            return element;
        },

        fire: function(element, eventName, memo) {
            element = $(element);
            if (element == document && document.createEvent && !element.dispatchEvent)
                element = document.documentElement;

            var event;
            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("dataavailable", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "ondataavailable";
            }

            event.eventName = eventName;
            event.memo = memo || { };

            if (document.createEvent) {
                element.dispatchEvent(event);
            } else {
                element.fireEvent(event.eventType, event);
            }

            return Event.extend(event);
        }
    };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
    fire:            Event.fire,
    observe:        Event.observe,
    stopObserving:    Event.stopObserving
});

Object.extend(document, {
    fire:            Element.Methods.fire.methodize(),
    observe:        Element.Methods.observe.methodize(),
    stopObserving:    Element.Methods.stopObserving.methodize()
});

(function(){
    function wheel(event){
        var delta;
        if(event.wheelDelta) // IE & Opera
    delta = event.wheelDelta / 120;
        else if (event.detail) // W3C
    delta =- event.detail / 3;
if(!delta)
    return;
var custom_event = Event.element(event).fire('mouse:wheel',{
    delta: delta
});
if(custom_event.stopped){
    Event.stop(event);
    return false;
}
}
document.observe('mousewheel',wheel);
document.observe('DOMMouseScroll',wheel);
})();

/* End Core Extensions */

var IframeShim = Class.create({
    initialize: function() {
        this.element = new Element('iframe',{
            style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
            src: 'javascript:void(0);',
            frameborder: 0
        });
        $(document.body).insert(this.element);
    },
    hide: function() {
        this.element.hide();
        return this;
    },
    show: function() {
        this.element.show();
        return this;
    },
    positionUnder: function(element) {
        var element = $(element);
        var offset = element.cumulativeOffset();
        var dimensions = element.getDimensions();
        this.element.setStyle({
            left: offset[0] + 'px',
            top: offset[1] + 'px',
            width: dimensions.width + 'px',
            height: dimensions.height + 'px',
            zIndex: element.getStyle('zIndex') - 1
        }).show();
        return this;
    },
    setBounds: function(bounds) {
        for(prop in bounds)
            bounds[prop] += 'px';
        this.element.setStyle(bounds);
        return this;
    },
    destroy: function() {
        if(this.element)
            this.element.remove();
        return this;
    }
});
/*
 * @author Ryan Johnson <http://syntacticx.com/>
 * @copyright 2008 PersonalGrid Corporation <http://personalgrid.com/>
 * @package LivePipe UI
 * @license MIT
 * @url http://livepipe.net/control/contextmenu
 * @require prototype.js, livepipe.js
 */

/*global window, document, Prototype, Class, Event, $, $A, $R, Control, $value */

if(typeof(Prototype) == "undefined") {
    throw "Control.ContextMenu requires Prototype to be loaded."; }
    if(typeof(Object.Event) == "undefined") {
        throw "Control.ContextMenu requires Object.Event to be loaded."; }

        Control.ContextMenu = Class.create({
            initialize: function(container,options){
                Control.ContextMenu.load();
                this.options = Object.extend({
                    leftClick: false,
                    disableOnShiftKey: true,
                    disableOnAltKey: true,
                    selectedClassName: 'selected',
                    activatedClassName: 'activated',
                    animation: true,
                    animationCycles: 2,
                    animationLength: 300,
                    delayCallback: true
                },options || {});
                this.activated = false;
                this.items = this.options.items || [];
                this.container = $(container);
                this.container.observe(this.options.leftClick ? 'click' : (Prototype.Browser.Opera ? 'click' : 'contextmenu'),function(event){
                    if(!Control.ContextMenu.enabled || Prototype.Browser.Opera && !event.ctrlKey) {
                        return; }
                    this.open(event);
                }.bindAsEventListener(this));
            },
                open: function(event){
                    if(Control.ContextMenu.current && !Control.ContextMenu.current.close()) {
                        return; }
                    if(this.notify('beforeOpen',event) === false) {
                        return false; }
                    this.buildMenu();
                    if(this.items.length === 0){
                        this.close(event);
                        return false;
                    }
                    this.clicked = Event.element(event);
                    Control.ContextMenu.current = this;
                    Control.ContextMenu.positionContainer(event);
                    Control.ContextMenu.container.show();
                    if(this.notify('afterOpen',event) === false) {
                        return false; }
                    event.stop();
                    return true;
                },
                close: function(event){
                    if(event) {
                        event.stop(); }
                    if(this.notify('beforeClose') === false) {
                        return false; }
                    Control.ContextMenu.current = false;
                    this.activated = false;
                    Control.ContextMenu.container.removeClassName(this.options.activatedClassName);
                    Control.ContextMenu.container.select('li').invoke('stopObserving');
                    Control.ContextMenu.container.hide();
                    Control.ContextMenu.container.update('');
                    if(this.notify('afterClose') === false) {
                        return false; }
                    return true;
                },
                buildMenu: function(){
                    var list = document.createElement('ul');
                    Control.ContextMenu.container.appendChild(list);
                    this.items.each(function(item){
                        if(!(!item.condition || item.condition && item.condition() !== false)) {
                            return; }
                        var item_container = $(document.createElement('li'));
                        item_container.update($value(item.label));
                        list.appendChild(item_container);
                        item_container[$value(item.enabled) ? 'removeClassName' : 'addClassName']('disabled');
                        item_container.observe('mousedown',function(event,item){
                            if(!$value(item.enabled)) {
                                return event.stop(); }
                            this.activated = $value(item.label);
                        }.bindAsEventListener(this,item));
                        item_container.observe('click',this.selectMenuItem.bindAsEventListener(this,item,item_container));
                        item_container.observe('contextmenu',this.selectMenuItem.bindAsEventListener(this,item,item_container));
                    }.bind(this));
                },
                addItem: function(params){
                    if (!('enabled' in params)) { params.enabled = true; }
                    this.items.push(params);
                    return this;
                },
                destroy: function(){
                    this.container.stopObserving(Prototype.Browser.Opera || this.options.leftClick ? 'click' : 'contextmenu');
                    this.items = [];
                },
                selectMenuItem: function(event,item,item_container){
                    if(!$value(item.enabled)) {
                        return event.stop(); }
                    if(!this.activated || this.activated == $value(item.label)){
                        if(this.options.animation){
                            Control.ContextMenu.container.addClassName(this.options.activatedClassName);
                            $A($R(0,this.options.animationCycles * 2)).each(function(i){
                                window.setTimeout(function(){
                                    item_container.toggleClassName(this.options.selectedClassName);
                                }.bind(this),i * parseInt(this.options.animationLength / (this.options.animationCycles * 2), 10));
                            }.bind(this));
                            window.setTimeout(function(){
                                if(this.close() && this.options.delayCallback) {
                                    item.callback(this.clicked); }
                            }.bind(this),this.options.animationLength);
                            if(!this.options.delayCallback) {
                                item.callback(this.clicked); }
                        }else if(this.close()) {
                            item.callback(this.clicked); }
                    }
                    event.stop();
                    return false;
                }
        });
Object.extend(Control.ContextMenu,{
    loaded: false,
    capture_all: false,
    menus: [],
    current: false,
    enabled: false,
    offset: 4,
    load: function(capture_all){
        if(Control.ContextMenu.loaded) {
            return; }
        Control.ContextMenu.loaded = true;
        if(typeof(capture_all) == 'undefined') {
            capture_all = false; }
        Control.ContextMenu.capture_all = capture_all;
        Control.ContextMenu.container = $(document.createElement('div'));
        Control.ContextMenu.container.id = 'control_contextmenu';
        Control.ContextMenu.container.style.position = 'absolute';
        Control.ContextMenu.container.style.zIndex = 99999;
        Control.ContextMenu.container.hide();
        document.body.appendChild(Control.ContextMenu.container);
        Control.ContextMenu.enable();
    },
    enable: function(){
        Control.ContextMenu.enabled = true;
        Event.observe(document.body,'click',Control.ContextMenu.onClick);
        if(Control.ContextMenu.capture_all) {
            Event.observe(document.body,'contextmenu',Control.ContextMenu.onContextMenu); }
    },
    disable: function(){
        Event.stopObserving(document.body,'click',Control.ContextMenu.onClick);
        if(Control.ContextMenu.capture_all) {
            Event.stopObserving(document.body,'contextmenu',Control.ContextMenu.onContextMenu);    }
    },
    onContextMenu: function(event){
        event.stop();
        return false;
    },
    onClick: function(){
        if(Control.ContextMenu.current) {
            Control.ContextMenu.current.close(); }
    },
    positionContainer: function(event){
        var dimensions = Control.ContextMenu.container.getDimensions();
        var top = Event.pointerY(event);
        var left = Event.pointerX(event);
        var bottom = dimensions.height + top;
        var right = dimensions.width + left;
        var viewport_dimensions = document.viewport.getDimensions();
        var viewport_scroll_offsets = document.viewport.getScrollOffsets();
        if(bottom > viewport_dimensions.height + viewport_scroll_offsets.top) {
            top -= bottom - ((viewport_dimensions.height  + viewport_scroll_offsets.top) - Control.ContextMenu.offset); }
        if(right > viewport_dimensions.width + viewport_scroll_offsets.left) {
            left -= right - ((viewport_dimensions.width + viewport_scroll_offsets.left) - Control.ContextMenu.offset); }
        Control.ContextMenu.container.setStyle({
            top: top + 'px',
            left: left + 'px'
        });
    }
});
Object.Event.extend(Control.ContextMenu);

/* **** END LIVEPIPE **** */


/* **** BEGIN CARTAGEN **** */

var Config = {
    stylesheet: "/style.gss",
    tiles: false,
    vectors: true,
    live: false,
    powersave: true,
    zoom_out_limit: 0.02,
    simplify: 1,
    padding_top: 0,
    padding_left: 0,
    live_gss: false,
    static_map: true,
    static_map_layers: ["/static/rome/park.js"],
    dynamic_layers: [],
    lat: 41.89685,
    lng: 12.49715,
    fullscreen: false,
    debug: false,
    load_user_features: false,
    aliases: $H({
        stylesheet: ['gss'],
    zoom_level: ['zoom']
    }),
    handlers: $H({
        debug: function(value) {
            $D.enable()
        Geohash.grid = true
        },
    grid: function(value) {
        Geohash.grid = true
        if (Object.isString(value)) Geohash.grid_color = value
    },
    fullscreen: function(value) {
        if ($('brief')) $('brief').hide()
    },
    static_map_layers: function(value) {
        if (typeof value == "string") {
            Config.static_map_layers = value.split(',')
        }
    },
    zoom_level: function(value) {
        Map.zoom = value
    }
    }),
    init: function(config) {
        Object.extend(this, config)
            Object.extend(this, this.get_url_params())

            this.apply_aliases()

            this.run_handlers()
    },
    get_url_params: function() {
        params = window.location.href.toQueryParams()
            $H(params).each(function(param){
                if (param.value == 'true') params[param.key] = true
                if (param.value == 'false') params[param.key] = false
            })
        return params
    },
    apply_aliases: function() {
        this.aliases.each(function(pair) {
            pair.value.each(function(value) {
                if (this[value]) this[pair.key] = this[value]
            }, this)
        }, this)
    },
    run_handlers: function() {
        this.handlers.each(Config.run_handler)
    },
    run_handler: function(handler) {
        if (Config[handler.key]) handler.value(Config[handler.key])
    }
}



var objects = []

PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined

if (typeof cartagen_base_uri == 'undefined') {
    cartagen_base_uri = 'cartagen'
}


var Cartagen = {
    label_queue: [],
    feature_queue: [],
    scripts: [],
    setup: function(configs) {
        $(document).observe('dom:loaded', function() {
            $('canvas').insert('<canvas style="z-index:20;" id="main"></canvas>')
            Cartagen.initialize(configs)
        })
    },
    initialize: function(configs) {
        Config.init(configs)

            if (window.PhoneGap) {
                Cartagen.scripts.unshift(cartagen_base_uri + '/lib/phonegap/phonegap.base.js',
                        cartagen_base_uri + '/lib/phonegap/geolocation.js',
                        cartagen_base_uri + '/lib/phonegap/iphone/phonegap.js',
                        cartagen_base_uri + '/lib/phonegap/iphone/geolocation.js')
            }

        Cartagen.load_next_script()

            this.browser_check()


            document.fire('cartagen:init')

            Glop.observe('glop:draw', Cartagen.draw.bindAsEventListener(this))
            Glop.observe('glop:postdraw', Cartagen.post_draw.bindAsEventListener(this))

            Style.load_styles(Config.stylesheet) // stylesheet

            if (!Config.static_map) {
                Importer.get_current_plot(true)
                    new PeriodicalExecuter(Glop.trigger_draw,3)
                    new PeriodicalExecuter(function() { Importer.get_current_plot(false) },3)
            } else {
                Config.static_map_layers.each(function(layer_url) {
                    $l('fetching '+layer_url)
                    Importer.get_static_plot(layer_url)
                },this)
                if (Config.dynamic_layers.length > 0) {
                    Config.dynamic_layers.each(function(layer_url) {
                        $l('fetching '+layer_url)
                        load_script(layer_url)
                    },this)
                }
            }

        Glop.trigger_draw()
            Interface.display_loading_message()
            Interface.setup_tooltips()

            document.fire('cartagen:postinit')
    },
    draw: function(e) {
        e.no_draw = true

            Style.style_body()

            if (Config.fps) {
                if ($('cartagen_fps')) {
                    $('cartagen_fps').innerHTML = Glop.fps
                } else {
                    $$('body')[0].insert({top:'<div style="position:absolute;margin:10px;font-weight:bold;background:white" id="cartagen_fps"></div>'})
                }
            }

        $C.translate(Glop.width / 2, Glop.height / 2)
            $C.rotate(Map.rotate)
            $C.scale(Map.zoom, Map.zoom)
            $C.translate(-Map.x,-Map.y)

            Viewport.draw() //adjust viewport

            Glop.fire('cartagen:predraw')

            Geohash.objects.each(function(object) {
                if (object.user_submitted) {
                    Cartagen.feature_queue.push(object)
                }
                else {
                    object.draw()
                }
            })

        this.feature_queue.each(function(item) {
            (item.draw.bind(item))()
        })
        this.feature_queue = []

            if (Prototype.Browser.MobileSafari || window.PhoneGap) User.mark()
    },
    post_draw: function() {
        this.label_queue.each(function(item) {
            item[0].draw(item[1], item[2])
        })

        this.label_queue = []

            Glop.fire('cartagen:postdraw')

            Interface.display_loading()
    },
    queue_label: function(label, x, y) {
        this.label_queue.push([label, x, y])
    },
    browser_check: function() {
        if ($('browsers')) {
            $('browsers').absolutize();
            $('browsers').style.top = "100px";
            $('browsers').style.margin = "0 auto";
            if (Prototype.Browser.IE) $('browsers').show();
        }
    },
    go_to: function(lat,lon,zoom_level) {
        Map.zoom = zoom_level || Map.zoom_level
            Map.lat = lat
            Map.lon = lon
            Map.x = Projection.lon_to_x(Map.lon)
            Map.y = Projection.lat_to_y(Map.lat)
    },
    highlight: function(query) {
        Geohash.objects.each(function(object) {
            object.highlight = false
            if (query != "" && object.tags && object instanceof Way) {
                object.tags.each(function(tag) {
                    if (tag.key.toLowerCase().match(query.toLowerCase()) || tag.value.toLowerCase().match(query.toLowerCase())) {
                        object.highlight = true
                    }
                })
                if (object.user && object.user.toLowerCase().match(query.toLowerCase())) object.highlight = true
            if (object.description && object.description.toLowerCase().match(query.toLowerCase())) object.highlight = true
            }
        })
    },
    show_gss_editor: function() {
        $('description').hide()
            $('brief').style.width = '28%'
            $('brief_first').style.width = '92%';
        $('gss').toggle()
            Config.live_gss = !Config.live_gss
    },
    redirect_to_image: function() {
        try {
            window.open($C.to_data_url())
        } catch(e) {
            alert("Sorry, this stylesheet uses remote images; JavaScript does not allow these to be used to generate an image.")
        }
    },
    load_next_script: function() {
        $l("loading: "+Cartagen.scripts[0])
            if (Cartagen.scripts.length > 0) {
                Cartagen.load_script(Cartagen.scripts.splice(0,1)[0])
            }
    },
    load_script: function(script) {
        $$('head')[0].insert(new Element('script', {
            'src': script,
        'type': 'text/javascript',
        'charset': 'utf-8',
        evalJSON: 'force'
        }));
    },
    import_kml: function(url) {
        new Ajax.Request(url,{
            method: 'get',
        onComplete: function(result) {
            $l('completed load of KML')
            response = result
            $l(xml2json.xml_to_object(result.responseText))
            $l('completed import of KML')
        }
        })

    },

    tags: function(type,filter) {
        type = type || "text"
            filter = filter || true
            var blacklist = ["created_by","tiger:upload_uuid","tiger:source","tiger:name_base","tiger:reviewed","tiger:cfcc","tiger:county","tiger:separated","tiger:name_base","tiger:name_type","tiger:tlid","tiger:zip_left","tiger:zip_right"]
            var tags = []
            Geohash.objects.each(function(obj) {
                if (obj.tags) obj.tags.each(function(tag){
                    var uniq = true
                    tags.each(function(oldtag) {
                        if (oldtag[0] == tag[0] && oldtag[1] == tag[1]) uniq = false
                    })
                if (uniq) {
                    if (filter) {
                        var blocked = false
                    blacklist.each(function(bad) {
                        if (tag[0] == bad || tag[1] == bad) blocked = true
                    })
                if (!blocked) {
                    tags.push(tag)
                }
                    } else {
                        tags.push(tag)
                    }
                }
                })
            })
        if (type == "text") return tags.toJSON()
        else if (type == "alert") alert(tags.toJSON())
        else return tags
    }
}

var Geometry = {
    poly_centroid: function(polygon) {
        var n = polygon.length
            var cx = 0, cy = 0
            var a = Geometry.poly_area(polygon,true)
            var centroid = []
            var i,j
            var factor = 0

            for (i=0;i<n;i++) {
                j = (i + 1) % n
                    factor = (polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y)
                    cx += (polygon[i].x + polygon[j].x) * factor
                    cy += (polygon[i].y + polygon[j].y) * factor
            }

        a *= 6
            factor = 1/a
            cx *= factor
            cy *= factor
            centroid[0] = cx
            centroid[1] = cy
            return centroid
    },
    calculate_bounding_box: function(points) {
        var bbox = [0,0,0,0] // top, left, bottom, right
            points.each(function(node) {
                if (node.x < bbox[1] || bbox[1] == 0) bbox[1] = node.x
                if (node.x > bbox[3] || bbox[3] == 0) bbox[3] = node.x
                if (node.y < bbox[0] || bbox[0] == 0) bbox[0] = node.y
                if (node.y > bbox[2] || bbox[2] == 0) bbox[2] = node.y
            })
        return bbox
    },
    overlaps: function(x1,y1,x2,y2,fudge) {
        if (x2 > x1-fudge && x2 < x1+fudge) {
            if (y2 > y1-fudge && y2 < y1+fudge) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    },
    intersect: function(box1top,box1left,box1bottom,box1right,box2top,box2left,box2bottom,box2right) {
        return !(box2left > box1right || box2right < box1left || box2top > box1bottom || box2bottom < box1top)
    },
    is_point_in_poly: function(poly, x, y){
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
                && (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                && (c = !c);
        return c;
    },

    point_line_distance: function(x, y, nodes){
        var seg
            var stop = nodes.length - 1
            min = Number.MAX_VALUE
            for(var i = 0; i < stop; ++i) {
                seg = {
                    x1: nodes[i].x,
                    y1: nodes[i].y,
                    x2: nodes[i+1].x,
                    y2: nodes[i+1].y
                }

                result = Geometry.distance_to_segment(x, y, seg.x1, seg.y1, seg.x2, seg.y2)

                    if(result < min) {
                        min = result
                            if(min === 0) {
                                break
                            }
                    } else {
                        if(seg.x2 > x && ((y > seg.y1 && y < seg.y2) || (y < seg.y1 && y > seg.y2))) {
                            break
                        }
                    }
            }
        return min
    },
    distance_to_segment: function(x0, y0, x1, y1, x2, y2) {
        var dx = x2 - x1
            var dy = y2 - y1
            var along = ((dx * (x0 - x1)) + (dy * (y0 - y1))) / (Math.pow(dx, 2) + Math.pow(dy, 2))
            var x, y
            if(along <= 0.0) {
                x = x1
                    y = y1
            } else if(along >= 1.0) {
                x = x2
                    y = y2
            } else {
                x = x1 + along * dx
                    y = y1 + along * dy
            }
        return Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2))
    },

    poly_area: function(nodes, signed) {
        var area = 0
            nodes.each(function(node,index) {
                if (index < nodes.length-1) next = nodes[index+1]
                else next = nodes[0]
                if (index > 0) last = nodes[index-1]
                else last = nodes[nodes.length-1]
                area += last.x*node.y-node.x*last.y+node.x*next.y-next.x*node.y
            })
        if (signed) return area/2
        else return Math.abs(area/2)
    },
    distance: function(x,y,x2,y2) {
        return Math.sqrt(Math.abs(x-x2)*Math.abs(x-x2)+Math.abs(y-y2)*Math.abs(y-y2))
    },
    sort_by_area: function(a,b) {
        if (a instanceof Way) {
            if (b instanceof Way) {
                if ( a.area < b.area )
                    return 1;
                if ( a.area > b.area )
                    return -1;
                return 0; // a == b
            } else {
                return -1 // a wins no matter what if b is not a Way
            }
        } else {
            return 1 // b wins no matter what if a is not a Way
        }
    }
}
$D = {
    enabled: false,
    enable: function() {
        $D.enabled = true
            if (console.firebug) {
                $D.log = console.debug
                    $D.warn = console.warn
                    $D.err = console.error
                    $D.trace = console.trace
                    $D.verbose_trace = $D._verbose_trace
            }
            else {
                $D.log = $D._log
                    $D.warn = $D._warn
                    $D.err = $D._err
                    $D.trace = $D._trace
                    $D.verbose_trace = $D._verbose_trace
            }
        $l = $D.log
    },
    disable: function() {
        $D.enabled = false

            (['log', 'warn', 'err', 'trace', 'verbose_trace']).each(function(m) {
                $D[m] = Prototype.emptyFunction
            })
    },

    log: Prototype.emptyFunction,

    _log: function(msg) {
        console.log(msg)
    },

    warn: Prototype.emptyFunction,

    _warn: function(msg) {
        console.warn(msg)
    },

    err: Prototype.emptyFunction,

    _err: function(msg) {
        console.err(msg)
    },

    trace: Prototype.emptyFunction,

    _trace: function() {
        console.trace()
    },

    verbose_trace: Prototype.emptyFunction,

    _verbose_trace: function(msg) {
        console.log("An exception occurred in the script. Error name: " + msg.name + ". Error description: " + msg.description + ". Error number: " + msg.number + ". Error message: " + msg.message + ". Line number: "+ msg.lineNumber)
    },

    object_count: function() {
        return $D.node_count() + $D.way_count() + $D.relation_count()
    },

    way_count: function() {
        return Geohash.objects.findAll(function(o){return o.get_type() == 'Way'}).length
    },

    relation_count: function() {
        return Geohash.objects.findAll(function(o){return o.get_type() == 'Relation'}).length
    },

    node_count: function() {
        var c = 0
            Geohash.objects.each(function(o) {
                c += o.nodes.length
            })
        return c
    }
}

$l = $D.log

Math.in_range = function(v,r1,r2) {
    return (v > Math.min(r1,r2) && v < Math.max(r1,r2))
}

Object.value = function(obj, context) {

    if(Object.isFunction(obj)) {
        context = context || this
            f = obj.bind(context)
            return f()
    }
    return obj
}

Object.deep_extend = function() {
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = true, options, name, src, copy;

    if ( typeof target !== "object" && !Object.isFunction(target) ) {
        target = {};
    }

    for ( ; i < length; i++ ) {
        if ( (options = arguments[ i ]) != null ) {
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                if ( target === copy ) {
                    continue;
                }

                if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
                    var clone;

                    if ( src ) {
                        clone = src;
                    } else if ( Object.isArray(copy) ) {
                        clone = [];
                    } else if ( typeof copy == 'object' ) {
                        clone = {};
                    } else {
                        clone = copy;
                    }

                    target[ name ] = Object.deep_extend(clone, copy );

                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    return target;
}

Number.prototype.to_precision = function(prec){
    return (this * (1/prec)).round()/(1/prec)
}

Cartagen.demo = function() { Map.rotate += 0.005 }
var Style = {
    styles_changed: false,
    properties: ['fillStyle', 'pattern', 'strokeStyle', 'opacity', 'lineWidth', 'outlineColor',
    'outlineWidth', 'radius', 'hover', 'mouseDown', 'distort', 'menu', 'image'],

    label_properties: ['text', 'fontColor', 'fontSize', 'fontScale', 'fontBackground',
    'fontRotation'],
    styles: {
        body: {
            fontColor: "#eee",
            fontSize: 12,
            fontRotation: 0,
            opacity: 1
        }
    },
    style_body: function() {
        if (!Config.tiles && Style.styles.body.fillStyle) $C.fill_style(Style.styles.body.fillStyle)
            if (Style.styles.body.opacity) $C.opacity(Style.styles.body.opacity)

                if (!Config.tiles && Style.styles.body.pattern) {
                    if (!Style.styles.body.pattern.src) {
                        var value = Style.styles.body.pattern
                            Style.styles.body.pattern = new Image()
                            Style.styles.body.pattern.src = Object.value(value)
                    }
                    $C.open('main')
                        $C.fill_pattern(Style.styles.body.pattern, 'repeat')
                        $C.rect(0,0,Glop.width,Glop.height)
                }
        $C.close()
    },
    parse_styles: function(feature,selector) {
        (this.properties.concat(this.label_properties)).each(function(property) {
            var val = null
            if (selector) val = selector[property]

            if (Style.styles[feature.name] && Style.styles[feature.name][property])
            val = this.extend_value(val, Style.styles[feature.name][property])

            feature.tags.each(function(tag) {
                if (Style.styles[tag.key] && Style.styles[tag.key][property]) {
                    val = this.extend_value(val, Style.styles[tag.key][property])
                }

                if (Style.styles[tag.value] && Style.styles[tag.value][property]) {
                    val = this.extend_value(val, Style.styles[tag.value][property])
                }
            }, this)

        if (val) {
            var f = feature
            if (this.label_properties.include(property)) {
                f = feature.label
            }

            if (val.gss_update_interval) {
                Style.create_refresher(f, property, val, val.gss_update_interval)
            }
            else {
                f[property] = Object.value(val, feature)
            }
        }
        }, this)
    },
    extend_value: function(old_val, new_val) {
        if (old_val instanceof Array && new_val instanceof Array) {
            return old_val.concat(new_val)
        }

        return new_val
    },
    create_refresher: function(feature, property, generator, interval) {
        if(!feature.style_generators) feature.style_generators = {}
        if(!feature.style_generators.executers) feature.style_generators.executers = {}

        feature.style_generators[property] = generator

            Style.refresh_style(feature, property)
            feature.style_generators.executers[property] = new PeriodicalExecuter(function() {
                Style.refresh_style(feature, property)
            }, interval)
    },
    refresh_style: function(feature, property) {
        Style.styles_changed = true
            feature[property] = Object.value(feature.style_generators[property], feature)
    },
    load_styles: function(stylesheet_url) {
        var orig_url = stylesheet_url
            $l('loading '+stylesheet_url)
            if (stylesheet_url.slice(0,4) == "http") {
                stylesheet_url = "/utility/proxy?url="+stylesheet_url
            }
        new Ajax.Request(stylesheet_url,{
            method: 'get',
        onComplete: function(result) {
            $l('applying '+stylesheet_url)
            Style.apply_gss(result.responseText)
            Glop.fire('styles:loaded')
            Glop.fire('styles:loaded:'+orig_url)
        }
        })
    },
    cascade: function(old_styles,new_styles) {
        $l('cascading')
            $l('both')
            $H(old_styles).each(function(selector) {
                if (new_styles[selector.key]) {
                    $H(selector.value).each(function(style) {
                        if (new_styles[selector.key][style.key]){
                            old_styles[selector.key][style.key] = new_styles[selector.key][style.key]
                        }
                    })
                }
                if (new_styles[selector.key]) {
                    $H(new_styles[selector.key]).each(function(new_style) {
                        old_styles[selector.key][new_style.key] = new_style.value
                    })
                }
            })
        $H(new_styles).each(function(style) {
            if (!old_styles[style.key]) old_styles[style.key] = style.value
        })
    },
    apply_gss: function(gss_string, force_update) {
        $l('applying gss')
            var styles = ("{"+gss_string+"}").evalJSON()

            if (styles.debug) {
                if (Config.debug) {
                    Object.deep_extend(styles, styles.debug)
                }
                delete styles.debug
            }

        $H(styles).each(function(style) {
            if (style.value.refresh) {
                $H(style.value.refresh).each(function(pair) {
                    style.value[pair.key].gss_update_interval = pair.value
                })
            }
            if (style.value.menu) {
                if (style.key == "body") {
                    $H(style.value.menu).each(function(pair) {
                        ContextMenu.add_static_item(pair.key, pair.value)
                    })
                } else {
                    $H(style.value.menu).each(function(pair) {
                        style.value.menu[pair.key] = ContextMenu.add_cond_item(pair.key, pair.value)
                    })
                    style.value.menu = Object.values(style.value.menu)
                }
            }
        })
        Style.cascade(Style.styles,styles)

            if ($('gss_textarea')) {
                $('gss_textarea').value = gss_string
            }

        if (force_update) {
            Geohash.each(function(o) {
                o.refresh_styles()
            })
        }
    }
}

var Feature = Class.create(
        {
            initialize: function() {
                this.tags = new Hash()
    this.apply_default_styles()
    this.label = new Label(this)
            },
    draw: function() {
        if (Config.vectors) {


            $C.fill_style(this.fillStyle)

    if (this.pattern) {
        if (!this.pattern.src) {
            var value = this.pattern
    this.pattern = new Image()
    this.pattern.src = value
        }
        $C.fill_pattern(this.pattern, 'repeat')
    }

$C.stroke_style(this.strokeStyle)
    $C.opacity(this.opacity)
    $C.line_width(this.lineWidth)

    this.shape()
    $C.restore()
    if (Map.zoom > 0.3) {
        Cartagen.queue_label(this.label, this.x, this.y)
    }
        }
    },
    style: Prototype.emptyFunction,
    shape: function() {
        $D.warn('Feature#shape should be overriden')
    },
    apply_hover_styles: function() {
        $H(this.hover).each(function(pair) {
            if (this[pair.key]) this._unhovered_styles[pair.key] = this[pair.key]
            this[pair.key] = pair.value
        }, this)
    },
    remove_hover_styles: function() {
        Object.extend(this, this._unhovered_styles)
    },
    apply_click_styles: function() {
        $H(this.mouseDown).each(function(pair) {
            if (this[pair.key]) this._unclicked_styles[pair.key] = this[pair.key]
            this[pair.key] = pair.value
        }, this)
    },
    remove_click_styles: function() {
        Object.extend(this, this._unclicked_styles)
    },
    apply_default_styles: function() {
        this.fillStyle = 'rgba(0,0,0,0)'
            this.fontColor = '#eee'
            this.fontSize = 12
            this.fontRotation = 0
            this.opacity = 1
            this.strokeStyle = 'black'
            this.lineWidth = 6
            this._unhovered_styles = {}
        this._unclicked_styles = {}
    },
    get_type: function() {
        return this.__type__
    }
        })

Object.extend(Feature, {
    nodes: new Hash(),
ways: new Hash(),
relations: new Hash()
})

var Node = Class.create(Feature,
        {
            __type__: 'Node',
    initialize: function($super) {
        $super()
    },
    draw: function($super) {
        if (this.img && typeof this.img == 'string') {
            $l('loading image '+this.img)
    var img = this.img
    this.img = new Image
    this.img.src = img
        }
        $super()
    },
    style: function() {

    },
    shape: function() {
        $C.save()
    if (this.img && this.img.width) {
        $C.translate(this.x,this.y)
            $C.scale(2,2)
            $C.draw_image(this.img,this.img.width/-2,this.img.height/-2)
    }
    else {
        $C.begin_path()
            $C.translate(this.x, this.y-this.radius)
            $C.arc(0, this.radius, this.radius, 0, Math.PI*2, true)
            $C.fill()
            $C.stroke()
    }
Label.prototype.draw.apply(this,0,0)
    $C.restore()
    },
    apply_default_styles: function($super) {
        $super()
            this.radius = 6
    },
    refresh_styles: function() {
        this.apply_default_styles()
            Style.parse_styles(this, Style.styles.node)
    }
        })
var Way = Class.create(Feature,
        {
            __type__: 'Way',
    initialize: function($super, data) {
        $super()
    geohash = geohash || true
    this.age = 0
    this.birthdate = new Date
    this.highlight = false
    this.nodes = []
    this.closed_poly = false

    this.is_hovered = false

    Object.extend(this, data)

    if (this.nodes.length > 1 && this.nodes.first().x == this.nodes.last().x &&
        this.nodes.first().y == this.nodes.last().y)
        this.closed_poly = true

    if (this.tags.get('natural') == "coastline") this.closed_poly = true

        if (this.closed_poly) {
            var centroid = Geometry.poly_centroid(this.nodes)
                this.x = centroid[0]*2
                this.y = centroid[1]*2
        } else {
            this.x = (this.middle_segment()[0].x+this.middle_segment()[1].x)/2
                this.y = (this.middle_segment()[0].y+this.middle_segment()[1].y)/2
        }

this.area = Geometry.poly_area(this.nodes)
    this.bbox = Geometry.calculate_bounding_box(this.nodes)

    this.width = Math.abs(Projection.x_to_lon(this.bbox[1])-Projection.x_to_lon(this.bbox[3]))
    this.height = Math.abs(Projection.y_to_lat(this.bbox[0])-Projection.y_to_lat(this.bbox[2]))

    Feature.ways.set(this.id,this)
    if (this.coastline) {
        Coastline.coastlines.push(this)
    } else {
        Style.parse_styles(this,Style.styles.way)
            Geohash.put_object(this)
    }
    },
    neighbors: [false,false],
    chain: function(chain,prev,next) {
        var uniq = true
            chain.each(function(way) {
                if (way.id == this.id) uniq = false
            },this)
        if (uniq) {
            if (prev) chain.push(this)
            else chain.unshift(this)
                $l(chain.length + ","+prev+next)
                    if (prev && this.neighbors[0]) { // this is the initial call
                        this.neighbors[0].chain(chain,true,false)
                    }
            if (next && this.neighbors[1]) {
                this.neighbors[1].chain(chain,false,true)
            }
        }
        return chain
    },
    middle_segment: function() {
        if (this.nodes.length == 1) {
            return [this.nodes[0], this.nodes[0]]
        }
        else if (this.nodes.length == 2) {
            return [this.nodes[0], this.nodes[1]]
        }
        else {
            return [this.nodes[Math.floor(this.nodes.length/2)],
                this.nodes[Math.floor(this.nodes.length/2)+1]]
        }
    },
    middle_segment_angle: function() {
        var segment = this.middle_segment()
            if (segment[1]) {
                var _x = segment[0].x-segment[1].x
                    var _y = segment[0].y-segment[1].y
                    return (Math.tan(_y/_x))
            } else return 0
    },
    draw: function($super) {
        $super()
            this.age += 1;
    },
    style: function() {
        if (this.hover || this.menu) {
            this.is_hovered = this.is_inside(Map.pointer_x(), Map.pointer_y())
        }
        if (this.hover && this.is_hovered) {
            if (!this.hover_styles_applied) {
                Mouse.hovered_features.push(this)
                    this.apply_hover_styles()
                    this.hover_styles_applied = true
            }
            if (!Object.isUndefined(this.hover.action)) this.hover.action.bind(this)()
        }
        else if (this.hover_styles_applied) {
            Mouse.hovered_features = Mouse.hovered_features.without(this)
                this.remove_hover_styles()
                this.hover_styles_applied = false
        }

        if (this.mouseDown && Mouse.down == true && this.is_hovered) {
            if (!this.click_styles_applied) {
                this.apply_click_styles()
                    this.click_styles_applied = true
            }
            if (!Object.isUndefined(this.mouseDown.action)) this.mouseDown.action.bind(this)()
        }
        else if (this.click_styles_applied) {
            this.remove_click_styles()
                this.click_styles_applied = false
        }

        if (this.menu) {
            if (this.is_hovered) {
                this.menu.each(function(id) {
                    ContextMenu.cond_items[id].avail = true
                    ContextMenu.cond_items[id].context = this
                }, this)
            }
            else {
                this.menu.each(function(id) {
                    if (ContextMenu.cond_items[id].context == this) {
                        ContextMenu.cond_items[id].avail = false
                    ContextMenu.cond_items[id].context = window
                    }
                }, this)
            }
        }
    },
    shape: function() {
        $C.opacity(1)
            if (Object.isUndefined(this.opacity)) this.opacity = 1
                if ((Glop.date - this.birthdate) < 4000) {
                    $C.opacity(Math.max(0,0.1+this.opacity*((Glop.date - this.birthdate)/4000)))
                } else {
                    $C.opacity(this.opacity)
                }

        $C.begin_path()
            if (Config.distort) $C.move_to(this.nodes[0].x,this.nodes[0].y+Math.max(0,75-Geometry.distance(this.nodes[0].x,this.nodes[0].y,Map.pointer_x(),Map.pointer_y())/4))
            else $C.move_to(this.nodes[0].x,this.nodes[0].y)

                if (Map.resolution == 0) Map.resolution = 1
                    this.nodes.each(function(node,index){
                        if ((index % Map.resolution == 0) || index == this.nodes.length-1 || this.nodes.length <= 30) {
                            if (Config.distort) $C.line_to(node.x,node.y+Math.max(0,75-Geometry.distance(node.x,node.y,Map.pointer_x(),Map.pointer_y())/4))
                            else $C.line_to(node.x,node.y)
                        }
                    },this)

        if (this.outlineColor && this.outlineWidth) $C.outline(this.outlineColor,this.outlineWidth)
        else $C.stroke()
            if (this.closed_poly) $C.fill()

                if (this.image) {
                    if (!this.image.src) {
                        var src = this.image
                            this.image = new Image()
                            this.image.src = src
                    } else if (this.image.width > 0) {
                        $C.draw_image(this.image, this.x-this.image.width/2, this.y-this.image.height/2)
                    }
                }
    },
    apply_default_styles: function($super) {
        $super()
            this.outline_color = null
            this.outline_width = 0
    },
    refresh_styles: function() {
        this.apply_default_styles()
            Style.parse_styles(this, Style.styles.way)
    },
    is_inside: function(x, y) {
        if (this.closed_poly) {
            return Geometry.is_point_in_poly(this.nodes, x, y)
        }
        else {
            width = this.lineWidth + this.outline_width

                return Geometry.point_line_distance(x, y, this.nodes) < width
        }
    }
        })
var Relation = Class.create(Feature,
        {
            __type__: 'Relation',
    members: [],
    coastline_nodes: [],
    entry_angle: 0,
    initialize: function($super, data) {
        $super()

    this.id = Feature.relations.size()
    this.age = 0
    this.highlight = false
    this.coastline = true // because all relations are currently coastlines

    this.outline_color = null
    this.outline_width = null

    Object.extend(this, data)

    this.collect_ways()

    if (this.nodes.length > 1 && this.nodes.first().x == this.nodes.last().x &&
            this.nodes.first().y == this.nodes.last().y)
        this.closed_poly = true

            if (this.tags.get('natural') == 'coastline') {
                this.coastline = true
            }
if (this.tags.get('natural') == "land") this.island = true

    if (this.closed_poly) {
        var centroid = Geometry.poly_centroid(this.nodes)
            this.x = centroid[0]*2
            this.y = centroid[1]*2
    } else {
        this.x = (this.middle_segment()[0].x+this.middle_segment()[1].x)/2
            this.y = (this.middle_segment()[0].y+this.middle_segment()[1].y)/2
    }

this.area = Geometry.poly_area(this.nodes)
    this.bbox = Geometry.calculate_bounding_box(this.nodes)

    this.width = Math.abs(Projection.x_to_lon(this.bbox[1])-Projection.x_to_lon(this.bbox[3]))
    this.height = Math.abs(Projection.y_to_lat(this.bbox[0])-Projection.y_to_lat(this.bbox[2]))

    Style.parse_styles(this,Style.styles.relation)
    Feature.relations.set('coastline_'+this.id,this)
    },
    nodes: [],
    tags: new Hash(),
    collect_ways: function() {
        this.members.each(function(member) {
            this.nodes = member.nodes.concat(this.nodes)
            if (member.tags.size() > 0) this.tags.merge(member.tags)
        },this)
    },
    draw: function($super) {
        $super()
            this.age += 1;
    },
    middle_segment: Way.prototype.middle_segment,
    middle_segment_angle: Way.prototype.middle_segment_angle,
    style: Way.prototype.style,
    shape: function() {
    },
    collect_nodes: function() {
        var is_inside = true, last_index, prev_node_inside = null
            var enter_viewport = null,exit_viewport = null
            this.coastline_nodes = []

            this.nodes.each(function(node,index){
                is_inside = Geometry.overlaps(node.x,node.y,Map.x,Map.y,Viewport.width)
                if (prev_node_inside != null && prev_node_inside != is_inside) {
                    if (is_inside && this.coastline_nodes.length == 0) this.coastline_nodes.unshift([this.nodes[index-1].x,this.nodes[index-1].y])
                } else if (prev_node_inside == null && is_inside) {
                    this.coastline_nodes.unshift([node.x,node.y])
                }
            prev_node_inside = is_inside
                if (is_inside) {
                    this.coastline_nodes.push([node.x,node.y])
                last_index = index
                }
            },this)

        this.entry_angle = Math.tan(Math.abs(this.coastline_nodes.first()[0]-Map.x)/(this.coastline_nodes.first()[1]-Map.y))
    },
    apply_default_styles: Feature.prototype.apply_default_styles,
    refresh_styles: function() {
        this.apply_default_styles()
            Style.parse_styles(this, Style.styles.relation)
    }
        })
var Label = Class.create(
        {
            initialize: function(owner) {
                this.fontFamily = 'Lucida Grande, sans-serif',
    this.fontSize = 11,
    this.fontBackground = null,
    this.text = null,
    this.fontScale = false,
    this.padding = 6,
    this.fontColor = '#eee',
    this.fontRotation = 0,
    this.owner = owner
            },
    draw: function(x, y) {
        if (this.text) {
            $C.open('background')
    $C.save()

    $C.stroke_style(this.fontColor)


    if (this.fontRotation) {
        $C.translate(x, y)
            if (this.fontRotation == "fixed") {
                $C.rotate(-Map.rotate)
            } else if (Object.isNumber(this.fontRotation)) {
                $C.rotate(this.fontRotation)
            }
        $C.translate(-x, -y)
    }

if (this.fontScale == "fixed") {
    var height = this.fontSize
        var padding = this.padding
} else {
    var height = this.fontSize / Map.zoom
        var padding = this.padding / Map.zoom
}


var width = $C.measure_text(this.fontFamily,
        height,
        Object.value(this.text, this.owner))

    if (this.fontBackground) {
        $C.fill_style(this.fontBackground)
            $C.rect(x - (width + padding)/2,
                    y - (height/2 + padding/2),
                    width + padding,
                    height + padding)
    }

$C.draw_text(this.fontFamily,
        height,
        this.fontColor,
        x - width/2,
        y + height/2,
        this.text)
$C.restore()
    }
}
})

var Coastline = {
    initialize: function() {


        Glop.observe('cartagen:predraw', Coastline.draw.bindAsEventListener(this))
    },
    coastlines: [],
    coastline_nodes: [],
    assembled_coastline: [],
    draw: function() {
        if (Config.vectors) {
            Coastline.assembled_coastline = []
                Feature.relations.values().each(function(object) {
                    $l(object.id+' relation')
                    object.collect_nodes()
                    if (object.coastline_nodes.length > 0) Coastline.assembled_coastline.push([object.coastline_nodes,[object.entry_angle,object.exit_angle]])
                })

            if (Coastline.assembled_coastline.length > 0) {
                Coastline.assembled_coastline.sort(Coastline.sort_coastlines_by_angle)

                    $C.begin_path()

                    var start_corner,end_corner,start_angle,end_angle
                    Coastline.assembled_coastline.each(function(coastline,index) {
                        coastline.push(Viewport.nearest_corner(coastline[0].first()[0],coastline[0].first()[1]))
                        coastline.push(Viewport.nearest_corner(coastline[0].last()[0],coastline[0].last()[1]))
                    })

                var corners = []

                    Coastline.assembled_coastline.each(function(coastline,index) {
                        corners.push(coastline[2][2])
                        $C.move_to(coastline[2][0],coastline[2][1])



                        coastline[0].each(function(node,c_index) {
                            $C.line_to(node[0],node[1])
                        })
                    $C.line_to(coastline[3][0],coastline[3][1])

                        if (Coastline.assembled_coastline[index+1]) {
                            if (index != Coastline.assembled_coastline.length-1) {
                                corners.push(coastline[3][2],coastline[2][2])
                        $l('walking to beginning!: '+coastline[3][2]+"/"+coastline[2][2]+':'+Coastline.walk(coastline[3][2],coastline[2][2],false).inspect())
                        Coastline.walk(coastline[3][2],coastline[2][2],false).each(function(n) {
                            $C.line_to(n[0],n[1])
                        })
                            }
                            if (coastline[2][2] != Coastline.assembled_coastline[index+1][2][2]) {
                                corners.push(coastline[2][2],Coastline.assembled_coastline[index+1][2][2])
                                    $l('walking to next!: '+coastline[2][2]+"/"+Coastline.assembled_coastline[index+1][2][2]+':'+Coastline.walk(coastline[2][2],Coastline.assembled_coastline[index+1][2][2]).inspect())
                                    Coastline.walk(coastline[2][2],Coastline.assembled_coastline[index+1][2][2]).each(function(n) {
                                        $C.line_to(n[0],n[1])
                                    })
                            }
                        }

                    if (index == 0) {
                        start_corner = coastline[2]
                            start_angle = coastline[1][0]
                    }
                    if (index == Coastline.assembled_coastline.length-1) {
                        end_corner = coastline[3]
                            end_angle = coastline[1][1]
                    }
                    },this)



                if ((end_corner[2] == start_corner[2]) && (end_angle < start_angle)) {
                } else if (end_corner[2] != start_corner[2] || end_angle > start_angle) {
                    corners.push(end_corner[2],start_corner[2])
                        $l('walking around!: '+end_corner[2]+"/"+start_corner[2]+':'+Coastline.walk(end_corner[2],start_corner[2]).inspect())
                        Coastline.walk(end_corner[2],start_corner[2]).each(function(n) {
                            $C.line_to(n[0],n[1])
                        })
                }
                $l('ending: '+corners)

                    var coastline_style = Style.styles.relation
                    if (coastline_style.lineWidth) $C.line_width(coastline_style.lineWidth)
                        if (coastline_style.strokeStyle) $C.stroke_style(coastline_style.strokeStyle)
                            if (coastline_style.opacity) $C.opacity(coastline_style.opacity)
                                $C.stroke()
                                    if (coastline_style.pattern) {
                                        if (!coastline_style.pattern.src) {
                                            var value = coastline_style.pattern
                                                coastline_style.pattern = new Image()
                                                coastline_style.pattern.src = value
                                        }
                                        $C.fill_pattern(coastline_style.pattern, 'repeat')
                                    } else $C.fill_style(coastline_style.fillStyle)
                                        $C.fill()
            }
        }
    },
    refresh_coastlines: function() {
        Coastline.coastlines.each(function(c){c.neighbors = []})
            Coastline.coastlines.each(function(coastline_a) {
                Coastline.coastlines.each(function(coastline_b) {
                    if (coastline_a.id != coastline_b.id) {
                        if (coastline_a.nodes.last().id == coastline_b.nodes.first().id) {
                            coastline_a.neighbors[1] = coastline_b
                    coastline_b.neighbors[0] = coastline_a
                        }
                    }
                })
            })

        var coastline_chains = Coastline.coastlines.clone()
            Feature.relations = new Hash()
            while (coastline_chains.length > 0) {
                var data = {
                    members: coastline_chains.first().chain([],true,true)
                }
                data.members.each(function(member) {
                    coastline_chains.each(function(coastline,index) {
                        if (coastline.id == member.id) coastline_chains.splice(index,1)
                    })
                })
                new Relation(data)
            }
        $l('refreshed coastlines')
            Feature.relations.each(function(r) {
                $l(r.inspect())
            })
    },
    walk: function(start,end,clockwise) {
        if (Object.isUndefined(clockwise)) clockwise = true
            $l(start+'/'+end+',clockwise '+clockwise+': '+this.walk_n(start,end,clockwise))
                var nodes = []
                var bbox = Viewport.full_bbox()
                if (clockwise) {
                    if (start >= end) var slice_end = bbox.length
                    else var slice_end = end+1
                        var cycle = bbox.slice(start,slice_end) // path clockwise to walk around the viewport
                            if ((start > end) || (start == end && start > 0)) cycle = cycle.concat(bbox.slice(0,end+1)) //loop around from 3 back to 0
                } else {
                    if (start <= end) var slice_end = bbox.length
                    else var slice_end = start+1
                        var cycle = bbox.slice(end,slice_end) // path clockwise to walk around the viewport
                            if ((start < end) || (start == end && end > 0)) cycle = cycle.concat(bbox.slice(0,start+1)) //loop around from 3 back to 0
                                cycle = cycle.reverse()
                }
        cycle.each(function(coord,index) {
            nodes.push([coord[0],coord[1]])


        })
        return nodes
    },
    walk_n: function(start,end,clockwise) {
        if (Object.isUndefined(clockwise)) clockwise = true
            var nodes = []
                var bbox = [0,1,2,3]//Viewport.full_bbox()
                if (clockwise) {
                    if (start >= end) var slice_end = bbox.length
                    else var slice_end = end+1
                        var cycle = bbox.slice(start,slice_end) // path clockwise to walk around the viewport
                            if ((start > end) || (start == end && start > 0)) cycle = cycle.concat(bbox.slice(0,end+1)) //loop around from 3 back to 0
                } else {
                    if (start <= end) var slice_end = bbox.length
                    else var slice_end = start+1
                        var cycle = bbox.slice(end,slice_end) // path clockwise to walk around the viewport
                            if ((start < end) || (start == end && end > 0)) cycle = cycle.concat(bbox.slice(0,start+1)) //loop around from 3 back to 0
                                cycle = cycle.reverse()
                }
        cycle.each(function(coord,index) {
            nodes.push(coord)


        })
        return nodes
    },
    sort_coastlines_by_angle: function(a,b) { return (a[1][0] - b[1][0]) }
}

document.observe('cartagen:init', Coastline.initialize.bindAsEventListener(Coastline))
var Importer = {
    plot_array: [],
    requested_plots: 0,
    plots: new Hash(),
    parse_manager: null,
    init: function() {
        Importer.parse_manager = new TaskManager(50)
            $l('set up parse_manager')
            try {
                if (JSON.parse) {
                    Importer.native_json = true
                }
                else {
                    Importer.native_json = false
                }
            } catch(e) {
                Importer.native_json = false
            }

        try {
            if (localStorage && localStorage.length && localStorage.getItem) {
                Importer.localStorage = true
            }
            else {
                Importer.localStorage = false
            }
        }
        catch (e) {
            Importer.localStorage = false
        }
    },
    flush_localstorage: function() {
        if (Importer.localStorage && !Config.suppress_interface && localStorage.length > 200) {
            var answer = confirm('Your localStorage is filling up ('+localStorage.length+' entries) and may cause slowness in some browsers. Click OK to flush it and begin repopulating it from new data.')
                if (answer) {
                    localStorage.clear()
                } else {
                    alert("Your localStorage is intact.")
                }
        }
    },
    parse: function(string) {
        if (Importer.native_json) {
            var result = JSON.parse(string)
                return result
        } else {
            var result = string.evalJSON()
                return result
        }
    },
    get_current_plot: function(force) {
        force = force || false
            if ((Map.x != Map.last_pos[0] && Map.y != Map.last_pos[1]) || force != false || Glop.frame < 100) {
                if (Geohash.keys && Geohash.keys.keys()) {
                    try {
                        Geohash.keys.keys().each(function(key) {
                            if (key.length == 6) Importer.get_cached_plot(key)
                        })
                    } catch(e) {
                        $l(e)
                    }
                }
            }
        Map.last_pos[0] = Map.x
            Map.last_pos[1] = Map.y
    },
    get_static_plot: function(url) {
        $l('getting static plot for '+url)
            Importer.requested_plots++
            new Ajax.Request(url,{
                method: 'get',
            onSuccess: function(result) {
                try {
                    $l('formed correctly: '+result.responseText)
                Importer.parse_objects(Importer.parse(result.responseText))
                } catch(e) {
                    $l('Malformed JSON, did not parse. Try removing trailing commas and extra whitespace. Test your JSON by typing \"Importer.parse(\'{"your": "json", "goes": "here"}\')\" ==> '+result.responseText)
                }
                Importer.requested_plots--
                if (Importer.requested_plots == 0) Event.last_event = Glop.frame
                $l("Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
                Glop.trigger_draw()
            }
            })
    },
    get_cached_plot: function(key) {

        if (!Config.live) {
            if (Importer.plots.get(key)) {
            } else {
                if (Importer.localStorage) {
                    var ls = localStorage.getItem('geohash_'+key)
                        if (ls) {
                            $l("localStorage cached plot")
                                Importer.parse_objects(Importer.parse(ls), key)
                        } else {
                            Importer.load_plot(key)
                        }
                } else {
                    Importer.load_plot(key)
                }
            }
        } else {
            Importer.load_plot(key)
        }

        Glop.trigger_draw()
            Importer.plots.set(key, true)
    },
    load_plot: function(key) {
        $l('loading geohash plot: '+key)

            Importer.requested_plots++
            var finished = false
            var req = new Ajax.Request('/api/0.6/geohash/'+key+'.json',{
                method: 'get',
            onSuccess: function(result) {
                finished = true
                Importer.parse_objects(Importer.parse(result.responseText), key)
                if (Importer.localStorage) localStorage.setItem('geohash_'+key,result.responseText)
                Importer.requested_plots--
                if (Importer.requested_plots == 0) Event.last_event = Glop.frame
                $l("Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
                Geohash.last_get_objects[3] = true // force re-get of geohashes
                Glop.trigger_draw()
            },
            onFailure: function() {
                Importer.requested_plots--
            }
            })

        var f = function(){
            if (!finished) {
                Importer.plots.set(key, false)
                    req.transport.onreadystatechange = Prototype.emptyFunction
                    req.transport.abort()
                    $l("Request aborted. Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
            }
        }
        f.delay(120)
    },
    parse_node: function(node){
        var n = new Node
            n.name = node.name
            n.author = node.author
            n.img = node.img
            n.h = 10
            n.w = 10
            n.color = Glop.random_color()
            n.timestamp = node.timestamp
            n.user = node.user
            if (!Object.isUndefined(node.image)) $l('got image!!')
                n.id = node.id
                    n.lat = node.lat
                    n.lon = node.lon
                    n.x = Projection.lon_to_x(n.lon)
                    n.y = Projection.lat_to_y(n.lat)
                    Style.parse_styles(n,Style.styles.node)
                    Feature.nodes.set(n.id,n)
                    if (node.display) {
                        n.display = true
                            n.radius = 50
                            $l(n.img)
                            Geohash.put(n.lat, n.lon, n, 1)
                    }
    },
    parse_way: function(way){
        if (Config.live || !Feature.ways.get(way.id)) {
            var data = {
                id: way.id,
                user: way.user,
                timestamp: way.timestamp,
                nodes: [],
                tags: new Hash()
            }
            if (way.name) data.name = way.name
                way.nd.each(function(nd, index) {
                    if ((index % Config.simplify) == 0 || index == 0 || index == way.nd.length-1 || way.nd.length <= Config.simplify*2)  {
                        node = Feature.nodes.get(nd.ref)
                    if (!Object.isUndefined(node)) data.nodes.push(node)
                    }
                })
            if (way.tag){
                if (way.tag instanceof Array) {
                    way.tag.each(function(tag) {
                        data.tags.set(tag.k,tag.v)
                        if (tag.v == 'coastline') data.coastline = true
                    })
                } else {
                    data.tags.set(way.tag.k,way.tag.v)
                        if (tag.v == 'coastline') data.coastline = true
                }
            }
            new Way(data)
        }
    },
    parse_objects: function(data, key) {
        var cond;
        if (key) {
            cond = function() {
                return (Geohash.keys.get(key) === true)
            }
        } else  {
            cond = function() {
                return true
            }
        }
        if (data.osm.node) {
            node_task = new Task(data.osm.node, Importer.parse_node, cond)
                Importer.parse_manager.add(node_task)
        }
        if (data.osm.way) {
            way_task = new Task(data.osm.way, Importer.parse_way, cond, [node_task.id])
                Importer.parse_manager.add(way_task)
        }
        coastline_task = new Task(['placeholder'], Coastline.refresh_coastlines, cond, [way_task.id])
            Importer.parse_manager.add(coastline_task)

    }
}

Importer.flush_localstorage()
    document.observe('cartagen:init', Importer.init.bindAsEventListener(Importer))
    var Glop = {
        frame: 0,
        start_time: 0,
        timestamp: 0,
        times: [],
        fps: 0,
        changed_size: 0,
        date: new Date,
        width: 0,
        height: 0,
        paused: false,
        observe: function(a,b,c) {
            $('main').observe(a,b,c)
        },
        fire: function(a,b,c) {
            $('main').fire(a,b,c)
        },
        stopObserving: function(a,b,c) {
            $('main').stopObserving(a,b,c)
        },
        init: function() {
            TimerManager.setup(Glop.draw_powersave,this)
        },
        snapshot: '',
        draw: function(custom_size, force_draw) {
            if (Glop.paused && (force_draw != true)) {
                Glop.fire('glop:predraw')
                    return
            }

            Glop.timestamp = Glop.date.getTime()
                Glop.times.unshift(Glop.timestamp)
                if (Glop.times.length > 100) Glop.times.pop()
                    Glop.fps = parseInt(Glop.times.length/(Glop.timestamp - Glop.times.last())*1000)

                        var new_snapshot = Map.x +','+ Map.x_old +','+ Map.y +','+ Map.y_old +','+ Map.rotate +','+ Map.rotate_old +','+ Map.zoom +','+ Map.old_zoom

                        if (new_snapshot != Glop.snapshot || force_draw || Glop.changed_size) {
                            Glop.fire('cartagen:change')
                                $C.thaw('background')
                        } else {
                            $C.freeze('background')
                        }
            Glop.snapshot = new_snapshot

                Glop.resize(custom_size)

                Events.drag()
                Glop.fire('glop:predraw')
                draw_event = $('main').fire('glop:draw')
                if (Config.vectors && !draw_event.no_draw) {
                    objects.each(function(object) {
                        object.draw()
                    })
                }

            Glop.fire('glop:postdraw')
        },
        resize: function(custom_size) {
            if (!custom_size) { // see Canvas.to_print_data_url()
                Glop.changed_size = (Glop.width != document.viewport.getWidth() || Glop.height != document.viewport.getHeight()-Config.padding_top)
                    $l(Glop.changed_size)
                    Glop.width = document.viewport.getWidth()
                    Glop.height = document.viewport.getHeight()-Config.padding_top
            }
            $C.canvases.each(function(canvas) {
                if ($C.freezer.get(canvas.key) != true || Glop.changed_size) {
                    $(canvas.key).width = Glop.width
                $(canvas.key).height = Glop.height
                }
            })
            $$('body')[0].style.width = Glop.width+"px"
        },
        random_color: function() {
            return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
        },
        tail: 0,
        trigger_draw: function(t) {
            if (Object.isNumber(t) && !Object.isUndefined(t)) {
                if (t > this.tail) this.tail = t
            } else {
                if (this.tail <= 0) this.tail = 1
            }
        },
        draw_powersave: function() {
            var delay = 20
                if (this.tail > 0 || Config.powersave == false || (Importer.requested_plots && Importer.requested_plots > 0) || Cartagen.last_loaded_geohash_frame > Glop.frame-delay || Importer.parse_manager.completed < 100) {
                    if (this.tail > 0) this.tail -= 1
                        Glop.draw()
                            Glop.frame += 1
                } else {
                    Glop.times = []
                } //else $l('powersave: '+this.tail)
            Glop.date = new Date
        }
    }

document.observe('cartagen:init', Glop.init.bindAsEventListener(Glop))

var TaskManager = Class.create(
        {
            initialize: function(quota, tasks) {
                this.quota = quota

    this.tasks = tasks || []


    this.listener = this.run.bindAsEventListener(this)

    this.completed = 0

    this.start()
            },
    run: function() {
        var i = 0
    var start_time = new Date().getTime()
    var cur_tasks = []
    var r, task

    for (var j = 0; j < this.tasks.length; j++) {
        if (this.tasks[j].pass_condition()) {
            cur_tasks.push(this.tasks[j])
        }
    }

while (cur_tasks.length > 0 && (new Date().getTime() - start_time) < this.quota) {
    task = cur_tasks[(i++) % cur_tasks.length]
        r = task.exec_next()
        if (r === false) {
            this.tasks = this.tasks.without(task)
                cur_tasks = cur_tasks.without(task)
        }
}

this.get_completed(cur_tasks)

    if (Config.vectors) Geohash.get_objects()
Glop.trigger_draw()

if (this.tasks.length < 1) this.stop()
    },
    add: function(task) {
        this.tasks.push(task)

            if (!this.active) this.start()
    },
    start: function() {
        this.active = true
            Glop.observe('glop:predraw', this.listener)
    },
    stop: function() {
        this.active = false
            Glop.stopObserving('glop:predraw', this.listener)
    },
    get_completed: function(tasks) {
        var total = 0
            var left = 0
            for (var i = 0; i < tasks.length; ++i) {
                total += tasks[i].total_members
                    left += tasks[i].members.length
            }
        this.completed = ((total-left)/total) * 100
    }
})

var Task = Class.create(
        {
            initialize: function(members, process, condition, deps) {
                this.members = members || []
    this.total_members = members.length || 0
    this.process = process || Prototype.emptyFunction
    if (Object.isUndefined(condition)) condition = true
    this.condition = condition

    Task.register(this)
    this.deps = deps || []
            },
    exec_next: function() {
        if (!this.should_run()) return true

    this.process(this.members.shift())

    if (this.members.length > 0) return true
    else {
        Task.complete(this.id)
    return false
    }
    },
    should_run: function() {
        if (!this.pass_condition) return false

            for (var i = 0; i < this.deps.length; i++) {
                if (Task.is_done(this.deps[i]) === false) {
                    return false
                }
            }

        return true
    },
    pass_condition: function() {
        if (Object.value(this.condition, this) === false) return false

            return true
    },


    visible: false,
    display: function() {
        if (this.visible || Config.debug) {
        }
    }
        })

Task.cur_uid = 1
Task.registry = {}
Task.register = function(task) {
    task.id = Task.cur_uid++
        Task.registry[task.id] = false
}
Task.complete = function(id) {
    Task.registry[id] = true
}
Task.is_done = function(id) {
    return Task.registry[id]
}



var Timer = Class.create(
        {
            initialize: function(interval,units) {
                if (units == 'seconds') {
                } else if (!Object.isUndefined(interval)) this.interval = interval
            },
    interval: 40,
    lag: 0
        })

/*
   TaskTest = {
   a: $R(1, 10).toArray(),
   b: $R(1, 10).toArray(),
   c: $R(1, 10).toArray(),
   d: $R(1, 10).toArray(),
   a2: [],
   b2: [],
   c2: [],
   d2: [],
   fa: function(o) {
   for (var i=0; i<9999999; i++){}
   TaskTest.a2.push(o)
   },
   fb: function(o) {
   for (var i=0; i<9999999; i++){}
   TaskTest.b2.push(o)
   },
   fc: function(o) {
   for (var i=0; i<9999999; i++){}
   TaskTest.c2.push(o)
   },
   fd: function(o) {
   for (var i=0; i<9999999; i++){}
   TaskTest.d2.push(o)
   }
   }

   function tt_init() {
   TaskTest.ta = new Task(TaskTest.a, TaskTest.fa, true),
   TaskTest.tb = new Task(TaskTest.b, TaskTest.fb, true, [TaskTest.ta.id]),
   TaskTest.tc = new Task(TaskTest.c, TaskTest.fc, true, [TaskTest.tb.id]),
   TaskTest.td = new Task(TaskTest.d, TaskTest.fd, true, [TaskTest.tb.id]),
   TaskTest.tm = new TaskManager(1000, [TaskTest.ta, TaskTest.tb, TaskTest.tc, TaskTest.td])
   }
   */
var TimerManager = {
    last_date: new Date,
    times: [],
    spacing: 0.8,
    interval: 10,
    setup: function(f,c,s,i) {
        this.f = f || function(){}
        this.context = c || this
            this.interval = i || this.interval
            setTimeout(this.bound_run,i || this.interval)
    },
    bound_run: function() {
        TimerManager.run.apply(TimerManager)
    },
    run: function() {
        var start_date = new Date
            this.f.apply(this.context)
            var execution_time = new Date - start_date
            this.times.unshift(parseInt(execution_time))
            if (this.times.length > 100) this.times.pop()
                setTimeout(this.bound_run,Math.max(50,parseInt(this.spacing*this.sample())))
    },
    sequence: [1,2,3,5,8,13],//,21,34,55],
    sample: function() {
        var sample = 0
            for (var i = 0;i < this.sequence.length;i++) {
                sample += this.times[this.sequence[i]] || 0
            }
        return sample/9
    },
}
var Events = {
    last_event: 0,

    init: function() {
        document.observe('mousemove', Events.mousemove)
            Glop.observe('mousedown', Events.mousedown)
            Glop.observe('mouseup', Events.mouseup)
            Glop.observe('dblclick', Events.dblclick)
            Glop.observe('mouseover', Events.mouseover)
            Glop.observe('mouseout', Events.mouseout)

            Tool.initialize()

            if (window.addEventListener) window.addEventListener('DOMMouseScroll', Events.wheel, false)
                window.onmousewheel = document.onmousewheel = Events.wheel

                    Event.observe(document, 'keydown', Events.keydown)
                    Event.observe(document, 'keypress', Events.keypress)
                    Event.observe(document, 'keyup', Events.keyup)
                    if (Config.key_input) {
                        Keyboard.key_input = true
                    }

        element = $('main')
            element.ontouchstart = Events.ontouchstart
            element.ontouchmove = Events.ontouchmove
            element.ontouchend = Events.ontouchend
            element.ongesturestart = Events.ongesturestart
            element.ongesturechange = Events.ongesturechange
            element.ongestureend = Events.ongestureend

            Event.observe(window, 'resize', Events.resize);
    },
    mousemove: function(event) {
        Events.enabled = true
            Mouse.x = -1*Event.pointerX(event)
            Mouse.y = -1*Event.pointerY(event)
            Glop.trigger_draw(5)
    },
    mousedown: function(event) {
        Events.mousemove(event)
            if (!event.isLeftClick() || event.ctrlKey) return
                Mouse.down = true
                    Mouse.click_frame = Glop.frame
                    Mouse.click_x = Mouse.x
                    Mouse.click_y = Mouse.y
                    Mouse.dragging = true
                    Glop.trigger_draw(5)
    },
    mouseup: function(event) {
        if (event && (!event.isLeftClick() || event.ctrlKey)) return
            Mouse.up = true
                Mouse.down = false
                Mouse.release_frame = Glop.frame
                Mouse.dragging = false
                User.update()
    },
    wheel: function(event){
        if (Events.enabled == false) return
            var delta = 0
                if (!event) event = window.event
                    if (event.wheelDelta) {
                        delta = event.wheelDelta/120
                            if (window.opera) delta = -delta
                    } else if (event.detail) {
                        delta = -event.detail/3
                    }
        if (delta && !Config.live_gss) {
            if (delta <0) {
                if (!Config.tiles) Map.zoom = (Map.zoom * 1) - (1/20)
                else Knitter.zoomOut()
            } else {
                if (!Config.tiles) Map.zoom = (Map.zoom * 1) + (1/20)
                else Knitter.zoomIn()
            }
            if (Map.zoom < Config.zoom_out_limit) Map.zoom = Config.zoom_out_limit
        }
        Glop.trigger_draw(5)
            event.preventDefault()
    },

    keydown: function(e) {
        var key = e.which || e.keyCode
            if (key == 16 || e.shiftKey) {
                Keyboard.shift = true
            }
    },
    keypress: function(e) {
        if (Events.enabled === false) return
            if (Events.keys_enabled === false) return

                if (!e) var e = window.event;

        var character = e.which || e.keyCode;
        character = String.fromCharCode(character);
        if (Keyboard.key_input) {
            Keyboard.hotkey(character)
        } else {
            Keyboard.modifier(character)
        }
    },

    keyup: function(e) {
        if (Events.enabled === true) {
            Keyboard.shift = false
                if (Events.arrow_keys_enabled === true) {
                    var character = e.keyIdentifier
                        switch(character) {
                            case 'Left': if (!e.shiftKey) Map.x -= 20/Map.zoom; else Map.rotate += 0.1; break
                            case 'Right': if (!e.shiftKey) Map.x += 20/Map.zoom; else Map.rotate -= 0.1; break
                            case 'Up': Map.y -= 20/Map.zoom; break
                            case 'Down': Map.y += 20/Map.zoom; break
                        }

                    Keyboard.keys.set("r",false)
                        Keyboard.keys.set("z",false)
                        e.preventDefault()
                }
        }
    },
    ontouchstart: function(e){
        e.preventDefault();
        if(e.touches.length == 1){ // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            var node = touch.target; // Find the node the drag started from

            Mouse.down = true
                Mouse.click_frame = Glop.frame
                Mouse.click_x = touch.screenX
                Mouse.click_y = touch.screenY
                Map.x_old = Map.x
                Map.y_old = Map.y
                Mouse.dragging = true
                Glop.trigger_draw(5)
        }
    },
    ontouchmove: function(e) {
        e.preventDefault();
        if(e.touches.length == 1){ // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            var node = touch.target; // Find the node the drag started from

            Mouse.drag_x = (touch.screenX - Mouse.click_x)
                Mouse.drag_y = (touch.screenY - Mouse.click_y)

                var d_x = -Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
                var d_y = -Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x

                Map.x = Map.x_old+(d_x/Map.zoom)
                Map.y = Map.y_old+(d_y/Map.zoom)

                Glop.trigger_draw(5)
        }
    },
    ontouchend: function(e) {
        if(e.touches.length == 1) {
            Mouse.up = true
                Mouse.down = false
                Mouse.release_frame = Glop.frame
                Mouse.dragging = false
        }
        User.update()
            Glop.trigger_draw(5)
    },
    ongesturestart: function(e) {
        Map.zoom_old = Map.zoom
    },
    ongesturechange: function(e){
        var node = e.target;
        if (Map.rotate_old == null) Map.rotate_old = Map.rotate
            Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
                Map.zoom = Map.zoom_old*e.scale
                Glop.trigger_draw(5)
    },
    gestureend: function(e){
        Map.rotate_old = null
            User.update()
    },
    dblclick: function(event) {
    },
    drag: function() {
        if (Mouse.dragging && !Prototype.Browser.MobileSafari && !window.PhoneGap) {
            Mouse.drag_x = (Mouse.x - Mouse.click_x)
                Mouse.drag_y = (Mouse.y - Mouse.click_y)
                Tool.drag()
        }
    },
    click_length: function() {
        return Mouse.release_frame-Mouse.click_frame
    },
    resize: function() {
        Glop.trigger_draw(5)
    },
    mouseover: function() {
        Events.enabled = true
    },
    mouseout: function() {
        Events.enabled = false
    }
}
document.observe('cartagen:init', Events.init)



$C = {
    init: function() {
        $('canvas').style.position = 'relative'
            $('main').style.position = 'absolute'
            $('main').style.top = 0
            $('main').style.left = 0
            $('canvas').onselectstart = function() {return false}
        this.canvas =  $('main').getContext('2d')
            this.element = $('main')
            this.canvases.set('main',this.canvas)
            CanvasTextFunctions.enable(this.canvas)
    },
    current: 'main',
    canvases: new Hash,
    freezer: new Hash,
    frozen: false,
    freeze: function(name) {
    },
    thaw: function(name) {
    },
    add: function(name) {
        $('canvas').insert({top:'<canvas style="position:absolute;top:0;left:0" id="'+name+'" ></canvas>'})
            var new_canvas = $(name).getContext('2d')
            $C.canvases.set(name,new_canvas)
    },
    open: function(name) {
    },
    close: function() {
    },
    clear: function(name){
        name = name || 'main'
            $C.canvases.get(name).clearRect(0, 0, Glop.width, Glop.height)
    },
    fill_style: function(color) {
        $C.canvas.fillStyle = color
    },
    fill_pattern: function(image, repeat) {
        if (image.width) {
            $C.canvas.fillStyle = $C.canvas.createPattern(image, repeat)
        }
    },
    draw_image: function(image, x,y) {
        $C.canvas.drawImage(image, x, y)
    },
    translate: function(x,y) {
        $C.canvas.translate(x,y)
    },

    scale: function(x,y) {
        $C.canvas.scale(x,y)
    },

    rotate: function(rotation){
        $C.canvas.rotate(rotation)
    },

    rect: function(x, y, w, h){
        $C.canvas.fillRect(x, y, w, h)
    },
    circ: function(x, y, r){
        $C.canvas.beginPath()
            $C.canvas.arc(x, y, r, 0, 2*Math.PI, true)
            $C.canvas.fill()
    },
    stroke_circ: function(x, y, r){
        $C.begin_path()
            $C.arc(x, y, r, 0, 2*Math.PI, true)
            $C.stroke()
    },
    stroke_rect: function(x, y, w, h){
        $C.canvas.strokeRect(x, y, w, h)
    },

    stroke_style: function(color) {
        $C.canvas.strokeStyle = color
    },

    line_join: function(style) {
        $C.canvas.lineJoin = style
    },

    line_cap: function(style) {
        $C.canvas.lineCap = style
    },

    line_width: function(lineWidth){
        if (parseInt(lineWidth) == 0) {
            $C.canvas.lineWidth = 0.000000001
        } else {
            $C.canvas.lineWidth = lineWidth
        }
    },

    begin_path: function(){
        $C.canvas.beginPath()
    },

    move_to: function(x, y){
        $C.canvas.moveTo(x, y)
    },

    line_to: function(x, y){
        $C.canvas.lineTo(x, y)
    },

    quadratic_curve_to: function(cp_x, cp_y, x, y){
        $C.canvas.quadraticCurveTo(cp_x, cp_y, x, y)
    },

    stroke: function(){
        $C.canvas.stroke()
    },

    outline: function(color,width){
        $C.save()
            $C.stroke_style(color)
            $C.line_width($C.canvas.lineWidth+(width*2))
            $C.canvas.stroke()
            $C.restore()
            $C.canvas.stroke()
    },

    fill: function(){
        $C.canvas.fill()
    },

    arc: function(x, y, radius, startAngle, endAngle, counterclockwise){
        $C.canvas.arc(x, y, radius, startAngle, endAngle, counterclockwise)
    },
    draw_text: function(font, size, color, x, y, text){
        if ($C.canvas.fillText) {
            $C.canvas.fillStyle = color
                $C.canvas.font = size+'pt ' + font
                $C.canvas.fillText(text, x, y)
        } else {
            $C.canvas.strokeStyle = color
                $C.canvas.drawText(font, size, x, y, text)
        }
    },
    measure_text: function(font, size, text) {
        if ($C.canvas.fillText) {
            $C.canvas.font = size + 'pt ' + font
                var width = $C.canvas.measureText(text)
                if (width.width) return width.width
                    return width
        }
        else {
            return $C.canvas.measureCanvasText(font, size, text)
        }


    },
    opacity: function(alpha) {
        $C.canvas.globalAlpha = alpha
    },
    save: function() {
        $C.canvas.save()
    },
    restore: function() {
        $C.canvas.restore()
    },
    to_data_url: function() {
        return $C.canvas.canvas.toDataURL()
    },
    to_print_data_url: function(width,height) {
        var _height = Glop.height, _width = Glop.width
            Glop.width = width
            Glop.height = height
            Glop.draw(true) // with a custom size
            var url = $C.canvas.canvas.toDataURL()
            Glop.width = _width
            Glop.height = _height
            return url
    },
    cursor: function(cursor) {
        this.element.style.cursor = cursor
    }
}

document.observe('cartagen:init', $C.init.bindAsEventListener($C))
var CanvasTextFunctions = { };

CanvasTextFunctions.letters = {
    ' ': { width: 16, points: [] },
    '!': { width: 10, points: [[5,21],[5,7],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '"': { width: 16, points: [[4,21],[4,14],[-1,-1],[12,21],[12,14]] },
    '#': { width: 21, points: [[11,25],[4,-7],[-1,-1],[17,25],[10,-7],[-1,-1],[4,12],[18,12],[-1,-1],[3,6],[17,6]] },
    '$': { width: 20, points: [[8,25],[8,-4],[-1,-1],[12,25],[12,-4],[-1,-1],[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    '%': { width: 24, points: [[21,21],[3,0],[-1,-1],[8,21],[10,19],[10,17],[9,15],[7,14],[5,14],[3,16],[3,18],[4,20],[6,21],[8,21],[10,20],[13,19],[16,19],[19,20],[21,21],[-1,-1],[17,7],[15,6],[14,4],[14,2],[16,0],[18,0],[20,1],[21,3],[21,5],[19,7],[17,7]] },
    '&': { width: 26, points: [[23,12],[23,13],[22,14],[21,14],[20,13],[19,11],[17,6],[15,3],[13,1],[11,0],[7,0],[5,1],[4,2],[3,4],[3,6],[4,8],[5,9],[12,13],[13,14],[14,16],[14,18],[13,20],[11,21],[9,20],[8,18],[8,16],[9,13],[11,10],[16,3],[18,1],[20,0],[22,0],[23,1],[23,2]] },
    '\'': { width: 10, points: [[5,19],[4,20],[5,21],[6,20],[6,18],[5,16],[4,15]] },
    '(': { width: 14, points: [[11,25],[9,23],[7,20],[5,16],[4,11],[4,7],[5,2],[7,-2],[9,-5],[11,-7]] },
    ')': { width: 14, points: [[3,25],[5,23],[7,20],[9,16],[10,11],[10,7],[9,2],[7,-2],[5,-5],[3,-7]] },
    '*': { width: 16, points: [[8,21],[8,9],[-1,-1],[3,18],[13,12],[-1,-1],[13,18],[3,12]] },
    '+': { width: 26, points: [[13,18],[13,0],[-1,-1],[4,9],[22,9]] },
    ',': { width: 10, points: [[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '-': { width: 26, points: [[4,9],[22,9]] },
    '.': { width: 10, points: [[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '/': { width: 22, points: [[20,25],[2,-7]] },
    '0': { width: 20, points: [[9,21],[6,20],[4,17],[3,12],[3,9],[4,4],[6,1],[9,0],[11,0],[14,1],[16,4],[17,9],[17,12],[16,17],[14,20],[11,21],[9,21]] },
    '1': { width: 20, points: [[6,17],[8,18],[11,21],[11,0]] },
    '2': { width: 20, points: [[4,16],[4,17],[5,19],[6,20],[8,21],[12,21],[14,20],[15,19],[16,17],[16,15],[15,13],[13,10],[3,0],[17,0]] },
    '3': { width: 20, points: [[5,21],[16,21],[10,13],[13,13],[15,12],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '4': { width: 20, points: [[13,21],[3,7],[18,7],[-1,-1],[13,21],[13,0]] },
    '5': { width: 20, points: [[15,21],[5,21],[4,12],[5,13],[8,14],[11,14],[14,13],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '6': { width: 20, points: [[16,18],[15,20],[12,21],[10,21],[7,20],[5,17],[4,12],[4,7],[5,3],[7,1],[10,0],[11,0],[14,1],[16,3],[17,6],[17,7],[16,10],[14,12],[11,13],[10,13],[7,12],[5,10],[4,7]] },
    '7': { width: 20, points: [[17,21],[7,0],[-1,-1],[3,21],[17,21]] },
    '8': { width: 20, points: [[8,21],[5,20],[4,18],[4,16],[5,14],[7,13],[11,12],[14,11],[16,9],[17,7],[17,4],[16,2],[15,1],[12,0],[8,0],[5,1],[4,2],[3,4],[3,7],[4,9],[6,11],[9,12],[13,13],[15,14],[16,16],[16,18],[15,20],[12,21],[8,21]] },
    '9': { width: 20, points: [[16,14],[15,11],[13,9],[10,8],[9,8],[6,9],[4,11],[3,14],[3,15],[4,18],[6,20],[9,21],[10,21],[13,20],[15,18],[16,14],[16,9],[15,4],[13,1],[10,0],[8,0],[5,1],[4,3]] },
    ':': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    ',': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '<': { width: 24, points: [[20,18],[4,9],[20,0]] },
    '=': { width: 26, points: [[4,12],[22,12],[-1,-1],[4,6],[22,6]] },
    '>': { width: 24, points: [[4,18],[20,9],[4,0]] },
    '?': { width: 18, points: [[3,16],[3,17],[4,19],[5,20],[7,21],[11,21],[13,20],[14,19],[15,17],[15,15],[14,13],[13,12],[9,10],[9,7],[-1,-1],[9,2],[8,1],[9,0],[10,1],[9,2]] },
    '@': { width: 27, points: [[18,13],[17,15],[15,16],[12,16],[10,15],[9,14],[8,11],[8,8],[9,6],[11,5],[14,5],[16,6],[17,8],[-1,-1],[12,16],[10,14],[9,11],[9,8],[10,6],[11,5],[-1,-1],[18,16],[17,8],[17,6],[19,5],[21,5],[23,7],[24,10],[24,12],[23,15],[22,17],[20,19],[18,20],[15,21],[12,21],[9,20],[7,19],[5,17],[4,15],[3,12],[3,9],[4,6],[5,4],[7,2],[9,1],[12,0],[15,0],[18,1],[20,2],[21,3],[-1,-1],[19,16],[18,8],[18,6],[19,5]] },
    'A': { width: 18, points: [[9,21],[1,0],[-1,-1],[9,21],[17,0],[-1,-1],[4,7],[14,7]] },
    'B': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[-1,-1],[4,11],[13,11],[16,10],[17,9],[18,7],[18,4],[17,2],[16,1],[13,0],[4,0]] },
    'C': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5]] },
    'D': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[11,21],[14,20],[16,18],[17,16],[18,13],[18,8],[17,5],[16,3],[14,1],[11,0],[4,0]] },
    'E': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11],[-1,-1],[4,0],[17,0]] },
    'F': { width: 18, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11]] },
    'G': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[18,8],[-1,-1],[13,8],[18,8]] },
    'H': { width: 22, points: [[4,21],[4,0],[-1,-1],[18,21],[18,0],[-1,-1],[4,11],[18,11]] },
    'I': { width: 8, points: [[4,21],[4,0]] },
    'J': { width: 16, points: [[12,21],[12,5],[11,2],[10,1],[8,0],[6,0],[4,1],[3,2],[2,5],[2,7]] },
    'K': { width: 21, points: [[4,21],[4,0],[-1,-1],[18,21],[4,7],[-1,-1],[9,12],[18,0]] },
    'L': { width: 17, points: [[4,21],[4,0],[-1,-1],[4,0],[16,0]] },
    'M': { width: 24, points: [[4,21],[4,0],[-1,-1],[4,21],[12,0],[-1,-1],[20,21],[12,0],[-1,-1],[20,21],[20,0]] },
    'N': { width: 22, points: [[4,21],[4,0],[-1,-1],[4,21],[18,0],[-1,-1],[18,21],[18,0]] },
    'O': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21]] },
    'P': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,14],[17,12],[16,11],[13,10],[4,10]] },
    'Q': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21],[-1,-1],[12,4],[18,-2]] },
    'R': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[4,11],[-1,-1],[11,11],[18,0]] },
    'S': { width: 20, points: [[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    'T': { width: 16, points: [[8,21],[8,0],[-1,-1],[1,21],[15,21]] },
    'U': { width: 22, points: [[4,21],[4,6],[5,3],[7,1],[10,0],[12,0],[15,1],[17,3],[18,6],[18,21]] },
    'V': { width: 18, points: [[1,21],[9,0],[-1,-1],[17,21],[9,0]] },
    'W': { width: 24, points: [[2,21],[7,0],[-1,-1],[12,21],[7,0],[-1,-1],[12,21],[17,0],[-1,-1],[22,21],[17,0]] },
    'X': { width: 20, points: [[3,21],[17,0],[-1,-1],[17,21],[3,0]] },
    'Y': { width: 18, points: [[1,21],[9,11],[9,0],[-1,-1],[17,21],[9,11]] },
    'Z': { width: 20, points: [[17,21],[3,0],[-1,-1],[3,21],[17,21],[-1,-1],[3,0],[17,0]] },
    '[': { width: 14, points: [[4,25],[4,-7],[-1,-1],[5,25],[5,-7],[-1,-1],[4,25],[11,25],[-1,-1],[4,-7],[11,-7]] },
    '\\': { width: 14, points: [[0,21],[14,-3]] },
    ']': { width: 14, points: [[9,25],[9,-7],[-1,-1],[10,25],[10,-7],[-1,-1],[3,25],[10,25],[-1,-1],[3,-7],[10,-7]] },
    '^': { width: 16, points: [[6,15],[8,18],[10,15],[-1,-1],[3,12],[8,17],[13,12],[-1,-1],[8,17],[8,0]] },
    '_': { width: 16, points: [[0,-2],[16,-2]] },
    '`': { width: 10, points: [[6,21],[5,20],[4,18],[4,16],[5,15],[6,16],[5,17]] },
    'a': { width: 19, points: [[15,14],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'b': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'c': { width: 18, points: [[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'd': { width: 19, points: [[15,21],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'e': { width: 18, points: [[3,8],[15,8],[15,10],[14,12],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'f': { width: 12, points: [[10,21],[8,21],[6,20],[5,17],[5,0],[-1,-1],[2,14],[9,14]] },
    'g': { width: 19, points: [[15,14],[15,-2],[14,-5],[13,-6],[11,-7],[8,-7],[6,-6],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'h': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'i': { width: 8, points: [[3,21],[4,20],[5,21],[4,22],[3,21],[-1,-1],[4,14],[4,0]] },
    'j': { width: 10, points: [[5,21],[6,20],[7,21],[6,22],[5,21],[-1,-1],[6,14],[6,-3],[5,-6],[3,-7],[1,-7]] },
    'k': { width: 17, points: [[4,21],[4,0],[-1,-1],[14,14],[4,4],[-1,-1],[8,8],[15,0]] },
    'l': { width: 8, points: [[4,21],[4,0]] },
    'm': { width: 30, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0],[-1,-1],[15,10],[18,13],[20,14],[23,14],[25,13],[26,10],[26,0]] },
    'n': { width: 19, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'o': { width: 19, points: [[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3],[16,6],[16,8],[15,11],[13,13],[11,14],[8,14]] },
    'p': { width: 19, points: [[4,14],[4,-7],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'q': { width: 19, points: [[15,14],[15,-7],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'r': { width: 13, points: [[4,14],[4,0],[-1,-1],[4,8],[5,11],[7,13],[9,14],[12,14]] },
    's': { width: 17, points: [[14,11],[13,13],[10,14],[7,14],[4,13],[3,11],[4,9],[6,8],[11,7],[13,6],[14,4],[14,3],[13,1],[10,0],[7,0],[4,1],[3,3]] },
    't': { width: 12, points: [[5,21],[5,4],[6,1],[8,0],[10,0],[-1,-1],[2,14],[9,14]] },
    'u': { width: 19, points: [[4,14],[4,4],[5,1],[7,0],[10,0],[12,1],[15,4],[-1,-1],[15,14],[15,0]] },
    'v': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0]] },
    'w': { width: 22, points: [[3,14],[7,0],[-1,-1],[11,14],[7,0],[-1,-1],[11,14],[15,0],[-1,-1],[19,14],[15,0]] },
    'x': { width: 17, points: [[3,14],[14,0],[-1,-1],[14,14],[3,0]] },
    'y': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0],[6,-4],[4,-6],[2,-7],[1,-7]] },
    'z': { width: 17, points: [[14,14],[3,0],[-1,-1],[3,14],[14,14],[-1,-1],[3,0],[14,0]] },
    '{': { width: 14, points: [[9,25],[7,24],[6,23],[5,21],[5,19],[6,17],[7,16],[8,14],[8,12],[6,10],[-1,-1],[7,24],[6,22],[6,20],[7,18],[8,17],[9,15],[9,13],[8,11],[4,9],[8,7],[9,5],[9,3],[8,1],[7,0],[6,-2],[6,-4],[7,-6],[-1,-1],[6,8],[8,6],[8,4],[7,2],[6,1],[5,-1],[5,-3],[6,-5],[7,-6],[9,-7]] },
    '|': { width: 8, points: [[4,25],[4,-7]] },
    '}': { width: 14, points: [[5,25],[7,24],[8,23],[9,21],[9,19],[8,17],[7,16],[6,14],[6,12],[8,10],[-1,-1],[7,24],[8,22],[8,20],[7,18],[6,17],[5,15],[5,13],[6,11],[10,9],[6,7],[5,5],[5,3],[6,1],[7,0],[8,-2],[8,-4],[7,-6],[-1,-1],[8,8],[6,6],[6,4],[7,2],[8,1],[9,-1],[9,-3],[8,-5],[7,-6],[5,-7]] },
    '~': { width: 24, points: [[3,6],[3,8],[4,11],[6,12],[8,12],[10,11],[14,8],[16,7],[18,7],[20,8],[21,10],[-1,-1],[3,8],[4,10],[6,11],[8,11],[10,10],[14,7],[16,6],[18,6],[20,7],[21,10],[21,12]] }
};

CanvasTextFunctions.letter = function (ch)
{
    return CanvasTextFunctions.letters[ch];
}

CanvasTextFunctions.ascent = function( font, size)
{
    return size;
}

CanvasTextFunctions.descent = function( font, size)
{
    return 7.0*size/25.0;
}

CanvasTextFunctions.measure = function( font, size, str)
{
    var total = 0;
    var len = str.length;

    for ( i = 0; i < len; i++) {
        var c = CanvasTextFunctions.letter( str.charAt(i));
        if ( c) total += c.width * size / 25.0;
    }
    return total;
}

CanvasTextFunctions.draw = function(ctx,font,size,x,y,str)
{
    var total = 0;
    var len = str.length;
    var mag = size / 25.0;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = 2.0 * mag;

    for ( i = 0; i < len; i++) {
        var c = CanvasTextFunctions.letter( str.charAt(i));
        if ( !c) continue;

        ctx.beginPath();

        var penUp = 1;
        var needStroke = 0;
        for ( j = 0; j < c.points.length; j++) {
            var a = c.points[j];
            if ( a[0] == -1 && a[1] == -1) {
                penUp = 1;
                continue;
            }
            if ( penUp) {
                try{
                    ctx.moveTo( x + a[0]*mag, y - a[1]*mag);
                } catch(e) {$l(e)}
                penUp = false;
            } else {
                ctx.lineTo( x + a[0]*mag, y - a[1]*mag);
            }
        }
        ctx.stroke();
        x += c.width*mag;
    }
    ctx.restore();
    return total;
}

CanvasTextFunctions.enable = function( ctx)
{
    ctx.drawText = function(font,size,x,y,text) { return CanvasTextFunctions.draw( ctx, font,size,x,y,text); };
    ctx.measureCanvasText = function(font,size,text) { return CanvasTextFunctions.measure( font,size,text); };
    ctx.fontAscent = function(font,size) { return CanvasTextFunctions.ascent(font,size); }
    ctx.fontDescent = function(font,size) { return CanvasTextFunctions.descent(font,size); }

    ctx.drawTextRight = function(font,size,x,y,text) {
        var w = CanvasTextFunctions.measure(font,size,text);
        return CanvasTextFunctions.draw( ctx, font,size,x-w,y,text);
    };
    ctx.drawTextCenter = function(font,size,x,y,text) {
        var w = CanvasTextFunctions.measure(font,size,text);
        return CanvasTextFunctions.draw( ctx, font,size,x-w/2,y,text);
    };
}
var Keyboard = {
    keys: new Hash(),
    key_input: false,
    shift: false,
    hotkeys: {
        "=": function() {
            if (Config.tiles) map.zoomIn()
            else Map.zoom *= 1.1
        },
        "-": function() {
            if (Config.tiles) map.zoomOut()
            else Map.zoom *= 0.9
        },
        "x": function() {
            localStorage.clear()
        },
        "r": function() {
            Tool.unpress(['warp_distort'])
                $('tool_warp_rotate').addClassName('down')
                Tool.Warp.mode = 'rotate'
        },
        "d": function() {
            Tool.unpress(['warp_rotate'])
                $('tool_warp_distort').addClassName('down')
                Tool.Warp.mode = 'default'
        },
        "t": function() {
            Warper.active_image.dblclick()
        },
        "o": function() {
            Warper.active_image.toggle_outline()
        },
        "l": function() {
            Tool.Warp.lock_image()
        },
    },
    hotkey: function(key) {
        if (Keyboard.hotkeys[key]) Keyboard.hotkeys[key]()
            Glop.trigger_draw()
    },
    modifier: function(key) {
        switch(character){
            case "r": Keyboard.keys.set("r",true); break
            case "z": Keyboard.keys.set("z",true); break
            case "g": if (Config.debug && !Config.live_gss) Cartagen.show_gss_editor(); break
            case "b": if (Config.debug) Interface.download_bbox()
            case Event.KEY_UP: Cartagen.fire('keypress:up')
            case Event.KEY_DOWN: Cartagen.fire('keypress:down')
            case Event.KEY_LEFT: Cartagen.fire('keypress:left')
            case Event.KEY_RIGHT: Cartagen.fire('keypress:right')
        }
    }
}
var Mouse = {
    x: 0,
    y: 0,
    window_x: 0,
    window_y: 0,
    down: false,
    up: false,
    click_x: 0,
    click_y: 0,
    click_frame: 0,
    release_frame: null,
    dragging: false,
    drag_x: null,
    drag_y: null,
    hovered_features: []
}
var User = {
    color: Glop.random_color(),
    name: 'anonymous',
    lat: 0,
    lon: 0,
    x: -118.31700000003664,
    y: -6562600.9880228145,
    node_submit_uri: '/node/write',
    node_updates_uri: '/node/read',
    way_submit_uri: '/way/write',
    way_update_uri: '/way/read',
    line_width:15,
    node_radius: 30,
    follow_interval: 60,
    following: false,
    following_executer: null,
    drawing_way: false,
    loaded_node_ids: [],
    init: function() {
        if (Config.load_user_features) {
            User.update()
                new PeriodicalExecuter(User.update, 60)
        }
    },
    geolocate: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(User.set_loc,User.error_loc)
                return true
        }
        else return false
    },
    error_loc: function(err) {
        alert('ERROR(' + err.code + '): ' + err.message);
    },
    set_loc: function(loc) {
        if (loc.coords) {
            User.lat = loc.coords.latitude
                User.lon = loc.coords.longitude
        }
        else {
            User.lat = loc.latitude
                User.lon = loc.longitude
        }
        User.x = Projection.lon_to_x(User.lon)
            User.y = Projection.lat_to_y(User.lat)
            $l('detected location: '+this.lat+","+this.lon)
    },
    calculate_coords: function() {
    },
    create_node: function(x, y, draw, id) {
        if (Object.isUndefined(x)) x = User.x
            if (Object.isUndefined(y)) y = User.y
                if (Object.isUndefined(id)) id = 'temp_' + (Math.random() * 999999999).floor()
                    var node = new Node()
                        node.x = x
                        node.y = y
                        node.radius = User.node_radius
                        node.id = id
                        node.lon = Projection.x_to_lon(x)
                        node.lat = Projection.y_to_lat(y)
                        node.fillStyle = User.color
                        node.strokeStyle = "rgba(0,0,0,0)"
                        node.user_submitted = true

                        if (draw) {
                            Geohash.put(node.lat, node.lon, node, 1)
                                objects.push(node)
                                Glop.trigger_draw()
                        }

        return node
    },
    submit_node: function(x, y) {
        var node = User.create_node(x, y, true)
            var name = prompt('Name for the node')
            node.label.name = name
            var params = {
                color: User.color,
                lon: node.lon,
                lat: node.lat,
                author: User.name,
                name: name
            }
        new Ajax.Request(User.node_submit_uri, {
            method: 'post',
        parameters: params,
        onSuccess: function(transport) {
            node.id = 'cartagen_' + transport.responseText
            User.loaded_node_ids.push(id)
        }
        })
    },
    toggle_following: function() {
        if (User.following) {
            User.following_executer.stop()
                User.following = false
        }
        else {
            User.following_executer = new PeriodicalExecuter(User.center_map_on_user,
                    User.follow_interval)
                User.following = true
                User.center_map_on_user()
        }
    },
    center_map_on_user: function() {
        navigator.geolocation.getCurrentPosition(User.set_loc_and_center)
    },
    mark: function() {
        $C.stroke_style('white')
            $C.line_width(3.5/Map.zoom)
            $C.begin_path()
            $C.translate(User.x,User.y)
            $C.arc(0,0,10/Map.zoom,0,Math.PI*2,true)
            $C.move_to(10/Map.zoom,0)
            $C.line_to(6/Map.zoom,0)
            $C.move_to(-10/Map.zoom,0)
            $C.line_to(-6/Map.zoom,0)
            $C.move_to(0,10/Map.zoom)
            $C.line_to(0,6/Map.zoom)
            $C.move_to(0,-10/Map.zoom)
            $C.line_to(0,-6/Map.zoom)
            $C.stroke()

            $C.stroke_style('#4C6ACB')
            $C.line_width(2/Map.zoom)
            $C.begin_path()
            $C.arc(0,0,10/Map.zoom,0,Math.PI*2,true)
            $C.move_to(10/Map.zoom,0)
            $C.line_to(6/Map.zoom,0)
            $C.move_to(-10/Map.zoom,0)
            $C.line_to(-6/Map.zoom,0)
            $C.move_to(0,10/Map.zoom)
            $C.line_to(0,6/Map.zoom)
            $C.move_to(0,-10/Map.zoom)
            $C.line_to(0,-6/Map.zoom)
            $C.stroke()
    },
    set_loc_and_center: function(loc) {
        User.set_loc(loc)
            Map.x = User.x
            Map.y = User.y
            Glop.trigger_draw()
    },
    toggle_way_drawing: function(x, y) {
        if (User.drawing_way) {
            User.add_node(x, y)
                User.submit_way(User.way)
        }
        else {
            User.way = new Way({
                id: 'temp_' + (Math.random() * 999999999).floor(),
                author: User.name,
                nodes: [User.create_node(x,y,true)],
                tags: new Hash()
            })
            User.way.strokeStyle = User.color
                User.way.lineWidth = User.line_width
                User.way.age = 40
                User.way.user_submitted = true
                Geohash.put(Projection.y_to_lat(User.way.y), Projection.x_to_lon(User.way.x), User.way, 1)
                Glop.trigger_draw()
        }
        User.drawing_way = !User.drawing_way
    },
    submit_way: function(way) {
        var name = prompt('Name for the way')
            way.label.text = name
            var params = {
                color: User.color,
                author: User.name,
                bbox: way.bbox,
                name: name,
                nodes: way.nodes.collect(function(node) {
                    return [node.lat, node.lon]
                })
            }
        new Ajax.Request(User.way_submit_uri, {
            parameters: {way: Object.toJSON(params)},
        onSuccess: function(transport) {
            way.id = 'cartagen_' + transport.responseJSON.way_id
            var id = 0
            way.nodes.each(function(nd) {
                id = transport.responseJSON.node_ids.shift()
                nd.id = 'cartagen_' + transport.responseJSON.node_ids.shift()
                User.loaded_node_ids.push(id)
            })
        }
        })
    },
    add_node: function(x, y) {
        node = User.create_node(x, y, true)
            User.way.nodes.push(node)
            User.way.bbox = Geometry.calculate_bounding_box(User.way.nodes)
            Glop.trigger_draw()
    },
    update: function() {
        if (!Config.load_user_features) return
            var params = {
                bbox: Map.bbox.join(',')
            }
        if (User.last_pos && User.last_pos == [Map.x, Map.y]) {
            params.timestamp = User.last_update
        }
        new Ajax.Request(User.node_updates_uri, {
            parameters: params,
        onSuccess: function(transport) {
            User._update_nodes(transport.responseJSON)
        }
        })
        User.last_pos = [Map.x, Map.y]
            User.last_update = (new Date()).toUTCString()
    },
    _update_nodes: function(nodes) {
        var ways = []
            nodes.each(function(node) {
                node = node.node
                if (User.loaded_node_ids.indexOf(node.id) == -1) {
                    if (node.way_id != 0) {
                        ways.push(node.way_id)
                    }
                    else {
                        var n = new Node
                n.id = 'cartagen_' + node.id
                n.height = User.node_radius*2
                n.width = User.node_radius*2
                n.radius = User.node_radius
                n.fillStyle = node.color
                n.user = node.author
                n.lat = node.lat
                n.lon = node.lon

                if (node.name) {
                    n.label.text = node.name
                }

            n.x = -1*Projection.lon_to_x(n.lon)
                n.y = Projection.lat_to_y(n.lat)
                n.strokeStyle = "rgba(0,0,0,0)"
                n.user_submitted = true
                Geohash.put(n.lat, n.lon, n, 1)
                    }
                }
            })
        Glop.trigger_draw()
            if (ways.length > 0) {
                new Ajax.Request(User.way_update_uri, {
                    parameters: {
                        ids: ways.uniq().join(',')
                    },
                    onSuccess: function(transport) {
                        User._update_ways(transport.responseJSON)
                    }
                })
            }
    },
    _update_ways: function(data) {
        nodes = new Hash()

            data.node.each(function(node) {
                var n = new Node
                n.height = User.node_radius*2
                n.width = User.node_radius*2
                n.radius = User.node_radius
                n.fillStyle = node.color
                n.user = node.author
                n.lat = node.lat
                n.lon = node.lon
                n.x = -1*Projection.lon_to_x(n.lon)
                n.y = Projection.lat_to_y(n.lat)
                n.strokeStyle = "rgba(0,0,0,0)"
                n.order = node.order
                n.user_submitted = true
                if (nodes.get(node.way_id)) {
                    nodes.get(node.way_id).push(n)
                }
                else {
                    nodes.set(node.way_id, [n])
                }
            })

        data.way.each(function(way) {
            var nds = nodes.get(way.id).sort(function(a, b) {return a.order - b.order})
            var data = {
                id: 'cartagen_' + way.id,
        user: way.author,
        nodes: nds,
        tags: new Hash()
            }
        w = new Way(data)
            w.strokeStyle = way.color
            w.lineWidth = User.line_width
            w.user_submitted = true

            if (way.name) {
                w.label.text = way.name
            }
        })
    }
}

document.observe('cartagen:postinit', User.init.bindAsEventListener(User))
var ContextMenu = {
    cond_items: {},
    init: function() {
        this.menu = new Control.ContextMenu('main')
    },
    add_cond_item: function(name, callback) {
        var id = Math.round(Math.random() * 999999999)


            callback.avail = false
            callback.context = window
            ContextMenu.cond_items[id] = callback

            this.menu.addItem({
                label: name,
            callback: function() {
                (ContextMenu.cond_items[id].bind(ContextMenu.cond_items[id].context))()
            },
            condition: function() {
                return ContextMenu.cond_items[id].avail
            }
            })

        return id
    },
    add_static_item: function(name, _callback) {
        this.menu.addItem({
            label: name,
        callback: _callback
        })
    }
}

document.observe('cartagen:init', ContextMenu.init.bindAsEventListener(ContextMenu))
var Zoom = {
    initialize: function() {
        Zoom.interval = 1.3
            $$('body')[0].insert("<div id='cartagen-controls'><style>#cartagen-controls { display:block;height:60px;width:30px;position:absolute;top:"+(18+(-1*Config.padding_top))+"px;right:8px;z-index:200; }#cartagen-controls a { display:block;height:30px;width:30px;text-decoration:none;text-align:center;color:white;background:#222;font-size:24px;font-style:bold;font-family:arial,sans-serif; }#cartagen-controls a:hover { background:#444; }#cartagen-controls a:active { background:#666; }</style><a id='zoomInBtn' href='javascript:void();' onClick='Map.zoom = Map.zoom*Zoom.interval;map.zoomIn();Knitter.openLayersDraw()'>+</a><a id='zoomOutBtn' href='javascript:void();' onClick='Map.zoom = Map.zoom*(1/1.3);map.zoomOut();Knitter.openLayersDraw()'>-</a></div>")
    },
}

document.observe('cartagen:init', Zoom.initialize.bindAsEventListener(Zoom))
var Tool = {
    initialize: function() {
        Glop.observe('mousemove', Tool.Pan.mousemove)
            Glop.observe('mousedown', Tool.Pan.mousedown)
            Glop.observe('mouseup', Tool.Pan.mouseup)
            Glop.observe('dblclick', Tool.Pan.dblclick)
            Glop.observe('mouseover',this.mouse_in_main.bindAsEventListener(this))
            Glop.observe('mouseout',this.mouse_out_main.bindAsEventListener(this))

            document.observe('mousemove', Tool.update_tooltip)
    },
    mouse_in_main: function() {
        Tool.hover = false
    },
    mouse_out_main: function() {
        Tool.hover = true
    },
    show_tooltip: function(tool_name) {
        Tool.hide_tooltip()
            $$('body')[0].insert("<div id='tooltip' class='tooltip'></div>")
            $('tooltip').innerHTML = tool_name
            $('tooltip').absolutize()
            $('tooltip').style.zIndex = 999
    },
    hide_tooltip: function() {
        if ($('tooltip')) $('tooltip').remove()
    },
    update_tooltip: function() {
        if ($('tooltip')) {
            $('tooltip').style.top = -Config.padding_top+'px'
                $('tooltip').style.left = (-Mouse.x)+'px'
        }
    },
    hover: true,
    active: 'Pan',
    change: function(new_tool,force) {
        if (new_tool != Tool.active || force == true) {
            old_tool = Tool.active

                tool_events = ['mousemove','mouseup','mousedown','dblclick']

                tool_events.each(function(tool_event) {
                    Glop.stopObserving(tool_event,Tool[old_tool][tool_event])
                    Glop.observe(tool_event,Tool[new_tool][tool_event])
                })

            if (!Object.isUndefined(Tool[old_tool].deactivate)) {
                Tool[old_tool].deactivate()
            }
            if (!Object.isUndefined(Tool[new_tool].activate)) {
                Tool[new_tool].activate()
            }
            Tool.active = new_tool
        }
        Interface.setup_tooltips()
    },
    drag: function() {
        Tool[Tool.active].drag()
    },
    unpress: function(list) {
        list.each(function(button) {
            $('tool_'+button).removeClassName('down')
        })
    },
    add_toolbar: function(name) {
        $('toolbars').insert('<div class=\'toolbar\' id=\''+name+'\'></div>')
    },
    remove_toolbar: function(name) {
        $(name).remove()
    },
    add_tool_specific_button: function(name,task,tooltip,icon,classes,press,init_tool) {
        $('tool_specific').insert('<a name=\''+tooltip+'\' class=\''+classes+'\' id=\'tool_'+name+'\'  href=\'javascript:void(0);\'><img src=\''+icon+'\' /></a>')
            $('tool_'+name).observe('mouseup',function(e){Glop.trigger_draw();task(e)})
            if (press) {
                Tool.unpress(['move','warp_rotate','warp_distort'])
                    $('tool_'+name).addClassName('down')
            }
    },
    remove_tool_specific_button: function(name) {

    }
}
Tool.Select = {
    activate: function() {
        Tool.Select.active = true
            Tool.Select.dragging = false
    },
    deactivate: function() {
        Tool.Select.active = false
            Tool.Select.dragging = false
    },
    mousemove: function(e) {
        if (Tool.Select.active && Tool.Select.dragging) {
            var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
                var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

                Tool.Select.end = [pointer_x, pointer_y]

                Glop.draw(false, true)

                var width = Tool.Select.end[0] - Tool.Select.start[0]
                var height = Tool.Select.end[1] - Tool.Select.start[1]

                $C.save()
                $C.fill_style('#000')
                $C.opacity(0.2)
                $C.rect(Tool.Select.start[0], Tool.Select.start[1], width, height)
                $C.opacity(1)
                $C.line_width(3/Map.zoom)
                $C.stroke_style('#000')
                $C.stroke_rect(Tool.Select.start[0], Tool.Select.start[1], width, height)
                $C.restore()
        }
    }.bindAsEventListener(Tool.Select),
    mousedown: function(e) {
        if (Tool.Select.active && !Tool.Select.dragging) {
            var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
                var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

                Tool.Select.dragging = true
                Tool.Select.start = [pointer_x, pointer_y]
                Tool.Select.end = Tool.Select.start
        }
    }.bindAsEventListener(Tool.Select),
    mouseup: function() {
        if (Tool.Select.active && Tool.Select.dragging) {
            Glop.paused = false
                $l(Tool.Select.start[0])
                $l(Tool.Select.end[0])

                var min_lon = Math.min(Projection.x_to_lon(Tool.Select.start[0]), Projection.x_to_lon(Tool.Select.end[0]))
                var min_lat = Math.min(Projection.y_to_lat(Tool.Select.start[1]), Projection.y_to_lat(Tool.Select.end[1]))
                var max_lon = Math.max(Projection.x_to_lon(Tool.Select.start[0]), Projection.x_to_lon(Tool.Select.end[0]))
                var max_lat = Math.max(Projection.y_to_lat(Tool.Select.start[1]), Projection.y_to_lat(Tool.Select.end[1]))

                var query = min_lon + ',' + min_lat + ',' + max_lon + ',' + max_lat

                window.open('/api/0.6/map.json?bbox=' + query, 'Cartagen data')

                var lon = (Map.bbox[0] + Map.bbox[2]) / 2
                var lat = (Map.bbox[1] + Map.bbox[3]) / 2

                alert('Copy these values into your Cartagen.setup call: \n\nlat: ' + lat + ', \nlng: ' + lon + ',\nzoom_level: ' + Map.zoom)

                Tool.change('Pan')
        }
    }.bindAsEventListener(Tool.Select),
    drag: function() {

    },
    dblclick: function() {
        $l('Select dblclick')
    }.bindAsEventListener(Tool.Select)
}
Tool.Pen = {
    mode: 'inactive', //'draw','inactive','drag'
    current_poly: null,
    shapes: [],
    drag: function() {
        $l('Pen dragging')
    },
    activate: function() {
        $l('Pen activated')
    },
    deactivate: function() {
        $l('Pen deactivated')
    },
    mousedown: function() {
        console.log('mousedown in pen')
            if (Tool.Pen.mode == 'inactive') {
            }
            else if (Tool.Pen.mode == 'draw') {
                var over_point = false
                    Tool.Pen.shapes.last().points.each(function(point){
                        if (point.mouse_inside()) over_point = true
                        console.log(point.mouse_inside())
                    })
                if (!over_point) { // if you didn't click on an existing node
                    Tool.Pen.shapes.last().new_point(Map.pointer_x(), Map.pointer_y())
                        Tool.Pen.shapes.last().active = true
                }
            }
            else if (Tool.Pen.mode == 'drag'){
                Tool.Pen.shapes.last().active=true
            }

    }.bindAsEventListener(Tool.Pen),
    mouseup: function() {
        $l('Pen mouseup')
    }.bindAsEventListener(Tool.Pen),
    mousemove: function() {
        $l('Pen mousemove')
    }.bindAsEventListener(Tool.Pen),
    dblclick: function() {
        $l('Pen dblclick')
            if (true) {
                Tool.Pen.mode = 'inactive'
                    Tool.change('Pan') //Hi!!
            }

    }.bindAsEventListener(Tool.Pen),
    new_shape: function() {
        Tool.change("Pen")
            Tool.Pen.mode='draw'
            Tool.Pen.shapes.push(new Tool.Pen.Shape([]))
    },
    Shape: Class.create({
        initialize: function(nodes) {
            this.active = false
        this.points = []//$A(
        this.dragging=false
        this.color='#222'

        Glop.observe('glop:postdraw', this.draw.bindAsEventListener(this))
        Glop.observe('mousedown', this.mousedown.bindAsEventListener(this))
        },
        new_point: function(x,y) {
            this.points.push(new Tool.Pen.ControlPoint(x, y, 5, this))
        },
        mouse_inside: function(){
            if (Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y())){
                console.log('Mouse in point')
            }
            return Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y())
        },
        base: function(){
            this.color="#222"
                this.dragging=false
        },
        mousedown: function() {
            if (Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y())&&Tool.active !='Pen') {
                this.active = true
                    this.color='#f00'
                    console.log('Clicked shape')
                    this.points.each(function(point) {
                        point.old_x = point.x
                        point.old_y = point.y
                    })
                this.first_click_x=Map.pointer_x()
                    this.first_click_y=Map.pointer_y()
                    if (this.active){
                        if (!this.dragging){
                            this.dragging=true
                                Tool.change('Warp')
                        }
                    }
            }
            else if (Tool.active!='Pen') {
                this.active = false
                    this.color='#000'
            }
        },
        hover: function(){
            this.color='#900'
                this.dragging=false
                console.log('Hover')
        },
        draw: function() {
            if (this.mouse_inside()){
                if (this.dragging){
                    this.drag_started=true
                        console.log('Trying to drag')
                        Tool.Pen.mode='drag'
                        for (var i=0; i<this.points.length; i++){
                            this.points[i].x=this.points[i].old_x + (Map.pointer_x()-this.first_click_x)
                                this.points[i].y=this.points[i].old_y + (Map.pointer_y()-this.first_click_y)
                        }
                    this.color = '#f00'
                }
                else if (!Mouse.down){
                    this.hover()
                }
            }
            if (this.drag_started && Mouse.down){
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].old_x + (Map.pointer_x()-this.first_click_x)
                        this.points[i].y=this.points[i].old_y + (Map.pointer_y()-this.first_click_y)
                }
                this.color = '#f00'
            }
            if (!Mouse.down){
                this.drag_started=false
            }
            else{
                this.base()
            }

            $C.save()
                $C.stroke_style('#000')
                $C.fill_style(this.color)
                if (this.active) $C.line_width(2)
                else $C.line_width(0)
                    $C.begin_path()
                        if (this.points.length>0){
                            $C.move_to(this.points[0].x, this.points[0].y)
                                this.points.each(function(point) {
                                    $C.line_to(point.x, point.y)
                                })
                            $C.line_to(this.points[0].x, this.points[0].y)

                        }
            $C.opacity(0.4)
                $C.stroke()
                $C.opacity(0.2)
                $C.fill()
                $C.restore()
        }
    }),
    ControlPoint: Class.create({
        initialize: function(x,y,r,parent) {
            this.x = x
        this.y = y
        this.r = r
        this.parent_shape = parent
        this.color = '#200'
        this.dragging = false
        Glop.observe('glop:postdraw', this.draw.bindAsEventListener(this))
        Glop.observe('mousedown', this.click.bindAsEventListener(this))
        },
    draw: function() {
        if (this.parent_shape.active) {
            $C.save()
        $C.line_width(3/Map.zoom)
        $C.translate(this.x,this.y)
        $C.fill_style("#333")
        $C.opacity(0.6)
        if (this.parent_shape.locked) {
            $C.begin_path()
        $C.move_to(-6/Map.zoom,-6/Map.zoom)
        $C.line_to(6/Map.zoom,6/Map.zoom)
        $C.move_to(-6/Map.zoom,6/Map.zoom)
        $C.line_to(6/Map.zoom,-6/Map.zoom)
        $C.stroke()
        } else {
            if (this.mouse_inside()) $C.circ(0, 0, this.r)
                $C.stroke_circ(0, 0, this.r)
        }
    $C.restore()

        }

        /*var nodestring = ''
          nodes.each(function(node) {
          nodestring += '(' + node[0] + ', ' + node[1] + ')\n'
          })*/

        if (this.dragging && Mouse.down) {
            this.drag()
        }
        else if (this.mouse_inside()) {
            if (Mouse.down) {
                this.drag()
            }
            else {
                this.hover()
            }
        }
        else {
            this.base()
        }
    },
    mouse_inside: function() {
        return (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r)
    },
    base: function() {
        this.color = '#200'
            this.dragging = false
    },
    click: function() {
        if (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r  && Tool.active!='Pen') {
            this.color = '#f00'
                console.log('clicked control point')
                this.parent_shape.active = true

        }
    },
    hover: function() {
        this.color = '#900'
            this.dragging = false
    },
    drag: function() {
        if (this.parent_shape.active  /*&& Geometry.distance(this.x, this.y, Map.pointer)*/) {
            if (!this.dragging) {
                this.dragging = true
                    this.drag_offset_x = Map.pointer_x() - this.x
                    this.drag_offset_y = Map.pointer_y() - this.y
            }
            this.color = '#f00'
                this.x=Map.pointer_x()
                this.y=Map.pointer_y()
        }
    },
    r: function() {
        this.color = '#00f'
    }
    }),
}
Tool.Pan = {
    mousedown: function(event) {
        Map.x_old = Map.x
            Map.y_old = Map.y
            Map.zoom_old = Map.zoom
            Map.rotate_old = Map.rotate
    }.bindAsEventListener(Tool.Pan),
    mouseup: function() {
        Glop.fire('pan:mouseup')
    }.bindAsEventListener(Tool.Pan),
    mousemove: function() {
        var lon = Projection.x_to_lon(-1*Map.pointer_x())
            var lat = Projection.y_to_lat(Map.pointer_y())
            var features = Geohash.get_current_features_upward(encodeGeoHash(lat, lon))
            if (features) features.reverse().concat(Mouse.hovered_features).invoke('style')
    }.bindAsEventListener(Tool.Pan),
    /*
     * Handles drags. Should rewrite this as an event listener rather than passing from Event > Tool > here
     */
    drag: function() {
        if (Keyboard.keys.get("r")) { // rotating
            Map.rotate = Map.rotate_old + (-1*Mouse.drag_y/Glop.height)
        } else if (Keyboard.keys.get("z")) {
            if (Map.zoom > 0) {
                Map.zoom = Math.abs(Map.zoom - (Mouse.drag_y/Glop.height))
            } else {
                Map.zoom = 0
            }
        } else {
            var d_x = Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
                var d_y = Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x
                Map.x = Map.x_old+(d_x/Map.zoom)
                Map.y = Map.y_old+(d_y/Map.zoom)
                Glop.fire('pan:dragging')
        }
    },
    dblclick: function() {
        $l('Pan dblclick')
    }.bindAsEventListener(Tool.Pan)
}
Tool.Warp = {
    mode: 'default', //'rotate','mask'
    activate: function() {
        Tool.add_toolbar("tool_specific")
            Tool.add_tool_specific_button("warp_delete",Tool.Warp.delete_image,"Delete this image","/images/silk-grey/delete.png","first silk")
            Tool.add_tool_specific_button("warp_revert",function(){Warper.active_image.set_to_natural_size();},"Revert to original proportions","/images/silk-grey/arrow_refresh.png","silk")
            Tool.add_tool_specific_button("warp_lock",Tool.Warp.lock_image,"Lock this image (l)","/images/silk-grey/lock.png","silk")
            if (Warper.active_image.locked) $('tool_warp_lock').addClassName('down')
                Tool.add_tool_specific_button("warp_outline",function(){Warper.active_image.toggle_outline()},"Toggle image outline (o)","/images/tools/stock-tool-rect-select-22.png",true)
                    Tool.add_tool_specific_button("warp_transparent",function(){Warper.active_image.dblclick()},"Toggle image transparency (t)","/images/silk-grey/contrast_low.png","silk")
                    Tool.add_tool_specific_button("warp_rotate",function(){Tool.Warp.mode = 'rotate'},"Rotate/scale this image (r)","/images/tools/stock-tool-rotate-22.png",true)
                    Tool.add_tool_specific_button("warp_distort",function(){Tool.Warp.mode = 'default'},"Distort this image by dragging corners (d)","/images/tools/stock-tool-perspective-22.png",true)
                    if (Config.beta) Tool.add_tool_specific_button("warp_mask",function(){Tool.change('Mask')},"Mask out parts of this image (m)","/images/silk-grey/shape_move_backwards.png","silk")
                        Tool.add_tool_specific_button("warp_undo",function(){Warper.active_image.undo();},"Undo last image edit","/images/silk-grey/arrow_undo.png","silk last")
                            $('tool_warp_distort').addClassName('down')
    },
    deactivate: function() {
        Tool.remove_toolbar("tool_specific")
            Tool.Warp.mode = 'default'
            Warper.active_object = false
    },
    delete_image: function() {
        if (confirm('Are you sure you want to delete this image? You cannot undo this action.')) {
            Warper.images.each(function(image,index) {
                if (image.active && Warper.active_image == image) {
                    Warper.images.splice(index,1)
                image.cleanup()
                new Ajax.Request('/warper/delete/'+image.id,{
                    method:'post',
                })
                }
            })
            Tool.change('Pan')
        }
        Tool.hide_tooltip()
    },
    lock_image: function() {
        if (!Warper.active_image.locked) $('tool_warp_lock').addClassName('down')
        else $('tool_warp_lock').removeClassName('down')
            Warper.active_image.locked = !Warper.active_image.locked
                Warper.active_image.save()
    },
    drag: function() {
    },
    mousedown: function() {
    }.bindAsEventListener(Tool.Warp),
    mouseup: function() {
        if (Warper.active_image) {
            if (Warper.active_image.active_point) {
                Warper.active_image.active_point.cancel_drag()
            } else {
                Warper.active_image.cancel_drag()
            }
        }
        $C.cursor('auto')
    }.bindAsEventListener(Tool.Warp),
    mousemove: function() {
        if (Mouse.down){
            if (Warper.active_image) {
                if (Warper.active_image.active_point) {
                    Warper.active_image.active_point.drag()
                } else {
                    Warper.active_image.drag()
                }
            }
        }
    }.bindAsEventListener(Tool.Warp),
    dblclick: function() {

    }.bindAsEventListener(Tool.Warp)
}
Tool.Mask = {
    mode: 'draw', //'draw','inactive','drag'
    current_poly: null,
    drag: function() {
        $l('Mask dragging')
    },
    activate: function() {
        Tool.hide_tooltip()
    },
    deactivate: function() {
        $l('Mask deactivated')
    },

    mousedown: function() {
        if (Tool.Mask.mode == 'inactive') {
        } else if (Tool.Mask.mode == 'draw') {
            if (Warper.active_image && Warper.active_image.mask == false) Tool.Mask.mask_warpable()
                var over_point = false
                    Tool.Mask.warpable.mask.points.each(function(point){
                        if (point.mouse_inside()) over_point = true
                    })
            if (!over_point) { // if you didn't click on an existing node
                Tool.Mask.warpable.mask.new_point(Map.pointer_x(), Map.pointer_y())
            }
        } else if (Tool.Mask.mode == 'drag'){
            Tool.Mask.warpable.mask.enabled=true
        }

    }.bindAsEventListener(Tool.Mask),

    mouseup: function() {
        $l('Mask mouseup')
    }.bindAsEventListener(Tool.Mask),
    mousemove: function() {
        $l('Mask mousemove')
    }.bindAsEventListener(Tool.Mask),

    dblclick: function() {
        Tool.Mask.warpable.mask.enabled = true
            Tool.Mask.mode = 'inactive'
            Tool.change('Pan')
    }.bindAsEventListener(Tool.Mask),

    mask_warpable: function() {
        Tool.Mask.warpable = Warper.active_image
            Tool.Mask.mode='draw'
            Tool.Mask.warpable.mask = new Tool.Mask.Shape([],Tool.Mask.warpable)
    },
    coordinates: function() {
        coordinates = []
            this.points.each(function(point) {
                var lon = Projection.x_to_lon(-point.x)
                var lat = Projection.y_to_lat(point.y)
                coordinates.push([lon,lat])
            })
        return coordinates
    },

    Shape: Class.create({
        initialize: function(nodes,parent_image) {
            this.enabled = false
        this.points = []//$A(
        this.dragging=false
        this.color='#222'
        this.parent_image = parent_image

        Glop.observe('glop:postdraw', this.draw.bindAsEventListener(this))
        Glop.observe('mousedown', this.mousedown.bindAsEventListener(this))
        Glop.observe('mouseup', this.mouseup.bindAsEventListener(this))
        },
        new_point: function(x,y) {
            this.points.push(new Tool.Mask.ControlPoint(x, y, 6/Map.zoom, this))
        },
        mouse_inside: function(){
            return Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y())
        },
        base: function(){
            this.color="#222"
                this.dragging=false
        },
        mousedown: function() {
            if (Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y())&&Tool.active !='Mask') {
                this.active = true
                    this.color='#f00'
                    console.log('Clicked shape')
                    this.points.each(function(point) {
                        point.old_x = point.x
                        point.old_y = point.y
                    })
                this.first_click_x=Map.pointer_x()
                    this.first_click_y=Map.pointer_y()
                    if (this.active){
                        if (!this.dragging){
                            this.dragging = true
                                Tool.change('Warp')
                        }
                    }
            }
            else if (Tool.active != 'Mask') {
                this.active = false
                    this.color='#000'
            }
        },
        mouseup: function() {
            this.dragging = false
        },
        hover: function(){
            this.color='#900'
                this.dragging=false
        },
        draw: function() {
            if (this.mouse_inside()){
                if (this.dragging){
                    this.drag_started=true
                        Tool.Mask.mode='drag'
                        for (var i=0; i<this.points.length; i++){
                            this.points[i].x=this.points[i].old_x + (Map.pointer_x()-this.first_click_x)
                                this.points[i].y=this.points[i].old_y + (Map.pointer_y()-this.first_click_y)
                        }
                    this.color = '#f00'
                }
                else if (!Mouse.down){
                    this.hover()
                }
            }
            if (this.drag_started && Mouse.down){
                for (var i=0; i<this.points.length; i++){
                    this.points[i].x=this.points[i].old_x + (Map.pointer_x()-this.first_click_x)
                        this.points[i].y=this.points[i].old_y + (Map.pointer_y()-this.first_click_y)
                }
                this.color = '#f00'
            }
            if (!Mouse.down){
                this.drag_started=false
            }
            else{
                this.base()
            }

            $C.save()
                $C.stroke_style('#000')
                $C.fill_style(this.color)
                if (this.active) $C.line_width(2/Map.zoom)
                else $C.line_width(0)
                    $C.begin_path()
                        if (this.points.length>0){
                            $C.move_to(this.points[0].x, this.points[0].y)
                                this.points.each(function(point) {
                                    $C.line_to(point.x, point.y)
                                })
                            $C.line_to(this.points[0].x, this.points[0].y)

                        }
            $C.opacity(0.4)
                $C.stroke()
                $C.opacity(0.2)
                $C.fill()
                $C.restore()
        }
    }),
    ControlPoint: Class.create({
        initialize: function(x,y,r,parent_shape) {
            this.x = x
        this.y = y
        this.r = r
        this.parent_shape = parent_shape
        this.color = '#200'
        this.dragging = false
        Glop.observe('glop:postdraw', this.draw.bindAsEventListener(this))
        Glop.observe('mousedown', this.click.bindAsEventListener(this))
        },
    draw: function() {
        if (this.parent_shape.parent_image.active) {
            $C.save()
        $C.line_width(2/Map.zoom)
        $C.translate(this.x,this.y)
        $C.fill_style("#333")
        $C.opacity(0.6)
        if (this.parent_shape.locked) {
            $C.begin_path()
        $C.move_to(-6/Map.zoom,-6/Map.zoom)
        $C.line_to(6/Map.zoom,6/Map.zoom)
        $C.move_to(-6/Map.zoom,6/Map.zoom)
        $C.line_to(6/Map.zoom,-6/Map.zoom)
        $C.stroke()
        } else {
            if (this.mouse_inside()) $C.circ(0, 0, this.r)
                $C.stroke_circ(0, 0, 6)//this.r)
        }
    $C.restore()

        }

        /*var nodestring = ''
          nodes.each(function(node) {
          nodestring += '(' + node[0] + ', ' + node[1] + ')\n'
          })*/

        if (this.dragging && Mouse.down) {
            this.drag()
        }
        else if (this.mouse_inside()) {
            if (Mouse.down) {
                this.drag()
            }
            else {
                this.hover()
            }
        }
        else {
            this.base()
        }
    },
    mouse_inside: function() {
        return (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r)
    },
    base: function() {
        this.color = '#200'
            this.dragging = false
    },
    click: function() {
        if (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r  && Tool.active!='Mask') {
            this.color = '#f00'
                console.log('clicked control point')
                this.parent_shape.active = true

        }
    },
    hover: function() {
        this.color = '#900'
            this.dragging = false
    },
    drag: function() {
        if (!this.dragging) {
            this.dragging = true
                this.drag_offset_x = Map.pointer_x() - this.x
                this.drag_offset_y = Map.pointer_y() - this.y
        }
        if (this.drag_offset_x) {
            this.x = Map.pointer_x() - this.drag_offset_x
                this.y = Map.pointer_y() - this.drag_offset_y
        }
    },
    r: function() {
        this.color = '#00f'
    }
    }),
}

var Interface = {

    mousemove: function(event) {
        Mouse.window_x = Event.pointerX(event)
            Mouse.window_y = Event.pointerY(event)
    },

    setup_tooltips: function() {
        $$('.toolbar a').each(function(toolbar){
            toolbar.onmouseover = function() {
                Interface.show_tooltip(toolbar.name)
            }
            toolbar.onmouseout = function() {
                $$('.tooltip').each(function(tooltip) {
                    tooltip.remove()
                })
            }
        })
    },

    show_tooltip: function(name) {
        $$('.tooltip').each(function(tooltip){
            tooltip.remove()
        })
        $$('body')[0].insert('<div class="tooltip" id="tooltip">'+name+'</div>')
            $('tooltip').style.left = (Mouse.window_x)+'px'
    },

    display_iframe: function() {
        if ($('iframe_code') != undefined) {
            $('iframe_code').remove()
        } else { $$('body')[0].insert("<div style='padding:6px 10px;width:400px;z-index:999999;background:rgba(255,255,255,0.6);margin:8px;' id='iframe_code'><h3>Embed this map on your web site</h3><p>Copy this code and paste it into a blog post or HTML page:</p><textarea cols='40' rows='5'>"+Interface.get_iframe(Map.lat,Map.lon,Map.zoom,Config.stylesheet)+"</textarea><p style='text-align:right;'><br style='clear:both;' /></div>")
            $('iframe_code').absolutize()
        }
    },

    display_knitter_iframe: function() {
        if ($('iframe_code') != undefined) {
            $('iframe_code').remove()
        } else { $$('body')[0].insert("<div style='padding:6px 10px;width:400px;z-index:999999;background:rgba(255,255,255,0.6);margin:8px;' id='iframe_code'><h3>Embed this map on your web site</h3><p>Copy this code and paste it into a blog post or HTML page:</p><textarea cols='40' rows='5'>"+Interface.get_iframe(Map.lat,Map.lon,Map.zoom,Config.stylesheet,'http://cartagen.org/maps/'+Config.map_name,true)+"</textarea><p style='text-align:right;'><br style='clear:both;' /></div>")
            $('iframe_code').absolutize()
        }
    },

    get_iframe: function(lat,lon,zoom,stylesheet,url,locked,height,width) {
        width = width || 500
            height = height || 300
            zoom = zoom || 2
            url = url || 'http://cartagen.org'

            code = "<iframe height='"+height+"'width='"+width+"' src='"+url+'?fullscreen=true'
            if (!Object.isUndefined(locked)) code += '&#038;locked=true'
                if (!Object.isUndefined(stylesheet)) code += '&#038;gss='+stylesheet
                    code = code + "' style='border:0;'></iframe>"
                        return code
    },

    display_loading: function() {
        if (Config.vectors) {
            var percent = Importer.parse_manager.completed
                if (percent > 75 || (percent < 100)) {
                    $('loading_message').hide()
                }
            if (percent < 100) {
                $C.save()
                    $C.translate(Map.x,Map.y)
                    $C.rotate(-Map.rotate)
                    $C.translate(-Map.x,-Map.y)
                    $C.fill_style('white')
                    $C.line_width(0)
                    $C.opacity(0.7)
                    var x = Map.x-(1/Map.zoom*(Glop.width/2))+(40/Map.zoom), y = Map.y-(1/Map.zoom*(Glop.height/2))+(40/Map.zoom)
                    $C.begin_path()
                    $C.line_to(x,y)
                    $C.arc(x,y,24/Map.zoom,-Math.PI/2,Math.PI*2-Math.PI/2,false)
                    $C.line_to(x,y)
                    $C.fill()
                    $C.opacity(0.9)
                    $C.line_width(6/Map.zoom)
                    $C.stroke_style('white')
                    $C.line_cap('square')
                    $C.begin_path()
                    $C.arc(x,y,27/Map.zoom,-Math.PI/2,Math.PI*2*(percent/100)-Math.PI/2,false)
                    $C.stroke()
                    var width = $C.measure_text("Lucida Grande, sans-serif",
                            12,
                            parseInt(percent)+"%")
                    $C.draw_text("Lucida Grande, sans-serif",
                            12/Map.zoom,
                            "#333",
                            x-(width/(2*Map.zoom)),
                            y+(6/Map.zoom),
                            parseInt(percent)+"%")
                    $C.translate(Map.x,Map.y)
                    $C.rotate(Map.rotate)
                    $C.translate(-Map.x,-Map.y)
                    $C.restore()
            }
        }
    },

    display_loading_message: function(percent) {
        if (Config.vectors) {
            $$('body')[0].insert('<div onClick="$(\'loading_message\').hide();" id="loading_message" style="position:absolute;z-index:20;top:25%;width:100%;text-align:center;-webkit-user-select:none;-moz-user-select:none;"><div style="width:200px;margin:auto;background:rgba(255,255,255,0.8);font-family:Lucida Grande,Lucida Sans Console,Georgia,sans-serif;font-size:16px;padding:14px;-moz-border-radius:10px;-webkit-border-radius:10px;"><p><img src="/images/spinner.gif" style="margin-bottom:12px;" /><br />Loading map data...<p><small>(Use arrow keys and +/- to pan and zoom)</small></p></div></div>')
        }
    },

    download_bbox: function() {
        Glop.paused = true
            alert('Please select a bounding box to download')
            Tool.change('Select')
    }
}
document.observe('mousemove',Interface.mousemove)

var Geohash = {}

Object.extend(Geohash, Enumerable)

    Object.extend(Geohash, {
        _dirs: ['top','bottom','left','right'],
        hash: new Hash(),
        objects: [],
        object_hash: new Hash(),
        grid: false,
        grid_color: 'black',
        default_length: 6, // default length of geohash
        limit_bottom: 8, // 12 is most ever...
        last_get_objects: [0,0,0,false],
        last_loaded_geohash_frame: 0,
        init: function() {
            Glop.observe('cartagen:predraw', this.draw.bindAsEventListener(this))
        Glop.observe('cartagen:postdraw', this.draw_bboxes.bindAsEventListener(this))
        },
        draw: function() {
            if (Config.vectors) {
                if (this.last_get_objects[3] || Geohash.objects.length == 0 || Map.zoom/this.last_get_objects[2] > 1.1 || Map.zoom/this.last_get_objects[2] < 0.9 || Math.abs(this.last_get_objects[0] - Map.x) > 100 || Math.abs(this.last_get_objects[1] - Map.y) > 100) {
                    this.get_objects()
        this.last_get_objects[3] = false
        Cartagen.last_loaded_geohash_frame = Glop.frame
                }
            }
        },
        put: function(lat,lon,feature,length) {
            if (!length) length = this.default_length
                var key = this.get_key(lat,lon,length)

                    var merge_hash = this.hash.get(key)
                    if (!merge_hash) {
                        merge_hash = [feature]
                    } else {
                        merge_hash.push(feature)
                    }

            this.hash.set(key,merge_hash)
        },
        put_object: function(feature) {
            this.put(Projection.y_to_lat(feature.y),
                    Projection.x_to_lon(-feature.x),
                    feature,
                    this.get_key_length(feature.width,feature.height))
        },
        get_key: function(lat,lon,length) {
            if (!length) length = this.default_length
                if (length < 1) length = 1

                    return encodeGeoHash(lat,lon).truncate(length,'')
        },
        get: function(lat,lon,length) {
            if (!length) length = this.default_length

                var key = this.get_key(lat,lon,length)
                    return this.hash.get(key)
        },
        get_from_key: function(key) {
            return this.hash.get(key) || []
        },
        get_upward: function(key) {
            key.truncate(this.limit_bottom,'')

                var this_level = this.hash.get(key)

                if (this_level && key.length > 0) {
                    if (key.length > 1) return this_level.concat(this.get_upward(key.truncate(key.length-1),''))
                    else return this_level
                } else {
                    if (key.length > 1) return this.get_upward(key.truncate(key.length-1),'')
                    else return []
                }
        },
        get_keys_upward: function(key) {
            key.truncate(this.limit_bottom,'')

                if (key.length > 0) {
                    this.keys.set(key, true)
                        k = key.truncate(key.length-1,'')
                        if (key.length > 1 && !Geohash.keys.get(k)) {
                            this.get_keys_upward(k)
                        }
                }
        },
        get_current_features_upward: function(key) {
            keys = []
                for (var i=this.limit_bottom; i > 0; i--) {
                    keys.push(key.truncate(i, ''))
                }
            features =  []
                keys.each(function(k) {
                    if (this.object_hash.get(k)) features = this.object_hash.get(k).concat(features)
                }, this)
            return features
        },
        get_all_neighbor_keys: function(key) {
            var top = calculateAdjacent(key, 'top')
                var bottom = calculateAdjacent(key, 'bottom')
                var left = calculateAdjacent(key, 'left')
                var right = calculateAdjacent(key, 'right')
                var top_left = calculateAdjacent(top, 'left')
                var top_right = calculateAdjacent(top, 'right')
                var bottom_left = calculateAdjacent(bottom, 'left')
                var bottom_right = calculateAdjacent(bottom, 'right')
                return [top, top_right, right, bottom_right, bottom, bottom_left, left, top_left]
        },
        get_neighbors: function(key) {
            var neighbors = []

                this._dirs.each(function(dir) {
                    var n_key = calculateAdjacent(key, dir)
                    var n_array = this.get_from_key(n_key)
                    if (n_array) neighbors = neighbors.concat(n_array)
                }, this)

            return neighbors
        },
        fill_bbox: function(key,keys) {
            this.get_all_neighbor_keys(key).each(function(k) {
                if (!keys.get(k)) {
                    keys.set(k, true)

                var bbox = decodeGeoHash(k) //[lon1, lat2, lon2, lat1]
                if (Math.in_range(bbox.latitude[0],Map.bbox[3],Map.bbox[1]) &&
                    Math.in_range(bbox.latitude[1],Map.bbox[3],Map.bbox[1]) &&
                    Math.in_range(bbox.longitude[0],Map.bbox[0],Map.bbox[2]) &&
                    Math.in_range(bbox.longitude[1],Map.bbox[0],Map.bbox[2])) {
                        this.fill_bbox(k,keys)
                    }
                }
            }, this)
        },
        trace: function() {
            var lengths = new Hash
                this.hash.keys().each(function(key) {
                    $l(key+': '+this.hash.get(key).length)
                    if (!lengths.get(key.length)) lengths.set(key.length,0)
                    lengths.set(key.length,lengths.get(key.length)+1)
                }, this)

            $l('Lengths >>')

                lengths.keys().sort().each(function(length) {
                    $l(length+": "+lengths.get(length))
                })

            return this.hash.size()
        },
        bbox: function(geohash) {
            var geo = decodeGeoHash(geohash)
                return [geo.longitude[0],geo.latitude[1],geo.longitude[1],geo.latitude[0],geohash]
        },
        draw_bbox: function(key) {
            var bbox = this.bbox(key)

                var line_width = 1/Map.zoom
                $C.line_width(Math.max(line_width,1))
                $C.stroke_style(this.grid_color)

                var width = Projection.lon_to_x(bbox[2]) - Projection.lon_to_x(bbox[0])
                var height = Projection.lat_to_y(bbox[1]) - Projection.lat_to_y(bbox[3])

                $C.stroke_rect(Projection.lon_to_x(bbox[0]),
                        Projection.lat_to_y(bbox[3]),
                        width,
                        height)
                $C.save()
                $C.translate(Projection.lon_to_x(bbox[0]),Projection.lat_to_y(bbox[3]))
                $C.fill_style(Object.value(this.fontBackground))
                var height = 16 / Map.zoom
                var width = $C.measure_text('Lucida Grande',
                        height,
                        key)
                var padding = 2
                $C.draw_text('Lucida Grande',
                        height,
                        this.grid_color,
                        3/Map.zoom,
                        -3/Map.zoom,
                        key)
                $C.restore()
        },
        draw_bboxes: function() {
            if (Geohash.grid) {
                this.keys.keys().each(function(key){
                    Geohash.draw_bbox(key)
                })
            }
        },
        get_key_length: function(lat,lon) {
            if      (lon < 0.0000003357) lon_key = 12
            else if (lon < 0.000001341)  lon_key = 11
            else if (lon < 0.00001072)   lon_key = 10
            else if (lon < 0.00004291)   lon_key = 9
            else if (lon < 0.0003433)    lon_key = 8
            else if (lon < 0.001373)     lon_key = 7
            else if (lon < 0.01098)      lon_key = 6
            else if (lon < 0.04394)      lon_key = 5
            else if (lon < 0.3515)       lon_key = 4
            else if (lon < 1.406)        lon_key = 3
            else if (lon < 11.25)        lon_key = 2
            else if (lon < 45)           lon_key = 1
            else                         lon_key = 0 // eventually we can map the whole planet at once

                if      (lat < 0.0000001676) lat_key = 12
                else if (lat < 0.000001341)  lat_key = 11
                else if (lat < 0.000005364)  lat_key = 10
                else if (lat < 0.00004291)   lat_key = 9
                else if (lat < 0.0001716)    lat_key = 8
                else if (lat < 0.001373)     lat_key = 7
                else if (lat < 0.005493)     lat_key = 6
                else if (lat < 0.04394)      lat_key = 5
                else if (lat < 0.1757)       lat_key = 4
                else if (lat < 1.40625)      lat_key = 3
                else if (lat < 5.625)        lat_key = 2
                else if (lat < 45)           lat_key = 1
                else                         lat_key = 0 // eventually we can map the whole planet at once

                    return Math.min(lat_key,lon_key)
        },
        get_objects: function() {
            this.last_get_objects = [Map.x,Map.y,Map.zoom]
                this.objects = []

                this.keys = new Hash

                this.key_length = this.get_key_length(0.0015/Map.zoom, 0.0015/Map.zoom)

                this.key = this.get_key(Map.lat, Map.lon, this.key_length)

                var bbox = decodeGeoHash(this.key) //[lon1, lat2, lon2, lat1]

                this.fill_bbox(this.key, this.keys)
                this.get_keys_upward(this.key)

                this.keys.keys().each(function(key, index) {
                    this.get_keys_upward(key)
                }, this)





            var features;
            this.keys.keys().each(function(key) {
                features = this.get_from_key(key)
                this.object_hash.set(key, features)
                this.objects = features.concat(this.objects)
            }, this)

            this.sort_objects()

                return this.objects
        },
        sort_objects: function() {
            this.objects.sort(Geometry.sort_by_area)
        },
        feature_density: function() {
            return 2 * Viewport.power()
        },
        feature_quota: function() {
            return ((Glop.width * Glop.height) * (Geohash.feature_density() / 1000)).round()
        },
        _each: function(f) {
            this.hash.each(function(pair) {
                pair.value.each(function(val) { f(val) })
            })
        }
    })



document.observe('cartagen:init', Geohash.init.bindAsEventListener(Geohash))
var Projection = {
    current_projection: 'spherical_mercator',
    scale_factor: 100000,
    lon_to_x: function(lon) { return -1*Projection[Projection.current_projection].lon_to_x(lon) },
    x_to_lon: function(x) { return Projection[Projection.current_projection].x_to_lon(x) },
    lat_to_y: function(lat) { return -1*Projection[Projection.current_projection].lat_to_y(lat) },
    y_to_lat: function(y) { return -1*Projection[Projection.current_projection].y_to_lat(y) },
    center_lon: function() { return Config.lng },
    spherical_mercator: {
        lon_to_x: function(lon) { return (lon - Projection.center_lon()) * -1 * Projection.scale_factor },
        x_to_lon: function(x) { return (x/(-1*Projection.scale_factor)) + Projection.center_lon() },
        lat_to_y: function(lat) { return 180/Math.PI * Math.log(Math.tan(Math.PI/4+lat*(Math.PI/180)/2)) * Projection.scale_factor },
        y_to_lat: function(y) { return  180/Math.PI * (2 * Math.atan(Math.exp(y/Projection.scale_factor*Math.PI/180)) - Math.PI/2) }
    },
    elliptical_mercator: {
        lon_to_x: function(lon) {
            var r_major = 6378137.000;
            return r_major * lon;
        },
        x_to_lon: function(x) {
            var r_major = 6378137.000;
            return lon/r_major;
        },
        lat_to_y: function(lat) {
            if (lat > 89.5)
                lat = 89.5;
            if (lat < -89.5)
                lat = -89.5;
            var r_major = 6378137.000;
            var r_minor = 6356752.3142;
            var temp = r_minor / r_major;
            var es = 1.0 - (temp * temp);
            var eccent = Math.sqrt(es);
            var phi = lat;
            var sinphi = Math.sin(phi);
            var con = eccent * sinphi;
            var com = .5 * eccent;
            con = Math.pow(((1.0-con)/(1.0+con)), com);
            var ts = Math.tan(.5 * ((Math.PI*0.5) - phi))/con;
            var y = 0 - r_major * Math.log(ts);
            return y;
        },
        y_to_lat: function(y) {
            $D.err('y_to_lat is not supported in elliptical mercator')
        }

    }
}
var Viewport = {
    padding: 0,
    bbox: [],
    full_bbox: function() {
        return [[this.bbox[1],this.bbox[0]],[this.bbox[3],this.bbox[0]],[this.bbox[3],this.bbox[2]],[this.bbox[1],this.bbox[2]]]
    },
    width: 0,
    height: 0,
    nearest_corner: function(x,y) {
        var corner = []
            if (Math.abs(Viewport.bbox[1] - x) < Math.abs(Viewport.bbox[3] - x)) {
                corner[0] = Viewport.bbox[1]
                    corner[2] = 0
            } else {
                corner[0] = Viewport.bbox[3]
                    corner[2] = 1
            }
        if (Math.abs(Viewport.bbox[0] - y) < Math.abs(Viewport.bbox[2] - y)) {
            corner[1] = Viewport.bbox[0]
        } else {
            corner[1] = Viewport.bbox[2]
                corner[2] -= 1
                corner[2] *= -1 // swap 1 and 0
                corner[2] += 2
        }
        return corner
    },
    power: function() {
        return window.screen.width/1024
    },
    draw: function() {
        Viewport.width = Glop.width * (1 / Map.zoom) - (2 * Viewport.padding * (1 / Map.zoom))
            Viewport.height = Glop.height * (1 / Map.zoom) - (2 * Viewport.padding * (1 / Map.zoom))
            if (Map.rotate != 0) {
                Viewport.width = Math.sqrt(Math.pow(Math.max(Viewport.width, Viewport.height),2)*2)
                    Viewport.height = Viewport.width
            }
        Viewport.bbox = [Map.y - Viewport.height / 2, Map.x - Viewport.width / 2, Map.y + Viewport.height / 2, Map.x + Viewport.width / 2]
    }
}

var Map = {
    init: function() {
        this.x = Projection.lon_to_x(Config.lng)
            this.y = Projection.lat_to_y(Config.lat)
            Glop.observe('glop:predraw', this.draw.bindAsEventListener(this))
            this.draw()
    },
    draw: function() {
        var lon1 = Projection.x_to_lon(-Map.x - (Viewport.width/2))
            var lon2 = Projection.x_to_lon(-Map.x + (Viewport.width/2))
            var lat1 = Projection.y_to_lat(Map.y - (Viewport.height/2))
            var lat2 = Projection.y_to_lat(Map.y + (Viewport.height/2))
            this.bbox = [lon1, lat2, lon2, lat1]
            this.lon_width = Math.abs(this.bbox[0]-this.bbox[2])
            this.lat_height = Math.abs(this.bbox[1]-this.bbox[3])
            this.lat = Projection.y_to_lat(this.y)
            this.lon = Projection.x_to_lon(-this.x)
            this.resolution = Math.round(Math.abs(Math.log(Map.zoom)))
    },
    pointer_x: function() { return Map.x+(((Glop.width/-2)-Mouse.x+Config.padding_left)/Map.zoom) },
    pointer_y: function() { return Map.y+(((Glop.height/-2)-Mouse.y+Config.padding_top)/Map.zoom) },
    bbox: [],
    x: 0,
    y: 0,
    lat: 0,
    lon: 0,
    rotate: 0,
    rotate_old: 0,
    zoom_old: 0,
    x_old: 0,
    y_old: 0,
    lon_width: 0,
    lat_height: 0,
    resolution: 0,
    last_pos: [0,0],
    zoom: 0.5
}

document.observe('cartagen:init', Map.init.bindAsEventListener(Map))
document.observe('glop:predraw', Map.draw.bindAsEventListener(Map))
var Warper = {
    initialize: function() {
        Glop.observe('cartagen:postdraw', this.draw.bindAsEventListener(this))
            Glop.observe('mousedown',this.mousedown.bindAsEventListener(this))
            Glop.observe('mouseup',this.mouseup.bindAsEventListener(this))
            Glop.observe('dblclick', this.dblclick.bindAsEventListener(this))
    },
    images: [],
    locked: false,
    active_image: false,

    /*
     * Sorts the Warper.images by polygon area; largest polygons at the bottom.
     */
    sort_images: function() {
        Warper.images.sort(Warper.sort_by_area)
    },
    sort_by_area: function(a,b) {
        if ( a.area < b.area ) return 1;
        if ( a.area > b.area ) return -1;
        return 0; // a == b
    },
    sort_by_active: function(a,b) {
        if (a == Warper.active_image) return 1;
        if (b == Warper.active_image) return -1;
    },

    /*
     * Runs every frame upon glop:postdraw, i.e. at the end of the draw cycle.
     * This places warpable images above most other features except labels.
     */
    draw: function() {
        Warper.images.each(function(image){ image.draw() })
    },
    mouseup: function() {
        if (Warper.should_save) Warper.active_image.save_state()
            Warper.should_save = false
    },

    mousedown: function() {
        if (!Warper.locked) {
            Map.x_old = Map.x
                Map.y_old = Map.y
                var inside_image = false, same_image = false
                for (i=Warper.images.length-1;i>=0;i--){
                    var image = Warper.images[i]
                        if (image.is_inside()) {
                            if (!inside_image) {
                                same_image = (Warper.active_image == image)
                                    Warper.active_image = image
                                    image.select()
                                    image.points.each(function(point){point.mousedown()})
                                    inside_image = true
                                    Warper.should_save = true
                            }
                        } else {
                            if (image.active && (image.coordinates() != image.old_coordinates)) {
                                image.save()
                            }
                            if (image.active && !Tool.hover) {
                                image.deselect()
                            }
                        }
                }
            if (Warper.active_image) {
                var point_clicked = false
                    Warper.active_image.points.each(function(point) {
                        if (point.is_inside()) {
                            Warper.active_image.select_point(point)
                        point_clicked = true
                        Warper.should_save = true
                        }
                    })
                if (!point_clicked && Warper.active_image.active_point) {
                    Warper.active_image.active_point.deselect()
                }
            }
            if (inside_image) {
                if (Tool.active != "Mask") {
                    Tool.change('Warp',!same_image)
                        Warper.images.sort(Warper.sort_by_active)
                } else {

                }
            } else if (!Tool.hover && Tool.active == 'Warp') Tool.change('Pan')
        }
    },

    dblclick: function() {
        if (!Warper.locked) {
            for (i=Warper.images.length-1;i>=0;i--){
                var image = Warper.images[i]
                    if (image.is_inside()) {
                        image.dblclick()
                            return
                    }
            }
        }
    },

    flatten: function() {
        new Ajax.Request('/warper/warp', {
            method: 'get',
        parameters: {
            images: Warper.images,
        },
        onSuccess: function(response) {
        }
        });
    },

    new_image: function(url,id,natural_size) {
        if (!natural_size) {
            Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
                            [Map.x-100/Map.zoom, Map.y],
                            [Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y],
                            [Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()],
                            [Map.x-100/Map.zoom, Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()]
                            ]),url,id,natural_size))
        } else {
            Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
                            [Map.x-100, Map.y+100],
                            [Map.x+100, Map.y+100],
                            [Map.x+100, Map.y-100],
                            [Map.x-100, Map.y-100]
                            ]),url,id,natural_size))
        }
        Knitter.new_image = Warper.images.last()
            Knitter.new_image.highlight_for(5)
    },


    new_image_GPS: function(url,id,GPS, act_height , act_width) {

        var Latitude;
        var Longitude;
        var Angle = 0;
        var Altitude;
        var x,y;// The map coordinates corresponding to the latitude and longitude
        var pixel_ratio;
        var Altitude_to_zoom;

        var Img_height = 375, Img_width=500;// Set to the :medium image size delivered from the warper.


        //The angle to rotate the image in.
        if(GPS["GPSImgDirectionRef"] == "T") // "T" refers to "True north", so -90.
            Angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90) ;
        else if(GPS["GPSImgDirectionRef"] == "M") // "M" refers to "Magnetic north", there might be a marginal difference not sure how much.
            Angle = (Math.PI / 180) * (GPS.GPSImgDirection["numerator"]/GPS.GPSImgDirection["denominator"] - 90) ;
        else
            console.log("No angle found");

        //calculate the altitude of the image
        if(typeof GPS.GPSAltitude !== 'undefined' && typeof GPS.GPSAltitudeRef !== 'undefined' && typeof act_height!== 'undefined' && typeof act_width !== 'undefined'){
            Altitude = (GPS.GPSAltitude["numerator"]/GPS.GPSAltitude["denominator"]+GPS.GPSAltitudeRef) / 10;
            // Convert altitude to zoom, for large altitude it is not a possible conversion as at any altitude it 
            // is not possible for a camera to see a complete view of earth
            // For small altitudes the following will work fine. It is still experimental and needs testing. 
            // For correction based on altitude we need the original dimensions of the image. 

            //Some GPS data shows altitude as zero even though it is not, we need to account for errors or we will have infinity zoom.
            if(Altitude >0)
                Altitude_to_zoom = ( (act_height/Img_height) * (act_width/Img_width) ) / Altitude;           
            else
                Altitude_to_zoom = Map.zoom * 1.3;

            pixel_ratio = 2 * Altitude_to_zoom;
            console.log("Zoom for image"+(Altitude_to_zoom))
        }
        else{
            pixel_ratio = 2 * (Map.zoom * 1.3);
            console.log("Cannot use altitude data");
            console.log("Zoom"+Map.zoom*1.3)
        }

        //If the lat/long is available.
        if(typeof GPS["GPSLatitude"] !== 'undefined' && typeof GPS["GPSLongitude"] !== 'undefined'){
            Latitude = (GPS["GPSLatitude"][0]) + (GPS["GPSLatitude"][1]/60) + (GPS["GPSLatitude"][2]/3600);
            Longitude = (GPS["GPSLongitude"][0]) + (GPS["GPSLongitude"][1]/60) + (GPS["GPSLongitude"][2]/3600);
            x = Projection.lon_to_x(Longitude);
            y = Projection.lat_to_y(Latitude);
        }
        //If for some reason the lat/long is not available.
        else{
            x = Map.x;
            y = Map.y;
        }


        // Calculate the distance to move on map, Mapknitter uses Map.zoom = Zoom / 1.3.
        var hh=(Img_height / 2) / pixel_ratio, wh=(Img_width / 2) / pixel_ratio; 
        var points = Array(4);
        var Cos = Math.cos(Angle);
        var Sin = Math.sin(Angle);

        //Position and rotate the image mathematically.
        points[0]= [ Cos * (-1*wh) - Sin * (-1*hh) + x, Sin * (-1*wh ) + Cos * (-1*hh) + y ];
        points[1]= [ Cos * (wh)    - Sin * (-1*hh) + x, Sin * (wh)     + Cos * (-1*hh) + y ];
        points[2]= [ Cos * (wh)    - Sin * (hh   ) + x, Sin * (wh)     + Cos * (hh)    + y ];
        points[3]= [ Cos * (-1*wh) - Sin * (hh   ) + x, Sin * (-1*wh)  + Cos * (hh)    + y ];

        console.log("Placing Image "+id+" at Lat:"+Latitude+", Long"+Longitude);
        console.log("Using Image direction: "+Angle);
        console.log("Using image altitude:  "+Altitude);


        // We need to map the center of the image with GPS lat, lon.
        Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
                        [ points[0][0] , points[0][1] ],
                        [ points[1][0] , points[1][1] ],       
                        [ points[2][0] , points[2][1] ],        
                        [ points[3][0] , points[3][1] ]        
                        ]),url,id,false))

            Knitter.new_image = Warper.images.last()
            Knitter.new_image.highlight_for(5)

    },

    load_image: function(url,points,id,locked) {
        points[0][0] = Projection.lon_to_x(points[0][0])
            points[0][1] = Projection.lat_to_y(points[0][1])
            points[1][0] = Projection.lon_to_x(points[1][0])
            points[1][1] = Projection.lat_to_y(points[1][1])
            points[2][0] = Projection.lon_to_x(points[2][0])
            points[2][1] = Projection.lat_to_y(points[2][1])
            points[3][0] = Projection.lon_to_x(points[3][0])
            points[3][1] = Projection.lat_to_y(points[3][1])
            Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
                            [points[0][0],points[0][1]],
                            [points[1][0],points[1][1]],
                            [points[2][0],points[2][1]],
                            [points[3][0],points[3][1]]
                            ]),url,id))
            Warper.images.last().locked = locked
    },

    p: function(point) {
        if (point.x == undefined) {
            x = point[0]
                y = point[1]
        } else {
            x = point.x
                y = point.y
        }
        return '(' + x + ', ' + y + ')'
    },

    get_image_by_id: function(id) {
        var match
            Warper.images.each(function(image){
                if (image.id == id) match = image
            })
        return match
    },

    getProjectiveTransform: function(points) {
        var eqMatrix = new Matrix(9, 8, [
                [ 1, 1, 1,   0, 0, 0, -points[2].x,-points[2].x,-points[2].x ],
                [ 0, 1, 1,   0, 0, 0,  0,-points[3].x,-points[3].x ],
                [ 1, 0, 1,   0, 0, 0, -points[1].x, 0,-points[1].x ],
                [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0].x ],

                [ 0, 0, 0,  -1,-1,-1,  points[2].y, points[2].y, points[2].y ],
                [ 0, 0, 0,   0,-1,-1,  0, points[3].y, points[3].y ],
                [ 0, 0, 0,  -1, 0,-1,  points[1].y, 0, points[1].y ],
                [ 0, 0, 0,   0, 0,-1,  0, 0, points[0].y ]

                ]);

        var kernel = eqMatrix.rowEchelon().values;
        var transform = new Matrix(3, 3, [
                [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
                [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
                [-kernel[6][8], -kernel[7][8],             1]
                ]);
        return transform;
    },

    keyup: function(e) {
        var character = e.keyIdentifier, bump = 10 // amount in pixels to move with arrow keys
            switch(character) {
                case 'Left': if (!e.shiftKey) Warper.active_image.move_x(-bump/Map.zoom); else Map.rotate += 0.1; break
                case 'Right': if (!e.shiftKey) Warper.active_image.move_x(bump/Map.zoom); else Map.rotate -= 0.1; break
                case 'Up': Warper.active_image.move_y(-bump/Map.zoom); break
                case 'Down': Warper.active_image.move_y(bump/Map.zoom); break
            }
        e.preventDefault()
    },
}
document.observe('cartagen:init',Warper.initialize.bindAsEventListener(Warper))
Warper.ControlPoint = Class.create({
    type: 'Warper.ControlPoint',
initialize: function(x,y,r,parent) {
    this.x = x
    this.y = y
    this.r = r
    this.rel_r = this.r / Map.zoom
    this.parent_shape = parent
    this.active = false
    this.dragging = false
},
draw: function() {
    this.style()
    $C.save()
    $C.canvas.lineWidth = 3/Map.zoom
    $C.translate(this.x,this.y)
    $C.fill_style(this.color)
    $C.opacity(0.6)
    if (this.parent_shape.locked) {
        $C.begin_path()
    $C.move_to(-6/Map.zoom,-6/Map.zoom)
    $C.line_to(6/Map.zoom,6/Map.zoom)
    $C.move_to(-6/Map.zoom,6/Map.zoom)
    $C.line_to(6/Map.zoom,-6/Map.zoom)
    $C.stroke()
    } else {
        if (Tool.Warp.mode == "rotate") $C.stroke_style("red")
            if (this.is_inside()) $C.circ(0, 0, this.rel_r)
                $C.stroke_circ(0, 0, this.rel_r)
    }
$C.restore()
},
    select: function() {
        this.active = true
            this.parent_shape.active_point = this
    },
    deselect: function() {
        this.active = false
            this.parent_shape.active_point = false
    },
    style: function() {
        if (this.dragging) {
            this.color = '#f00'
        } else {
            this.color = '#200'
        }
    },
    update: function() {
        this.rel_r = this.r / Map.zoom
            if (this.parent_shape.active_point == this) {
                this.drag()
            }
    },
    base: function() {
        this.color = '#200'
            this.dragging = false
    },
    is_inside: function() {
        return (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < (this.r/Map.zoom))
    },
    mousedown: function() {
        if (!this.parent_shape.locked && this.is_inside()) {
            this.cancel_drag()
                this.color = '#f00'
                this.parent_shape.active_point = this
                this.parent_shape.old_coordinates = this.parent_shape.coordinates()
                if (Tool.Warp.mode == 'rotate') {
                    with (Math) {
                        this.self_distance = sqrt(pow(this.parent_shape.centroid[1]-Map.pointer_y(),2)+pow(this.parent_shape.centroid[0]-Map.pointer_x(),2))
                    }
                    this.self_angle = Math.atan2(this.parent_shape.centroid[1]-Map.pointer_y(),this.parent_shape.centroid[0]-Map.pointer_x())
                        this.parent_shape.points.each(function(point) {
                            point.angle = Math.atan2(point.y-this.parent_shape.centroid[1],point.x-this.parent_shape.centroid[0])
                            point.distance = (point.x-this.parent_shape.centroid[0])/Math.cos(point.angle)
                        },this)
                }
        }
    },
    drag: function(translating_whole_image) {
        if (!this.parent_shape.locked) {
            if (translating_whole_image || Tool.Warp.mode == 'default') {
                if (!this.dragging) {
                    this.dragging = true
                        this.drag_offset_x = Map.pointer_x() - this.x
                        this.drag_offset_y = Map.pointer_y() - this.y
                        if (Object.isUndefined(translating_whole_image)) $C.cursor('crosshair')
                }
                if (this.drag_offset_x) {
                    this.x = Map.pointer_x() - this.drag_offset_x
                        this.y = Map.pointer_y() - this.drag_offset_y
                }
            }

            if (Tool.Warp.mode == 'rotate' && Object.isUndefined(translating_whole_image)) {
                this.dragging = false
                    var distance = Math.sqrt(Math.pow(this.parent_shape.centroid[1]-Map.pointer_y(),2)+Math.pow(this.parent_shape.centroid[0]-Map.pointer_x(),2))
                    var distance_change = distance - this.self_distance
                    var angle = Math.atan2(this.parent_shape.centroid[1]-Map.pointer_y(),this.parent_shape.centroid[0]-Map.pointer_x())
                    var angle_change = angle-this.self_angle

                    if (Keyboard.shift) angle_change = 0
                        this.parent_shape.points.each(function(point) {
                            point.x = this.parent_shape.centroid[0]+Math.cos(point.angle+angle_change)*(point.distance+distance_change)
                            point.y = this.parent_shape.centroid[1]+Math.sin(point.angle+angle_change)*(point.distance+distance_change)
                        },this)
            }
        }
    },
    cancel_drag: function() {
        this.dragging = false
            this.drag_offset_x = false
            this.drag_offset_y = false
            this.parent_shape.active_point = false
            this.parent_shape.reset_centroid()
    }
})
Warper.Image = Class.create(
        {
            type: 'Warper.Image',
    initialize: function(nodes,image,id,natural_size) {
        this.id = id
    this.opacity_low = 0.5
    this.opacity_high = 1.0
    this.opacity = this.opacity_high
    this.locked = false
    this.outline = false
    this.highlight = false
    this.highlight_start = 0
    this.highlight_length = 0
    this.start_timestamp = Date.now()
    this.age = 0

    this.subdivision_limit = 5
    this.offset_x = 0
    this.offset_y = 0

    this.active = false
    this.mask = false
    this.active_point = false
    this.dragging = false
    this.points = $A()
    this.old_coordinates = []
    this.diddit = false

    this.history = []

    nodes.each(function(node) {
        this.points.push(new Warper.ControlPoint(node[0], node[1], 10, this))
    }, this)

this.reset_centroid()
    this.area = Geometry.poly_area(this.points)

    this.image = new Image()
    this.image.src = image
    this.natural_size = natural_size
    this.waiting_for_natural_size = natural_size | false
    },
    toggle_outline: function() {
        this.outline = !this.outline
            $('tool_warp_outline').toggleClassName('down')
    },
    patch_size: function() {
        return 100/Map.zoom
    },
    highlight_for: function(seconds) {
        var ms = seconds*1000
            this.highlight = true
            this.highlight_start = Date.now()
            this.highlight_length = ms
    },

    delete_mask: function() {
        this.mask = false
    },

    draw: function() {
        this.age = Date.now() - this.start_timestamp
            if (this.highlight && (this.highlight_start + this.highlight_length - Date.now() < 0)) {
                this.highlight = false
            }

        if (this.waiting_for_natural_size) {
            this.set_to_natural_size()
        }

        $C.save()
            if (this.mask && this.mask.points && this.mask.points.length > 2) {
                $C.begin_path()
                    $C.move_to(this.mask.points[0].x, this.mask.points[0].y)
                    this.mask.points.each(function(point) {
                        $C.line_to(point.x, point.y)
                    })
                $C.line_to(this.mask.points[0].x, this.mask.points[0].y)
                    $C.canvas.closePath();
                if (this.mask.enabled) $C.canvas.clip()
                else $C.stroke()
            }

        $C.opacity(this.opacity)
            if (!this.outline) this.update()

                $C.restore()
                    $C.opacity(1)
                    $C.save()
                    $C.fill_style('#222')
                    $C.begin_path()
                    $C.move_to(this.points[0].x, this.points[0].y)
                    this.points.each(function(point) {
                        $C.line_to(point.x, point.y)
                    })
        $C.line_to(this.points[0].x, this.points[0].y)

            $C.opacity(0.1)
            if (this.active) $C.opacity(0.2)

                $C.opacity(1)
                    $C.stroke_style('#d00')
                    $C.line_width(1)
                    if (this.outline) $C.stroke()
                        $C.stroke_style('#AED11C')
                            $C.line_width(20/Map.zoom)
                            if (this.highlight && (this.highlight_start + this.highlight_length - Date.now() > 0)) {
                                $C.opacity(1-(Date.now()-this.highlight_start)/(0.01+this.highlight_length))
                            }
        if (this.highlight) $C.stroke()
            $C.opacity(0.1)

                $C.stroke_style('#000')
                if (this.active) {
                    $C.fill()
                        $C.line_width(2)
                        this.points.each(function(point) {
                            point.draw()
                        })
                }

        $C.restore()

    },
    move_x: function(px) {
        this.points.each(function(point){
            point.x += px
        },this)
    },
    move_y: function(px) {
        this.points.each(function(point){
            point.y += px
        },this)
    },

    set_to_natural_size: function() {
        this.opacity = 1.0
            this.outline = false
            if (this.image.width) {
                this.points[1].x = this.points[0].x
                    this.points[1].y = this.points[0].y
                    this.points[2].x = this.points[0].x
                    this.points[2].y = this.points[0].y
                    this.points[3].x = this.points[0].x
                    this.points[3].y = this.points[0].y

                    this.points[1].x += this.image.width/(Map.zoom*2)
                    this.points[2].x += this.image.width/(Map.zoom*2)
                    this.points[2].y += this.image.height/(Map.zoom*2)
                    this.points[3].y += this.image.height/(Map.zoom*2)
                    this.reset_centroid()
                    this.area = Geometry.poly_area(this.points)
                    this.waiting_for_natural_size = false
            }
    },
    select: function() {
        this.active = true
            Events.arrow_keys_enabled = false
            Event.observe(document, 'keyup', Warper.keyup) // custom keyup handler
            Glop.trigger_draw()
    },
    deselect: function() {
        this.active = false
            this.active_point = false
            Events.arrow_keys_enabled = true
            Event.stopObserving(document, 'keyup', Warper.keyup) // custom keyup handler
            Knitter.update_map_to_center()
    },

    select_point: function(point) {
        if (this.active_point) { this.active_point.deselect() }
        point.select()
    },
    is_inside: function() {
        return (this.is_in_point() || Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y()))
    },
    is_in_point: function() {
        var inside_point = false
            this.points.each(function(point) {
                if (point.is_inside()) inside_point = true
            })
        return inside_point
    },

    drag: function() {
        if (!this.locked) {
            if (!this.dragging) {
                this.dragging = true
            }
            if (!this.active_point) {
                this.points.each(function(point) {
                    point.drag(true)
                })
                if (this.mask && this.mask.points) {
                    this.mask.points.each(function(point) {
                        point.drag(true)
                    })
                }
                $C.cursor('move')
            }
        } else {
            Tool.Pan.drag()
        }
    },
    cancel_drag: function() {
        $C.cursor('auto')
            this.dragging = false
            this.points.each(function(point) {
                point.dragging = false
            })
    },
    save_state: function() {
        if (this.history.last() != this.serialize_points()) this.history.push(this.serialize_points())
    },
    undo: function() {
        if (this.history.last() == this.serialize_points()) this.history.pop()
            if (this.history.length > 0) this.import_points(this.history.pop())
    },
    import_points: function(saved) {
        saved = saved.evalJSON()
            this.points.each(function(point,index) {
                point.x = saved[index][0]
                point.y = saved[index][1]
            })
    },
    serialize_points: function() {
        var prejson = []
            this.points.each(function(point){
                prejson.push([point.x,point.y])
            })
        return prejson.toJSON()
    },
    dblclick: function() {
        if (Tool.active != "Mask") {
            if (this.opacity == this.opacity_low) this.opacity = this.opacity_high
            else this.opacity = this.opacity_low
                $('tool_warp_transparent').toggleClassName('down')
        }
    },
    coordinates: function() {
        coordinates = []
            this.points.each(function(point) {
                var lon = Projection.x_to_lon(-point.x)
                var lat = Projection.y_to_lat(point.y)
                coordinates.push([lon,lat])
            })
        return coordinates
    },
    save: function() {
        var coordinate_string = '', first = true, mask_coordinate_string = ''
            this.coordinates().each(function(coord){
                if (first) first = false
                else coordinate_string += ':'
                coordinate_string += coord[0]+','+coord[1]
            })
        first = true
            if (this.mask) {
                this.mask.coordinates().each(function(coord){
                    if (first) first = false
                    else mask_coordinate_string += ':'
                    mask_coordinate_string += coord[0]+','+coord[1]
                })
            }
        new Ajax.Request('/warper/update', {
            method: 'post',
        parameters: { 'warpable_id': this.id,'points': coordinate_string, 'locked': this.locked, 'mask': mask_coordinate_string },
        onSuccess: function(response) {
            $l('updated warper points')
        }
        })
        this.reset_centroid()
            this.area = Geometry.poly_area(this.points)
            Warper.sort_images()
    },
    reset_centroid: function() {
        this.centroid = Geometry.poly_centroid(this.points)
            this.centroid[0] *= 2
            this.centroid[1] *= 2
    },
    cleanup: function() {
        Glop.stopObserving('dblclick', this.dblclick_handler)
    },
    update: function() {
        this.points.each(function(point) {
            point.update()
        })

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.points.each(function(point) {
            minX = Math.min(minX, Math.floor(point.x));
            maxX = Math.max(maxX, Math.ceil(point.x));
            minY = Math.min(minY, Math.floor(point.y));
            maxY = Math.max(maxY, Math.ceil(point.y));
        })


        minX--; minY--; maxX++; maxY++;
        var width = maxX - minX;
        var height = maxY - minY;

        iw = this.image.width;
        ih = this.image.height;


        transform = Warper.getProjectiveTransform(this.points);

        var ptl = transform.transformProjectiveVector([0, 0, 1]);
        var ptr = transform.transformProjectiveVector([1, 0, 1]);
        var pbl = transform.transformProjectiveVector([0, 1, 1]);
        var pbr = transform.transformProjectiveVector([1, 1, 1]);

        $C.canvas.save();
        $C.canvas.beginPath();
        $C.canvas.moveTo(ptl[0], ptl[1]);
        $C.canvas.lineTo(ptr[0], ptr[1]);
        $C.canvas.lineTo(pbr[0], pbr[1]);
        $C.canvas.lineTo(pbl[0], pbl[1]);
        $C.canvas.closePath();
        $C.canvas.clip();

        this.divide(0, 0, 1, 1, ptl, ptr, pbl, pbr, this.subdivision_limit);
        $C.canvas.restore()

    },

    divide: function(u1, v1, u4, v4, p1, p2, p3, p4, limit) {
        if (limit) {
            var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
            var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
            var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
            var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

            d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
            d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
            var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

            if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.patch_size() * this.patch_size()))) {
                var umid = (u1 + u4) / 2;
                var vmid = (v1 + v4) / 2;
                var pmid = transform.transformProjectiveVector([umid, vmid, 1]);
                var pt = transform.transformProjectiveVector([umid, v1, 1]);
                var pb = transform.transformProjectiveVector([umid, v4, 1]);
                var pl = transform.transformProjectiveVector([u1, vmid, 1]);
                var pr = transform.transformProjectiveVector([u4, vmid, 1]);

                limit--;
                this.divide(u1, v1, umid, vmid, p1, pt, pl, pmid, limit);
                this.divide(umid, v1, u4, vmid, pt, p2, pmid, pr, limit);
                this.divide(u1, vmid, umid, v4, pl, pmid, p3, pb, limit);
                this.divide(umid, vmid, u4, v4, pmid, pr, pb, p4, limit);


                return;
            }
        }

        $C.canvas.save();

        $C.canvas.beginPath();
        $C.canvas.moveTo(p1[0], p1[1]);
        $C.canvas.lineTo(p2[0], p2[1]);
        $C.canvas.lineTo(p4[0], p4[1]);
        $C.canvas.lineTo(p3[0], p3[1]);
        $C.canvas.closePath();

        var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
        var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
        var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
        var d31 = [p1[0] - p3[0], p1[1] - p3[1]];

        var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
        var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
        var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
        var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
        var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
        var dx = 0, dy = 0, padx = 0, pady = 0;

        switch (amax) {
            case a1:
                $C.canvas.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
                if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
                break;
            case a2:
                $C.canvas.transform(d12[0], d12[1],  d24[0],  d24[1], p2[0], p2[1]);
                if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
                dx = -1;
                break;
            case a4:
                $C.canvas.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
                if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
                dx = -1;
                dy = -1;
                break;
            case a3:
                $C.canvas.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
                if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
                if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
                dy = -1;
                break;
        }

        var du = (u4 - u1);
        var dv = (v4 - v1);
        var padu = padx * du;
        var padv = pady * dv;


        $l($H({
            'dx, dy': Warper.p([dx, dy]),
            'px, py': Warper.p([padx, pady])
        }))

        if (this.image.width) {
            $C.canvas.drawImage(
                    this.image,
                    u1 * iw,
                    v1 * ih,
                    Math.min(u4 - u1 + padu, 1) * iw,
                    Math.min(v4 - v1 + padv, 1) * ih,
                    dx, dy,
                    1 + padx, 1 + pady
                    );
        }

        $C.canvas.restore();
    }
        }
)
