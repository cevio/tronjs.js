(function(mod) {
    if ( 
		typeof exports == "object" || 
		typeof exports === 'function' && 
		typeof module == "object" 
	){ module.exports = mod(); }
    else if ( typeof define == "function" && define.amd ){
        return define([], mod);
    }
    else{
        window.thread = mod();
    }
})(function(){
	
	var thread = new Class(function( url, path, options ){
		this.object = new ActiveXObject("Microsoft.XMLHTTP");
		this.url = url;
		this.path = path;
		this.start = 0;
		this.length = 0;
		this.speed = 1024;
		this.fileStart = 0;
		this.time = new Date().getTime();
		this.options = options;
		this.run();
	});
	
	thread.add('getLocalURL', function(){
		var Url, ServerPort, ServerName, ScriptName, QueryString;
		ServerName = Request.ServerVariables("SERVER_NAME");
		ServerPort = Request.ServerVariables("SERVER_PORT");
		ScriptName = Request.ServerVariables("SCRIPT_NAME");
		QueryString = Request.ServerVariables("QUERY_STRING");
		Url = "http://" + ServerName;
		if ( ServerPort != '80' ){ Url = Url + ":" + ServerPort; };
		Url = Url + ScriptName;
		if ( QueryString != '' ){ Url = Url + "?" + QueryString; };
		return Url; 
	});
	
	thread.add('run', function(){
		this.getWholeChunkSize();
		this.getStartChunkSize();
		this.getContinueChunks();
	});
	
	thread.add('getWholeChunkSize', function(){
		this.object.open("HEAD", this.url, false);
		this.object.send();
		this.length = Number(this.object.getResponseHeader("Content-Length"));
	});
	
	thread.add('getStartChunkSize', function(){
		var that = this;
		fs(this.path).exist().then(function(){
			that.start = this.object.getfile(this.contexts.path).size;
		});
	});
	
	thread.add('getContinueChunks', function(){
		while ( 
				this.start < this.length && (function(_this){
						if ( typeof _this.options.onprocess === "function" ){
							var rets = _this.options.onprocess.call(_this);
							if ( rets === false ){ return false; }
							else{ return true; }
						}
						else{ return true; }
				})(this) 
		){	
			if ( this.options.refresh && this.options.maxTime && ( (new Date().getTime() - this.time) > this.options.maxTime ) ){
				Response.Redirect(this.getLocalURL());
				break;
			};
			if ( this.length - this.start < this.speed ){
				this.speed = this.length - this.start;
			}
			this.range();
		}
	});
	
	thread.add('range', function(){
		var bytes = this.start + "-" + (this.start + this.speed - 1);
		this.fileStart = this.start;
		this.object.open("GET", this.url, false);
		this.object.setRequestHeader( "Range", "bytes=" + bytes );
		this.object.setrequestheader("Content-Type:", "application/octet-stream");
		this.object.send();
		this.start += this.speed;
		
		var that = this;

		var stream = new ActiveXObject("Adodb.Stream");
			stream.Type = 1;
			stream.Mode = 3;
			stream.Open();
			fs(this.path).exist().then(function(){
				stream.LoadFromFile(that.path);
			});
			
			stream.Position = this.fileStart;
			
			stream.Write(this.object.responseBody);
			
			stream.SaveToFile(this.path, 2);
			stream.Close();
			stream = null;
	});
	
	return thread;
	
});