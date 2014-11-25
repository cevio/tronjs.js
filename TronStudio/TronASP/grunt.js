﻿var saveto = 'dist/tron.asp';

var files = [
	'src/header.asp',
	'src/vbsupport.asp',
	'src/set.asp',
	'src/contributors.js',
	'src/install.js',
	'src/class.js',
	'src/module.js',
	'src/date.js',
	'src/task.js',
	'src/fso.js',
	'src/require.js',
	'src/json2.js',
	'src/footer.asp'
];
	
var codeWrap = '';
files.forEach(function( file ){ codeWrap += fs(resolve(file)).exist().read().value(); });
fs(resolve(saveto)).create(codeWrap).then(function(){ 
	console.log('package ' + resolve(saveto) + ': success!'); 
}).fail(function(){
	console.log('package ' + resolve(saveto) + ': error!');  
});