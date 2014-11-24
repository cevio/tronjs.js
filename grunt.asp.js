// JavaScript Document
;(function( fso ){
	var fs = new fso();
	
	var saveto = './tron.asp';
	
	var files = [
		'./tronasp2/header.asp',
		'./tronasp2/vbsupport.asp',
		'./tronasp2/set.asp',
		'./src2/contributors.js',
		'./tronasp2/install.js',
		'./tronasp2/class.js',
		'./tronasp2/module.js',
		'./tronasp2/date.js',
		'./tronasp2/task.js',
		'./tronasp2/fso.js',
		'./tronasp2/require.js',
		'./src2/json2.js',
		'./tronasp2/footer.asp'
	];
	
	var codeWrap = '';
	
	for ( var i = 0 ; i < files.length ; i++ ){
		if ( fs.exist(resolve(files[i])) ){
			codeWrap += Library.loader(contrast(files[i])) + '\n';
		}
	}
	
	fs.saveFile(resolve(saveto), codeWrap);
	
	Library.log('生成文件成功:' + contrast(saveto));
	 
})( require("./TronASP/tron.fso") );