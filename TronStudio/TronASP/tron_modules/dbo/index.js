if ( modules.debug ){
	exports.connect = require('src/connect.js');
	exports.dbo = require('src/dbo.js');
}else{
	module.exports = require('dist/dbo.min.js');
}