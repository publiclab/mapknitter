// Toggles to show/hide the slider which rotates the image
// Image id should be passed as argument to rotate function

	var state=true;
	var c=1;

function rotate(imgid){

	var box = document.getElementById(imgid);
	// Roatate Z Variables
	var sliderZ = document.getElementById("sliderZ1");
	var rangevalueZ = document.getElementById("rangevalueZ1");
	
	sliderZ.onchange = function(){
	    if (c==1){
	    if (rangevalueZ <'50') {
	    box.style.transform = box.style.transform + " rotateZ(-" + (sliderZ.value) + 'deg)';
	    rangevalueZ.value = sliderZ.value + "deg";
	    }
	    else if (rangevalueZ >'50') {
	    box.style.transform = box.style.transform + " rotateZ(" + (sliderZ.value) + 'deg)';
	    rangevalueZ.value = sliderZ.value + "deg";
	    }
	    c=2;
	    }
	    else
	    {
	    	 var str=box.style.transform;
	    	 var s1=str.indexOf('rotateZ');
		 var s2=str.indexOf(')',s1);
		 var s3=str.substring(s1,s2+1);
		 if (rangevalueZ <'50') {
		 var s4=str.replace(s3,"rotateZ(-" + (sliderZ.value) + 'deg)');
		 box.style.transform=s4;
		 rangevalueZ.value = sliderZ.value + "deg";
		 }
		 else if(rangevalueZ >'50'){
		 var s4=str.replace(s3,"rotateZ(" + (sliderZ.value) + 'deg)');
		 box.style.transform=s4;
		 rangevalueZ.value = sliderZ.value + "deg";
		 }
	    }
	    
	};

}
