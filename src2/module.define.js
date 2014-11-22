// window.define 函数主体
window.define = window.define || function(){
	
	var id = null,
		dependencies = [],
		factory = null,
		async = false;
	
	// 配置参数到具体参数	
	for ( var i = 0 ; i < arguments.length ; i++ ){
		var defineArgc = arguments[i];

		if ( readVariableType(argc, 'function') ){
			factory = defineArgc;
		}
		else if ( readVariableType(argc, 'boolean') ){
			async = defineArgc;
		}
		else if ( readVariableType(argc, 'array') ){
			dependencies = defineArgc;
		}
		else if ( readVariableType(argc, 'string') ){
			id = defineArgc;
		}else{
			factory = defineArgc;
		}
	};
	
	// 马上获取文件具体执行地址
	var InteractiveScript = getCurrentScript();
	
	// 如果没有找到节点，那么这里处理
	if ( !InteractiveScript ){
		throw 'can not find node';
		return;
	};
	
	// 实例化一个具体的模块对象
	var InstantiationModule = new GlobalModule();
	
	// 获取factory中的具体依赖对象
	var InstantiationDependencies = [];
	if ( factory && typeof factory === 'function' ){
		InstantiationDependencies = parseDependencies(factory.toString());
	};
	if ( InstantiationDependencies.length > 0 ){
		dependencies = dependencies.concat(InstantiationDependencies);
	};
	
	// 处理模块具体信息
	InstantiationModule.__filename 		= InteractiveScript.src;
	InstantiationModule.__dirname  		= getDirName(InstantiationModule.__filename);
	InstantiationModule.dependencies	= dependencies;
	InstantiationModule.factory			= factory;
	InstantiationModule.async			= async;
	
	// 处理模块自定义地址
	if ( id && id.length > 0 ){
		InstantiationModule.__modename	= id;
		
		// 进行地址转换， 转换为绝对地址
		InstantiationModule.__modename = RequireResolve(InstantiationModule.__modename, InstantiationModule.__dirname);
	}else{
		InstantiationModule.__modename = InstantiationModule.__filename;
	};
	
	// 处理依赖关系绝对地址
	var EachDependencies = [];
	if ( InstantiationModule.dependencies.length > 0 ){
		InstantiationModule.dependencies.forEach(function( DepSelector ){
			EachDependencies.push(DefineResolve(DepSelector, InstantiationModule.__dirname, getDirName(InstantiationModule.__modename)));
		});
		InstantiationModule.dependencies = EachDependencies;
	};
	
	// 判断游览器运行？
	if ( !window.define.amd[InstantiationModule.__filename] ){
		// 浏览器中直接运行
		onBrowerExecuteScript(InstantiationModule);
	}else{
		// 采用模块加载运行
		window.modules.LoadedModules.push(InstantiationModule);
		if ( isIE ){
			InteractiveScript.LoadedModules = Array.prototype.slice.call(window.modules.LoadedModules, 0);
		};
	}
};

// Window.Define.AMD  规范列表
window.define.amd = {};

// 在浏览器中直接运行模块函数
function onBrowerExecuteScript(){
	
}