# bone-include
> bone的合并文件处理器

### 安装及使用

通过npm安装

```sh
$ npm install bone-include 
```

安装后在`bonefile.js`文件内通过`act()`加载

```js
var bone = require('bone');
var include = require('bone-include');

bone.dest('dist')
	.src('~/src/main.js')
	.act(include);
```

### 说明 

支持html、css和js文件中include其他文件，处理器执行后include的文件会合并成一个文件

html调用方式

```html
<script type="text/javascript">
	<include file="./jquery.js">
</script>
```

js调用方式
```js
/**
 include('./lib/jquery.js')
 */
```

css调用方式
```css
/**
 include('./lib/jquery.js')
 */
```

### 其他

处理器开发以及使用请参考[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)