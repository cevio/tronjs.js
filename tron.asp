﻿<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<script runat="SERVER" language="VBSCRIPT">
	Function VB_AscB( s )
		VB_AscB = AscB( s )
	End Function
	
	Dim VB_BNCRLF : VB_BNCRLF = ChrB(13) & ChrB(10)
	Dim VB_DOUBLEBNCRLF : VB_DOUBLEBNCRLF = VB_BNCRLF & VB_BNCRLF
	
	Function VB_DRIVER( formData )
		VB_DRIVER = LeftB( formData, CInt( InstrB( formData, VB_BNCRLF ) ) - 1 )
	End Function
	
	Function VB_INSERTB( formdata, divider )
		VB_INSERTB = InstrB( formdata, divider )
	End Function
	
	Function VB_INSERTBS( startpos, formdata, divider )
		VB_INSERTBS = InstrB( startpos, formdata, divider )
	End Function
	
	Function VB_LENB( divider )
		VB_LENB = LenB( divider )
	End Function
	
	Function VB_MIDBS( a, b, c )
		VB_MIDBS = MidB( a, b, c )
	End Function
	
	Function VB_MIDB( a, b )
		VB_MIDB = MidB( a, b )
	End Function
</script>
<%
Response.Buffer = true;
Server.ScriptTimeOut = 999;
Session.CodePage = 65001;
Session.LCID = 2052;
/*
 * @overview Global TronJS Scripts Loader - a tiny implementation of Promises/A+ and CommonJS contributors.
 * @copyright Copyright (c) 2014 evio studio and PJBlog5 project
 * @license   Licensed under MIT license
 *            See https://github.com/cevio/tronjs.js
 * @version   6.1.223
 */
var __filename = Server.MapPath(Request.ServerVariables("SCRIPT_NAME")),
	__dirname = Server.MapPath("./"),
	require,						// 模块引用函数
	exports,						// 模块对外接口
	module,							// 模块对象
	contrast,						// 模块转换路径方法
	resolve,						// 模块转换路径模块的具体方法
	include;						// 模板加载方法

var Class, console, modules, task, fs, date;
	
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
		var now = date.format(new Date(), 'y-m-d h:i:s'),
			content = '[' + now + ']:\r\n' + logs + '\r\n\r\n';
		fs(contrast('/debug.log')).write(content);
	}
}

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
						name = callback.call(this, name) || name;
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
	
	fso.add('files', function(){
		return this.then(function(){
			if ( this.contexts.type ){
				var emiot = object.GetFolder(this.contexts.path),
					dirEmiot = emiot.Files,
					dirEmiots = new Enumerator(dirEmiot),
					names = [];
				
				for (; !dirEmiots.atEnd(); dirEmiots.moveNext()) {
					var name = dirEmiots.item().Name;
					if ( typeof callback === 'function' ){
						name = callback.call(this, name) || name;
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
				return ret;
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
		
		if ( modules.maps[selector] ){
			selector = modules.maps[selector];
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
		if ( !/\.asp$/i.test(path) && !/\.js$/i.test(path) ){
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
		RequireModuleConstructor.__filename 	= AbsoluteModulePath;
		RequireModuleConstructor.__dirname 		= RequireModuleConstructor.__filename.split('\\').slice(0, -1).join('\\');
		RequireModuleConstructor.contrast 		= function( selector ){ return RequireContrast(selector, this.__dirname); };		
		RequireModuleConstructor.resolve 		= function( selector ){ return RequireResolve(selector, this.__dirname); };		
		RequireModuleConstructor.require 		= function( selector ){ return new Require(this.resolve(selector)); };		
		RequireModuleConstructor.include 		= function( selector, argcs ){ new Include(this.contrast(selector), argcs); };
		
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
			that.ServerScriptContent = ServerScriptContent;
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
(function () {
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
