// GlobalModule Factory.
;(function(){
	var GlobalModule = new Class(function(){
		this.debug = false;									// 是否开启调试
		this.charset = "utf-8";								// 整站统一编码
		this.time = new Date().getTime();					// 框架运行开始时间点
		this.timer =  function(){							// 框架运行时间 (ms)
			return (new Date().getTime()) - this.time;
		};
		this.exports = {};									// 所有模块的集合
		this.maps = {};										// 所有映射模块集合
		this.host = Server.MapPath("/");					// 网站的根目录
		this.base = this.host + '';							// 网站基址
	});
	
	GlobalModule.add('scriptExec', function( callback, params ){
		console.log('<script language="javascript" type="text/javascript">' + ('(' + callback.toString() + ')(' + JSON.stringify(params) + ');') + '</script>\n');
	});
	
	GlobalModule.add('writeCss', function( urls ){
		if ( !readVariableType(urls, 'array') ){ urls = [urls]; };
		urls.forEach(function(url){
			if ( url && url.length > 0 ){
				console.log('<link rel="stylesheet" type="text/css" href="' + url + '">\n');
			}
		});
	});
	
	GlobalModule.add('writeScript', function( urls ){
		if ( !readVariableType(urls, 'array') ){
			urls = [urls];
		}
		urls.forEach(function(url){
			if ( url && url.length > 0 ){
				console.log('<script language="javascript" type="text/javascript" src="' + url + '"></script>\n');
			}
		});
	});
	
	GlobalModule.add('setBase', function(str){
		if ( str === undefined ) { str = ""; }

		if ( str.length > 0 ){
			this.base = this.host + "\\" + str
		};
		
		if ( /\\+$/.test(this.base) ){
			this.base = this.base.replace(/\\+$/, '');
		};
	});
	
	modules = new GlobalModule();
	Response.Charset = modules.charset;
})();