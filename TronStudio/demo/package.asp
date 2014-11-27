<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
modules.debug = true;

var package = require('package');
var packageModule = new package();
var pack = new packageModule.doPack(contrast('../tron_modules'), 'pack.pbd');
console.log('ok')
%>