var chatEngine = {
	ws: 0,
	pingInterval: 0,
	myChannel: 'programming',
	
	connectTime: 0,
	joinTryCount: 0,
	lastPoster: '',
	myOutputDiv: 'chatOutput',
	onlineUsers: {},
	ignoredUsers: [],
	
	init: function(channel, div){
		channel = typeof channel !== 'undefined' ? channel : 'programming';
		div = typeof div !== 'undefined' ? div : 'chatOutput';
		
		this.myChannel = channel;
		this.myOutputDiv = div;
		
		this.myOutputDiv = document.getElementById(this.myOutputDiv);
		this.join(this.myChannel);
	},
	
	calculateRejoinTimeout: function(){
		switch (this.joinTryCount){
			case 0:
			case 1: return  2000;
			case 2: return  3000;
			case 3: return  6000;
			case 4: return 12000;
			case 5: return 22000;
		}
		return 30000;
	},

	join: function(){
		var my = this; // to maintain scope //
		
		this.connectTime = new Date();
		
		this.ws = new WebSocket('wss://chat.toastystoemp.com/chatws');
		
		this.ws.onopen = function(){
			my.send({cmd: 'verify', version: webClientVersion});
			my.pingInterval = window.setInterval(function(){
				my.send({cmd: 'ping'});
			}, 50*1000);
		}
		
		this.ws.onclose = function(){
			clearInterval(my.pingInterval);
			
			var secondsSinceConnection = (new Date() - my.connectTime) / 1000;
			if(secondsSinceConnection > 2){
				my.joinTryCount = 0;
			}else{
				my.joinTryCount++;
			}
			var timeout = my.calculateRejoinTimeout() / 1000;

			my.pushMessage({nick: '!', text: "Disconnected. Waiting for <span class=\"reconnectTimer\">" + String(timeout) + "</span> seconds till retry (" + my.joinTryCount + ").", elementId: 'disconnect_message', replaceIfSameAsLast: true}, false);

			window.setTimeout(function(){
				my.join(my.myChannel);
			}, timeout);
		}

		this.ws.onmessage = function(message){
			my.parseMessage(JSON.parse(message.data));
		}
	},
	
	parseMessage: function(args){
		var cmd = args.cmd;
		
		switch(cmd){
			case 'verify':
				if(args.valid == false) this.pushMessage({nick: 'warn', errCode: 'E000', text: "You have an outdated client, update your app!"});
				this.send({cmd: 'join', channel: this.myChannel, nick: myNick, pass: myPass});
			break;
			case 'chat':
				if(this.ignoredUsers.indexOf(args.nick) >= 0){
					return;
				}
				this.pushMessage(args);
			break;
			case 'info':
				args.nick = '*';
				this.pushMessage(args);
			break;
			case 'shout':
				args.nick = "<Server>";
				this.pushMessage(args);
				if(disconnectCodes.indexOf(args.errCode) != -1) this.ws.close();
			break;
			case 'warn':
				args.nick = '!';
				this.pushMessage(args);
				if(disconnectCodes.indexOf(args.errCode) != -1) this.ws.close();
			break;
			case 'onlineSet':
				// this is not sane server response. . . //
				this.usersClear();
				for (var i = 0, j = args.nicks.length; i < j; i++){
					this.userAdd(args.nicks[i], args.trips[i]);
				}
				this.pushMessage({nick: '*', text: "Users online: " + args.nicks.join(", ")});
			break;
			case 'onlineAdd':
				var nick = args.nick;
				var trip = args.trip;
				this.userAdd(nick, trip);
				//if($('#joined-left').is(":checked")){ // left here for future reference //
				this.pushMessage({nick: '*', text: nick + " joined"});
			break;
			case 'onlineRemove':
				var nick = args.nick;
				this.userRemove(nick);
				//if($('#joined-left').is(":checked")){
				this.pushMessage({nick: '*', text: nick + " left"});
			break;
			case 'play':
				pushMessage({nick: "*", text: nick + " cannot show his video because @Rut is lazy. . ."});
			break;
		}
	},

	pushMessage: function(data, usePre){
		var chatLine = document.createElement('div');
		chatLine.setAttribute('class', 'chatLine');
		if(this.myOutputDiv.childNodes.length % 2) chatLine.setAttribute('class', 'chatLine odd');
		
		var leftSide = document.createElement('div');
		leftSide.setAttribute('class', 'leftSide');
		
		if(data.trip != ''){
			var tripDom = document.createElement('span');
			tripDom.innerHTML = data.trip;
			leftSide.appendChild(tripDom);
		}
		
		var nickDom = document.createElement('b');
		nickDom.innerHTML = data.nick;
		leftSide.appendChild(nickDom);
		
		chatLine.appendChild(leftSide);
		
		var rightSide = document.createElement('div');
		rightSide.setAttribute('class', 'rightSide');
		rightSide.innerHTML = data.text;
		
		chatLine.appendChild(rightSide);
		
		//  will get around to implementation later //
		/*
		var messageEl = document.createElement('div');
		messageEl.classList.add('message');
		if(args.admin){
			messageEl.classList.add('admin');
		}
		else if(args.nick == myNick){
			messageEl.classList.add('me');
		}
		else if(args.nick == '!'){
			messageEl.classList.add('warn');
		}
		else if(args.nick == '*'){
			messageEl.classList.add('info');
		}
		else if(args.nick == '<Server>'){
			messageEl.classList.add('shout');
		}


		if(args.elementId){ // for referencing special message
			var oldElement = document.getElementById(args.elementId);
			if(oldElement) oldElement.removeAttribute('id');
			messageEl.id = args.elementId;
			if(oldElement && args.replaceIfSameAsLast && oldElement == lastMessageElement)
				oldElement.parentNode.removeChild(oldElement);
		}

		// Nickname
		var nickSpanEl = document.createElement('span');
		if(args.trip && !args.admin)
			nickSpanEl.style.color = onlineUsers[args.nick];
		nickSpanEl.classList.add('nick');
		messageEl.appendChild(nickSpanEl);

		if(args.trip && args.nick != lastPoster){
			var tripEl = document.createElement('span');
			if(args.admin)
				tripEl.textContent = "Admin ";
			else
				tripEl.textContent = args.trip + " ";
			tripEl.classList.add('trip');
			nickSpanEl.appendChild(tripEl);
			
			var nickLinkEl = document.createElement('a');
			nickLinkEl.textContent = args.nick;
			nickLinkEl.onclick = function(){
				insertAtCursor("@" + args.nick + " ");
				$('#chatinput').focus();
			}
			var date = new Date(args.time || Date.now());
			nickLinkEl.title = date.toLocaleString();
			nickSpanEl.appendChild(nickLinkEl);

			if(args.donator){
				var donatorLinkEl = document.createElement('img');
				donatorLinkEl.src = "https://toastystoemp.com/public/donator-icon.png";  // will need to update this for less screen realestate //
				donatorLinkEl.style.marginLeft= "8px";
				donatorLinkEl.title = "Donator".toLocaleString();
				nickSpanEl.appendChild(donatorLinkEl);
			}
		}

		// Mentioning
		if(args.text.indexOf("@" + myNick) != -1){
			messageEl.classList.add('mention');
			if($('#notifications').is(":checked") && !document.hasFocus()){
				notifyUser(args.nick + " mentioned you", args.text, false);
			}
		}
		else if(args.text.indexOf("@*") != -1){
			messageEl.classList.add('mention');
		}
		else if(!(args.nick == '!' || args.nick == '*' || args.nick == '<Server>')){
			for(var nick in onlineUsers){
				if(args.text.indexOf(nick) != -1){
					var user = document.createElement('span');
					user.textContent = "@" + nick;
					user.style.color = onlineUsers[nick];
					try{
						textEl.outerHTML = textEl.outerHTML.replace("@" + nick, user.outerHTML);
					}
					catch(err){
						console.log(err.message);
					}
				}
			}
		}
		*/
		
		this.myOutputDiv.appendChild(chatLine);
		
		this.lastPoster = data.nick;
	},
	
	send: function(data){
		if(this.ws && this.ws.readyState == this.ws.OPEN){
			this.ws.send(JSON.stringify(data));
		}
	},
	
	say: function(data){
		this.send({cmd: 'chat', text: data});
	},
	
	userAdd: function(nick, trip){
		this.onlineUsers[nick] = this.colorRender(trip);
	},

	userRemove: function(nick){
		delete onlineUsers[nick];
	},

	usersClear: function(){
		for (var i in this.onlineUsers) delete this.onlineUsers[i];
	},

	userInvite: function(nick){
		this.send({cmd: 'invite', nick: nick});
	},

	colorRender: function(trip, admin){
		if(trip == "vmowGH")
			return "#cd3333";
		var color1 = (Math.floor((trip[0].charCodeAt(0) - 33) * 2.865)).toString(16);
		var color3 = (Math.floor((trip[1].charCodeAt(0) - 33) * 2.865)).toString(16);
		var color2 = (Math.floor((trip[2].charCodeAt(0) - 33) * 2.865)).toString(16);
		return "#" + color1 + color2 + color3;
	},

	notifyUser: function(title, text, channel){
		if(typeof text != 'undefined'){
			notifySound.play();
			
		}
	},
	
	userIgnore: function(nick){
		this.ignoredUsers.push(nick);
	}
}