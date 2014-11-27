<!--#include file="../TronASP/dist/tron.min.asp" -->
<!--#include file="../TronASP/dist/vb_upload_support.asp" -->
<%
modules.setBase("TronStudio");

var m = http.query("m") || "";

if ( m === "upload" ){
	var uploads = require("upload");
	var upload = new uploads({
		folder: contrast("uploads"),
		success: function(){
			console.log("上传完毕")
		},
		size: 10000000000000
	});
	upload.httpload(function(){
	console.log("上传完毕")
	});
}else{
%>
<form action="?m=upload" method="post" enctype="multipart/form-data">
<input type="file" name="file" value="" />

<input type="submit" value="submit" />
</form>
<%
}
%>