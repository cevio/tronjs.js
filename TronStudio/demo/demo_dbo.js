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

var connects = new connect('mssql', configs);
var sha1 = require('sha1');
if ( connects ){	
	var D = new dbo('evio', connects),
		cd = new cmd('P_viewPage', connects);
		
	cd
		.ins('TableName', 200, 200, 'evio')
		.ins('FieldList', 200, 2000, '*')
		.ins('PrimaryKey', 200, 100, 'id')
		.ins('Where', 200, 2000, 'id>10')
		.ins('Order', 200, 1000, 'age asc, id asc')
		.ins('SortType', 3, 1, 3)
		.ins('PageSize', 3, 100)
		.ins('PageIndex', 3, 100)
		.out('TotalCount', 3, 100)
		.out('TotalPageCount', 3, 100)
		.ret('@RecorderCount', 3)
		.exec();
	
	console.log(cd.get('RecorderCount'));
	cd.destory();
	console.log('全部处理完毕')
}else{
	exports.error = 404;
}

try{
	connects.Close();
}catch(e){}
