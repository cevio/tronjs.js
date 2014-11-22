// JavaScript Document
;(function( fso ){
	var fs = new fso();
	
	var saveto = './tron.js';
	
	var files = [
		'./src2/contributors',
		'./src2/class',
		'./src2/es6-promise',
		'./src2/module.header',
		'./src2/module.core',
		'./src2/module.fns',
		'./src2/module.define',
		'./src2/module.require',
		'./src2/module.compile',
		'./src2/module.footer',
		'./src2/json2'
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