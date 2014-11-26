<!--#include file="../../../dist/tron.asp" -->
<%
	modules.debug 	= true;
	modules.setBase('TronStudio/TronASP');
var dboModule 		= require('dbo');
var connect 		= dboModule.connect;
var dbo			 	= dboModule.dbo;

var conn = new connect('mssql', {"netserver":".","access":"blog","username":"evio","password":"1094872"});
if ( conn ){	
	console.log('0', '<br />')
	var rec = new dbo('blog_members', conn);
	console.log('1', '<br />')
	rec.top(10)
	console.log('2', '<br />')
	rec.select('id', 'member_nick', 'member_sex')
	console.log('3', '<br />')
	rec.and('member_forbit', 0)
	console.log('4', '<br />')
	rec.and('member_sex', 0)
	console.log('5', '<br />')
	rec.open()
	console.log('6', '<br />')
	rec.each(function(object){
			console.log(object(1).value)
		})
	console.log('7', '<br />')
	rec.close();
	console.log('8', '<br />')

/*	var sql = new dboModule.sql();
		sql.resetSQL();
		
	sql
		.table('mems')
		.top(10)
		.select('a', 'b')
		.and('a', 1, '>')
		.and('c', [1,2,3], 'in')
		.or('b', 2, '<')
		.ands(function(){
			this.and('t', 1).or('s', 2).ands(function(){
				this.and('k', 67).or('o', 4, '<').ors(function(){
					this.and('u', 1).or('j', 6)
				}).table('pppp').select('h', 'j')
			}).table('tstable').selectAll();
		})
		.ors(function(){
			this.and('p', 3).or('z', 8)
		})
		.asc('a')
		.desc('b')
		.gruntSQL();
	
	console.log(sql.sql.text);*/
		

}else{
	console.log('连接数据库失败');
};
try{
	conn.Close();
}catch(e){}
%>