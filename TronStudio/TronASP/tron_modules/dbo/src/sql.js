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

module.exports = sql;