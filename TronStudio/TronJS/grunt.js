// JavaScript Document
var saveto = 'dist/tron.js';

var files = [
	'src/contributors',
	'src/class',
	'src/es6-promise',
	'src/module.header',
	'src/module.core',
	'src/module.fns',
	'src/module.define',
	'src/module.require',
	'src/module.dependencies',
	'src/module.compile',
	'src/module.footer',
	'src/json2'
];

var codeWrap = '';
files.forEach(function( file ){ codeWrap += fs(resolve(file)).exist().read().value(); });
fs(resolve(saveto)).create(codeWrap).then(function(){ 
	console.log('package ' + resolve(saveto) + ': success!'); 
}).fail(function(){
	console.log('package ' + resolve(saveto) + ': error!');  
});