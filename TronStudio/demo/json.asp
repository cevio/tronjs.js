<!--#include file="../TronASP/dist/tron.min.asp" -->
<!--#include file="../TronASP/dist/vb_upload_support.asp" -->
<%
modules.setBase("TronStudio");

var data = {good: "asdf", id: 3, asdf: true, adj: {a: "a", b: ["a", 1, 3]}};

fs(contrast("out.json")).create(JSON.format(data));

var json = require("out.json");
console.log(json.adj.a);

modules.debug = true;
console.debug(data);
%>