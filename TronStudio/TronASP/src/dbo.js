;(function(){
	var AC = 'ADODB.CONNECTION';
	
	/*
	 * 数据库连接类
	 * 返回数据库连接对象
	 */
	connect = new Class(function( type, options ){
		this.object = new ActiveXObject( AC );
		this.connectString = [];
		
		if ( type === 'access' ){ this.Access(options); }
		else if ( type === 'mssql' ){ this.MsSql(options); }
		
		for ( var i = 0 ; i < this.connectString.length; i++ ){
			try{
				this.object.Open(this.connectString[i]);
				break;
			}catch(e){}
		};
		
		return this.object;
	});
	
	connect.add('Access', function( AccessPath ){
		this.connectString = [
			'provider=Microsoft.jet.oledb.4.0;data source=' + AccessPath,
			'driver={microsoft access driver (*.mdb)};dbq=' + AccessPath
		];
	});
	
	connect.add('MsSql', function( settings ){
		var connections = [];
		
		connections.push([
			"Provider=sqloledb",
			"Data Source=" + 		settings.netserver,
			"Initial Catalog=" + 	settings.access,
			"User Id=" + 			settings.username,
			"Password=" + 			settings.password,
			""
		].join(";"));
		
		connections.push([
			"Driver={SQL Server}",
			"Server=" + 			settings.netserver,
			"Database=" + 			settings.access,
			"Uid=" + 				settings.username,
			"Pwd=" + 				settings.password,
			""
		].join(";"));
		
		this.connectString = connections;
	});

	var AR = 'ADODB.RECORDSET';
	
	dbo = new Class(function( table, conn ){
		
		this.tables = table;						// 表名
		this.conn = conn;							// 数据库连接对象
		this.object = new ActiveXObject( AR );		// RECORDSET对象
		this.fields = [];							// 字段名集合
		this.length = 0;							// 字段名个数
		
		this.resetSQL();							// 初始化SQL
		this.table(table);
	});
	
	dbo.add('getFields', function(){
		this.object.Open( 'SELECT TOP 0 * FROM ' + this.tables, this.conn, 1, 1 );
		for ( var i = 0 ; i < this.object.fields.count; i++ ){
			this.fields.push(this.object.fields(i).name);
		}
		this.length = this.fields.length;
		this.object.Close();
		return this;
	});
	
	dbo.add('create', function(){
		this.selectAll();
		this.open(2);
		this.object.AddNew();
		return this;
	});
	
	dbo.add('set', function( params, value ){
		if ( !value && typeof params === 'object' ){
			for ( var i in params ){
				this.object(i) = params[i];
			}
		}else{
			this.object(params) = value;
		}
		
		return this;
	});
	
	dbo.add('save', function(){
		this.object.Update();
		return this;
	});
	
	dbo.add('remove', function(){
		this.object.Delete();
		return this;
	});
	
	dbo.add('where', function( str ){
		this.sql.where = str;
		return this;
	});
	
	dbo.add('open', function(mode){
		this.gruntSQL();
		this.object.Open(this.sql.text, this.conn, 1, mode ? mode : 1);
		return this;
	});
	
	dbo.add('toJSON', function(){
		var keep = [];
		this.open().each(function(object){
			var json = {};
			for ( var i = 0; i < object.fields.count ; i++ ) {
				json[object.fields(i).name] = object.fields(i).value;
			}
			keep.push(json);
		}).close();
		
		return keep;
	});
	
	dbo.add('close', function(){
		try{
			this.object.Close();
		}catch(e){}
		
		return this;
	});
	
	dbo.add('exec', function(resolve, reject){
		if ( !reject && readVariableType(resolve, 'string') ){
			this.conn.Execute(resolve);
		}
		else if ( !resolve ){
			this.gruntSQL();
			this.conn.Execute(this.sql.text);
		}
		else{
			if ( !this.object.Bof && !this.object.Eof ){
				typeof resolve === 'function' && resolve.call(this, this.object);
			}else{
				typeof reject === 'function' && reject.call(this, this.object);
			}
		}
		
		return this;
	});
	
	dbo.add('find', function( callback, mode ){
		this.open(mode).exec(function( object ){
			callback.call(this, this.object);
		});
		this.object.Close();
		
		return this;
	});
	
	dbo.add('each', function( callback ){
		return this.exec(function(object){
			var i = 0;
			object.MoveFirst();
		
			while ( !object.Eof )
			{
				typeof callback === "function" && callback.call(this, object, i);
				object.MoveNext();
				i++;
			}
		});
	});
	
	dbo.add('rows', function(){
		try{ 
			var tempArr = this.object.GetRows().toArray(); 
			return getRows( tempArr, this.object.Fields.Count );
		}catch(e){
			return [];
		}
	});

/*
 *	SQL 语句生成类
 *	evio
 */	
	sql = new Class();
	
	sql.add('resetSQL', function(){
		var table = '';
		if ( this.sql ){
			table = this.sql.table;
		}
		this.sql = {};
		this.sql.where = [];
		this.sql.whereText = '';
		if ( table && table.length > 0 && table.toLowerCase() !== 'undefined' ){
			this.table(table);
		};
		return this;
	});
	
	sql.add('top', function( number ){
		if ( number && !isNaN(number) ){
			this.sql.top = number;
		}
		
		return this;
	});
	
	sql.add('selectAll', function(){
		this.sql.selectors = ['*'];
		return this;
	});
	
	sql.add('select', function(){
		if ( !this.sql.selectors ){
			this.sql.selectors = [];
		}
		var params = Array.prototype.slice.call(arguments, 0);
		this.sql.selectors = unique(this.sql.selectors.concat(params));
		return this;
	});
	
	sql.add('where', function( str ){
		this.sql.whereText = str;
		return this;
	});
	
	sql.add('table', function( str ){
		this.sql.table = str;
		return this;
	});
	
	sql.add('as', function(name){
		this.sql.as = name;
		return this;
	});
	
	sql.add('and', function(key, value, compare){
		this.sql.where.push({
			key: key,
			value: value,
			compare: compare,
			toggle: 'AND'
		});
		
		return this;
	});
	
	sql.add('or', function( key, value, compare ){
		this.sql.where.push({
			key: key,
			value: value,
			compare: compare,
			toggle: 'OR'
		});
		
		return this;
	});
	
	sql.add('ands', function(callback){
		var _sql = new Class();
			_sql.extend(sql);
			
		var sqls = new _sql();
			sqls.resetSQL();
		
		if ( typeof callback === 'function' ){
			callback.call(sqls);
		}
		
		sqls.gruntSQL();
		
		var sqlText = sqls.sql.text;
		
		this.sql.where.push({
			text: '(' + sqlText + ')',
			toggle: 'AND'
		});
		
		return this;
	});
	
	sql.add('ors', function(callback){
		var _sql = new Class();
			_sql.extend(sql);
			
		var sqls = new _sql();
			sqls.resetSQL();
		
		if ( typeof callback === 'function' ){
			callback.call(sqls);
		}
		
		sqls.gruntSQL();
		
		var sqlText = sqls.sql.text;
		
		this.sql.where.push({
			text: '(' + sqlText + ')',
			toggle: 'OR'
		});
		
		return this;
	});
	
	sql.add('asc', function( params ){
		if ( !this.sql.order || this.sql.order.length === 0 ){
			this.sql.order = [];
		};
		
		this.sql.order.push({
			param: params,
			type: 'ASC'
		});
		
		return this;
	});
	
	sql.add('desc', function( params ){
		if ( !this.sql.order || this.sql.order.length === 0 ){
			this.sql.order = [];
		};
		
		this.sql.order.push({
			param: params,
			type: 'DESC'
		});
		
		return this;
	});
	
	sql.add('toggleParams', function(params, type){
		var _ = [], that = this;
		params.forEach(function(o){
			if ( type === 'selector' ){
				if ( o === '*' ){
					_.push(o);
				}else{
					if ( that.sql.as && that.sql.as.length > 0 ){
						_.push(that.sql.as + '.[' + o + ']');
					}else{
						_.push('[' + o + ']');
					}
				}
			}
		});
		return _;
	});

	sql.add('toggleWhere', function(){
		var keepWhere = [];
		this.sql.where.forEach(function(o){
			if ( o.text && o.text.length > 0 ){
				keepWhere.push(o.toggle + ' ' + o.text);
			}else{
				var p = this.GruntKeyValue(o.key, o.value, o.compare);
				keepWhere.push(o.toggle + ' ' + p);
			}
		});
		this.sql.whereText = keepWhere.join(' ');
	});
	
	sql.add('gruntSQL', function(){
		var toggleSQLText = [], that = this;
		
		if ( this.sql.table && this.sql.table.length > 0 && this.sql.selectors && this.sql.selectors.length > 0 ){
			toggleSQLText.push('SELECT');
			
			// 设定TOP参数
			if ( this.sql.top && this.sql.top > 0 ){
				toggleSQLText.push('TOP ' + this.sql.top);
			};
			
			// 设定选择范围
			if ( this.sql.selectors && this.sql.selectors.length > 0 ){
				toggleSQLText.push(this.toggleParams(this.sql.selectors, 'selector').join(','));
			};
			
			// 设定表名
			toggleSQLText.push('FROM [' + this.sql.table + ']');
			
			// 设定条件
			if ( this.sql.where.length > 0 && this.sql.whereText && this.sql.whereText.length === 0 ){
				toggleSQLText.push('WHERE');
				this.toggleWhere();
				toggleSQLText.push(this.sql.whereText);
			}else{
				if ( this.sql.whereText.length > 0 ){
					toggleSQLText.push('WHERE');
					toggleSQLText.push(this.sql.whereText);
				}
			}
			
			// 设定排序
			if ( this.sql.order && this.sql.order.length > 0 ){
				datSQL.push('ORDER BY');
				var ods = [];
				this.sql.order.forEach(function(o){
					if ( that.sql.as && that.sql.as.length > 0 ){
						ods.push(that.sql.as + '.[' + o.param + '] ' + o.type);
					}else{
						ods.push('[' + o.param + '] ' + o.type);
					}
				});
				toggleSQLText.push(ods.join(','));
			};
		}else{
			if ( this.sql.where.length > 0 && this.sql.whereText && this.sql.whereText.length === 0 ){
				this.toggleWhere();
				toggleSQLText.push(this.sql.whereText);
			}else{
				if ( this.sql.whereText.length > 0 ){
					toggleSQLText.push(this.sql.whereText);
				}
			}
		}
	
		this.sql.text = toggleSQLText.join(' ');
		return this;
	});
	
	sql.add('GruntKeyValue', function(key, value, compare){
		if ( !compare ){ compare = '='; }
		compare = compare.toLowerCase();
		var ret = '';
		if ( compare === 'in' ){
			if ( !readVariableType(value, 'array') ){
				value = [value];
			};
			var inArray = [];
			for ( var i = 0 ; i < value.length ; i++ ){
				if ( readVariableType(value[i], 'string') ){
					inArray.push("'" + value[i] + "'");
				}
				else if ( readVariableType(value[i], 'date') ){
					inArray.push("'" + date.format(value[i], 'y/m/d h:i:s') + "'");
				}
				else{
					inArray.push(value[i]);
				}
			};

			if ( this.sql.as && this.sql.as.length > 0 ){
				ret = this.sql.as + '.[' + key + ']' + ' IN ' + '(' + inArray.join(',') + ')';
			}else{
				ret = '[' + key + '] IN ' + '(' + inArray.join(',') + ')';
			}
		}
		else{
			if ( readVariableType(value, 'string') ){
				value = "'" + value + "'";
			}
			else if ( readVariableType(value, 'date') ){
				value = "'" + date.format(value, 'y/m/d h:i:s') + "'";
			}
			
			if ( this.sql.as && this.sql.as.length > 0 ){
				ret = this.sql.as + '.[' + key + ']' + compare + value;
			}else{
				ret = '[' + key + ']' + compare + value;
			}
		}
		
		return ret;
	});
	
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
	
	function proxy( fn, context ) {
		return function(){
			var args = arguments;
			return fn.apply(context, args);
		};
	};
	
	function getRows( arr, fieldslen ){
		var len = arr.length / fieldslen, data=[], sp; 
	
		for( var i = 0; i < len ; i++ ) { 
			data[i] = new Array(); 
			sp = i * fieldslen; 
			for( var j = 0 ; j < fieldslen ; j++ ) { data[i][j] = arr[sp + j] ; } 
		}
	
		return data; 
	}
	
	dbo.extend(sql);
})();