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
			var timeout = calculateRejoinTimeout(my.joinTryCount) / 1000;

			pushMessage(this, {nick: '!', text: "Disconnected. Waiting for " + String(timeout) + " seconds till retry.", elementId: 'disconnect_message', replaceIfSameAsLast: true}, false);

			window.setTimeout(function(){
				my.join(my.myChannel);
			}, timeout);
		}

		this.ws.onmessage = function(message){
			my.parseMessage(JSON.parse(message.data));
		}
	},
	
	parseMessage: function(data){
		onSocketData(data, this);
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
		delete this.onlineUsers[nick];
	},

	usersClear: function(){
		for (var i in this.onlineUsers) delete this.onlineUsers[i];
	},

	userInvite: function(nick){
		this.send({cmd: 'invite', nick: nick});
	},

	colorRender: function(trip){
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