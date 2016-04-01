document.addEventListener("menubutton", popMenu, false);
document.addEventListener("backbutton", onBack, false);

document.getElementById('username').addEventListener("keydown", function(e){
		if(e.keyCode == 13 && !e.shiftKey){
			e.preventDefault();
			startLogin();
			return false;
		}
	}
, false);