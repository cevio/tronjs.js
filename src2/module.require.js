var require = new Class(function( AbsoluteHttpSelector ){
	this.AbsoluteHttpSelector = AbsoluteHttpSelector;
	return this.compile();
});

require.add('compile', function(){
	var url = this.AbsoluteHttpSelector;
	return new Promise(function(resolve){
		window.define.amd[url] = true;
		debug('require[pending]:', url);
		
		if ( window.modules.exports[url] && window.modules.exports[url].inDefine ){
			if ( window.modules.exports[url].status < 3 ){
				debug('require[inDefine][wait]:', url);
				delay(url, resolve);
			}else{
				resolve();
			}
		}else{
			if ( window.modules.exports[url] && window.modules.exports[url].status < 3 ){
				debug('require[inDefine][wait]:', url);
				delay(url, resolve);
			}else{
				if ( !window.modules.exports[url] ){
					request(url).then(function( node ){
						var modules = node.LoadedModules,
							PromiseModules = [];
							
						if ( !modules ){ modules = window.modules.LoadedModules; };
						if ( modules.length === 0 ){
							var _modules = new GlobalModule();
								_modules.__filename = node.src ? node.src : node.href;
								_modules.__modename = _modules.__filename;
								_modules.__dirname = getDirName(_modules.__modename);
								window.modules.exports[_modules.__modename] = {};
								SetModuleStatus(_modules, 'analyzed');
								modules = [_modules];
						}
						
						modules = Array.prototype.slice.call(modules, 0);
						window.modules.LoadedModules = [];
						
						modules.forEach(function(module){
							PromiseModules.push(requireDependencies(module));
						});
						
						debug('require[loaded]:', url, PromiseModules);
	
						Promise.all(PromiseModules).then(function(){
							var __filename__ = node.src ? node.src : node.href;
							if ( /\.js$/.test(__filename__) ){
								node.parentNode.removeChild(node);
							};
							resolve();
							debug('require[compiled]:', url, modules);
						});
					});
				}else{
					resolve();
				}
			};
		};
	});
});

var delay = function(url, callback){
	setTimeout(function(){
		debug('waiting:', url);
		if ( window.modules.exports[url].status === 3 ){
			debug('waited:', url);
			callback();
		}else{
			delay(url, callback);
		}
	}, 1);
}

window.require = function(deps, callback){
	return window.modules.Promise = window.modules.Promise.then(function(){
		if ( !readVariableType(deps, 'array') ){ deps = [deps]; };
	
		var KeepPromiseQueens = [], 
			selectors = [];

		for ( var i = 0 ; i < deps.length ; i++ ){
			var dep = RequireResolve(deps[i], getDirName(Library.httpFile));
			KeepPromiseQueens.push( new require(dep) );
			selectors.push(dep);
		};

		return Promise.all(KeepPromiseQueens).then(function(){
			var defineLoadExports = GetExportsBySelectors(selectors);
			typeof callback === 'function' && callback.apply(null, defineLoadExports);
			
			return Promise.resolve(defineLoadExports);
		});
	});
}