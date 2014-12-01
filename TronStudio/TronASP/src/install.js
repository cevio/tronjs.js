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
	page, 							// 系统分类类定义
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
		if (typeof logs === 'string') {
			logs = logs;
		} 
		else if (typeof logs === 'object') {
			try{
				logs = JSON.stringify(http.emit(logs));
			}catch(e){
				try{
					logs = valueOf(logs);
				}catch(e){
					try{
						logs = JSON.stringify(logs);
					}catch(e){
						logs = typeof(logs);
					}
				}
			}
		} 
		else if ( typeof logs === 'date' ){
			logs = date.format(logs, 'y-m-d h:i:s');
		}
		else if (typeof logs === 'function') {
			logs = logs.toString();
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
}
