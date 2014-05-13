tronjs.js
=========

#####Tron.jsA Script Loader

Class

javascript自封装类对象，用于创建类库的方法。
参数： object [ json ] # ( 一些初始定义的JSON变量 )
方法：extend { 用于继承创建的类的方法 }

参数：mark [ string | json ] # ( 当变量为string类型的时候，指定方法名称；当变量为json类型的时候，指定方法集合。 )
参数：func [ function | undefined ] # ( 具体方法内容。 )
实例

// 建立一个students类，初始参数为age:20
var students = new Class({
	age: 20
});
// 继承这个类，设置初始运行方法initialize为类扩展一个name属性
students.extend('initialize', function(name){
	this.name = name;
});
// 继承这个类，设置调用方法message
students.extend('message', function(){
	return this.name + ' is ' + this.age;
});
// 实例化这个类为eachMan。并传入初始化变量
var eachMan = new students('steven');
// 运行这个类的message方法
console.log(eachMan.message()); // out put : 'steven is 20'
define

每个模块定义的方法。
参数： deps [ string | array | undefined ] # ( 一些依赖关系的集合，如果只有一个，直接以字符串形式存在。如果这个变量是个function类型，直接复制给第二个变量。 )
参数： factory [ function ] # ( 具体模块内容。有3个参数如下： )
参数：require [ function ] # ( 用于引用其他的依赖关系 )
参数：exports [ object | json ] # ( 该模块对外提供接口 )
参数：module [ object | json ] # ( 模块所有信息包涵体 )
实例

// 第一种方式 直接写入function并用exports来输出接口
define(function( require, exports, module ){
    exports.A = 1;
});
// 第二种方式 直接写入function用return来输出接口
define(function( require, exports, module ){
    return 1;
});
// 第三种方式 写入一个依赖关系后(不使用require)输出
define('./a/b', function( require, exports, module ){
	exports.A = 1;
});
// 第四种方式 写入一个依赖关系后(使用require)输出
define(function( require, exports, module ){
	var o = require('./a/b');
	exports.A = o;
});
// 第五种方式 写入一个依赖关系集合（不使用require）输出
define(['./a/b', '../c/d'], function( require, exports, module ){
	exports.A = 1;
});
// 第六种方式 写入一个依赖关系集合（使用require）输出
define(function( require, exports, module ){
	var A = require('./a/b'),
    	B = require('../c/d');
        
	exports.A = {
    	a: A,
        b: B
    };
});

// 这里可以用到Class来完善输出
defind(function( require, exports, module ){
	var A = new Class({
    	a: 1,
        b: 2
    });
    
    A.extend('c', function(){ return this.a + this.b; });
    
    exports.proxy = A; // 或者直接 return A;
});
require

外部和内部的依赖模块加载方法(采用CMD方式加载模块)
参数： deps [ string | array ] # ( 一些依赖关系的集合，如果只有一个，直接以字符串形式存在。 )
参数： callback [ function ] # ( 依赖关系全部加载完毕后才执行的方法，他有几个参数，取决于有多少个依赖关系，按照依赖关系顺序返回参数序列对象。 )
实例

// 这里的模块['./a', './b', './c']，分别对应function中的A B C变量
require(['./a', './b', './c'], function(A, B, C){ 
	var a = new A(),
    	b = new B(),
        c = new C();
     
     a.init();
     b.init();
     c.init();
});
