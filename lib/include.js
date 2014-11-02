var through = require('through2');
var path = require('path');
var mutils = require('mutils');


module.exports = function(bone) {
	return bone.wrapper('include', function() {
		var option = this.option;
		var info = this.info;
		
		if(info.type != 'file') {
			throw new Error('not support include for value.');
		}

		var toRender = buffer.toString();
		var fileDir = path.dirname(info.filePath);
		var includeReg = /<%=[\s\S]+?include\(['"]*(.*?)["']*?\)[\s\S]+?%>/g;
		var fileQuote = {};


		// 扫描一遍捕获所有include文件
		toRender.replace(includeReg, function(match, filename) {
			if(filename) {
				if(opt[filename]) {
					fileQuote[filename] = jt.fs.pathResolve(opt[filename], info.dir);
				} else {
					fileQuote[filename] = jt.fs.pathResolve(filename, fileDir);
				}
			}
		});

		var parallel = mutils.do();
		

		jt.utils.each(fileQuote, function(value, key) {
			parallel.do(function(done) {
				jt.fs.readFile(value, function(data) {
					fileQuote[key] = data.toString();
					done();
				});
			});
		});

		parallel.done(function() {
			var result = toRender.replace(includeReg, function(match, filename) {
				return fileQuote[filename] || '';
			});

			callback(null, result);
		});
	});
}