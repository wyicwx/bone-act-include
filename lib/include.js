'use strict';
var path = require('path');
var bone = require('bone');
var akostream = require('AKOStream');

module.exports = bone.wrapper(function(buffer, encoding, callback) {
	var ext = path.extname(this.source);
	var dir = path.dirname(this.source);
	var toRender = buffer.toString();

	var includeReg = {
		'.html': /<include\s+file=(\'([^\'\"]+)\'|\"([^\'\"]+)\")\s*\/?>/g,
		'.js': /\/\*\*?\s+?include\(['"]*(.*?)["']*?\)\s+?\*\//g,
		'.css': /\/\*[\s\S]+?include\(['"]*(.*?)["']*?\)[\s\S]+?\*\//g
	};

	if(!(ext in includeReg)) {
		// warn
		console.log('not support type: '+ext);
		return callback(null, buffer);
	}

	var includeFiles = {};
	// 扫描一遍捕获所有include文件
	toRender.replace(includeReg[ext], function(match, filename) {
		if(filename) {
			includeFiles[filename] = bone.fs.pathResolve(filename, dir);
		}
	});

	var finalFile = {};

	for(var i in includeFiles) {
		finalFile[i] = null;
		var stream = bone.createReadStream(includeFiles[i]);

		akostream.aggre(stream).on('data', (function(index) {
			return function(buffer, encoding) {
				finalFile[index] = buffer.toString(encoding);
				done();
			};
		})(i));
	}

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
});