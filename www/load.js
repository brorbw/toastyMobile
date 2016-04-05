var framework = {
	scrArray: [
				'js/chatEngine.js',
				'js/gui.js',
				'js/touchControl.js',
				'js/global.js',
				'js/init.js'
				],
	
	
	load: function(){
		this.scrArray.forEach(function(srcFile){
			var domScript = document.createElement('script');
			domScript.async = false;
			domScript.src = srcFile;
			document.head.appendChild(domScript);
		});
	}
}