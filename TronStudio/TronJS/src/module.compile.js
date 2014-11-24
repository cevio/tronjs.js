function CompileInFactory( modules, depicals ){
	var factory = modules.factory,
		inRequire = function( selector ){
			selector = RequireResolve(selector, modules.__dirname);
			return GetExportsBySelector(selector);
		};
	
	debug('compile[pending]:', modules.__modename);
	
	var ret = null,
		depicals = depicals ? depicals : [];

	modules.require = inRequire;
	modules.resolve = function( selector ){
		return RequireResolve.call(modules, selector, modules.__dirname);
	};
	modules.contrast = function( selector ){
		return RequireContrast.call(modules, selector, modules.__dirname);
	};
	
	debug('compile[extend]:', modules.__modename);
	
	window.modules.exports[modules.__modename].module = modules;
	
	try{
		depicals = depicals.concat([inRequire, modules.exports, modules]);
		if ( typeof factory === 'function' ){
			ret = factory.apply(modules, depicals ) || null;
		}else{
			ret = factory;
		}
		
		debug('compile[success]:', modules.__modename, ret);
	}catch(e){
		ret = window.modules.exports[modules.__modename].module.exports;
		debug('compile[error]:', modules.__modename, e.message);
	}

	if ( ret ){
		window.modules.exports[modules.__modename].module.exports = ret;
	};
	
	SetModuleStatus(modules, 'compiled');
	debug('compile[end]:', modules.__modename, ret);
};