'use strict';
var path = require('path');
var bone = require('bone');

module.exports = bone.wrapper(function(buffer, encoding, callback) {
	var info = this.info;
	var toRender = buffer.toString();
	var fileDir = path.dirname(info.filePath);
	var includeReg = /<include\s+name=(\'([^\'\"]+)\'|\"([^\'\"]+)\")\s*\/?>/g;
	//var includeReg = /<%=[\s\S]+?include\(['"]*(.*?)["']*?\)[\s\S]+?%>/g;
	var fileQuote = {};

	// 扫描一遍捕获所有include文件
	toRender.replace(includeReg, function(match, filename) {
		if(filename) {
			fileQuote[filename] = jt.fs.pathResolve(filename, fileDir);
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
}