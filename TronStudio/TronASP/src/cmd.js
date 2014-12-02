// Command Factory.
/*
 * 调用方法实例：
var c = new cmd('P_viewPage', connects);
var z = c
		.addInputVarchar('@TableName', 'evio')
		.addInputVarchar('@FieldList', '*')
		.addInputVarchar('@PrimaryKey', 'id')
		.addInputVarchar('@Where', 'id>10')
		.addInputVarchar('@Order', 'id asc')
		.addInputInt('@SortType', 1)
		.addInputInt('@RecorderCount', 0)
		.addInputInt('@PageSize', 10)
		.addInputInt('@PageIndex', 2)
		.addOutputInt('@TotalCount')
		.addOutputInt('@TotalPageCount')
		.exec().toJSON();
		
console.log(c.get('@TotalCount'))
console.json(z);
*/;(function(){
	cmd = new Class(function( CommandName, conn ){
		this.command = CommandName;
		this.conn = conn;
		this.object = new ActiveXObject("Adodb.Command");
		this.object.ActiveConnection = this.conn;
		this.object.CommandType = cmd.CommandType.STOREDPROC;
		this.object.Prepared = true;
		this.params = {};
		this.rcd = null;
		this.geted = false;
	});
	
	// 方法
	cmd.add('addParm', function( name, value, direction ){
		this.parms_[name] = this.object.CreateParameter(name);
		this.parms_[name].Value = value || null;
		this.parms_[name].Direction = direction || 1;
		return this;
	});
	
	cmd.add('addInput', function( name, value, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.INPUT, size, value);
		return this;
	});
	
	cmd.add('addInputInt', function( name, value ){
		this.addInput(name, value, cmd.DataType.DBTYPE_I4, 4);
		return this;
	});
	
	cmd.add('addInputBigInt', function( name, value ){
		this.addInput(name, value, cmd.DataType.DBTYPE_I8, 8);
		return this;
	});
	
	cmd.add('addInputVarchar', function( name, value, size ){
		this.addInput(name, value, cmd.DataType.VARCHAR, size||50);
		return this;
	});
	
	cmd.add('addOutput', function( name, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.OUTPUT, size);
		return this;
	});
	
	cmd.add('addOutputInt', function( name ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.DBTYPE_I4, cmd.ParameterDirection.OUTPUT, 4);
		return this;
	});
	
	cmd.add('addOutputBigInt', function( name ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.DBTYPE_I8, cmd.ParameterDirection.OUTPUT, 8);
		return this;
	});
	
	cmd.add('addOutputVarchar', function( name, size ){
		this.params[name] = this.object.CreateParameter(name, cmd.DataType.VARCHAR, cmd.ParameterDirection.OUTPUT, size||50);
		return this;
	});
	
	cmd.add('addReturn', function( name, t, size ){
		this.params[name] = this.object.CreateParameter(name, t, cmd.ParameterDirection.RETURNVALUE, size);
		return this;
	});
	
	cmd.add('exec', function(){
		this.object.CommandText = this.command;
		
		for( var i in this.params ){
			if( !this.params.hasOwnProperty(i) ) continue;
			this.object.Parameters.Append( this.params[i] );
		}
		
		this.rcd = this.object.execute();
		return this;
	});
	
	cmd.add('Promise', function(resolve, reject){
		if ( this.rcd && !this.rcd.Bof && !this.rcd.Eof ){
			typeof resolve === 'function' && resolve.call(this, this.rcd);
		}else{
			typeof reject === 'function' && reject.call(this, this.rcd);
		}
		
		return this;
	});
	
	cmd.add('each', function( callback ){
		return this.Promise(function(object){
			var i = 0;
		
			while ( !object.Eof )
			{
				typeof callback === "function" && callback.call(this, object, i);
				object.MoveNext();
				i++;
			}
		});
	});
	
	cmd.add('toJSON', function(){
		var keep = [];
		this.each(function(object){
			var json = {};
			for ( var i = 0; i < object.fields.count ; i++ ) {
				json[object.fields(i).name] = object.fields(i).value;
			}
			keep.push(json);
		}).close();
		
		return keep;
	});
	
	cmd.add('close', function(){
		try{
			this.rcd.Close();
		}catch(e){}
		
		return this;
	});
	
	cmd.add('get', function(name){
		if ( !this.geted ){
			for ( var i in this.params ){
				if( !this.params.hasOwnProperty(i) ) continue;
				if( this.params[i].Direction > 1 ){
					this.params[i].value = this.object(i).value;
				}
			}
			this.geted = true;
		}
		if( !this.params.hasOwnProperty(name) ) return null;
		return this.params[name];
	});
	
	// 类型
	cmd.ParameterDirection = { INPUT:1,INPUTOUTPUT:3,OUTPUT:2,RETURNVALUE:4 };
	cmd.DataType = {
		ARRAY:0x2000,DBTYPE_I8:20,DBTYPE_BYTES:128,DBTYPE_BOOL:11,DBTYPE_BSTR:8,DBTYPE_HCHAPTER:136,DBTYPE_STR:129,DBTYPE_CY:6,DBTYPE_DATE:7,DBTYPE_DBDATE:133,
		DBTYPE_DBTIME:134,DBTYPE_DBTIMESTAMP:135,DBTYPE_DECIMAL:14,DBTYPE_R8:5,DBTYPE_EMPTY:0,DBTYPE_ERROR:10,DBTYPE_FILETIME:64,DBTYPE_GUID:72,DBTYPE_IDISPATCH:9,
		DBTYPE_I4:3,DBTYPE_IUNKNOWN:13,LONGVARBINARY:205,LONGVARCHAR:201,LONGVARWCHAR:203,DBTYPE_NUMERIC:131,DBTYPE_PROP_VARIANT:138,DBTYPE_R4:4,DBTYPE_I2:2,DBTYPE_I1:16,
		DBTYPE_UI8:21,DBTYPE_UI4:19,DBTYPE_UI2:18,DBTYPE_UI1:17,DBTYPE_UDT:132,VARBINARY:204,VARCHAR:200,DBTYPE_VARIANT:12,VARNUMERIC:139,VARWCHAR:202,DBTYPE_WSTR:130
	};
	cmd.CommandType = {
		UNSPECIFIED:-1,TEXT:1,TABLE:2,STOREDPROC:4,UNKNOWN:8,FILE:256,TABLEDIRECT:512
	};
	
})();