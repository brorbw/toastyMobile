var gui = {
	chatInput: '',
	
	init: function(channel, div){
		this.chatInput = document.createElement('textarea');
		this.chatInput.setAttribute('id', 'chatInput');

		this.chatInput.addEventListener("keydown", function(e){
				if(e.keyCode == 13 && !e.shiftKey){
					e.preventDefault();
					chatRoomSockets[currentChannel].say(this.value);
					this.value = '';
					document.activeElement.blur();
					return false;
				}
			} , false);
	},
	
	genDom: function(type, id, className, innerHtml, attribArray, bindArray){
		id = id !== '' ? id : this.makeID();
		innerHtml = typeof innerHtml !== 'undefined' ? innerHtml : '';
		attribArray = typeof attribArray !== 'undefined' ? attribArray : [];
		bindArray = typeof bindArray !== 'undefined' ? bindArray : [];
		
		var returnDom = document.createElement(type);
		returnDom.setAttribute('id', id);
		returnDom.setAttribute('class', className);
		returnDom.innerHTML = innerHtml;
		
		attribArray.forEach(function(att){
			returnDom.setAttribute(att.name, att.value);
		});
		
		bindArray.forEach(function(event){
			touchControl.bindEvent(returnDom, event.eventName, event.func);
		});
		
		return returnDom;
	},
	
	makeID: function(){
		var returnID = "";
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for(var i = 0; i < 7; i++) returnID += chars.charAt(Math.floor(Math.random() * chars.length));

		return returnID;
	},
	
	openGates: function(){
		document.getElementById('login').style.transform = 'translate3d(0, -300%, 0)';
	
		setTimeout(function(){
			document.getElementById('rightGate').style.transform = 'translate3d(75%, 0, 0)';
			document.getElementById('leftGate').style.transform = 'translate3d(-75%, 0, 0)';
		}, 300);
		
		setTimeout(function(){
			document.body.removeChild(document.getElementById('login'));
			document.body.removeChild(document.getElementById('rightGate'));
			document.body.removeChild(document.getElementById('leftGate'));
			
			firstLogin();
		}, 700);
	},
	
	popLineMenu: function(line){
		var menu = this.genDom('div', 'lineMenu', 'menu');
		
		// add channel links to menu //
		if(line.getAttribute('channels') != null){
			JSON.parse(line.getAttribute('channels')).forEach(function(channel){
				var link = gui.genDom('div', '', 'menuLink', 'Join Channel: ' + channel, [{name: 'targetChannel', value: channel.substr(1)}], [{eventName: 'touchend', func: function(event){
					joinNewChannel(this.getAttribute('targetChannel'));
					
					var wait = touchControl.unbindEvent(menu);
					menu.parentNode.removeChild(menu);
				}}]);
				
				menu.appendChild(link);
			});
		}
		
		// add imgs links to menu //
		if(line.getAttribute('imgs') != null){
			JSON.parse(line.getAttribute('imgs')).forEach(function(img){
				var link = gui.genDom('div', '', 'menuLink', 'View Image: ' + img.substr(img.lastIndexOf('/')), [{name: 'targetImg', value: img}], [{eventName: 'touchend', func: function(event){
					viewImage(this.getAttribute('targetImg'));
					
					var wait = touchControl.unbindEvent(menu);
					menu.parentNode.removeChild(menu);
				}}]);
				
				menu.appendChild(link);
			});
		}
		
		// add urls links to menu //
		if(line.getAttribute('urls') != null){
			JSON.parse(line.getAttribute('urls')).forEach(function(url){
				var link = gui.genDom('div', '', 'menuLink', 'Open: ' + url.substr(0, 20), [{name: 'targetUrl', value: url}], [{eventName: 'touchend', func: function(event){
					openURL(this.getAttribute('targetUrl'));
					
					var wait = touchControl.unbindEvent(menu);
					menu.parentNode.removeChild(menu);
				}}]);
				
				menu.appendChild(link);
			});
		}
		
		if(!line.getAttribute('nick').match(/^(\*|!|<Server>)$/)){
			// reply //
			var targetUser = '@' + line.getAttribute('nick');
			var replyLink = this.genDom('div', '', 'menuLink', 'Reply: ' + targetUser, [{name: 'targetUser', value: targetUser}], [{eventName: 'touchend', func: function(event){
				gui.chatInput.value = gui.chatInput.value + this.getAttribute('targetUser');
				
				var wait = touchControl.unbindEvent(menu);
				menu.parentNode.removeChild(menu);
			}}]);
			
			menu.appendChild(replyLink);
			
			// invite //
			targetUser = line.getAttribute('nick');
			var inviteLink = this.genDom('div', '', 'menuLink', 'Invite: @' + targetUser, [{name: 'targetUser', value: targetUser}], [{eventName: 'touchend', func: function(event){
				chatRoomSockets[currentChannel].send({cmd: 'invite', nick: this.getAttribute('targetUser')});
				
				var wait = touchControl.unbindEvent(menu);
				menu.parentNode.removeChild(menu);
			}}]);
			
			menu.appendChild(inviteLink);
			
			// ignore //
			var ignoreLink = this.genDom('div', '', 'menuLink', 'Ignore: @' + targetUser, [{name: 'targetUser', value: targetUser}], [{eventName: 'touchend', func: function(event){
				ignoreUser(this.getAttribute('targetUser'));
				
				var wait = touchControl.unbindEvent(menu);
				menu.parentNode.removeChild(menu);
			}}]);
			
			menu.appendChild(ignoreLink);
		}
		
		if(menu.childNodes.length > 0){
			document.body.appendChild(menu);
			setTimeout( function(){ menu.style.transform = 'translate3d(0px, -100%, 0px)'; }, 100);
		}
	},
	
	popMainMenu: function(e){
		var menu = this.genDom('div', 'mainMenu', 'menu');
		
		// adjust settings goes here //
		
		// channel selector //
		var channelList = this.genDom('select', 'channelList', 'menuLink', '', [], [{eventName: 'change', func: function(event){
			changeChannel(this.value);
			
			var wait = touchControl.unbindEvent(menu);
			menu.parentNode.removeChild(menu);
		}}]);
		
		var changeMe = document.createElement("option");
		changeMe.value = currentChannel;
		changeMe.text = '< Change Channel >';
		channelList.appendChild(changeMe);
		
		channelData.forEach(function(chan){
			var opt = document.createElement("option");
			opt.value = chan.slot;
			opt.text = chan.name;
			channelList.appendChild(opt);
		});
		
		var newChan = document.createElement("option");
		newChan.value = 99999;
		newChan.text = '< New Channel >';
		channelList.appendChild(newChan);
		
		menu.appendChild(channelList);
		
		document.body.appendChild(menu);
		setTimeout( function(){ menu.style.transform = 'translate3d(0px, -100%, 0px)'; }, 100);
	},
	
	temp: function(){
		
	}
}