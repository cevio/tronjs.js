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

var connects = new connect('mssql', configs);
var sha1 = require('sha1');
if ( connects ){
	
	var D = new dbo('evio', connects);
//	
//	for ( var i = 0 ; i < 1000 ; i++ ){
//		console.log('正在处理第' + (i + 1) + '条 <br />');
//		Response.Flush();
//		
//		D
//		.create()
//		.set({
//			name: randoms(10),
//			mail: randoms(6) + '@qq.com',
//			hashkey: sha1(randoms(10)),
//			salt: randoms(6),
//			age: Math.floor(Math.random() * 100),
//			isforbit: Math.random()*10 > 5 ? 1:0 
//		})
//		.save()
//		.close();
//	}
//	

	D.top(20).select('name', 'mail', 'hashkey').and('age', 50, '>').and('isforbit', '0').find(function(){
		this.each(function(object){
			console.log(object(1).value + '<br />');
		})
	}).close();
	
	console.log('全部处理完毕')
}else{
	exports.error = 404;
}

try{
	connects.Close();
}catch(e){}
