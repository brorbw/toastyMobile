document.id = 'mainDocument';

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

/* chat line click handler */
touchControl.bindEvent(window, 'touchend', function(event){
	if(touchControl.isScrolling){
		touchControl.isScrolling = false;
		return;
	}
	
	var touchedNode = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY).parentNode;
	
	if(touchedNode.getAttribute('class') != null && touchedNode.getAttribute('class').split(' ')[0] == 'chatLine'){
		//console.log(touchedNode.childNodes);
	}
});