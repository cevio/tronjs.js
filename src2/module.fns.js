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

function parseDependencies( code ){
	var ret = [], m;
		
	REQUIRE_RE.lastIndex = 0
	code = code.replace(SLASH_RE, "");

	while ((m = REQUIRE_RE.exec(code))) {
		if (m[2]) ret.push(m[2]);
	}

	return unique(ret);
};

function getInteractiveScript(){
	if(window.document.currentScript) {
		return window.document.currentScript;
	}
	
	var stack;
	try {
		a.b.c(); //强制报错,以便捕获e.stack
	} catch(e) {//safari的错误对象只有line,sourceId,sourceURL
		stack = e.stack;
		if(!stack && window.opera){
			//opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
			stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
		}
	}
	if(stack) {
		/**e.stack最后一行在所有支持的浏览器大致如下:
		*chrome23:
		* at http://113.93.50.63/data.js:4:1
		*firefox17:
		*@http://113.93.50.63/query.js:4
		*opera12:
		*@http://113.93.50.63/data.js:4
		*IE10:
		*  at Global code (http://113.93.50.63/data.js:4:1)
		*/
		stack = stack.split( /[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
		stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
		var url = stack.replace(/(:\d+)?:\d+$/i, "");//去掉行号与或许存在的出错字符起始位置
		var nodes = head.getElementsByTagName("script");
		for ( var j = 0 ; j < nodes.length ; j++ ){
			if ( nodes[j].src.toLowerCase() == url.toLowerCase() ){
				return nodes[j];
			}
		}
	}
	
	var nodes = head.getElementsByTagName("script"); //只在head标签中寻找
	for(var i = 0, node; node = nodes[i++];) {
		if(node.readyState === "interactive") {
			return node;
		}
	}
};

function getCurrentScript() {
	var interactiveScript = getInteractiveScript();
	if ( !interactiveScript ){
		interactiveScript = Array.prototype.slice.call(document.scripts, 0).shift().src;
	};
	return interactiveScript;
};

function RequireContrast( str, dirname ){
	if ( window.modules.maps[str] ){ 
		str = window.modules.maps[str]; 
	};

	if ( regx_root.test(str) ){ 
		str = Library.httpDomain + str; 
	}

	else if ( regx_http.test(str) ){ 
		str = str; 
	}

	else if ( regx_parent.test(str) ){
		str = ResolveParentSelector(dirname + '/' + str); 
	}

	else if ( regx_self.test(str) ){ str = dirname + '/' + str.replace(/^\.\//, ''); }

	else if ( regx_local.test(str) ){ 
		str = str.replace(/^:/, '').replace(/^\//, ''); 
		str = Library.httpBase + '/' + str; 
	}

	else{ str = dirname + '/' + str.replace(/^\.\//, ''); };
	
	return str;
};

function RequireResolve( str, dirname ){
	str = RequireContrast(str, dirname);
	
	if ( !str ) return;

	if ( /\.css$/i.test(str) ){ str = str; }
	else if ( /\.js$/i.test(str) ){ str = str; }
	else{ str += '.js'; }
	
	return str;
};

function DefineResolve( str, base, localModuleDir ){
	if ( window.modules.maps[str] ){ 
		str = window.modules.maps[str]; 
	};
	
	if ( regx_root.test(str) ){ 
		str = localModuleDir + str; 
	}

	else if ( regx_http.test(str) ){ 
		str = str; 
	}

	else if ( regx_parent.test(str) ){
		str = ResolveParentSelector(localModuleDir + '/' + str); 
	}

	else if ( regx_self.test(str) ){ str = localModuleDir + '/' + str.replace(/^\.\//, ''); }

	else{ str = base + '/' + str.replace(/^\.\//, ''); }

	if ( /\.css$/i.test(str) ){ str = str; }
	else if ( /\.js$/i.test(str) ){ str = str; }
	else{ str += '.js'; }
	
	return str;
};

function ResolveParentSelector( p ){
	var parentNode = p.replace(Library.httpDomain, "");
		
	if ( /^\//.test(parentNode) ){
		parentNode = parentNode.replace(/^\//, "");
	}
	
	var parentArrays = parentNode.split("/"),
		index = parentArrays.indexOf("..");
		
	if ( index > -1 ){
		index--;
		
		if ( index < 0 ){
			index = 0;
			parentArrays.splice(0, 1);
		}
		else{
			parentArrays.splice(index, 2);
		}
		
		var x = parentArrays.join("/");
		
		if ( !regx_http.test(x) ){
			x = Library.httpDomain + "/" + x;
		}
		
		return ResolveParentSelector(x);
	}else{
		
		var b = parentArrays.join("/");
		
		if ( !regx_http.test(b) ){
			b = Library.httpDomain + "/" + b;
		}
		
		return b;
		
	}
};

function getEmpty(json){
	var j = 0;
	for ( var i in json ){
		j++;
	}
	
	return j === 0;
};

function LoadScript( url ){
	return new Promise(function( resolve ){
		var node = document.createElement("script");
		node.onload = node.onerror = node.onreadystatechange = function(){
			if ( /loaded|complete|undefined/i.test(node.readyState) ) {
				node.onload = node.onerror = node.onreadystatechange = null;
				resolve(node);
			}
		}
		node.async = true;
		node.src = url;
		head.insertBefore( node, head.firstChild );
	});
};

function LoadCss( href, before, media ){
	return new Promise(function(resolve){
		var ss = window.document.createElement( "link" );
		var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
		var sheets = window.document.styleSheets;
			ss.rel = "stylesheet";
			ss.href = href;
			ss.media = "only x";
			ref.parentNode.insertBefore( ss, ref );
		
		var dtime = new Date().getTime();
		function toggleMedia(){
			if ( new Date().getTime() - dtime > 30000 ){
				reject(ss);
				return;
			};
			var defined;
			for( var i = 0; i < sheets.length; i++ ){
				if( sheets[ i ].href && sheets[ i ].href.indexOf( href ) > -1 ){
					defined = true;
				}
			}
			if( defined ){
				ss.media = media || "all";
				resolve(ss);
			}
			else {
				setTimeout( toggleMedia );
			}
		}
		
		toggleMedia();
	});
};

function request( url ){
	if ( /\.css(?:\?|$)/i.test(url) ){
		return LoadCss(url);
	}else{
		return LoadScript(url);
	}
};

function getDirName( filename ){
	return filename.split('/').slice(0, -1).join('/');
};

function SetModuleStatus( module, status ){
	window.modules.exports[module.__modename].status = window.modules.status[status];
};

function GetModuleStatus( module ){
	return window.modules.exports[module.__modename].status;
};

function GetExportsBySelectors( selectors ){
	var newSelectors = [];
	selectors.forEach(function( selector ){
		var _exports = null;
		try{
			_exports = window.modules.exports[selector].module.exports;
		}catch(e){}
		newSelectors.push(_exports);
	});
	return newSelectors;
};

function GetExportsBySelector( selector ){
	try{
		return window.modules.exports[selector].module.exports;
	}catch(e){
		return null;
	}
};

function debug(){
	if ( window.modules.debug ){
		console.log.apply(console, arguments);
	}
}