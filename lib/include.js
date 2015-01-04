'use strict';
var path = require('path');
var bone = require('bone');
var akostream = require('AKOStream');

module.exports = bone.wrapper(function(buffer, encoding, callback) {
	var ext = path.extname(this.source);
	var dir = path.dirname(this.source);
	var toRender = buffer.toString();

	var includeReg = {
		'.html': /<include\s+file=['"]{1}([^\'\"]+)['"]{1}\s*\/?>/g,
		'.js': /\/\*\*?\s+?include\(['"]*(.*?)["']*?\)\s+?\*\//g,
		'.css': /\/\*[\s\S]+?include\(['"]*(.*?)["']*?\)[\s\S]+?\*\//g,
		'.less': /\/\*[\s\S]+?include\(['"]*(.*?)["']*?\)[\s\S]+?\*\//g
	};

	if(!(ext in includeReg)) {
		// warn
		console.log('not support type: '+ext);
		return callback(null, buffer);
	}
	if(!includeReg[ext].test(toRender)) {
		return callback(null, buffer);
	}

	var includeFiles = [];
	// 扫描一遍捕获所有include文件
	toRender.replace(includeReg[ext], function(match, filename) {
		if(filename) {
			includeFiles.push({
				filename: filename, 
				path: bone.fs.pathResolve(filename, dir)
			});
		}
	});

	var done = function() {
		var check = true;
		for(var i in finalFile) {
			if(finalFile.hasOwnProperty(i)) {			
				if(finalFile[i] == null) {
					check = false;
				}
			}	
		}

		if(!check) return;

		var result = toRender.replace(includeReg[ext], function(match, filename) {
			return finalFile[filename] || '';
		});

		callback(null, result);
	};

	var finalFile = {};

	includeFiles.forEach(function(it) {
		finalFile[it.filename] = null;
		var chunk;
		var stream = bone.fs.createReadStream(it.path);
		akostream.aggre(stream).on('data', function(buffer) {
			chunk = buffer.toString();
		}).on('end', function() {
			finalFile[it.filename] = chunk || '';
			done();
		});
	});
});