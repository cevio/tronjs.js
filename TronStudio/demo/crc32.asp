<!--#include file="../TronASP/dist/tron.min.asp" -->
<!--#include file="../TronASP/dist/vb_upload_support.asp" -->
<%
modules.setBase("TronStudio");
var crc32 = require('crc32');

var crc = new crc32();
var values = crc.compile(contrast('../tron_modules'), function(path){
	var local = contrast('../tron_modules');
	return path.replace(local, '').replace(/^\\/, '').replace(/\\/, '/');
});
console.log(JSON(values))
%>