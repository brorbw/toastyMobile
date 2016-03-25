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
	
	chatInput.onkeydown = function(e){
		if(e.keyCode == 13 && !e.shiftKey){
			e.preventDefault();
			chatRoomArray[typingIn].say(this.value);
			this.value = '';
			return false;
		}
	};
	
	document.body.appendChild(chatInput);
	
	/* add main submit dom */
	//<div class="goBtn" onclick="startLogin()"><div class="goBtn goBtnShadow"></div></div>
	var outterSubmitBtn = document.createElement('div');
	outterSubmitBtn.setAttribute('id', 'mainSubmit');
	outterSubmitBtn.setAttribute("class", "goBtn");
	outterSubmitBtn.innerHTML = '';
	
	var innerSubmitBtn = document.createElement('div');
	innerSubmitBtn.setAttribute("class", "goBtn goBtnShadow");
	innerSubmitBtn.innerHTML = '';
	
	outterSubmitBtn.onmousedown = function(e){
		chatRoomArray[typingIn].say(chatInput.value);
		chatInput.value = '';
	};
	
	outterSubmitBtn.appendChild(innerSubmitBtn);
	document.body.appendChild(outterSubmitBtn);
	
	/* add settings dom */
	var outterSettingsBtn = document.createElement('div');
	outterSettingsBtn.setAttribute('id', 'mainSettings');
	outterSettingsBtn.setAttribute("class", "goBtn");
	outterSettingsBtn.innerHTML = '';
	
	var innerSettingsBtn = document.createElement('div');
	innerSettingsBtn.style.cssText = 'width: 100%;';
	innerSettingsBtn.setAttribute("class", "goBtn goBtnShadow");
	innerSettingsBtn.innerHTML = '';
	
	outterSettingsBtn.onmousedown = function(e){
		dropSettings();
	};
	
	outterSettingsBtn.appendChild(innerSettingsBtn);
	document.body.appendChild(outterSettingsBtn);
	
	// clone chat engine, init & go go go
	chatRoomArray.push(buildNewChat());
	chatRoomArray[0].init();
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