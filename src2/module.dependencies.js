// 单define模块依赖关系处理
function requireDependencies( modules ){
	var dependencies 	= modules.dependencies,
		MaskModule 		= modules;
	
	debug('dependencies[pending]:', modules.__modename, dependencies);
		
	return new Promise(function( resolve ){
		if ( dependencies.length > 0 ){
			if ( !MaskModule.async ){
				debug('dependencies[doing][cmd]:', MaskModule.__modename);
				var Promises = [];
				dependencies.forEach(function( moduleSelector ){
					debug('dependencies[getting][cmd]:', moduleSelector);
					Promises.push( new require(moduleSelector) );
				});
				Promise.all(Promises).then(function(){
					debug('dependencies[getted][cmd]:', MaskModule.__modename);
					SetModuleStatus(MaskModule, 'required');
					CompileInFactory(MaskModule, GetExportsBySelectors(dependencies));
					resolve();
				});
			}else{
				debug('dependencies[doing][amd]:', modules.__modename);
				var argcs = [];
				var promiseAMD = function(z, deps, callback){
					if ( z + 1 > deps.length ){
						callback();
					}else{
						debug('dependencies[getting][amd]:', deps[z]);
						var PromiseRequire = new require(deps[z]);									
						PromiseRequire.then(function(){
							argcs.push(GetExportsBySelector(deps[z]));
							debug('dependencies[getted][amd]:', MaskModule.__modename);
							promiseAMD(++z, deps, callback);
						});
					}
				};
				promiseAMD(0, dependencies, function(){
					debug('dependencies[done]:', MaskModule.__modename);
					SetModuleStatus(MaskModule, 'required');
					CompileInFactory(MaskModule, argcs);
					resolve();
				});
			}
		}else{
			debug('dependencies[done]:', modules.__modename, []);
			SetModuleStatus(modules, 'required');
			CompileInFactory(modules);
			resolve();
		}
	});
};