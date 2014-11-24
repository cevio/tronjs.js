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