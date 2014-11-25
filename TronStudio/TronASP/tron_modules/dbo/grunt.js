// JavaScript Document
var saveto = 'dist/dbo.js';

var files = [
	'src/connect.js',
	'src/dbo.js'
];

var codeWrap = '';
files.forEach(function( file ){ codeWrap += fs(resolve(file)).exist().read().value() + '\n'; });
fs(resolve(saveto)).create(codeWrap).then(function(){ 
	console.log('package ' + resolve(saveto) + ': success!'); 
}).fail(function(){
	console.log('package ' + resolve(saveto) + ': error!');  
});