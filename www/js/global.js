/* global vars */
var chatRoomArray = [];
var typingIn = 0;
var myNick = "";
var myPass = "";
var notifySound = new Audio('audio/notifi-sound.wav');
var webClientVersion = "toastyMobileV0.1.0";
var disconnectCodes = ['E002', 'E003', 'I004', 'E005'];

/* global functions */

function buildNewChat(){
	function chat(){};
	chat.prototype = chatEngine;
	return new chat;
}

function startLogin(){
	/* store login info */
	var userStr = document.getElementById('username').value;
	if(userStr.indexOf('#') != -1) {
		myNick = test.split('#')[0];
		myPass = test.split('#')[1];
	}else{
		myNick = userStr;
	}
	
	/* queue animations */
	document.getElementById('login').style.transform = 'translate3d(0, -300%, 0)';
	
	setTimeout(function(){
		document.getElementById('rightGate').style.transform = 'translate3d(75%, 0, 0)';
		document.getElementById('leftGate').style.transform = 'translate3d(-75%, 0, 0)';
	}, 300);
	
	setTimeout(function(){
		document.body.removeChild(document.getElementById('login'));
		document.body.removeChild(document.getElementById('rightGate'));
		document.body.removeChild(document.getElementById('leftGate'));
		
		showChatUI();
	}, 700);
}

function showChatUI(){
	/* add main output dom */
	chatOutput = document.createElement('div');
	chatOutput.setAttribute('id', 'chatOutput');
	chatOutput.innerHTML = '<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />'; /* Quick hack to init chat view */
	
	document.body.appendChild(chatOutput);
	
	/* add main input dom */
	var chatInput = document.createElement('textarea');
	chatInput.setAttribute('id', 'chatInput');
	
	chatInput.addEventListener("keydown", function(e){
			if(e.keyCode == 13 && !e.shiftKey){
				e.preventDefault();
				chatRoomArray[typingIn].say(this.value);
				this.value = '';
				return false;
			}
		}
	, false);
	document.body.appendChild(chatInput);
	
	// clone chat engine, init & go go go
	chatRoomArray.push(buildNewChat());
	chatRoomArray[0].init();
}

function popMenu(e){
	
}

function onBack(e){
	
}

calculateRejoinTimeout = function(count){
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

onSocketData = function(data, socket){
	switch(data.cmd){
		case 'verify':
			//if(data.valid == false) pushMessage(socket.myOutputDiv, {nick: 'warn', errCode: 'E000', text: "You have an outdated client, update your app!"}); // Left for future updates //
			socket.send({cmd: 'join', channel: socket.myChannel, nick: myNick, pass: myPass});
		break;
		case 'chat':
			if(socket.ignoredUsers.indexOf(data.nick) >= 0){
				return;
			}
			
			data.isLastPoster = (socket.lastPoster == data.nick);
			socket.lastPoster = data.nick;
			
			data.nickColour = socket.onlineUsers[data.nick];
			
			pushMessage(socket.myOutputDiv, data);
		break;
		case 'info':
			data.nick = '*';
			
			pushMessage(socket.myOutputDiv, data);
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

function pushMessage(targetDiv, data){
	var chatLine = document.createElement('div');
	chatLine.setAttribute('class', 'chatLine');
	
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