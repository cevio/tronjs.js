<!--#include file="../TronASP/dist/tron.asp" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>无标题文档</title>
<script src="http://tron.webkits.cn/tron.min.js"></script>
</head>
<body>
<%
;(function(){
	modules.setBase('TronStudio');
	var file = require('demo_dbo');
	
	var pages = require('iPage');
	var p = new pages(100, 35, 20);
	console.log('<br />');
	console.json(p.toArray());
	console.log('<br />');
	console.json(p.value);
})();
%>
<script>
require('../tron_modules/iPage/index', function(page){
	var p = new page(100, 35, 20);
	console.log( p.toArray() );
	console.log( p.value );
});
</script>
</body>
</html>