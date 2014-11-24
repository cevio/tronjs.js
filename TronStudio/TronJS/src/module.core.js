var _host = host.origin ? host.origin : host.href.split('/').slice(0, 3).join('/'),
	_base = _host,
	_file = host.href.split('?')[0];

var SLASH_RE = /\\\\/g,
	regx_root = /^\/.+/,
	regx_http = /^http\:\/\//i,
	regx_parent = /^\.\.\/.+/,
	regx_self = /^\.\/.+/,
	regx_local = /^\:.+/,
	REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;

function GlobalModules(){
	this.exports 		= {};					// 全局接口
	this.length 		= 0;					// 接口数量
	this.maps 			= {};					// 接口映射
	this.Promise 		= Promise.resolve();	// Window.Require Promise
	this.LoadedModules	= [];					// 单模块加载时候分析出的模块集合 文件是模块的载体 原则
};

function GlobalModule(){
	this.exports 		= {};					// 单模块接口
	this.__modename		= null;					// 单模块自定义文件名
	this.__filename		= null;					// 单模块所在文件地址
	this.__dirname		= null;					// 单模块所在文件夹地址
	this.dependencies 	= [];					// 单模块依赖关系
	this.factory		= function(){};			// 单模块主函数
	this.async			= false;				// 单模块中依赖关系加载模式 true: 串行 false 并行
	this.inDefine		= false;				// 单模块是否被打包过
};

var library = new Class(function(){
	this.httpDomain	= _host;					// 当前加载页面的host地址
	this.httpBase	= _base;					// 当前加载页面的基址
	this.httpFile	= _file;					// 当前加载页面的文件地址
});

// 设置模块加载的映射关系
library.add('onMap', function( ShortSelector, AbsoluteHttpPath ){
	window.modules.maps[ShortSelector] = AbsoluteHttpPath;
	return this;
});

//  设置模块加载的基址
library.add('setBase', function( HttpBaseSelector ){
	if ( HttpBaseSelector && HttpBaseSelector.length > 0 ){
		if ( /^http:/i.test(HttpBaseSelector) ){
			this.httpBase = HttpBaseSelector;
			this.httpDomain = HttpBaseSelector.split('/').slice(0, 3).join('/');
		}
		else{
			this.httpBase += '/' + HttpBaseSelector;
		}
	};
		
	if ( /\/$/.test(this.httpBase) ){
		this.httpBase = this.httpBase.replace(/\/$/, '');
	};
		
	return this;
});

// 接口转移方法
library.add('proxy', function( fn, context ){
	return function(){
		var args = arguments;
		return fn.apply(context, args);
	};
});

// 模块加载状态码
GlobalModules.prototype.status = {
	pending		: 0,							// 模块准备中
	analyzed	: 1,							// 模块分析中
	required	: 2,							// 依赖关系处理完毕
	compiled	: 3								// 编译完毕
}

GlobalModules.prototype.debug = false;			// 是否调试

window.Library = new library();					// 全局Library库对象
window.modules = new GlobalModules();			// 全局模块存储空间对象

window.modules.debug = false;