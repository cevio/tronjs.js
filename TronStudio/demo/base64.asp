<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
modules.debug = true;

var base64 = require('base64');
console.log(base64.encode(contrast("package.asp")));
%>