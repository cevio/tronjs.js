// JavaScript Document
(function( head, isIE, module ){
	var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
	var SLASH_RE = /\\\\/g;
	
	window.define = window.define || function(){
		var dependencies = [], 
			factory = function(){}, 
			amd = false;

		for ( var i = 0 ; i < arguments.length ; i++ ){
			var argc = arguments[i];

			if ( readVariableType(argc, 'function') ){
				factory = argc;
			}
			else if ( readVariableType(argc, 'boolean') ){
				amd = argc;
			}
			else{
				dependencies = argc;
			}
		}
		
		if ( dependencies && !readVariableType(dependencies, 'array') ){
			dependencies = [dependencies];
		};
		
		
		var m = new module();
		var d = parseDependencies(factory.toString());
		
		if ( d && d.length > 0 ){
			dependencies = dependencies.concat(d);
		}

		m.dependencies = dependencies;
		m.factory = factory;
		m.amd = amd;
		
		if ( isIE ){
			var script = getCurrentScript();
			if ( script ){
				
				m.__filename = script.src;
				m.__dirname = m.__filename.split('/').slice(0, -1).join('/');
				script.__LoaderModule__ = m;
			}else{
				window.__LoaderModule__ = m;
			}
		}else{
			window.__LoaderModule__ = m;
		}

	};
	
	function unique(arr){
		var obj = {};
		var ret = [];

		for ( var i = 0, len = arr.length; i < len; i++ ) {
			var item = arr[i];
			if ( obj[item] !== 1 ){
			  obj[item] = 1;
			  ret.push(item);
			}
		}

		return ret;
	};
	
	//处理依赖关系方法
	function parseDependencies( code ){
		var ret = [], m;
			
		REQUIRE_RE.lastIndex = 0
		code = code.replace(SLASH_RE, "");

		while ((m = REQUIRE_RE.exec(code))) {
			if (m[2]) ret.push(m[2]);
		}

		return unique(ret);
	};
	
	function getCurrentScript(){
		var scripts = head.getElementsByTagName("script");
	
		for ( var i = scripts.length - 1; i >= 0; i-- ) {
			var script = scripts[i];
			if (script.readyState === "interactive") {
				 return script;
			}
		}
	};
	
})(	
	head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
	window.navigator.userAgent.indexOf('MSIE') > -1,
	function(){
		this.exports 		= {};
		this.__filename		= null;
		this.__dirname		= null;
		this.dependencies 	= [];
		this.factory		= null;
		this.amd			= false;
	}
);