<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
modules.debug = true;
var THREAD = require('thread');
var url = 'http://app.webkits.cn/private/version/download/PJBlog5.installer.v1.zip';
var file = contrast('test.zip');
new THREAD(url, file, {
	onprocess: function(){
		//console.log('<p>start: ' + this.start + ', ' + this.length + '</p>');
		//Response.Flush();
	},
	refresh: true,
	maxTime: 1000 * 5
});
console.log('ok')
%>