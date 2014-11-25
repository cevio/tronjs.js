var AC = 'ADODB.CONNECTION';

/*
 * 数据库连接类
 * 返回数据库连接对象
 */
var connect = new Class(function( type, options ){
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

module.exports = connect;
var AR = 'ADODB.RECORDSET';
var DBOMAPS = {};

var dbo = new Class(function( table, conn ){
	if ( DBOMAPS[table] ){
		return DBOMAPS[table];
	}
	
	this.table = table;							// 表名
	this.conn = conn;							// 数据库连接对象
	this.object = new ActiveXObject( AR );		// RECORDSET对象
	this.fields = [];							// 字段名集合
	this.length = 0;							// 字段名个数
	
	this.resetSQL();							// 初始化SQL
	new where(this);							// 继承WHERE的各种方法
	
	DBOMAPS[table] = this;						// 缓存表操作对象
});

dbo.add('GetFields', function(){
	this.object.Open( 'SELECT TOP 0 * FROM ' + this.table, this.conn, 1, 1 );
	for ( var i = 0 ; i < this.object.fields.count; i++ ){
		this.fields.push(this.object.fields(i).name);
	}
	this.length = this.fields.length;
	this.object.Close();
	return this;
});

dbo.add('create', function(){
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

dbo.add('top', function( number ){
	if ( number && !isNaN(number) ){
		this.sql.top = number;
	}
	
	return this;
});

dbo.add('selectAll', function(){
	this.sql.selectors = ['*'];
	return this;
});

dbo.add('select', function(){
	if ( !this.sql.selectors ){
		this.sql.selectors = [];
	}
	var params = Array.prototype.slice.call(arguments, 0);
	this.sql.selectors = unique(this.sql.selectors.concat(params));
	return this;
});

dbo.add('where', function( str ){
	this.sql.where = str;
	return this;
});

dbo.add('asc', function( params ){
	if ( !this.sql.order || this.sql.order.length === 0 ){
		this.sql.order = [];
	};
	this.sql.order.push(params + ' ASC');
	return this;
});

dbo.add('desc', function( params ){
	if ( !this.sql.order || this.sql.order.length === 0 ){
		this.sql.order = [];
	};
	this.sql.order.push(params + ' DESC');
	return this;
});

dbo.add('resetSQL', function(){
	this.sql = {};
	this.sql.where = '';
	return this;
});

dbo.add('gruntSQL', function(){
	var datSQL = ['SELECT'];
	if ( this.sql.top && this.sql.top > 0 ){
		datSQL.push('TOP ' + this.sql.top);
	};
	if ( this.sql.selectors && this.sql.selectors.length > 0 ){
		datSQL.push(this.sql.selectors.join(','));
	};
	datSQL.push('FROM ' + this.table);
	if ( this.sql.where.length > 0 ){
		datSQL.push('WHERE');
		datSQL.push(this.sql.where);
	};
	if ( this.sql.order && this.sql.order.length > 0 ){
		datSQL.push('ORDER BY')
		datSQL.push(this.sql.order.join(','));
	};
	this.sql.text = datSQL.join(' ');
	return this;
});

dbo.add('open', function(mode){
	this.gruntSQL();
	this.object.Open(this.sql.text, this.conn, 1, mode ? mode : 1);
	return this;
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

var where = new Class(function( context ){
	
	context.and = function(key, value, compare){
		if ( this.sql.where.length === 0 ){
			this.sql.where += GruntKeyValue(key, value, compare);
		}else{
			this.sql.where += ' AND ' + GruntKeyValue(key, value, compare);
		}
		
		return this;
	};
	
	context.or = function( key, value, compare ){
		if ( this.sql.where.length === 0 ){
			this.sql.where += GruntKeyValue(key, value, compare);
		}else{
			this.sql.where += ' OR ' + GruntKeyValue(key, value, compare);
		}
		
		return this;
	};
	
	context.ands = function( callback ){
		var newWhere = new (new Class(function(){
			this.sql = {};
			this.sql.where = '';
		}));
		
		new where(newWhere);
		callback.call(newWhere);
			
		if ( this.sql.where.length === 0 ){
			this.sql.where += '(' + newWhere.sql.where + ')';
		}else{
			this.sql.where += ' AND (' + newWhere.sql.where + ')';
		}
		
		return this;
	};
	
	context.ors = function( callback ){
		var newWhere = new (new Class(function(){
			this.sql = {};
			this.sql.where = '';
		}));
		
		new where(newWhere);
		callback.call(newWhere);
			
		if ( this.sql.where.length === 0 ){
			this.sql.where += '(' + newWhere.sql.where + ')';
		}else{
			this.sql.where += ' OR (' + newWhere.sql.where + ')';
		}
		
		return this;
	};
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

function GruntKeyValue(key, value, compare){
	if ( !compare ){ compare = '='; }
	compare = compare.toLowerCase();
	if ( compare === 'in' ){
		if ( !readVariableType(value, 'array') ){
			value = [value];
		};
		var inArray = [];
		for ( var i = 0 ; i < value.length ; i++ ){
			if ( readVariableType(value[i], 'string') ){
				inArray.push("'" + value[i] + "'");
			}else{
				inArray.push(value[i]);
			}
		};
		return key + ' IN ' + '(' + inArray.join(',') + ')';
	}
	else{
		if ( readVariableType(value, 'string') ){
			value = "'" + value + "'";
		};
		
		return key + compare + value;
	}
}

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

module.exports = dbo;
