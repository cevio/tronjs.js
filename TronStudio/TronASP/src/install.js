var __filename = Server.MapPath(Request.ServerVariables("SCRIPT_NAME")),
	__dirname = Server.MapPath("./"),
	require,						// 模块引用函数
	exports,						// 模块对外接口
	module,							// 模块对象
	contrast,						// 模块转换路径方法
	resolve,						// 模块转换路径模块的具体方法
	include;						// 模板加载方法

var Class, console, modules, task, fs, date, http, ajax, connect, dbo;
	
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
