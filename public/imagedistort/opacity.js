// Toggles image opacity
// The image object should be passed as argument with variable name being newimg

	var clicked=false;
			function changeopacity(){
			    clicked = !clicked;
			    if(clicked)
			    {
				   newimg.setOpacity(0.7);
			    }
			    else
			    {
				   newimg.setOpacity(1);
			    }
			};
