<!--#include file="tron.asp" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>无标题文档</title>
</head>

<body>
<%
	fs('E:\\code\\tronjs.js\\tronasp2\\header2.asp')
	.unExist()
	.autoCreate('123')
	.then(function(){
		console.log('ok')
		console.log(this.value())
	})
	.fail(function(){
		console.log('no')
	})
	.stop();
%>
</body>
</html>