
function in_range(v,r1,r2) {
	return (v > Math.min(r1,r2) && v < Math.max(r1,r2))
}


// add Object.value, which returns the argument, unless the argument is a function,
// in which case it calls the function and returns the result
Object.value = function(obj) {
    if(Object.isFunction(obj)) return obj()
    return obj
}

Number.prototype.to_precision = function(prec){
	return (this * (1/prec)).round()/(1/prec)
}

// http://phpjs.org/functions/strstr
// Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// MIT License (http://www.opensource.org/licenses/mit-license.php)
function strstr( haystack, needle, bool ) {
    var pos = 0;

    haystack += '';
    pos = haystack.indexOf( needle );
    if (pos == -1) {
        return false;
    } else{
        if( bool ){
            return haystack.substr( 0, pos );
        } else{
            return haystack.slice( pos );
        }
    }
}

// Rotates view slowly for cool demo purposes.
function demo() { try { Map.rotate += 0.005 } catch(e) {}}