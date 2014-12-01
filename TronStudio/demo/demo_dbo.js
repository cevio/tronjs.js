var configs = {
	netserver: '192.168.1.11',
	access: 'Test',
	username: 'sa',
	password: 'viewalloc'
};

function randoms(l){
	var x = "123456789poiuytrewqasdfghjklmnbvcxzQWERTYUIPLKJHGFDSAZXCVBNM";
 	var tmp="";
 	for( var i = 0 ; i < l; i++ ) {
 		tmp += x.charAt(Math.ceil(Math.random()*100000000) % x.length);
 	}
 	return tmp;
}

var adCmdSPStoredProc = 4;
var adParamReturnValue = 4;
var adParamInput = 1;
var adParamOutput = 2;
var adInteger = 3;
var adVarChar = 200;

/*
adDBTimeStamp 135 日期时间数据类型
adDecimal 14 十进制整数值
adDouble 5 双精度小数值
adError 10 系统错误信息
AdGUID 72 全域性唯一识别字(Globally unique identifier)
adDispath 9 COM/OLE自动对象(Automation Object)
adInteger 3 4字节有符号整数
adIUnknown 13 COM/OLE对象
adLongVarBinary 205 大型２字节值
adLongVarChar 201 大型字符串值
adLongVarWChar 203 大型未编码字符串
adNumeric 131 十进制整数值
adSingle 4 单精度浮点小数
adSmallInt 2 2字节有符号整数
adTinyInt 16 1字节有符号整数
adUnsignedBigInt 21 8字节无符号整数
adUnsignedInt 19 4字节无符号整数
adUnsignedSmallInt 18 2字节无符号整数
adUnsignedTinyInt 17 1字节无符号整数
adUserDefined 132 用户自定义数据类型
adVariant 12 OLE对象
adVarBinary 204 双字节字符变量值
adVarChar 200 字符变量值
advarchar 202 未编码字符串变量值
adWchar 130 未编码字符串
方向值的意义如下：
Direction名称 整数值 功能  
adParamInput 1 允许数据输入至该参数当中
adParamOutput 2 允许数据输出至该参数当中
adParamInputOutput 3 允许数据输入、输出至该参数当中
adparamReturnValue 4 允许从一子程序中返回数据至该参数当中
*/

var cmd = new Class(function(Command, conn){
	this.cmd = new ActiveXObject('Adodb.Command');
	this.cmd.ActiveConnection = conn;
	this.cmd.CommandType = adCmdSPStoredProc;
	this.cmd.CommandText = Command;
	this.cmd.Prepared = true;

});

cmd.add('ins', function(key, type, len, value){
	try{
		//参数名、参数数据类型、参数类型、数据长度、参数值
		this.cmd.Parameters.Append(this.cmd.CreateParameter('@' + key, type, 1, len, value));
	}catch(e){
		console.log('<br />error ins:@' + key)
	}
	return this;
});

cmd.add('out', function(key, type, len){
	try{
		this.cmd.Parameters.Append(this.cmd.CreateParameter('@' + key, type, 2, len));
	}catch(e){
		console.log('<br />error out:@' + key);
	}
	return this;
});

cmd.add('ret', function(key, type){
	try{
		this.cmd.Parameters.Append(this.cmd.CreateParameter(key, type, 4));
	}catch(e){
		console.log('<br />error ret:@' + key);
	}
	return this;
});

cmd.add('exec', function(){
	try{
	this.cmd.Execute();
	}catch(e){
		console.log('<br />error exec:' + e.message);
	}
	return this;
});

cmd.add('get', function(key){
	return this.cmd('@' + key).value;
});

cmd.add('destory', function(){
	this.cmd = null;
});

//table, alters, param, orderby, _orderby, pagesize, pageindex, callback , up
// 表	   字段    条件	 正排序     反排序		每页数		当前页
var page = new Class(function(table, conn){
	this.sql = {};
	this.sql.table = table;
	this.sql.order = [];
	this.object = new ActiveXObject( 'ADODB.RECORDSET' );
	this.conn = conn;
	this.status = true;
});

page.add('size', function(i){
	this.sql.size = i;
	return this;
});

page.add('index', function(i){
	this.sql.index = i;
	if ( this.sql.index < 1 ){
		this.sql.index = 1;
	}
	return this;
})

page.add('select', function(){
	var arrays = Array.prototype.slice.call(arguments, 0);
	if ( arrays.length === 0 ){
		arrays = ['*'];
	}
	this.sql.selectors = arrays;
	return this;
});

page.add('where', function(where){
	this.sql.where = where;
	return this;
});

// asc省略为倒序
page.add('order', function( which, asc ){
	this.sql.order.push({
		which: which,
		ord: [
			asc ? 'asc' : 'desc',
			asc ? 'desc' : 'asc'
		]
	});
	
	return this;
});

page.add('gruntOrder', function(orders, name){
	var o = [];
	orders.forEach(function(z){
		o.push(name + '.' + z);
	});
	return o;
})

page.add('gruntSQL', function(){
	var total = this.conn.Execute(
		'SELECT COUNT(*) FROM ' + 
		this.sql.table + 
		( 
			this.sql.where && this.sql.where.length > 0 ? 
				' where ' + this.sql.where : 
				'' 
		)
	)(0).value;
	
	if ( total === 0 ){
		this.status = false;
		return this;
	}
	
	this.sql.total = total;
	this.sql.pageCount = Math.ceil(total / this.sql.size);
	
	if ( this.sql.index > this.sql.pageCount ){
		this.sql.index = this.sql.pageCount;
	}
	
	var where = this.sql.where && this.sql.where.length > 0 ? ' where ' + this.sql.where : '';
	var order_1 = [], order_2 = [];
	this.sql.order.forEach(function(o){
		order_1.push('[' + o.which + '] ' + o.ord[0]);
		order_2.push('[' + o.which + '] ' + o.ord[1]);
	});
	//console.log(total, '-', this.sql.pageCount, '-', this.sql.index + '<br />');
	if ( this.sql.index === 1 ){
		this.sql.text = "Select Top " + this.sql.size + ' ' + this.sql.selectors.join(',') + " From " + this.sql.table + where + ( order_1.length > 0 ? ' ORDER BY ' + order_1.join(',') : '' );
	}
	
	else if ( this.sql.index === this.sql.pageCount ){
		this.sql.text = "SELECT Top " + this.sql.size + " * FROM " +
			" (" +
			"SELECT TOP " + (  this.sql.total - this.sql.size * (this.sql.index - 1)   ) +
			" " + this.sql.selectors.join(',') +
			" FROM " + this.sql.table +
			where +
			( order_2.length > 0 ? ' ORDER BY ' + order_2.join(',') : '' ) +
			") AS Z " +
			( order_1.length > 0 ? ' ORDER BY ' + order_1.join(',') : '' );
	}
	
	else if ( this.sql.index < (this.sql.pageCount / 2 + this.sql.pageCount % 2) ){
		this.sql.text = "SELECT * FROM " +
			" ( " +
			" SELECT TOP " + this.sql.size + " * FROM " +
			" ( " +
			" SELECT TOP " + ( this.sql.size * this.sql.index ) +
			" " + this.sql.selectors.join(',') +
			" FROM " + this.sql.table +
			where +
			( order_1.length > 0 ? ' ORDER BY ' + order_1.join(',') : '' ) +
			" ) AS Z " +
			( order_2.length > 0 ? ' ORDER BY ' + order_2.join(',') : '' ) +
			" ) AS X " +
			( order_1.length > 0 ? ' ORDER BY ' + order_1.join(',') : '' );
	}
	
	else{
		this.sql.text = "SELECT TOP " + this.sql.size + " * FROM " +
			" ( "+
			" SELECT TOP " + (  (this.sql.total % this.sql.size) + this.sql.size * (this.sql.pageCount - this.sql.index)  ) +
			" " + this.sql.selectors.join(',') +
			" FROM " + this.sql.table +
			where +
			( order_2.length > 0 ? ' ORDER BY ' + order_2.join(',') : '' ) +
			" ) AS T " +
			( order_1.length > 0 ? ' ORDER BY ' + this.gruntOrder(order_1, 'T').join(', ') : '' );
	};
	//console.log(this.sql.text)
	return this;
});

page.add('open', function( mode ){
	this.sql.text = 'SELECT TOP 10 * FROM ( SELECT TOP 108 B.[age],B.[name],B.[mail],B.[hashkey],B.[salt] FROM [evio] AS B where B.age>50 ORDER BY B.[age] desc,B.[id] asc ) AS T ORDER BY T.[age] asc, T.[id] desc';
	console.log(this.sql.text)	
	this.gruntSQL().object.Open(this.sql.text, this.conn, 1, mode ? mode : 1);
	console.log('ok')
	return this;
});

page.add('exec', function(resolve, reject){
	if ( !this.object.Bof && !this.object.Eof ){
		typeof resolve === 'function' && resolve.call(this, this.object);
	}else{
		typeof reject === 'function' && reject.call(this, this.object);
	}
	
	return this;
});

page.add('each', function( callback ){
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

page.add('toJSON', function(){
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

page.add('close', function(){
	try{
		this.object.Close();
	}catch(e){}
	
	return this;
});

var connects = new connect('mssql', configs);
var sha1 = require('sha1');
if ( connects ){	
	var P = new page('evio', connects);
	
	P.size(10).index(40).select('age', 'name', 'mail', 'hashkey', 'salt').where('age>50').order('age', true).order('id').open().each(function(object){
		console.log(object(0).value, '<br />')
	}).close();

}else{
	exports.error = 404;
}

try{
	connects.Close();
}catch(e){}
