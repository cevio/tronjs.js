var AR = 'ADODB.RECORDSET';
var DBOMAPS = {};

var dbo = new Class(function( table, conn ){
	if ( DBOMAPS[table] ){
		return DBOMAPS[table];
	}
	
	this.tables = table;						// 表名
	this.conn = conn;							// 数据库连接对象
	this.object = new ActiveXObject( AR );		// RECORDSET对象
	this.fields = [];							// 字段名集合
	this.length = 0;							// 字段名个数
	
	this.resetSQL();							// 初始化SQL
	this.table(table);
	
	DBOMAPS[table] = this;						// 缓存表操作对象
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

dbo.add('create', function(i){
	this.selectAll();
	this.open(i);
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

var sql = new Class();

sql.add('resetSQL', function(){
	this.sql = {};
	this.sql.where = '';
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
	this.sql.where = str;
	return this;
});

sql.add('table', function( str ){
	this.sql.table = str;
	return this;
});

sql.add('and', function(key, value, compare){
	if ( this.sql.where.length === 0 ){
		this.sql.where += GruntKeyValue(key, value, compare);
	}else{
		this.sql.where += ' AND ' + GruntKeyValue(key, value, compare);
	}
	
	return this;
});

sql.add('or', function( key, value, compare ){
	if ( this.sql.where.length === 0 ){
		this.sql.where += GruntKeyValue(key, value, compare);
	}else{
		this.sql.where += ' OR ' + GruntKeyValue(key, value, compare);
	}
	
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
	
	if ( this.sql.where.length === 0 ){
		this.sql.where += '(' + sqls.sql.text + ')';
	}else{
		this.sql.where += ' AND (' + sqls.sql.text + ')';
	}
	
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
	
	if ( this.sql.where.length === 0 ){
		this.sql.where += '(' + sqls.sql.text + ')';
	}else{
		this.sql.where += ' OR (' + sqls.sql.text + ')';
	}
	
	return this;
});

sql.add('asc', function( params ){
	if ( !this.sql.order || this.sql.order.length === 0 ){
		this.sql.order = [];
	};
	this.sql.order.push(params + ' ASC');
	return this;
});

sql.add('desc', function( params ){
	if ( !this.sql.order || this.sql.order.length === 0 ){
		this.sql.order = [];
	};
	this.sql.order.push(params + ' DESC');
	return this;
});

sql.add('gruntSQL', function(){
	var datSQL = [];
	if ( this.sql.table && this.sql.table.length > 0 && this.sql.selectors && this.sql.selectors.length > 0 ){
		datSQL.push('SELECT');
		if ( this.sql.top && this.sql.top > 0 ){
			datSQL.push('TOP ' + this.sql.top);
		};
		if ( this.sql.selectors && this.sql.selectors.length > 0 ){
			datSQL.push(this.sql.selectors.join(','));
		};
		datSQL.push('FROM ' + this.sql.table);
		
		if ( this.sql.where.length > 0 ){
			datSQL.push('WHERE');
			datSQL.push(this.sql.where);
		}
		if ( this.sql.order && this.sql.order.length > 0 ){
			datSQL.push('ORDER BY')
			datSQL.push(this.sql.order.join(','));
		};
	}else{
		datSQL.push(this.sql.where);
	}

	this.sql.text = datSQL.join(' ');
	return this;
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

dbo.extend(sql);
module.exports = dbo;