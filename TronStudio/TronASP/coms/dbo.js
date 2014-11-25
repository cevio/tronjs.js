var AC = 'ADODB.CONNECTION';
var AR = 'ADODB.RECORDSET';

/*
 * 数据库连接类
 * 返回数据库连接对象
 */
var connect = new Class(function( type, options ){
	this.object = new ActiveXObject( AC );
	
	if ( type === 'access' ){ this.Access(options); }
	else if ( type === 'mssql' ){ this.MsSql(options); }
	
	return this.object;
});

connect.add('Access', function( AccessPath ){
	var connections = [
		'provider=Microsoft.jet.oledb.4.0;data source=' + AccessPath,
		'driver={microsoft access driver (*.mdb)};dbq=' + AccessPath
	];
	
	for ( var i = 0 ; i < connections.length; i++ ){
		try{
			this.object.Open(connections[i]);
			break;
		}catch(e){}
	};
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
	
	for ( var i = 0 ; i < connections.length; i++ ){
		try{
			this.object.Open(connections[i]);
			break;
		}catch(e){}
	};
});