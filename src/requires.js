// JavaScript Document
(function( head ){
	var requires = new Class();

	var regx_root = /^\/.+/,
		regx_http = /^http\:\/\//i,
		regx_parent = /^\.\.\/.+/,
		regx_self = /^\.\/.+/,
		regx_local = /^\:.+/;
	
	requires.add('initialize', function(selector, filename){
		this.__filename = filename;
		this.__dirname = this.__filename.split('/').slice(0, -1).join('/');
		this.__loadModule = selector;
		return this.compile();
	});
	
	requires.add('loadscript', function(url){
		return new Promise(function( resolve ){
			var node = document.createElement("script");
			node.onload = node.onerror = node.onreadystatechange = function(){
				if ( /loaded|complete|undefined/i.test(node.readyState) ) {
					node.onload = node.onerror = node.onreadystatechange = null;
					resolve(node);
				}
			}
			node.async = true;
			node.src = url;
			head.insertBefore( node, head.firstChild );
		});
	});
	
	requires.add('loadcss', function(href, before, media){
		return new Promise(function(resolve){
			var ss = window.document.createElement( "link" );
			var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
			var sheets = window.document.styleSheets;
				ss.rel = "stylesheet";
				ss.href = href;
				ss.media = "only x";
				ref.parentNode.insertBefore( ss, ref );
			
			var dtime = new Date().getTime();
			function toggleMedia(){
				if ( new Date().getTime() - dtime > 30000 ){
					reject(ss);
					return;
				};
				var defined;
				for( var i = 0; i < sheets.length; i++ ){
					if( sheets[ i ].href && sheets[ i ].href.indexOf( href ) > -1 ){
						defined = true;
					}
				}
				if( defined ){
					ss.media = media || "all";
					resolve(ss);
				}
				else {
					setTimeout( toggleMedia );
				}
			}
			
			toggleMedia();
		});
	});
	
	requires.add('request', function(url){
		if ( /\.css(?:\?|$)/i.test(url) ){
			return this.loadcss(url);
		}else{
			return this.loadscript(url);
		}
	});
	
	requires.add('contrast', function(str, dirname){
		dirname = dirname || this.__dirname;
		
		if ( str === undefined || typeof str !== 'string' ){
			throw 'Tronjs Error Message: Error Selector String. It Must Be Exist. Now It Is Undefined.';
			return;
		};
		
		if ( window.modules.maps[str] ){ 
			str = window.modules.maps[str]; 
		};
		
		// root like /a/b/c
		if ( regx_root.test(str) ){ 
			str = Library.httpDomain + str; 
		}
		// http://
		else if ( regx_http.test(str) ){ 
			str = str; 
		}
		// parent like ../a/b/c
		else if ( regx_parent.test(str) ){
			str = ResolveParentSelector(dirname + '/' + str); 
		}
		// self like ./a/b/c
		else if ( regx_self.test(str) ){ str = dirname + '/' + str.replace(/^\.\//, ''); }
		// local like :a/b/c
		else if ( regx_local.test(str) ){ str = str.replace(/^:/, ''); }
		// base like a/b/c
		else{ str = httpBase + '/' + str; }
		
		return str;
	});
	
	requires.add('resolve', function(str, dirname){
		str = this.contrast(str, dirname);
		
		if ( !str ) return;

		if ( /\.css$/i.test(str) ){ str = str; }
		else if ( /\.js$/i.test(str) ){ str = str; }
		else{ str += '.js'; }
		
		return str;
	});
	
	requires.add('CompileFactory', function(modules){
		var factory = modules.factory,
			that = this,
			inRequire = function(selector){	
				selector = that.resolve(selector, modules.__dirname);
				return window.modules.exports[selector].module.exports;
			};
	
		var ret = factory ? factory( inRequire, modules.exports, modules ) : null;

		window.modules.exports[modules.__filename].module = modules;
		window.modules.exports[modules.__filename].status = false;
		
		if ( ret ){
			window.modules.exports[modules.__filename].module.exports = ret;
		};

		return window.modules.exports[modules.__filename].module.exports;
	});
	
	requires.add('compile', function(){
		var url = this.resolve(this.__loadModule);
		var that = this;

		if ( !window.modules.exports[url] ){
			window.modules.exports[url] = {
				status: true,
				module: {
					exports: {}
				}
			};
			return new Promise(function(resolve){
				that.request(url).then(function(node){
					var modules = null;
					if ( !node.__LoaderModule__ ){
						modules = window.__LoaderModule__;
						if ( modules ){
							modules.__filename = node.src ? node.src : node.href;
							modules.__dirname = modules.__filename.split('/').slice(0, -1).join('/');
						}else{
							var m = function(){
								this.exports 		= {};
								this.__filename		= null;
								this.__dirname		= null;
								this.dependencies 	= [];
								this.factory		= null;
								this.amd			= false;
							}
							modules = new m();
							modules.__filename = node.src ? node.src : (node.href ? node.href : node.getAttribute('data-href'));
							modules.__dirname = modules.__filename.split('/').slice(0, -1).join('/');
						}
					}else{
						modules = node.__LoaderModule__;
					}
					
					window.__LoaderModule__ = null;

					if ( modules.dependencies && modules.dependencies.length > 0 ){
						if ( !modules.amd ){
							var k = [];
							
							for ( var i = 0 ; i < modules.dependencies.length ; i++ ){
								k.push(new requires(modules.dependencies[i], modules.__filename));
							}
							
							Promise.all(k).then(function(){			
								resolve(that.CompileFactory(modules));
							});
							
						}else{
							var promiseAMD = function(i, modules, callback){
								if ( i + 1 > modules.dependencies.length ){
									callback();
								}else{
									var dk = new requires(modules.dependencies[i], modules.__filename);									
									dk.then(function(){
										promiseAMD(++i, modules, callback);
									});
								}
							}
							promiseAMD(0, modules, function(){
								resolve(that.CompileFactory(modules));
							});
						}
						
					}else{
						resolve(that.CompileFactory(modules));
					}
				});
			});
		}else{
			if ( window.modules.exports[url].status ){
				return new Promise(function(resolve){
					var wait = function(){
						setTimeout(function(){
							if ( !window.modules.exports[url].status ){
								resolve(window.modules.exports[url].module.exports);
							}else{
								wait();
							}
						}, 1);
					};
					wait();
				});
			}else{
				return Promise.resolve(window.modules.exports[url].module.exports);
			}
		}
	});
	
	window.require = function(deps, callback){
		return window.modules.Promise = window.modules.Promise.then(function(){
			if ( !readVariableType(deps, 'array') ){ deps = [deps]; };
		
			var k = [];
		
			for ( var i = 0 ; i < deps.length ; i++ ){
				k.push(new requires(deps[i], window.Library.httpFile));
			};

			return Promise.all(k).then(function(){
				typeof callback === 'function' && callback.apply(this, arguments[0]);
				return arguments[0];
			});
		});
	}
	
	function ResolveParentSelector( p ){
		var parentNode = p.replace(Library.httpDomain, "");
			
		if ( /^\//.test(parentNode) ){
			parentNode = parentNode.replace(/^\//, "");
		}
		
		var parentArrays = parentNode.split("/"),
			index = parentArrays.indexOf("..");
			
		if ( index > -1 ){
			index--;
			
			if ( index < 0 ){
				index = 0;
				parentArrays.splice(0, 1);
			}
			else{
				parentArrays.splice(index, 2);
			}
			
			var x = parentArrays.join("/");
			
			if ( !regx_http.test(x) ){
				x = Library.httpDomain + "/" + x;
			}
			
			return ResolveParentSelector(x);
		}else{
			
			var b = parentArrays.join("/");
			
			if ( !regx_http.test(b) ){
				b = Library.httpDomain + "/" + b;
			}
			
			return b;
			
		}
	};
	
})( head = document.head || document.getElementsByTagName('head')[0] || document.documentElement );