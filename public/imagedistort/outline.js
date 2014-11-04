// Toggles image outline
// The image object should be passed as argument to outline function with variable name being newimg
	
	var clicked=false;
	
			function outline(){
			    clicked = !clicked;
			    if(clicked)
			    {
				   newimg.setOpacity(0.2);
				   $('#img1').css('border','2px solid black');
			    }
			    else
			    {
				   newimg.setOpacity(1);;
				   $('#img1').css('border', '');
			    }
			};
