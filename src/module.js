// JavaScript Document
(function(host, module){
	var _host = host.origin ? host.origin : host.href.split('/').slice(0, 3).join('/'),
		_base = _host,
		_file = host.href.split('?')[0];
	
	window.modules = new module();
	var library = new Class();
	library.add({
		httpDomain: _host,
		httpBase: _base,
		httpFile: _file
	});
	
		// 设置加载器映射
	library.add('onMap', function( str, selector ){
		window.modules.maps[str] = selector;
		return this;
	});
	
	// 设置加载器基址
	library.add('setBase', function( str ){
		if ( str && str.length > 0 ){
			if ( /^http:/i.test(str) ){
				this.httpBase = str;
				this.httpDomain = str.split('/').slice(0, 3).join('/');
			}
			else{
				this.httpBase += '/' + str;
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
	
	window.Library = new library();
})(
	window.location,
	function(){
		this.exports = {};
		this.length = 0;
		this.maps = {};
		this.Promise = Promise.resolve();
	}
);