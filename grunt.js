// JavaScript Document
;(function( fso ){
	var fs = new fso();
	
	var saveto = './tron.js';
	
	var files = [
		'./src/contributors',
		'./src/class',
		'./src/es6-promise',
		'./src/module',
		'./src/define',
		'./src/requires',
		'./src/json2'
	];
	
	var codeWrap = '';
	
	for ( var i = 0 ; i < files.length ; i++ ){
		if ( fs.exist(resolve(files[i])) ){
			codeWrap += Library.loader(resolve(files[i])) + '\n';
		}
	}
	
	fs.saveFile(resolve(saveto), codeWrap);
	
	Library.log('生成文件成功:' + resolve(saveto));
	 
})( require("./TronASP/tron.fso") );