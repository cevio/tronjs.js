<!--#include file="../TronASP/dist/tron.asp" -->
<%
modules.setBase('TronStudio');
var package = require('package');
var packageModule = new package();
var pack = new packageModule.pack(contrast('../tron_modules'), 'pack.pbd');
console.log('ok')
%>