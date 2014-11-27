<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
modules.debug = true;

var package = require('package');
var packageModule = new package();
//packageModule.doPack(contrast('../tron_modules'), contrast('./pack.pbd'));
packageModule.unPack(contrast('./pack.pbd'), contrast('./sss'));
console.log('ok')
%>