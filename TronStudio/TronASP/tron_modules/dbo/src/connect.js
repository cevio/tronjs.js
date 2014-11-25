var AC = 'ADODB.CONNECTION';

/*
 * 数据库连接类
 * 返回数据库连接对象
 */
var connect = new Class(function( type, options ){
	this.object = new ActiveXObject( AC );
	this.connectString = [];
	
	if ( type === 'access' ){ this.Access(options); }
	else if ( type === 'mssql' ){ this.MsSql(options); }
	
	for ( var i = 0 ; i < this.connectString.length; i++ ){
		try{
			this.object.Open(this.connectString[i]);
			break;
		}catch(e){}
	};
	
	return this.object;
});

connect.add('Access', function( AccessPath ){
	this.connectString = [
		'provider=Microsoft.jet.oledb.4.0;data source=' + AccessPath,
		'driver={microsoft access driver (*.mdb)};dbq=' + AccessPath
	];
});

connect.add('MsSql', function( settings ){
	var connections = [];
	
	connections.push([
		"Provider=sqloledb",
		"Data Source=" + 		settings.netserver,
		"Initial Catalog=" + 	settings.access,
		"User Id=" + 			settings.username,
		"Password=" + 			settings.password,
		""
	].join(";"));
	
	connections.push([
		"Driver={SQL Server}",
		"Server=" + 			settings.netserver,
		"Database=" + 			settings.access,
		"Uid=" + 				settings.username,
		"Pwd=" + 				settings.password,
		""
	].join(";"));
	
	this.connectString = connections;
});

module.exports = connect;