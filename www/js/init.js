document.id = 'mainDocument';

gui.init();

document.addEventListener("menubutton", gui.popMainMenu, false);
document.addEventListener("backbutton", closeCurrentMenu, false);

document.getElementById('username').addEventListener("keydown", function(e){
		if(e.keyCode == 13 && !e.shiftKey){
			e.preventDefault();
			startLogin();
			return false;
		}
	}
, false);

// chat line click handler //
touchControl.bindEvent(window, 'touchend', function(event){
	if(touchControl.isScrolling){
		touchControl.isScrolling = false;
		return;
	}else if(touchControl.handleGlobal){
		touchControl.handleGlobal = false;
		return;
	}
	
	var currentNode = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
	var notFound = true;
	while(notFound){
		if(typeof currentNode === 'undefined' || currentNode == null) break;
		
		if(typeof currentNode.getAttribute !== 'undefined' && currentNode.getAttribute('class') != null && currentNode.getAttribute('class').split(' ')[0] == 'chatLine'){
			notFound = false;
			gui.popLineMenu(currentNode);
			break;
		}
		
		currentNode = currentNode.parentNode;
	}
});

