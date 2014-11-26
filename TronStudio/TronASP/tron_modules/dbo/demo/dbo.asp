<!--#include file="../../../dist/tron.min.asp" -->
<%
	modules.debug 	= true;
var dboModule 		= require('../index');
var connect 		= dboModule.connect;
var dbo			 	= dboModule.dbo;

var conn = new connect('mssql', {"netserver":".","access":"blog","username":"evio","password":"1094872"});
if ( conn ){	
	var rec = new dbo('blog_members', conn);
	rec
		.top(10)
		.select('id', 'member_nick', 'member_sex')
		.and('member_forbit', 0)
		.and('member_sex', 0)
		.open()
		.each(function(object){
			console.log(object(1).value)
		})
		.close();

}else{
	console.log('连接数据库失败');
};
try{
	conn.Close();
}catch(e){}
%>