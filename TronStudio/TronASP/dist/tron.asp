<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<%
/*
 * @overview Global TronASP jScripts Loader - a tiny implementation of Promises/A+ and CommonJS contributors.
 * @copyright Copyright (c) 2014 evio studio and PJBlog5 project
 * @license   Licensed under MIT license
 *            See https://github.com/cevio/tronjs.js
 * @version   6.1.223
 */
Response.Buffer = true;
Server.ScriptTimeOut = 999;
Session.CodePage = 65001;
Session.LCID = 2052;
var __filename = Server.MapPath(Request.ServerVariables("SCRIPT_NAME")),
	__dirname = Server.MapPath("./"),
	require,						// 模块引用函数
	exports,						// 模块对外接口
	module,							// 模块对象
	contrast,						// 模块转换路径方法
	resolve,						// 模块转换路径模块的具体方法
	include;						// 模板加载方法

var Class, 							// 系统Class类定义
	console, 						// 系统调试输出类定义
	modules, 						// 系统模块类定义
	task, 							// 系统任务类定义
	fs, 							// 系统文件操作类定义
	date, 							// 系统日期类定义
	http, 							// 系统环境变量类定义
	ajax, 							// 系统请求类定义
	connect, 						// 系统数据库连接类定义
	dbo, 							// 系统数据库操作类定义
	sql, 							// 系统SQL语句生成类定义
	page, 							// 系统双TOP高效分页类定义
	cmd;							// 系统存储过程调用类定义
	
var JSON = function(){
	return JSON.stringify.apply(JSON, arguments);
};

var readVariableType = function( object, type ){
	if ( !type ){
		return Object.prototype.toString.call(object).toLowerCase();
	}else{
		return Object.prototype.toString.call(object).toLowerCase() === "[object " + type + "]"; 
	}
};

if ( ![].indexOf ){
	Array.prototype.indexOf = function( value ){
		var j = -1;
		for ( var i = 0 ; i < this.length ; i++ ){
			if ( value === this[i] ){
				j = i;
				break;
			}
		}
		return j;
	};
	Array.prototype.lastIndexOf = function( value ){
		var j = -1;
		for ( var i = this.length - 1 ; i > -1 ; i-- ){
			if ( value === this[i] ){
				j = i;
				break;
			}
		}
		return j;
	};
};

if ( ![].forEach ){
	Array.prototype.forEach = function( callback ){
		for ( var i = 0 ; i < this.length ; i++ ){
			if ( typeof callback === "function" ){
				callback.call(this, this[i], i);
			}
		}
	};
};

console = function(){
	console.log.apply(console, arguments);
}

console.log = function(){
	var argcs = Array.prototype.slice.call(arguments, 0);
	Response.Write(argcs.join(''));
}

console.json = function(){
	console.log(JSON(arguments[0]));
}

console.debug = function( logs ){
	if ( modules.debug ){
		if ( 
			typeof logs === 'string' || 
			readVariableType(logs, 'boolean') || 
			readVariableType(logs, 'number')) 
		{
			logs = logs;
		}
		else if ( readVariableType(logs, 'date') ){
			logs = date.format(logs, 'y-m-d h:i:s');
		}
		else if ( typeof logs === 'function' ) {
			logs = logs.toString();
		}
		else if (typeof logs === 'object') {
			if ( logs.atEnd ){
				logs = JSON.stringify(http.emit(logs));
			}
			else{
				try{
					var o = 0;
					for ( var i in logs ){
						o++;
					}
					if ( o >= 0 ){
						logs = JSON.stringify(logs);
					}
				}catch(e){
					try{
						logs = valueOf(logs) ? valueOf(logs) : typeof(logs);
					}catch(ex){
						logs = typeof(logs);
					}
				}
			}
		}
		else {
			try{
				logs = String(logs);
			}catch(e){
				logs = typeof(logs);
			}
		};
		
		var now = date.format(new Date(), 'y-m-d h:i:s'),
			content = '[' + now + ']:\r\n' + logs + '\r\n\r\n';
		fs(contrast('/debug.log')).write(content);
	}
};

// Class Factory.
;(function(){
	Class = function(){
		var ProtectMethods = ['__constructor__', 'initialize'],
			argc = arguments,
			that = this;
	
		var factory = function(){
			this.__constructor__ = 'ECM.CLASS.FACTORY';
			return typeof this.initialize === 'function' ? this.initialize.apply(this, arguments) : this;
		};
		
		this.constructor = factory;
		this.constructor.__constructor__ = this.__constructor__ = 'ECM.CLASS';
		
		this.constructor.extend = function( object ){
			if ( object.__constructor__ && object.__constructor__ === 'ECM.CLASS' ){
				if ( object.prototype ){
					for ( var i in object.prototype ){
						if ( ProtectMethods.indexOf(i) === -1 ){
							that.constructor.prototype[i] = object.prototype[i];
						}
					}
				}
			};
			
			return that.constructor;
		}
		
		this.constructor.toggle = function( objects ){
			if ( !objects ){ return that.constructor; };
			if ( readVariableType(objects) !== 'array' ){
				objects = [objects];
			};
			
			for ( var i = 0 ; i < objects.length ; i++ ){
				that.constructor.extend(objects[i]);
			}
			
			return that.constructor;
		}
		
		this.constructor.add = function(key, value){
			if ( !value ){
				for ( var i in key ){
					that.constructor.add(i, key[i]);
				}
			}else{
				that.constructor.prototype[key] = value;
			}
			
			return that.constructor;
		}
	
		if ( argc.length === 2 ){
			this.constructor.extend(argc[0]);
			this.constructor.add(argc[1]);
		}else if ( argc.length === 1 ){
			if ( argc[0] && argc[0].__constructor__ && argc[0].__constructor__ === 'ECM.CLASS' ){
				this.constructor.extend(argc[0]);
			}else{
				if ( typeof argc[0] === 'function' ){
					this.constructor.add('initialize', argc[0]);
				}else{
					this.constructor.add(argc[0]);
				}
			}
		}
		
		return this.constructor;
	};
})();
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
// Date Factory.
;(function(){
	date = date ? date : {};
	date.format = function( DateObject, type ){
		
		if ( Object.prototype.toString.call(DateObject).split(" ")[1].toLowerCase().replace("]", "") !== "date" ){
			DateObject = new Date(DateObject);
		}
		
		var date = DateObject,
			year = (date.getFullYear()).toString(),
			_month = date.getMonth(),
			month = (_month + 1).toString(),
			day = (date.getDate()).toString(),
			hour = (date.getHours()).toString(),
			miniter = (date.getMinutes()).toString(),
			second = (date.getSeconds()).toString(),
			_day, _year;
			
		var dateArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];	
		
		month = month.length === 1 ? "0" + month : month;
		_day = day;
		day = day.length === 1 ? "0" + day : day;
		hour = hour.length === 1 ? "0" + hour : hour;
		miniter = miniter.length === 1 ? "0" + miniter : miniter;
		second = second.length === 1 ? "0" + second : second;
			
		return type.replace(/y/g, year)
				.replace(/m/g, month)
				.replace(/d/g, day)
				.replace(/h/g, hour)
				.replace(/i/g, miniter)
				.replace(/s/g, second)
				.replace(/D/g, _day)
				.replace(/M/g, dateArray[_month]);
				
	}
})();
// Task Factory.
;(function(){
	task = new Class();
	task.add('value', function(value){
		if ( value ){
			this._value = value;
			return this;
		}else{
			return this._value;
		}
	});
	task.add('_value', null);
	task.add('status', true);
	task.add('then', function( callback ){
		if ( this.status && !this._stop ){
			if ( typeof callback === 'function' ){
				var value = callback.call(this, this._value);
				if ( value ){
					this._value = value;
				}
			}
		}
		
		return this;
	});
	task.add('fail', function( callback ){
		if ( !this.status && !this._stop ){
			if ( typeof callback === 'function' ){
				var value = callback.call(this, this._value);
				if ( value ){
					this._value = value;
				}
			}
		}
		
		return this;
	});
	task.add('resolve', function(){
		this.status = true;
		return this;
	});
	task.add('reject', function(){
		this.status = false;
		return this;
	});
	task.add('stop', function(){
		this._stop = true;
		return this;
	});
	task.add('change', function(path, type){
		this.contexts.path = path && path.length > 0 ? path : this.contexts.path;
		this.contexts.type = type === undefined || type === null ? this.contexts.type : type;
	});
})();
// FSO Factory.
;(function(){
	var object = new ActiveXObject("Scripting.FileSystemObject");
	var fso = new Class(function(AbsoluteFilePath, fileType){
		this.contexts = {
			path: AbsoluteFilePath,
			type: !!fileType
		}
		this.object = object;
	});
	
	fso.add('exist', function(){
		return this.then(function(){
			var status = this.contexts.type ? object.FolderExists(this.contexts.path) : object.FileExists(this.contexts.path);
			if ( status ){
				this.resolve();
			}else{
				this.reject();
			}
		});
	});
	
	fso.add('unExist', function(){
		return this.then(function(){
			var status = this.contexts.type ? object.FolderExists(this.contexts.path) : object.FileExists(this.contexts.path);
			if ( status ){
				this.reject();
			}else{
				this.resolve();
			}
		});
	});
	
	fso.add('create', function( content ){
		return this.then(function(){	
			if ( this.contexts.type ){
				object.CreateFolder(this.contexts.path);
				if ( object.FolderExists(this.contexts.path) ){
					this.resolve();
				}else{
					this.reject();
				}
			}else{
				var stream = new ActiveXObject("Adodb.Stream");
					stream.Type = 2; 
					stream.Mode = 3; 
					stream.Open();
					stream.Charset = modules.charset;
					stream.Position = stream.Size; 
					stream.WriteText = content;
					stream.SaveToFile(this.contexts.path, 2);
					stream.Close();
					
				if ( object.FileExists(this.contexts.path) ){
					this.resolve();
				}else{
					this.reject();
				}
			}
		});
	});
	
	fso.add('write', function( content ){
		return this.then(function(){
			try{
				var fw = object.OpenTextFile(this.contexts.path, 8, true);
					fw.WriteLine(content);		
					fw.Close();
				this.resolve();
			}catch(e){ this.reject(); };
		});
	});
	
	fso.add('getDir', function(){
		return this.then(function(){
			this.resolve();
			if ( this.contexts.type ){
				return this.contexts.path.replace(/\\$/, '');
			}else{
				if ( /^\w:\\.+$/.test(this.contexts.path) ){
					return this.contexts.path.split('\\').slice(0, -1).join('\\');
				}else{
					return this.contexts.path.split('/').slice(0, -1).join('/');
				}
			}
		});
	});
	
	fso.add('autoCreate', function(content){
		return this.then(function(){
			var value = this.value(), folder = '';
			
			if ( this.contexts.type ){
				folder = this.contexts.path;
			}else{
				this.getDir();
				folder = this.value();
			};
			
			folder = folder.replace(/\\$/, '');
			
			var root = Server.MapPath('/'),
				path = folder.replace(root, ''),
				arrs = path.replace(/^\\/, '').split('\\');
				
			for ( var i = 0 ; i < arrs.length ; i++ ){
				root += '\\' + arrs[i];
				if ( !object.FolderExists(root) ){
					object.CreateFolder(root);
				}
			}
			
			this.value(value);
			if ( !this.contexts.type ){
				this.create(content);
			}else{
				this.exist();
			}
		});
	});
	
	fso.add('dirs', function(callback){
		var that = this;
		return this.then(function(){
			if ( this.contexts.type ){
				var emiot = object.GetFolder(this.contexts.path),
					dirEmiot = emiot.SubFolders,
					dirEmiots = new Enumerator(dirEmiot),
					names = [];
				
				for (; !dirEmiots.atEnd(); dirEmiots.moveNext()) {
					var name = dirEmiots.item().Name;
					if ( typeof callback === 'function' ){
						name = callback.call(this, name, dirEmiots.item()) || name;
					};
					names.push(name);
				}
				
				this.value(names);
				this.resolve();
				
			}else{
				this.reject();
			}
		});
	});
	
	fso.add('files', function(callback){
		return this.then(function(){
			if ( this.contexts.type ){
				var emiot = object.GetFolder(this.contexts.path),
					dirEmiot = emiot.Files,
					dirEmiots = new Enumerator(dirEmiot),
					names = [];
				
				for (; !dirEmiots.atEnd(); dirEmiots.moveNext()) {
					var name = dirEmiots.item().Name;
					if ( typeof callback === 'function' ){
						name = callback.call(this, name, dirEmiots.item()) || name;
					};
					names.push(name);
				}
				
				this.value(names);
				this.resolve();
				
			}else{
				this.reject();
			}
		});
	});
	
	fso.add('remove', function(){
		return this.then(function(){
			if ( this.contexts.type ){
				object.DeleteFolder(this.contexts.path);
			}else{
				object.DeleteFile(this.contexts.path);
			};
			this.unExist();
		});
	});
	
	fso.add('move', function(targetAbsolutePath){
		return this.then(function(){
			if ( !this.contexts.type ){
				object.MoveFile(this.context.path, targetAbsolutePath);
			}else{
				object.MoveFolder(this.context.path, targetAbsolutePath);
			}
			this.unExist().then(function(){
				this.change(targetAbsolutePath).exist();
			});
		});
	});
	
	fso.add('copy', function(targetAbsolutePath){
		return this.then(function(){
			if ( !this.contexts.type ){
				object.CopyFile(this.context.path, targetAbsolutePath);
			}else{
				object.CopyFolder(this.context.path, targetAbsolutePath);
			}
			this.exist().then(function(){
				this.change(targetAbsolutePath).exist();
			});
		});
	});
	
	fso.add('reName', function( name ){
		return this.then(function(){
			if ( !this.contexts.type ){
				object.GetFile(this.context.path).Name = name;
			}else{
				object.GetFolder(this.context.path).Name = name;
			}
			
			var targetAbsolutePath = this.getDir().value() + '\\' + name;
			
			this.unExist().then(function(){
				this.change(targetAbsolutePath).exist();
			});
		});
	});
	
	fso.add('read', function(){
		return this.then(function(){
			if ( this.contexts.type ){
				this.reject();
			}else{
				try{
					var stream = new ActiveXObject("Adodb.Stream"),
						text;
				
						stream.Type = 2; 
						stream.Mode = 3; 
						stream.Open();
						stream.Charset = modules.charset;
						stream.Position = stream.Size;
						stream.LoadFromFile(this.contexts.path);
						text = stream.ReadText;
						stream.Close();
					
					this.resolve();
					stream = null;
					return text;
				}catch(e){
					this.reject();
					return '';
				}
			}
		});
	});
	
	fso.add('readBinary', function(){
		return this.then(function(){
			if ( this.contexts.type ){
				this.reject();
			}else{
				var stream = new ActiveXObject("Adodb.Stream"),
					ret;
					
					stream.Type = 1;
					stream.Open();
					stream.LoadFromFile(this.contexts.path);
					ret = stream.Read(-1);
					stream.Close();
				
				this.resolve();	
				stream = null;
				return ret;
			}
		});
	});
	
	fso.add('saveBinary', function(AbsolutePath){
		return this.then(function(){
			if ( this.contexts.type ){
				this.reject();
			}else{
				var stream = new ActiveXObject("Adodb.Stream");
					
					stream.Type = 1;
					stream.Open();
					stream.Write(this._value);
					stream.Position = 0;
					stream.SaveToFile(AbsolutePath ? AbsolutePath : this.contexts.path, 2);
					stream.Close();
				
				if ( AbsolutePath ){
					if ( object.FileExists(AbsolutePath) ){
						this.resolve();
					}else{
						this.reject();
					}
				}else{
					if ( object.FileExists(this.contexts.path) ){
						this.resolve();
					}else{
						this.reject();
					}
				}
				
				stream = null;
			}
		});
	});

	fso.extend(task);
	
	fs = function(AbsoluteFilePath, fileType){
		return new fso(AbsoluteFilePath, fileType).value(AbsoluteFilePath);
	}
	
})();
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
		].join(" ");
		
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
;(function(){
	var Http = new Class(function(){
		this.req = {};
	});
	
	Http.add('createServer', function( callback, filterCallback ){
		var service = { query: {}, form: {} },
			queryEmtor = emit(Request.QueryString),
			formEmtor = emit(Request.Form),
			value,
			ret;
	
		for ( i = 0 ; i < queryEmtor.length ; i++ ){
			value = emit(Request.QueryString(queryEmtor[i]), filterCallback);
			service.query[queryEmtor[i]] = (value.length === 1 ? value[0] : (value.length === 0 ? '' : value));
		}
	
		for ( i = 0 ; i < formEmtor.length ; i++ ){
			value = emit(Request.Form(formEmtor[i]), filterCallback);
			service.form[formEmtor[i]] = (value.length === 1 ? value[0] : (value.length === 0 ? '' : value));
		}
	
		if ( typeof callback === "function" ) {
			ret = callback.call( this, service );	
		}
		
		this.req = service;
		
		return ret ? ret : service;
	});
	
	Http.add('query', function(params, callback){
		var queryEmtor = emit(Request.QueryString(params), callback);
		if ( queryEmtor.length === 0 ){
			return;
		}
		return queryEmtor.length === 1 ? queryEmtor[0] : (queryEmtor.length === 0 ? '' : queryEmtor);
	});
	
	Http.add('form', function(params, callback){
		var formEmtor = emit(Request.Form(params), callback);
		if ( formEmtor.length === 0 ){
			return;
		}
		return formEmtor.length === 1 ? formEmtor[0] : (formEmtor.length === 0 ? '' : formEmtor);
	});
	
	function emit( object, callback ){
		var _object = new Enumerator(object),
			_ret = [];
	
		for (; !_object.atEnd() ; _object.moveNext() ) {
			if ( typeof callback === "function" ){
				var d = callback(_object.item());
				if ( d ){
					_ret.push(d);
				}
			}else{
				_ret.push(_object.item());
			}
		}
	
		return _ret;
	};
	
	Http.add('emit', emit);
	
	var Ajax = new Class(function(){
		this.object = new ActiveXObject("Microsoft.XMLHTTP");
	});
	
	Ajax.add('bin', function(text){
		var obj = new ActiveXObject("Adodb.Stream"), 
			ret;
			obj.Type = 1;
			obj.Mode = 3;
			obj.Open;
			obj.Write(text);
			obj.Position = 0;
			obj.Type = 2;
			if ( modules.charset ) { obj.Charset = modules.charset; };
			ret = obj.ReadText;
			obj.Close;
	
		return ret;
	});
	
	Ajax.add('param', function(keyCode){
		if ( !keyCode || keyCode === null || keyCode === false || keyCode === undefined ){
			return null;
		};
		
		if ( typeof keyCode === "object" ){
			var ret = [], i;
	
			for ( i in keyCode ){
				ret.push(i + "=" + keyCode[i]);
			}
	
			return ret.join("&");
		}else{
			return keyCode;
		}
	});
	
	Ajax.add('save', function( content, file ){
		var object = new ActiveXObject("Adodb.Stream");
			object.Type = 1; 
			object.Mode = 3; 
			object.Open();
			object.Position = 0;
			object.Write(content);
			object.SaveToFile(file, 2);
			object.Close();
			object = null;
	});
	
	Ajax.add('send', function( options ){
		var that = this, rets;
		if ( !options.method ){ options.method = 'get'; };
		if ( /^get$/i.test(options.method) && options.data ){
			var p = this.param(options.data);
			if ( p !== null && options.url.indexOf('?') > -1 ){ options.url += "&" + p; }else{ options.url += "?" + p; };
			options.data = null; 
		};
		
		this.object.open(options.method.toUpperCase(), options.url, false);
		if ( options.method.toUpperCase() === 'POST' ){
			this.object.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		};
		this.object.onreadystatechange = function() {
			if (that.object.readyState === 4) {
				if (that.object.status === 200){
					if ( typeof options.success === 'function' ){
						rets = options.success.call(that, that.object);
					};
				}
			}
		};
		this.object.send(this.param(options.data));
		
		if ( rets ){
			return rets;
		}else{
			return this;
		}
	});
	
	Ajax.add('get', function(url, data, callback){
		return this.send({
			url: url,
			data: data,
			success: function( object ){
				var rets = this.bin(object.responseBody);
				if ( typeof callback === 'function' ){
					rets = callback.call(this, rets, object);
				};
				return rets;
			}
		});
	});
	
	Ajax.add('post', function( url, data, callback ){
		return this.send({
			url: url,
			data: data,
			success: function( object ){
				var rets = this.bin(object.responseBody);
				if ( typeof callback === 'function' ){
					rets = callback.call(this, rets, object);
				};
				return rets;
			},
			method: 'post'
		});
	});
	
	Ajax.add('getBinary', function( url, data, callback ){
		return this.send({
			url: url,
			data: data,
			success: function( object ){
				var rets = object.responseBody;
				if ( typeof callback === 'function' ){
					rets = callback.call(this, rets, object);
				};
				return rets;
			}
		});
	});
	
	Ajax.add('getJSON', function(url, data){
		return this.get(url, data, function( code ){
			return JSON.parse(code);
		});
	});
	
	Ajax.add('postJSON', function(url, data){
		return this.post(url, data, function( code ){
			return JSON.parse(code);
		});
	});
	
	Ajax.add('SaveFile', function( url, data, file ){
		if ( !file ){ file = data; data = {}; };
		this.getBinary(url, data, function( rets ){ this.save(rets, file); });
	});
	
	http = new Http();
	ajax = Ajax;
})();;
;(function(){
	var AC = 'ADODB.CONNECTION';
	
	/*
	 * 数据库连接类
	 * 返回数据库连接对象
	 */
	connect = new Class(function( type, options ){
		this.object = new ActiveXObject( AC );
		this.connectString = [];
		
		if ( type === 'access' ){ this.Access(options); }
		else if ( type === 'mssql' ){ this.MsSql(options); }
		
		for ( var i = 0 ; i < this.connectString.length; i++ ){
			try{
				this.object.Open(this.connectString[i]);
				break;
			}catch(e){}
		};
		
		return this.object;
	});
	
	connect.add('Access', function( AccessPath ){
		this.connectString = [
			'provider=Microsoft.jet.oledb.4.0;data source=' + AccessPath,
			'driver={microsoft access driver (*.mdb)};dbq=' + AccessPath
		];
	});
	
	connect.add('MsSql', function( settings ){
		var connections = [];
		
		connections.push([
			"Provider=sqloledb",
			"Data Source=" + 		settings.netserver,
			"Initial Catalog=" + 	settings.access,
			"User Id=" + 			settings.username,
			"Password=" + 			settings.password,
			""
		].join(";"));
		
		connections.push([
			"Driver={SQL Server}",
			"Server=" + 			settings.netserver,
			"Database=" + 			settings.access,
			"Uid=" + 				settings.username,
			"Pwd=" + 				settings.password,
			""
		].join(";"));
		
		this.connectString = connections;
	});

	var AR = 'ADODB.RECORDSET';
	
	dbo = new Class(function( table, conn ){
		
		this.tables = table;						// 表名
		this.conn = conn;							// 数据库连接对象
		this.object = new ActiveXObject( AR );		// RECORDSET对象
		this.fields = [];							// 字段名集合
		this.length = 0;							// 字段名个数
		this.status = false;
		this.resetSQL();							// 初始化SQL
		this.table(table);
	});
	
	dbo.add('getFields', function(){
		this.object.Open( 'SELECT TOP 0 * FROM ' + this.tables, this.conn, 1, 1 );
		for ( var i = 0 ; i < this.object.fields.count; i++ ){
			this.fields.push(this.object.fields(i).name);
		}
		this.length = this.fields.length;
		this.object.Close();
		return this;
	});
	
	dbo.add('create', function(){
		if ( !this.status ){
			this.selectAll();
			this.open(2);
		};
		this.object.AddNew();
		return this;
	});
	
	dbo.add('set', function( params, value ){
		if ( !value && typeof params === 'object' ){
			for ( var i in params ){
				this.object(i) = params[i];
			}
		}else{
			this.object(params) = value;
		}
		
		return this;
	});
	
	dbo.add('save', function(){
		this.object.Update();
		return this;
	});
	
	dbo.add('remove', function(){
		this.object.Delete();
		return this;
	});
	
	dbo.add('where', function( str ){
		this.sql.where = str;
		return this;
	});
	
	dbo.add('open', function(mode){
		if ( this.status ){ return this; };
		this.gruntSQL();
		this.object.Open(this.sql.text, this.conn, 1, mode ? mode : 1);
		this.status = true;
		return this;
	});
	
	dbo.add('toJSON', function(){
		var keep = [];
		this.open().each(function(object){
			var json = {};
			for ( var i = 0; i < object.fields.count ; i++ ) {
				json[object.fields(i).name] = object.fields(i).value;
			}
			keep.push(json);
		}).close();
		
		return keep;
	});
	
	dbo.add('close', function(){
		try{
			this.object.Close();
			this.status = false;
		}catch(e){}
		
		return this;
	});
	
	dbo.add('exec', function(resolve, reject){
		if ( !reject && readVariableType(resolve, 'string') ){
			this.conn.Execute(resolve);
		}
		else if ( !resolve ){
			this.gruntSQL();
			this.conn.Execute(this.sql.text);
		}
		else{
			if ( !this.object.Bof && !this.object.Eof ){
				typeof resolve === 'function' && resolve.call(this, this.object);
			}else{
				typeof reject === 'function' && reject.call(this, this.object);
			}
		}
		
		return this;
	});
	
	dbo.add('find', function( callback, mode ){
		this.open(mode).exec(function( object ){
			callback.call(this, this.object);
		});
		this.object.Close();
		
		return this;
	});
	
	dbo.add('each', function( callback ){
		return this.exec(function(object){
			var i = 0;
			object.MoveFirst();
		
			while ( !object.Eof )
			{
				typeof callback === "function" && callback.call(this, object, i);
				object.MoveNext();
				i++;
			}
		});
	});
	
	dbo.add('rows', function(){
		try{ 
			var tempArr = this.object.GetRows().toArray(); 
			return getRows( tempArr, this.object.Fields.Count );
		}catch(e){
			return [];
		}
	});

/*
 *	SQL 语句生成类
 *	evio
 */	
	sql = new Class();
	
	sql.add('resetSQL', function(){
		var table = '';
		if ( this.sql ){
			table = this.sql.tableText;
		}
		this.sql = {};
		this.sql.where = [];
		this.sql.whereText = '';
		this.sql.table = '';
		this.sql.tableText = '';
		if ( table && table.length > 0 && table.toLowerCase() !== 'undefined' ){
			this.table(table);
		};
		return this;
	});
	
	sql.add('top', function( number ){
		if ( number && !isNaN(number) ){
			this.sql.top = number;
		}
		
		return this;
	});
	
	sql.add('selectAll', function(){
		this.sql.selectors = ['*'];
		return this;
	});
	
	sql.add('select', function(){
		if ( !this.sql.selectors ){
			this.sql.selectors = [];
		}
		var params = Array.prototype.slice.call(arguments, 0);
		this.sql.selectors = unique(this.sql.selectors.concat(params));
		return this;
	});
	
	sql.add('where', function( str ){
		this.sql.whereText = str;
		return this;
	});
	
	sql.add('table', function( str ){
		if ( typeof str === 'function' ){
			var _sql = new Class();
				_sql.extend(sql);
				
			var sqls = new _sql();
				sqls.resetSQL();

			str.call(sqls, this.sql.tableText);
			
			sqls.gruntSQL();

			this.sql.tableText = sqls.sql.text;
		}else{
			this.sql.tableText = str;
		}
		return this;
	});
	
	sql.add('as', function(name){
		this.sql.as = name;
		return this;
	});
	
	sql.add('and', function(key, value, compare){
		this.sql.where.push({
			key: key,
			value: value,
			compare: compare,
			toggle: 'AND'
		});
		
		return this;
	});
	
	sql.add('or', function( key, value, compare ){
		this.sql.where.push({
			key: key,
			value: value,
			compare: compare,
			toggle: 'OR'
		});
		
		return this;
	});
	
	sql.add('ands', function(callback){
		var _sql = new Class();
			_sql.extend(sql);
			
		var sqls = new _sql();
			sqls.resetSQL();
			sqls.sql.targetTable = this.sql.table;
			sqls.sql.targetAs = this.sql.as;
		
		if ( typeof callback === 'function' ){
			callback.call(sqls, this.sql.table);
		}
		
		sqls.gruntSQL();
		
		var sqlText = sqls.sql.text;

		this.sql.where.push({
			text: '(' + sqlText + ')',
			toggle: 'AND'
		});
		
		return this;
	});
	
	sql.add('ors', function(callback){
		var _sql = new Class();
			_sql.extend(sql);
			
		var sqls = new _sql();
			sqls.resetSQL();
			sqls.sql.targetTable = this.sql.table;
			sqls.sql.targetAs = this.sql.as;
		
		if ( typeof callback === 'function' ){
			callback.call(sqls, this.sql.table);
		}
		
		sqls.gruntSQL();
		
		var sqlText = sqls.sql.text;
		
		this.sql.where.push({
			text: '(' + sqlText + ')',
			toggle: 'OR'
		});
		
		return this;
	});
	
	sql.add('asc', function( params ){
		if ( !this.sql.order || this.sql.order.length === 0 ){
			this.sql.order = [];
		};
		
		this.sql.order.push({
			param: params,
			type: 'ASC'
		});
		
		return this;
	});
	
	sql.add('desc', function( params ){
		if ( !this.sql.order || this.sql.order.length === 0 ){
			this.sql.order = [];
		};
		
		this.sql.order.push({
			param: params,
			type: 'DESC'
		});
		
		return this;
	});
	
	sql.add('toggleParams', function(params, type){
		var _ = [], that = this;
		params.forEach(function(o){
			if ( type === 'selector' ){
				if ( o === '*' || /count\([^\)]*?\)/i.test(o) ){
					_.push(o);
				}else{
					if ( that.sql.as && that.sql.as.length > 0 ){
						_.push(that.sql.as + '.[' + o + ']');
					}else{
						_.push('[' + o + ']');
					}
				}
			}
		});
		return _;
	});

	sql.add('toggleWhere', function(made){
		var keepWhere = [], that = this;
		this.sql.where.forEach(function(o, i){
			if ( o.text && o.text.length > 0 ){
				if ( i === 0 ){
					keepWhere.push(o.text);
				}else{
					keepWhere.push(o.toggle + ' ' + o.text);
				};
			}else{
				//console.log(o.key, o.value, o.compare, made, '<br />')
				var p = that.GruntKeyValue(o.key, o.value, o.compare, made);
				if ( i === 0 ){
					keepWhere.push(p);
				}else{
					keepWhere.push(o.toggle + ' ' + p);
				}
			}
		});
		this.sql.whereText = keepWhere.join(' ');
	});
	
	sql.add('gruntSQL', function(){
		var toggleSQLText = [], that = this;
		
		if ( this.sql.tableText && this.sql.tableText.length > 0 && this.sql.selectors && this.sql.selectors.length > 0 ){
			toggleSQLText.push('SELECT');
			
			// 设定TOP参数
			if ( this.sql.top && this.sql.top > 0 ){
				toggleSQLText.push('TOP ' + this.sql.top);
			};
			
			// 设定选择范围
			if ( this.sql.selectors && this.sql.selectors.length > 0 ){
				toggleSQLText.push(this.toggleParams(this.sql.selectors, 'selector').join(','));
			};
			
			// 设定表名
			if ( this.sql.tableText.split(' ').length > 1 ){
				toggleSQLText.push('FROM (' + this.sql.tableText + ')' + ( this.sql.as && this.sql.as.length > 0 ? ' AS ' + this.sql.as : '' ));
			}else{
				toggleSQLText.push('FROM [' + this.sql.tableText + ']' + ( this.sql.as && this.sql.as.length > 0 ? ' AS ' + this.sql.as : '' ));
			}

			// 设定条件
			if ( this.sql.where.length > 0 && this.sql.whereText.length === 0 ){
				toggleSQLText.push('WHERE');
				this.toggleWhere();
				toggleSQLText.push(this.sql.whereText);
			}else{
				if ( this.sql.whereText.length > 0 ){
					toggleSQLText.push('WHERE');
					toggleSQLText.push(this.sql.whereText);
				}
			}
			
			// 设定排序
			if ( this.sql.order && this.sql.order.length > 0 ){
				toggleSQLText.push('ORDER BY');
				var ods = [];
				this.sql.order.forEach(function(o){
					if ( that.sql.as && that.sql.as.length > 0 ){
						ods.push(that.sql.as + '.[' + o.param + '] ' + o.type);
					}else{
						ods.push('[' + o.param + '] ' + o.type);
					}
				});
				toggleSQLText.push(ods.join(','));
			};
		}else{
			if ( this.sql.where.length > 0 && this.sql.whereText.length === 0 ){
				this.toggleWhere(true);
				toggleSQLText.push(this.sql.whereText);
			}else{
				if ( this.sql.whereText.length > 0 ){
					toggleSQLText.push(this.sql.whereText);
				}
			}
		}
	
		this.sql.text = toggleSQLText.join(' ');
		return this;
	});
	
	sql.add('GruntKeyValue', function(key, value, compare, made){
		if ( !compare ){ compare = '='; }
		compare = compare.toLowerCase();
		var ret = '';
		if ( compare === 'in' ){
			if ( !readVariableType(value, 'array') ){
				value = [value];
			};
			var inArray = [];
			for ( var i = 0 ; i < value.length ; i++ ){
				if ( readVariableType(value[i], 'string') ){
					inArray.push("'" + value[i] + "'");
				}
				else if ( readVariableType(value[i], 'date') ){
					inArray.push("'" + date.format(value[i], 'y/m/d h:i:s') + "'");
				}
				else{
					inArray.push(value[i]);
				}
			};

			if ( this.sql.as && this.sql.as.length > 0 ){
				ret = this.sql.as + '.[' + key + ']' + ' IN ' + '(' + inArray.join(',') + ')';
			}else{
				if ( made && this.sql.targetAs ){
					ret = this.sql.targetAs + '.[' + key + '] IN ' + '(' + inArray.join(',') + ')';
				}else{
					ret = '[' + key + '] IN ' + '(' + inArray.join(',') + ')';
				}
			}
		}
		else{
			if ( readVariableType(value, 'string') ){
				value = "'" + value + "'";
			}
			else if ( readVariableType(value, 'date') ){
				value = "'" + date.format(value, 'y/m/d h:i:s') + "'";
			}

			if ( this.sql.as && this.sql.as.length > 0 ){
				ret = this.sql.as + '.[' + key + ']' + compare + value;
			}else{
				if ( made && this.sql.targetAs ){
					ret = this.sql.targetAs + '.[' + key + ']' + compare + value;
				}else{
					ret = '[' + key + ']' + compare + value;
				}
			}
		}
		
		return ret;
	});

/*
 * 双TOP分页类
 */
	page = new Class(function(table, conn){
		this.sql = {};
		this.object = new ActiveXObject( 'ADODB.RECORDSET' );
		this.conn = conn;
		this.resetSQL();
		this.table(table);
		this.status = true;
		this.pages = {};
	});
	
	page.add('size', function( i ){
		this.pages.size = i;
		return this;
	});
	
	page.add('index', function( i ){
		this.pages.index = i;
		return this;
	});
	
	page.add('parse', function(options){
		var that = this;
		
		var wheres = function(options, self){
			if ( options.where && options.where.length > 0 ){
				options.where.forEach(function(o){
					var type = o[0],
						args = o.slice(1);
					
					self[type] && self[type].apply(self, args);
				});
			};
		};
		
		var orders = function(options, i, self){
			options.order.forEach(function(o){
				var type = o[0],
					id = o[1];
					
				if ( i === 0 ){
					type = type;
				}else{
					if ( type === 'asc' ){
						type = 'desc';
					}else{
						type = 'asc';
					}
				}
				
				self[type] && self[type](id);
			});
		}
		
		this.select('count(*)');
		wheres(options, that);
		this.gruntSQL();
		var total = this.conn.Execute(this.sql.text)(0).value;
		
		if ( total === 0 ){
			this.status = false;
			return this;
		}
		
		this.pages.total = total;
		this.pages.pageCount = Math.ceil(this.pages.total / this.pages.size);
		
		if ( this.pages.index > this.pages.pageCount ){
			this.pages.index = this.pages.pageCount;
		}
		
		this.resetSQL(); // 重置SQL语句
		
		wheres(options, that);

		if ( this.pages.index === 1 ){
			orders(options, 0, this);
			this.top(this.pages.size).select.apply(this, options.selectors).gruntSQL();	
		}
		
		else if ( this.pages.index === this.pages.pageCount ){			
			orders(options, 0, this);
			this.top(that.pages.size).selectAll().table(function(table){
				wheres(options, this);
				orders(options, 1, this);
				this.top( that.pages.total - that.pages.size * (that.pages.index - 1) ).select.apply(this, options.selectors).table(table);
			}).as('A').gruntSQL();
		}
		
		else if ( this.pages.index < (this.pages.pageCount / 2 + this.pages.pageCount % 2) ){
			orders(options, 0, this);
			this.selectAll().table(function(table){
				orders(options, 1, this);
				this.top(that.pages.size).table(function(){
					wheres(options, this);
					orders(options, 0, this);
					this.top(that.pages.size * that.pages.index).select.apply(this, options.selectors).table(table)
				}).as('A').selectAll();
			}).as('B').gruntSQL();
		}
		else {
			orders(options, 0, this);
			this.top(that.pages.size).selectAll().table(function(table){
				wheres(options, this);
				orders(options, 1, this);
				this.top( (that.pages.total % that.pages.size) + that.pages.size * (that.pages.pageCount - that.pages.index + 1) ).select.apply(this, options.selectors).table(table);
			}).as('A').gruntSQL();
		}
	});

	page.add('open', function( mode ){
		this.object.Open(this.sql.text, this.conn, 1, mode ? mode : 1);
		return this;
	});
	
	page.add('exec', function(resolve, reject){
		if ( !this.object.Bof && !this.object.Eof ){
			typeof resolve === 'function' && resolve.call(this, this.object);
		}else{
			typeof reject === 'function' && reject.call(this, this.object);
		}
		
		return this;
	});
	
	page.add('each', function( callback ){
		return this.exec(function(object){
			var i = 0;
			object.MoveFirst();
		
			while ( !object.Eof )
			{
				typeof callback === "function" && callback.call(this, object, i);
				object.MoveNext();
				i++;
			}
		});
	});
	
	page.add('toJSON', function(){
		var keep = [];
		this.open().each(function(object){
			var json = {};
			for ( var i = 0; i < object.fields.count ; i++ ) {
				json[object.fields(i).name] = object.fields(i).value;
			}
			keep.push(json);
		}).close();
		
		return keep;
	});
	
	page.add('close', function(){
		try{
			this.object.Close();
		}catch(e){}
		
		return this;
	});
	
	page.extend(sql);
	
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
	
	function proxy( fn, context ) {
		return function(){
			var args = arguments;
			return fn.apply(context, args);
		};
	};
	
	function getRows( arr, fieldslen ){
		var len = arr.length / fieldslen, data=[], sp; 
	
		for( var i = 0; i < len ; i++ ) { 
			data[i] = new Array(); 
			sp = i * fieldslen; 
			for( var j = 0 ; j < fieldslen ; j++ ) { data[i][j] = arr[sp + j] ; } 
		}
	
		return data; 
	}
	
	dbo.extend(sql);
})();
// Command Factory.
/*
 * 调用方法实例：
var c = new cmd('P_viewPage', connects);
var z = c
		.addInputVarchar('@TableName', 'evio')
		.addInputVarchar('@FieldList', '*')
		.addInputVarchar('@PrimaryKey', 'id')
		.addInputVarchar('@Where', 'id>10')
		.addInputVarchar('@Order', 'id asc')
		.addInputInt('@SortType', 1)
		.addInputInt('@RecorderCount', 0)
		.addInputInt('@PageSize', 10)
		.addInputInt('@PageIndex', 2)
		.addOutputInt('@TotalCount')
		.addOutputInt('@TotalPageCount')
		.exec().toJSON();
		
console.log(c.get('@TotalCount'))
console.json(z);
*/;(function(){
	cmd = new Class(function( CommandName, conn ){
		this.command = CommandName;
		this.conn = conn;
		this.object = new ActiveXObject("Adodb.Command");
		this.object.ActiveConnection = this.conn;
		this.object.CommandType = cmd.CommandType.STOREDPROC;
		this.object.Prepared = true;
		this.params = {};
		this.rcd = null;
		this.geted = false;
	});
	
	// 方法
	cmd.add('addParm', function( name, value, direction ){
		this.parms_[name] = this.object.CreateParameter(name);
		this.parms_[name].Value = value || null;
		this.parms_[name].Direction = direction || 1;
		return this;
	});
	
	cmd.add('addInput', function( name, value, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.INPUT, size, value);
		return this;
	});
	
	cmd.add('addInputInt', function( name, value ){
		this.addInput(name, value, cmd.DataType.DBTYPE_I4, 4);
		return this;
	});
	
	cmd.add('addInputBigInt', function( name, value ){
		this.addInput(name, value, cmd.DataType.DBTYPE_I8, 8);
		return this;
	});
	
	cmd.add('addInputVarchar', function( name, value, size ){
		this.addInput(name, value, cmd.DataType.VARCHAR, size||50);
		return this;
	});
	
	cmd.add('addOutput', function( name, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.OUTPUT, size);
		return this;
	});
	
	cmd.add('addOutputInt', function( name ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.DBTYPE_I4, cmd.ParameterDirection.OUTPUT, 4);
		return this;
	});
	
	cmd.add('addOutputBigInt', function( name ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.DBTYPE_I8, cmd.ParameterDirection.OUTPUT, 8);
		return this;
	});
	
	cmd.add('addOutputVarchar', function( name, size ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.VARCHAR, cmd.ParameterDirection.OUTPUT, size||50);
		return this;
	});
	
	cmd.add('addReturn', function( name, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.RETURNVALUE, size);
		return this;
	});
	
	cmd.add('exec', function(){
		this.object.CommandText = this.command;
		
		for( var i in this.params ){
			if( !this.params.hasOwnProperty(i) ) continue;
			this.object.Parameters.Append( this.params[i] );
		}
		
		this.rcd = this.object.execute();
		return this;
	});
	
	cmd.add('Promise', function(resolve, reject){
		if ( this.rcd && !this.rcd.Bof && !this.rcd.Eof ){
			typeof resolve === 'function' && resolve.call(this, this.rcd);
		}else{
			typeof reject === 'function' && reject.call(this, this.rcd);
		}
		
		return this;
	});
	
	cmd.add('each', function( callback ){
		return this.Promise(function(object){
			var i = 0;
		
			while ( !object.Eof )
			{
				typeof callback === "function" && callback.call(this, object, i);
				object.MoveNext();
				i++;
			}
		});
	});
	
	cmd.add('toJSON', function(){
		var keep = [];
		this.each(function(object){
			var json = {};
			for ( var i = 0; i < object.fields.count ; i++ ) {
				json[object.fields(i).name] = object.fields(i).value;
			}
			keep.push(json);
		}).close();
		
		return keep;
	});
	
	cmd.add('close', function(){
		try{
			this.rcd.Close();
		}catch(e){}
		
		return this;
	});
	
	cmd.add('get', function(name){
		if ( !this.geted ){
			for ( var i in this.params ){
				if( !this.params.hasOwnProperty(i) ) continue;
				if( this.params[i].Direction > 1 ){
					this.params[i].value = this.object(i).value;
				}
			}
			this.geted = true;
		}
		if( !this.params.hasOwnProperty(name) ) return null;
		return this.params[name];
	});
	
	// 类型
	cmd.ParameterDirection = { INPUT:1,INPUTOUTPUT:3,OUTPUT:2,RETURNVALUE:4 };
	cmd.DataType = {
		ARRAY:0x2000,DBTYPE_I8:20,DBTYPE_BYTES:128,DBTYPE_BOOL:11,DBTYPE_BSTR:8,DBTYPE_HCHAPTER:136,DBTYPE_STR:129,DBTYPE_CY:6,DBTYPE_DATE:7,DBTYPE_DBDATE:133,
		DBTYPE_DBTIME:134,DBTYPE_DBTIMESTAMP:135,DBTYPE_DECIMAL:14,DBTYPE_R8:5,DBTYPE_EMPTY:0,DBTYPE_ERROR:10,DBTYPE_FILETIME:64,DBTYPE_GUID:72,DBTYPE_IDISPATCH:9,
		DBTYPE_I4:3,DBTYPE_IUNKNOWN:13,LONGVARBINARY:205,LONGVARCHAR:201,LONGVARWCHAR:203,DBTYPE_NUMERIC:131,DBTYPE_PROP_VARIANT:138,DBTYPE_R4:4,DBTYPE_I2:2,DBTYPE_I1:16,
		DBTYPE_UI8:21,DBTYPE_UI4:19,DBTYPE_UI2:18,DBTYPE_UI1:17,DBTYPE_UDT:132,VARBINARY:204,VARCHAR:200,DBTYPE_VARIANT:12,VARNUMERIC:139,VARWCHAR:202,DBTYPE_WSTR:130
	};
	cmd.CommandType = {
		UNSPECIFIED:-1,TEXT:1,TABLE:2,STOREDPROC:4,UNKNOWN:8,FILE:256,TABLEDIRECT:512
	};
	
})();
// JSON FACTORY
;(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
%>
