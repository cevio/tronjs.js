// Task Factory.
;(function(){
	task = new Class();
	task.add('value', function(value){
		if ( value ){
			this._value = value;
			return this;
		}else{
			return this._value;
		}
	});
	task.add('_value', null);
	task.add('status', true);
	task.add('then', function( callback ){
		if ( this.status && !this._stop ){
			if ( typeof callback === 'function' ){
				var value = callback.call(this, this._value);
				if ( value ){
					this._value = value;
				}
			}
		}
		
		return this;
	});
	task.add('fail', function( callback ){
		if ( !this.status && !this._stop ){
			if ( typeof callback === 'function' ){
				var value = callback.call(this, this._value);
				if ( value ){
					this._value = value;
				}
			}
		}
		
		return this;
	});
	task.add('resolve', function(){
		this.status = true;
		return this;
	});
	task.add('reject', function(){
		this.status = false;
		return this;
	});
	task.add('stop', function(){
		this._stop = true;
		return this;
	});
	task.add('change', function(path, type){
		this.contexts.path = path && path.length > 0 ? path : this.contexts.path;
		this.contexts.type = type === undefined || type === null ? this.contexts.type : type;
	});
})();