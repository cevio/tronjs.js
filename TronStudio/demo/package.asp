<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
var package = require('package');
console.log(new package().a);
%>