/**
 * @overview   This is supports of scripts for the mad template.
 * @version    1.01
 * @updated    2007/09/27
 * @author     inamorix <a href="mailto:inamorix@metatype.jp">&lt;inamorix@metatype.jp&gt;</a>
 * @copyright  Copyright (c) 2007, <a href="http://metatype.jp/">metatype</a>.
 * @license    The MIT-style license.
 */



/**
 * @ignore
 */
(function () {
	var d  = document;
	var fn = function () {
		if (d.getElementById('nav')) {
			var file  = location.href.match(/([^\/]+)$/)[1].match(/^([\d]+_[\w]+\.html)/)[1];
			    file  = file.replace(/src\.html/, 'file.html');
			var files = d.getElementById('nav').getElementsByTagName('h2');
			for (var i = 0, ix = files.length; i < ix; i++) {
				var a = files[i].getElementsByTagName('a');
				if (a[0].href.indexOf(file) >= 0) {
					var div = a[0].parentNode.parentNode.parentNode;
					div.className = 'open focus';
				}
				
				if (a[1]) {
					a[1].onclick = function () {
						var div       = this.parentNode.parentNode.parentNode;
						var is_open   = /open/.test(div.className);
						var is_focus  = /focus/.test(div.className);
						div.className = (is_open  ? 'close'  : 'open')
						              + (is_focus ? ' focus' : '');
						
						return false;
					}
				}
			}
		}
	};
	
	if (/safari/i.test(navigator.userAgent)) {
		var onreadystatechange = function () {
			if (/loaded|complete/.test(d.readyState)) {
				clearInterval(timer);
				fn();
			}
		}
		var timer = setInterval(onreadystatechange, 50);
	}
	else if (d.all && !window.opera) {
		var src = (location.protocol == 'https:') ? '://0' : 'javascript:void(0)';
		d.write('<script src="' + src + '" defer="defer" id="__tmp__"></script>');
		d.getElementById('__tmp__').onreadystatechange = function(){
			if (this.readyState == 'complete') {
				this.parentNode.removeChild(this);
				fn();
			}
		};
	}
	else {
		d.addEventListener('DOMContentLoaded', fn, false);
	}
})();