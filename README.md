Scripts Loader for javascript/asp.
=========

## TranJS | TronASP  TronStudio

基于IIS的前后端jscript框架。用户敏捷开发和快速开发。能与NODEJS并行开发，语法基本一致。

tronasp遵循COMMONJS规范， tronjs遵循AMD规范。

TronJS能加载几乎99.99%的国际AMD规范插件和框架。TronASP同样能加载遵循规范的插件。能在前后端保持一致性。


### TronJS : Get Start
我们首先引入前端的tronjs框架

    http://tron.webkits.cn/tron.min.js


然后我们再引入框架的配置文件，如果需要自己配置的，可以引用自己的配置文件

    http://tron.webkits.cn/tron.maps.js
    

### Tronjs ：How to use require

基本使用：

```javascript
    require('jquery').then(function(jQuery){
        if ( !window.jQuery ){
            window.$ = window.jQuery = jQuer[0];
        }
    });
```
    
不过你也可以这样写：

```javascript
    require('jquery', function(jQuery){
        if ( !window.jQuery ){
            window.$ = window.jQuery = jQuery;
        }
    });
```

我们的每个require返回的都是一个[Promise][1]对象。

不过比较特殊的情况是我们在页面上定义了script标签，也指向了地址，你同样可以用来require这个模块，同时不会重复加载。

```html
    <script src='jquery.1.9.js'></script>
    <script>
        require('jquery', function(){
            alert('load ok');
        });
    </script>
```

### Tronjs : how to define a module

我们采用以下的模式来定义模块

```javascript
    (function (mod) {
        if (typeof exports == "object" || typeof exports === 'function' && typeof module == "object") {
            module.exports = mod();
        }
        else if (typeof define == "function" && define.amd) {
            return define(['jquery'], mod);
        }
        else {
            window.md5 = mod(jQuery);
        }
    })(function ( $ ) {
        // your code here.
    });
```
    
**define(id, deps, factory, async);**

    // id: 模块自定义路径名
    // deps: 依赖关系数组
    // factory: 模块主体函数或者对象
    // async: 该模块下是否使用依赖关系的串行加载

  [1]: https://github.com/jakearchibald/es6-promise        "Promise"