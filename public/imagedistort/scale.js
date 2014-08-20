// Toggles to show/hide the slider which scales the image
// Image id should be passed as argument to scale function

var state2=true;
var c2=1;
function scale(imgid){

	var box = document.getElementById(imgid);
	var rangevalueZ = document.getElementById("rangevalueZ2");
	var sliderZ = document.getElementById('sliderZ2');
	
	sliderZ.onchange = function(){
	if (c2==1){
	    box.style.transform = box.style.transform + " scale(" + (sliderZ.value)/100 + ')';
	    rangevalueZ.value = sliderZ.value/100;
	    c2=2;
	    }
	    else
	    {
	    	 var str=box.style.transform;
	    	 var s1=str.indexOf('scale');
		 var s2=str.indexOf(')',s1);
		 var s3=str.substring(s1,s2+1);
		 var s4=str.replace(s3,"scale(" + (sliderZ.value)/100 + ')');
		 box.style.transform=s4;
		 rangevalueZ.value = sliderZ.value/100;
		 
	    }
		   
	 };
	
	
}
