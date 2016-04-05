/* setup global vars */
var chatRoomSockets = [];
var channelData = [{name: 'mobiledev', slot: 0, chanDiv: ''}];
var currentChannel = 0;
var myNick = "";
var myPass = "";
var myLogin = "";
var ignoredUsers = [];
var notifySound = new Audio('audio/notifi-sound.wav');
var webClientVersion = "toastyMobileV0.1.0";
var disconnectCodes = ['E002', 'E003', 'I004', 'E005'];


// global functions //

function buildNewChat(){
	function chat(){};
	chat.prototype = chatEngine;
	return new chat;
}

function startLogin(){
	// init login data //
	myLogin = document.getElementById('username').value;
	
	if(myLogin.indexOf('#') != -1){
		myPass = myLogin.split('#')[1];
		myNick = myLogin.split('#')[0];
	}else{
		myNick = myLogin;
	}
	
	// run animations //
	gui.openGates();
}

function firstLogin(){
	// build output dom //
	channelData[currentChannel].chanDiv = gui.genDom('div', '', 'chatOutput', '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>'); // <br> is to init div //
	
	touchControl.addTouchScrolling(channelData[currentChannel].chanDiv);
	
	document.body.appendChild(channelData[currentChannel].chanDiv);
	
	// add main input dom //
	document.body.appendChild(gui.chatInput);
	
	// build chat engine, init & go go go
	chatRoomSockets.push(buildNewChat());
	chatRoomSockets[0].init(channelData[currentChannel].name, channelData[currentChannel].chanDiv);
}

function joinNewChannel(channel){
	console.log('joining ' + channel);
	var nextSlot = channelData.push({name: channel, slot: 0, chanDiv: ''}) - 1;
	// build output dom //
	channelData[nextSlot].slot = nextSlot;
	channelData[nextSlot].chanDiv = gui.genDom('div', '', 'chatOutput', '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>'); // <br> is to init div //
	
	touchControl.addTouchScrolling(channelData[nextSlot].chanDiv);
	
	channelData[currentChannel].chanDiv.style.display = 'none';
	document.body.appendChild(channelData[nextSlot].chanDiv);
	
	currentChannel = nextSlot;
	
	// build chat engine, init & go go go
	chatRoomSockets.push(buildNewChat());
	chatRoomSockets[currentChannel].init(channelData[currentChannel].name, channelData[currentChannel].chanDiv);
}

function changeChannel(newChan){
	if(newChan == 99999){
		console.log('making new channel');
	}else{
		channelData[currentChannel].chanDiv.style.display = 'none';
		currentChannel = newChan;
		channelData[currentChannel].chanDiv.style.display = 'table';
	}
}

function viewImage(img){
	console.log('viewing ' + img);
}

function openURL(url){
	console.log('opening ' + url);
}

function onBack(e){
	
}

function ignoreUser(nick){
	//ignoredUsers.push(nick);
	gui.popMainMenu();
}

function calculateRejoinTimeout(count){
	switch (count){
		case 0:
		case 1: return  2000;
		case 2: return  3000;
		case 3: return  6000;
		case 4: return 12000;
		case 5: return 22000;
	}
	return 30000;
}

function onSocketData(data, socket){
	switch(data.cmd){
		case 'verify':
			//if(data.valid == false) pushMessage(socket.myOutputDiv, {nick: 'warn', errCode: 'E000', text: "You have an outdated client, update your app!"}); // Left for future updates //
			socket.send({cmd: 'join', channel: socket.myChannel, nick: myNick, pass: myPass});
		break;
		case 'chat':
			if(ignoredUsers.indexOf(data.nick) >= 0){
				return;
			}
			
			data.isLastPoster = (socket.lastPoster == data.nick);
			socket.lastPoster = data.nick;
			
			data.nickColour = socket.onlineUsers[data.nick];
			
			pushMessage(socket.myOutputDiv, data, parseLinks(data.text));
		break;
		case 'info':
			data.nick = '*';
			
			pushMessage(socket.myOutputDiv, data, parseLinks(data.text));
		break;
		case 'shout':
			data.nick = "<Server>";
			
			pushMessage(socket.myOutputDiv, data);
			if(disconnectCodes.indexOf(data.errCode) != -1) socket.ws.close();
		break;
		case 'warn':
			data.nick = '!';
			
			pushMessage(socket.myOutputDiv, data);
			if(disconnectCodes.indexOf(data.errCode) != -1) socket.ws.close();
		break;
		case 'onlineSet':
			// this is not sane server response. . . //
			socket.usersClear();
			
			for (var i = 0, j = data.nicks.length; i < j; i++){
				socket.userAdd(data.nicks[i], data.trips[i]);
			}
			
			pushMessage(socket.myOutputDiv, {nick: '*', text: "Users online: " + data.nicks.join(", ")});
		break;
		case 'onlineAdd':
			var nick = data.nick;
			var trip = data.trip;
			
			socket.userAdd(nick, trip);
			
			//if($('#joined-left').is(":checked")){ // left here for future reference //
			pushMessage(socket.myOutputDiv, {nick: '*', text: nick + " joined"});
		break;
		case 'onlineRemove':
			var nick = data.nick;
			
			socket.userRemove(nick);
			
			//if($('#joined-left').is(":checked")){ // left here for future reference //
			pushMessage(socket.myOutputDiv, {nick: '*', text: nick + " left"});
		break;
		case 'play':
			pushMessage(socket.myOutputDiv, {nick: "*", text: nick + " cannot show his video because @Rut is lazy. . ."});
		break;
	}
}

function parseLinks(data){
	var returnData = {imgs: [], urls: [], channels: []};
	
	data.split(' ').forEach(function(block){
		if((/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig).test(block)){
			if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(block)){
				returnData.imgs.push(block);
			}else{
				returnData.urls.push(block);
			}
		}else if(block.length > 1 && block.substr(0, 1) == '?'){
			returnData.channels.push(block);
		}
	});
	
	return returnData;
}

function pushMessage(targetDiv, data, linkages){
	if(typeof targetDiv === 'undefined') return; // fix this bandaid later :D //
	linkages = typeof linkages !== 'undefined' ? linkages : false;
	
	var chatLine = document.createElement('div');
	chatLine.setAttribute('class', 'chatLine');
	chatLine.setAttribute('nick', data.nick);
	
	if(linkages != false && linkages.channels.length > 0) chatLine.setAttribute('channels', JSON.stringify(linkages.channels));
	if(linkages != false && linkages.imgs.length > 0) chatLine.setAttribute('imgs', JSON.stringify(linkages.imgs));
	if(linkages != false && linkages.urls.length > 0) chatLine.setAttribute('urls', JSON.stringify(linkages.urls));
	
	if(targetDiv.childNodes.length % 2) addClass(chatLine, 'odd');
	
	if(data.admin){
		addClass(chatLine, 'admin');
	}else if(data.nick == myNick){
		addClass(chatLine, 'me');
	}else if(data.nick == '!'){
		addClass(chatLine, 'warn');
	}else if(data.nick == '*'){
		addClass(chatLine, 'info');
	}else if(data.nick == '<Server>'){
		addClass(chatLine, 'shout');
	}
	
	var leftSide = document.createElement('div');
	leftSide.setAttribute('class', 'leftSide');
	
	var tripDom = document.createElement('span');
	if(typeof data.trip !== 'undefined' && !data.isLastPoster){
		if(data.admin){
			tripDom.innerHTML = 'Admin';
		}else{
			tripDom.innerHTML = data.trip;
		}
	}
	leftSide.appendChild(tripDom);
	
	var nickDom = document.createElement('b');
	if(data.donator) addClass(nickDom, 'donator');
	if(typeof data.nickColour !=='undefined') nickDom.style.cssText = 'color:' + data.nickColour;
	if(!data.isLastPoster) nickDom.innerHTML = data.nick;
	leftSide.appendChild(nickDom);
	
	chatLine.appendChild(leftSide);
	
	var rightSide = document.createElement('div');
	rightSide.setAttribute('class', 'rightSide');
	
	if(data.text.indexOf("@" + myNick) != -1){
		addClass(rightSide, 'mention');
		//if($('#notifications').is(":checked") && !document.hasFocus()){ // left here for future reference //
		// add vibrate phone here //
		notifySound.play();
	}else if(data.text.indexOf("@*") != -1){
		addClass(rightSide, 'mention');
	}
	
	rightSide.innerHTML = data.text;
	
	chatLine.appendChild(rightSide);
	
	// add ontouchend bind here //
	
	targetDiv.appendChild(chatLine);
}

function addClass(target, newClass){
	// setAttribute ~31% faster than classList.add() //
	target.setAttribute('class', target.getAttribute('class') + ' ' + newClass);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key];
	}
	catch(e) {}
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val;
	}
	catch(e) {}
}

function getDragSize(e){
	return (p = Math.pow)(p(e.clientX - (rc = e.target.getBoundingClientRect()).left, 2) + p(e.clientY - rc.top, 2), .5);
}

function getHeight(){
	return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

/* // left these here for future reference //

// Restore settings from localStorage

if(localStorageGet('auto-login') == 'true'){
	$("#auto-login").prop('checked', true);
}
if(localStorageGet('joined-left') == 'false'){
	$("#joined-left").prop('checked', false);
}
if(localStorageGet('leave-warning') == 'false'){
	$("#leave-warning").prop('checked', false);
}
if(localStorageGet('notifications') == 'false'){
	$("#notifications").prop('checked', false);
}

$('#auto-login').change(function(e){
	localStorageSet('auto-login', !!e.target.checked);
});
$('#joined-left').change(function(e){
	localStorageSet('joined-left', !!e.target.checked);
});
$('#leave-warning').change(function(e){
	localStorageSet('leave-warning', !!e.target.checked);
});
$('#notifications').change(function(e){
	localStorageSet('notifications', !!e.target.checked);
});

// color scheme switcher //

var schemes = [
	'android',
	'atelier-dune',
	'atelier-forest',
	'atelier-heath',
	'atelier-lakeside',
	'atelier-seaside',
	'bright',
	'chalk',
	'default',
	'eighties',
	'greenscreen',
	'mocha',
	'monokai',
	'nese',
	'ocean',
	'pop',
	'railscasts',
	'solarized',
	'tomorrow',
];

var currentScheme = 'solarized';

function setScheme(scheme){
	currentScheme = scheme;
	$("#scheme-link").attr("href", "/schemes/" + scheme + ".css");
	localStorageSet('scheme', scheme);
}

// Add scheme options to dropdown selector
schemes.forEach(function(scheme){
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#scheme-selector').append(option);
})

$('#scheme-selector').change(function(e){
	setScheme(e.target.value);
});

// Load sidebar configaration values from local storage if available
if(localStorageGet('scheme')){
	setScheme(localStorageGet('scheme'));
}

$('#scheme-selector').value = currentScheme;

*/