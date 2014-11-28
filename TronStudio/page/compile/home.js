var test = new Class(function( req ){
	var a = this.a;

	return {a: a};
});

test.add('a', 'test evio');

module.exports = test;
