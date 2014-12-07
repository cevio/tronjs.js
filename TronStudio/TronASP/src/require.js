// Require Factory.
;(function(){
	
	var RequireParentResolve = function( p ){
		var parentNode = p.replace(modules.host, "");
		if ( /^\\/.test(parentNode) ){ parentNode = parentNode.replace(/^\\/, ""); };
		var parentArrays = parentNode.split("\\"),
			index = parentArrays.indexOf("..");
			
		if ( index > -1 ){
			index--;
			if ( index < 0 ){
				index = 0;
				parentArrays.splice(0, 1);
			}else{
				parentArrays.splice(index, 2);
			}
			return RequireParentResolve(modules.host + "\\" + parentArrays.join("\\"));
		}else{
			return modules.host + "\\" + parentArrays.join("\\");
		}
	}
	
	var RequireContrast = function(selector, dir){
		if ( /^\w:\\.+$/.test(selector) ){
			return selector;
		}
		
		selector = selector.replace(/\//g, '\\');
		var host = modules.host,
			base = modules.base,
			local = dir;

		if ( /^\\/.test(selector) ){ selector = host + selector; }
		else if( /^\.\\/.test(selector) ){ selector = local + "\\" + selector.replace(/^\.\\/, ""); }
		else if ( /^\.\.\\/.test(selector) ){ selector = RequireParentResolve(local + "\\" + selector); }
		else if ( /^\:/.test(selector) ){ selector = base + "\\" + selector.replace(/^\:/, "").replace(/^\\/, ""); }
		else{ selector = local + "\\" + selector.replace(/^\.\\/, ""); }

		return selector;
	}
	
	var RequireResolve = function( selector, dir ){
		var path = RequireContrast( selector, dir );
		if ( !/\.asp$/i.test(path) && !/\.js$/i.test(path) && !/\.json$/i.test(path) ){
			path += ".js";
		}
		return path;
	}
	
	var RequireModule = function(){
		this.__filename = null;
		this.__dirname = null;
		this.exports = function(){};
	};
	
	var proxy = function( fn, context ) {
		return function(){
			var args = arguments;
			return fn.apply(context, args);
		};
	};
	
	function syntax(content){
		if ( !content || content.length === 0 ){
			return '';
		};
		
		var percent = '%', 
			text = '';

		content.split('<' + percent).forEach(function( detail ){
			var blockEnd = detail.indexOf(percent + '>');
			if ( blockEnd > -1 ){
				var temp = textformat(detail.substring(blockEnd + 2));
				text += (/^\=/.test(detail) ? ";Response.Write(" + detail.substring(1, blockEnd) + ");" : detail.substring(0, blockEnd)) + temp;
			}else{
				text += textformat(detail);
			}
		});
		
		return text;
	}
	
	function textformat(t){
		if ( t.length > 0 ){
			return ";Response.Write(\"" + ReplaceBlock(t) + "\");";
		}else{
			return "";
		}
	}
	
	function ReplaceBlock(data){
		return data
				.replace(/\\/g, '\\\\')
				.replace(/\"/g, '\\"')
				.replace(/\r/g, '\\r')
				.replace(/\f/g, '\\f')
				.replace(/\n/g, '\\n')
				.replace(/\s/g, ' ')
				.replace(/\t/g, '\\t');
	}
	
	function createRequireModule( AbsoluteModulePath ){
		
		var RequireModuleConstructor = new RequireModule();
		RequireModuleConstructor.__filename = AbsoluteModulePath;
		RequireModuleConstructor.__dirname = RequireModuleConstructor.__filename.split('\\').slice(0, -1).join('\\');
		RequireModuleConstructor.contrast = function( selector ){ return RequireContrast(selector, this.__dirname); };		
		RequireModuleConstructor.resolve = function( selector ){ return RequireResolve(selector, this.__dirname); };			
		RequireModuleConstructor.include = function( selector, argcs ){ new Include(this.contrast(selector), argcs); };
		RequireModuleConstructor.require = function( selector ){
			if ( modules.maps[selector] && modules.maps[selector].length > 0 ){
				selector = modules.maps[selector];
			}else{
				selector = fs(modules.base + '\\tron_modules\\' + selector.replace(/\//g, '\\') + '\\index.js').exist().then(function(value){
					modules.maps[selector] = value;
				}).fail(function(value){ return selector }).value();
			}
			return new Require(this.resolve(selector)); 
		};
		
		return RequireModuleConstructor;
	}

// require 主模块
// author evio
// copyright http://webkits.cn
	var Require = new Class(function( AbsolutePath ){
		this.AbsoluteModulePath = AbsolutePath;
		this.ServerScriptContent = '';
		return this.compile();
	});

	Require.add('read', function(){
		var that = this;
		fs(this.AbsoluteModulePath).exist().read().then(function(ServerScriptContent){
			if ( /\.json/i.test(that.AbsoluteModulePath) ){
				that.ServerScriptContent = 'module.exports = ' + ServerScriptContent + ';';
			}
			else if (/\.asp/i.test(that.AbsoluteModulePath)){
				that.ServerScriptContent = syntax(that.ServerScriptContent);
			}
			else{
				that.ServerScriptContent = ServerScriptContent;
			}
		}).fail(function(){
			that.ServerScriptContent = '';
		});
	});
	
	Require.add('packageServerScriptContent', function(){
		var wrapper = [
			'return function (require, exports, module, include, __filename, __dirname, contrast, resolve){', 
			this.ServerScriptContent, 
			'};'
		].join("\n");
		
		return (new Function(wrapper))();
	});

	Require.add('compile', function(){
		if ( modules.exports[this.AbsoluteModulePath] ){
			return modules.exports[this.AbsoluteModulePath].exports;
		}else{
			// 读取文件内容
			this.read();
			// 打包模块原型
			var PackageModule = this.packageServerScriptContent();
			
			// 创建新的require对象模型
			var RequireModuleConstructor = createRequireModule(this.AbsoluteModulePath);
			
			// 编译这个模块
			PackageModule(
				proxy(RequireModuleConstructor.require, RequireModuleConstructor),
				RequireModuleConstructor.exports,
				RequireModuleConstructor,
				proxy(RequireModuleConstructor.include, RequireModuleConstructor),
				RequireModuleConstructor.__filename,
				RequireModuleConstructor.__dirname,
				proxy(RequireModuleConstructor.contrast, RequireModuleConstructor),
				proxy(RequireModuleConstructor.resolve, RequireModuleConstructor)
			);
			
			modules.exports[this.AbsoluteModulePath] = RequireModuleConstructor;
			
			return modules.exports[this.AbsoluteModulePath].exports;
		}
	});
	
// Include 主模块
// author evio
// copyright http://webkits.cn	
	var Include = new Class(function( AbsolutePath, AnyArguments ){
		this.AbsoluteModulePath = AbsolutePath;
		this.ServerScriptContent = '';
		this.ServerAnyArguments = AnyArguments || null;
		this.compile();
	});

	Include.add('read', function(){
		var that = this;
		
		 fs(this.AbsoluteModulePath)
		.exist()
		.then(function(value){ if ( /\.asp$/i.test(value) ){ this.resolve(); } else{ this.reject(); }; })
		.read()
		.then(function(ServerScriptContent){ that.ServerScriptContent = ServerScriptContent; })
		.fail(function(){ that.ServerScriptContent = ''; });
	});
	
	Include.add('compile', function(){
		this.read();
		var syntaxContent = syntax(this.ServerScriptContent);
		var allParams = [], 
			allParamsValue = [];
			
		if ( this.ServerAnyArguments ){
			for ( var i in this.ServerAnyArguments ){
				allParams.push(i);
				allParamsValue.push(this.ServerAnyArguments[i]);
			}
		}
		
		var argcs = ['require', 'include', '__filename', '__dirname', 'contrast', 'resolve'], 
			dirname = this.AbsoluteModulePath.split('\\').slice(0, -1).join('\\');
			
		var _contrast = function(selector){
			return RequireContrast(selector, dirname);
		}
		
		var _resolve = function( selector ){
			return RequireResolve(selector, dirname);
		};
		
		var _require = function(selector){
			return new Require(_resolve(selector));
		};
		
		var _filename = this.AbsoluteModulePath;
		var _dirname = dirname;
		
		var _include = function(selector, arcs){
			new Include(_contrast(selector), arcs);
		}
		
		allParams = allParams.concat(argcs);
		allParamsValue = allParamsValue.concat([_require, _include, _filename, __dirname, _contrast, _resolve])
		
		var wrapper = ['return function (' + allParams.join(', ') + ') { ', syntaxContent, '};'].join("\n"),
			__module = (new Function(wrapper))();

		__module.apply(this, allParamsValue);
	});
	
	(function(){
		var RequireModuleConstructor = createRequireModule(__filename);
		
		__filename 	= RequireModuleConstructor.__filename;
		__dirname 	= RequireModuleConstructor.__dirname;
		require 	= proxy(RequireModuleConstructor.require, RequireModuleConstructor);
		exports 	= RequireModuleConstructor.exports;
		module 		= RequireModuleConstructor;
		contrast 	= proxy(RequireModuleConstructor.contrast, RequireModuleConstructor);
		resolve 	= proxy(RequireModuleConstructor.resolve, RequireModuleConstructor);
		include 	= proxy(RequireModuleConstructor.include, RequireModuleConstructor);
		
	})();
	
})();