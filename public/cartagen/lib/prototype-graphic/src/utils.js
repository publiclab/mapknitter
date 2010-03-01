// Emulate console.log for browser that does not have a console object (IE for example!)
function debug(msg) {
	var debugArea = $('debug-area')
	if(debugArea == null) {
		debugArea = document.createElement("div");
		debugArea.id = "debug-area";
		debugArea.style.top = "0px"
		debugArea.style.right = "0px"
		debugArea.style.width = "200px"
		debugArea.style.height = "800px"
		debugArea.style.position = "absolute"
		debugArea.style.border = "1px solid #000"
		debugArea.style.overflow = "auto"
		debugArea.style.background = "#FFF"
		debugArea.style.zIndex= 100000;
		document.body.appendChild(debugArea);
	}
	debugArea.innerHTML = msg + "<br/>" + debugArea.innerHTML;  
}

if (typeof console == "undefined") {
  console = function() {  
    return {
      log: function(msg) {
        debug(msg);
      }
    }
 }();
}


// Get WebKit version
if (Prototype.Browser.WebKit) {
  var array = navigator.userAgent.match(new RegExp(/AppleWebKit\/([\d\.\+]*)/));
  Prototype.Browser.WebKitVersion = parseFloat(array[1]);
}

// Convert degree to radian    
function degToRad(value) {
  return value / 180 * Math.PI;     
}       

function radToDeg(value) {
  return value / Math.PI * 180;
}       
                        

function computeAngle(x1, y1, x2, y2, radian) {
  var dx = x2 - x1;
  var dy = y1 - y2;   
  if (radian)
    var angle = dx != 0 ? Math.atan(dy / dx) : -Math.PI/2; 
  else
    var angle = dx != 0 ? radToDeg(Math.atan(dy / dx)) : 90;

  if (dx < 0 && dy < 0)
    angle = angle - (radian ? Math.PI : 180);
  if (dx < 0 && dy > 0)
    angle = (radian ? Math.PI : 180) + angle;

  return angle
}

// Disable browser selection
function disableSelection() {
  document.body.ondrag = function () { return false; };
  document.body.onselectstart = function () { return false; };
}                                                             

// Enable browser selection
function enableSelection() {
  document.body.ondrag = null;
  document.body.onselectstart = null;  
}
      
// From effect.js
String.prototype.parseColor = function() {  
  var color = '#';
  if(this.slice(0,4) == 'rgb(') {  
    var cols = this.slice(4,this.length-1).split(',');  
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);  
  } else {  
    if(this.slice(0,1) == '#') {  
      if(this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();  
      if(this.length==7) color = this.toLowerCase();  
    }  
  }  
  return(color.length==7 ? color : (arguments[0] || this));  
}        

// From dragdrop.js
function getWindowScroll(w) {
  var T, L, W, H;
  with (w.document) {
    if (w.document.documentElement && documentElement.scrollTop) {
      T = documentElement.scrollTop;
      L = documentElement.scrollLeft;
    } else if (w.document.body) {
      T = body.scrollTop;
      L = body.scrollLeft;
    }
    if (w.innerWidth) {
      W = w.innerWidth;
      H = w.innerHeight;
    } else if (w.document.documentElement && documentElement.clientWidth) {
      W = documentElement.clientWidth;
      H = documentElement.clientHeight;
    } else {
      W = body.offsetWidth;
      H = body.offsetHeight
    }
  }
  return { top: T, left: L, width: W, height: H };
}


function pickPoly(points, x, y) {
  var nbPt = points.length;
  var c = false;
  for (var i = 0, j = nbPt - 1; i < nbPt; j = i++) {
      if ((((points[i].y <= y) && (y < points[j].y)) ||
           ((points[j].y <= y) && (y < points[i].y))) &&
          (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x))   {
        c = !c;
        console.log(i, c)
      }
  }                                                                                                             
  
  return c;
}      


  // C pick function
  // int pnpoly(int npol, float *xp, float *yp, float x, float y)
  // {
  //   int i, j, c = 0;
  //   for (i = 0, j = npol-1; i < npol; j = i++) {
  //     if ((((yp[i] <= y) && (y < yp[j])) ||
  //          ((yp[j] <= y) && (y < yp[i]))) &&
  //         (x < (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i]))
  //       c = !c;
  //   }
  //   return c;
  // }


