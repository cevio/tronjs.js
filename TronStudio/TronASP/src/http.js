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
	ajax = new Ajax();
})();;