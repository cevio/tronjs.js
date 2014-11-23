var __filename = Server.MapPath(Request.ServerVariables("SCRIPT_NAME")),
	__dirname = Server.MapPath("./"),
	require,
	exports,
	module;

var Class, console, modules, task, fs;
	
var JSON = function(){
	return JSON.stringify.apply(JSON, arguments);
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
		fs.save(contrast('/debug.log'), logs + '\n');
	}
}
