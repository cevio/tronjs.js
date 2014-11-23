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
	
	fso.add('getDir', function(){
		return this.then(function(){
			this.resolve();
			if ( /^\w:\\.+$/.test(this.contexts.path) ){
				return this.contexts.path.split('\\').slice(0, -1).join('\\');
			}else{
				return this.contexts.path.split('/').slice(0, -1).join('/');
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

	fso.extend(task);
	
	fs = function(AbsoluteFilePath, fileType){
		return new fso(AbsoluteFilePath, fileType).value(AbsoluteFilePath);
	}
	
})();