# ToastyStoemp-Mobile
Android App for ToastyStoemp chat



# Build
Prerequisites:
	- Install Node.js ( https://nodejs.org/ )
	
	- Install Cordova CLI ( npm install -g cordova )
	
	- Install JDK 7 or greater ( http://www.oracle.com/technetwork/java/javase/downloads/index.html )
	
	- Install Android Studio ( https://developer.android.com/sdk/index.html )



Clone Git & Run:
cordova build android




# Assist
Easiest way to assist in building the UI is to clone the git, install xammp, change htdocs path to:
(git dir)/www/



Then load http://127.0.0.1/ in _Chrome_. Edit, refresh, repeat.




# To Do:
	Update Cordova config.xml to allow app to run in bg
	
	
	
	Add splash screen for fade in, div already in place; id "loadOverlay"
	Add channel carousel under login
	
	
	
	Add vibration plugin and bind to @nick, to vibrate if process in background
	
	
	
	Add settings dropdown and bind to phone button
	Implement all settings
	
	
	
	Add onclick chat line; popup menu (ignore, reply, etc)